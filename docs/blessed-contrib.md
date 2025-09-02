# blessed-contrib - Dashboard Components for Blessed

## Overview
blessed-contrib extends Blessed with terminal dashboard components including charts, graphs, tables, and other data visualization widgets. Perfect for creating monitoring dashboards and real-time data displays in the terminal.

**Version**: 4.11.0  
**Installation**: `bun add blessed-contrib`  
**GitHub**: https://github.com/yaronn/blessed-contrib  
**Dependencies**: Requires blessed

## Why blessed-contrib for Code Wrapper

blessed-contrib is essential for our monitoring dashboard features:

1. **Session Monitoring**: Table widgets to display active command sessions
2. **Real-time Graphs**: Visualize command execution metrics
3. **Log Viewers**: Enhanced log display for multiple sessions
4. **Status Gauges**: CPU, memory, and connection status indicators
5. **Grid Layout**: Easy dashboard composition with responsive grids

## Core Components

### Grid Layout System

The grid system simplifies creating complex dashboard layouts:

```typescript
import blessed from 'blessed';
import contrib from 'blessed-contrib';

const screen = blessed.screen();
const grid = new contrib.grid({
  rows: 12,
  cols: 12,
  screen: screen
});

// Place widgets using grid coordinates
// grid.set(row, col, rowSpan, colSpan, component, options)
const table = grid.set(0, 0, 6, 6, contrib.table, {
  label: 'Active Sessions'
});

const log = grid.set(6, 0, 6, 12, contrib.log, {
  label: 'System Log'
});

const line = grid.set(0, 6, 6, 6, contrib.line, {
  label: 'CPU Usage'
});

screen.render();
```

### Table Widget (Session Management)

Perfect for displaying active Claude Code sessions:

```typescript
const sessionTable = grid.set(0, 0, 6, 8, contrib.table, {
  keys: true,
  vi: true,
  fg: 'white',
  selectedFg: 'white',
  selectedBg: 'blue',
  interactive: true,
  label: 'Active Sessions',
  width: '100%',
  height: '100%',
  border: {
    type: 'line',
    fg: 'cyan'
  },
  columnSpacing: 3,
  columnWidth: [10, 20, 15, 10, 20]
});

// Update table data
sessionTable.setData({
  headers: ['ID', 'Command', 'Status', 'Duration', 'Channel'],
  data: [
    ['abc123', 'claude --help', 'Running', '00:02:15', 'private-cmd-abc123'],
    ['def456', 'claude init', 'Complete', '00:00:45', 'private-cmd-def456'],
    ['ghi789', 'claude run test', 'Running', '00:01:30', 'private-cmd-ghi789']
  ]
});

// Handle row selection
sessionTable.rows.on('select', (node) => {
  const sessionId = node.content.split(' ')[0];
  connectToSession(sessionId);
});

screen.render();
```

### Line Chart (Metrics Visualization)

Display real-time metrics for command execution:

```typescript
const cpuLine = grid.set(0, 8, 4, 4, contrib.line, {
  style: {
    line: 'yellow',
    text: 'green',
    baseline: 'black'
  },
  xLabelPadding: 3,
  xPadding: 5,
  showLegend: true,
  wholeNumbersOnly: false,
  label: 'CPU Usage %'
});

// Data series
const cpuData = {
  title: 'CPU',
  x: ['t-10', 't-9', 't-8', 't-7', 't-6', 't-5', 't-4', 't-3', 't-2', 't-1', 'now'],
  y: [20, 25, 30, 35, 40, 45, 50, 45, 40, 35, 30],
  style: {
    line: 'red'
  }
};

const memData = {
  title: 'Memory',
  x: ['t-10', 't-9', 't-8', 't-7', 't-6', 't-5', 't-4', 't-3', 't-2', 't-1', 'now'],
  y: [60, 62, 65, 68, 70, 72, 75, 73, 71, 70, 68],
  style: {
    line: 'blue'
  }
};

cpuLine.setData([cpuData, memData]);

// Update in real-time
setInterval(() => {
  cpuData.y.shift();
  cpuData.y.push(Math.random() * 100);
  memData.y.shift();
  memData.y.push(Math.random() * 100);
  cpuLine.setData([cpuData, memData]);
  screen.render();
}, 1000);
```

### Gauge Widgets (Status Indicators)

Visual indicators for system status:

```typescript
const gauge = grid.set(4, 8, 2, 4, contrib.gauge, {
  label: 'Connection Strength',
  stroke: 'green',
  fill: 'white',
  percent: 0
});

// Update gauge
gauge.setPercent(75);

// Donut gauge variant
const donut = grid.set(6, 8, 3, 4, contrib.donut, {
  label: 'Resource Usage',
  radius: 8,
  arcWidth: 3,
  remainColor: 'black',
  yPadding: 2
});

donut.setData([
  { percent: 80, label: 'CPU', color: 'green' },
  { percent: 60, label: 'Memory', color: 'cyan' },
  { percent: 40, label: 'Disk', color: 'yellow' }
]);
```

### Enhanced Log Widget

Better log display with formatting:

```typescript
const log = grid.set(8, 0, 4, 12, contrib.log, {
  fg: 'green',
  selectedFg: 'green',
  label: 'Command Output Stream',
  height: '100%',
  tags: true,
  border: {
    type: 'line',
    fg: 'cyan'
  }
});

// Add timestamped logs
function addLog(message: string, level: 'info' | 'warn' | 'error' = 'info') {
  const timestamp = new Date().toISOString().substr(11, 8);
  const colors = {
    info: 'green',
    warn: 'yellow',
    error: 'red'
  };
  
  log.log(`{${colors[level]}-fg}[${timestamp}]{/} ${message}`);
}

addLog('Session started', 'info');
addLog('Connection established', 'info');
addLog('Warning: High memory usage', 'warn');
addLog('Error: Command failed', 'error');
```

## Code Wrapper Dashboard Implementation

### Complete Monitoring Dashboard

```typescript
import blessed from 'blessed';
import contrib from 'blessed-contrib';
import { fetchSessions, fetchMetrics } from './api';

export class MonitoringDashboard {
  private screen: blessed.Widgets.Screen;
  private grid: any;
  private sessionTable: any;
  private cpuLine: any;
  private memGauge: any;
  private connectionGauge: any;
  private outputLog: any;
  private errorLog: any;
  
  constructor() {
    this.initializeScreen();
    this.createDashboard();
    this.startUpdates();
  }
  
  private initializeScreen() {
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'Code Wrapper - Monitoring Dashboard',
      fullUnicode: true
    });
    
    this.grid = new contrib.grid({
      rows: 12,
      cols: 12,
      screen: this.screen
    });
    
    // Exit handler
    this.screen.key(['escape', 'q', 'C-c'], () => {
      return process.exit(0);
    });
  }
  
  private createDashboard() {
    // Active Sessions Table (top left)
    this.sessionTable = this.grid.set(0, 0, 6, 7, contrib.table, {
      keys: true,
      vi: true,
      fg: 'white',
      selectedFg: 'white',
      selectedBg: 'blue',
      interactive: true,
      label: 'Active Sessions',
      columnSpacing: 2,
      columnWidth: [8, 15, 10, 8]
    });
    
    // CPU/Memory Chart (top right)
    this.cpuLine = this.grid.set(0, 7, 4, 5, contrib.line, {
      style: {
        line: 'yellow',
        text: 'green',
        baseline: 'black'
      },
      xLabelPadding: 3,
      xPadding: 5,
      showLegend: true,
      label: 'System Metrics'
    });
    
    // Connection Status (middle right)
    this.connectionGauge = this.grid.set(4, 7, 2, 2, contrib.gauge, {
      label: 'Connection',
      stroke: 'green',
      fill: 'white'
    });
    
    // Memory Gauge (middle right)
    this.memGauge = this.grid.set(4, 9, 2, 3, contrib.donut, {
      label: 'Resources',
      radius: 8,
      arcWidth: 3,
      remainColor: 'black',
      yPadding: 2
    });
    
    // Command Output Log (bottom half)
    this.outputLog = this.grid.set(6, 0, 3, 12, contrib.log, {
      fg: 'green',
      selectedFg: 'green',
      label: 'Command Output',
      tags: true
    });
    
    // Error Log (very bottom)
    this.errorLog = this.grid.set(9, 0, 3, 12, contrib.log, {
      fg: 'red',
      selectedFg: 'red',
      label: 'Errors & Warnings',
      tags: true
    });
    
    this.screen.render();
  }
  
  private startUpdates() {
    // Update sessions table
    setInterval(async () => {
      const sessions = await fetchSessions();
      this.updateSessionTable(sessions);
    }, 2000);
    
    // Update metrics
    setInterval(async () => {
      const metrics = await fetchMetrics();
      this.updateMetrics(metrics);
    }, 1000);
    
    // Handle table selection
    this.sessionTable.rows.on('select', (node: any) => {
      const sessionData = node.content.split(/\s+/);
      const sessionId = sessionData[0];
      this.connectToSession(sessionId);
    });
  }
  
  private updateSessionTable(sessions: any[]) {
    this.sessionTable.setData({
      headers: ['ID', 'Command', 'Status', 'Time'],
      data: sessions.map(s => [
        s.id.substr(0, 8),
        s.command.substr(0, 15),
        this.getStatusColor(s.status),
        this.formatDuration(s.duration)
      ])
    });
    this.screen.render();
  }
  
  private updateMetrics(metrics: any) {
    // Update CPU line chart
    const cpuData = {
      title: 'CPU',
      x: metrics.timestamps,
      y: metrics.cpu,
      style: { line: 'red' }
    };
    
    const memData = {
      title: 'Memory',
      x: metrics.timestamps,
      y: metrics.memory,
      style: { line: 'blue' }
    };
    
    this.cpuLine.setData([cpuData, memData]);
    
    // Update gauges
    this.connectionGauge.setPercent(metrics.connectionStrength);
    
    this.memGauge.setData([
      { percent: metrics.cpu[metrics.cpu.length - 1], label: 'CPU', color: 'green' },
      { percent: metrics.memory[metrics.memory.length - 1], label: 'Mem', color: 'cyan' },
      { percent: metrics.disk, label: 'Disk', color: 'yellow' }
    ]);
    
    this.screen.render();
  }
  
  private getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      running: '{green-fg}● Running{/}',
      complete: '{blue-fg}✓ Complete{/}',
      failed: '{red-fg}✗ Failed{/}',
      pending: '{yellow-fg}◌ Pending{/}'
    };
    return colors[status.toLowerCase()] || status;
  }
  
  private formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  private connectToSession(sessionId: string) {
    this.outputLog.log(`{cyan-fg}Connecting to session ${sessionId}...{/}`);
    // Implementation to connect to session via WebSocket
  }
  
  public log(message: string, type: 'output' | 'error' = 'output') {
    const timestamp = new Date().toISOString().substr(11, 8);
    if (type === 'error') {
      this.errorLog.log(`{red-fg}[${timestamp}]{/} ${message}`);
    } else {
      this.outputLog.log(`{green-fg}[${timestamp}]{/} ${message}`);
    }
    this.screen.render();
  }
}
```

### Sparkline for Quick Metrics

```typescript
const spark = grid.set(4, 10, 2, 2, contrib.sparkline, {
  label: 'Throughput',
  tags: true,
  style: {
    fg: 'blue'
  }
});

const throughputData = [
  'Requests', 
  '5', '10', '15', '20', '18', '15', '12', '10', '8', '12', '15', '20'
];

spark.setData(throughputData);
```

### Bar Chart for Categorical Data

```typescript
const bar = grid.set(6, 8, 4, 4, contrib.bar, {
  label: 'Commands by Type',
  barWidth: 4,
  barSpacing: 6,
  xOffset: 0,
  maxHeight: 9
});

bar.setData({
  titles: ['init', 'run', 'test', 'build', 'deploy'],
  data: [5, 12, 8, 15, 3]
});
```

## WebSocket Integration

```typescript
import Pusher from 'pusher-js';

class DashboardWithWebSocket extends MonitoringDashboard {
  private pusher: Pusher;
  private channels: Map<string, any> = new Map();
  
  constructor() {
    super();
    this.initializePusher();
  }
  
  private initializePusher() {
    this.pusher = new Pusher(process.env.PUSHER_KEY!, {
      cluster: process.env.PUSHER_CLUSTER!
    });
    
    // Subscribe to global monitoring channel
    const monitoring = this.pusher.subscribe('monitoring');
    
    monitoring.bind('session-update', (data: any) => {
      this.updateSessionTable(data.sessions);
    });
    
    monitoring.bind('metrics', (data: any) => {
      this.updateMetrics(data);
    });
  }
  
  protected connectToSession(sessionId: string) {
    const channelName = `private-cmd-${sessionId}`;
    
    if (this.channels.has(channelName)) {
      return;
    }
    
    const channel = this.pusher.subscribe(channelName);
    this.channels.set(channelName, channel);
    
    channel.bind('output', (data: any) => {
      this.log(data.content, 'output');
    });
    
    channel.bind('error', (data: any) => {
      this.log(data.message, 'error');
    });
  }
}
```

## Best Practices

1. **Use Grid Layout**: Simplifies responsive dashboard design
2. **Update Efficiently**: Batch updates and use setInterval wisely
3. **Color Coding**: Use consistent colors for status indicators
4. **Handle Large Data**: Implement pagination for tables with many rows
5. **Memory Management**: Clear old data from charts to prevent memory leaks
6. **Error Handling**: Gracefully handle API failures in update loops

## Performance Optimization

```typescript
// Throttle updates
import { throttle } from 'lodash';

const throttledUpdate = throttle((data) => {
  sessionTable.setData(data);
  screen.render();
}, 100);

// Clear old chart data
if (cpuData.x.length > 50) {
  cpuData.x.shift();
  cpuData.y.shift();
}

// Destroy unused channels
if (this.channels.size > 10) {
  const oldest = this.channels.keys().next().value;
  this.pusher.unsubscribe(oldest);
  this.channels.delete(oldest);
}
```

## Resources
- [GitHub Repository](https://github.com/yaronn/blessed-contrib)
- [Examples](https://github.com/yaronn/blessed-contrib/tree/master/examples)
- [Widget Gallery](https://github.com/yaronn/blessed-contrib#widgets)
- [Dashboard Examples](https://github.com/yaronn/blessed-contrib/blob/master/examples/dashboard.js)