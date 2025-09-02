# TanStack Query (React Query) v5 - Powerful Data Synchronization

TanStack Query is a powerful data synchronization library for web applications. It provides caching, background updates, and more with zero-config, but is also highly customizable to fit every use-case.

## Core Concepts and Philosophy

- **Declarative & Automatic**: Describe your data requirements and TanStack Query handles the rest
- **Simple & Familiar**: If you know how to work with promises, you know how to use TanStack Query
- **Powerful & Configurable**: Scales from zero-config to highly customized setups
- **TypeScript-first**: Built with TypeScript and excellent type inference
- **Framework agnostic**: Available for React, Solid, Svelte, and Vue

## Installation and Setup

### Basic Installation

```bash
npm install @tanstack/react-query
```

### Basic Setup

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Query Client Configuration

```typescript
import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime in v4)
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});
```

## Key API Methods and Patterns

### Queries with useQuery

**Basic Query**
```typescript
import { useQuery } from '@tanstack/react-query';

interface User {
  id: number;
  name: string;
  email: string;
}

function UserProfile({ userId }: { userId: number }) {
  const {
    data: user,
    error,
    isLoading, // renamed from loading in v5
    isPending, // new in v5, replaces isLoading in most cases
    isFetching,
    isError,
  } = useQuery({
    queryKey: ['user', userId],
    queryFn: async (): Promise<User> => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      return response.json();
    },
    enabled: !!userId, // Only run query if userId exists
  });

  if (isPending) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

**Advanced Query Configuration**
```typescript
import { useQuery, keepPreviousData } from '@tanstack/react-query';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  hasNextPage: boolean;
}

interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
}

function PostsList({ page }: { page: number }) {
  const {
    data: posts,
    isLoading,
    isPlaceholderData,
    isFetching,
  } = useQuery({
    queryKey: ['posts', { page }],
    queryFn: async ({ queryKey }): Promise<PaginatedResponse<Post>> => {
      const [, { page }] = queryKey;
      const response = await fetch(`/api/posts?page=${page}&limit=10`);
      return response.json();
    },
    placeholderData: keepPreviousData, // Keep previous data while fetching new data
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    select: (data) => data.data, // Transform data
    meta: {
      errorMessage: 'Failed to load posts',
    },
  });

  return (
    <div>
      {posts?.map((post) => (
        <article key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
        </article>
      ))}
      {isFetching && <div>Refreshing...</div>}
    </div>
  );
}
```

### Suspense Queries (New in v5)

```typescript
import { useSuspenseQuery } from '@tanstack/react-query';

// Data is never undefined with Suspense queries
function UserProfileSuspense({ userId }: { userId: number }) {
  const { data: user } = useSuspenseQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    },
  });

  // No need to check for loading or undefined - Suspense handles it
  return (
    <div>
      <h1>{user.name}</h1> {/* user is always defined */}
      <p>{user.email}</p>
    </div>
  );
}

// Usage with Suspense boundary
function App() {
  return (
    <Suspense fallback={<div>Loading user...</div>}>
      <UserProfileSuspense userId={1} />
    </Suspense>
  );
}
```

### Infinite Queries

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';

interface PostsPage {
  posts: Post[];
  nextCursor?: string;
  hasNextPage: boolean;
}

function InfinitePostsList() {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['posts', 'infinite'],
    queryFn: async ({ pageParam }): Promise<PostsPage> => {
      const response = await fetch(
        `/api/posts?cursor=${pageParam || ''}&limit=10`
      );
      return response.json();
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => 
      lastPage.hasNextPage ? lastPage.nextCursor : undefined,
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      // Flatten all posts across pages
      allPosts: data.pages.flatMap((page) => page.posts),
    }),
  });

  if (status === 'pending') return <div>Loading...</div>;
  if (status === 'error') return <div>Error: {error.message}</div>;

  return (
    <div>
      {data.allPosts.map((post) => (
        <article key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
        </article>
      ))}
      
      <button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
      >
        {isFetchingNextPage
          ? 'Loading more...'
          : hasNextPage
          ? 'Load More'
          : 'Nothing more to load'}
      </button>
    </div>
  );
}
```

### Mutations

**Basic Mutation**
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CreatePostData {
  title: string;
  content: string;
}

function CreatePostForm() {
  const queryClient = useQueryClient();
  
  const createPostMutation = useMutation({
    mutationFn: async (postData: CreatePostData): Promise<Post> => {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create post');
      }
      
      return response.json();
    },
    onSuccess: (newPost) => {
      // Invalidate and refetch posts list
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      
      // Optionally, add the new post to cache immediately
      queryClient.setQueryData(['post', newPost.id], newPost);
    },
    onError: (error) => {
      console.error('Failed to create post:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    createPostMutation.mutate({
      title: formData.get('title') as string,
      content: formData.get('content') as string,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" placeholder="Post title" required />
      <textarea name="content" placeholder="Post content" required />
      <button 
        type="submit" 
        disabled={createPostMutation.isPending}
      >
        {createPostMutation.isPending ? 'Creating...' : 'Create Post'}
      </button>
      
      {createPostMutation.isError && (
        <div>Error: {createPostMutation.error.message}</div>
      )}
    </form>
  );
}
```

**Optimistic Updates**
```typescript
interface UpdatePostData {
  title?: string;
  content?: string;
}

function useUpdatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: number; 
      updates: UpdatePostData; 
    }): Promise<Post> => {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return response.json();
    },
    
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['post', id] });
      
      // Snapshot previous value
      const previousPost = queryClient.getQueryData(['post', id]);
      
      // Optimistically update to new value
      if (previousPost) {
        queryClient.setQueryData(['post', id], {
          ...previousPost,
          ...updates,
        });
      }
      
      // Return context object with snapshotted value
      return { previousPost, id };
    },
    
    onError: (error, variables, context) => {
      // If mutation fails, use the context returned from onMutate to roll back
      if (context?.previousPost) {
        queryClient.setQueryData(['post', context.id], context.previousPost);
      }
    },
    
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['post', variables.id] });
    },
  });
}
```

## TypeScript Usage Examples

### Generic Type Safety

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

// Generic query hook
function useApiQuery<TData, TError = Error>(
  endpoint: string,
  options?: {
    enabled?: boolean;
    select?: (data: any) => TData;
  }
) {
  return useQuery<TData, TError>({
    queryKey: [endpoint],
    queryFn: async () => {
      const response = await fetch(`/api${endpoint}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${endpoint}`);
      }
      return response.json();
    },
    ...options,
  });
}

// Generic mutation hook
function useApiMutation<TData, TVariables, TError = Error>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST'
) {
  return useMutation<TData, TError, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const response = await fetch(`/api${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(variables),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${method} ${endpoint}`);
      }
      
      return response.json();
    },
  });
}

// Usage with full type safety
interface User {
  id: number;
  name: string;
  email: string;
}

interface CreateUserRequest {
  name: string;
  email: string;
}

function UserManager() {
  // Fully typed query
  const { data: users } = useApiQuery<User[]>('/users');
  
  // Fully typed mutation
  const createUser = useApiMutation<User, CreateUserRequest>('/users', 'POST');
  
  return (
    <div>
      {users?.map(user => <div key={user.id}>{user.name}</div>)}
      <button onClick={() => createUser.mutate({ name: 'John', email: 'john@example.com' })}>
        Add User
      </button>
    </div>
  );
}
```

### Advanced Type Patterns

```typescript
import { useQuery, UseQueryResult } from '@tanstack/react-query';

// Discriminated union for different query states
type QueryState<TData> = 
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'success'; data: TData };

function useTypedQuery<TData>(
  queryKey: string[],
  queryFn: () => Promise<TData>
): QueryState<TData> {
  const query = useQuery({ queryKey, queryFn });
  
  if (query.isPending) {
    return { status: 'loading' };
  }
  
  if (query.isError) {
    return { status: 'error', error: query.error };
  }
  
  return { status: 'success', data: query.data };
}

// Usage with type narrowing
function UserComponent({ userId }: { userId: number }) {
  const userQuery = useTypedQuery(
    ['user', userId.toString()],
    () => fetchUser(userId)
  );
  
  switch (userQuery.status) {
    case 'loading':
      return <div>Loading...</div>;
    case 'error':
      return <div>Error: {userQuery.error.message}</div>;
    case 'success':
      // TypeScript knows userQuery.data is defined here
      return <div>{userQuery.data.name}</div>;
  }
}
```

## Best Practices and Common Patterns

### Query Key Management

```typescript
// Query key factory pattern
const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: string) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
};

const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (filters: string) => [...postKeys.lists(), { filters }] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: number) => [...postKeys.details(), id] as const,
};

// Usage
function useUser(id: number) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => fetchUser(id),
  });
}

function useInvalidateUser() {
  const queryClient = useQueryClient();
  
  return (userId: number) => {
    queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
  };
}

// Invalidate all user-related queries
function useInvalidateAllUsers() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: userKeys.all });
  };
}
```

### Error Handling Patterns

```typescript
import { QueryClient, useQuery } from '@tanstack/react-query';

// Global error handler
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && error.message.includes('4')) {
          return false;
        }
        return failureCount < 3;
      },
      throwOnError: (error, query) => {
        // Throw on 500 errors to trigger Error Boundaries
        return error instanceof Error && error.message.includes('500');
      },
    },
  },
});

// Error boundary fallback
function ErrorFallback({ error, resetErrorBoundary }: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div role="alert">
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

// Custom error classes
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Enhanced fetch function
async function apiQuery(endpoint: string) {
  const response = await fetch(`/api${endpoint}`);
  
  if (!response.ok) {
    throw new ApiError(
      `API call failed: ${response.statusText}`,
      response.status,
      response.statusText
    );
  }
  
  return response.json();
}

// Error-aware query hook
function useApiQueryWithError<TData>(endpoint: string) {
  return useQuery({
    queryKey: [endpoint],
    queryFn: () => apiQuery(endpoint),
    select: (data): TData => data,
    meta: {
      errorMessage: `Failed to load data from ${endpoint}`,
    },
  });
}
```

### Background Sync Patterns

```typescript
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

// Polling hook
function usePolling(queryKey: string[], interval: number = 5000) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      queryClient.invalidateQueries({ queryKey });
    }, interval);
    
    return () => clearInterval(intervalId);
  }, [queryClient, queryKey, interval]);
}

// Real-time sync with WebSocket
function useRealtimeSync() {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const socket = new WebSocket('wss://api.example.com/ws');
    
    socket.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);
      
      switch (type) {
        case 'USER_UPDATED':
          queryClient.setQueryData(['user', data.id], data);
          break;
        case 'POST_CREATED':
          queryClient.invalidateQueries({ queryKey: ['posts'] });
          break;
        case 'POST_DELETED':
          queryClient.removeQueries({ queryKey: ['post', data.id] });
          queryClient.invalidateQueries({ queryKey: ['posts'] });
          break;
      }
    };
    
    return () => socket.close();
  }, [queryClient]);
}

// Focus refetch with custom logic
function useFocusRefetch(queryKey: string[], enabled: boolean = true) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!enabled) return;
    
    const handleFocus = () => {
      queryClient.invalidateQueries({ queryKey });
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [queryClient, queryKey, enabled]);
}
```

## Integration with Other Tools

### Next.js Integration

**App Router with Server Components**
```typescript
// app/posts/page.tsx
import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';
import PostsList from './PostsList';

async function PostsPage() {
  const queryClient = new QueryClient();
  
  // Prefetch data on the server
  await queryClient.prefetchQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const response = await fetch('https://api.example.com/posts');
      return response.json();
    },
  });
  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PostsList />
    </HydrationBoundary>
  );
}

// app/posts/PostsList.tsx (Client Component)
'use client';

import { useQuery } from '@tanstack/react-query';

export default function PostsList() {
  const { data: posts } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const response = await fetch('/api/posts');
      return response.json();
    },
    // Data is already hydrated from server
  });
  
  return (
    <div>
      {posts?.map((post: any) => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}
```

### Zustand Integration

```typescript
import { create } from 'zustand';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface AppStore {
  selectedUserId: number | null;
  setSelectedUserId: (id: number | null) => void;
}

const useAppStore = create<AppStore>((set) => ({
  selectedUserId: null,
  setSelectedUserId: (id) => set({ selectedUserId: id }),
}));

function UserSelector() {
  const { selectedUserId, setSelectedUserId } = useAppStore();
  const queryClient = useQueryClient();
  
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });
  
  const { data: selectedUser } = useQuery({
    queryKey: ['user', selectedUserId],
    queryFn: () => fetchUser(selectedUserId!),
    enabled: !!selectedUserId,
  });
  
  // Sync state with query cache
  const handleUserSelect = (userId: number) => {
    setSelectedUserId(userId);
    // Prefetch user details
    queryClient.prefetchQuery({
      queryKey: ['user', userId],
      queryFn: () => fetchUser(userId),
    });
  };
  
  return (
    <div>
      <select 
        value={selectedUserId || ''} 
        onChange={(e) => handleUserSelect(Number(e.target.value))}
      >
        <option value="">Select a user</option>
        {users?.map((user: any) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
      
      {selectedUser && (
        <div>
          <h3>{selectedUser.name}</h3>
          <p>{selectedUser.email}</p>
        </div>
      )}
    </div>
  );
}
```

### React Hook Form Integration

```typescript
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

type UserFormData = z.infer<typeof userSchema>;

function EditUserForm({ userId }: { userId: number }) {
  const queryClient = useQueryClient();
  
  // Fetch existing user data
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });
  
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });
  
  // Reset form when user data loads
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
      });
    }
  }, [user, form]);
  
  const updateUserMutation = useMutation({
    mutationFn: (data: UserFormData) => updateUser(userId, data),
    onMutate: async (newUserData) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: ['user', userId] });
      
      // Get current user data
      const previousUser = queryClient.getQueryData(['user', userId]);
      
      // Optimistically update
      if (previousUser) {
        queryClient.setQueryData(['user', userId], {
          ...previousUser,
          ...newUserData,
        });
      }
      
      return { previousUser };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(['user', userId], context.previousUser);
      }
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
  
  const onSubmit = (data: UserFormData) => {
    updateUserMutation.mutate(data);
  };
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('name')} placeholder="Name" />
      {form.formState.errors.name && (
        <span>{form.formState.errors.name.message}</span>
      )}
      
      <input {...form.register('email')} type="email" placeholder="Email" />
      {form.formState.errors.email && (
        <span>{form.formState.errors.email.message}</span>
      )}
      
      <button 
        type="submit" 
        disabled={updateUserMutation.isPending}
      >
        {updateUserMutation.isPending ? 'Updating...' : 'Update User'}
      </button>
    </form>
  );
}
```

## V5 New Features and Migration

### useMutationState Hook (New in v5)
```typescript
import { useMutationState } from '@tanstack/react-query';

// Track all mutations globally
function MutationMonitor() {
  const mutations = useMutationState();
  
  // Filter by specific mutation key
  const createPostMutations = useMutationState({
    filters: { mutationKey: ['createPost'] },
  });
  
  // Get only pending mutations
  const pendingMutations = useMutationState({
    filters: { status: 'pending' },
  });
  
  // Select specific data from mutations
  const mutationErrors = useMutationState({
    select: (mutation) => mutation.state.error,
  });
  
  return (
    <div>
      <div>Active mutations: {pendingMutations.length}</div>
      {mutationErrors.map((error, index) => 
        error && <div key={index}>Error: {error.message}</div>
      )}
    </div>
  );
}

// Global loading indicator
function GlobalLoadingIndicator() {
  const pendingMutations = useMutationState({
    filters: { status: 'pending' },
  });
  
  if (pendingMutations.length > 0) {
    return <div className="global-loader">Saving changes...</div>;
  }
  
  return null;
}
```

### Improved Infinite Query with maxPages
```typescript
import { useInfiniteQuery } from '@tanstack/react-query';

function LimitedInfiniteList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['posts', 'infinite'],
    queryFn: async ({ pageParam }) => {
      const response = await fetch(`/api/posts?page=${pageParam}`);
      return response.json();
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    maxPages: 3, // New in v5: Limit cached pages for memory optimization
    getPreviousPageParam: (firstPage, allPages) => {
      return allPages.length > 1 ? allPages.length - 1 : undefined;
    },
  });
  
  // Bi-directional infinite scrolling
  const {
    fetchPreviousPage,
    hasPreviousPage,
    isFetchingPreviousPage,
  } = useInfiniteQuery({
    queryKey: ['messages', 'chat'],
    queryFn: fetchMessages,
    initialPageParam: Date.now(),
    getNextPageParam: (lastPage) => lastPage.oldestTimestamp,
    getPreviousPageParam: (firstPage) => firstPage.newestTimestamp,
  });
}
```

### Query Combining and Dependent Queries
```typescript
import { useQueries, useSuspenseQueries } from '@tanstack/react-query';

// Combine multiple queries with type safety
function useCombinedData(userIds: number[]) {
  const userQueries = useQueries({
    queries: userIds.map(id => ({
      queryKey: ['user', id],
      queryFn: () => fetchUser(id),
      staleTime: 5 * 60 * 1000,
    })),
    combine: (results) => {
      return {
        data: results.map(result => result.data).filter(Boolean),
        isPending: results.some(result => result.isPending),
        isError: results.some(result => result.isError),
        errors: results
          .filter(result => result.error)
          .map(result => result.error),
      };
    },
  });
  
  return userQueries;
}

// Suspense queries with combining
function SuspenseCombinedQueries({ postIds }: { postIds: number[] }) {
  const posts = useSuspenseQueries({
    queries: postIds.map(id => ({
      queryKey: ['post', id],
      queryFn: () => fetchPost(id),
    })),
  });
  
  // All data is guaranteed to be defined with suspense
  return (
    <div>
      {posts.map((post, index) => (
        <article key={postIds[index]}>
          <h3>{post.data.title}</h3>
        </article>
      ))}
    </div>
  );
}
```

## Advanced SSR Patterns

### Next.js 14+ App Router with Streaming
```typescript
// app/layout.tsx
import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: reuse query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();
  
  return (
    <html>
      <body>
        <QueryClientProvider client={queryClient}>
          <ReactQueryStreamedHydration>
            {children}
          </ReactQueryStreamedHydration>
        </QueryClientProvider>
      </body>
    </html>
  );
}

// app/posts/[id]/page.tsx
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';

export default async function PostPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const queryClient = getQueryClient();
  
  // Prefetch on server
  void queryClient.prefetchQuery({
    queryKey: ['post', params.id],
    queryFn: () => fetchPost(params.id),
  });
  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<PostSkeleton />}>
        <PostContent id={params.id} />
      </Suspense>
    </HydrationBoundary>
  );
}
```

### Progressive Enhancement with RSC
```typescript
// Server Component with data fetching
async function PostList() {
  const posts = await fetch('https://api.example.com/posts', {
    next: { revalidate: 60 }, // Next.js caching
  }).then(res => res.json());
  
  return (
    <div>
      {posts.map((post: any) => (
        <PostCard key={post.id} post={post} />
      ))}
      <ClientSideInfiniteLoader initialPosts={posts} />
    </div>
  );
}

// Client Component for infinite scrolling
'use client';

function ClientSideInfiniteLoader({ initialPosts }: { initialPosts: Post[] }) {
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['posts', 'infinite'],
    queryFn: fetchPosts,
    initialPageParam: 2, // Start from page 2 since we have initial data
    getNextPageParam: (lastPage, pages) => lastPage.nextPage,
    // Use initial posts as first page
    placeholderData: {
      pages: [{ posts: initialPosts, nextPage: 2 }],
      pageParams: [1],
    },
  });
  
  return (
    <button onClick={() => fetchNextPage()} disabled={!hasNextPage}>
      Load More
    </button>
  );
}
```

## Real-time Synchronization Patterns

### WebSocket Integration with Automatic Reconnection
```typescript
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

interface WebSocketMessage {
  type: 'update' | 'delete' | 'create';
  entity: 'user' | 'post' | 'comment';
  data: any;
}

function useRealtimeSync(url: string) {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  
  const connect = () => {
    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      reconnectAttempts.current = 0;
    };
    
    ws.onmessage = (event) => {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      switch (message.type) {
        case 'update':
          // Update specific cache entry
          queryClient.setQueryData(
            [message.entity, message.data.id],
            message.data
          );
          // Invalidate list queries
          queryClient.invalidateQueries({
            queryKey: [message.entity, 'list'],
            exact: false,
          });
          break;
          
        case 'create':
          // Invalidate list queries to refetch
          queryClient.invalidateQueries({
            queryKey: [message.entity],
            exact: false,
          });
          break;
          
        case 'delete':
          // Remove from cache
          queryClient.removeQueries({
            queryKey: [message.entity, message.data.id],
          });
          // Invalidate lists
          queryClient.invalidateQueries({
            queryKey: [message.entity],
            exact: false,
          });
          break;
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
      wsRef.current = null;
      
      // Exponential backoff reconnection
      const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
      reconnectAttempts.current++;
      
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log(`Reconnecting... (attempt ${reconnectAttempts.current})`);
        connect();
      }, timeout);
    };
    
    wsRef.current = ws;
  };
  
  useEffect(() => {
    connect();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [url]);
  
  // Send message through WebSocket
  const sendMessage = (message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  };
  
  return { sendMessage };
}
```

### Server-Sent Events (SSE) Integration
```typescript
function useServerSentEvents(endpoint: string) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const eventSource = new EventSource(endpoint);
    
    eventSource.addEventListener('update', (event) => {
      const data = JSON.parse(event.data);
      
      // Update cache with new data
      queryClient.setQueryData(
        ['resource', data.id],
        (oldData: any) => ({ ...oldData, ...data })
      );
    });
    
    eventSource.addEventListener('invalidate', (event) => {
      const { queryKey } = JSON.parse(event.data);
      queryClient.invalidateQueries({ queryKey });
    });
    
    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      eventSource.close();
      
      // Fallback to polling
      const interval = setInterval(() => {
        queryClient.invalidateQueries();
      }, 30000);
      
      setTimeout(() => {
        clearInterval(interval);
        // Try to reconnect
      }, 5000);
    };
    
    return () => {
      eventSource.close();
    };
  }, [endpoint, queryClient]);
}
```

### Pusher Integration
```typescript
import Pusher from 'pusher-js';

function usePusherSync(channelName: string) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
    
    const channel = pusher.subscribe(channelName);
    
    // Listen for CRUD events
    channel.bind('entity-updated', (data: any) => {
      queryClient.setQueryData(
        [data.entity, data.id],
        data.payload
      );
    });
    
    channel.bind('entity-created', (data: any) => {
      queryClient.invalidateQueries({
        queryKey: [data.entity],
      });
    });
    
    channel.bind('entity-deleted', (data: any) => {
      queryClient.removeQueries({
        queryKey: [data.entity, data.id],
      });
      queryClient.invalidateQueries({
        queryKey: [data.entity, 'list'],
      });
    });
    
    // Batch updates
    channel.bind('batch-update', (data: any) => {
      queryClient.setQueriesData(
        { queryKey: [data.entity] },
        (oldData: any) => {
          // Merge batch updates
          return data.updates.reduce((acc: any, update: any) => {
            const index = acc.findIndex((item: any) => item.id === update.id);
            if (index !== -1) {
              acc[index] = { ...acc[index], ...update };
            }
            return acc;
          }, oldData || []);
        }
      );
    });
    
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [channelName, queryClient]);
}
```

## Performance Optimization

### Query Preloading and Prefetching
```typescript
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

function usePreloadOnHover() {
  const queryClient = useQueryClient();
  
  const preloadUser = (userId: number) => {
    queryClient.prefetchQuery({
      queryKey: ['user', userId],
      queryFn: () => fetchUser(userId),
      staleTime: 10 * 1000, // Only prefetch if data is older than 10s
    });
  };
  
  const preloadPost = (postId: number) => {
    queryClient.prefetchQuery({
      queryKey: ['post', postId],
      queryFn: () => fetchPost(postId),
    });
  };
  
  return { preloadUser, preloadPost };
}

// Component using preloading
function PostLink({ post }: { post: Post }) {
  const { preloadPost } = usePreloadOnHover();
  const router = useRouter();
  
  return (
    <a
      href={`/posts/${post.id}`}
      onMouseEnter={() => preloadPost(post.id)}
      onFocus={() => preloadPost(post.id)}
      onClick={(e) => {
        e.preventDefault();
        router.push(`/posts/${post.id}`);
      }}
    >
      {post.title}
    </a>
  );
}
```

### Smart Cache Management
```typescript
import { QueryClient } from '@tanstack/react-query';

// Configure intelligent garbage collection
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: (query) => {
        // Only refetch if data is actually stale
        return query.state.dataUpdateCount === 0;
      },
    },
  },
});

// Memory-aware cache management
function useMemoryAwareCaching() {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Monitor memory usage
    if ('memory' in performance) {
      const checkMemory = () => {
        const memory = (performance as any).memory;
        const usedMemory = memory.usedJSHeapSize;
        const totalMemory = memory.jsHeapSizeLimit;
        const usage = usedMemory / totalMemory;
        
        if (usage > 0.9) {
          // Clear old cache entries when memory is high
          queryClient.removeQueries({
            predicate: (query) => {
              const isStale = Date.now() - query.state.dataUpdatedAt > 600000; // 10 min
              const isInactive = query.getObserversCount() === 0;
              return isStale && isInactive;
            },
          });
        }
      };
      
      const interval = setInterval(checkMemory, 30000);
      return () => clearInterval(interval);
    }
  }, [queryClient]);
}
```

### Request Deduplication and Batching
```typescript
// Batch multiple requests into one
class BatchedFetcher {
  private queue: Map<string, {
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }[]> = new Map();
  
  private timer: NodeJS.Timeout | null = null;
  
  async fetch(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.queue.has(id)) {
        this.queue.set(id, []);
      }
      
      this.queue.get(id)!.push({ resolve, reject });
      
      if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), 10);
      }
    });
  }
  
  private async flush() {
    const ids = Array.from(this.queue.keys());
    const callbacks = new Map(this.queue);
    
    this.queue.clear();
    this.timer = null;
    
    try {
      const response = await fetch('/api/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      
      const results = await response.json();
      
      ids.forEach(id => {
        const cbs = callbacks.get(id) || [];
        const result = results[id];
        
        if (result) {
          cbs.forEach(cb => cb.resolve(result));
        } else {
          cbs.forEach(cb => cb.reject(new Error('Not found')));
        }
      });
    } catch (error) {
      callbacks.forEach(cbs => {
        cbs.forEach(cb => cb.reject(error));
      });
    }
  }
}

const batchedFetcher = new BatchedFetcher();

// Use in queries
function useBatchedUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => batchedFetcher.fetch(userId),
  });
}
```

## Testing Strategies

### Testing with Mock Service Worker (MSW)
```typescript
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

// Setup MSW server
const server = setupServer(
  http.get('/api/user/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'Test User',
      email: 'test@example.com',
    });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Test utilities
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

// Test hooks
describe('useUser', () => {
  it('should fetch user data', async () => {
    const { result } = renderHook(() => useUser(1), {
      wrapper: createWrapper(),
    });
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    
    expect(result.current.data).toEqual({
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
    });
  });
  
  it('should handle errors', async () => {
    server.use(
      http.get('/api/user/:id', () => {
        return HttpResponse.error();
      })
    );
    
    const { result } = renderHook(() => useUser(1), {
      wrapper: createWrapper(),
    });
    
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
```

### Testing Mutations
```typescript
import userEvent from '@testing-library/user-event';

describe('CreatePostForm', () => {
  it('should create post and update cache', async () => {
    const user = userEvent.setup();
    
    server.use(
      http.post('/api/posts', async ({ request }) => {
        const body = await request.json();
        return HttpResponse.json({
          id: 1,
          ...body,
          createdAt: new Date().toISOString(),
        });
      })
    );
    
    render(<CreatePostForm />, { wrapper: createWrapper() });
    
    await user.type(screen.getByLabelText('Title'), 'Test Post');
    await user.type(screen.getByLabelText('Content'), 'Test content');
    await user.click(screen.getByRole('button', { name: 'Create Post' }));
    
    await waitFor(() => {
      expect(screen.getByText('Post created successfully')).toBeInTheDocument();
    });
    
    // Verify cache was updated
    const queryClient = new QueryClient();
    const cachedPost = queryClient.getQueryData(['post', 1]);
    expect(cachedPost).toMatchObject({
      title: 'Test Post',
      content: 'Test content',
    });
  });
});
```

TanStack Query v5 provides a robust, type-safe solution for data fetching and state synchronization in React applications. With new features like useMutationState, improved infinite queries, and enhanced SSR support, it's the ideal choice for building modern, real-time applications with optimal performance and developer experience.