# Vite with React and TypeScript Documentation

## Overview
Vite is a modern build tool that provides instant server start, lightning-fast HMR, and optimized builds. Perfect for React applications with TypeScript support out of the box.

## Installation and Setup

### Create New Project
```bash
bun create vite@latest my-app -- --template react-ts
# or with SWC (faster compilation)
bun create vite@latest my-app -- --template react-swc-ts
```

### Add to Existing Monorepo
```bash
cd apps
mkdir web && cd web
bun init
bun add react react-dom
bun add -d @types/react @types/react-dom @vitejs/plugin-react vite
```

## Configuration Files

### vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
  
  server: {
    port: 3000,
    host: true, // Listen on all addresses
    strictPort: true,
    proxy: {
      // Proxy API requests to backend
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Rollup options
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          vendor: ['pusher-js', 'zod'],
        },
      },
    },
  },
  
  // Environment variables
  envPrefix: 'VITE_',
})
```

### TypeScript Configuration

#### tsconfig.json
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

#### tsconfig.app.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    
    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    
    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    
    /* Path aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@utils/*": ["./src/utils/*"]
    }
  },
  "include": ["src"]
}
```

#### tsconfig.node.json
```json
{
  "compilerOptions": {
    "composite": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noEmit": true
  },
  "include": ["vite.config.ts"]
}
```

### Package.json Scripts
```json
{
  "name": "@code-wrapper/web",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "tsc -b --noEmit",
    "lint": "biome check --apply ./src"
  },
  "dependencies": {
    "@code-wrapper/shared": "workspace:*",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
```

## Project Structure
```
apps/web/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── public/
│   └── favicon.ico
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── vite-env.d.ts
    ├── components/
    ├── hooks/
    ├── utils/
    ├── routes/
    └── styles/
        └── index.css
```

## Essential Files

### index.html
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Code Wrapper</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### src/main.tsx
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### src/vite-env.d.ts
```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_PUSHER_KEY: string
  readonly VITE_PUSHER_CLUSTER: string
  // Add more env vars as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

## Environment Variables

### .env
```bash
VITE_API_URL=http://localhost:8000
VITE_PUSHER_KEY=your_pusher_key
VITE_PUSHER_CLUSTER=mt1
```

### Usage in Code
```typescript
// Access environment variables
const apiUrl = import.meta.env.VITE_API_URL
const isDev = import.meta.env.DEV
const isProd = import.meta.env.PROD
```

## Performance Optimizations

### Code Splitting
```typescript
// Lazy load routes
const Dashboard = lazy(() => import('./routes/Dashboard'))
const Settings = lazy(() => import('./routes/Settings'))
```

### Using SWC Instead of Babel
```typescript
// vite.config.ts with SWC
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
})
```

### Optimized Dependencies
```typescript
export default defineConfig({
  optimizeDeps: {
    include: ['react', 'react-dom', 'pusher-js'],
    exclude: ['@code-wrapper/shared'],
  },
})
```

## Hot Module Replacement (HMR)

Vite provides instant HMR out of the box:
```typescript
// Automatic for React components
export default function Component() {
  // Changes here trigger instant updates
  return <div>Hello</div>
}

// Manual HMR API
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // Handle the updated module
  })
}
```

## Production Build

### Build Command
```bash
bun run build
```

### Preview Production Build
```bash
bun run preview
```

### Build Output
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── vendor-[hash].js
└── favicon.ico
```

## Integration with Backend

### Proxy Configuration
```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
    '/ws': {
      target: 'ws://localhost:8000',
      ws: true,
    },
  },
}
```

### API Client Setup
```typescript
// src/utils/api.ts
export const api = {
  baseURL: import.meta.env.VITE_API_URL || '/api',
  
  async fetch(path: string, options?: RequestInit) {
    const response = await fetch(`${this.baseURL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }
    
    return response.json()
  },
}
```

## Common Vite Plugins

```bash
# Useful plugins
bun add -d @vitejs/plugin-react
bun add -d vite-plugin-pwa
bun add -d vite-plugin-svgr
bun add -d unplugin-auto-import
```

## Best Practices

1. **Use path aliases** for cleaner imports
2. **Configure proxy** for API calls during development
3. **Optimize dependencies** with optimizeDeps config
4. **Use environment variables** with VITE_ prefix
5. **Enable source maps** for debugging
6. **Implement code splitting** for better performance
7. **Use SWC** for faster builds in large projects
8. **Configure manual chunks** for vendor splitting