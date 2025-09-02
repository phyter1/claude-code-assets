# Chalk - Terminal String Styling

## Overview
Chalk is the premier terminal string styling library for Node.js, providing an expressive API for coloring and formatting console output. With zero dependencies and excellent performance, it's the de facto standard for terminal styling.

**Version**: 5.6.0 (ESM-only)  
**Installation**: `bun add chalk`  
**GitHub**: https://github.com/chalk/chalk  
**Weekly Downloads**: 200M+  
**Note**: Version 5 is ESM-only; use v4 for CommonJS compatibility

## Why Chalk for Code Wrapper

Chalk is essential for our CLI because:

1. **Zero Dependencies**: Minimal overhead, perfect for CLI tools
2. **Expressive API**: Chainable styles make code readable
3. **Performance**: Highly optimized for terminal rendering
4. **Auto-Detection**: Automatically detects color support levels
5. **Blessed Compatible**: Works seamlessly within Blessed widgets

## Core Features

### Basic Colors

```typescript
import chalk from 'chalk';

// Foreground colors
console.log(chalk.black('Black text'));
console.log(chalk.red('Red text'));
console.log(chalk.green('Green text'));
console.log(chalk.yellow('Yellow text'));
console.log(chalk.blue('Blue text'));
console.log(chalk.magenta('Magenta text'));
console.log(chalk.cyan('Cyan text'));
console.log(chalk.white('White text'));
console.log(chalk.gray('Gray text'));

// Bright colors
console.log(chalk.redBright('Bright red'));
console.log(chalk.greenBright('Bright green'));
console.log(chalk.blueBright('Bright blue'));
```

### Background Colors

```typescript
// Background colors
console.log(chalk.bgRed('Red background'));
console.log(chalk.bgGreen('Green background'));
console.log(chalk.bgBlue('Blue background'));
console.log(chalk.bgYellow('Yellow background'));

// Bright backgrounds
console.log(chalk.bgRedBright('Bright red background'));
console.log(chalk.bgGreenBright('Bright green background'));

// Combining foreground and background
console.log(chalk.white.bgBlue('White text on blue background'));
console.log(chalk.black.bgYellow('Black text on yellow background'));
```

### Text Styles

```typescript
// Text modifiers
console.log(chalk.bold('Bold text'));
console.log(chalk.dim('Dimmed text'));
console.log(chalk.italic('Italic text'));
console.log(chalk.underline('Underlined text'));
console.log(chalk.inverse('Inverse colors'));
console.log(chalk.hidden('Hidden text'));
console.log(chalk.strikethrough('Strikethrough text'));

// Combining styles
console.log(chalk.bold.red('Bold red text'));
console.log(chalk.italic.green('Italic green text'));
console.log(chalk.underline.blue('Underlined blue text'));
console.log(chalk.bold.italic.red('Bold italic red'));
```

## Code Wrapper Implementation

### Status Messages

```typescript
import chalk from 'chalk';

export class Logger {
  static success(message: string) {
    console.log(chalk.green('✓'), chalk.green(message));
  }
  
  static error(message: string) {
    console.error(chalk.red('✗'), chalk.red(message));
  }
  
  static warning(message: string) {
    console.warn(chalk.yellow('⚠'), chalk.yellow(message));
  }
  
  static info(message: string) {
    console.log(chalk.blue('ℹ'), chalk.blue(message));
  }
  
  static debug(message: string) {
    if (process.env.DEBUG) {
      console.log(chalk.gray('[DEBUG]'), chalk.gray(message));
    }
  }
  
  static command(cmd: string) {
    console.log(chalk.cyan('$'), chalk.cyan(cmd));
  }
  
  static output(text: string) {
    console.log(chalk.white(text));
  }
  
  static timestamp(message: string) {
    const time = new Date().toISOString().substr(11, 8);
    console.log(chalk.gray(`[${time}]`), message);
  }
}

// Usage
Logger.success('Connection established');
Logger.error('Failed to connect to server');
Logger.warning('High memory usage detected');
Logger.info('Starting command execution');
Logger.command('claude --help');
Logger.debug('WebSocket frame received');
```

### Session Status Display

```typescript
import chalk from 'chalk';

export function formatSessionStatus(status: string): string {
  const statusColors = {
    running: chalk.green,
    pending: chalk.yellow,
    complete: chalk.blue,
    failed: chalk.red,
    cancelled: chalk.gray
  };
  
  const statusIcons = {
    running: '●',
    pending: '◌',
    complete: '✓',
    failed: '✗',
    cancelled: '⊘'
  };
  
  const color = statusColors[status.toLowerCase()] || chalk.white;
  const icon = statusIcons[status.toLowerCase()] || '?';
  
  return color(`${icon} ${status.toUpperCase()}`);
}

// Usage
console.log(formatSessionStatus('running'));   // Green: ● RUNNING
console.log(formatSessionStatus('failed'));    // Red: ✗ FAILED
console.log(formatSessionStatus('complete'));  // Blue: ✓ COMPLETE
```

### Command Output Formatting

```typescript
import chalk from 'chalk';

export class OutputFormatter {
  static formatCommandLine(command: string, args: string[]): string {
    return chalk.cyan('$') + ' ' + 
           chalk.bold.cyan(command) + ' ' + 
           chalk.cyan(args.join(' '));
  }
  
  static formatError(error: Error): string {
    const lines = [
      chalk.red.bold('Error: ' + error.message),
      ''
    ];
    
    if (error.stack) {
      const stackLines = error.stack.split('\n').slice(1);
      stackLines.forEach(line => {
        lines.push(chalk.gray(line));
      });
    }
    
    return lines.join('\n');
  }
  
  static formatKeyValue(key: string, value: any): string {
    return chalk.gray(key + ':') + ' ' + chalk.white(String(value));
  }
  
  static formatTable(headers: string[], rows: string[][]): string {
    const lines: string[] = [];
    
    // Headers
    lines.push(chalk.bold.underline(headers.join('\t')));
    
    // Rows
    rows.forEach(row => {
      lines.push(row.join('\t'));
    });
    
    return lines.join('\n');
  }
  
  static formatDiff(added: string[], removed: string[]): string {
    const lines: string[] = [];
    
    removed.forEach(line => {
      lines.push(chalk.red('- ' + line));
    });
    
    added.forEach(line => {
      lines.push(chalk.green('+ ' + line));
    });
    
    return lines.join('\n');
  }
}
```

### Progress and Loading States

```typescript
import chalk from 'chalk';

export class ProgressFormatter {
  static bar(progress: number, total: number, width: number = 30): string {
    const percentage = Math.round((progress / total) * 100);
    const filled = Math.round((progress / total) * width);
    const empty = width - filled;
    
    const bar = 
      chalk.green('█'.repeat(filled)) + 
      chalk.gray('░'.repeat(empty));
    
    return `[${bar}] ${chalk.bold(percentage + '%')}`;
  }
  
  static spinner(frame: number): string {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    return chalk.cyan(frames[frame % frames.length]);
  }
  
  static dots(count: number): string {
    return chalk.gray('.'.repeat(count % 4));
  }
}

// Usage
console.log(ProgressFormatter.bar(75, 100));  // [████████████████████████░░░░░░] 75%
```

## Advanced Features

### RGB and Hex Colors

```typescript
import chalk from 'chalk';

// RGB colors
console.log(chalk.rgb(123, 45, 67)('Custom RGB color'));
console.log(chalk.bgRgb(123, 45, 67)('Custom RGB background'));

// Hex colors
console.log(chalk.hex('#DEADED')('Hex color'));
console.log(chalk.bgHex('#DEADED')('Hex background'));

// ANSI 256 colors
console.log(chalk.ansi256(196)('ANSI 256 color'));
console.log(chalk.bgAnsi256(196)('ANSI 256 background'));
```

### Template Literals

```typescript
import chalk from 'chalk';

// Using template literals
const cpu = 85;
const ram = 42;
const disk = 74;

console.log(chalk`
  CPU:  {red ${cpu}%}
  RAM:  {green ${ram}%}
  DISK: {yellow ${disk}%}
`);

// Complex templates
const error = 'File not found';
const path = '/usr/local/bin/claude';

console.log(chalk`
  {bold.red Error:} {red ${error}}
  {gray Path:} {underline ${path}}
`);
```

### Color Level Detection

```typescript
import chalk from 'chalk';

// Check color support
console.log('Color support level:', chalk.level);
// 0 - No color support
// 1 - Basic 16 colors
// 2 - 256 colors
// 3 - Truecolor (16 million colors)

// Force color level
const customChalk = new chalk.Instance({level: 1});

// Disable colors
const noColorChalk = new chalk.Instance({level: 0});
```

## Integration with Blessed

```typescript
import blessed from 'blessed';
import chalk from 'chalk';

// Chalk works within Blessed text content
const box = blessed.box({
  parent: screen,
  content: chalk.green('Success!') + '\n' + chalk.red('Error!')
});

// For Blessed's built-in tags, convert Chalk output
function chalkToBlessed(text: string): string {
  return text
    .replace(/\x1b\[31m/g, '{red-fg}')
    .replace(/\x1b\[32m/g, '{green-fg}')
    .replace(/\x1b\[33m/g, '{yellow-fg}')
    .replace(/\x1b\[34m/g, '{blue-fg}')
    .replace(/\x1b\[0m/g, '{/}');
}

// Or use Blessed's tag system directly
const log = blessed.log({
  tags: true
});

log.log('{green-fg}Success!{/}');
log.log('{red-fg}Error!{/}');
```

## Performance Optimization

```typescript
import chalk from 'chalk';

// Cache styled strings for repeated use
const styles = {
  success: chalk.green,
  error: chalk.red,
  warning: chalk.yellow,
  info: chalk.blue
};

// Reuse style functions
function logStatus(type: keyof typeof styles, message: string) {
  console.log(styles[type](message));
}

// Avoid creating new chalk instances in loops
const redStyle = chalk.red;
for (let i = 0; i < 1000; i++) {
  console.log(redStyle(`Error ${i}`));  // Reuse style
}

// Conditional styling
const isError = true;
const style = isError ? chalk.red : chalk.green;
console.log(style('Status message'));
```

## Testing with Chalk

```typescript
import { test, expect } from 'bun:test';
import chalk from 'chalk';

test('format error message', () => {
  // Force color in tests
  const testChalk = new chalk.Instance({level: 3});
  
  const message = testChalk.red('Error');
  expect(message).toContain('\x1b[31m');  // ANSI red code
  expect(message).toContain('Error');
  expect(message).toContain('\x1b[39m');  // Reset code
});

test('strip colors for testing', () => {
  const message = chalk.red('Error');
  const stripped = message.replace(/\x1b\[[0-9;]*m/g, '');
  expect(stripped).toBe('Error');
});
```

## Environment Variables

```typescript
import chalk from 'chalk';

// Respect NO_COLOR environment variable
if (process.env.NO_COLOR) {
  chalk.level = 0;
}

// Force color
if (process.env.FORCE_COLOR) {
  chalk.level = 3;
}

// Custom color detection
function shouldUseColor(): boolean {
  if (process.env.NO_COLOR) return false;
  if (process.env.FORCE_COLOR) return true;
  if (process.env.CI) return false;
  if (process.stdout.isTTY) return true;
  return false;
}

const useColor = shouldUseColor();
const log = useColor ? chalk.green : (s: string) => s;
console.log(log('Message'));
```

## Best Practices

1. **Cache Styles**: Store style functions for repeated use
2. **Template Literals**: Use chalk template literals for complex formatting
3. **Color Detection**: Respect user's color preferences and terminal capabilities
4. **Semantic Colors**: Use consistent colors for similar message types
5. **Accessibility**: Ensure output is readable without colors
6. **Performance**: Avoid creating chalk instances in hot paths
7. **Testing**: Use fixed color levels in tests for consistency

## Common Patterns for Code Wrapper

### Command Execution Flow

```typescript
import chalk from 'chalk';

export function logCommandFlow(command: string, sessionId: string) {
  console.log();
  console.log(chalk.blue('━'.repeat(50)));
  console.log(chalk.blue.bold('Command Execution'));
  console.log(chalk.blue('━'.repeat(50)));
  console.log(chalk.gray('Session ID:'), chalk.white(sessionId));
  console.log(chalk.gray('Command:'), chalk.cyan(command));
  console.log(chalk.gray('Time:'), chalk.white(new Date().toISOString()));
  console.log(chalk.blue('━'.repeat(50)));
  console.log();
}
```

### Status Badge System

```typescript
import chalk from 'chalk';

export function badge(label: string, message: string, color: string = 'blue'): string {
  const colors = {
    blue: chalk.white.bgBlue,
    green: chalk.white.bgGreen,
    red: chalk.white.bgRed,
    yellow: chalk.black.bgYellow,
    gray: chalk.white.bgGray
  };
  
  const bgColor = colors[color] || chalk.white.bgBlue;
  return bgColor(` ${label} `) + ' ' + chalk.white(message);
}

// Usage
console.log(badge('INFO', 'Server started'));
console.log(badge('SUCCESS', 'Build complete', 'green'));
console.log(badge('ERROR', 'Connection failed', 'red'));
```

## Resources
- [Official Documentation](https://github.com/chalk/chalk)
- [Terminal Colors Guide](https://github.com/chalk/chalk#256-and-truecolor-color-support)
- [Template Literal Syntax](https://github.com/chalk/chalk#tagged-template-literal)
- [Migration from v4 to v5](https://github.com/chalk/chalk/releases/tag/v5.0.0)