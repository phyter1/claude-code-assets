# TanStack Router Documentation

## Overview
TanStack Router is a fully type-safe router for React with built-in caching, first-class search-param APIs, and isomorphic rendering support.

## Installation
```bash
bun add @tanstack/react-router
bun add -d @tanstack/router-vite-plugin @tanstack/router-devtools
```

## Setup with Vite

### vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'

export default defineConfig({
  plugins: [
    react(),
    TanStackRouterVite(),
  ],
})
```

## File-Based Routing Structure
```
src/
├── routes/
│   ├── __root.tsx           # Root layout
│   ├── index.tsx            # / route
│   ├── about.tsx            # /about route
│   ├── commands/
│   │   ├── index.tsx        # /commands route
│   │   ├── $sessionId.tsx   # /commands/:sessionId route
│   │   └── new.tsx          # /commands/new route
│   └── _authenticated/      # Route group (no URL segment)
│       ├── dashboard.tsx    # /dashboard route
│       └── settings.tsx     # /settings route
├── routeTree.gen.ts         # Generated route tree
└── main.tsx
```

## Core Concepts

### 1. Root Route (__root.tsx)
```typescript
import { createRootRoute, Outlet, Link } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="flex gap-2 p-2">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>
        <Link to="/commands" className="[&.active]:font-bold">
          Commands
        </Link>
        <Link to="/dashboard" className="[&.active]:font-bold">
          Dashboard
        </Link>
      </div>
      <hr />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})
```

### 2. Route Definition with Type Safety
```typescript
// routes/commands/$sessionId.tsx
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

// Define search params schema
const commandSearchSchema = z.object({
  filter: z.string().optional(),
  page: z.number().default(1),
})

export const Route = createFileRoute('/commands/$sessionId')({
  // Parse and validate params
  parseParams: (params) => ({
    sessionId: z.string().parse(params.sessionId),
  }),
  
  // Parse and validate search params
  validateSearch: commandSearchSchema,
  
  // Load data before rendering
  loader: async ({ params, context }) => {
    const session = await context.api.getSession(params.sessionId)
    if (!session) {
      throw new Error('Session not found')
    }
    return session
  },
  
  // Component
  component: SessionPage,
  
  // Error boundary
  errorComponent: ({ error }) => <div>Error: {error.message}</div>,
  
  // Pending component while loading
  pendingComponent: () => <div>Loading session...</div>,
})

function SessionPage() {
  const { sessionId } = Route.useParams()
  const { filter, page } = Route.useSearch()
  const session = Route.useLoaderData()
  
  return (
    <div>
      <h1>Session: {sessionId}</h1>
      <p>Filter: {filter}</p>
      <p>Page: {page}</p>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  )
}
```

### 3. Router Setup (main.tsx)
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create router instance
const router = createRouter({
  routeTree,
  context: {
    // Add context that all routes can access
    api: apiClient,
    auth: authService,
  },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
```

## Navigation

### Programmatic Navigation
```typescript
import { useNavigate } from '@tanstack/react-router'

function CommandList() {
  const navigate = useNavigate()
  
  const handleNewCommand = async () => {
    const sessionId = await createSession()
    
    // Type-safe navigation
    await navigate({
      to: '/commands/$sessionId',
      params: { sessionId },
      search: { filter: 'active' },
    })
  }
  
  return <button onClick={handleNewCommand}>New Command</button>
}
```

### Link Component
```typescript
import { Link } from '@tanstack/react-router'

function Navigation() {
  return (
    <nav>
      <Link 
        to="/commands/$sessionId"
        params={{ sessionId: '123' }}
        search={{ filter: 'active', page: 1 }}
        className="[&.active]:font-bold"
      >
        View Session
      </Link>
      
      {/* Preserve current search params */}
      <Link 
        to="/commands"
        search={(prev) => ({ ...prev, page: 1 })}
      >
        Commands
      </Link>
    </nav>
  )
}
```

## Advanced Features

### 1. Route Context
```typescript
// Create context type
interface RouterContext {
  api: ApiClient
  auth: AuthService
}

// routes/dashboard.tsx
export const Route = createFileRoute('/dashboard')({
  beforeLoad: async ({ context }) => {
    // Access context in beforeLoad
    const user = await context.auth.getUser()
    if (!user) {
      throw redirect({
        to: '/login',
        search: { redirect: '/dashboard' },
      })
    }
    return { user }
  },
  component: Dashboard,
})
```

### 2. Search Params Management
```typescript
export const Route = createFileRoute('/commands')({
  validateSearch: z.object({
    filter: z.enum(['all', 'active', 'completed']).default('all'),
    sortBy: z.enum(['date', 'name']).default('date'),
    page: z.number().default(1),
  }),
  
  component: Commands,
})

function Commands() {
  const navigate = useNavigate({ from: Route.fullPath })
  const { filter, sortBy, page } = Route.useSearch()
  
  const updateFilter = (newFilter: string) => {
    navigate({
      search: (prev) => ({ ...prev, filter: newFilter, page: 1 }),
    })
  }
  
  return (
    <div>
      <select 
        value={filter} 
        onChange={(e) => updateFilter(e.target.value)}
      >
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
      </select>
    </div>
  )
}
```

### 3. Data Loading Patterns
```typescript
// Parallel data loading
export const Route = createFileRoute('/dashboard')({
  loader: async ({ context }) => {
    // Load data in parallel
    const [stats, recentCommands, user] = await Promise.all([
      context.api.getStats(),
      context.api.getRecentCommands(),
      context.auth.getUser(),
    ])
    
    return { stats, recentCommands, user }
  },
  
  // Stale-while-revalidate
  staleTime: 10_000,
  gcTime: 30_000,
})

// Dependent queries
export const Route = createFileRoute('/commands/$sessionId')({
  loader: async ({ params, context, abortController }) => {
    const session = await context.api.getSession(
      params.sessionId, 
      { signal: abortController.signal }
    )
    
    const logs = await context.api.getLogs(
      session.id,
      { signal: abortController.signal }
    )
    
    return { session, logs }
  },
})
```

### 4. Route Guards
```typescript
// Protected route
export const Route = createFileRoute('/_authenticated/settings')({
  beforeLoad: async ({ context, location }) => {
    if (!context.auth.isAuthenticated()) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }
  },
})
```

### 5. Error Boundaries
```typescript
export const Route = createFileRoute('/commands')({
  errorComponent: ({ error, reset }) => {
    if (error instanceof ApiError && error.status === 404) {
      return <NotFound />
    }
    
    return (
      <div>
        <h1>Something went wrong</h1>
        <p>{error.message}</p>
        <button onClick={reset}>Try again</button>
      </div>
    )
  },
})
```

## Integration with React Query

```typescript
import { useSuspenseQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/commands/$sessionId')({
  loader: ({ params, context }) =>
    context.queryClient.ensureQueryData({
      queryKey: ['session', params.sessionId],
      queryFn: () => context.api.getSession(params.sessionId),
    }),
  
  component: SessionPage,
})

function SessionPage() {
  const { sessionId } = Route.useParams()
  
  const { data: session } = useSuspenseQuery({
    queryKey: ['session', sessionId],
    queryFn: () => api.getSession(sessionId),
  })
  
  return <div>{/* Use session data */}</div>
}
```

## Type-Safe Forms

```typescript
export const Route = createFileRoute('/commands/new')({
  validateSearch: z.object({
    preset: z.string().optional(),
  }),
  
  component: NewCommand,
})

function NewCommand() {
  const navigate = useNavigate({ from: Route.fullPath })
  const { preset } = Route.useSearch()
  
  const handleSubmit = async (data: CommandData) => {
    const session = await api.createSession(data)
    
    await navigate({
      to: '/commands/$sessionId',
      params: { sessionId: session.id },
      replace: true,
    })
  }
  
  return <CommandForm onSubmit={handleSubmit} preset={preset} />
}
```

## Best Practices

1. **Use file-based routing** for automatic type generation
2. **Define search schemas** with Zod for validation
3. **Leverage loaders** for data fetching before render
4. **Use route context** for dependency injection
5. **Implement error boundaries** at route level
6. **Use beforeLoad** for authentication guards
7. **Enable router devtools** in development
8. **Preload routes** on hover/focus for better UX
9. **Use type-safe navigation** with TypeScript
10. **Combine with React Query** for advanced caching