# Bun TypeScript Monorepo Configuration Guide

## Overview
This guide covers the proper setup of TypeScript configuration files for Bun monorepos, based on official documentation and real-world examples from 2024-2025.

## Version Information
- Bun: 1.0+ (latest stable)
- TypeScript: ^5.0.0
- Last Updated: August 2025

## Key Principles

### 1. Bun's TypeScript Advantages
- **Direct TypeScript Execution**: Bun can execute .ts files directly without compilation
- **Path Mapping Support**: Bun's runtime respects `compilerOptions.paths` in tsconfig.json (unique among runtimes)
- **Built-in Transpilation**: No additional build tools required for TypeScript
- **Workspace Integration**: Seamless integration with Bun workspaces

### 2. Monorepo Structure
```
project-root/
├── package.json          # Root with workspace config
├── tsconfig.json         # Root TypeScript config
├── tsconfig.base.json    # Shared base configuration (optional)
├── bun.lockb            # Bun lockfile
├── packages/            # Shared packages
│   ├── core/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── utils/
│       ├── package.json
│       └── tsconfig.json
└── apps/                # Applications
    ├── api/
    │   ├── package.json
    │   └── tsconfig.json
    └── web/
        ├── package.json
        └── tsconfig.json
```

## Configuration Files

### Root tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "composite": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "types": ["bun-types"],
    "paths": {
      "@/*": ["./src/*"],
      "@core/*": ["./packages/core/src/*"],
      "@utils/*": ["./packages/utils/src/*"]
    }
  },
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/utils" },
    { "path": "./apps/api" },
    { "path": "./apps/web" }
  ],
  "exclude": ["node_modules", "dist", ".next", ".turbo"]
}
```

### Base Configuration (tsconfig.base.json)
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "types": ["bun-types"],
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

### Package-Level tsconfig.json (packages/core/tsconfig.json)
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "rootDir": "./src",
    "outDir": "./dist",
    "baseUrl": "./src",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules", "**/*.test.ts", "**/*.spec.ts"]
}
```

### App-Level tsconfig.json (apps/api/tsconfig.json)
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "rootDir": "./src",
    "outDir": "./dist",
    "baseUrl": "./src",
    "paths": {
      "@/*": ["./*"],
      "@core/*": ["../../packages/core/src/*"],
      "@utils/*": ["../../packages/utils/src/*"]
    }
  },
  "references": [
    { "path": "../../packages/core" },
    { "path": "../../packages/utils" }
  ],
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules", "**/*.test.ts", "**/*.spec.ts"]
}
```

## Best Practices

### 1. TypeScript Configuration
- **Use "ESNext" target**: Leverages Bun's native performance, no transpilation needed
- **Enable composite projects**: Required for TypeScript project references
- **Set noEmit to true**: Let Bun handle execution, TypeScript for type checking only
- **Use verbatimModuleSyntax**: Prevents import/export confusion in modern setups

### 2. Path Mapping Strategy
- **Consistent alias patterns**: Use `@/` for local paths, `@packagename/` for packages
- **Avoid deep relative imports**: Use path mapping instead of `../../../`
- **Mirror workspace structure**: Keep path mappings aligned with workspace organization

### 3. Project References
- **Explicit dependencies**: Each project should reference its actual dependencies
- **Incremental compilation**: Enables faster builds and better editor performance
- **Dependency ordering**: Ensure references match package.json dependencies

### 4. Workspace Dependencies
Use workspace protocol in package.json:
```json
{
  "dependencies": {
    "@myapp/core": "workspace:*",
    "@myapp/utils": "workspace:*"
  }
}
```

## Known Limitations and Workarounds

### 1. TypeScript Project References Support
**Issue**: Bun doesn't fully support all TypeScript project reference features (as of 2024)
**Workaround**: 
- Use simple reference structures
- Test builds with `bun build` and `tsc --build`
- Fallback to path mapping if references cause issues

### 2. Path Alias Resolution
**Issue**: Path aliases can break in complex monorepo setups
**Workaround**:
- Use absolute paths in tsconfig.json
- Avoid nested "extends" with relative paths
- Test import resolution with `bun run --print`

### 3. Framework Integration
**Issue**: Some frameworks (Vite, Storybook) may have boundary issues
**Workaround**:
- Configure framework-specific tsconfig files
- Use explicit include/exclude patterns
- Set proper baseUrl and rootDir options

## Testing Configuration

### Verify TypeScript Setup
```bash
# Check TypeScript compilation
bun run tsc --noEmit

# Test project references
bun run tsc --build

# Verify path resolution
bun run --print "import('@core/utils')"
```

### Common Commands
```bash
# Install TypeScript types for Bun
bun add -d bun-types

# Type check all workspaces
bun run --filter '*' typecheck

# Build with project references
bun run tsc --build --verbose
```

## Production Examples

### Successful Patterns
1. **Flat workspace structure**: Avoid deeply nested packages
2. **Clear separation**: Keep packages and apps in separate directories
3. **Explicit typing**: Use strict TypeScript settings throughout
4. **Consistent naming**: Follow package naming conventions (@org/package)

### Tools Integration
- **Biome**: Works well with Bun monorepos for linting/formatting
- **Nx**: Can be integrated for advanced monorepo features
- **Turborepo**: Alternative task runner with Bun support

## Common Issues and Solutions

### Module Resolution Errors
```typescript
// Problem: Cannot resolve module
import { utils } from '@utils/common';

// Solution: Check tsconfig paths and workspace dependencies
// Ensure both are configured correctly
```

### Build Performance
- Use `composite: true` for faster incremental builds
- Enable `skipLibCheck: true` to reduce type checking time
- Use `isolatedModules: true` for better bundler compatibility

## Migration from Other Setups

### From Node.js Monorepos
1. Update package.json to use Bun scripts
2. Replace npm/yarn workspace config with Bun equivalent
3. Adjust TypeScript target to "ESNext"
4. Remove unnecessary build tools (ts-node, etc.)

### From Lerna/Rush
1. Simplify to Bun workspaces
2. Remove complex build orchestration
3. Leverage Bun's built-in TypeScript support
4. Update CI/CD to use Bun commands

## Sources and References
- [Bun Official Documentation](https://bun.sh/docs)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [GitHub: create-bun-monorepo](https://github.com/iv-stpn/create-bun-monorepo)
- [Bun GitHub Issues and Discussions](https://github.com/oven-sh/bun)
- [Nx TypeScript Monorepo Guide](https://nx.dev/blog/managing-ts-packages-in-monorepos)