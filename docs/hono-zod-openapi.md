# Hono with @hono/zod-openapi Documentation

**Version:** 1.1.0+ (Latest 2024-2025)  
**Last Updated:** August 2024

## Overview
Hono is a lightweight, ultrafast web framework for the Edge. @hono/zod-openapi extends Hono with OpenAPI support using Zod for validation and automatic API documentation generation. This library provides type-safe route definitions, automatic validation, and OpenAPI spec generation.

## Installation
```bash
# With npm
npm install hono @hono/zod-openapi zod

# With bun  
bun add hono @hono/zod-openapi zod

# With yarn
yarn add hono @hono/zod-openapi zod
```

## Basic Setup

### 1. Import and Initialize
```typescript
import { OpenAPIHono } from '@hono/zod-openapi'
import { z } from '@hono/zod-openapi'

const app = new OpenAPIHono()
```

### 2. Define Schemas with OpenAPI Extensions
```typescript
// Request/Response schemas
const UserSchema = z
  .object({
    id: z.string().openapi({ example: '123' }),
    name: z.string().openapi({ example: 'John Doe' }),
    email: z.string().email().openapi({ example: 'john@example.com' }),
    createdAt: z.string().datetime()
  })
  .openapi('User')

// Path parameters
const ParamsSchema = z.object({
  id: z.string().min(1).openapi({
    param: {
      name: 'id',
      in: 'path',
    },
    example: 'user-123',
  }),
})

// Query parameters
const QuerySchema = z.object({
  limit: z.string().pipe(z.coerce.number()).optional().openapi({
    param: {
      name: 'limit',
      in: 'query',
    },
    example: '10',
  }),
  offset: z.string().pipe(z.coerce.number()).optional()
})

// Request body
const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8)
})
```

### 3. Create Routes with OpenAPI Definitions (2024-2025 Best Practices)
```typescript
import { createRoute } from '@hono/zod-openapi'

// Standard error response schema (reusable)
const ErrorSchema = z.object({
  error: z.string().openapi({ example: 'Resource not found' }),
  code: z.string().optional().openapi({ example: 'USER_NOT_FOUND' }),
  details: z.record(z.any()).optional()
}).openapi('Error')

const getUserRoute = createRoute({
  method: 'get',
  path: '/users/{id}',
  operationId: 'getUserById', // For SDK generation
  tags: ['Users'], // For documentation grouping
  summary: 'Get user by ID',
  description: 'Retrieves a specific user by their unique identifier',
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
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Invalid user ID format',
    },
  },
})

const createUserRoute = createRoute({
  method: 'post',
  path: '/users',
  operationId: 'createUser',
  tags: ['Users'],
  summary: 'Create a new user',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateUserSchema,
        },
      },
      required: true, // Explicit requirement (2024+ best practice)
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
          schema: z.object({
            error: z.string(),
            validationErrors: z.array(z.object({
              field: z.string(),
              message: z.string(),
            })).optional(),
          }),
        },
      },
      description: 'Validation error or bad request',
    },
    409: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'User already exists (email conflict)',
    },
  },
})
```

### 4. Implement Type-Safe Route Handlers (2024-2025 Patterns)
```typescript
import type { RouteHandler } from '@hono/zod-openapi'

// Type-safe handler definition
type AppRouteHandler<T> = RouteHandler<T, any>

// Enhanced error handling with custom hook
const app = new OpenAPIHono({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json({
        error: 'Validation failed',
        validationErrors: result.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        }))
      }, 422)
    }
  },
})

// Type-safe getUserRoute handler
const getUserHandler: AppRouteHandler<typeof getUserRoute> = async (c) => {
  const { id } = c.req.valid('param')
  
  // Validate UUID format if needed
  if (!isValidUUID(id)) {
    return c.json({ error: 'Invalid user ID format', code: 'INVALID_ID' }, 400)
  }
  
  try {
    const user = await getUserById(id)
    
    if (!user) {
      return c.json({ error: 'User not found', code: 'USER_NOT_FOUND' }, 404)
    }
    
    return c.json(user, 200)
  } catch (error) {
    console.error('Failed to get user:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
}

// Type-safe createUserRoute handler with enhanced validation
const createUserHandler: AppRouteHandler<typeof createUserRoute> = async (c) => {
  const body = c.req.valid('json')
  
  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(body.email)
    if (existingUser) {
      return c.json({ error: 'User with this email already exists', code: 'EMAIL_CONFLICT' }, 409)
    }
    
    const newUser = await createUser(body)
    return c.json(newUser, 201)
  } catch (error) {
    console.error('Failed to create user:', error)
    return c.json({ error: 'Failed to create user' }, 500)
  }
}

// Register handlers
app.openapi(getUserRoute, getUserHandler)
app.openapi(createUserRoute, createUserHandler)
```

### 5. Add OpenAPI Documentation Endpoint (2024-2025 Enhanced Setup)
```typescript
// Register security schemes first
app.openAPIRegistry.registerComponent('securitySchemes', 'Bearer', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'Bearer token authentication'
})

app.openAPIRegistry.registerComponent('securitySchemes', 'ApiKey', {
  type: 'apiKey',
  in: 'header',
  name: 'X-API-Key',
  description: 'API key authentication'
})

// Serve OpenAPI spec with comprehensive metadata
app.doc('/doc', {
  openapi: '3.1.0',
  info: {
    version: '1.0.0',
    title: 'Code Wrapper API',
    description: 'API for wrapping Claude Code CLI execution with enhanced OpenAPI documentation',
    contact: {
      name: 'API Support',
      email: 'support@example.com',
      url: 'https://example.com/support'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    },
    termsOfService: 'https://example.com/terms'
  },
  servers: [
    {
      url: 'https://api.example.com',
      description: 'Production server',
    },
    {
      url: 'https://staging-api.example.com',
      description: 'Staging server',
    },
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  tags: [
    {
      name: 'Users',
      description: 'User management operations'
    },
    {
      name: 'Authentication',
      description: 'Authentication and authorization'
    }
  ],
  externalDocs: {
    description: 'Find more info here',
    url: 'https://docs.example.com'
  }
})

// Add Swagger UI with custom configuration
import { swaggerUI } from '@hono/swagger-ui'

app.get('/ui', swaggerUI({ 
  url: '/doc',
  theme: 'dark', // or 'light'
  deepLinking: true,
  displayRequestDuration: true,
  tryItOutEnabled: true
}))

// Alternative: Use Scalar for modern API docs
import { apiReference } from '@scalar/hono-api-reference'

app.get('/reference', apiReference({
  theme: 'purple',
  spec: {
    url: '/doc',
  },
}))
```

## Security Schemes and Authentication (2024-2025)

### 1. Bearer Token Authentication
```typescript
// Register Bearer authentication scheme
app.openAPIRegistry.registerComponent('securitySchemes', 'Bearer', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'JWT Bearer token authentication'
})

// Protected route with Bearer auth
const protectedRoute = createRoute({
  method: 'get',
  path: '/api/profile',
  operationId: 'getUserProfile',
  tags: ['Users'],
  summary: 'Get current user profile',
  security: [
    {
      Bearer: [], // References the registered security scheme
    },
  ],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
      description: 'User profile retrieved successfully',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Unauthorized - invalid or missing token',
    },
    403: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Forbidden - insufficient permissions',
    },
  },
})

// Authentication middleware
import { verify } from 'hono/jwt'

const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ 
      error: 'Missing or invalid authorization header',
      code: 'MISSING_AUTH_HEADER' 
    }, 401)
  }
  
  const token = authHeader.substring(7)
  
  try {
    const payload = await verify(token, process.env.JWT_SECRET!)
    c.set('userId', payload.sub as string)
    c.set('userRole', payload.role as string)
    await next()
  } catch (error) {
    return c.json({ 
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN' 
    }, 401)
  }
}

// Apply middleware to protected routes
app.use('/api/profile', authMiddleware)
app.openapi(protectedRoute, async (c) => {
  const userId = c.get('userId')
  const user = await getUserById(userId)
  return c.json(user, 200)
})
```

### 2. API Key Authentication
```typescript
// Register API Key authentication scheme
app.openAPIRegistry.registerComponent('securitySchemes', 'ApiKey', {
  type: 'apiKey',
  in: 'header',
  name: 'X-API-Key',
  description: 'API key for service-to-service authentication'
})

// API Key protected route
const apiKeyRoute = createRoute({
  method: 'get',
  path: '/api/internal/stats',
  operationId: 'getInternalStats',
  tags: ['Internal'],
  summary: 'Get internal statistics',
  security: [
    {
      ApiKey: [],
    },
  ],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            totalUsers: z.number(),
            activeUsers: z.number(),
            requestsToday: z.number(),
          }),
        },
      },
      description: 'Statistics retrieved successfully',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Invalid API key',
    },
  },
})

// API Key middleware
const apiKeyMiddleware = async (c: Context, next: Next) => {
  const apiKey = c.req.header('X-API-Key')
  
  if (!apiKey) {
    return c.json({ 
      error: 'Missing API key',
      code: 'MISSING_API_KEY' 
    }, 401)
  }
  
  const isValid = await validateApiKey(apiKey)
  if (!isValid) {
    return c.json({ 
      error: 'Invalid API key',
      code: 'INVALID_API_KEY' 
    }, 401)
  }
  
  await next()
}
```

### 3. Combined Authentication (Bearer OR API Key)
```typescript
// Route that accepts either Bearer token or API key
const flexibleAuthRoute = createRoute({
  method: 'get',
  path: '/api/data',
  operationId: 'getData',
  security: [
    { Bearer: [] },     // Option 1: Bearer token
    { ApiKey: [] },     // Option 2: API key
  ],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({ data: z.array(z.any()) }),
        },
      },
      description: 'Data retrieved successfully',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Authentication required',
    },
  },
})

// Combined authentication middleware
const flexibleAuthMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization')
  const apiKey = c.req.header('X-API-Key')
  
  // Try Bearer token first
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7)
      const payload = await verify(token, process.env.JWT_SECRET!)
      c.set('userId', payload.sub as string)
      c.set('authType', 'bearer')
      return await next()
    } catch (error) {
      // Fall through to API key check
    }
  }
  
  // Try API key
  if (apiKey) {
    const isValid = await validateApiKey(apiKey)
    if (isValid) {
      c.set('authType', 'apikey')
      return await next()
    }
  }
  
  return c.json({ 
    error: 'Authentication required - provide either Bearer token or API key',
    code: 'AUTHENTICATION_REQUIRED' 
  }, 401)
}
```

## Server-Sent Events (SSE) Streaming Responses

### 1. SSE Route Definition with OpenAPI
```typescript
// SSE event schema
const SSEEventSchema = z.object({
  event: z.enum(['start', 'data', 'error', 'end']).openapi({ 
    example: 'data',
    description: 'Event type for SSE stream' 
  }),
  data: z.string().openapi({ 
    example: '{"message": "Processing..."}',
    description: 'Event data as JSON string' 
  }),
  id: z.string().optional().openapi({ 
    example: '12345',
    description: 'Unique event ID for client tracking' 
  }),
  retry: z.number().optional().openapi({ 
    example: 5000,
    description: 'Reconnection timeout in milliseconds' 
  }),
}).openapi('SSEEvent')

// Chat streaming route with Bearer auth
const chatStreamRoute = createRoute({
  method: 'post',
  path: '/api/{projectId}/chat/stream',
  operationId: 'streamChat',
  tags: ['Chat'],
  summary: 'Stream chat responses via Server-Sent Events',
  description: 'Send a message and receive streaming AI responses via SSE',
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      projectId: z.string().openapi({
        param: { name: 'projectId', in: 'path' },
        example: 'proj_123',
        description: 'Project identifier'
      }),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string().min(1).max(4000),
            conversationId: z.string().optional(),
            model: z.enum(['gpt-4', 'gpt-3.5-turbo']).default('gpt-4'),
            stream: z.boolean().default(true),
          }),
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: 'Successful SSE stream with chat responses',
      content: {
        'text/event-stream': {
          schema: SSEEventSchema,
          example: 'event: data\\ndata: {"token": "Hello"}\\n\\n',
        },
      },
      headers: {
        'Cache-Control': {
          schema: {
            type: 'string',
          },
          description: 'no-cache',
        },
        'Connection': {
          schema: {
            type: 'string',
          },
          description: 'keep-alive',
        },
        'Content-Type': {
          schema: {
            type: 'string',
          },
          description: 'text/event-stream',
        },
      },
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Invalid request parameters',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Authentication required',
    },
    403: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Access denied to project',
    },
  },
})
```

### 2. SSE Handler Implementation (2024-2025 Pattern)
```typescript
import { streamSSE } from 'hono/streaming'

// Type-safe SSE handler with proper error handling
const chatStreamHandler: AppRouteHandler<typeof chatStreamRoute> = async (c) => {
  const { projectId } = c.req.valid('param')
  const { message, conversationId, model, stream } = c.req.valid('json')
  const userId = c.get('userId')
  
  // Validate project access
  const hasAccess = await checkProjectAccess(userId, projectId)
  if (!hasAccess) {
    return c.json({ 
      error: 'Access denied to project',
      code: 'PROJECT_ACCESS_DENIED' 
    }, 403)
  }
  
  try {
    return streamSSE(c, async (stream) => {
      // Set SSE headers
      c.header('Cache-Control', 'no-cache')
      c.header('Connection', 'keep-alive')
      c.header('X-Accel-Buffering', 'no') // Disable Nginx buffering
      
      let eventId = 0
      
      // Send start event
      await stream.writeSSE({
        event: 'start',
        data: JSON.stringify({ 
          conversationId: conversationId || generateId(),
          model,
          timestamp: Date.now()
        }),
        id: String(++eventId),
      })
      
      try {\n        // Stream AI response (example with OpenAI-style streaming)
        const response = await streamChatCompletion({
          message,
          model,
          conversationId,
          userId,
          projectId,
        })
        
        // Stream tokens as they arrive
        for await (const chunk of response) {\n          if (chunk.type === 'token') {\n            await stream.writeSSE({
              event: 'data',
              data: JSON.stringify({ 
                token: chunk.content,
                timestamp: Date.now()
              }),
              id: String(++eventId),
            })\n          } else if (chunk.type === 'metadata') {\n            await stream.writeSSE({\n              event: 'metadata',\n              data: JSON.stringify(chunk.data),\n              id: String(++eventId),\n            })\n          }\n        }\n        \n        // Send completion event\n        await stream.writeSSE({\n          event: 'end',\n          data: JSON.stringify({ \n            status: 'completed',\n            tokensGenerated: eventId,\n            timestamp: Date.now()\n          }),\n          id: String(++eventId),\n        })\n        \n      } catch (streamError) {\n        console.error('Streaming error:', streamError)\n        await stream.writeSSE({\n          event: 'error',\n          data: JSON.stringify({ \n            error: 'Streaming failed',\n            code: 'STREAM_ERROR',\n            timestamp: Date.now()\n          }),\n          id: String(++eventId),\n        })\n      }\n    })\n  } catch (error) {\n    console.error('Chat stream error:', error)\n    return c.json({ \n      error: 'Failed to initialize chat stream',\n      code: 'STREAM_INIT_FAILED' \n    }, 500)\n  }\n}

// Register SSE route\napp.use('/api/*/chat/stream', authMiddleware)\napp.openapi(chatStreamRoute, chatStreamHandler)
```

### 3. SSE Client Integration Example
```typescript
// Client-side SSE consumption
const connectToStream = (projectId: string, message: string, token: string) => {
  const eventSource = new EventSource(`/api/${projectId}/chat/stream`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
  
  eventSource.addEventListener('start', (event) => {
    const data = JSON.parse(event.data)
    console.log('Stream started:', data.conversationId)
  })
  
  eventSource.addEventListener('data', (event) => {
    const data = JSON.parse(event.data)
    // Append token to UI
    appendToken(data.token)
  })
  
  eventSource.addEventListener('end', (event) => {
    const data = JSON.parse(event.data)
    console.log('Stream completed:', data.tokensGenerated, 'tokens')
    eventSource.close()
  })
  
  eventSource.addEventListener('error', (event) => {
    const data = JSON.parse(event.data)
    console.error('Stream error:', data.error)
    eventSource.close()
  })
  
  eventSource.onerror = (error) => {
    console.error('EventSource failed:', error)
    eventSource.close()
  }
}
```

## Advanced Request Validation Patterns

### 1. Enhanced Query Parameter Validation
```typescript
// Advanced query schema with transformations
const SearchQuerySchema = z.object({
  q: z.string().min(1).max(100).openapi({
    param: { name: 'q', in: 'query' },
    example: 'javascript tutorial',
    description: 'Search query string'
  }),
  page: z.string().pipe(z.coerce.number().int().min(1).max(100)).default('1').openapi({
    param: { name: 'page', in: 'query' },
    example: '1',
    description: 'Page number for pagination'
  }),
  limit: z.string().pipe(z.coerce.number().int().min(1).max(100)).default('20').openapi({
    param: { name: 'limit', in: 'query' },
    example: '20',
    description: 'Number of results per page'
  }),
  sort: z.enum(['relevance', 'date', 'popularity']).default('relevance').openapi({
    param: { name: 'sort', in: 'query' },
    example: 'relevance',
    description: 'Sort order for results'
  }),
  filter: z.array(z.enum(['video', 'article', 'tutorial'])).optional().openapi({
    param: { name: 'filter', in: 'query', explode: false },
    example: ['article', 'tutorial'],
    description: 'Content type filters (comma-separated)'
  }),
  dateRange: z.string().regex(/^\\d{4}-\\d{2}-\\d{2}:\\d{4}-\\d{2}-\\d{2}$/).optional().openapi({
    param: { name: 'dateRange', in: 'query' },
    example: '2024-01-01:2024-12-31',
    description: 'Date range filter in format YYYY-MM-DD:YYYY-MM-DD'
  }),
})

const searchRoute = createRoute({
  method: 'get',
  path: '/api/search',
  operationId: 'searchContent',
  tags: ['Search'],
  summary: 'Search content with advanced filtering',
  request: {
    query: SearchQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            results: z.array(z.object({
              id: z.string(),
              title: z.string(),
              content: z.string(),
              type: z.enum(['video', 'article', 'tutorial']),
              publishedAt: z.string().datetime(),
              relevanceScore: z.number().min(0).max(1),
            })),
            pagination: z.object({
              page: z.number(),
              limit: z.number(),
              total: z.number(),
              totalPages: z.number(),
            }),
            filters: z.object({
              activeFilters: z.array(z.string()),
              availableFilters: z.record(z.number()),
            }),
          }),
        },
      },
      description: 'Search results with pagination and filtering',
    },
  },
})
```

### 2. File Upload with Advanced Validation
```typescript
// Advanced file validation schema
const FileUploadSchema = z.object({
  file: z.instanceof(File)\n    .refine((file) => file.size <= 10 * 1024 * 1024, 'File size must be less than 10MB')\n    .refine(\n      (file) => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type),\n      'Only JPEG, PNG, WebP, and GIF images are allowed'\n    )\n    .refine(\n      (file) => file.name.length <= 255,\n      'Filename must be less than 255 characters'\n    ),\n  tags: z.array(z.string().min(1).max(50)).max(10).optional().openapi({\n    example: ['profile', 'avatar'],\n    description: 'Optional tags for the uploaded file'\n  }),\n  description: z.string().max(500).optional().openapi({\n    example: 'Profile picture for user account',\n    description: 'Optional description of the file'\n  }),\n  isPublic: z.boolean().default(false).openapi({\n    example: false,\n    description: 'Whether the file should be publicly accessible'\n  }),\n})\n\nconst uploadRoute = createRoute({\n  method: 'post',\n  path: '/api/upload',\n  operationId: 'uploadFile',\n  tags: ['Files'],\n  summary: 'Upload a file with metadata',\n  security: [{ Bearer: [] }],\n  request: {\n    body: {\n      content: {\n        'multipart/form-data': {\n          schema: z.object({\n            file: z.string().openapi({ type: 'string', format: 'binary' }),\n            tags: z.string().optional().openapi({\n              description: 'Comma-separated tags'\n            }),\n            description: z.string().optional(),\n            isPublic: z.string().optional().openapi({\n              description: 'true or false'\n            }),\n          }),\n        },\n      },\n      required: true,\n    },\n  },\n  responses: {\n    200: {\n      content: {\n        'application/json': {\n          schema: z.object({\n            fileId: z.string(),\n            url: z.string().url(),\n            publicUrl: z.string().url().optional(),\n            metadata: z.object({\n              filename: z.string(),\n              size: z.number(),\n              contentType: z.string(),\n              uploadedAt: z.string().datetime(),\n              tags: z.array(z.string()).optional(),\n            }),\n          }),\n        },\n      },\n      description: 'File uploaded successfully',\n    },\n    400: {\n      content: {\n        'application/json': {\n          schema: z.object({\n            error: z.string(),\n            validationErrors: z.array(z.object({\n              field: z.string(),\n              message: z.string(),\n            })).optional(),\n          }),\n        },\n      },\n      description: 'Validation error',\n    },\n    413: {\n      content: {\n        'application/json': {\n          schema: ErrorSchema,\n        },\n      },\n      description: 'File too large',\n    },\n  },\n})\n\n// Enhanced upload handler\nconst uploadHandler: AppRouteHandler<typeof uploadRoute> = async (c) => {\n  const userId = c.get('userId')\n  \n  try {\n    const formData = await c.req.formData()\n    const file = formData.get('file') as File\n    const tagsStr = formData.get('tags') as string | null\n    const description = formData.get('description') as string | null\n    const isPublicStr = formData.get('isPublic') as string | null\n    \n    // Parse and validate data\n    const tags = tagsStr ? tagsStr.split(',').map(tag => tag.trim()) : undefined\n    const isPublic = isPublicStr === 'true'\n    \n    // Validate with schema\n    const validationResult = FileUploadSchema.safeParse({\n      file,\n      tags,\n      description,\n      isPublic,\n    })\n    \n    if (!validationResult.success) {\n      return c.json({\n        error: 'Validation failed',\n        validationErrors: validationResult.error.issues.map(issue => ({\n          field: issue.path.join('.'),\n          message: issue.message,\n        }))\n      }, 400)\n    }\n    \n    // Process file upload\n    const buffer = await file.arrayBuffer()\n    const uploadResult = await uploadFileToStorage({\n      buffer: Buffer.from(buffer),\n      filename: file.name,\n      contentType: file.type,\n      userId,\n      tags,\n      description,\n      isPublic,\n    })\n    \n    return c.json({\n      fileId: uploadResult.fileId,\n      url: uploadResult.privateUrl,\n      publicUrl: isPublic ? uploadResult.publicUrl : undefined,\n      metadata: {\n        filename: file.name,\n        size: file.size,\n        contentType: file.type,\n        uploadedAt: new Date().toISOString(),\n        tags,\n      },\n    }, 200)\n    \n  } catch (error) {\n    console.error('Upload error:', error)\n    return c.json({ \n      error: 'Failed to upload file',\n      code: 'UPLOAD_FAILED' \n    }, 500)\n  }\n}\n```

## WebSocket Support with Hono

```typescript
import { Hono } from 'hono'
import { upgradeWebSocket } from 'hono/cloudflare-workers'

const app = new Hono()

app.get(
  '/ws',
  upgradeWebSocket(() => {
    return {
      onMessage(event, ws) {
        console.log(`Message: ${event.data}`)
        ws.send('Hello from server!')
      },
      onClose: () => {
        console.log('Connection closed')
      },
      onError: (error) => {
        console.error('WebSocket error:', error)
      },
    }
  })
)
```

## Middleware Integration

```typescript
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'

// Global middleware
app.use('*', cors())
app.use('*', logger())

// Route-specific middleware
const protectedRoute = createRoute({
  method: 'get',
  path: '/protected',
  middleware: [authMiddleware, rateLimitMiddleware] as const,
  responses: {
    200: {
      description: 'Protected resource',
    },
  },
})
```

## Error Handling

```typescript
import { HTTPException } from 'hono/http-exception'

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse()
  }
  
  console.error(err)
  return c.json(
    { error: 'Internal server error' },
    500
  )
})
```

## Type-Safe Client (RPC Mode)

```typescript
// Server
export type AppType = typeof app

// Client
import { hc } from 'hono/client'
import type { AppType } from './server'

const client = hc<AppType>('http://localhost:3000')

// Type-safe requests
const res = await client.users[':id'].$get({
  param: { id: '123' }
})

if (res.ok) {
  const user = await res.json() // Typed!
}
```

## Advanced Features

### Request Validation Hooks
```typescript
app.openapi(route, async (c) => {
  // All validated data
  const params = c.req.valid('param')
  const query = c.req.valid('query')
  const body = c.req.valid('json')
  const headers = c.req.valid('header')
  
  // Process request...
})
```

### Custom Validation Errors
```typescript
const hook = createRoute({
  method: 'post',
  path: '/validate',
  request: {
    body: {
      content: {
        'application/json': {
          schema: SomeSchema,
        },
      },
    },
  },
  responses: {
    200: { description: 'Success' },
    400: { description: 'Validation error' },
  },
})

app.openapi(hook, async (c) => {
  try {
    const body = c.req.valid('json')
    // Process...
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        errors: error.issues
      }, 400)
    }
    throw error
  }
})
```

## Production Middleware Setup

### Rate Limiting with Redis
```typescript
import { Redis } from 'ioredis'
import { Context, Next } from 'hono'

const redis = new Redis(process.env.REDIS_URL!)

interface RateLimitOptions {
  windowMs: number
  max: number
  keyPrefix?: string
}

export const rateLimiter = (options: RateLimitOptions) => {
  return async (c: Context, next: Next) => {
    const identifier = c.req.header('x-forwarded-for') || 
                      c.req.header('x-real-ip') || 
                      'unknown'
    
    const key = `${options.keyPrefix || 'rate'}:${identifier}`
    const now = Date.now()
    const windowStart = now - options.windowMs
    
    // Remove old entries and count requests in window
    await redis.zremrangebyscore(key, 0, windowStart)
    const count = await redis.zcard(key)
    
    if (count >= options.max) {
      return c.json({ 
        error: 'Too many requests',
        retryAfter: options.windowMs / 1000 
      }, 429)
    }
    
    // Add current request
    await redis.zadd(key, now, `${now}-${Math.random()}`)
    await redis.expire(key, Math.ceil(options.windowMs / 1000))
    
    // Add rate limit headers
    c.header('X-RateLimit-Limit', options.max.toString())
    c.header('X-RateLimit-Remaining', (options.max - count - 1).toString())
    c.header('X-RateLimit-Reset', new Date(now + options.windowMs).toISOString())
    
    await next()
  }
}

// Usage
app.use('/api/*', rateLimiter({ 
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 
}))
```

### Authentication Middleware with JWT
```typescript
import { verify } from 'hono/jwt'
import { Context, Next } from 'hono'

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid authorization header' }, 401)
  }
  
  const token = authHeader.substring(7)
  
  try {
    const payload = await verify(token, process.env.JWT_SECRET!)
    c.set('userId', payload.sub as string)
    c.set('user', payload)
    await next()
  } catch (error) {
    return c.json({ error: 'Invalid or expired token' }, 401)
  }
}

// Protected route with auth
const protectedRoute = createRoute({
  method: 'get',
  path: '/api/profile',
  middleware: [authMiddleware] as const,
  responses: {
    200: {
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
      description: 'User profile',
    },
    401: {
      description: 'Unauthorized',
    },
  },
})

app.openapi(protectedRoute, async (c) => {
  const userId = c.get('userId')
  const user = await getUserById(userId)
  return c.json(user, 200)
})
```

### Request ID and Logging Middleware
```typescript
import { nanoid } from 'nanoid'
import pino from 'pino'

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' 
    ? { target: 'pino-pretty' }
    : undefined,
})

export const requestLogger = async (c: Context, next: Next) => {
  const requestId = c.req.header('X-Request-ID') || nanoid()
  c.set('requestId', requestId)
  c.header('X-Request-ID', requestId)
  
  const start = Date.now()
  const path = c.req.path
  const method = c.req.method
  
  logger.info({
    requestId,
    method,
    path,
    ip: c.req.header('x-forwarded-for'),
    userAgent: c.req.header('user-agent'),
  }, 'Request started')
  
  try {
    await next()
    
    const duration = Date.now() - start
    logger.info({
      requestId,
      method,
      path,
      status: c.res.status,
      duration,
    }, 'Request completed')
  } catch (error) {
    const duration = Date.now() - start
    logger.error({
      requestId,
      method,
      path,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration,
    }, 'Request failed')
    throw error
  }
}

app.use('*', requestLogger)
```

## File Upload with Validation

```typescript
import { z } from '@hono/zod-openapi'

// File upload schema
const FileUploadSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= 5 * 1024 * 1024,
    'File size must be less than 5MB'
  ).refine(
    (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
    'Only JPEG, PNG and WebP images are allowed'
  ),
  description: z.string().optional(),
})

const uploadRoute = createRoute({
  method: 'post',
  path: '/api/upload',
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: z.object({
            file: z.string().openapi({ type: 'string', format: 'binary' }),
            description: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            url: z.string(),
            size: z.number(),
            type: z.string(),
          }),
        },
      },
      description: 'File uploaded successfully',
    },
    400: {
      description: 'Invalid file',
    },
  },
})

app.openapi(uploadRoute, async (c) => {
  const formData = await c.req.formData()
  const file = formData.get('file') as File
  const description = formData.get('description') as string | null
  
  // Validate file
  try {
    FileUploadSchema.parse({ file, description })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ errors: error.issues }, 400)
    }
    throw error
  }
  
  // Process file upload (e.g., to S3)
  const buffer = await file.arrayBuffer()
  const url = await uploadToS3(Buffer.from(buffer), file.name, file.type)
  
  return c.json({
    url,
    size: file.size,
    type: file.type,
  }, 200)
})

// S3 upload helper
async function uploadToS3(buffer: Buffer, filename: string, contentType: string): Promise<string> {
  // Implementation using AWS SDK
  const key = `uploads/${Date.now()}-${filename}`
  // ... S3 upload logic
  return `https://your-bucket.s3.amazonaws.com/${key}`
}
```

## WebSocket with Authentication and Rooms

```typescript
import { upgradeWebSocket } from 'hono/cloudflare-workers'
import { verify } from 'hono/jwt'

interface WSClient {
  id: string
  userId: string
  rooms: Set<string>
}

const clients = new Map<WebSocket, WSClient>()
const rooms = new Map<string, Set<WebSocket>>()

app.get(
  '/ws',
  upgradeWebSocket(async (c) => {
    // Authenticate WebSocket connection
    const token = c.req.query('token')
    if (!token) {
      return c.text('Unauthorized', 401)
    }
    
    try {
      const payload = await verify(token, process.env.JWT_SECRET!)
      const userId = payload.sub as string
      
      return {
        onOpen(event, ws) {
          const client: WSClient = {
            id: nanoid(),
            userId,
            rooms: new Set(),
          }
          clients.set(ws, client)
          
          ws.send(JSON.stringify({
            type: 'connected',
            clientId: client.id,
          }))
        },
        
        onMessage(event, ws) {
          const client = clients.get(ws)
          if (!client) return
          
          try {
            const data = JSON.parse(event.data as string)
            
            switch (data.type) {
              case 'join':
                joinRoom(ws, client, data.room)
                break
              case 'leave':
                leaveRoom(ws, client, data.room)
                break
              case 'message':
                broadcastToRoom(data.room, {
                  type: 'message',
                  userId: client.userId,
                  message: data.message,
                  timestamp: Date.now(),
                }, ws)
                break
            }
          } catch (error) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Invalid message format',
            }))
          }
        },
        
        onClose(event, ws) {
          const client = clients.get(ws)
          if (client) {
            // Remove from all rooms
            client.rooms.forEach(room => {
              leaveRoom(ws, client, room)
            })
            clients.delete(ws)
          }
        },
        
        onError(error, ws) {
          console.error('WebSocket error:', error)
          ws.close(1011, 'Internal server error')
        },
      }
    } catch (error) {
      return c.text('Invalid token', 401)
    }
  })
)

function joinRoom(ws: WebSocket, client: WSClient, roomName: string) {
  client.rooms.add(roomName)
  
  if (!rooms.has(roomName)) {
    rooms.set(roomName, new Set())
  }
  rooms.get(roomName)!.add(ws)
  
  // Notify room members
  broadcastToRoom(roomName, {
    type: 'user_joined',
    userId: client.userId,
    timestamp: Date.now(),
  }, ws)
}

function leaveRoom(ws: WebSocket, client: WSClient, roomName: string) {
  client.rooms.delete(roomName)
  rooms.get(roomName)?.delete(ws)
  
  // Clean up empty rooms
  if (rooms.get(roomName)?.size === 0) {
    rooms.delete(roomName)
  }
  
  // Notify room members
  broadcastToRoom(roomName, {
    type: 'user_left',
    userId: client.userId,
    timestamp: Date.now(),
  }, ws)
}

function broadcastToRoom(roomName: string, message: any, exclude?: WebSocket) {
  const roomClients = rooms.get(roomName)
  if (!roomClients) return
  
  const payload = JSON.stringify(message)
  roomClients.forEach(client => {
    if (client !== exclude && client.readyState === WebSocket.OPEN) {
      client.send(payload)
    }
  })
}
```

## Testing Strategies

### Unit Testing with Vitest
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { OpenAPIHono } from '@hono/zod-openapi'
import { testClient } from 'hono/testing'

describe('User API', () => {
  let app: OpenAPIHono
  
  beforeAll(() => {
    app = createApp() // Your app factory
  })
  
  describe('GET /users/:id', () => {
    it('should return user when exists', async () => {
      const client = testClient(app)
      const res = await client.users[':id'].$get({
        param: { id: '123' }
      })
      
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data).toMatchObject({
        id: '123',
        name: expect.any(String),
        email: expect.any(String),
      })
    })
    
    it('should return 404 when user not found', async () => {
      const client = testClient(app)
      const res = await client.users[':id'].$get({
        param: { id: 'nonexistent' }
      })
      
      expect(res.status).toBe(404)
    })
  })
  
  describe('POST /users', () => {
    it('should create user with valid data', async () => {
      const client = testClient(app)
      const res = await client.users.$post({
        json: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'SecurePass123',
        }
      })
      
      expect(res.status).toBe(201)
      const data = await res.json()
      expect(data.email).toBe('test@example.com')
    })
    
    it('should validate request body', async () => {
      const client = testClient(app)
      const res = await client.users.$post({
        json: {
          name: '',
          email: 'invalid-email',
          password: '123',
        }
      })
      
      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.errors).toBeDefined()
    })
  })
})
```

### Integration Testing
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { Pool } from 'pg'

describe('API Integration Tests', () => {
  let server: Server
  let db: Pool
  
  beforeAll(async () => {
    // Setup test database
    db = new Pool({
      connectionString: process.env.TEST_DATABASE_URL,
    })
    
    // Run migrations
    await runMigrations(db)
    
    // Start server
    server = Bun.serve({
      port: 0, // Random port
      fetch: app.fetch,
    })
  })
  
  afterAll(async () => {
    await db.end()
    server.stop()
  })
  
  it('should create and retrieve user', async () => {
    const baseUrl = `http://localhost:${server.port}`
    
    // Create user
    const createRes = await fetch(`${baseUrl}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Integration Test',
        email: 'integration@test.com',
        password: 'TestPass123',
      }),
    })
    
    expect(createRes.status).toBe(201)
    const user = await createRes.json()
    
    // Retrieve user
    const getRes = await fetch(`${baseUrl}/api/users/${user.id}`)
    expect(getRes.status).toBe(200)
    
    const retrieved = await getRes.json()
    expect(retrieved.email).toBe('integration@test.com')
  })
})
```

## Performance Optimization

### Response Caching
```typescript
import { LRUCache } from 'lru-cache'

const cache = new LRUCache<string, any>({
  max: 500,
  ttl: 1000 * 60 * 5, // 5 minutes
})

export const cacheMiddleware = (options: { ttl?: number } = {}) => {
  return async (c: Context, next: Next) => {
    // Skip non-GET requests
    if (c.req.method !== 'GET') {
      return next()
    }
    
    const key = `${c.req.method}:${c.req.url}`
    const cached = cache.get(key)
    
    if (cached) {
      c.header('X-Cache', 'HIT')
      return c.json(cached.data, cached.status)
    }
    
    // Store original json method
    const originalJson = c.json.bind(c)
    
    // Override json to cache response
    c.json = (object: any, status?: number) => {
      cache.set(key, { data: object, status: status || 200 })
      c.header('X-Cache', 'MISS')
      return originalJson(object, status)
    }
    
    await next()
  }
}

// Use on specific routes
app.use('/api/products/*', cacheMiddleware({ ttl: 60000 }))
```

### Database Connection Pooling
```typescript
import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'

// Production pool configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

// Health check endpoint
app.get('/health', async (c) => {
  try {
    const client = await pool.connect()
    await client.query('SELECT 1')
    client.release()
    
    return c.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return c.json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 503)
  }
})
```

## Security Best Practices

### Input Sanitization
```typescript
import DOMPurify from 'isomorphic-dompurify'

const SanitizedStringSchema = z.string().transform((val) => 
  DOMPurify.sanitize(val, { ALLOWED_TAGS: [] })
)

const SecureUserSchema = z.object({
  name: SanitizedStringSchema.min(1).max(100),
  bio: SanitizedStringSchema.max(500).optional(),
  website: z.string().url().optional(),
})
```

### CORS Configuration
```typescript
import { cors } from 'hono/cors'

app.use('*', cors({
  origin: (origin) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []
    if (process.env.NODE_ENV === 'development') {
      return origin || '*'
    }
    return allowedOrigins.includes(origin) ? origin : null
  },
  credentials: true,
  allowHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  maxAge: 86400,
}))
```

### Security Headers
```typescript
import { secureHeaders } from 'hono/secure-headers'

app.use('*', secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
  },
  strictTransportSecurity: 'max-age=31536000; includeSubDomains',
  xContentTypeOptions: 'nosniff',
  xFrameOptions: 'DENY',
  xXssProtection: '1; mode=block',
}))
```

## Deployment Configuration

### Docker Setup
```dockerfile
FROM oven/bun:1.0-alpine

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production

# Copy source
COPY src ./src
COPY tsconfig.json ./

# Build if needed
RUN bun build ./src/index.ts --target=bun --outdir=./dist

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun run healthcheck || exit 1

# Run
EXPOSE 3000
CMD ["bun", "run", "dist/index.js"]
```

### Environment Configuration
```typescript
import { z } from 'zod'

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform(Number).default('3000'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(32),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  ALLOWED_ORIGINS: z.string().optional(),
})

export const env = EnvSchema.parse(process.env)

// Use in app
const app = new OpenAPIHono()
const port = env.PORT
```

## 2024-2025 Best Practices and Production Patterns

### 1. Core Development Principles
```typescript
// ✅ Always use operationId and tags for better SDK generation
const route = createRoute({
  operationId: 'createUser', // Required for client generation
  tags: ['Users'],           // Group endpoints logically
  summary: 'Create user',    // Brief description
  description: 'Creates a new user account with validation', // Detailed description
  // ... rest of config
})

// ✅ Use consistent error response schemas
const ErrorResponse = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.record(z.any()).optional(),
  timestamp: z.string().datetime().optional(),
}).openapi('ErrorResponse')

// ✅ Always specify explicit status codes
return c.json(data, 201) // Not just c.json(data)
```

### 2. Type Safety and Validation Best Practices
```typescript
// ✅ Use type-safe route handlers
type AppRouteHandler<T> = RouteHandler<T, any>

const handler: AppRouteHandler<typeof userRoute> = async (c) => {
  // Fully typed request/response
  const { id } = c.req.valid('param') // Type: { id: string }
  return c.json({ id, name: 'User' }, 200)
}

// ✅ Use schema transformations for coercion
const QuerySchema = z.object({
  page: z.string().pipe(z.coerce.number().int().min(1)).default('1'),
  limit: z.string().pipe(z.coerce.number().int().min(1).max(100)).default('20'),
})

// ✅ Use custom error hooks for consistent validation errors
const app = new OpenAPIHono({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        validationErrors: result.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
        timestamp: new Date().toISOString(),
      }, 422)
    }
  },
})
```

### 3. Security and Authentication Patterns
```typescript
// ✅ Register security schemes with detailed descriptions
app.openAPIRegistry.registerComponent('securitySchemes', 'Bearer', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'JWT Bearer token for user authentication'
})

// ✅ Use middleware patterns for route groups
app.use('/api/admin/*', adminAuthMiddleware)
app.use('/api/user/*', userAuthMiddleware)
app.use('/api/public/*', rateLimitMiddleware)

// ✅ Implement proper CORS for production
app.use('*', cors({
  origin: (origin) => {
    if (process.env.NODE_ENV === 'development') return origin || '*'
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []
    return allowedOrigins.includes(origin) ? origin : null
  },
  credentials: true,
  allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Request-ID'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}))
```

### 4. Error Handling and Monitoring
```typescript
// ✅ Implement structured logging with request correlation
import pino from 'pino'

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' 
    ? { target: 'pino-pretty' }
    : undefined,
})

const requestLogger = async (c: Context, next: Next) => {
  const requestId = c.req.header('X-Request-ID') || generateId()
  c.set('requestId', requestId)
  c.header('X-Request-ID', requestId)
  
  const start = Date.now()
  logger.info({ requestId, method: c.req.method, path: c.req.path }, 'Request started')
  
  try {
    await next()
    logger.info({ 
      requestId, 
      status: c.res.status, 
      duration: Date.now() - start 
    }, 'Request completed')
  } catch (error) {
    logger.error({ 
      requestId, 
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - start 
    }, 'Request failed')
    throw error
  }
}

// ✅ Global error handler with proper error responses
app.onError((err, c) => {
  const requestId = c.get('requestId')
  logger.error({ requestId, error: err.message, stack: err.stack }, 'Unhandled error')
  
  if (err instanceof HTTPException) {
    return err.getResponse()
  }
  
  return c.json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    requestId,
    timestamp: new Date().toISOString(),
  }, 500)
})
```

### 5. Performance and Scalability
```typescript
// ✅ Use connection pooling for databases
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// ✅ Implement response caching
const cache = new LRUCache<string, any>({
  max: 1000,
  ttl: 1000 * 60 * 5, // 5 minutes
})

const cacheMiddleware = (ttl = 300000) => async (c: Context, next: Next) => {
  if (c.req.method !== 'GET') return next()
  
  const key = `${c.req.method}:${c.req.url}`
  const cached = cache.get(key)
  
  if (cached) {
    c.header('X-Cache', 'HIT')
    return c.json(cached, 200)
  }
  
  await next()
  
  // Cache successful responses
  if (c.res.status === 200) {
    const body = await c.res.clone().json()
    cache.set(key, body)
    c.header('X-Cache', 'MISS')
  }
}

// ✅ Rate limiting with Redis
const rateLimiter = (options: { max: number, windowMs: number }) => {
  return async (c: Context, next: Next) => {
    const identifier = c.req.header('x-forwarded-for') || 'unknown'
    const key = `rate:${identifier}`
    
    const current = await redis.incr(key)
    if (current === 1) {
      await redis.expire(key, Math.ceil(options.windowMs / 1000))
    }
    
    if (current > options.max) {
      return c.json({ 
        error: 'Too many requests',
        retryAfter: options.windowMs / 1000 
      }, 429)
    }
    
    await next()
  }
}
```

### 6. Testing and Development
```typescript
// ✅ Use test client for integration tests
import { testClient } from 'hono/testing'

describe('User API', () => {
  const client = testClient(app)
  
  it('should create user', async () => {
    const res = await client.api.users.$post({
      json: { name: 'Test', email: 'test@example.com', password: 'password123' }
    })
    
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.email).toBe('test@example.com')
  })
})

// ✅ Use environment validation
import { z } from 'zod'

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  REDIS_URL: z.string().url().optional(),
})

export const env = EnvSchema.parse(process.env)
```

### 7. Production Deployment
```typescript
// ✅ Health check endpoint
app.get('/health', async (c) => {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    memory: process.memoryUsage(),
    uptime: process.uptime(),
  }
  
  const isHealthy = checks.database && checks.redis
  
  return c.json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    checks,
  }, isHealthy ? 200 : 503)
})

// ✅ Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully')
  
  // Close database connections
  await pool.end()
  
  // Close Redis connection
  await redis.quit()
  
  process.exit(0)
})
```

### 8. OpenAPI Documentation Best Practices
```typescript
// ✅ Comprehensive OpenAPI metadata
app.doc('/openapi.json', {
  openapi: '3.1.0',
  info: {
    version: '1.0.0',
    title: 'My API',
    description: 'Comprehensive API documentation with examples',
    contact: { name: 'API Support', email: 'support@example.com' },
    license: { name: 'MIT' },
  },
  servers: [
    { url: 'https://api.example.com', description: 'Production' },
    { url: 'https://staging.api.example.com', description: 'Staging' },
  ],
  tags: [
    { name: 'Users', description: 'User management operations' },
    { name: 'Auth', description: 'Authentication and authorization' },
  ],
})

// ✅ Use modern documentation UI
import { apiReference } from '@scalar/hono-api-reference'

app.get('/docs', apiReference({
  theme: 'purple',
  spec: { url: '/openapi.json' },
  metaData: {
    title: 'My API Documentation',
    description: 'Comprehensive API reference',
  },
}))
```

## Quick Reference Checklist

### Route Definition Checklist
- [ ] Use `operationId` for all routes
- [ ] Add `tags` for grouping
- [ ] Include `summary` and `description`
- [ ] Define all possible response status codes
- [ ] Use consistent error response schemas
- [ ] Add security requirements where needed
- [ ] Include examples in schemas

### Handler Implementation Checklist
- [ ] Use type-safe route handlers
- [ ] Validate all inputs with `c.req.valid()`
- [ ] Return explicit status codes
- [ ] Implement proper error handling
- [ ] Add request correlation IDs
- [ ] Log important operations

### Production Readiness Checklist
- [ ] Environment variable validation
- [ ] Database connection pooling
- [ ] Rate limiting implementation
- [ ] CORS configuration
- [ ] Security headers
- [ ] Health check endpoints
- [ ] Structured logging
- [ ] Graceful shutdown handling
- [ ] Comprehensive test coverage
- [ ] OpenAPI documentation with examples