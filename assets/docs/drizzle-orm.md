# Drizzle ORM - PostgreSQL TypeScript ORM

A lightweight and performant TypeScript ORM with developer experience in mind. Drizzle is the only ORM with both relational and SQL-like query APIs, providing the best of both worlds for accessing relational data.

## Core Concepts and Philosophy

- **TypeScript-first**: Built with TypeScript from the ground up with excellent type safety
- **SQL-like**: Familiar SQL syntax with TypeScript benefits
- **Zero runtime overhead**: Compiled queries with no performance penalties
- **Database agnostic**: Supports PostgreSQL, MySQL, SQLite, and serverless databases
- **Developer experience**: Powerful migration tools, introspection, and Studio GUI

## Installation and Setup

### Basic Installation

```bash
npm install drizzle-orm
npm install drizzle-kit -D
npm install pg @types/pg  # PostgreSQL driver
```

### Configuration (drizzle.config.ts)

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "./migrations",
  dbCredentials: {
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT!),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    ssl: process.env.NODE_ENV === "production",
  },
});
```

### Database Connection

```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
```

## Key API Methods and Patterns

### Schema Definition (2025 Standards)

**Modern Identity Columns (Recommended)**
```typescript
import { pgTable, integer, text, timestamp, varchar, serial } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Modern approach using identity columns
export const users = pgTable('users', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  name: text('name').notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const posts = pgTable('posts', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  title: text('title').notNull(),
  content: text('content'),
  authorId: integer('author_id').references(() => users.id),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
}));
```

### Query Operations

**Select Operations**
```typescript
import { eq, gt, and, or, desc, asc } from 'drizzle-orm';

// Basic select
const allUsers = await db.select().from(users);

// Select with conditions
const activeUsers = await db
  .select()
  .from(users)
  .where(eq(users.isActive, true));

// Complex conditions
const filteredUsers = await db
  .select()
  .from(users)
  .where(
    and(
      gt(users.createdAt, new Date('2024-01-01')),
      or(
        eq(users.role, 'admin'),
        eq(users.role, 'moderator')
      )
    )
  )
  .orderBy(desc(users.createdAt));

// Select specific fields
const userNames = await db
  .select({ id: users.id, name: users.name })
  .from(users);
```

**Joins and Relations**
```typescript
// Using query API with joins
const usersWithPosts = await db
  .select()
  .from(users)
  .leftJoin(posts, eq(users.id, posts.authorId));

// Using relational queries (recommended)
const usersWithPostsRelational = await db.query.users.findMany({
  with: {
    posts: true,
  },
});

// Complex relational query
const userWithRecentPosts = await db.query.users.findFirst({
  where: eq(users.id, userId),
  with: {
    posts: {
      where: gt(posts.publishedAt, new Date('2024-01-01')),
      orderBy: [desc(posts.publishedAt)],
      limit: 10,
    },
  },
});
```

**Insert Operations**
```typescript
// Single insert
const newUser = await db.insert(users).values({
  name: "John Doe",
  email: "john@example.com",
}).returning();

// Bulk insert
await db.insert(users).values([
  { name: "Alice", email: "alice@example.com" },
  { name: "Bob", email: "bob@example.com" },
]);

// Insert with conflict handling
await db.insert(users)
  .values({ name: "Jane", email: "jane@example.com" })
  .onConflictDoUpdate({
    target: users.email,
    set: { name: sql`excluded.name`, updatedAt: new Date() }
  });
```

**Update and Delete Operations**
```typescript
// Update
await db.update(users)
  .set({ name: "Updated Name", updatedAt: new Date() })
  .where(eq(users.id, userId));

// Delete
await db.delete(users).where(eq(users.id, userId));

// Batch operations
await db.update(users)
  .set({ isActive: false })
  .where(gt(users.lastLoginAt, new Date('2023-01-01')));
```

## TypeScript Usage Examples

### Type-Safe Queries

```typescript
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// Infer types from schema
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

// Use in functions
async function createUser(userData: NewUser): Promise<User> {
  const [user] = await db.insert(users).values(userData).returning();
  return user;
}

async function getUserById(id: number): Promise<User | undefined> {
  return await db.query.users.findFirst({
    where: eq(users.id, id),
  });
}
```

### Advanced TypeScript Patterns

```typescript
// Custom query builder
function buildUserQuery(filters: {
  role?: string;
  isActive?: boolean;
  createdAfter?: Date;
}) {
  const conditions = [];
  
  if (filters.role) {
    conditions.push(eq(users.role, filters.role));
  }
  
  if (filters.isActive !== undefined) {
    conditions.push(eq(users.isActive, filters.isActive));
  }
  
  if (filters.createdAfter) {
    conditions.push(gt(users.createdAt, filters.createdAfter));
  }

  return db
    .select()
    .from(users)
    .where(conditions.length > 0 ? and(...conditions) : undefined);
}

// Generic repository pattern
class Repository<T extends PgTableWithColumns<any>> {
  constructor(private table: T) {}

  async findById(id: number) {
    return await this.db.select().from(this.table).where(eq(this.table.id, id));
  }

  async create(data: InferInsertModel<T>) {
    return await this.db.insert(this.table).values(data).returning();
  }
}
```

## Best Practices and Common Patterns

### Migration Patterns

```typescript
// Generate migration
// npm run drizzle-kit generate

// Apply migrations
// npm run drizzle-kit migrate

// Custom migration with seed data
import { sql } from 'drizzle-orm';

export async function up(db: any) {
  // Schema changes
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);
  
  // Seed data
  await db.insert(users).values([
    { name: 'Admin', email: 'admin@example.com', role: 'admin' },
  ]);
}
```

### Connection Pooling and Performance

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

// Optimized connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Connection with prepared statements
export const db = drizzle(pool, {
  schema,
  logger: process.env.NODE_ENV === 'development',
});

// Prepared statements for performance
const getUserByEmail = db
  .select()
  .from(users)
  .where(eq(users.email, placeholder('email')))
  .prepare();

const user = await getUserByEmail.execute({ email: 'john@example.com' });
```

### Transaction Patterns

```typescript
// Basic transaction
await db.transaction(async (tx) => {
  const user = await tx.insert(users).values(userData).returning();
  await tx.insert(posts).values({
    authorId: user[0].id,
    title: "First Post",
    content: "Welcome post"
  });
});

// Transaction with rollback
await db.transaction(async (tx) => {
  try {
    await tx.update(accounts).set({ balance: balance - amount }).where(eq(accounts.id, fromId));
    await tx.update(accounts).set({ balance: balance + amount }).where(eq(accounts.id, toId));
  } catch (error) {
    tx.rollback();
    throw error;
  }
});
```

## Integration with Other Tools

### With Next.js App Router

```typescript
// app/lib/db.ts
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import * as schema from './schema';

export const db = drizzle(sql, { schema });

// app/api/users/route.ts
import { db } from '@/lib/db';
import { users } from '@/lib/schema';

export async function GET() {
  const allUsers = await db.select().from(users);
  return Response.json(allUsers);
}
```

### With tRPC

```typescript
// server/routers/users.ts
import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { db } from '../db';
import { users } from '../schema';

export const usersRouter = router({
  getAll: publicProcedure.query(async () => {
    return await db.select().from(users);
  }),
  
  create: publicProcedure
    .input(z.object({
      name: z.string(),
      email: z.string().email(),
    }))
    .mutation(async ({ input }) => {
      return await db.insert(users).values(input).returning();
    }),
});
```

### Environment-Specific Configurations

```typescript
// Development with local PostgreSQL
const devConfig = {
  host: 'localhost',
  port: 5432,
  user: 'dev_user',
  password: 'dev_password',
  database: 'dev_db',
};

// Production with connection pooling
const prodConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
};

export const db = drizzle(
  new Pool(process.env.NODE_ENV === 'production' ? prodConfig : devConfig),
  { schema }
);
```

## Production Connection Pooling

### Advanced Pool Configuration
```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { logger } from './logger';

// Production-ready connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Pool sizing
  max: process.env.DB_POOL_SIZE ? parseInt(process.env.DB_POOL_SIZE) : 20,
  min: process.env.DB_POOL_MIN ? parseInt(process.env.DB_POOL_MIN) : 2,
  // Connection lifecycle
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 2000, // Fail fast on connection
  // Query timeout
  statement_timeout: 30000, // 30s query timeout
  query_timeout: 30000,
  // SSL configuration
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false,
    ca: process.env.DB_CA_CERT,
  } : false,
});

// Connection event monitoring
pool.on('connect', (client) => {
  logger.debug('New client connected to database');
  client.query('SET statement_timeout = 30000'); // 30s per statement
});

pool.on('error', (err, client) => {
  logger.error('Unexpected error on idle client', err);
});

pool.on('remove', () => {
  logger.debug('Client removed from pool');
});

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    logger.error('Database health check failed', error);
    return false;
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing database pool');
  await pool.end();
});

export const db = drizzle(pool, {
  schema,
  logger: process.env.NODE_ENV === 'development',
});
```

### Connection Pool Monitoring
```typescript
import { Pool } from 'pg';

interface PoolStats {
  total: number;
  idle: number;
  waiting: number;
}

export function getPoolStats(pool: Pool): PoolStats {
  return {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
  };
}

// Monitoring endpoint
app.get('/metrics/database', async (c) => {
  const stats = getPoolStats(pool);
  const health = await checkDatabaseHealth();
  
  return c.json({
    healthy: health,
    connections: stats,
    timestamp: new Date().toISOString(),
  });
});
```

## Advanced Migration Strategies

### Safe Migration Patterns
```typescript
// migrations/0001_add_column_safely.ts
import { sql } from 'drizzle-orm';

export async function up(db: any) {
  // Add column with default value to avoid locking
  await db.execute(sql`
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
  `);
  
  // Create index concurrently to avoid locking
  await db.execute(sql`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_status 
    ON users(status);
  `);
  
  // Update existing records in batches
  const batchSize = 1000;
  let offset = 0;
  let hasMore = true;
  
  while (hasMore) {
    const result = await db.execute(sql`
      UPDATE users 
      SET status = CASE 
        WHEN last_login_at > NOW() - INTERVAL '30 days' THEN 'active'
        WHEN last_login_at > NOW() - INTERVAL '90 days' THEN 'inactive'
        ELSE 'dormant'
      END
      WHERE id IN (
        SELECT id FROM users 
        WHERE status = 'active' 
        ORDER BY id 
        LIMIT ${batchSize} 
        OFFSET ${offset}
      );
    `);
    
    hasMore = result.rowCount === batchSize;
    offset += batchSize;
    
    // Add delay to reduce load
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

export async function down(db: any) {
  await db.execute(sql`
    DROP INDEX IF EXISTS idx_users_status;
    ALTER TABLE users DROP COLUMN IF EXISTS status;
  `);
}
```

### Migration Rollback with Savepoints
```typescript
import { sql } from 'drizzle-orm';

export async function runMigrationWithRollback(
  db: any,
  migration: () => Promise<void>
) {
  await db.transaction(async (tx) => {
    // Create savepoint
    await tx.execute(sql`SAVEPOINT migration_start`);
    
    try {
      await migration();
      
      // Validate migration
      const isValid = await validateMigration(tx);
      
      if (!isValid) {
        // Rollback to savepoint
        await tx.execute(sql`ROLLBACK TO SAVEPOINT migration_start`);
        throw new Error('Migration validation failed');
      }
    } catch (error) {
      await tx.execute(sql`ROLLBACK TO SAVEPOINT migration_start`);
      throw error;
    }
  });
}
```

## Transaction Patterns with Retry Logic

### Retry Logic for Deadlocks
```typescript
import { sql } from 'drizzle-orm';

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: number;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 100,
    backoff = 2,
  } = options;
  
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Check for retryable errors
      const isRetryable = 
        error.code === '40001' || // Serialization failure
        error.code === '40P01' || // Deadlock detected
        error.code === '55P03';   // Lock not available
      
      if (!isRetryable || attempt === maxAttempts) {
        throw error;
      }
      
      // Exponential backoff
      const waitTime = delay * Math.pow(backoff, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      logger.warn(`Retrying transaction, attempt ${attempt + 1}/${maxAttempts}`);
    }
  }
  
  throw lastError!;
}

// Usage
await withRetry(async () => {
  return await db.transaction(async (tx) => {
    // Complex transaction logic
    const account = await tx
      .select()
      .from(accounts)
      .where(eq(accounts.id, accountId))
      .for('update'); // Lock row
    
    if (account[0].balance < amount) {
      throw new Error('Insufficient funds');
    }
    
    await tx.update(accounts)
      .set({ balance: sql`balance - ${amount}` })
      .where(eq(accounts.id, accountId));
    
    await tx.insert(transactions).values({
      accountId,
      amount: -amount,
      type: 'debit',
      createdAt: new Date(),
    });
  });
});
```

### Distributed Transactions
```typescript
// Two-phase commit pattern
export async function transferBetweenDatabases(
  sourceDb: any,
  targetDb: any,
  transferData: any
) {
  const transactionId = crypto.randomUUID();
  
  // Phase 1: Prepare
  const sourcePrepared = await sourceDb.transaction(async (tx) => {
    await tx.insert(pendingTransfers).values({
      id: transactionId,
      data: transferData,
      status: 'preparing',
    });
    return true;
  });
  
  const targetPrepared = await targetDb.transaction(async (tx) => {
    await tx.insert(pendingTransfers).values({
      id: transactionId,
      data: transferData,
      status: 'preparing',
    });
    return true;
  });
  
  if (!sourcePrepared || !targetPrepared) {
    // Rollback
    await rollbackDistributed(sourceDb, targetDb, transactionId);
    throw new Error('Failed to prepare distributed transaction');
  }
  
  // Phase 2: Commit
  try {
    await sourceDb.update(pendingTransfers)
      .set({ status: 'committed' })
      .where(eq(pendingTransfers.id, transactionId));
    
    await targetDb.update(pendingTransfers)
      .set({ status: 'committed' })
      .where(eq(pendingTransfers.id, transactionId));
  } catch (error) {
    await rollbackDistributed(sourceDb, targetDb, transactionId);
    throw error;
  }
}
```

## Query Optimization

### Index Usage and Query Plans
```typescript
import { sql } from 'drizzle-orm';

// Analyze query performance
export async function analyzeQuery(query: string) {
  const result = await db.execute(sql`EXPLAIN ANALYZE ${sql.raw(query)}`);
  return result.rows;
}

// Create optimized indexes
export const createIndexes = async () => {
  // Composite index for common queries
  await db.execute(sql`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_status 
    ON users(email, status) 
    WHERE deleted_at IS NULL;
  `);
  
  // Partial index for active users
  await db.execute(sql`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_active_users 
    ON users(created_at DESC) 
    WHERE status = 'active' AND deleted_at IS NULL;
  `);
  
  // GIN index for full-text search
  await db.execute(sql`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_search 
    ON posts USING gin(to_tsvector('english', title || ' ' || content));
  `);
};

// Optimized full-text search
export async function searchPosts(searchTerm: string) {
  return await db.execute(sql`
    SELECT * FROM posts
    WHERE to_tsvector('english', title || ' ' || content) 
      @@ plainto_tsquery('english', ${searchTerm})
    ORDER BY ts_rank(
      to_tsvector('english', title || ' ' || content),
      plainto_tsquery('english', ${searchTerm})
    ) DESC
    LIMIT 20;
  `);
}
```

### Batch Operations
```typescript
// Efficient bulk insert with COPY
export async function bulkInsertUsers(users: NewUser[]) {
  if (users.length === 0) return;
  
  // For small batches, use regular insert
  if (users.length < 100) {
    return await db.insert(users).values(users);
  }
  
  // For large batches, use COPY command
  const client = await pool.connect();
  
  try {
    const stream = client.query(
      `COPY users(name, email, created_at) FROM STDIN CSV`
    );
    
    for (const user of users) {
      stream.write(`${user.name},${user.email},${new Date().toISOString()}\n`);
    }
    
    stream.end();
    await stream;
  } finally {
    client.release();
  }
}

// Batch update with CTE
export async function batchUpdateUsers(
  updates: Array<{ id: number; data: Partial<User> }>
) {
  if (updates.length === 0) return;
  
  const values = updates.map(u => 
    `(${u.id}, '${u.data.name}', '${u.data.email}')`
  ).join(',');
  
  await db.execute(sql`
    WITH updates (id, name, email) AS (
      VALUES ${sql.raw(values)}
    )
    UPDATE users u
    SET 
      name = COALESCE(updates.name, u.name),
      email = COALESCE(updates.email, u.email),
      updated_at = NOW()
    FROM updates
    WHERE u.id = updates.id;
  `);
}
```

## Testing Strategies

### Unit Testing with Mock Database
```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { GenericContainer } from 'testcontainers';

// Test database setup with Docker
export async function setupTestDatabase() {
  const container = await new GenericContainer('postgres:15')
    .withEnvironment({
      POSTGRES_USER: 'test',
      POSTGRES_PASSWORD: 'test',
      POSTGRES_DB: 'test',
    })
    .withExposedPorts(5432)
    .start();
  
  const pool = new Pool({
    host: container.getHost(),
    port: container.getMappedPort(5432),
    user: 'test',
    password: 'test',
    database: 'test',
  });
  
  const db = drizzle(pool, { schema });
  
  // Run migrations
  await migrate(db, { migrationsFolder: './migrations' });
  
  return {
    db,
    pool,
    cleanup: async () => {
      await pool.end();
      await container.stop();
    },
  };
}

// Test example
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('User Repository', () => {
  let testDb: any;
  let cleanup: () => Promise<void>;
  
  beforeAll(async () => {
    const setup = await setupTestDatabase();
    testDb = setup.db;
    cleanup = setup.cleanup;
  });
  
  afterAll(async () => {
    await cleanup();
  });
  
  it('should create and retrieve user', async () => {
    const user = await testDb.insert(users).values({
      name: 'Test User',
      email: 'test@example.com',
    }).returning();
    
    expect(user[0]).toMatchObject({
      name: 'Test User',
      email: 'test@example.com',
    });
    
    const retrieved = await testDb.query.users.findFirst({
      where: eq(users.id, user[0].id),
    });
    
    expect(retrieved).toBeDefined();
    expect(retrieved.email).toBe('test@example.com');
  });
});
```

### Integration Testing
```typescript
// Test transactions and rollbacks
describe('Transaction Tests', () => {
  it('should rollback on error', async () => {
    const initialCount = await testDb
      .select({ count: count() })
      .from(users);
    
    try {
      await testDb.transaction(async (tx) => {
        await tx.insert(users).values({
          name: 'User 1',
          email: 'user1@example.com',
        });
        
        // This should cause an error (duplicate email)
        await tx.insert(users).values({
          name: 'User 2',
          email: 'user1@example.com',
        });
      });
    } catch (error) {
      // Expected error
    }
    
    const finalCount = await testDb
      .select({ count: count() })
      .from(users);
    
    expect(finalCount[0].count).toBe(initialCount[0].count);
  });
});
```

## Performance Monitoring

### Query Performance Tracking
```typescript
import { logger } from './logger';

// Custom logger for slow queries
const queryLogger = {
  logQuery(query: string, params: unknown[]): void {
    const start = Date.now();
    
    return {
      logResult: (result: any) => {
        const duration = Date.now() - start;
        
        if (duration > 1000) { // Log slow queries (>1s)
          logger.warn('Slow query detected', {
            query,
            params,
            duration,
            rows: result?.rowCount,
          });
        }
      },
    };
  },
};

export const db = drizzle(pool, {
  schema,
  logger: queryLogger,
});
```

### Database Metrics Collection
```typescript
import { StatsD } from 'node-statsd';

const statsd = new StatsD();

// Track query metrics
pool.on('acquire', () => {
  statsd.increment('db.connections.acquired');
});

pool.on('release', () => {
  statsd.increment('db.connections.released');
});

// Track query performance
export async function trackQuery<T>(
  name: string,
  query: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  
  try {
    const result = await query();
    const duration = Date.now() - start;
    
    statsd.timing(`db.query.${name}`, duration);
    statsd.increment(`db.query.${name}.success`);
    
    return result;
  } catch (error) {
    statsd.increment(`db.query.${name}.error`);
    throw error;
  }
}

// Usage
const users = await trackQuery('getUserById', async () => {
  return await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
});
```

## Common Patterns and Solutions

### Advanced Pagination with Cursor
```typescript
interface CursorPagination {
  cursor?: string;
  limit?: number;
}

export async function getCursorPaginatedUsers(
  options: CursorPagination = {}
) {
  const { cursor, limit = 20 } = options;
  
  let query = db
    .select()
    .from(users)
    .orderBy(desc(users.createdAt), desc(users.id))
    .limit(limit + 1); // Fetch one extra to check if there's more
  
  if (cursor) {
    const [createdAt, id] = Buffer.from(cursor, 'base64')
      .toString()
      .split(',');
    
    query = query.where(
      or(
        lt(users.createdAt, new Date(createdAt)),
        and(
          eq(users.createdAt, new Date(createdAt)),
          lt(users.id, parseInt(id))
        )
      )
    );
  }
  
  const results = await query;
  const hasMore = results.length > limit;
  const items = hasMore ? results.slice(0, -1) : results;
  
  const nextCursor = hasMore
    ? Buffer.from(
        `${items[items.length - 1].createdAt.toISOString()},${items[items.length - 1].id}`
      ).toString('base64')
    : null;
  
  return {
    items,
    nextCursor,
    hasMore,
  };
}
```

### Optimistic Locking
```typescript
export const products = pgTable('products', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  name: text('name').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  version: integer('version').notNull().default(1),
});

export async function updateProductWithOptimisticLock(
  id: number,
  updates: Partial<Product>,
  expectedVersion: number
) {
  const result = await db
    .update(products)
    .set({
      ...updates,
      version: sql`version + 1`,
    })
    .where(
      and(
        eq(products.id, id),
        eq(products.version, expectedVersion)
      )
    )
    .returning();
  
  if (result.length === 0) {
    throw new Error('Optimistic lock violation - product was modified');
  }
  
  return result[0];
}
```

### Event Sourcing Pattern
```typescript
export const events = pgTable('events', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  aggregateId: varchar('aggregate_id', { length: 255 }).notNull(),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  eventData: jsonb('event_data').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Create index for efficient querying
await db.execute(sql`
  CREATE INDEX idx_events_aggregate 
  ON events(aggregate_id, created_at DESC);
`);

export async function appendEvent(
  aggregateId: string,
  eventType: string,
  data: any,
  metadata?: any
) {
  return await db.insert(events).values({
    aggregateId,
    eventType,
    eventData: data,
    metadata,
  }).returning();
}

export async function getEventStream(aggregateId: string) {
  return await db
    .select()
    .from(events)
    .where(eq(events.aggregateId, aggregateId))
    .orderBy(asc(events.createdAt));
}

// Rebuild aggregate from events
export async function rebuildAggregate(aggregateId: string) {
  const eventStream = await getEventStream(aggregateId);
  
  return eventStream.reduce((state, event) => {
    switch (event.eventType) {
      case 'UserCreated':
        return { ...state, ...event.eventData };
      case 'UserUpdated':
        return { ...state, ...event.eventData };
      case 'UserDeleted':
        return { ...state, deleted: true };
      default:
        return state;
    }
  }, {});
}
```

Drizzle ORM provides a modern, type-safe approach to database operations with excellent performance and developer experience. These advanced patterns enable building scalable, production-ready applications with proper connection management, migrations, testing, and monitoring.