# Zod - TypeScript-First Schema Validation

A TypeScript-first schema validation library with static type inference. Zod is designed to be as developer-friendly as possible with zero dependencies and a simple API.

## Advanced Schema Transformations

### Data Transformation and Coercion
```typescript
import { z } from 'zod';

// String to number coercion
const StringToNumber = z.string().transform((val) => parseInt(val, 10));
const CoercedNumber = z.coerce.number(); // Built-in coercion

// Date string to Date object
const DateStringSchema = z.string().datetime().transform((val) => new Date(val));

// Complex transformations
const UserInputSchema = z.object({
  name: z.string().transform((name) => name.trim().toLowerCase()),
  email: z.string().email().transform((email) => email.toLowerCase()),
  age: z.string().transform((age) => parseInt(age, 10)).pipe(z.number().min(18)),
  tags: z.string().transform((tags) => tags.split(',').map(tag => tag.trim())),
  metadata: z.string().transform((json) => {
    try {
      return JSON.parse(json);
    } catch {
      return {};
    }
  }),
});

// Conditional transformations
const ConditionalSchema = z.object({
  type: z.enum(['user', 'admin']),
  data: z.string().transform((data, ctx) => {
    if (ctx.data.type === 'admin') {
      try {
        return JSON.parse(data);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Admin data must be valid JSON',
        });
        return z.NEVER;
      }
    }
    return data;
  }),
});

// Chain transformations with validation
const ProcessedUserSchema = z.object({
  username: z.string()
    .min(3, 'Username too short')
    .transform(val => val.toLowerCase())
    .refine(val => !val.includes('admin'), 'Username cannot contain "admin"')
    .transform(val => `user_${val}`),
});
```

### Advanced Refinements and Custom Validation
```typescript
// Complex validation with multiple fields
const RegisterSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
  email: z.string().email(),
  username: z.string().min(3),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine(async (data) => {
  // Async validation
  const isEmailUnique = await checkEmailUnique(data.email);
  return isEmailUnique;
}, {
  message: "Email is already taken",
  path: ["email"],
}).refine((data) => {
  // Complex business logic
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(data.password);
  const hasNumber = /\d/.test(data.password);
  const hasUpper = /[A-Z]/.test(data.password);
  return hasSpecialChar && hasNumber && hasUpper;
}, {
  message: "Password must contain at least one special character, number, and uppercase letter",
  path: ["password"],
});

// Conditional validation based on other fields
const PaymentSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('credit_card'),
    cardNumber: z.string().regex(/^\d{16}$/, 'Invalid card number'),
    expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Invalid expiry date'),
    cvv: z.string().regex(/^\d{3,4}$/, 'Invalid CVV'),
  }),
  z.object({
    type: z.literal('paypal'),
    email: z.string().email(),
  }),
  z.object({
    type: z.literal('bank_transfer'),
    accountNumber: z.string().min(8).max(20),
    routingNumber: z.string().length(9),
  }),
]);

// Custom validation with context
const ProductSchema = z.object({
  name: z.string(),
  price: z.number().positive(),
  category: z.enum(['electronics', 'clothing', 'books']),
  weight: z.number().positive(),
}).refine((product, ctx) => {
  if (product.category === 'electronics' && product.weight > 50) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Electronics over 50kg require special handling',
      path: ['weight'],
    });
    return false;
  }
  return true;
});
```

### Dynamic Schema Generation
```typescript
// Schema factory for different user roles
function createUserSchema(role: 'admin' | 'user' | 'guest') {
  const baseSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
  });

  switch (role) {
    case 'admin':
      return baseSchema.extend({
        permissions: z.array(z.string()).min(1),
        canModifyUsers: z.boolean().default(true),
        accessLevel: z.number().min(1).max(10).default(10),
      });
    case 'user':
      return baseSchema.extend({
        preferences: z.object({
          theme: z.enum(['light', 'dark']).default('light'),
          notifications: z.boolean().default(true),
        }),
        subscriptionTier: z.enum(['free', 'premium']).default('free'),
      });
    case 'guest':
      return baseSchema.partial(); // All fields optional
  }
}

// Recursive schemas for nested data
const CategorySchema: z.ZodType<{
  id: string;
  name: string;
  children?: Category[];
}> = z.lazy(() => z.object({
  id: z.string(),
  name: z.string(),
  children: z.array(CategorySchema).optional(),
}));

type Category = z.infer<typeof CategorySchema>;

// Generic schema utilities
function createPaginatedSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    data: z.array(itemSchema),
    pagination: z.object({
      page: z.number().min(1),
      pageSize: z.number().min(1).max(100),
      total: z.number().nonnegative(),
      hasNext: z.boolean(),
    }),
  });
}

const PaginatedUsersSchema = createPaginatedSchema(UserSchema);

// Environment-specific schemas
function createConfigSchema(env: 'development' | 'production' | 'test') {
  const baseSchema = z.object({
    port: z.number().min(1).max(65535),
    host: z.string(),
  });

  if (env === 'development') {
    return baseSchema.extend({
      debug: z.boolean().default(true),
      hotReload: z.boolean().default(true),
    });
  }

  if (env === 'production') {
    return baseSchema.extend({
      ssl: z.object({
        cert: z.string(),
        key: z.string(),
      }),
      cluster: z.boolean().default(true),
    });
  }

  return baseSchema; // test environment
}
```

## Advanced Type Manipulation

### Complex Union and Intersection Types
```typescript
// Discriminated unions with transformation
const EventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('user_created'),
    data: z.object({
      userId: z.string(),
      email: z.string().email(),
      timestamp: z.date(),
    }),
  }),
  z.object({
    type: z.literal('order_placed'),
    data: z.object({
      orderId: z.string(),
      userId: z.string(),
      items: z.array(z.object({
        productId: z.string(),
        quantity: z.number().positive(),
        price: z.number().positive(),
      })),
      total: z.number().positive(),
    }),
  }),
  z.object({
    type: z.literal('payment_processed'),
    data: z.object({
      paymentId: z.string(),
      orderId: z.string(),
      amount: z.number().positive(),
      method: z.enum(['credit_card', 'paypal', 'bank_transfer']),
    }),
  }),
]);

// Conditional schema based on runtime values
const DynamicFormSchema = z.object({
  formType: z.enum(['contact', 'survey', 'registration']),
  fields: z.array(z.unknown()),
}).transform((data) => {
  switch (data.formType) {
    case 'contact':
      return {
        formType: data.formType,
        fields: z.array(z.object({
          type: z.enum(['text', 'email', 'textarea']),
          name: z.string(),
          label: z.string(),
          required: z.boolean().default(false),
        })).parse(data.fields),
      };
    case 'survey':
      return {
        formType: data.formType,
        fields: z.array(z.object({
          type: z.enum(['multiple_choice', 'rating', 'text']),
          question: z.string(),
          options: z.array(z.string()).optional(),
        })).parse(data.fields),
      };
    case 'registration':
      return {
        formType: data.formType,
        fields: z.array(z.object({
          type: z.enum(['text', 'email', 'password', 'checkbox']),
          name: z.string(),
          validation: z.object({
            required: z.boolean().default(false),
            minLength: z.number().optional(),
            pattern: z.string().optional(),
          }).optional(),
        })).parse(data.fields),
      };
  }
});

// Branded types for type safety
const UserId = z.string().uuid().brand('UserId');
const Email = z.string().email().brand('Email');
const Price = z.number().positive().brand('Price');

type UserId = z.infer<typeof UserId>;
type Email = z.infer<typeof Email>;
type Price = z.infer<typeof Price>;

// These types are incompatible even though they're both strings/numbers
const OrderSchema = z.object({
  id: z.string().uuid(),
  userId: UserId, // Only accepts branded UserId
  customerEmail: Email, // Only accepts branded Email
  total: Price, // Only accepts branded Price
});
```

## OpenAPI Integration

### Complete OpenAPI Schema Generation
```typescript
import { z } from 'zod';
import { createRoute, OpenAPIHono } from '@hono/zod-openapi';

// Rich schemas with OpenAPI metadata
const UserCreateSchema = z.object({
  name: z.string().min(1).max(100).openapi({
    description: 'User full name',
    example: 'John Doe',
  }),
  email: z.string().email().openapi({
    description: 'Valid email address',
    example: 'john@example.com',
  }),
  age: z.number().int().min(18).max(120).openapi({
    description: 'User age in years',
    example: 25,
  }),
  preferences: z.object({
    newsletter: z.boolean().default(false).openapi({
      description: 'Subscribe to newsletter',
    }),
    theme: z.enum(['light', 'dark']).default('light').openapi({
      description: 'UI theme preference',
    }),
  }).openapi({
    description: 'User preferences',
  }),
}).openapi({
  title: 'User Creation Request',
  description: 'Schema for creating a new user account',
});

const UserResponseSchema = UserCreateSchema.extend({
  id: z.string().uuid().openapi({
    description: 'Unique user identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  }),
  createdAt: z.string().datetime().openapi({
    description: 'Account creation timestamp',
    example: '2023-01-01T00:00:00Z',
  }),
  updatedAt: z.string().datetime().openapi({
    description: 'Last update timestamp',
    example: '2023-01-01T00:00:00Z',
  }),
}).openapi({
  title: 'User Response',
  description: 'Complete user information',
});

// Error response schemas
const ValidationErrorSchema = z.object({
  error: z.literal('validation_failed'),
  message: z.string(),
  details: z.array(z.object({
    path: z.array(z.string()),
    message: z.string(),
    code: z.string(),
  })),
}).openapi({
  title: 'Validation Error',
  description: 'Response when request validation fails',
});

const NotFoundErrorSchema = z.object({
  error: z.literal('not_found'),
  message: z.string().default('Resource not found'),
}).openapi({
  title: 'Not Found Error',
});

// Complete route with all possible responses
const createUserRoute = createRoute({
  method: 'post',
  path: '/users',
  tags: ['Users'],
  summary: 'Create a new user',
  description: 'Creates a new user account with the provided information',
  request: {
    body: {
      content: {
        'application/json': {
          schema: UserCreateSchema,
        },
      },
      description: 'User information',
      required: true,
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: UserResponseSchema,
        },
      },
      description: 'User created successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: ValidationErrorSchema,
        },
      },
      description: 'Invalid request data',
    },
    409: {
      content: {
        'application/json': {
          schema: z.object({
            error: z.literal('conflict'),
            message: z.string(),
          }),
        },
      },
      description: 'Email already exists',
    },
  },
});
```

## Performance Optimization

### Efficient Parsing and Caching
```typescript
import { z } from 'zod';

// Pre-compiled schemas for better performance
class SchemaCache {
  private cache = new Map<string, z.ZodSchema>();

  getSchema(key: string, factory: () => z.ZodSchema): z.ZodSchema {
    if (!this.cache.has(key)) {
      this.cache.set(key, factory());
    }
    return this.cache.get(key)!;
  }

  clear() {
    this.cache.clear();
  }
}

const schemaCache = new SchemaCache();

// Reusable schema factory
export const getUserSchema = () => schemaCache.getSchema('user', () => 
  z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(100),
    email: z.string().email(),
    preferences: z.object({
      theme: z.enum(['light', 'dark']),
      notifications: z.boolean(),
    }).default({ theme: 'light', notifications: true }),
  })
);

// Streaming validation for large datasets
async function* validateStreamingData<T>(
  schema: z.ZodSchema<T>,
  dataStream: AsyncIterable<unknown>
): AsyncGenerator<T, void, unknown> {
  for await (const item of dataStream) {
    try {
      yield schema.parse(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error(`Validation failed for item:`, error.errors);
        continue;
      }
      throw error;
    }
  }
}

// Batch validation with error collection
function validateBatch<T>(
  schema: z.ZodSchema<T>,
  items: unknown[]
): { valid: T[]; errors: { index: number; error: z.ZodError }[] } {
  const valid: T[] = [];
  const errors: { index: number; error: z.ZodError }[] = [];

  items.forEach((item, index) => {
    const result = schema.safeParse(item);
    if (result.success) {
      valid.push(result.data);
    } else {
      errors.push({ index, error: result.error });
    }
  });

  return { valid, errors };
}

// Partial validation for performance
const PartialUpdateSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  preferences: z.object({
    theme: z.enum(['light', 'dark']),
    notifications: z.boolean(),
  }),
}).partial(); // All fields optional

// Deep partial for nested objects
function createDeepPartial<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  const shape = schema.shape;
  const partialShape: { [K in keyof T]: z.ZodOptional<T[K]> } = {} as any;
  
  for (const key in shape) {
    const field = shape[key];
    if (field instanceof z.ZodObject) {
      partialShape[key] = createDeepPartial(field).optional() as any;
    } else {
      partialShape[key] = field.optional() as any;
    }
  }
  
  return z.object(partialShape);
}
```

## Production Error Handling

### Comprehensive Error Management
```typescript
import { z } from 'zod';

// Custom error types
class ValidationError extends Error {
  constructor(
    public zodError: z.ZodError,
    message = 'Validation failed'
  ) {
    super(message);
    this.name = 'ValidationError';
  }

  toJSON() {
    return {
      error: 'validation_failed',
      message: this.message,
      details: this.zodError.errors.map(error => ({
        path: error.path.join('.'),
        message: error.message,
        code: error.code,
      })),
    };
  }
}

// Safe parsing with detailed error handling
function safeParseWithLogging<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: string
): { success: true; data: T } | { success: false; error: ValidationError } {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const error = new ValidationError(result.error);
    
    if (context) {
      console.error(`Validation failed in ${context}:`, error.toJSON());
    }
    
    return { success: false, error };
  }
  
  return { success: true, data: result.data };
}

// Error boundary for schema validation
export class SchemaValidator<T> {
  constructor(
    private schema: z.ZodSchema<T>,
    private options: {
      logErrors?: boolean;
      throwOnError?: boolean;
      context?: string;
    } = {}
  ) {}

  validate(data: unknown): T {
    const result = safeParseWithLogging(
      this.schema,
      data,
      this.options.context
    );

    if (!result.success) {
      if (this.options.throwOnError) {
        throw result.error;
      }
      
      if (this.options.logErrors) {
        console.error('Validation failed:', result.error.toJSON());
      }
      
      throw result.error;
    }

    return result.data;
  }

  safeValidate(data: unknown): { success: true; data: T } | { success: false; error: ValidationError } {
    return safeParseWithLogging(this.schema, data, this.options.context);
  }
}

// Usage
const userValidator = new SchemaValidator(UserSchema, {
  logErrors: true,
  context: 'User Registration',
});

// Middleware integration
export const validateMiddleware = <T>(
  schema: z.ZodSchema<T>,
  target: 'body' | 'query' | 'params' = 'body'
) => {
  return async (c: Context, next: Next) => {
    const validator = new SchemaValidator(schema, {
      logErrors: true,
      context: `${c.req.method} ${c.req.path}`,
    });

    try {
      const data = target === 'body' ? await c.req.json() : 
                  target === 'query' ? c.req.query() : 
                  c.req.param();
                  
      c.set('validated', validator.validate(data));
      await next();
    } catch (error) {
      if (error instanceof ValidationError) {
        return c.json(error.toJSON(), 400);
      }
      throw error;
    }
  };
};
```

## Testing Schemas

### Comprehensive Testing Patterns
```typescript
import { describe, it, expect } from 'vitest';
import { z } from 'zod';

describe('UserSchema', () => {
  const UserSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    age: z.number().min(18),
  });

  describe('valid data', () => {
    it('should parse valid user data', () => {
      const validUser = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
      };

      const result = UserSchema.parse(validUser);
      expect(result).toEqual(validUser);
    });

    it('should infer correct TypeScript types', () => {
      type User = z.infer<typeof UserSchema>;
      
      const user: User = {
        name: 'John',
        email: 'john@example.com',
        age: 25,
      };

      expect(UserSchema.parse(user)).toEqual(user);
    });
  });

  describe('invalid data', () => {
    it('should reject invalid email', () => {
      const invalidUser = {
        name: 'John Doe',
        email: 'invalid-email',
        age: 25,
      };

      expect(() => UserSchema.parse(invalidUser)).toThrow();
      
      const result = UserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors).toContainEqual(
          expect.objectContaining({
            path: ['email'],
            code: 'invalid_string',
          })
        );
      }
    });

    it('should reject underage users', () => {
      const underageUser = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 17,
      };

      const result = UserSchema.safeParse(underageUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors).toContainEqual(
          expect.objectContaining({
            path: ['age'],
            code: 'too_small',
          })
        );
      }
    });
  });

  describe('transformations', () => {
    const TransformSchema = z.object({
      name: z.string().transform(name => name.trim().toLowerCase()),
      email: z.string().email().transform(email => email.toLowerCase()),
    });

    it('should apply transformations correctly', () => {
      const input = {
        name: '  JOHN DOE  ',
        email: 'JOHN@EXAMPLE.COM',
      };

      const result = TransformSchema.parse(input);
      
      expect(result).toEqual({
        name: 'john doe',
        email: 'john@example.com',
      });
    });
  });
});

// Property-based testing
import fc from 'fast-check';

describe('Schema properties', () => {
  it('should maintain data integrity through parse/stringify cycle', () => {
    fc.assert(fc.property(
      fc.record({
        name: fc.string({ minLength: 1 }),
        email: fc.emailAddress(),
        age: fc.integer({ min: 18, max: 100 }),
      }),
      (data) => {
        const parsed = UserSchema.parse(data);
        const stringified = JSON.stringify(parsed);
        const reparsed = UserSchema.parse(JSON.parse(stringified));
        
        expect(reparsed).toEqual(parsed);
      }
    ));
  });
});
```

## Core Concepts and Philosophy

- **TypeScript-first**: Infer types from schemas automatically
- **Zero dependencies**: Lightweight and self-contained
- **Developer experience**: Comprehensive error messages and great IDE support  
- **Runtime safety**: Validate data at runtime with full type safety
- **Immutable**: Schemas are immutable by default
- **Composable**: Build complex schemas from simple primitives

## Installation and Setup

### Basic Installation

```bash
npm install zod
```

### Basic Usage

```typescript
import { z } from 'zod';

// Define a schema
const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

// Infer TypeScript type
type User = z.infer<typeof UserSchema>;

// Parse and validate data
const userData = {
  id: 1,
  name: "John Doe",
  email: "john@example.com"
};

const user = UserSchema.parse(userData); // throws if invalid
// or
const result = UserSchema.safeParse(userData); // returns success/error object
```

## Key API Methods and Patterns

### Primitive Types

```typescript
import { z } from 'zod';

// String validations
const name = z.string();
const email = z.string().email();
const url = z.string().url();
const uuid = z.string().uuid();
const cuid = z.string().cuid();
const regex = z.string().regex(/pattern/);
const minMax = z.string().min(3).max(50);
const nonempty = z.string().nonempty(); // deprecated, use min(1)
const trim = z.string().trim();
const datetime = z.string().datetime();
const ip = z.string().ip(); // v4 and v6

// Number validations
const age = z.number();
const positive = z.number().positive();
const negative = z.number().negative();
const nonpositive = z.number().nonpositive();
const nonnegative = z.number().nonnegative();
const int = z.number().int();
const range = z.number().min(0).max(100);
const finite = z.number().finite();
const safe = z.number().safe(); // within Number.MAX_SAFE_INTEGER

// Boolean
const isActive = z.boolean();

// Date
const createdAt = z.date();
const futureDate = z.date().min(new Date());
const pastDate = z.date().max(new Date());

// BigInt
const bigNumber = z.bigint();

// Literal values
const role = z.literal('admin');
const status = z.enum(['pending', 'approved', 'rejected']);

// Null and undefined
const nullable = z.string().nullable(); // string | null
const optional = z.string().optional(); // string | undefined
const nullish = z.string().nullish();   // string | null | undefined
```

### Object Schemas

```typescript
// Basic object
const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  age: z.number().optional(),
  isActive: z.boolean().default(true),
});

// Nested objects
const AddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
});

const UserWithAddressSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  address: AddressSchema,
});

// Object methods
const baseUser = z.object({
  name: z.string(),
  email: z.string().email(),
});

const extendedUser = baseUser.extend({
  id: z.number(),
  createdAt: z.date(),
});

const partialUser = baseUser.partial(); // all fields optional
const requiredUser = baseUser.required(); // all fields required
const pickedUser = baseUser.pick({ name: true }); // only name field
const omittedUser = baseUser.omit({ email: true }); // exclude email field

// Merge objects
const timestamps = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
});

const userWithTimestamps = baseUser.merge(timestamps);

// Strict mode (no unknown keys)
const strictUser = z.object({
  name: z.string(),
  email: z.string(),
}).strict();

// Passthrough mode (allow unknown keys)
const passthroughUser = z.object({
  name: z.string(),
  email: z.string(),
}).passthrough();

// Strip unknown keys (default behavior)
const stripUser = z.object({
  name: z.string(),
  email: z.string(),
}).strip();
```

### Array Schemas

```typescript
// Basic arrays
const numbers = z.array(z.number());
const strings = z.array(z.string());

// Array constraints
const limitedArray = z.array(z.string()).min(1).max(10);
const nonEmptyArray = z.array(z.string()).nonempty();

// Array of objects
const usersArray = z.array(UserSchema);

// Tuple (fixed-length array with specific types)
const coordinates = z.tuple([z.number(), z.number()]);
const namedTuple = z.tuple([z.string(), z.number()]).rest(z.string());

// Array methods
type User = z.infer<typeof UserSchema>;
const users: User[] = usersArray.parse(userData);

// Transform arrays
const csvToArray = z.string().transform((str) => str.split(','));
```

### Union and Intersection Types

```typescript
// Union types (OR)
const stringOrNumber = z.union([z.string(), z.number()]);
const status = z.union([
  z.literal('loading'),
  z.literal('success'),
  z.literal('error'),
]);

// Discriminated unions
const eventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('click'),
    element: z.string(),
    coordinates: z.object({ x: z.number(), y: z.number() }),
  }),
  z.object({
    type: z.literal('keypress'),
    key: z.string(),
    modifiers: z.array(z.string()),
  }),
]);

// Intersection types (AND)
const nameAndEmail = z.intersection(
  z.object({ name: z.string() }),
  z.object({ email: z.string() })
);

// Record type (key-value pairs)
const stringRecord = z.record(z.string());
const userRecord = z.record(UserSchema);
const typedRecord = z.record(z.enum(['en', 'es', 'fr']), z.string());
```

### Advanced Patterns

**Recursive Types**
```typescript
interface Category {
  name: string;
  subcategories: Category[];
}

const CategorySchema: z.ZodType<Category> = z.lazy(() =>
  z.object({
    name: z.string(),
    subcategories: z.array(CategorySchema),
  })
);
```

**Conditional Logic**
```typescript
const userSchema = z.object({
  type: z.enum(['user', 'admin']),
  name: z.string(),
  email: z.string().email(),
  permissions: z.array(z.string()).optional(),
}).refine((data) => {
  // Admins must have permissions
  if (data.type === 'admin' && !data.permissions) {
    return false;
  }
  return true;
}, {
  message: 'Admin users must have permissions',
  path: ['permissions'],
});
```

**Custom Transformations**
```typescript
const dateFromString = z.string().transform((str) => new Date(str));
const numberFromString = z.string().transform((str) => parseInt(str, 10));

const userInputSchema = z.object({
  age: z.string().transform((val) => parseInt(val, 10)),
  birthDate: z.string().transform((val) => new Date(val)),
  tags: z.string().transform((val) => val.split(',')),
});

// Use preprocess for input transformation
const trimmedString = z.preprocess(
  (input) => typeof input === 'string' ? input.trim() : input,
  z.string().min(1)
);
```

## TypeScript Usage Examples

### Type Inference and Safety

```typescript
import { z } from 'zod';

// Define schema
const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    users: z.array(z.object({
      id: z.number(),
      name: z.string(),
      email: z.string().email(),
      role: z.enum(['user', 'admin', 'moderator']),
    })),
    total: z.number(),
    page: z.number(),
  }),
  errors: z.array(z.string()).optional(),
});

// Infer TypeScript types
type ApiResponse = z.infer<typeof ApiResponseSchema>;
type User = z.infer<typeof ApiResponseSchema>['data']['users'][0];

// Type-safe API call
async function fetchUsers(page: number): Promise<ApiResponse> {
  const response = await fetch(`/api/users?page=${page}`);
  const data = await response.json();
  
  // Runtime validation with type safety
  return ApiResponseSchema.parse(data);
}

// Usage with error handling
async function handleUserFetch() {
  try {
    const result = await fetchUsers(1);
    // result is fully typed as ApiResponse
    console.log(result.data.users); // TypeScript knows this structure
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation failed:', error.errors);
    } else {
      console.error('Network error:', error);
    }
  }
}
```

### Generic Schema Patterns

```typescript
// Generic pagination schema
function createPaginatedSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  });
}

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

const PaginatedUsersSchema = createPaginatedSchema(UserSchema);
type PaginatedUsers = z.infer<typeof PaginatedUsersSchema>;

// Generic API response wrapper
function createApiResponseSchema<T extends z.ZodType>(dataSchema: T) {
  return z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    timestamp: z.date().default(() => new Date()),
  });
}

const UserApiResponse = createApiResponseSchema(UserSchema);
const UsersListApiResponse = createApiResponseSchema(z.array(UserSchema));
```

### Form Validation with TypeScript

```typescript
import { z } from 'zod';

// Registration form schema
const RegisterSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  dateOfBirth: z.date().max(new Date(), 'Birth date cannot be in the future'),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof RegisterSchema>;

// Form validation function
function validateRegistrationData(formData: unknown): RegisterFormData {
  return RegisterSchema.parse(formData);
}

// Safe validation with error handling
function safeValidateRegistration(formData: unknown) {
  const result = RegisterSchema.safeParse(formData);
  
  if (!result.success) {
    // Type-safe error handling
    const errors: Record<string, string[]> = {};
    
    result.error.errors.forEach((error) => {
      const path = error.path.join('.');
      if (!errors[path]) {
        errors[path] = [];
      }
      errors[path].push(error.message);
    });
    
    return { success: false, errors };
  }
  
  return { success: true, data: result.data };
}
```

## Best Practices and Common Patterns

### Error Handling Patterns

```typescript
import { z } from 'zod';

// Custom error handling
class ValidationError extends Error {
  constructor(public issues: z.ZodIssue[]) {
    super('Validation failed');
    this.name = 'ValidationError';
  }
}

function parseWithCustomError<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(result.error.issues);
  }
  return result.data;
}

// Error formatting utilities
function formatZodError(error: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};
  
  error.errors.forEach((issue) => {
    const path = issue.path.join('.');
    formatted[path] = issue.message;
  });
  
  return formatted;
}

function getFirstError(error: z.ZodError): string | null {
  return error.errors[0]?.message || null;
}

// Usage in API endpoints
async function createUser(req: Request) {
  try {
    const userData = UserSchema.parse(req.body);
    const user = await db.users.create(userData);
    return { success: true, user };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: formatZodError(error),
      };
    }
    throw error;
  }
}
```

### Schema Composition and Reusability

```typescript
// Base schemas for reuse
const BaseTimestamps = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
});

const BaseId = z.object({
  id: z.string().uuid(),
});

// Composable user schema
const BaseUser = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

// Different user variants
const CreateUserSchema = BaseUser; // for creation
const UserSchema = BaseUser.merge(BaseId).merge(BaseTimestamps); // full user
const UpdateUserSchema = BaseUser.partial(); // for updates
const PublicUserSchema = BaseUser.merge(BaseId.pick({ id: true })); // public view

// Database model schemas
const UserTableSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
}).transform((data) => ({
  id: data.id,
  name: data.name,
  email: data.email,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
}));

// API endpoint schemas
const GetUsersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  role: z.enum(['user', 'admin']).optional(),
});

type GetUsersQuery = z.infer<typeof GetUsersQuerySchema>;
```

### Environment and Configuration Validation

```typescript
// Environment variables schema
const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  
  // Optional environment variables
  REDIS_URL: z.string().url().optional(),
  SENTRY_DSN: z.string().url().optional(),
  
  // Feature flags
  ENABLE_ANALYTICS: z.coerce.boolean().default(false),
  DEBUG: z.coerce.boolean().default(false),
  
  // API keys (ensure they exist in production)
  STRIPE_SECRET_KEY: z.string().min(1),
  SENDGRID_API_KEY: z.string().min(1),
}).refine((data) => {
  // Additional validation for production
  if (data.NODE_ENV === 'production') {
    return data.JWT_SECRET.length >= 64;
  }
  return true;
}, {
  message: 'JWT_SECRET must be at least 64 characters in production',
  path: ['JWT_SECRET'],
});

// Parse and validate environment
const env = EnvSchema.parse(process.env);

// Export typed environment
export { env };

// Configuration schema
const ConfigSchema = z.object({
  server: z.object({
    port: z.number(),
    host: z.string().default('localhost'),
    cors: z.object({
      origin: z.union([z.string(), z.array(z.string())]),
      credentials: z.boolean().default(true),
    }),
  }),
  database: z.object({
    url: z.string(),
    maxConnections: z.number().default(10),
    ssl: z.boolean().default(false),
  }),
  cache: z.object({
    provider: z.enum(['memory', 'redis']),
    ttl: z.number().default(3600),
  }),
});

type Config = z.infer<typeof ConfigSchema>;
```

## Integration with Other Tools

### React Hook Form Integration

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginForm) => {
    // data is fully typed and validated
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} type="email" />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input {...register('password')} type="password" />
      {errors.password && <span>{errors.password.message}</span>}
      
      <button type="submit">Login</button>
    </form>
  );
}
```

### Next.js API Routes Integration

```typescript
// app/api/users/route.ts (App Router)
import { NextRequest } from 'next/server';
import { z } from 'zod';

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['user', 'admin']).default('user'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userData = CreateUserSchema.parse(body);
    
    const user = await createUser(userData);
    return Response.json({ success: true, user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { success: false, errors: error.errors },
        { status: 400 }
      );
    }
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Middleware for request validation
function withValidation<T>(schema: z.ZodSchema<T>) {
  return (handler: (data: T, request: NextRequest) => Promise<Response>) => {
    return async (request: NextRequest) => {
      try {
        const body = await request.json();
        const data = schema.parse(body);
        return handler(data, request);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return Response.json(
            { errors: error.errors },
            { status: 400 }
          );
        }
        throw error;
      }
    };
  };
}

// Usage
export const POST = withValidation(CreateUserSchema)(async (userData) => {
  const user = await createUser(userData);
  return Response.json(user);
});
```

### Database Integration (Drizzle ORM)

```typescript
import { z } from 'zod';
import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';

// Database schema
export const users = pgTable('users', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Zod schemas for validation
export const insertUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
});

export const selectUserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  createdAt: z.date(),
});

export const updateUserSchema = insertUserSchema.partial();

// Type inference
export type InsertUser = z.infer<typeof insertUserSchema>;
export type SelectUser = z.infer<typeof selectUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

// Repository with validation
export class UserRepository {
  async create(data: unknown): Promise<SelectUser> {
    const validatedData = insertUserSchema.parse(data);
    const [user] = await db.insert(users).values(validatedData).returning();
    return selectUserSchema.parse(user);
  }

  async update(id: number, data: unknown): Promise<SelectUser> {
    const validatedData = updateUserSchema.parse(data);
    const [user] = await db
      .update(users)
      .set(validatedData)
      .where(eq(users.id, id))
      .returning();
    return selectUserSchema.parse(user);
  }
}
```

### OpenAPI/Swagger Integration

```typescript
import { z } from 'zod';
import { generateSchema } from '@anatine/zod-openapi';

const UserSchema = z.object({
  id: z.number().describe('The unique identifier for the user'),
  name: z.string().min(1).describe('The user\'s full name'),
  email: z.string().email().describe('The user\'s email address'),
  role: z.enum(['user', 'admin']).describe('The user\'s role in the system'),
  createdAt: z.date().describe('When the user account was created'),
});

// Generate OpenAPI schema
const openApiSchema = generateSchema(UserSchema);

// Use in API documentation
const apiSpec = {
  openapi: '3.0.0',
  info: { title: 'User API', version: '1.0.0' },
  components: {
    schemas: {
      User: openApiSchema,
    },
  },
  paths: {
    '/users': {
      get: {
        responses: {
          '200': {
            description: 'List of users',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/User' },
                },
              },
            },
          },
        },
      },
    },
  },
};
```

Zod provides a robust, TypeScript-first approach to runtime validation that seamlessly integrates with modern web development workflows. Its type inference capabilities and comprehensive validation features make it essential for building type-safe applications in 2025.