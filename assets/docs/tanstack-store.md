# TanStack Store Documentation

**Library**: @tanstack/store  
**Version**: Latest (as of January 2025)  
**Last Updated**: 2025-01-31  
**Type**: Framework-agnostic state management with reactive primitives

## Overview

TanStack Store is a framework-agnostic signals-based state management library that provides reactive primitives for building modern applications. It features lazy evaluation, explicit dependency tracking, and fine-grained reactivity.

## Installation

```bash
npm install @tanstack/store
# or
yarn add @tanstack/store
# or  
pnpm add @tanstack/store
```

## Core Concepts

### Store Class

The `Store` class is the fundamental building block for managing state:

```typescript
import { Store } from '@tanstack/store'

const count = new Store(0)

// Access current state
console.log(count.state) // 0

// Update state
count.setState(1)
count.setState(prev => prev + 1)

// Subscribe to changes
const unsubscribe = count.subscribe(() => {
  console.log('Count changed:', count.state)
})

// Cleanup
unsubscribe()
```

### Derived Class - Computed Values

The `Derived` class creates reactive computed values that update when their dependencies change:

```typescript
import { Store, Derived } from '@tanstack/store'

const count = new Store(0)
const name = new Store('John')

// Simple derived value
const double = new Derived({
  fn: () => count.state * 2,
  deps: [count] // Must explicitly list dependencies
})

// Complex derived value with multiple dependencies
const greeting = new Derived({
  fn: () => `Hello ${name.state}, count is ${count.state}`,
  deps: [name, count]
})

// Access previous values
const countHistory = new Derived({
  fn: (prevVal) => {
    const current = count.state
    const previous = prevVal ?? 0
    return { current, previous, changed: current !== previous }
  },
  deps: [count]
})

// Access previous and current dependency values
const countAnalysis = new Derived({
  fn: (prevVal, prevDepVals, currDepVals) => {
    const [prevCount] = prevDepVals
    const [currCount] = currDepVals
    return {
      current: currCount,
      previous: prevCount,
      delta: currCount - prevCount
    }
  },
  deps: [count]
})
```

## Critical: Mounting and Unmounting

**IMPORTANT**: Derived values are lazy by default and must be explicitly mounted to start listening for updates.

### Mount/Unmount API

```typescript
const derived = new Derived({
  fn: () => count.state * 2,
  deps: [count]
})

// Must mount to start listening for updates
const unmount = derived.mount()

// The derived value is now reactive and will update when count changes
console.log(derived.state) // Current computed value

// Always cleanup when done
unmount() // Stops listening and cleans up resources
```

### Proper Cleanup Pattern

```typescript
// Component or module setup
class MyComponent {
  private unmountFunctions: Array<() => void> = []

  constructor() {
    const derived1 = new Derived({ /* ... */ })
    const derived2 = new Derived({ /* ... */ })
    
    // Mount all derived values
    this.unmountFunctions.push(derived1.mount())
    this.unmountFunctions.push(derived2.mount())
  }

  destroy() {
    // Cleanup all subscriptions
    this.unmountFunctions.forEach(unmount => unmount())
    this.unmountFunctions = []
  }
}
```

### Effect Class - Side Effects

The `Effect` class follows the same mount/unmount pattern for managing side effects:

```typescript
import { Store, Effect } from '@tanstack/store'

const count = new Store(0)

const logEffect = new Effect({
  fn: () => {
    console.log('Count changed to:', count.state)
  },
  deps: [count],
  eager: true // Run immediately on mount (default: false)
})

// Mount the effect to start listening
const unmount = logEffect.mount()

// Cleanup when done
unmount()
```

## DerivedOptions Interface

```typescript
interface DerivedOptions<TState, TArr> {
  fn: (
    prevVal?: TState,
    prevDepVals?: TArr,
    currDepVals?: TArr
  ) => TState
  deps: TArr // Array of Store or Derived instances
  onSubscribe?: () => void
  onUpdate?: () => void
}
```

## TypeScript Usage

```typescript
// Typed store
const userStore = new Store<{ id: number; name: string }>({
  id: 1,
  name: 'John'
})

// Typed derived value  
const userDisplayName = new Derived<string, [typeof userStore]>({
  fn: () => `User: ${userStore.state.name}`,
  deps: [userStore]
})
```

## Common Patterns

### Chained Derived Values

```typescript
const count = new Store(0)

const double = new Derived({
  fn: () => count.state * 2,
  deps: [count]
})

const quadruple = new Derived({
  fn: () => double.state * 2,
  deps: [double] // Can depend on other derived values
})

// Mount both
const unmountDouble = double.mount()
const unmountQuadruple = quadruple.mount()

// Cleanup
unmountDouble()
unmountQuadruple()
```

### Conditional Derived Values

```typescript
const isLoading = new Store(false)
const data = new Store<string | null>(null)

const displayValue = new Derived({
  fn: () => {
    if (isLoading.state) return 'Loading...'
    return data.state ?? 'No data'
  },
  deps: [isLoading, data]
})

const unmount = displayValue.mount()
```

## Common Issues & Solutions

### Issue: Derived value not updating
**Solution**: Ensure you've called `mount()` on the derived value. Derived values are lazy by default.

```typescript
const derived = new Derived({ /* ... */ })
// This won't work - derived is not mounted
console.log(derived.state) // May be stale

// Correct approach
const unmount = derived.mount()
console.log(derived.state) // Now reactive
```

### Issue: Memory leaks
**Solution**: Always call the unmount function returned by `mount()`.

```typescript
// Bad - memory leak
derived.mount() // No cleanup

// Good - proper cleanup
const unmount = derived.mount()
// Later...
unmount()
```

### Issue: Missing dependencies
**Solution**: Explicitly list all dependencies in the `deps` array.

```typescript
const a = new Store(1)
const b = new Store(2)

// Bad - missing dependency
const sum = new Derived({
  fn: () => a.state + b.state, // Uses both a and b
  deps: [a] // Only lists a - b changes won't trigger updates
})

// Good - all dependencies listed
const sum = new Derived({
  fn: () => a.state + b.state,
  deps: [a, b] // Both dependencies listed
})
```

## Framework Integration

TanStack Store is framework-agnostic but can be integrated with React, Vue, Svelte, and other frameworks through adapters or custom hooks.

## Version Notes

- Latest version provides full TypeScript support
- Requires explicit mounting of derived values (breaking change from earlier versions)
- Effect class introduced for managing side effects
- Previous values API added for tracking state changes

## Sources

- [TanStack Store Official Documentation](https://tanstack.com/store/latest)
- [TanStack Store Quick Start Guide](https://tanstack.com/store/latest/docs/quick-start)
- [TanStack Store API Reference](https://tanstack.com/store/latest/docs/reference)

## Documentation File

This documentation is saved at: `/Users/ryanlowe/.claude/docs/tanstack-store.md`