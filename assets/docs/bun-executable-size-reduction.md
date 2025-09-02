# Bun Executable Size Reduction Guide

**Version**: Bun v1.1.30+ (Latest findings as of August 2025)  
**Last Updated**: August 31, 2025  
**Documentation Type**: Comprehensive Size Optimization Guide

## Overview

Bun's `--compile` flag creates standalone executables that typically range from 50-110MB even for simple applications. This size includes the full Bun runtime (~45MB), your bundled code, and all dependencies. While this ensures complete self-containment, it creates challenges for distribution, embedded systems, and bandwidth-constrained environments.

## Current Size Baseline

### Typical Executable Sizes
- **Simple "Hello World"**: 57MB (bun-darwin-arm64, Bun v1.1.30)
- **Basic CLI tool**: 50-60MB
- **HTTP server**: 51MB (macOS)
- **Windows executables**: ~111MB (notably larger than other platforms)
- **Linux executables**: ~95MB (Bun runtime binary size)

### Platform Comparison
- **Deno compile**: ~77.8MB (Windows), ~135MB (Linux runtime)
- **Bun compile**: ~111MB (Windows), ~95MB (Linux runtime)
- **Deno vs Bun**: Deno executables are ~70% the size of Bun's on Windows
- **Go executables**: Significantly smaller (few MB) but different ecosystem

## Built-in Optimization Techniques

### 1. Core Build Flags
```bash
# Production-optimized build (recommended)
bun build --compile --minify --sourcemap --bytecode ./src/index.ts --outfile myapp

# Size-focused build
bun build --compile --minify --bytecode ./src/index.ts --outfile myapp
```

### 2. Minification Options
```bash
--minify               # Enable all minification
--minify-whitespace    # Remove unnecessary whitespace only
--minify-syntax        # Minify variable names and syntax only
```

### 3. Performance vs Size Trade-offs
```bash
# Faster startup, slightly larger size
--bytecode            # Pre-compile to bytecode (2x faster startup)

# Smaller runtime target (use only if needed)
--target=bun-linux-x64-baseline    # Supports older CPUs, but larger size
--target=bun-linux-x64             # Modern CPUs, smaller size
```

### 4. Dead Code Elimination
```bash
# Build-time constants enable dead code elimination
bun build --compile \
  --define NODE_ENV='"production"' \
  --define DEBUG='"false"' \
  ./src/index.ts --outfile myapp
```

## Tree-Shaking and External Dependencies

### Automatic Tree-Shaking
- **ESM Support**: Bun automatically tree-shakes ESM modules
- **CommonJS**: Limited tree-shaking support for CommonJS
- **node_modules**: Only used exports are included from dependencies

### External Dependencies (Limited Support)
```javascript
// In programmatic builds, you can mark dependencies as external
await Bun.build({
  entrypoints: ["./index.ts"],
  external: ["lodash", "zod"], // These won't be bundled
  compile: {
    target: "bun-linux-x64",
    outfile: "myapp"
  }
});
```

**Note**: External dependencies in `--compile` mode are severely limited since executables must be self-contained.

### Dependency Optimization Strategies
```typescript
// Instead of importing entire libraries
import _ from "lodash"; // ❌ Imports entire library

// Import only what you need
import { debounce } from "lodash"; // ✅ Better tree-shaking
import debounce from "lodash/debounce"; // ✅ Even better
```

## Advanced Size Reduction Techniques

### 1. UPX Compression (Post-Build)

UPX (Ultimate Packer for eXecutables) can reduce Bun executable sizes by 50-70%:

```bash
# Install UPX
# macOS: brew install upx
# Ubuntu: apt-get install upx-ucl
# Windows: Download from https://upx.github.io/

# Basic compression
upx --best myapp

# Maximum compression (slower startup)
upx --ultra-brute myapp

# All methods compression (good balance)
upx --all-methods --no-lzma myapp
```

**Real-world results**:
- **67MB reduction** (17% smaller) with `--all-methods --no-lzma`
- **8.5x smaller** with full LZMA compression (40MB final size)
- **Startup impact**: ~250ms additional startup time

### 2. Platform-Specific Optimization

```bash
# Choose the smallest target for your platform
bun build --compile --target=bun-linux-x64 ./src/index.ts --outfile myapp-linux
bun build --compile --target=bun-darwin-arm64 ./src/index.ts --outfile myapp-macos

# Avoid baseline builds unless necessary (they're larger)
--target=bun-linux-x64-baseline  # Only for pre-2013 CPUs
```

### 3. Build Environment Optimization

```bash
# Clean environment prevents secret inlining
# Move .env files temporarily during build
mv .env .env.backup
bun build --compile --minify ./src/index.ts --outfile myapp
mv .env.backup .env
```

## Alternative Approaches and Workarounds

### 1. System-Installed Runtime Approach
**Currently Not Supported**: Bun doesn't offer a way to create executables that rely on system-installed Bun runtime.

**Potential Workaround**:
```bash
# Create a bundled script instead of executable
bun build --target=bun ./src/index.ts --outfile myapp.js

# Run with system Bun (if available)
bun myapp.js
```

### 2. Container Optimization
```dockerfile
# Multi-stage build for containers
FROM oven/bun:alpine as builder
WORKDIR /app
COPY . .
RUN bun build --compile --minify ./src/index.ts --outfile myapp

# Use UPX in container
FROM alpine:latest as compressor
RUN apk add --no-cache upx
COPY --from=builder /app/myapp /app/myapp
RUN upx --all-methods --no-lzma /app/myapp

FROM alpine:latest
COPY --from=compressor /app/myapp /usr/local/bin/
```

### 3. Split Distribution Strategy
For large applications, consider splitting functionality:

```bash
# Core CLI with minimal features
bun build --compile --minify ./src/core.ts --outfile myapp-core

# Plugin system that downloads additional features
bun build --compile --minify ./src/full.ts --outfile myapp-full
```

## Limitations and Known Issues

### 1. Runtime Inclusion Requirements
- **Full Runtime**: Every executable includes the complete Bun runtime
- **Cannot Exclude**: No way to exclude unused Bun APIs (sqlite, testing, etc.)
- **Minimal Runtime**: GitHub Issue #14546 requests this feature (no ETA)

### 2. Tree-Shaking Limitations
- **Dynamic Imports**: Non-static dynamic imports not supported
- **Build Plugins**: Don't work in `--compile` mode
- **Directory Embedding**: No direct directory embedding support

### 3. Platform-Specific Issues
- **Windows Size**: Windows executables are notably larger (~111MB vs ~95MB Linux)
- **Cross-compilation**: Must match target platform architecture
- **Baseline Penalty**: Baseline builds are larger but support older CPUs

## Community Solutions and Tools

### 1. Size Monitoring Script
```bash
#!/bin/bash
# build-and-measure.sh
echo "Building executable..."
bun build --compile --minify ./src/index.ts --outfile myapp

echo "Original size: $(du -h myapp | cut -f1)"

echo "Compressing with UPX..."
upx --all-methods --no-lzma myapp

echo "Compressed size: $(du -h myapp | cut -f1)"
echo "Startup test..."
time ./myapp --version
```

### 2. Multi-Target Builder
```typescript
// build-all-platforms.ts
const targets = [
  { target: "bun-linux-x64", output: "myapp-linux" },
  { target: "bun-darwin-arm64", output: "myapp-macos-arm" },
  { target: "bun-darwin-x64", output: "myapp-macos-intel" },
  { target: "bun-windows-x64", output: "myapp.exe" }
];

for (const { target, output } of targets) {
  console.log(`Building for ${target}...`);
  await Bun.build({
    entrypoints: ["./src/index.ts"],
    compile: {
      target,
      outfile: output,
      minify: true,
      bytecode: true
    }
  });
  
  console.log(`Built: ${output} (${getFileSize(output)})`);
}
```

## Comparison with Alternatives

### Deno Compile
- **Pros**: ~30% smaller executables, built-in TypeScript
- **Cons**: Different ecosystem, V8 vs JavaScriptCore
- **Migration**: Possible but requires code changes

### Node.js pkg
- **Status**: Maintenance mode, limited Node.js version support
- **Size**: Variable, but often smaller than Bun/Deno
- **Recommendation**: Not recommended for new projects

### Go/Rust
- **Size**: 2-20MB typical executable size
- **Performance**: Usually faster execution
- **Trade-off**: Different language, ecosystem change required

## Best Practices Summary

### 1. Build Command Template
```bash
# Recommended production build
bun build --compile \
  --minify \
  --bytecode \
  --define NODE_ENV='"production"' \
  --define DEBUG='"false"' \
  ./src/index.ts \
  --outfile myapp

# Post-process with UPX if size is critical
upx --all-methods --no-lzma myapp
```

### 2. Code Optimization
```typescript
// ✅ Import only what you need
import { readFile } from "node:fs/promises";

// ✅ Use build-time constants
const isDebug = process.env.NODE_ENV !== "production";
if (isDebug) {
  // This code will be eliminated in production builds
}

// ✅ Prefer Bun APIs over Node.js APIs when possible
import { file } from "bun";
const data = await file("./config.json").text();
```

### 3. Distribution Strategy
- **Small tools**: Use UPX compression, acceptable startup delay
- **Frequently run CLIs**: Avoid UPX, optimize for startup speed
- **Embedded systems**: Consider alternative runtimes or await minimal runtime feature
- **Containers**: Multi-stage builds with UPX compression

## Future Outlook

### Planned Improvements
- **Minimal Runtime**: GitHub Issue #14546 tracks community demand
- **Size Optimizations**: Bun team aware of size concerns
- **Better Tree-shaking**: Ongoing improvements to bundler

### Monitoring for Updates
- Watch [Bun Blog](https://bun.sh/blog) for size reduction announcements
- Follow [GitHub Issues](https://github.com/oven-sh/bun/issues) tagged with "compile" or "size"
- Check release notes for bundler improvements

## Conclusion

While Bun executables are currently large (50-110MB), several techniques can help:

1. **Immediate**: Use `--minify --bytecode` flags
2. **Post-build**: Apply UPX compression for 50-70% size reduction
3. **Code-level**: Optimize imports and use build-time constants
4. **Long-term**: Consider alternatives if size is critical

For most use cases, the convenience of self-contained executables outweighs the size penalty. For size-critical applications, monitor Bun's roadmap for minimal runtime features or consider alternative compilation strategies.

## Sources and References

- [Bun Official Documentation - Executables](https://bun.sh/docs/bundler/executables)
- [GitHub Issue #14546 - Minimal Runtime Request](https://github.com/oven-sh/bun/issues/14546)
- [GitHub Discussion #6636 - Smallest & Fastest Binary](https://github.com/oven-sh/bun/discussions/6636)
- [UPX Official Documentation](https://upx.github.io/)
- [Bun Blog - Build Improvements](https://bun.sh/blog)
- [Community Size Comparison Discussions](https://questions.deno.com/m/1333176726456373323)