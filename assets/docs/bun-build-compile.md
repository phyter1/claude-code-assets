# Bun Build --compile: Standalone Executables

**Version**: Bun v1.1.5+ (Cross-compilation support added April 2024)  
**Last Updated**: August 31, 2025  
**Documentation Type**: Comprehensive Guide

## Overview

Bun's `--compile` flag allows you to create standalone executables from TypeScript and JavaScript projects. These executables are entirely self-contained, including a copy of the Bun runtime, all dependencies, and your application code bundled into a single binary that can run without Bun being installed on the target system.

## Basic Usage

### Simple Compilation
```bash
# Basic compilation
bun build ./src/index.ts --compile --outfile myapp

# Production build (recommended)
bun build --compile --minify --sourcemap ./src/index.ts --outfile myapp

# With bytecode optimization for faster startup
bun build --compile --minify --sourcemap --bytecode ./src/index.ts --outfile myapp
```

### CLI Tool Example (Your Use Case)
```bash
# For your TTS CLI tool
bun build --compile --minify --sourcemap ./src/index.ts --outfile tts-cli

# With build constants
bun build --compile --minify --sourcemap \
  --define BUILD_VERSION='"1.0.0"' \
  --define BUILD_TIME='"2024-08-31T12:00:00Z"' \
  ./src/index.ts --outfile tts-cli
```

## Cross-Platform Compilation

### Supported Targets
```bash
# Linux x64
bun build --compile --target=bun-linux-x64 ./src/index.ts --outfile tts-cli-linux

# Windows x64
bun build --compile --target=bun-windows-x64 ./src/index.ts --outfile tts-cli.exe

# macOS Silicon (ARM64)
bun build --compile --target=bun-darwin-arm64 ./src/index.ts --outfile tts-cli-macos-arm

# macOS Intel (x64)
bun build --compile --target=bun-darwin-x64 ./src/index.ts --outfile tts-cli-macos-intel

# Linux ARM64
bun build --compile --target=bun-linux-arm64 ./src/index.ts --outfile tts-cli-linux-arm

# Baseline builds (for older CPUs, pre-2013)
bun build --compile --target=bun-linux-x64-baseline ./src/index.ts --outfile tts-cli-linux-baseline
```

### Multi-Platform Build Script
```bash
#!/bin/bash
# Build for all platforms
TARGETS=("bun-linux-x64" "bun-windows-x64" "bun-darwin-arm64" "bun-darwin-x64")
OUTFILES=("tts-cli-linux" "tts-cli.exe" "tts-cli-macos-arm" "tts-cli-macos-intel")

for i in "${!TARGETS[@]}"; do
  echo "Building for ${TARGETS[$i]}..."
  bun build --compile --minify --target="${TARGETS[$i]}" ./src/index.ts --outfile "${OUTFILES[$i]}"
done
```

## Command Line Options

### Core Compilation Flags
- `--compile`: Enable compilation to standalone executable
- `--outfile <name>`: Specify output executable name
- `--target <target>`: Cross-compilation target platform
- `--minify`: Enable code minification (recommended for production)
- `--sourcemap`: Generate source maps for debugging
- `--bytecode`: Enable bytecode compilation for faster startup

### Optimization Flags
```bash
# Size optimization
--minify-whitespace    # Remove unnecessary whitespace
--minify-syntax        # Minify syntax (variable names, etc.)
--minify               # Enable all minification

# Performance optimization  
--bytecode             # Pre-compile to bytecode for faster startup
--sourcemap            # Include source maps (compressed with zstd)
```

### Build-Time Constants
```bash
# Define constants that get embedded at build time
bun build --compile \
  --define NODE_ENV='"production"' \
  --define API_URL='"https://api.example.com"' \
  --define VERSION='"1.2.3"' \
  ./src/index.ts --outfile myapp
```

### Windows-Specific Options
```bash
# Windows metadata (only when building ON Windows)
bun build --compile ./app.ts \
  --outfile myapp.exe \
  --windows-title "My TTS CLI" \
  --windows-publisher "Your Company" \
  --windows-version "1.0.0.0" \
  --windows-description "Text-to-Speech CLI Tool" \
  --windows-copyright "© 2024 Your Company" \
  --windows-icon "./icon.ico" \
  --windows-hide-console  # For GUI apps
```

## Dependencies and Assets Handling

### Automatic Dependency Bundling
- All `node_modules` dependencies are automatically bundled and tree-shaken
- Only used exports are included, reducing final executable size
- Native modules (`.node` files) are embedded when possible
- Support for embedding `.dylib`, `.so`, and `.dll` files with `bun:ffi`

### Asset Embedding
```typescript
// Assets are automatically embedded when imported
import logoData from "./assets/logo.png";
import configData from "./config.json";

// Files can be read using Bun.file or Node.js fs
import { readFileSync } from "fs";
const config = readFileSync("./config.json", "utf8");
```

### SQLite Support
```typescript
// SQLite databases work with compiled executables
import { Database } from "bun:sqlite";

const db = new Database("mydb.sqlite"); // Relative to CWD
```

## Performance Optimization

### Best Practices
1. **Use Production Build Command**:
   ```bash
   bun build --compile --minify --sourcemap --bytecode ./src/index.ts --outfile myapp
   ```

2. **Optimize Dependencies**:
   - Use `--external` to exclude unused packages
   - Prefer ES modules for better tree-shaking
   - Import only what you need from large libraries

3. **Build-Time Constants**:
   - Move configuration to build-time constants when possible
   - Use `--define` for environment-specific values

4. **Bytecode Compilation**:
   - Enable `--bytecode` for faster startup times
   - Moves parsing work from runtime to build-time

### Size Considerations
- **Typical size**: 50MB+ for simple applications
- **Includes**: Bun runtime (~45MB) + your code + dependencies
- **Optimization**: Use `--minify` to reduce transpiled code size
- **Baseline vs Modern**: Baseline builds are larger but support older CPUs

## Limitations and Known Issues

### Current Limitations
1. **File Size**: Executables are typically 50MB+ even for simple apps
2. **Dynamic Imports**: Non-statically analyzable dynamic imports not supported
3. **Build Plugins**: Bun.build plugins don't work in --compile mode
4. **Directory Embedding**: No direct way to embed entire directories
5. **Platform Dependencies**: Windows metadata flags only work when building on Windows

### Workarounds
```typescript
// Instead of dynamic imports, use static imports with conditional logic
import moduleA from "./moduleA";
import moduleB from "./moduleB";

const module = condition ? moduleA : moduleB;

// For directory-like access, import individual files
import file1 from "./data/file1.json";
import file2 from "./data/file2.json";
const dataFiles = { file1, file2 };
```

### Troubleshooting
1. **"External files" errors**: Ensure all dependencies are properly bundled
2. **Large bundle sizes**: Use `--external` for packages you want to exclude
3. **Cross-compilation issues**: Verify target platform compatibility
4. **Missing assets**: Import files in your code to embed them

## Edge-TTS Specific Considerations

For your TTS CLI using `edge-tts-universal`:

```bash
# Recommended build command
bun build --compile --minify --sourcemap \
  --define NODE_ENV='"production"' \
  ./src/index.ts --outfile tts-cli

# Cross-platform builds
bun build --compile --minify --target=bun-linux-x64 ./src/index.ts --outfile tts-cli-linux
bun build --compile --minify --target=bun-windows-x64 ./src/index.ts --outfile tts-cli.exe
```

The `edge-tts-universal` package should bundle correctly as it's a standard npm package. All HTTP requests and audio processing will work in the compiled executable.

## Programmatic API

```typescript
// Using Bun.build() API
await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  compile: {
    target: "bun-windows-x64",
    outfile: "tts-cli.exe",
    define: {
      NODE_ENV: '"production"',
      VERSION: '"1.0.0"'
    },
    windows: {
      title: "TTS CLI Tool",
      publisher: "Your Company",
      version: "1.0.0.0",
      description: "Text-to-Speech CLI Tool",
      icon: "./icon.ico",
      hideConsole: false
    }
  }
});
```

## Deployment Benefits

1. **Single File Distribution**: No need to install Bun or dependencies
2. **Faster Startup**: No import resolution or transpilation at runtime  
3. **Lightweight Containers**: Just copy the binary, no runtime needed
4. **Simplified CI/CD**: Build once, run anywhere (per platform)
5. **Version Consistency**: Runtime and dependencies locked to build time

## Sources and References

- [Bun Official Documentation - Single-file executables](https://bun.sh/docs/bundler/executables)
- [GitHub: oven-sh/bun - Executables Documentation](https://github.com/oven-sh/bun/blob/main/docs/bundler/executables.md)
- [Bun Blog - Cross-compilation Support (v1.1.5)](https://bun.sh/blog/bun-v1.1.5)
- [GitHub Issues and Discussions](https://github.com/oven-sh/bun/issues?q=compile+executable)
- [Mamezou Developer Portal - Cross-Compiling Guide](https://developer.mamezou-tech.com/en/blogs/2024/05/20/bun-cross-compile/)