# @scalar/hono-api-reference with @hono/zod-openapi Integration Documentation

**Version**: @scalar/hono-api-reference v0.9.16, @hono/zod-openapi v1.1.0  
**Last Updated**: August 30, 2025

## Overview

This documentation covers the complete integration of @scalar/hono-api-reference with @hono/zod-openapi to create beautiful, interactive API documentation with type-safe validation. This combination provides automatic OpenAPI specification generation with Zod schemas and renders them using Scalar's modern documentation interface.

## Installation

### Complete Package Installation

```bash
# For Bun
bun add @scalar/hono-api-reference @hono/zod-openapi hono zod

# For npm
npm install @scalar/hono-api-reference @hono/zod-openapi hono zod

# For pnpm  
pnpm add @scalar/hono-api-reference @hono/zod-openapi hono zod
```

### Optional Packages

For LLM-friendly markdown generation:
```bash
bun add @scalar/openapi-to-markdown
```

## Complete Integration Example

### 1. Basic Setup

```typescript
import { OpenAPIHono } from '@hono/zod-openapi'
import { createRoute, z } from '@hono/zod-openapi'
import { Scalar } from '@scalar/hono-api-reference'

const app = new OpenAPIHono()
```

### 2. Define Schemas with OpenAPI Extensions

```typescript
// Path parameters schema
const ParamsSchema = z.object({
  id: z.string().min(1).openapi({
    param: {
      name: 'id',
      in: 'path',
    },
    example: 'user-123',
    description: 'Unique user identifier'
  }),
})

// Query parameters schema
const QuerySchema = z.object({
  limit: z.string().pipe(z.coerce.number().min(1).max(100)).optional().openapi({
    param: {
      name: 'limit',
      in: 'query',
    },
    example: '10',
    description: 'Maximum number of items to return'
  }),
  search: z.string().min(1).optional().openapi({
    param: {
      name: 'search',
      in: 'query',
    },
    example: 'john',
    description: 'Search term for filtering users'
  })
})

// Response schemas
const UserSchema = z.object({
  id: z.string().openapi({ 
    example: 'user-123',
    description: 'User ID' 
  }),
  name: z.string().openapi({ 
    example: 'John Doe',
    description: 'Full name of the user' 
  }),
  email: z.string().email().openapi({ 
    example: 'john@example.com',
    description: 'User email address' 
  }),
  createdAt: z.string().datetime().openapi({
    example: '2025-08-30T12:00:00Z',
    description: 'Account creation timestamp'
  }),
  isActive: z.boolean().openapi({
    example: true,
    description: 'Whether the user account is active'
  })
}).openapi('User')

const UsersListSchema = z.object({
  users: z.array(UserSchema),
  total: z.number().openapi({
    example: 150,
    description: 'Total number of users'
  }),
  page: z.number().openapi({
    example: 1,
    description: 'Current page number'
  }),
  limit: z.number().openapi({
    example: 10,
    description: 'Items per page'
  })
}).openapi('UsersList')

// Request body schema
const CreateUserSchema = z.object({
  name: z.string().min(1).max(100).openapi({
    example: 'Jane Smith',
    description: 'User full name'
  }),
  email: z.string().email().openapi({
    example: 'jane@example.com',
    description: 'User email address'
  }),
  password: z.string().min(8).openapi({
    example: 'SecurePass123!',
    description: 'User password (minimum 8 characters)'
  }),
}).openapi('CreateUser')

// Error response schema
const ErrorSchema = z.object({
  error: z.string().openapi({
    example: 'User not found',
    description: 'Error message'
  }),
  code: z.string().optional().openapi({
    example: 'USER_NOT_FOUND',
    description: 'Error code for programmatic handling'
  }),
  details: z.record(z.any()).optional().openapi({
    description: 'Additional error details'
  })
}).openapi('Error')
```

### 3. Create Routes with OpenAPI Definitions

```typescript
// Get single user route
const getUserRoute = createRoute({
  method: 'get',
  path: '/api/users/{id}',
  tags: ['Users'],
  summary: 'Get user by ID',
  description: 'Retrieve a single user by their unique identifier',
  request: {
    params: ParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
      description: 'User retrieved successfully',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'User not found',
    },
    500: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Internal server error',
    },
  },
})

// List users route
const getUsersRoute = createRoute({
  method: 'get',
  path: '/api/users',
  tags: ['Users'],
  summary: 'List users',
  description: 'Retrieve a paginated list of users with optional search',
  request: {
    query: QuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: UsersListSchema,
        },
      },
      description: 'Users retrieved successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Bad request - invalid query parameters',
    },
    500: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Internal server error',
    },
  },
})

// Create user route
const createUserRoute = createRoute({
  method: 'post',
  path: '/api/users',
  tags: ['Users'],
  summary: 'Create new user',
  description: 'Create a new user account with the provided information',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateUserSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
      description: 'User created successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Bad request - validation errors',
    },
    409: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Conflict - email already exists',
    },
    500: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Internal server error',
    },
  },
})
```

### 4. Implement Route Handlers

```typescript
// Sample data (replace with your database logic)
const users = [
  {
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: '2025-08-30T12:00:00Z',
    isActive: true
  },
  {
    id: 'user-456',
    name: 'Jane Smith',
    email: 'jane@example.com',
    createdAt: '2025-08-30T13:00:00Z',
    isActive: true
  }
]

// Get single user handler
app.openapi(getUserRoute, async (c) => {
  const { id } = c.req.valid('param')
  
  const user = users.find(u => u.id === id)
  
  if (!user) {
    return c.json({ 
      error: 'User not found',
      code: 'USER_NOT_FOUND' 
    }, 404)
  }
  
  return c.json(user, 200)
})

// List users handler
app.openapi(getUsersRoute, async (c) => {
  const { limit = '10', search } = c.req.valid('query')
  
  let filteredUsers = users
  
  // Apply search filter if provided
  if (search) {
    filteredUsers = users.filter(user => 
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    )
  }
  
  // Apply pagination
  const limitNum = parseInt(limit)
  const paginatedUsers = filteredUsers.slice(0, limitNum)
  
  return c.json({
    users: paginatedUsers,
    total: filteredUsers.length,
    page: 1,
    limit: limitNum
  }, 200)
})

// Create user handler
app.openapi(createUserRoute, async (c) => {
  const body = c.req.valid('json')
  
  // Check if email already exists
  const existingUser = users.find(u => u.email === body.email)
  if (existingUser) {
    return c.json({
      error: 'Email already exists',
      code: 'EMAIL_CONFLICT'
    }, 409)
  }
  
  // Create new user
  const newUser = {
    id: `user-${Date.now()}`,
    name: body.name,
    email: body.email,
    createdAt: new Date().toISOString(),
    isActive: true
  }
  
  users.push(newUser)
  
  return c.json(newUser, 201)
})
```

### 5. Generate OpenAPI Documentation

```typescript
// Generate OpenAPI spec endpoint
app.doc('/doc', {
  openapi: '3.1.0',
  info: {
    version: '1.0.0',
    title: 'Code Wrapper API',
    description: 'Comprehensive API for wrapping Claude Code CLI execution with user management',
    contact: {
      name: 'API Support',
      email: 'support@example.com',
      url: 'https://example.com/support'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
    {
      url: 'https://api.example.com',
      description: 'Production server',
    },
  ],
  tags: [
    {
      name: 'Users',
      description: 'User management operations'
    }
  ],
  externalDocs: {
    description: 'API Documentation',
    url: 'https://docs.example.com'
  }
})
```

### 6. Integrate Scalar API Reference

```typescript
// Basic Scalar setup
app.get('/reference', Scalar({ url: '/doc' }))

// Advanced Scalar configuration with dynamic setup
app.get('/api-docs', Scalar((c) => {
  const isDevelopment = c.env?.NODE_ENV === 'development'
  
  return {
    url: '/doc',
    // Use proxy in development for CORS handling
    proxyUrl: isDevelopment ? 'https://proxy.scalar.com' : undefined,
    // Custom theme
    theme: 'purple',
    // Custom page title
    pageTitle: 'Code Wrapper API Documentation',
    // Custom favicon
    favicon: '/favicon.ico',
    // Additional configuration
    searchHotKey: 'k',
    showSidebar: true,
    hideDownloadButton: false,
    darkMode: false,
    layout: 'modern',
    // Custom CSS
    customCss: `
      .scalar-app {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      }
    `,
  }
}))

// Alternative with static configuration
app.get('/docs', Scalar({
  url: '/doc',
  theme: 'alternate',
  pageTitle: 'API Reference',
  cdn: 'https://cdn.jsdelivr.net/npm/@scalar/api-reference@latest'
}))
```

## Advanced Configuration Options

### Scalar Themes

Available themes with light/dark mode support:
- `alternate` - Clean, modern design
- `default` - Standard Scalar theme  
- `moon` - Dark-friendly theme
- `purple` - Purple accent theme
- `solarized` - Solarized color scheme
- `saturn` - Custom Saturn theme
- `none` - No theme (custom styling)

```typescript
app.get('/docs', Scalar({
  url: '/doc',
  theme: 'moon', // or any other theme
  darkMode: true // Force dark mode
}))
```

### Custom Styling

```typescript
app.get('/docs', Scalar({
  url: '/doc',
  customCss: `
    .scalar-app {
      --scalar-color-1: #2d3748;
      --scalar-color-2: #4a5568;
      --scalar-color-3: #718096;
      --scalar-border-color: #e2e8f0;
      --scalar-background-1: #ffffff;
      --scalar-background-2: #f7fafc;
      --scalar-background-3: #edf2f7;
    }
    
    .scalar-sidebar {
      border-right: 1px solid var(--scalar-border-color);
    }
    
    .scalar-content {
      font-family: 'Inter', system-ui, sans-serif;
    }
  `
}))
```

### Environment-Specific Configuration

```typescript
app.get('/docs', Scalar((c) => {
  const env = c.env?.NODE_ENV || 'development'
  const baseUrl = env === 'production' 
    ? 'https://api.example.com' 
    : 'http://localhost:3000'

  return {
    url: '/doc',
    proxyUrl: env === 'development' ? 'https://proxy.scalar.com' : undefined,
    theme: env === 'production' ? 'default' : 'purple',
    pageTitle: `API Docs (${env.toUpperCase()})`,
    servers: [
      {
        url: baseUrl,
        description: `${env} server`
      }
    ]
  }
}))
```

## Markdown Generation for LLMs

Generate LLM-friendly markdown documentation:

```typescript
import { createMarkdownFromOpenApi } from '@scalar/openapi-to-markdown'

// Add markdown endpoint for LLM consumption
app.get('/llms.txt', async (c) => {
  // Get the OpenAPI document
  const openApiDoc = app.getOpenAPI31Document({
    openapi: '3.1.0',
    info: {
      version: '1.0.0',
      title: 'Code Wrapper API',
      description: 'API documentation in markdown format for LLM consumption'
    },
  })
  
  // Convert to markdown
  const markdown = await createMarkdownFromOpenApi(JSON.stringify(openApiDoc))
  
  // Return as plain text
  return c.text(markdown, 200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'public, max-age=3600'
  })
})
```

## Middleware Integration

### CORS Configuration for API Documentation

```typescript
import { cors } from 'hono/cors'

// Enable CORS for documentation endpoints
app.use('/doc', cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}))

app.use('/reference', cors())
app.use('/api-docs', cors())
```

### Authentication for Documentation

```typescript
import { basicAuth } from 'hono/basic-auth'

// Protect documentation in production
if (process.env.NODE_ENV === 'production') {
  app.use('/reference', basicAuth({
    username: process.env.DOCS_USERNAME || 'admin',
    password: process.env.DOCS_PASSWORD || 'secure-password',
  }))
  
  app.use('/api-docs', basicAuth({
    username: process.env.DOCS_USERNAME || 'admin', 
    password: process.env.DOCS_PASSWORD || 'secure-password',
  }))
}
```

## Error Handling and Validation

### Custom Validation Error Responses

```typescript
import { Hook } from '@hono/zod-openapi'

// Global error handler for validation
const validationErrorHook: Hook<any, any, any, any> = (result, c) => {
  if (!result.success) {
    return c.json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: result.error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code
      }))
    }, 400)
  }
}

// Apply to specific routes
const routeWithCustomValidation = createRoute({
  method: 'post',
  path: '/api/users',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateUserSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
      description: 'User created successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Validation error',
    },
  },
})

app.openapi(routeWithCustomValidation, async (c) => {
  const body = c.req.valid('json')
  // Handle validated request
  return c.json(newUser, 201)
}, validationErrorHook)
```

## Production Deployment

### Complete Server Setup

```typescript
import { serve } from '@hono/node-server'
import { OpenAPIHono } from '@hono/zod-openapi'
import { Scalar } from '@scalar/hono-api-reference'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { requestId } from 'hono/request-id'

const app = new OpenAPIHono()

// Global middleware
app.use('*', requestId())
app.use('*', logger())
app.use('*', cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}))

// Pretty JSON in development
if (process.env.NODE_ENV === 'development') {
  app.use('*', prettyJSON())
}

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || '1.0.0'
  })
})

// Add all your routes here...
// ... (route definitions from above)

// Documentation endpoints
app.doc('/doc', { /* OpenAPI config */ })
app.get('/reference', Scalar({ url: '/doc', theme: 'purple' }))

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err)
  
  return c.json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    requestId: c.get('requestId')
  }, 500)
})

// 404 handler
app.notFound((c) => {
  return c.json({
    error: 'Route not found',
    code: 'NOT_FOUND',
    path: c.req.path
  }, 404)
})

// Start server
const port = parseInt(process.env.PORT || '3000')

console.log(`🚀 Server starting on port ${port}`)
console.log(`📖 API Documentation: http://localhost:${port}/reference`)
console.log(`📋 OpenAPI Spec: http://localhost:${port}/doc`)

serve({
  fetch: app.fetch,
  port
}, (info) => {
  console.log(`✅ Server running at http://localhost:${info.port}`)
})

export default app
export type AppType = typeof app
```

### Docker Configuration

```dockerfile
FROM oven/bun:1.0-alpine

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile --production

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Build application
RUN bun build ./src/index.ts --target=bun --outdir=./dist

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["bun", "run", "dist/index.js"]
```

### Environment Variables

```bash
# .env.production
NODE_ENV=production
PORT=3000
API_VERSION=1.0.0

# Documentation
DOCS_USERNAME=admin
DOCS_PASSWORD=secure-docs-password

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# Database (if applicable)
DATABASE_URL=postgresql://user:password@localhost:5432/db

# JWT (if using authentication)
JWT_SECRET=your-super-secure-jwt-secret-key
```

## Troubleshooting

### Common Issues

1. **OpenAPI spec not loading in Scalar**
   ```typescript
   // Ensure the /doc endpoint is accessible
   app.get('/test-doc', async (c) => {
     const doc = app.getOpenAPI31Document({
       openapi: '3.1.0',
       info: { version: '1.0.0', title: 'Test' }
     })
     return c.json(doc)
   })
   ```

2. **CORS issues with documentation**
   ```typescript
   // Add specific CORS for documentation endpoints
   app.use('/doc', cors({ origin: '*' }))
   app.use('/reference', cors({ origin: '*' }))
   ```

3. **Zod validation not working**
   ```typescript
   // Ensure you're importing z from @hono/zod-openapi, not zod directly
   import { z } from '@hono/zod-openapi' // ✅ Correct
   import { z } from 'zod' // ❌ Wrong for OpenAPI
   ```

4. **Schema not appearing in documentation**
   ```typescript
   // Make sure to call .openapi() on schemas
   const UserSchema = z.object({
     id: z.string(),
     name: z.string()
   }).openapi('User') // ✅ Required for documentation
   ```

## Best Practices

1. **Use descriptive schema names**: Always call `.openapi('SchemaName')` on your schemas
2. **Add examples and descriptions**: Use `.openapi({ example: '...', description: '...' })` 
3. **Version your API**: Include version in OpenAPI info and URL paths
4. **Tag your routes**: Group related endpoints with tags
5. **Document all responses**: Include error responses with proper schemas
6. **Use environment-specific configuration**: Different themes/settings for dev/prod
7. **Implement proper CORS**: Allow documentation access from authorized origins
8. **Add authentication for production docs**: Protect sensitive API documentation
9. **Include health checks**: Monitor API availability
10. **Generate client types**: Export app type for type-safe frontend integration

## References

- [@scalar/hono-api-reference npm](https://www.npmjs.com/package/@scalar/hono-api-reference)
- [@hono/zod-openapi npm](https://www.npmjs.com/package/@hono/zod-openapi)  
- [Scalar Documentation](https://guides.scalar.com/scalar/scalar-api-references/integrations/hono)
- [Hono OpenAPI Examples](https://hono.dev/examples/zod-openapi)
- [OpenAPI 3.1 Specification](https://spec.openapis.org/oas/v3.1.0)