# Bun Runtime and Workspaces Documentation

## Overview
Bun is a fast all-in-one JavaScript runtime built from scratch to serve the modern JavaScript ecosystem. It includes a bundler, test runner, and Node.js-compatible package manager.

## Version Information
- Latest stable version: Check with `bun --version`
- Runtime: Bun (replaces Node.js)
- Package Manager: Built-in (replaces npm/yarn/pnpm)

## Installation
```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Windows (via npm)
npm install -g bun
```

## Monorepo with Bun Workspaces

### Basic Structure
```
project-root/
├── package.json          # Root package.json with workspaces config
├── bun.lockb            # Lockfile (binary format)
├── tsconfig.json        # Root TypeScript config
├── packages/            # Shared packages
│   ├── shared/
│   │   └── package.json
│   └── utils/
│       └── package.json
└── apps/                # Applications
    ├── api/
    │   └── package.json
    └── web/
        └── package.json
```

### Root package.json Configuration
```json
{
  "name": "code-wrapper",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "bun run --filter '*' dev",
    "build": "bun run --filter '*' build",
    "test": "bun test",
    "lint": "bun run --filter '*' lint",
    "typecheck": "bun run --filter '*' typecheck"
  },
  "devDependencies": {
    "@biomejs/biome": "latest",
    "typescript": "^5.0.0"
  }
}
```

### Workspace Dependencies
Use the `workspace:` protocol to reference local packages:

```json
{
  "name": "@code-wrapper/api",
  "dependencies": {
    "@code-wrapper/shared": "workspace:*",
    "@code-wrapper/utils": "workspace:*"
  }
}
```

### Key Commands

#### Installation
```bash
# Install all workspace dependencies
bun install

# Add dependency to specific workspace
cd apps/api && bun add hono

# Add dev dependency to root
bun add -d @biomejs/biome

# Add dependency with workspace protocol
bun add @code-wrapper/shared --workspace
```

#### Running Scripts
```bash
# Run script in all workspaces
bun run --filter '*' dev

# Run script in specific workspace
bun run --filter '@code-wrapper/api' dev

# Run multiple workspaces
bun run --filter '{@code-wrapper/api,@code-wrapper/web}' dev
```

#### Testing
```bash
# Run all tests
bun test

# Run tests with watch mode
bun test --watch

# Run tests for specific workspace
bun test apps/api
```

## Bun-Specific Features

### Built-in TypeScript Support
- No configuration needed
- Automatic transpilation
- Support for .ts, .tsx, .jsx files

### Environment Variables
```typescript
// Bun automatically loads .env files
process.env.API_KEY // Available without dotenv

// Bun-specific
Bun.env.API_KEY // Preferred in Bun
```

### Built-in APIs
```typescript
// File I/O
const file = Bun.file("package.json");
const text = await file.text();

// Hashing
const hash = Bun.hash("my-string");

// Spawn processes
const proc = Bun.spawn(["echo", "hello"]);
```

### Performance Features
- Fast startup times
- Native ESM support
- Built-in transpiler
- Optimized npm client
- Binary lockfile (bun.lockb)

## Best Practices

1. **Keep root clean**: Don't add app dependencies to root package.json
2. **Use workspace protocol**: For internal dependencies
3. **Leverage filters**: For targeted script execution
4. **Binary lockfile**: Commit bun.lockb for reproducible installs
5. **Type safety**: Use TypeScript throughout the monorepo

## Catalogs (Advanced Feature)
Define shared dependency versions in root package.json:

```json
{
  "catalog": {
    "react": "^18.3.0",
    "zod": "^3.22.0"
  }
}
```

Reference in workspaces:
```json
{
  "dependencies": {
    "react": "catalog:",
    "zod": "catalog:"
  }
}
```

## Common Issues and Solutions

1. **Module resolution**: Use `bunfig.toml` for custom resolution
2. **Node.js compatibility**: Most Node APIs are supported
3. **Binary dependencies**: May need rebuilding with `bun install`