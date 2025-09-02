# Zustand - React State Management

A small, fast, and scalable bearbones state-management solution using simplified flux principles. Zustand makes React state management simple, straightforward, and fun without the boilerplate of Redux or the complexity of Context API.

## Core Concepts and Philosophy

- **Simple**: No providers, no reducers, no action types
- **Unopinionated**: Works with any React pattern (hooks, classes, render props)
- **TypeScript-first**: Built with TypeScript support from the ground up
- **Small bundle size**: Just 2.9kB gzipped
- **Developer-friendly**: Easy debugging with Redux DevTools support
- **Framework agnostic**: Works with React, React Native, and vanilla JavaScript

## Installation and Setup

### Basic Installation

```bash
npm install zustand
```

### Basic Store Setup

```typescript
import { create } from 'zustand';

interface CountStore {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

const useCountStore = create<CountStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));
```

## Key API Methods and Patterns

### Creating Stores

**Basic Store Pattern**
```typescript
import { create } from 'zustand';

interface UserStore {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.login(email, password);
      set({ user, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  logout: () => {
    authService.logout();
    set({ user: null, error: null });
  },
  
  setUser: (user) => set({ user }),
}));
```

**Immer Integration for Complex State**
```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface TodoStore {
  todos: Todo[];
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
}

const useTodoStore = create<TodoStore>()(
  immer((set) => ({
    todos: [],
    
    addTodo: (text) =>
      set((state) => {
        state.todos.push({
          id: crypto.randomUUID(),
          text,
          completed: false,
          createdAt: new Date(),
        });
      }),
    
    toggleTodo: (id) =>
      set((state) => {
        const todo = state.todos.find((t) => t.id === id);
        if (todo) {
          todo.completed = !todo.completed;
        }
      }),
    
    updateTodo: (id, updates) =>
      set((state) => {
        const index = state.todos.findIndex((t) => t.id === id);
        if (index !== -1) {
          Object.assign(state.todos[index], updates);
        }
      }),
    
    deleteTodo: (id) =>
      set((state) => {
        state.todos = state.todos.filter((t) => t.id !== id);
      }),
  }))
);
```

### Accessing State

**Using Store in Components**
```typescript
import { useCountStore } from './stores/countStore';

function Counter() {
  const { count, increment, decrement, reset } = useCountStore();
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}

// Selective subscription (performance optimization)
function CounterDisplay() {
  const count = useCountStore((state) => state.count);
  
  return <div>Current count: {count}</div>;
}
```

**Computed Values and Selectors**
```typescript
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface ShoppingCartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  // Computed values
  totalItems: () => number;
  totalPrice: () => number;
  isEmpty: () => boolean;
}

const useShoppingCartStore = create<ShoppingCartStore>()(
  subscribeWithSelector((set, get) => ({
    items: [],
    
    addItem: (item) =>
      set((state) => {
        const existingItem = state.items.find(i => i.id === item.id);
        if (existingItem) {
          return {
            items: state.items.map(i =>
              i.id === item.id 
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            )
          };
        }
        return { items: [...state.items, item] };
      }),
    
    removeItem: (id) =>
      set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),
    
    updateQuantity: (id, quantity) =>
      set((state) => ({
        items: state.items.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
      })),
    
    // Computed values
    totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: () => get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    isEmpty: () => get().items.length === 0,
  }))
);

// Using computed values in components
function CartSummary() {
  const { totalItems, totalPrice, isEmpty } = useShoppingCartStore();
  
  if (isEmpty()) {
    return <div>Your cart is empty</div>;
  }
  
  return (
    <div>
      <p>Items: {totalItems()}</p>
      <p>Total: ${totalPrice().toFixed(2)}</p>
    </div>
  );
}
```

## TypeScript Usage Examples

### Advanced TypeScript Patterns

**Store Slices Pattern**
```typescript
import { StateCreator } from 'zustand';

// Auth slice
interface AuthSlice {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  user: null,
  isAuthenticated: false,
  
  login: async (credentials) => {
    try {
      const user = await authService.login(credentials);
      set({ user, isAuthenticated: true });
    } catch (error) {
      throw error;
    }
  },
  
  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
  },
});

// Settings slice
interface SettingsSlice {
  theme: 'light' | 'dark';
  language: string;
  notifications: boolean;
  updateTheme: (theme: 'light' | 'dark') => void;
  updateLanguage: (language: string) => void;
  toggleNotifications: () => void;
}

const createSettingsSlice: StateCreator<SettingsSlice> = (set) => ({
  theme: 'light',
  language: 'en',
  notifications: true,
  
  updateTheme: (theme) => set({ theme }),
  updateLanguage: (language) => set({ language }),
  toggleNotifications: () => set((state) => ({ 
    notifications: !state.notifications 
  })),
});

// Combined store
type AppStore = AuthSlice & SettingsSlice;

const useAppStore = create<AppStore>()(
  (...args) => ({
    ...createAuthSlice(...args),
    ...createSettingsSlice(...args),
  })
);
```

**Generic Store Pattern**
```typescript
interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CrudStore<T extends BaseEntity> {
  items: T[];
  isLoading: boolean;
  error: string | null;
  selectedItem: T | null;
  
  // Actions
  fetchItems: () => Promise<void>;
  fetchItem: (id: string) => Promise<void>;
  createItem: (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateItem: (id: string, data: Partial<T>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  setSelectedItem: (item: T | null) => void;
  
  // Getters
  getItemById: (id: string) => T | undefined;
  getFilteredItems: (predicate: (item: T) => boolean) => T[];
}

function createCrudStore<T extends BaseEntity>(
  apiService: {
    getAll: () => Promise<T[]>;
    getById: (id: string) => Promise<T>;
    create: (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => Promise<T>;
    update: (id: string, data: Partial<T>) => Promise<T>;
    delete: (id: string) => Promise<void>;
  }
) {
  return create<CrudStore<T>>((set, get) => ({
    items: [],
    isLoading: false,
    error: null,
    selectedItem: null,
    
    fetchItems: async () => {
      set({ isLoading: true, error: null });
      try {
        const items = await apiService.getAll();
        set({ items, isLoading: false });
      } catch (error) {
        set({ error: error.message, isLoading: false });
      }
    },
    
    createItem: async (data) => {
      try {
        const newItem = await apiService.create(data);
        set((state) => ({ 
          items: [...state.items, newItem] 
        }));
      } catch (error) {
        set({ error: error.message });
      }
    },
    
    updateItem: async (id, data) => {
      try {
        const updatedItem = await apiService.update(id, data);
        set((state) => ({
          items: state.items.map(item => 
            item.id === id ? updatedItem : item
          )
        }));
      } catch (error) {
        set({ error: error.message });
      }
    },
    
    deleteItem: async (id) => {
      try {
        await apiService.delete(id);
        set((state) => ({
          items: state.items.filter(item => item.id !== id)
        }));
      } catch (error) {
        set({ error: error.message });
      }
    },
    
    setSelectedItem: (item) => set({ selectedItem: item }),
    
    getItemById: (id) => get().items.find(item => item.id === id),
    getFilteredItems: (predicate) => get().items.filter(predicate),
  }));
}

// Usage
interface User extends BaseEntity {
  name: string;
  email: string;
  role: 'admin' | 'user';
}

const useUserStore = createCrudStore<User>(userApiService);
```

## Best Practices and Common Patterns

### Middleware Usage

**DevTools Middleware**
```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useStore = create<Store>()(
  devtools(
    (set, get) => ({
      // store implementation
    }),
    {
      name: 'app-store',
      serialize: { options: true },
    }
  )
);
```

**Persist Middleware**
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface PersistedStore {
  theme: 'light' | 'dark';
  language: string;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: string) => void;
}

const useSettingsStore = create<PersistedStore>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'en',
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'app-settings',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        theme: state.theme, 
        language: state.language 
      }),
    }
  )
);
```

**Subscribe to State Changes**
```typescript
import { subscribeWithSelector } from 'zustand/middleware';

const useStore = create<Store>()(
  subscribeWithSelector((set, get) => ({
    // store implementation
  }))
);

// Subscribe to specific state changes
useStore.subscribe(
  (state) => state.user,
  (user, prevUser) => {
    if (user && !prevUser) {
      console.log('User logged in:', user);
    }
  }
);

// Subscribe to multiple values
useStore.subscribe(
  (state) => [state.theme, state.language],
  ([theme, language]) => {
    updateDocumentTheme(theme);
    updateDocumentLanguage(language);
  },
  { equalityFn: shallow }
);
```

### Performance Optimization

**Selective Subscriptions**
```typescript
// ❌ Re-renders on any state change
function BadComponent() {
  const store = useStore();
  return <div>{store.user.name}</div>;
}

// ✅ Only re-renders when user.name changes
function GoodComponent() {
  const userName = useStore((state) => state.user.name);
  return <div>{userName}</div>;
}

// ✅ Using shallow equality for objects/arrays
import { shallow } from 'zustand/shallow';

function OptimizedComponent() {
  const { user, settings } = useStore(
    (state) => ({ user: state.user, settings: state.settings }),
    shallow
  );
  
  return (
    <div>
      <p>{user.name}</p>
      <p>Theme: {settings.theme}</p>
    </div>
  );
}
```

**Computed Selectors**
```typescript
import { useMemo } from 'react';

const useFilteredTodos = (filter: 'all' | 'completed' | 'pending') => {
  return useTodoStore(
    useMemo(
      () => (state) => {
        switch (filter) {
          case 'completed':
            return state.todos.filter(todo => todo.completed);
          case 'pending':
            return state.todos.filter(todo => !todo.completed);
          default:
            return state.todos;
        }
      },
      [filter]
    )
  );
};
```

## Integration with Other Tools

### Next.js Integration

**App Router with Server Components**
```typescript
// stores/userStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserStore {
  user: User | null;
  hydrated: boolean;
  setUser: (user: User | null) => void;
  setHydrated: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      hydrated: false,
      setUser: (user) => set({ user }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'user-store',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);

// components/UserProvider.tsx
'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';

export function UserProvider({ children, initialUser }: {
  children: React.ReactNode;
  initialUser: User | null;
}) {
  const setUser = useUserStore(state => state.setUser);
  
  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
    }
  }, [initialUser, setUser]);
  
  return <>{children}</>;
}

// app/layout.tsx
import { UserProvider } from '@/components/UserProvider';
import { getServerSession } from 'next-auth';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  
  return (
    <html>
      <body>
        <UserProvider initialUser={session?.user || null}>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
```

### React Query Integration

```typescript
import { create } from 'zustand';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface PostsStore {
  selectedPostId: string | null;
  setSelectedPostId: (id: string | null) => void;
}

const usePostsStore = create<PostsStore>((set) => ({
  selectedPostId: null,
  setSelectedPostId: (id) => set({ selectedPostId: id }),
}));

// Use together in components
function PostsList() {
  const { selectedPostId, setSelectedPostId } = usePostsStore();
  const queryClient = useQueryClient();
  
  const { data: posts } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  });
  
  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
  
  return (
    <div>
      {posts?.map(post => (
        <div 
          key={post.id}
          onClick={() => setSelectedPostId(post.id)}
          className={selectedPostId === post.id ? 'selected' : ''}
        >
          {post.title}
        </div>
      ))}
    </div>
  );
}
```

### Form Integration

```typescript
import { create } from 'zustand';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface FormStore {
  formData: any;
  isSubmitting: boolean;
  setFormData: (data: any) => void;
  setSubmitting: (submitting: boolean) => void;
  reset: () => void;
}

const useFormStore = create<FormStore>((set) => ({
  formData: {},
  isSubmitting: false,
  setFormData: (data) => set({ formData: data }),
  setSubmitting: (submitting) => set({ isSubmitting: submitting }),
  reset: () => set({ formData: {}, isSubmitting: false }),
}));

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

function UserForm() {
  const { setFormData, setSubmitting, isSubmitting } = useFormStore();
  
  const form = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });
  
  const onSubmit = async (data: z.infer<typeof userSchema>) => {
    setSubmitting(true);
    setFormData(data);
    
    try {
      await submitUser(data);
      form.reset();
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

## Advanced Middleware Patterns

### Custom Middleware Creation
```typescript
import { StateCreator, StoreMutatorIdentifier } from 'zustand';

// Logging middleware
type Logger = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  f: StateCreator<T, Mps, Mcs>,
  name?: string
) => StateCreator<T, Mps, Mcs>;

type LoggerImpl = <T>(
  f: StateCreator<T, [], []>,
  name?: string
) => StateCreator<T, [], []>;

const loggerImpl: LoggerImpl = (f, name) => (set, get, store) => {
  const loggedSet: typeof set = (...args) => {
    console.log(`[${name || 'Store'}] Previous state:`, get());
    set(...args);
    console.log(`[${name || 'Store'}] New state:`, get());
  };
  
  store.setState = loggedSet;
  return f(loggedSet, get, store);
};

export const logger = loggerImpl as Logger;

// Undo/Redo middleware
interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

type UndoRedo = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  f: StateCreator<T & UndoRedoActions, Mps, Mcs>,
  options?: UndoRedoOptions
) => StateCreator<T & UndoRedoActions, Mps, Mcs>;

interface UndoRedoActions {
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
}

interface UndoRedoOptions {
  limit?: number;
  equality?: (a: any, b: any) => boolean;
}

export const undoRedo: UndoRedo = (f, options = {}) => (set, get, store) => {
  const { limit = 50, equality = Object.is } = options;
  let history: UndoRedoState<any> = {
    past: [],
    present: get(),
    future: [],
  };
  
  const undoRedoSet: typeof set = (partial, replace) => {
    const nextState = typeof partial === 'function' 
      ? partial(get()) 
      : partial;
      
    if (!equality(nextState, history.present)) {
      history = {
        past: [...history.past, history.present].slice(-limit),
        present: nextState,
        future: [],
      };
    }
    
    set(partial, replace);
  };
  
  store.setState = undoRedoSet;
  
  return f(
    (partial, replace) => {
      undoRedoSet(partial, replace);
    },
    get,
    {
      ...store,
      setState: undoRedoSet,
    }
  );
};

// Usage
const useCounterStore = create<CounterState & UndoRedoActions>()(
  logger(
    undoRedo(
      (set, get) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 })),
        decrement: () => set((state) => ({ count: state.count - 1 })),
        
        undo: () => {
          if (history.past.length > 0) {
            const previous = history.past[history.past.length - 1];
            history = {
              past: history.past.slice(0, -1),
              present: previous,
              future: [history.present, ...history.future],
            };
            set(previous);
          }
        },
        
        redo: () => {
          if (history.future.length > 0) {
            const next = history.future[0];
            history = {
              past: [...history.past, history.present],
              present: next,
              future: history.future.slice(1),
            };
            set(next);
          }
        },
        
        canUndo: () => history.past.length > 0,
        canRedo: () => history.future.length > 0,
        clearHistory: () => {
          history = {
            past: [],
            present: get(),
            future: [],
          };
        },
      }),
      { limit: 20 }
    ),
    'CounterStore'
  )
);
```

### Advanced Persistence Strategies
```typescript
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';

// Custom IndexedDB storage
const indexedDBStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const db = await openDB();
    const tx = db.transaction('zustand', 'readonly');
    const store = tx.objectStore('zustand');
    const result = await store.get(name);
    return result?.value || null;
  },
  
  setItem: async (name: string, value: string): Promise<void> => {
    const db = await openDB();
    const tx = db.transaction('zustand', 'readwrite');
    const store = tx.objectStore('zustand');
    await store.put({ key: name, value });
  },
  
  removeItem: async (name: string): Promise<void> => {
    const db = await openDB();
    const tx = db.transaction('zustand', 'readwrite');
    const store = tx.objectStore('zustand');
    await store.delete(name);
  },
};

async function openDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('zustand-db', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('zustand')) {
        db.createObjectStore('zustand', { keyPath: 'key' });
      }
    };
  });
}

// Encrypted storage
import CryptoJS from 'crypto-js';

const createEncryptedStorage = (secretKey: string): StateStorage => ({
  getItem: (name: string): string | null => {
    const encrypted = localStorage.getItem(name);
    if (!encrypted) return null;
    
    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch {
      return null;
    }
  },
  
  setItem: (name: string, value: string): void => {
    const encrypted = CryptoJS.AES.encrypt(value, secretKey).toString();
    localStorage.setItem(name, encrypted);
  },
  
  removeItem: (name: string): void => {
    localStorage.removeItem(name);
  },
});

// Multi-storage persistence
const useSecureStore = create<SecureStore>()(
  persist(
    (set, get) => ({
      sensitiveData: null,
      publicData: null,
      setSensitiveData: (data) => set({ sensitiveData: data }),
      setPublicData: (data) => set({ publicData: data }),
    }),
    {
      name: 'secure-store',
      storage: createEncryptedStorage(process.env.REACT_APP_ENCRYPTION_KEY!),
      partialize: (state) => ({ sensitiveData: state.sensitiveData }),
    }
  )
);

// Conditional persistence
const useConditionalStore = create<ConditionalStore>()(
  persist(
    (set, get) => ({
      userPreferences: {},
      temporaryData: {},
      updatePreferences: (prefs) => set({ userPreferences: prefs }),
      setTemporaryData: (data) => set({ temporaryData: data }),
    }),
    {
      name: 'conditional-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ userPreferences: state.userPreferences }),
      // Only persist if user is logged in
      skipHydration: !isUserLoggedIn(),
    }
  )
);
```

### State Synchronization Across Tabs
```typescript
import { StateCreator } from 'zustand';

// Broadcast channel middleware for cross-tab sync
type BroadcastSync = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  f: StateCreator<T, Mps, Mcs>,
  channelName: string
) => StateCreator<T, Mps, Mcs>;

export const broadcastSync: BroadcastSync = (f, channelName) => (set, get, store) => {
  let channel: BroadcastChannel;
  
  if (typeof window !== 'undefined') {
    channel = new BroadcastChannel(channelName);
    
    channel.onmessage = (event) => {
      if (event.data.type === 'STATE_UPDATE') {
        set(event.data.state, true); // Replace entire state
      }
    };
  }
  
  const broadcastSet: typeof set = (partial, replace) => {
    set(partial, replace);
    
    if (channel) {
      const newState = typeof partial === 'function' ? partial(get()) : partial;
      channel.postMessage({
        type: 'STATE_UPDATE',
        state: newState,
        timestamp: Date.now(),
      });
    }
  };
  
  store.setState = broadcastSet;
  return f(broadcastSet, get, store);
};

// WebSocket synchronization
interface WebSocketSyncOptions {
  url: string;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}

export const websocketSync = <T>(
  f: StateCreator<T>,
  options: WebSocketSyncOptions
) => (set: any, get: any, store: any) => {
  let ws: WebSocket | null = null;
  let reconnectAttempts = 0;
  const { url, reconnectDelay = 1000, maxReconnectAttempts = 5 } = options;
  
  const connect = () => {
    ws = new WebSocket(url);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      reconnectAttempts = 0;
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'STATE_UPDATE') {
          set(data.state, true);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
      if (reconnectAttempts < maxReconnectAttempts) {
        setTimeout(() => {
          reconnectAttempts++;
          connect();
        }, reconnectDelay * Math.pow(2, reconnectAttempts));
      }
    };
  };
  
  if (typeof window !== 'undefined') {
    connect();
  }
  
  const syncSet: typeof set = (partial, replace) => {
    set(partial, replace);
    
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'STATE_UPDATE',
        state: typeof partial === 'function' ? partial(get()) : partial,
      }));
    }
  };
  
  store.setState = syncSet;
  return f(syncSet, get, store);
};
```

## Performance Optimization Techniques

### Memory Management and Cleanup
```typescript
import { useEffect, useRef } from 'react';

// Cleanup utility for component unmount
export const useStoreCleanup = (cleanupFn: () => void) => {
  const cleanupRef = useRef(cleanupFn);
  cleanupRef.current = cleanupFn;
  
  useEffect(() => {
    return () => {
      cleanupRef.current();
    };
  }, []);
};

// Memory-aware store with cleanup
interface MemoryAwareStore {
  cache: Map<string, any>;
  maxCacheSize: number;
  addToCache: (key: string, value: any) => void;
  getFromCache: (key: string) => any;
  clearCache: () => void;
  cleanupOldEntries: () => void;
}

const useMemoryAwareStore = create<MemoryAwareStore>((set, get) => ({
  cache: new Map(),
  maxCacheSize: 100,
  
  addToCache: (key, value) => {
    const { cache, maxCacheSize } = get();
    
    if (cache.size >= maxCacheSize) {
      // Remove oldest entry (first entry in Map)
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    cache.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: 0,
    });
    
    set({ cache: new Map(cache) });
  },
  
  getFromCache: (key) => {
    const { cache } = get();
    const entry = cache.get(key);
    
    if (entry) {
      entry.accessCount++;
      entry.lastAccess = Date.now();
    }
    
    return entry?.value;
  },
  
  clearCache: () => set({ cache: new Map() }),
  
  cleanupOldEntries: () => {
    const { cache } = get();
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    
    for (const [key, entry] of cache.entries()) {
      if (entry.timestamp < oneHourAgo && entry.accessCount === 0) {
        cache.delete(key);
      }
    }
    
    set({ cache: new Map(cache) });
  },
}));

// Auto-cleanup hook
export const useAutoCleanup = () => {
  const cleanupOldEntries = useMemoryAwareStore(state => state.cleanupOldEntries);
  
  useEffect(() => {
    const interval = setInterval(cleanupOldEntries, 5 * 60 * 1000); // Every 5 minutes
    return () => clearInterval(interval);
  }, [cleanupOldEntries]);
};
```

### Advanced Selectors and Memoization
```typescript
import { useMemo, useCallback } from 'react';
import { create } from 'zustand';
import { shallow } from 'zustand/shallow';

// Memoized selector factory
export const createMemoizedSelector = <State, Selected>(
  selector: (state: State) => Selected,
  deps: any[] = []
) => {
  return useMemo(() => selector, deps);
};

// Complex computed selectors
interface TodoStore {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
  searchTerm: string;
}

const useTodoStore = create<TodoStore>(() => ({
  todos: [],
  filter: 'all',
  searchTerm: '',
}));

// Optimized selectors with caching
const createCachedSelector = <State, Args extends any[], Result>(
  fn: (state: State, ...args: Args) => Result
) => {
  const cache = new Map<string, { result: Result; timestamp: number }>();
  const CACHE_DURATION = 5000; // 5 seconds
  
  return (state: State, ...args: Args): Result => {
    const key = JSON.stringify([state, ...args]);
    const cached = cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.result;
    }
    
    const result = fn(state, ...args);
    cache.set(key, { result, timestamp: Date.now() });
    
    // Cleanup old cache entries
    if (cache.size > 50) {
      const entries = Array.from(cache.entries());
      entries
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)
        .slice(0, 25)
        .forEach(([key]) => cache.delete(key));
    }
    
    return result;
  };
};

// Usage in hooks
export const useFilteredTodos = () => {
  return useTodoStore(
    useCallback(
      createCachedSelector((state: TodoStore) => {
        let filtered = state.todos;
        
        // Apply filter
        switch (state.filter) {
          case 'active':
            filtered = filtered.filter(todo => !todo.completed);
            break;
          case 'completed':
            filtered = filtered.filter(todo => todo.completed);
            break;
        }
        
        // Apply search
        if (state.searchTerm) {
          filtered = filtered.filter(todo =>
            todo.title.toLowerCase().includes(state.searchTerm.toLowerCase())
          );
        }
        
        return filtered;
      }),
      []
    )
  );
};

// Performance monitoring selector
export const usePerformanceMonitoring = () => {
  const startTime = useRef(performance.now());
  
  return useTodoStore(
    useCallback((state) => {
      const endTime = performance.now();
      const renderTime = endTime - startTime.current;
      
      if (renderTime > 16) { // More than 16ms (60fps threshold)
        console.warn(`Slow selector render: ${renderTime}ms`);
      }
      
      startTime.current = endTime;
      return state;
    }, [])
  );
};
```

## Testing Strategies

### Unit Testing Stores
```typescript
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';

// Test utilities
const createTestStore = () => {
  return create<CounterStore>((set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
    reset: () => set({ count: 0 }),
  }));
};

describe('CounterStore', () => {
  let store: ReturnType<typeof createTestStore>;
  
  beforeEach(() => {
    store = createTestStore();
  });
  
  it('should initialize with default state', () => {
    const { result } = renderHook(() => store());
    expect(result.current.count).toBe(0);
  });
  
  it('should increment count', () => {
    const { result } = renderHook(() => store());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
  
  it('should handle multiple actions', () => {
    const { result } = renderHook(() => store());
    
    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.decrement();
    });
    
    expect(result.current.count).toBe(1);
  });
  
  it('should reset count', () => {
    const { result } = renderHook(() => store());
    
    act(() => {
      result.current.increment();
      result.current.reset();
    });
    
    expect(result.current.count).toBe(0);
  });
});

// Integration testing with async actions
describe('UserStore with async actions', () => {
  let mockApiService: jest.Mocked<typeof userApiService>;
  
  beforeEach(() => {
    mockApiService = {
      login: jest.fn(),
      logout: jest.fn(),
    };
  });
  
  it('should handle successful login', async () => {
    const mockUser = { id: '1', name: 'John', email: 'john@example.com' };
    mockApiService.login.mockResolvedValue(mockUser);
    
    const store = createUserStore(mockApiService);
    const { result } = renderHook(() => store());
    
    await act(async () => {
      await result.current.login('john@example.com', 'password');
    });
    
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });
  
  it('should handle login error', async () => {
    mockApiService.login.mockRejectedValue(new Error('Invalid credentials'));
    
    const store = createUserStore(mockApiService);
    const { result } = renderHook(() => store());
    
    await act(async () => {
      await result.current.login('wrong@example.com', 'wrongpassword');
    });
    
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Invalid credentials');
  });
});
```

### Testing with Mock Data
```typescript
// Mock store for testing
export const createMockStore = <T>(initialState: Partial<T>) => {
  return create<T>(() => ({
    ...defaultState,
    ...initialState,
  } as T));
};

// Test wrapper component
import { ReactNode } from 'react';

interface TestWrapperProps {
  children: ReactNode;
  initialState?: any;
}

export const TestWrapper: React.FC<TestWrapperProps> = ({ 
  children, 
  initialState = {} 
}) => {
  const mockStore = useMemo(() => 
    createMockStore(initialState), 
    [initialState]
  );
  
  return (
    <StoreProvider store={mockStore}>
      {children}
    </StoreProvider>
  );
};

// Usage in tests
import { render, screen } from '@testing-library/react';

test('renders with mock data', () => {
  render(
    <TestWrapper initialState={{ count: 5 }}>
      <Counter />
    </TestWrapper>
  );
  
  expect(screen.getByText('Count: 5')).toBeInTheDocument();
});
```

### Performance Testing
```typescript
import { performance } from 'perf_hooks';

describe('Store Performance', () => {
  it('should handle large state updates efficiently', () => {
    const store = createLargeDataStore();
    const { result } = renderHook(() => store());
    
    const startTime = performance.now();
    
    act(() => {
      // Perform large state update
      result.current.updateLargeDataSet(generateLargeDataSet(10000));
    });
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(100); // Should complete in less than 100ms
  });
  
  it('should not cause memory leaks', () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Create and destroy many stores
    for (let i = 0; i < 1000; i++) {
      const store = createTestStore();
      const { result } = renderHook(() => store());
      
      act(() => {
        result.current.increment();
      });
    }
    
    // Force garbage collection
    if (global.gc) {
      global.gc();
    }
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be reasonable (less than 10MB)
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
  });
});

// Benchmark utility
export const benchmarkStore = (storeFn: () => void, iterations = 1000) => {
  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    storeFn();
    const end = performance.now();
    times.push(end - start);
  }
  
  const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  
  return { avg, min, max, times };
};
```

## Production Deployment Patterns

### Environment-Based Configuration
```typescript
// stores/config.ts
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

export const storeConfig = {
  persistence: {
    enabled: isProduction,
    storage: isProduction ? 'indexeddb' : 'memory',
    encryptionEnabled: isProduction,
  },
  
  devtools: {
    enabled: isDevelopment,
    name: process.env.REACT_APP_NAME || 'App Store',
  },
  
  performance: {
    enableLogging: isDevelopment,
    enableMetrics: isProduction,
    cacheSize: isProduction ? 1000 : 100,
  },
};

// Production store factory
export const createProductionStore = <T>(
  storeCreator: StateCreator<T>,
  options: {
    name: string;
    persistOptions?: any;
    devtoolsOptions?: any;
  }
) => {
  let store = storeCreator;
  
  // Add logging in development
  if (storeConfig.devtools.enabled) {
    store = logger(store, options.name);
  }
  
  // Add devtools
  if (storeConfig.devtools.enabled) {
    store = devtools(store, {
      name: options.name,
      ...options.devtoolsOptions,
    });
  }
  
  // Add persistence in production
  if (storeConfig.persistence.enabled && options.persistOptions) {
    store = persist(store, {
      name: `${options.name}-store`,
      storage: createJSONStorage(() => 
        storeConfig.persistence.storage === 'indexeddb' 
          ? indexedDBStorage 
          : localStorage
      ),
      ...options.persistOptions,
    });
  }
  
  return create<T>()(store);
};

// Usage
export const useUserStore = createProductionStore(
  (set, get) => ({
    // store implementation
  }),
  {
    name: 'User',
    persistOptions: {
      partialize: (state) => ({ user: state.user, preferences: state.preferences }),
    },
    devtoolsOptions: {
      serialize: { options: true },
    },
  }
);
```

### Error Handling and Recovery
```typescript
// Error boundary for stores
interface ErrorBoundaryStore {
  error: Error | null;
  hasError: boolean;
  errorInfo: any;
  clearError: () => void;
  logError: (error: Error, errorInfo: any) => void;
}

export const useErrorBoundaryStore = create<ErrorBoundaryStore>((set) => ({
  error: null,
  hasError: false,
  errorInfo: null,
  
  clearError: () => set({ error: null, hasError: false, errorInfo: null }),
  
  logError: (error, errorInfo) => {
    set({ error, hasError: true, errorInfo });
    
    // Send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      console.error('Store Error:', error, errorInfo);
      // Send to Sentry, LogRocket, etc.
    }
  },
}));

// Store with error recovery
export const createResilientStore = <T>(
  storeCreator: StateCreator<T>,
  fallbackState: T
) => {
  return create<T & { recover: () => void }>((set, get, store) => {
    const originalSetState = store.setState;
    
    store.setState = (partial, replace) => {
      try {
        originalSetState(partial, replace);
      } catch (error) {
        console.error('Store update failed, recovering...', error);
        useErrorBoundaryStore.getState().logError(error as Error, { partial, replace });
        
        // Reset to fallback state
        originalSetState(fallbackState, true);
      }
    };
    
    return {
      ...storeCreator(set, get, store),
      recover: () => set(fallbackState, true),
    };
  });
};
```

Zustand provides a simple, performant, and TypeScript-friendly state management solution that scales from small components to large applications. With advanced middleware patterns, performance optimizations, comprehensive testing strategies, and production-ready deployment configurations, it's an excellent choice for modern React applications in 2025.