# Blessed - Terminal Interface Library

## Overview
Blessed is a high-level terminal interface library for Node.js, providing ncurses-like functionality in pure JavaScript. It enables building sophisticated terminal user interfaces with widgets, layouts, and event handling.

**Version**: 0.1.81 (stable)  
**Installation**: `bun add blessed @types/blessed`  
**GitHub**: https://github.com/chjj/blessed  
**Weekly Downloads**: 500K+

## Why Blessed for Code Wrapper

Blessed is the optimal choice for our CLI application because:

1. **Terminal Emulation**: Native support for ANSI escape sequences crucial for Claude Code output
2. **Performance**: Direct terminal manipulation without virtual DOM overhead
3. **Widget System**: Complete set of UI components for command output and input
4. **Scrolling**: Built-in scrollable areas perfect for streaming command output
5. **Mouse Support**: Full mouse interaction for text selection and UI navigation
6. **Stability**: Battle-tested in production by npm, webpack-dashboard, and other major tools

## Core Concepts

### Screen
The root element that manages the entire terminal interface:

```typescript
import blessed from 'blessed';

const screen = blessed.screen({
  smartCSR: true,        // Optimize for CSR (change-scroll-region)
  title: 'Code Wrapper', // Terminal window title
  fullUnicode: true,     // Support Unicode characters
  dockBorders: true,     // Dock borders of elements
  autoPadding: true      // Automatic padding for borders
});

// Handle exit
screen.key(['escape', 'q', 'C-c'], () => {
  return process.exit(0);
});
```

### Box Widget
The fundamental building block for layouts:

```typescript
const box = blessed.box({
  parent: screen,
  top: 0,
  left: 0,
  width: '100%',
  height: '50%',
  content: 'Hello World',
  border: {
    type: 'line'
  },
  style: {
    fg: 'white',
    bg: 'blue',
    border: {
      fg: 'cyan'
    }
  }
});
```

### Log Widget (Perfect for Command Output)
Scrollable log display for streaming output:

```typescript
const outputLog = blessed.log({
  parent: screen,
  top: 0,
  left: 0,
  width: '100%',
  height: '80%',
  border: {
    type: 'line'
  },
  style: {
    border: {
      fg: 'cyan'
    }
  },
  scrollable: true,
  alwaysScroll: true,
  mouse: true,        // Enable mouse scrolling
  keys: true,         // Enable keyboard scrolling
  vi: true,           // Vi-style keys (j/k for down/up)
  scrollbar: {
    ch: ' ',
    inverse: true
  },
  label: ' Command Output '
});

// Add content
outputLog.log('Starting command execution...');
outputLog.log('Output line 1');
outputLog.log('Output line 2');
```

### Textbox Widget (For User Input)
Input field for commands and interactive responses:

```typescript
const inputBox = blessed.textbox({
  parent: screen,
  bottom: 0,
  left: 0,
  width: '100%',
  height: 3,
  inputOnFocus: true,
  border: {
    type: 'line'
  },
  style: {
    border: {
      fg: 'green'
    }
  },
  label: ' Input '
});

// Handle input submission
inputBox.key('enter', () => {
  const value = inputBox.getValue();
  handleCommand(value);
  inputBox.clearValue();
  inputBox.focus();
  screen.render();
});

// Focus for input
inputBox.focus();
```

## Code Wrapper Implementation

### Main CLI Interface Structure

```typescript
import blessed from 'blessed';
import { EventEmitter } from 'events';

export class TerminalUI extends EventEmitter {
  private screen: blessed.Widgets.Screen;
  private outputLog: blessed.Widgets.Log;
  private inputBox: blessed.Widgets.Textbox;
  private statusBar: blessed.Widgets.Box;
  private sessionInfo: blessed.Widgets.Box;
  
  constructor() {
    super();
    this.initializeScreen();
    this.createLayout();
    this.setupEventHandlers();
  }
  
  private initializeScreen() {
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'Code Wrapper CLI',
      fullUnicode: true,
      dockBorders: true,
      autoPadding: true
    });
  }
  
  private createLayout() {
    // Session info header
    this.sessionInfo = blessed.box({
      parent: this.screen,
      top: 0,
      left: 0,
      width: '100%',
      height: 3,
      content: 'Code Wrapper CLI - Disconnected',
      style: {
        fg: 'white',
        bg: 'blue',
        bold: true
      },
      align: 'center'
    });
    
    // Main output area
    this.outputLog = blessed.log({
      parent: this.screen,
      top: 3,
      left: 0,
      width: '100%',
      height: '100%-9',
      border: {
        type: 'line'
      },
      style: {
        border: {
          fg: 'cyan'
        },
        scrollbar: {
          bg: 'blue'
        }
      },
      scrollable: true,
      alwaysScroll: true,
      mouse: true,
      keys: true,
      vi: true,
      scrollbar: {
        ch: ' ',
        track: {
          bg: 'cyan'
        },
        style: {
          inverse: true
        }
      },
      label: ' Command Output '
    });
    
    // Status bar
    this.statusBar = blessed.box({
      parent: this.screen,
      bottom: 3,
      left: 0,
      width: '100%',
      height: 1,
      content: 'Status: Ready | Use Ctrl+C to exit',
      style: {
        fg: 'white',
        bg: 'green'
      }
    });
    
    // Input area
    this.inputBox = blessed.textbox({
      parent: this.screen,
      bottom: 0,
      left: 0,
      width: '100%',
      height: 3,
      inputOnFocus: true,
      border: {
        type: 'line'
      },
      style: {
        border: {
          fg: 'green'
        },
        focus: {
          border: {
            fg: 'yellow'
          }
        }
      },
      label: ' Enter Command '
    });
  }
  
  private setupEventHandlers() {
    // Exit handlers
    this.screen.key(['escape', 'q', 'C-c'], () => {
      this.emit('exit');
      return process.exit(0);
    });
    
    // Input submission
    this.inputBox.key('enter', () => {
      const command = this.inputBox.getValue();
      if (command.trim()) {
        this.emit('command', command);
        this.addOutput(`> ${command}`, 'cyan');
        this.inputBox.clearValue();
      }
      this.inputBox.focus();
      this.screen.render();
    });
    
    // Tab to switch focus between output and input
    this.screen.key('tab', () => {
      if (this.screen.focused === this.inputBox) {
        this.outputLog.focus();
      } else {
        this.inputBox.focus();
      }
      this.screen.render();
    });
    
    // Initial focus
    this.inputBox.focus();
  }
  
  public addOutput(text: string, color?: string) {
    if (color) {
      // Use blessed's built-in color tags
      this.outputLog.log(`{${color}-fg}${text}{/}`);
    } else {
      this.outputLog.log(text);
    }
    this.screen.render();
  }
  
  public updateStatus(status: string, color: string = 'green') {
    this.statusBar.style.bg = color;
    this.statusBar.setContent(`Status: ${status} | Use Ctrl+C to exit`);
    this.screen.render();
  }
  
  public setSession(sessionId: string, channel: string) {
    this.sessionInfo.setContent(`Code Wrapper CLI - Session: ${sessionId} | Channel: ${channel}`);
    this.screen.render();
  }
  
  public render() {
    this.screen.render();
  }
  
  public destroy() {
    this.screen.destroy();
  }
}
```

### Integration with WebSocket

```typescript
import Pusher from 'pusher-js';
import { TerminalUI } from './terminal-ui';

class CLISession {
  private ui: TerminalUI;
  private pusher: Pusher;
  private channel: any;
  
  constructor() {
    this.ui = new TerminalUI();
    this.setupUIHandlers();
  }
  
  private setupUIHandlers() {
    this.ui.on('command', async (command: string) => {
      await this.sendCommand(command);
    });
    
    this.ui.on('exit', () => {
      this.disconnect();
    });
  }
  
  public connect(sessionId: string, channelName: string) {
    this.ui.setSession(sessionId, channelName);
    this.ui.updateStatus('Connecting...', 'yellow');
    
    this.pusher = new Pusher(process.env.PUSHER_KEY!, {
      cluster: process.env.PUSHER_CLUSTER!
    });
    
    this.channel = this.pusher.subscribe(channelName);
    
    this.channel.bind('pusher:subscription_succeeded', () => {
      this.ui.updateStatus('Connected', 'green');
      this.ui.addOutput('✓ Connected to session', 'green');
    });
    
    this.channel.bind('output', (data: any) => {
      // Handle stdout/stderr
      if (data.stdout) {
        this.ui.addOutput(data.stdout);
      }
      if (data.stderr) {
        this.ui.addOutput(data.stderr, 'red');
      }
    });
    
    this.channel.bind('complete', (data: any) => {
      this.ui.addOutput(`Process exited with code ${data.exitCode}`, 'yellow');
      this.ui.updateStatus('Session Complete', 'blue');
    });
    
    this.channel.bind('error', (data: any) => {
      this.ui.addOutput(`Error: ${data.message}`, 'red');
      this.ui.updateStatus('Error', 'red');
    });
  }
  
  private async sendCommand(command: string) {
    // Send to API
    const response = await fetch(`${API_URL}/sessions/${sessionId}/input`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: command })
    });
    
    if (!response.ok) {
      this.ui.addOutput('Failed to send command', 'red');
    }
  }
  
  public disconnect() {
    if (this.channel) {
      this.pusher.unsubscribe(this.channel.name);
    }
    if (this.pusher) {
      this.pusher.disconnect();
    }
    this.ui.destroy();
  }
}
```

## Advanced Features

### Forms and Dialogs

```typescript
const form = blessed.form({
  parent: screen,
  keys: true,
  vi: true,
  left: 'center',
  top: 'center',
  width: '50%',
  height: '50%',
  border: 'line',
  label: ' Configuration '
});

const apiInput = blessed.textbox({
  parent: form,
  name: 'api',
  top: 1,
  left: 2,
  height: 3,
  inputOnFocus: true,
  content: 'http://localhost:8000',
  border: 'line',
  label: ' API URL '
});

const submit = blessed.button({
  parent: form,
  name: 'submit',
  content: 'Save',
  bottom: 1,
  left: 'center',
  shrink: true,
  padding: { left: 2, right: 2 },
  style: {
    bold: true,
    fg: 'white',
    bg: 'green',
    focus: {
      bg: 'blue'
    }
  }
});

submit.on('press', () => {
  form.submit();
});

form.on('submit', (data) => {
  // Handle form data
  console.log(data);
});
```

### Progress Bars

```typescript
const progressBar = blessed.progressbar({
  parent: screen,
  bottom: 5,
  left: 'center',
  width: '80%',
  height: 3,
  border: 'line',
  label: ' Progress ',
  style: {
    bar: {
      bg: 'green'
    }
  },
  ch: '█',
  filled: 0
});

// Update progress
let progress = 0;
const timer = setInterval(() => {
  progress += 10;
  progressBar.setProgress(progress);
  screen.render();
  
  if (progress >= 100) {
    clearInterval(timer);
  }
}, 100);
```

## Best Practices

1. **Always call screen.render()** after making changes
2. **Use keys property** for keyboard navigation in widgets
3. **Implement proper cleanup** in exit handlers
4. **Use vi: true** for familiar keyboard shortcuts
5. **Enable mouse support** for better user experience
6. **Use blessed color tags** for styled output: `{red-fg}text{/}`
7. **Handle resize events** for responsive layouts

## Testing

```typescript
// Mock blessed for unit tests
jest.mock('blessed', () => ({
  screen: jest.fn(() => ({
    key: jest.fn(),
    render: jest.fn(),
    destroy: jest.fn()
  })),
  box: jest.fn(() => ({
    setContent: jest.fn()
  })),
  log: jest.fn(() => ({
    log: jest.fn()
  }))
}));
```

## Common Patterns for Code Wrapper

### Auto-scrolling Output
```typescript
outputLog.on('log', () => {
  outputLog.setScrollPerc(100);
  screen.render();
});
```

### ANSI Color Support
```typescript
const outputLog = blessed.log({
  // ... other options
  tags: true,     // Enable color tags
  parseTags: true // Parse ANSI codes
});
```

### Copy/Paste Support
```typescript
outputLog.key('C-c', () => {
  const selected = outputLog.getContent();
  clipboard.writeSync(selected);
});
```

## Resources
- [Official Documentation](https://github.com/chjj/blessed)
- [API Reference](https://github.com/chjj/blessed/blob/master/docs/widgets.md)
- [Examples](https://github.com/chjj/blessed/tree/master/example)