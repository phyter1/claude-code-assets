# Next.js - The React Framework for Production

Next.js is a React framework that provides building blocks to create fast web applications. It offers production-grade features including hybrid static & server rendering, TypeScript support, smart bundling, and more.

## Core Concepts and Philosophy

- **Full-Stack Framework**: Both frontend and backend capabilities in one framework
- **App Router**: File-system based routing with support for Server Components
- **Performance by Default**: Automatic optimizations for images, fonts, and JavaScript
- **Developer Experience**: Hot reloading, error handling, and TypeScript support
- **Flexible Deployment**: Static export, serverless functions, or traditional servers

## Installation and Setup

### Basic Installation

```bash
# Create new Next.js application
npx create-next-app@latest my-app --typescript --tailwind --eslint --app

# Or with specific options
npx create-next-app@latest my-app \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

### Project Structure (App Router)

```
my-app/
├── app/                    # App Router directory
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   ├── page.tsx           # Home page
│   ├── loading.tsx        # Loading UI
│   ├── error.tsx          # Error UI
│   ├── not-found.tsx      # 404 page
│   └── api/              # API routes
│       └── route.ts      # API endpoint
├── components/           # Reusable components
├── lib/                 # Utility functions
├── public/              # Static assets
├── next.config.js       # Next.js configuration
├── package.json
└── tsconfig.json
```

### Basic Configuration

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router (default in Next.js 13+)
  experimental: {
    appDir: true,
  },
  
  // TypeScript config
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Image optimization
  images: {
    domains: ['example.com'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Headers and redirects
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  },
  
  async redirects() {
    return [
      {
        source: '/old-page',
        destination: '/new-page',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
```

## Key API Methods and Patterns

### App Router and File-Based Routing

**Basic Pages**
```typescript
// app/page.tsx (Home page)
export default function HomePage() {
  return (
    <div>
      <h1>Welcome to Next.js 15</h1>
      <p>This is the home page using App Router.</p>
    </div>
  );
}

// app/about/page.tsx (About page)
export default function AboutPage() {
  return (
    <div>
      <h1>About Us</h1>
      <p>Learn more about our company.</p>
    </div>
  );
}

// app/blog/[slug]/page.tsx (Dynamic route)
interface PageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function BlogPost({ params, searchParams }: PageProps) {
  return (
    <div>
      <h1>Blog Post: {params.slug}</h1>
      <p>Query params: {JSON.stringify(searchParams)}</p>
    </div>
  );
}

// Generate static params for dynamic routes
export async function generateStaticParams() {
  const posts = await fetch('https://api.example.com/posts').then(res => res.json());
  
  return posts.map((post: any) => ({
    slug: post.slug,
  }));
}
```

**Layouts and Templates**
```typescript
// app/layout.tsx (Root layout)
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'My App',
    template: '%s | My App',
  },
  description: 'A modern web application built with Next.js',
  keywords: ['Next.js', 'React', 'TypeScript'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header>
          <nav>
            <a href="/">Home</a>
            <a href="/about">About</a>
            <a href="/blog">Blog</a>
          </nav>
        </header>
        <main>{children}</main>
        <footer>
          <p>&copy; 2025 My App. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}

// app/blog/layout.tsx (Nested layout)
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="blog-layout">
      <aside>
        <h2>Blog Sidebar</h2>
        {/* Sidebar content */}
      </aside>
      <div className="blog-content">
        {children}
      </div>
    </div>
  );
}
```

### Server Components and Data Fetching

**Server Components**
```typescript
// app/posts/page.tsx (Server Component)
interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
}

// This runs on the server
async function getPosts(): Promise<Post[]> {
  const response = await fetch('https://api.example.com/posts', {
    // Next.js extends fetch with caching options
    next: { revalidate: 3600 }, // Revalidate every hour
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }
  
  return response.json();
}

export default async function PostsPage() {
  const posts = await getPosts();
  
  return (
    <div>
      <h1>Latest Posts</h1>
      <div className="posts-grid">
        {posts.map((post) => (
          <article key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
            <p>By {post.author}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

// Metadata generation
export async function generateMetadata(): Promise<Metadata> {
  const posts = await getPosts();
  
  return {
    title: 'Latest Posts',
    description: `Browse our ${posts.length} latest blog posts`,
  };
}
```

**Client Components**
```typescript
// components/InteractiveCounter.tsx
'use client'; // This directive makes it a Client Component

import { useState } from 'react';

export default function InteractiveCounter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

// app/interactive/page.tsx (Server Component using Client Component)
import InteractiveCounter from '@/components/InteractiveCounter';

export default function InteractivePage() {
  return (
    <div>
      <h1>Interactive Features</h1>
      <p>This content renders on the server.</p>
      <InteractiveCounter />
    </div>
  );
}
```

**Streaming and Suspense**
```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react';

async function RecentPosts() {
  // Simulate slow API call
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const posts = await fetch('https://api.example.com/posts/recent');
  const data = await posts.json();
  
  return (
    <div>
      <h2>Recent Posts</h2>
      {data.map((post: any) => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}

async function Analytics() {
  // Another slow API call
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const analytics = await fetch('https://api.example.com/analytics');
  const data = await analytics.json();
  
  return (
    <div>
      <h2>Analytics</h2>
      <p>Views: {data.views}</p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      <Suspense fallback={<div>Loading recent posts...</div>}>
        <RecentPosts />
      </Suspense>
      
      <Suspense fallback={<div>Loading analytics...</div>}>
        <Analytics />
      </Suspense>
    </div>
  );
}
```

### API Routes

**Basic API Routes**
```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

// GET /api/users
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '10';
  
  try {
    // Fetch users from database
    const users = await getUsersFromDB(parseInt(page), parseInt(limit));
    
    return NextResponse.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/users
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userData = createUserSchema.parse(body);
    
    const user = await createUserInDB(userData);
    
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Dynamic API Routes**
```typescript
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface RouteContext {
  params: { id: string };
}

// GET /api/users/[id]
export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  const userId = parseInt(params.id);
  
  if (isNaN(userId)) {
    return NextResponse.json(
      { error: 'Invalid user ID' },
      { status: 400 }
    );
  }
  
  try {
    const user = await getUserById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id]
export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  const userId = parseInt(params.id);
  
  try {
    const body = await request.json();
    const updatedUser = await updateUserInDB(userId, body);
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id]
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  const userId = parseInt(params.id);
  
  try {
    await deleteUserFromDB(userId);
    
    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
```

## TypeScript Usage Examples

### Type-Safe Pages and Components

```typescript
// types/index.ts
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  author: User;
  publishedAt: string;
}

// app/users/[id]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { User } from '@/types';

interface PageProps {
  params: { id: string };
}

async function getUser(id: number): Promise<User | null> {
  try {
    const response = await fetch(`https://api.example.com/users/${id}`, {
      next: { revalidate: 300 }, // 5 minutes
    });
    
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch user');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const id = parseInt(params.id);
  const user = await getUser(id);
  
  if (!user) {
    return {
      title: 'User Not Found',
    };
  }
  
  return {
    title: `${user.name} - User Profile`,
    description: `Profile page for ${user.name}`,
  };
}

export default async function UserProfilePage({ params }: PageProps) {
  const id = parseInt(params.id);
  
  if (isNaN(id)) {
    notFound();
  }
  
  const user = await getUser(id);
  
  if (!user) {
    notFound();
  }
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      <p>Member since: {new Date(user.createdAt).toLocaleDateString()}</p>
    </div>
  );
}

// Generate static paths for static generation
export async function generateStaticParams(): Promise<{ id: string }[]> {
  const users = await fetch('https://api.example.com/users').then(res => res.json());
  
  return users.slice(0, 10).map((user: User) => ({
    id: user.id.toString(),
  }));
}
```

### Custom Hooks for Data Fetching

```typescript
// hooks/useApi.ts
'use client';

import { useState, useEffect } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(url: string): UseApiState<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });
  
  useEffect(() => {
    let isCancelled = false;
    
    async function fetchData() {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!isCancelled) {
          setState({
            data,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        if (!isCancelled) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }
    
    fetchData();
    
    return () => {
      isCancelled = true;
    };
  }, [url]);
  
  return state;
}

// components/UsersList.tsx
'use client';

import { useApi } from '@/hooks/useApi';
import type { User } from '@/types';

export default function UsersList() {
  const { data: users, loading, error } = useApi<User[]>('/api/users');
  
  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!users) return <div>No users found</div>;
  
  return (
    <div>
      <h2>Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <strong>{user.name}</strong> - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Best Practices and Common Patterns

### Error Handling and Loading States

```typescript
// app/error.tsx (Error boundary)
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);
  
  return (
    <div className="error-container">
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>
        Try again
      </button>
    </div>
  );
}

// app/loading.tsx (Loading UI)
export default function Loading() {
  return (
    <div className="loading-container">
      <div className="spinner" />
      <p>Loading...</p>
    </div>
  );
}

// app/not-found.tsx (404 page)
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="not-found-container">
      <h2>Not Found</h2>
      <p>Could not find the requested resource</p>
      <Link href="/">
        Return Home
      </Link>
    </div>
  );
}
```

### Middleware and Route Protection

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Protect admin routes
  if (path.startsWith('/admin')) {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      
      if (payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // API rate limiting
  if (path.startsWith('/api/')) {
    const ip = request.ip || 'unknown';
    const rateLimitKey = `rate-limit:${ip}`;
    
    // Implement rate limiting logic here
    // This is a simplified example
    
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', '100');
    response.headers.set('X-RateLimit-Remaining', '99');
    
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*',
  ],
};
```

### Environment Configuration

```typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // Authentication
  JWT_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string(),
  
  // APIs
  API_BASE_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  
  // Node environment
  NODE_ENV: z.enum(['development', 'test', 'production']),
  
  // Optional
  REDIS_URL: z.string().url().optional(),
  SENTRY_DSN: z.string().url().optional(),
});

export const env = envSchema.parse(process.env);

// lib/config.ts
import { env } from './env';

export const config = {
  app: {
    name: 'My Next.js App',
    url: env.NEXTAUTH_URL,
    description: 'A modern web application',
  },
  
  database: {
    url: env.DATABASE_URL,
  },
  
  auth: {
    secret: env.JWT_SECRET,
    providers: {
      // Auth provider configurations
    },
  },
  
  api: {
    baseUrl: env.API_BASE_URL,
    timeout: 5000,
  },
  
  features: {
    analytics: env.NODE_ENV === 'production',
    debug: env.NODE_ENV === 'development',
  },
};
```

## Integration with Other Tools

### Database Integration (Drizzle ORM)

```typescript
// lib/db.ts
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import * as schema from './schema';

export const db = drizzle(sql, { schema });

// app/api/posts/route.ts
import { db } from '@/lib/db';
import { posts } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const allPosts = await db.select().from(posts);
    return Response.json(allPosts);
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const [newPost] = await db.insert(posts).values(body).returning();
    return Response.json(newPost, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
```

### Authentication Integration

```typescript
// lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from './db';

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
};

// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// components/AuthButton.tsx
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export default function AuthButton() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') return <p>Loading...</p>;
  
  if (session) {
    return (
      <div>
        <p>Signed in as {session.user?.email}</p>
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    );
  }
  
  return (
    <div>
      <p>Not signed in</p>
      <button onClick={() => signIn()}>Sign in</button>
    </div>
  );
}
```

### State Management Integration

```typescript
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          gcTime: 10 * 60 * 1000,
        },
      },
    })
  );
  
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}

// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### Image Optimization and Performance

```typescript
// components/OptimizedImage.tsx
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={className}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGBkRMUUaH/xAAVAQEBAAAAAAAAAAAAAAAAAAABAv/EABwRAAEFAQEBAAAAAAAAAAAAAAEAAgMEBSExQf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyejWxYRU4RRiKk9RPLaM2H/9k="
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
}

// app/gallery/page.tsx
import OptimizedImage from '@/components/OptimizedImage';

const images = [
  { id: 1, src: '/images/photo1.jpg', alt: 'Photo 1' },
  { id: 2, src: '/images/photo2.jpg', alt: 'Photo 2' },
];

export default function GalleryPage() {
  return (
    <div className="gallery-grid">
      {images.map((image) => (
        <OptimizedImage
          key={image.id}
          src={image.src}
          alt={image.alt}
          width={400}
          height={300}
          className="gallery-image"
        />
      ))}
    </div>
  );
}
```

## Next.js 15 New Features

### React Compiler Integration
```typescript
// next.config.js - Enable React Compiler
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    reactCompiler: {
      enabled: true,
      // Optional configuration
      compilationMode: 'annotation', // or 'infer'
      panicThreshold: 'error',
    },
  },
};

module.exports = nextConfig;

// components/OptimizedComponent.tsx
'use client';
'use memo'; // React Compiler annotation

import { useState, useCallback } from 'react';

// React Compiler automatically optimizes this component
export default function OptimizedComponent({ data }: { data: any[] }) {
  const [filter, setFilter] = useState('');
  
  // No need for manual memoization - React Compiler handles it
  const filteredData = data.filter(item => 
    item.name.toLowerCase().includes(filter.toLowerCase())
  );
  
  const handleFilterChange = useCallback((value: string) => {
    setFilter(value);
  }, []);
  
  return (
    <div>
      <input 
        value={filter}
        onChange={(e) => handleFilterChange(e.target.value)}
        placeholder="Filter items..."
      />
      {filteredData.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

### Enhanced Server Actions
```typescript
// app/actions.ts
'use server';

import { redirect } from 'next/navigation';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';

const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  categoryId: z.string(),
});

// Server Action with validation and error handling
export async function createPost(prevState: any, formData: FormData) {
  try {
    const data = {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      categoryId: formData.get('categoryId') as string,
    };
    
    // Validate data
    const validatedData = createPostSchema.parse(data);
    
    // Create post in database
    const post = await db.insert(posts).values({
      ...validatedData,
      authorId: getCurrentUserId(),
      createdAt: new Date(),
    }).returning();
    
    // Revalidate related cache
    revalidateTag('posts');
    revalidateTag(`category-${validatedData.categoryId}`);
    
    // Redirect to new post
    redirect(`/posts/${post[0].id}`);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        errors: error.flatten().fieldErrors,
        message: 'Validation failed',
      };
    }
    
    return {
      errors: {},
      message: 'Failed to create post',
    };
  }
}

// Server Action with streaming response
export async function processLargeFile(formData: FormData) {
  const file = formData.get('file') as File;
  
  if (!file) {
    throw new Error('No file provided');
  }
  
  // Process file in chunks and stream updates
  const stream = new ReadableStream({
    async start(controller) {
      const reader = file.stream().getReader();
      let processed = 0;
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        // Process chunk
        processed += value.length;
        
        // Send progress update
        controller.enqueue(
          `data: ${JSON.stringify({ 
            progress: (processed / file.size) * 100 
          })}\n\n`
        );
      }
      
      controller.close();
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// Server Action with optimistic updates
export async function toggleLike(postId: string, isLiked: boolean) {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    if (isLiked) {
      await db.delete(likes).where(
        and(eq(likes.postId, postId), eq(likes.userId, getCurrentUserId()))
      );
    } else {
      await db.insert(likes).values({
        postId,
        userId: getCurrentUserId(),
      });
    }
    
    revalidateTag(`post-${postId}`);
    
    return { success: true, isLiked: !isLiked };
  } catch (error) {
    return { success: false, error: 'Failed to toggle like' };
  }
}
```

### Advanced Form Handling
```typescript
// components/CreatePostForm.tsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createPost } from '@/app/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button 
      type="submit" 
      disabled={pending}
      className={`btn ${pending ? 'loading' : ''}`}
    >
      {pending ? 'Creating...' : 'Create Post'}
    </button>
  );
}

export default function CreatePostForm() {
  const [state, formAction] = useFormState(createPost, {
    errors: {},
    message: '',
  });
  
  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="title">Title</label>
        <input 
          type="text" 
          id="title" 
          name="title"
          className={state.errors?.title ? 'error' : ''}
          required 
        />
        {state.errors?.title && (
          <p className="error">{state.errors.title[0]}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="content">Content</label>
        <textarea 
          id="content" 
          name="content"
          rows={5}
          className={state.errors?.content ? 'error' : ''}
          required
        />
        {state.errors?.content && (
          <p className="error">{state.errors.content[0]}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="categoryId">Category</label>
        <select 
          id="categoryId" 
          name="categoryId"
          className={state.errors?.categoryId ? 'error' : ''}
          required
        >
          <option value="">Select a category</option>
          <option value="tech">Technology</option>
          <option value="design">Design</option>
        </select>
        {state.errors?.categoryId && (
          <p className="error">{state.errors.categoryId[0]}</p>
        )}
      </div>
      
      <SubmitButton />
      
      {state.message && (
        <p className={state.errors?.title ? 'error' : 'success'}>
          {state.message}
        </p>
      )}
    </form>
  );
}
```

### Partial Prerendering (PPR)
```typescript
// next.config.js - Enable PPR
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    ppr: 'incremental', // or true for all routes
  },
};

module.exports = nextConfig;

// app/dashboard/page.tsx - PPR with dynamic content
import { Suspense } from 'react';
import StaticContent from './StaticContent';
import DynamicUserData from './DynamicUserData';
import DynamicAnalytics from './DynamicAnalytics';

// Static shell renders immediately
export default function DashboardPage() {
  return (
    <div>
      {/* This renders statically */}
      <StaticContent />
      
      {/* These stream in dynamically */}
      <Suspense fallback={<UserDataSkeleton />}>
        <DynamicUserData />
      </Suspense>
      
      <Suspense fallback={<AnalyticsSkeleton />}>
        <DynamicAnalytics />
      </Suspense>
    </div>
  );
}

// Force dynamic rendering for specific components
// app/dashboard/DynamicUserData.tsx
import { unstable_noStore as noStore } from 'next/cache';

export default async function DynamicUserData() {
  noStore(); // Opt out of caching
  
  const userData = await fetchUserData();
  
  return (
    <div>
      <h2>Welcome, {userData.name}</h2>
      <p>Last login: {userData.lastLogin}</p>
    </div>
  );
}
```

### Advanced Middleware Patterns
```typescript
// middleware.ts - Advanced middleware with edge functions
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuth } from './lib/auth-edge';
import { ratelimit } from './lib/ratelimit';

export async function middleware(request: NextRequest) {
  const start = Date.now();
  const path = request.nextUrl.pathname;
  
  // Add request ID for tracing
  const requestId = crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-id', requestId);
  
  // Rate limiting with edge-compatible Redis
  if (path.startsWith('/api/')) {
    const identifier = request.ip ?? 'anonymous';
    const { success, limit, reset, remaining } = await ratelimit.limit(identifier);
    
    if (!success) {
      return new NextResponse(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }
  }
  
  // Authentication for protected routes
  if (path.startsWith('/dashboard') || path.startsWith('/admin')) {
    const authResult = await verifyAuth(request);
    
    if (!authResult.valid) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/signin';
      url.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(url);
    }
    
    // Add user info to headers for downstream consumption
    requestHeaders.set('x-user-id', authResult.user.id);
    requestHeaders.set('x-user-role', authResult.user.role);
  }
  
  // Geolocation-based routing
  const country = request.geo?.country ?? 'US';
  if (path === '/') {
    const url = request.nextUrl.clone();
    
    // Redirect to country-specific pages
    if (country === 'DE') {
      url.pathname = '/de';
    } else if (country === 'FR') {
      url.pathname = '/fr';
    }
    
    if (url.pathname !== path) {
      return NextResponse.redirect(url);
    }
  }
  
  // A/B testing
  if (path.startsWith('/landing')) {
    const variant = request.cookies.get('ab-test-variant')?.value || 
      (Math.random() > 0.5 ? 'a' : 'b');
    
    if (!request.cookies.get('ab-test-variant')) {
      const response = NextResponse.next({
        request: { headers: requestHeaders },
      });
      response.cookies.set('ab-test-variant', variant, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      return response;
    }
    
    requestHeaders.set('x-ab-variant', variant);
  }
  
  // Security headers
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Add performance timing
  const duration = Date.now() - start;
  response.headers.set('X-Response-Time', `${duration}ms`);
  response.headers.set('X-Request-ID', requestId);
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### Advanced Caching Strategies
```typescript
// lib/cache.ts - Multi-layer caching
import { unstable_cache } from 'next/cache';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

// Combine Next.js cache with Redis
export function createCachedFunction<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  keyPrefix: string,
  options: {
    revalidate?: number;
    tags?: string[];
    redisExpiration?: number;
  } = {}
) {
  const { revalidate = 3600, tags = [], redisExpiration = 7200 } = options;
  
  // Next.js cache layer
  const nextCached = unstable_cache(
    async (...args: T) => {
      const cacheKey = `${keyPrefix}:${JSON.stringify(args)}`;
      
      // Check Redis first
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (error) {
        console.warn('Redis cache miss:', error);
      }
      
      // Execute function
      const result = await fn(...args);
      
      // Store in Redis
      try {
        await redis.setex(
          cacheKey,
          redisExpiration,
          JSON.stringify(result)
        );
      } catch (error) {
        console.warn('Redis cache store failed:', error);
      }
      
      return result;
    },
    [keyPrefix],
    { revalidate, tags }
  );
  
  return nextCached;
}

// Usage
const getCachedPosts = createCachedFunction(
  async (category: string, page: number) => {
    const posts = await db.select()
      .from(posts)
      .where(eq(posts.category, category))
      .limit(10)
      .offset((page - 1) * 10);
    return posts;
  },
  'posts',
  {
    revalidate: 300, // 5 minutes Next.js cache
    redisExpiration: 600, // 10 minutes Redis cache
    tags: ['posts'],
  }
);

// app/posts/[category]/page.tsx
export default async function PostsPage({ 
  params, 
  searchParams 
}: { 
  params: { category: string };
  searchParams: { page?: string };
}) {
  const page = parseInt(searchParams.page || '1');
  const posts = await getCachedPosts(params.category, page);
  
  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  );
}
```

### Real-time Features with Server-Sent Events
```typescript
// app/api/events/route.ts - SSE endpoint
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const data = `data: ${JSON.stringify({ 
        type: 'connected',
        timestamp: Date.now()
      })}\n\n`;
      controller.enqueue(encoder.encode(data));
      
      // Set up periodic heartbeat
      const heartbeat = setInterval(() => {
        const heartbeatData = `data: ${JSON.stringify({ 
          type: 'heartbeat',
          timestamp: Date.now()
        })}\n\n`;
        
        try {
          controller.enqueue(encoder.encode(heartbeatData));
        } catch (error) {
          clearInterval(heartbeat);
          clearInterval(dataInterval);
        }
      }, 30000);
      
      // Simulate real-time data updates
      const dataInterval = setInterval(async () => {
        try {
          // Fetch latest notifications for user
          const notifications = await getLatestNotifications(userId);
          
          if (notifications.length > 0) {
            const eventData = `data: ${JSON.stringify({ 
              type: 'notifications',
              data: notifications
            })}\n\n`;
            
            controller.enqueue(encoder.encode(eventData));
          }
        } catch (error) {
          console.error('SSE error:', error);
          clearInterval(heartbeat);
          clearInterval(dataInterval);
          controller.close();
        }
      }, 5000);
      
      // Clean up on client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        clearInterval(dataInterval);
        controller.close();
      });
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}

// hooks/useServerSentEvents.ts
'use client';

import { useEffect, useState } from 'react';

interface SSEData {
  type: string;
  data?: any;
  timestamp: number;
}

export function useServerSentEvents(endpoint: string) {
  const [data, setData] = useState<SSEData | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const eventSource = new EventSource(endpoint);
    
    eventSource.onopen = () => {
      setConnected(true);
      setError(null);
    };
    
    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        setData(parsed);
      } catch (err) {
        console.error('Failed to parse SSE data:', err);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      setError('Connection error');
      setConnected(false);
    };
    
    return () => {
      eventSource.close();
      setConnected(false);
    };
  }, [endpoint]);
  
  return { data, connected, error };
}

// components/NotificationCenter.tsx
'use client';

import { useServerSentEvents } from '@/hooks/useServerSentEvents';

export default function NotificationCenter() {
  const { data, connected, error } = useServerSentEvents('/api/events');
  const [notifications, setNotifications] = useState<any[]>([]);
  
  useEffect(() => {
    if (data?.type === 'notifications') {
      setNotifications(prev => [...data.data, ...prev]);
    }
  }, [data]);
  
  return (
    <div className="notification-center">
      <div className="status">
        Status: {connected ? '🟢 Connected' : '🔴 Disconnected'}
        {error && <span className="error">{error}</span>}
      </div>
      
      <div className="notifications">
        {notifications.map((notification, index) => (
          <div key={index} className="notification">
            <h4>{notification.title}</h4>
            <p>{notification.message}</p>
            <small>{new Date(notification.timestamp).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Advanced Deployment Configurations

#### Docker Production Setup
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables for build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
```

#### Kubernetes Configuration
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nextjs-app
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nextjs-app
  template:
    metadata:
      labels:
        app: nextjs-app
    spec:
      containers:
      - name: nextjs
        image: your-registry/nextjs-app:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: redis-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: nextjs-service
  namespace: production
spec:
  selector:
    app: nextjs-app
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nextjs-ingress
  namespace: production
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  tls:
  - hosts:
    - yourdomain.com
    secretName: nextjs-tls
  rules:
  - host: yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: nextjs-service
            port:
              number: 80
```

### Performance Monitoring
```typescript
// lib/monitoring.ts
import { NextRequest, NextResponse } from 'next/server';

export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  
  startTiming(label: string): () => void {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      
      if (!this.metrics.has(label)) {
        this.metrics.set(label, []);
      }
      
      this.metrics.get(label)!.push(duration);
      
      // Send to monitoring service
      if (process.env.NODE_ENV === 'production') {
        this.sendMetric(label, duration);
      }
    };
  }
  
  private async sendMetric(label: string, duration: number) {
    try {
      await fetch(process.env.METRICS_ENDPOINT!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric: label,
          value: duration,
          timestamp: Date.now(),
        }),
      });
    } catch (error) {
      console.error('Failed to send metric:', error);
    }
  }
  
  getMetrics() {
    const summary = new Map();
    
    for (const [label, values] of this.metrics) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const max = Math.max(...values);
      const min = Math.min(...values);
      
      summary.set(label, { avg, max, min, count: values.length });
    }
    
    return Object.fromEntries(summary);
  }
}

export const monitor = new PerformanceMonitor();

// Middleware integration
export function withPerformanceMonitoring(handler: Function) {
  return async (request: NextRequest) => {
    const endTiming = monitor.startTiming(`${request.method} ${request.nextUrl.pathname}`);
    
    try {
      const response = await handler(request);
      endTiming();
      return response;
    } catch (error) {
      endTiming();
      throw error;
    }
  };
}

// app/api/health/route.ts
export async function GET() {
  const metrics = monitor.getMetrics();
  
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    performance: metrics,
  });
}
```

Next.js 15 provides a comprehensive framework for building modern React applications with cutting-edge features like React Compiler integration, Partial Prerendering, enhanced Server Actions, and advanced middleware capabilities. These features, combined with robust deployment strategies and monitoring, make it the ideal choice for building scalable, high-performance web applications in 2025.