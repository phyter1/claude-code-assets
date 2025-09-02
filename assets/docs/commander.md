# Commander.js - CLI Argument Parsing

## Overview
Commander.js is the complete solution for Node.js command-line interfaces, providing argument parsing, command organization, and automatic help generation. It's the industry standard for building professional CLI applications.

**Version**: 14.0.0  
**Installation**: `bun add commander`  
**GitHub**: https://github.com/tj/commander.js  
**Requirements**: Node.js 20+ (as of v14)  
**TypeScript**: Built-in type definitions

## Why Commander for Code Wrapper

Commander.js is perfect for our CLI entry point because:

1. **Clean Command Structure**: Organize commands and subcommands logically
2. **Automatic Help**: Generates help text from command definitions
3. **Type Safety**: Full TypeScript support with type inference
4. **Industry Standard**: Used by Vue CLI, Create React App, and many others
5. **Argument Parsing**: Handles complex argument patterns and options

## Core Concepts

### Basic Program Setup

```typescript
import { Command } from 'commander';

const program = new Command();

program
  .name('code-wrapper')
  .description('CLI for remote Claude Code execution')
  .version('1.0.0')
  .option('-d, --debug', 'output extra debugging')
  .option('-c, --config <path>', 'set config path', './config.json');

program.parse(process.argv);

const options = program.opts();
console.log('Debug mode:', options.debug);
console.log('Config path:', options.config);
```

### Commands and Subcommands

```typescript
import { Command } from 'commander';

const program = new Command();

// Main command configuration
program
  .name('code-wrapper')
  .description('CLI for remote Claude Code execution')
  .version('1.0.0');

// Subcommand: connect
program
  .command('connect')
  .description('Connect to an existing Claude Code session')
  .argument('<session-id>', 'session ID to connect to')
  .option('-c, --channel <channel>', 'specify Pusher channel')
  .option('-t, --timeout <seconds>', 'connection timeout', parseInt, 30)
  .action((sessionId, options) => {
    console.log(`Connecting to session: ${sessionId}`);
    console.log(`Channel: ${options.channel || 'auto'}`);
    console.log(`Timeout: ${options.timeout}s`);
  });

// Subcommand: exec
program
  .command('exec')
  .description('Execute a new Claude Code command')
  .argument('<command...>', 'command and arguments to execute')
  .option('-d, --detach', 'run in background')
  .option('-w, --working-dir <path>', 'working directory')
  .action((command, options) => {
    console.log(`Executing: ${command.join(' ')}`);
    if (options.detach) {
      console.log('Running in detached mode');
    }
  });

// Subcommand: list
program
  .command('list')
  .alias('ls')
  .description('List all active sessions')
  .option('-a, --all', 'include completed sessions')
  .option('-f, --format <type>', 'output format', 'table')
  .action((options) => {
    console.log(`Listing sessions (all: ${options.all})`);
  });

program.parse();
```

## Code Wrapper CLI Implementation

### Main CLI Entry Point

```typescript
#!/usr/bin/env bun
import { Command } from 'commander';
import { connectCommand } from './commands/connect';
import { execCommand } from './commands/exec';
import { listCommand } from './commands/list';
import { monitorCommand } from './commands/monitor';
import { configCommand } from './commands/config';
import { version } from '../package.json';

const program = new Command();

program
  .name('code-wrapper')
  .description('CLI interface for remote Claude Code execution via WebSocket')
  .version(version)
  .option('-v, --verbose', 'verbose output')
  .option('--api-url <url>', 'override API URL')
  .option('--no-color', 'disable colored output')
  .hook('preAction', (thisCommand, actionCommand) => {
    // Setup before any command runs
    if (thisCommand.opts().verbose) {
      process.env.DEBUG = 'true';
    }
    if (thisCommand.opts().noColor) {
      process.env.NO_COLOR = 'true';
    }
  });

// Add commands
program.addCommand(connectCommand());
program.addCommand(execCommand());
program.addCommand(listCommand());
program.addCommand(monitorCommand());
program.addCommand(configCommand());

// Custom help
program.addHelpText('after', `
Examples:
  $ code-wrapper exec claude --help
  $ code-wrapper connect abc123
  $ code-wrapper list --all
  $ code-wrapper monitor
  $ code-wrapper config set api.url http://localhost:8000
`);

// Error handling
program.exitOverride();

try {
  program.parse();
} catch (err: any) {
  if (err.code === 'commander.missingArgument') {
    console.error(`Error: ${err.message}`);
  } else if (err.code === 'commander.unknownCommand') {
    console.error(`Error: Unknown command. Use --help for available commands.`);
  } else {
    console.error(`Error: ${err.message}`);
  }
  process.exit(1);
}
```

### Connect Command Module

```typescript
// commands/connect.ts
import { Command } from 'commander';
import chalk from 'chalk';
import { TerminalUI } from '../ui/terminal';
import { WebSocketClient } from '../lib/websocket';
import { ConfigManager } from '../lib/config';

export function connectCommand(): Command {
  const command = new Command('connect');
  
  return command
    .description('Connect to an existing Claude Code session')
    .argument('<session-id>', 'session ID to connect to')
    .option('-c, --channel <channel>', 'Pusher channel name')
    .option('-r, --reconnect', 'auto-reconnect on disconnect')
    .option('-t, --timeout <seconds>', 'connection timeout', parseInt, 30)
    .action(async (sessionId, options) => {
      const config = new ConfigManager();
      const ui = new TerminalUI();
      
      try {
        console.log(chalk.blue(`Connecting to session ${sessionId}...`));
        
        const client = new WebSocketClient({
          apiUrl: config.get('apiUrl'),
          pusherKey: config.get('pusherKey'),
          pusherCluster: config.get('pusherCluster')
        });
        
        const channel = options.channel || `private-cmd-${sessionId}`;
        
        await client.connect(sessionId, channel, {
          reconnect: options.reconnect,
          timeout: options.timeout * 1000
        });
        
        // Start terminal UI
        ui.start(client);
        
      } catch (error: any) {
        console.error(chalk.red(`Failed to connect: ${error.message}`));
        process.exit(1);
      }
    });
}
```

### Execute Command Module

```typescript
// commands/exec.ts
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { API } from '../lib/api';
import { TerminalUI } from '../ui/terminal';

export function execCommand(): Command {
  const command = new Command('exec');
  
  return command
    .description('Execute a new Claude Code command')
    .argument('<command>', 'command to execute')
    .argument('[args...]', 'command arguments')
    .option('-d, --detach', 'run in background (returns session ID)')
    .option('-w, --working-dir <path>', 'working directory')
    .option('-e, --env <vars...>', 'environment variables (KEY=value)')
    .option('--no-interactive', 'disable interactive mode')
    .action(async (command, args, options) => {
      const spinner = ora('Starting command...').start();
      
      try {
        const api = new API();
        
        // Parse environment variables
        const env: Record<string, string> = {};
        if (options.env) {
          options.env.forEach((pair: string) => {
            const [key, value] = pair.split('=');
            env[key] = value;
          });
        }
        
        // Start command execution
        const response = await api.executeCommand({
          command,
          args,
          workingDirectory: options.workingDir,
          environment: env
        });
        
        spinner.succeed(chalk.green(`Session created: ${response.sessionId}`));
        
        if (options.detach) {
          // Detached mode - just print session info
          console.log(chalk.blue('\nSession Information:'));
          console.log(`  ID: ${response.sessionId}`);
          console.log(`  Channel: ${response.channel}`);
          console.log(`  Status: ${response.status}`);
          console.log(chalk.gray(`\nReconnect with: code-wrapper connect ${response.sessionId}`));
        } else {
          // Interactive mode - start UI
          spinner.text = 'Connecting to session...';
          
          const ui = new TerminalUI();
          await ui.connectToSession(response.sessionId, response.channel);
        }
        
      } catch (error: any) {
        spinner.fail(chalk.red(`Failed to execute command: ${error.message}`));
        process.exit(1);
      }
    });
}
```

### List Command with Table Output

```typescript
// commands/list.ts
import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { API } from '../lib/api';

export function listCommand(): Command {
  const command = new Command('list');
  
  return command
    .alias('ls')
    .description('List all command sessions')
    .option('-a, --all', 'include completed sessions')
    .option('-f, --format <type>', 'output format (table|json|csv)', 'table')
    .option('-n, --limit <number>', 'limit number of results', parseInt, 50)
    .option('-s, --sort <field>', 'sort by field', 'created_at')
    .action(async (options) => {
      try {
        const api = new API();
        const sessions = await api.listSessions({
          includeCompleted: options.all,
          limit: options.limit,
          sort: options.sort
        });
        
        if (options.format === 'json') {
          console.log(JSON.stringify(sessions, null, 2));
          return;
        }
        
        if (options.format === 'csv') {
          console.log('ID,Command,Status,Created,Duration');
          sessions.forEach(s => {
            console.log(`${s.id},${s.command},${s.status},${s.createdAt},${s.duration}`);
          });
          return;
        }
        
        // Table format (default)
        const table = new Table({
          head: ['ID', 'Command', 'Status', 'Created', 'Duration'],
          style: {
            head: ['cyan'],
            border: ['gray']
          }
        });
        
        sessions.forEach(session => {
          table.push([
            session.id.substring(0, 8),
            truncate(session.command, 30),
            getStatusColor(session.status),
            formatTime(session.createdAt),
            formatDuration(session.duration)
          ]);
        });
        
        console.log(table.toString());
        console.log(chalk.gray(`\nTotal: ${sessions.length} sessions`));
        
      } catch (error: any) {
        console.error(chalk.red(`Failed to list sessions: ${error.message}`));
        process.exit(1);
      }
    });
}

function getStatusColor(status: string): string {
  const colors: Record<string, (s: string) => string> = {
    running: chalk.green,
    complete: chalk.blue,
    failed: chalk.red,
    pending: chalk.yellow
  };
  return (colors[status] || chalk.white)(status);
}

function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length - 3) + '...' : str;
}

function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString();
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  } else if (mins > 0) {
    return `${mins}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}
```

### Configuration Command

```typescript
// commands/config.ts
import { Command } from 'commander';
import chalk from 'chalk';
import { ConfigManager } from '../lib/config';

export function configCommand(): Command {
  const command = new Command('config');
  
  command
    .description('Manage CLI configuration');
  
  // Subcommand: config get
  command
    .command('get [key]')
    .description('Get configuration value')
    .action((key) => {
      const config = new ConfigManager();
      
      if (key) {
        const value = config.get(key);
        if (value !== undefined) {
          console.log(value);
        } else {
          console.error(chalk.red(`Unknown configuration key: ${key}`));
          process.exit(1);
        }
      } else {
        // Show all config
        console.log(JSON.stringify(config.getAll(), null, 2));
      }
    });
  
  // Subcommand: config set
  command
    .command('set <key> <value>')
    .description('Set configuration value')
    .action((key, value) => {
      const config = new ConfigManager();
      
      try {
        config.set(key, value);
        console.log(chalk.green(`✓ Set ${key} = ${value}`));
      } catch (error: any) {
        console.error(chalk.red(`Failed to set config: ${error.message}`));
        process.exit(1);
      }
    });
  
  // Subcommand: config reset
  command
    .command('reset')
    .description('Reset configuration to defaults')
    .option('-y, --yes', 'skip confirmation')
    .action(async (options) => {
      if (!options.yes) {
        const confirm = await promptConfirm('Reset all configuration to defaults?');
        if (!confirm) {
          console.log('Cancelled');
          return;
        }
      }
      
      const config = new ConfigManager();
      config.reset();
      console.log(chalk.green('✓ Configuration reset to defaults'));
    });
  
  return command;
}
```

## Advanced Features

### Custom Option Processing

```typescript
program
  .option('-p, --port <number>', 'server port', (value) => {
    const port = parseInt(value, 10);
    if (isNaN(port)) {
      throw new Error(`Invalid port: ${value}`);
    }
    if (port < 1 || port > 65535) {
      throw new Error(`Port must be between 1 and 65535`);
    }
    return port;
  }, 3000)
  .option('--host <host>', 'server host', 'localhost');
```

### Variadic Arguments

```typescript
program
  .command('run')
  .description('Run multiple commands')
  .argument('<commands...>', 'commands to run')
  .action((commands) => {
    commands.forEach(cmd => {
      console.log(`Running: ${cmd}`);
    });
  });
```

### Command Aliases

```typescript
program
  .command('remove')
  .alias('rm')
  .alias('delete')
  .alias('del')
  .description('Remove a session')
  .argument('<session-id>')
  .action((sessionId) => {
    console.log(`Removing session: ${sessionId}`);
  });
```

### Async Actions with Error Handling

```typescript
program
  .command('deploy')
  .description('Deploy application')
  .action(async () => {
    try {
      console.log('Starting deployment...');
      await deployApplication();
      console.log(chalk.green('✓ Deployment successful'));
    } catch (error: any) {
      console.error(chalk.red(`✗ Deployment failed: ${error.message}`));
      process.exit(1);
    }
  });
```

### Environment Variable Support

```typescript
program
  .command('serve')
  .description('Start server')
  .option('-p, --port <number>', 'port number', process.env.PORT || '3000')
  .option('--host <host>', 'host address', process.env.HOST || 'localhost')
  .action((options) => {
    console.log(`Server: ${options.host}:${options.port}`);
  });
```

## Integration with Blessed

```typescript
import { Command } from 'commander';
import { TerminalUI } from './ui/terminal';
import { MonitoringDashboard } from './ui/dashboard';

const program = new Command();

program
  .command('monitor')
  .description('Launch monitoring dashboard')
  .option('-i, --interval <ms>', 'update interval', parseInt, 1000)
  .action((options) => {
    // Commander handles argument parsing
    // Then launches Blessed UI
    const dashboard = new MonitoringDashboard({
      updateInterval: options.interval
    });
    dashboard.start();
  });

program
  .command('interactive')
  .description('Start interactive mode')
  .action(() => {
    // Launch Blessed UI directly
    const ui = new TerminalUI();
    ui.start();
  });

program.parse();
```

## Testing Commander Commands

```typescript
import { Command } from 'commander';
import { test, expect } from 'bun:test';

test('parse connect command', () => {
  const program = new Command();
  
  program
    .exitOverride() // Prevent process.exit in tests
    .command('connect')
    .argument('<session-id>')
    .option('-c, --channel <channel>')
    .action((sessionId, options) => {
      expect(sessionId).toBe('abc123');
      expect(options.channel).toBe('test-channel');
    });
  
  program.parse(['node', 'test', 'connect', 'abc123', '-c', 'test-channel']);
});

test('validate required arguments', () => {
  const program = new Command();
  program.exitOverride();
  
  program
    .command('exec')
    .argument('<command>');
  
  expect(() => {
    program.parse(['node', 'test', 'exec']);
  }).toThrow('Missing required argument');
});
```

## Best Practices

1. **Organize Commands**: Use separate modules for complex commands
2. **Validate Input**: Use custom option processors for validation
3. **Provide Examples**: Add helpful examples in help text
4. **Handle Errors**: Use try-catch in async actions
5. **Exit Codes**: Use appropriate exit codes for different error types
6. **Environment Variables**: Support env vars for configuration
7. **TypeScript**: Leverage TypeScript for type-safe command handlers

## Common Patterns

### Global Options

```typescript
program
  .option('-v, --verbose', 'verbose output')
  .hook('preAction', (thisCommand) => {
    if (thisCommand.opts().verbose) {
      process.env.LOG_LEVEL = 'debug';
    }
  });
```

### Configuration File Support

```typescript
program
  .option('-c, --config <path>', 'config file path')
  .hook('preAction', async (thisCommand) => {
    const configPath = thisCommand.opts().config;
    if (configPath) {
      const config = await loadConfig(configPath);
      Object.assign(process.env, config);
    }
  });
```

### Version from package.json

```typescript
import { version } from '../package.json';

program.version(version, '-v, --version', 'output the current version');
```

## Resources
- [Official Documentation](https://github.com/tj/commander.js)
- [TypeScript Guide](https://github.com/tj/commander.js#typescript)
- [Examples](https://github.com/tj/commander.js/tree/master/examples)
- [Migration Guide (v14)](https://github.com/tj/commander.js/blob/master/CHANGELOG.md)