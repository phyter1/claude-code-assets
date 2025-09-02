# Biome - Fast Formatter and Linter for Web Projects

A toolchain for web projects, aimed to provide functionalities to maintain them. Biome offers formatter and linter, usable via CLI and LSP, built with Rust for exceptional performance.

## Core Concepts and Philosophy

- **Performance**: Built with Rust, ~35x faster than Prettier and ESLint combined
- **Zero Configuration**: Works out of the box with sensible defaults
- **Language Support**: JavaScript, TypeScript, JSX, TSX, JSON, CSS, and GraphQL
- **Type-Aware Linting**: Provides type-aware rules without requiring TypeScript compiler
- **All-in-One**: Formatter, linter, and import organizer in a single tool
- **Modern Architecture**: Inspired by rust-analyzer with incremental parsing

## Installation and Setup

### Basic Installation

```bash
# Install Biome
npm install --save-dev --save-exact @biomejs/biome

# Or install globally
npm install --global @biomejs/biome

# Or use with Bun
bun add --dev --exact @biomejs/biome
```

### Initialization

```bash
# Initialize Biome in your project
npx @biomejs/biome init

# This creates a biome.json configuration file
```

### Basic Configuration (biome.json)

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.2/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": false,
    "ignore": ["dist/**", "node_modules/**", ".next/**"]
  },
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "formatter": {
    "enabled": true,
    "formatWithErrors": false,
    "indentStyle": "tab",
    "indentWidth": 2,
    "lineEnding": "lf",
    "lineWidth": 100,
    "attributePosition": "auto"
  },
  "javascript": {
    "formatter": {
      "jsxQuoteStyle": "double",
      "quoteProperties": "asNeeded",
      "semicolons": "always",
      "arrowParentheses": "always",
      "bracketSpacing": true,
      "bracketSameLine": false,
      "quoteStyle": "double",
      "attributePosition": "auto"
    }
  },
  "json": {
    "formatter": {
      "indentStyle": "space",
      "indentWidth": 2
    }
  },
  "css": {
    "formatter": {
      "enabled": true,
      "indentStyle": "tab",
      "indentWidth": 2,
      "lineEnding": "lf",
      "lineWidth": 100,
      "quoteStyle": "double"
    },
    "linter": {
      "enabled": true
    }
  }
}
```

## Key API Methods and Patterns

### Command Line Interface

**Basic Commands**
```bash
# Format files
biome format --write ./src

# Lint files  
biome lint ./src

# Check (format + lint + organize imports)
biome check --write ./src

# Format specific files
biome format --write file1.js file2.ts

# Format with different options
biome format --indent-style=space --indent-width=4 --write ./src

# Lint with auto-fix
biome lint --fix ./src

# Check without writing changes (CI mode)
biome check ./src

# Format from stdin
echo "const x=1" | biome format --stdin-file-path=example.js

# Check staged files only (with git)
biome check --staged
```

**Advanced Usage**
```bash
# Run on specific file patterns
biome check --write "src/**/*.{js,ts,jsx,tsx}"

# Use different configuration file
biome check --config-path ./custom-biome.json ./src

# Output diagnostics in different formats
biome lint --diagnostic-level=info --colors=off ./src

# Performance diagnostics
biome check --verbose ./src

# Check configuration validity
biome check --config-path ./biome.json --no-errors-on-unmatched

# Run with specific working directory
biome check --cwd /path/to/project ./src
```

### IDE and Editor Integration

**VS Code Extension**
```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "[javascript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[typescript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[json]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "biome.lspBin": "node_modules/@biomejs/biome/bin/biome"
}
```

**Package.json Scripts**
```json
{
  "scripts": {
    "format": "biome format --write ./src",
    "format:check": "biome format ./src",
    "lint": "biome lint ./src",
    "lint:fix": "biome lint --fix ./src",
    "check": "biome check ./src",
    "check:fix": "biome check --write ./src",
    "biome:ci": "biome check ./src"
  }
}
```

### Formatter Configuration

**JavaScript/TypeScript Formatting**
```json
{
  "formatter": {
    "enabled": true,
    "formatWithErrors": false,
    "indentStyle": "tab",
    "indentWidth": 2,
    "lineEnding": "lf",
    "lineWidth": 100,
    "attributePosition": "auto"
  },
  "javascript": {
    "formatter": {
      "arrowParentheses": "always",
      "bracketSameLine": false,
      "bracketSpacing": true,
      "jsxQuoteStyle": "double",
      "quoteProperties": "asNeeded",
      "quoteStyle": "double",
      "semicolons": "always",
      "trailingComma": "all"
    }
  },
  "typescript": {
    "formatter": {
      "arrowParentheses": "always",
      "bracketSameLine": false,
      "bracketSpacing": true,
      "jsxQuoteStyle": "double",
      "quoteProperties": "asNeeded",
      "quoteStyle": "double",
      "semicolons": "always",
      "trailingComma": "all"
    }
  }
}
```

**JSON and CSS Formatting**
```json
{
  "json": {
    "formatter": {
      "enabled": true,
      "indentStyle": "space",
      "indentWidth": 2,
      "lineEnding": "lf",
      "lineWidth": 100,
      "trailingCommas": "none"
    }
  },
  "css": {
    "formatter": {
      "enabled": true,
      "indentStyle": "tab",
      "indentWidth": 2,
      "lineEnding": "lf",
      "lineWidth": 100,
      "quoteStyle": "double"
    }
  }
}
```

### Linter Configuration

**Rule Categories**
```json
{
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      
      // Correctness rules (prevent bugs)
      "correctness": {
        "noUnusedVariables": "error",
        "noUnusedImports": "error",
        "useValidForDirection": "error",
        "noUndeclaredVariables": "error",
        "noUnreachable": "error"
      },
      
      // Style rules (enforce conventions)
      "style": {
        "noNegationElse": "warn",
        "useCollapsedElseIf": "warn",
        "useConsistentArrayType": "error",
        "useShorthandAssign": "warn"
      },
      
      // Suspicious rules (detect code smells)
      "suspicious": {
        "noDoubleEquals": "error",
        "noShadowRestrictedNames": "error",
        "noExplicitAny": "warn",
        "noFocusedTests": "error"
      },
      
      // Performance rules
      "performance": {
        "noDelete": "error",
        "noBarrelFile": "warn"
      },
      
      // Complexity rules
      "complexity": {
        "noBannedTypes": "error",
        "noUselessThisAlias": "error",
        "useOptionalChain": "warn"
      },
      
      // Security rules
      "security": {
        "noDangerouslySetInnerHtml": "error"
      },
      
      // Nursery rules (experimental)
      "nursery": {
        "useImportType": "warn"
      }
    }
  }
}
```

**Custom Rule Configuration**
```json
{
  "linter": {
    "rules": {
      "style": {
        "useNamingConvention": {
          "level": "error",
          "options": {
            "strictCase": false,
            "requireAscii": true,
            "enumMemberCase": "CONSTANT_CASE",
            "conventions": [
              {
                "selector": {
                  "kind": "function"
                },
                "match": "camelCase"
              },
              {
                "selector": {
                  "kind": "variable",
                  "modifiers": ["const"]
                },
                "match": "CONSTANT_CASE"
              },
              {
                "selector": {
                  "kind": "typeLike"
                },
                "match": "PascalCase"
              }
            ]
          }
        }
      },
      
      "correctness": {
        "noUnusedVariables": {
          "level": "error",
          "options": {
            "allowUnusedImports": false
          }
        }
      }
    }
  }
}
```

## TypeScript Usage Examples

### Type-Aware Linting (Biome v2 Feature)

```typescript
// Biome can now infer types without TypeScript compiler
interface User {
  id: number;
  name: string;
  email?: string;
}

function processUser(user: User) {
  // Biome can detect type errors
  console.log(user.id.toFixed(2)); // Warning: id is number, not necessarily decimal
  
  // Type-aware unused variable detection
  const unusedVar = user.email?.toLowerCase(); // Warning: unused variable
  
  // Better null checking
  if (user.email) {
    return user.email.length; // Biome knows email is defined here
  }
  
  return 0;
}

// Generic type checking
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]; // Biome validates key is valid property
}

// React component type checking
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
      type="button" // Biome suggests explicit type
    >
      {children}
    </button>
  );
}
```

### Advanced Configuration Patterns

```typescript
// biome-config.ts (TypeScript configuration)
import type { Configuration } from '@biomejs/biome';

const config: Configuration = {
  $schema: 'https://biomejs.dev/schemas/1.9.2/schema.json',
  
  vcs: {
    enabled: true,
    clientKind: 'git',
    useIgnoreFile: true,
  },
  
  files: {
    ignoreUnknown: false,
    ignore: [
      'dist/**',
      'build/**',
      'coverage/**',
      '**/*.min.js',
      'node_modules/**',
    ],
    include: [
      'src/**/*.{js,jsx,ts,tsx}',
      'pages/**/*.{js,jsx,ts,tsx}',
      'components/**/*.{js,jsx,ts,tsx}',
    ],
  },
  
  organizeImports: {
    enabled: true,
  },
  
  linter: {
    enabled: true,
    rules: {
      recommended: true,
      
      correctness: {
        noUnusedVariables: 'error',
        noUnusedImports: 'error',
        useHookAtTopLevel: 'error',
      },
      
      style: {
        useConsistentArrayType: {
          level: 'error',
          options: {
            syntax: 'shorthand', // T[] instead of Array<T>
          },
        },
        
        useNamingConvention: {
          level: 'error',
          options: {
            strictCase: false,
            conventions: [
              {
                selector: { kind: 'function' },
                match: 'camelCase',
              },
              {
                selector: { kind: 'variable', modifiers: ['const'] },
                match: 'camelCase',
              },
              {
                selector: { kind: 'typeLike' },
                match: 'PascalCase',
              },
            ],
          },
        },
      },
      
      suspicious: {
        noExplicitAny: 'warn',
        noArrayIndexKey: 'error',
      },
      
      performance: {
        noDelete: 'error',
      },
      
      // Disable specific rules
      complexity: {
        noBannedTypes: 'off',
      },
    },
  },
  
  formatter: {
    enabled: true,
    indentStyle: 'space',
    indentWidth: 2,
    lineWidth: 100,
    lineEnding: 'lf',
  },
  
  javascript: {
    formatter: {
      quoteStyle: 'single',
      jsxQuoteStyle: 'double',
      semicolons: 'always',
      trailingComma: 'es5',
      arrowParentheses: 'asNeeded',
      bracketSpacing: true,
      bracketSameLine: false,
    },
  },
  
  typescript: {
    formatter: {
      quoteStyle: 'single',
      jsxQuoteStyle: 'double',
      semicolons: 'always',
      trailingComma: 'all',
      arrowParentheses: 'asNeeded',
    },
  },
};

export default config;
```

## Best Practices and Common Patterns

### Project Setup Patterns

**Monorepo Configuration**
```json
// Root biome.json
{
  "$schema": "https://biomejs.dev/schemas/1.9.2/schema.json",
  "extends": ["./biome-base.json"],
  "files": {
    "ignore": [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.next/**"
    ]
  },
  "overrides": [
    {
      "include": ["packages/frontend/**"],
      "javascript": {
        "formatter": {
          "jsxQuoteStyle": "double"
        }
      }
    },
    {
      "include": ["packages/backend/**"],
      "linter": {
        "rules": {
          "suspicious": {
            "noConsoleLog": "error"
          }
        }
      }
    }
  ]
}

// biome-base.json (shared configuration)
{
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "organizeImports": {
    "enabled": true
  }
}
```

**Environment-Specific Configuration**
```json
// biome.json
{
  "overrides": [
    {
      "include": ["**/*.test.{js,ts,jsx,tsx}", "**/__tests__/**"],
      "linter": {
        "rules": {
          "suspicious": {
            "noFocusedTests": "error",
            "noSkippedTests": "warn"
          },
          "style": {
            "noNonNullAssertion": "off"
          }
        }
      }
    },
    {
      "include": ["scripts/**", "tools/**"],
      "linter": {
        "rules": {
          "suspicious": {
            "noConsoleLog": "off"
          },
          "style": {
            "useNodeAssertStrict": "off"
          }
        }
      }
    },
    {
      "include": ["src/**/*.config.{js,ts}"],
      "formatter": {
        "lineWidth": 120
      }
    }
  ]
}
```

### CI/CD Integration

**GitHub Actions**
```yaml
# .github/workflows/biome.yml
name: Biome Check

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  biome:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run Biome check
        run: npm run biome:ci

      - name: Run Biome format check
        run: npx @biomejs/biome format --diagnostic-level=error ./src

      - name: Run Biome lint
        run: npx @biomejs/biome lint --diagnostic-level=error ./src
```

**Pre-commit Hooks**
```json
// package.json
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx,json,css}": [
      "biome check --write --no-errors-on-unmatched"
    ]
  }
}

// .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

**Custom Scripts**
```bash
#!/bin/bash
# scripts/format-check.sh

echo "🔍 Checking formatting..."
if ! npx @biomejs/biome format --diagnostic-level=error ./src; then
  echo "❌ Formatting check failed!"
  echo "💡 Run 'npm run format' to fix formatting issues"
  exit 1
fi

echo "🔍 Checking linting..."
if ! npx @biomejs/biome lint --diagnostic-level=error ./src; then
  echo "❌ Linting check failed!"
  echo "💡 Run 'npm run lint:fix' to fix linting issues"
  exit 1
fi

echo "✅ All checks passed!"
```

### Performance Optimization

**Large Codebase Configuration**
```json
{
  "files": {
    "ignoreUnknown": true,
    "ignore": [
      "**/node_modules/**",
      "**/dist/**",
      "**/coverage/**",
      "**/*.min.js",
      "**/vendor/**",
      "**/*.generated.{js,ts}"
    ],
    "maxSize": 1048576
  },
  "formatter": {
    "enabled": true,
    "formatWithErrors": false
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  }
}
```

**Incremental Checking**
```bash
#!/bin/bash
# scripts/incremental-check.sh

# Get changed files
CHANGED_FILES=$(git diff --name-only --diff-filter=ACM origin/main | grep -E '\.(js|jsx|ts|tsx|json|css)$')

if [ -z "$CHANGED_FILES" ]; then
  echo "No relevant files changed"
  exit 0
fi

echo "Checking changed files: $CHANGED_FILES"

# Run Biome on changed files only
echo "$CHANGED_FILES" | xargs npx @biomejs/biome check --diagnostic-level=error
```

## Integration with Other Tools

### Next.js Integration

```json
// next.config.js integration
{
  "files": {
    "ignore": [
      ".next/**",
      "out/**",
      "public/**/*.js"
    ]
  },
  "overrides": [
    {
      "include": ["pages/**", "app/**"],
      "linter": {
        "rules": {
          "correctness": {
            "useHookAtTopLevel": "error"
          },
          "suspicious": {
            "noArrayIndexKey": "error"
          }
        }
      }
    },
    {
      "include": ["pages/api/**", "app/api/**"],
      "linter": {
        "rules": {
          "suspicious": {
            "noConsoleLog": "warn"
          }
        }
      }
    }
  ]
}
```

### ESLint Migration

```bash
# Migration script from ESLint
npx @biomejs/biome migrate eslint --config-path .eslintrc.json

# Or from Prettier
npx @biomejs/biome migrate prettier --config-path .prettierrc
```

**Gradual Migration Pattern**
```json
// Gradual ESLint replacement
{
  "extends": "./biome-base.json",
  "overrides": [
    {
      "include": ["src/new-features/**"],
      "linter": {
        "enabled": true,
        "rules": {
          "all": true
        }
      }
    },
    {
      "include": ["src/legacy/**"],
      "linter": {
        "enabled": false
      }
    }
  ]
}
```

### Build Tool Integration

**Vite Integration**
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'biome',
      buildStart() {
        // Run Biome check during build
        const { execSync } = require('child_process');
        try {
          execSync('npx @biomejs/biome check ./src', { stdio: 'inherit' });
        } catch (error) {
          this.error('Biome check failed');
        }
      },
    },
  ],
});
```

**Webpack Integration**
```javascript
// webpack.config.js
const { spawn } = require('child_process');

class BiomePlugin {
  apply(compiler) {
    compiler.hooks.beforeCompile.tapAsync('BiomePlugin', (params, callback) => {
      const biome = spawn('npx', ['@biomejs/biome', 'check', './src'], {
        stdio: 'inherit',
      });
      
      biome.on('close', (code) => {
        if (code !== 0) {
          callback(new Error('Biome check failed'));
        } else {
          callback();
        }
      });
    });
  }
}

module.exports = {
  plugins: [new BiomePlugin()],
};
```

### VS Code Workspace Configuration

```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  },
  "[javascript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[typescript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[json]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[css]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "biome.lspBin": "./node_modules/@biomejs/biome/bin/biome",
  "biome.rename": true
}

// .vscode/extensions.json
{
  "recommendations": ["biomejs.biome"],
  "unwantedRecommendations": ["esbenp.prettier-vscode", "dbaeumer.vscode-eslint"]
}
```

Biome represents a significant advancement in web development tooling, combining formatting, linting, and import organization into a single, blazingly fast tool. Its type-aware linting capabilities, zero-configuration approach, and excellent performance make it an ideal choice for modern JavaScript and TypeScript projects in 2025.