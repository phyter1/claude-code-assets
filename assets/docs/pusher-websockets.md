# Pusher WebSockets Documentation

## Overview
Pusher Channels is a hosted WebSocket solution for building real-time features. It handles the complexity of WebSocket connections, fallbacks, and scaling.

## Installation

### Server (Bun/Node.js)
```bash
bun add pusher
```

### Client (Browser/React)
```bash
bun add pusher-js
```

## Server-Side Setup

### Basic Configuration
```typescript
import Pusher from 'pusher'

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true
})
```

### Triggering Events
```typescript
// Trigger an event on a channel
await pusher.trigger('my-channel', 'my-event', {
  message: 'Hello world'
})

// Trigger to multiple channels
await pusher.trigger(['channel-1', 'channel-2'], 'my-event', {
  message: 'Hello everyone'
})

// Trigger with socket ID (exclude sender)
await pusher.trigger('my-channel', 'my-event', data, {
  socket_id: socketId
})
```

### Channel Types

#### Public Channels
```typescript
// No authentication required
await pusher.trigger('public-channel', 'event', data)
```

#### Private Channels
```typescript
// Requires authentication, prefix with 'private-'
await pusher.trigger('private-user-123', 'event', data)
```

#### Presence Channels
```typescript
// Track who's online, prefix with 'presence-'
await pusher.trigger('presence-room-456', 'event', data)
```

#### Encrypted Channels
```typescript
// End-to-end encryption, prefix with 'private-encrypted-'
await pusher.trigger('private-encrypted-secure', 'event', data)
```

### Authentication Endpoint
```typescript
// Hono endpoint for channel authentication
app.post('/pusher/auth', async (c) => {
  const { socket_id, channel_name } = await c.req.json()
  
  // Verify user has access to channel
  const user = await getCurrentUser(c)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  // For presence channels, include user data
  if (channel_name.startsWith('presence-')) {
    const authResponse = pusher.authorizeChannel(socket_id, channel_name, {
      user_id: user.id,
      user_info: {
        name: user.name,
        email: user.email
      }
    })
    return c.json(authResponse)
  }
  
  // For private channels
  const authResponse = pusher.authorizeChannel(socket_id, channel_name)
  return c.json(authResponse)
})
```

## Client-Side Setup

### Basic Configuration
```typescript
import Pusher from 'pusher-js'

const pusher = new Pusher(process.env.VITE_PUSHER_KEY!, {
  cluster: process.env.VITE_PUSHER_CLUSTER!,
  
  // For private/presence channels
  authEndpoint: '/api/pusher/auth',
  auth: {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`
    }
  }
})
```

### Subscribing to Channels
```typescript
// Public channel
const channel = pusher.subscribe('my-channel')

// Private channel
const privateChannel = pusher.subscribe('private-user-123')

// Presence channel
const presenceChannel = pusher.subscribe('presence-room-456')
```

### Listening for Events
```typescript
channel.bind('my-event', (data: any) => {
  console.log('Received:', data)
})

// Multiple events
channel.bind_global((event: string, data: any) => {
  console.log(`Event ${event}:`, data)
})

// Unbind events
channel.unbind('my-event')
```

### Presence Channel Features
```typescript
const presence = pusher.subscribe('presence-room') as PresenceChannel

// Get all members
presence.bind('pusher:subscription_succeeded', () => {
  const members = presence.members
  console.log('Members count:', members.count)
  
  members.each((member: any) => {
    console.log('Member:', member.id, member.info)
  })
})

// Member joined
presence.bind('pusher:member_added', (member: any) => {
  console.log('Member joined:', member.id)
})

// Member left
presence.bind('pusher:member_removed', (member: any) => {
  console.log('Member left:', member.id)
})
```

### Connection State Management
```typescript
// Connection states
pusher.connection.bind('state_change', (states: any) => {
  console.log('State changed from', states.previous, 'to', states.current)
})

pusher.connection.bind('connected', () => {
  console.log('Connected! Socket ID:', pusher.connection.socket_id)
})

pusher.connection.bind('error', (error: any) => {
  console.error('Connection error:', error)
})

// Manual connection control
pusher.disconnect()
pusher.connect()
```

## Long-Running Command Pattern

### Server Implementation
```typescript
interface CommandSession {
  id: string
  channel: string
  process?: any
  status: 'pending' | 'running' | 'completed' | 'failed'
}

const sessions = new Map<string, CommandSession>()

// Start command execution
app.post('/commands/execute', async (c) => {
  const { command, args } = await c.req.json()
  const sessionId = crypto.randomUUID()
  const channelName = `private-command-${sessionId}`
  
  const session: CommandSession = {
    id: sessionId,
    channel: channelName,
    status: 'pending'
  }
  
  sessions.set(sessionId, session)
  
  // Start async execution
  executeCommand(sessionId, command, args)
  
  return c.json({ sessionId, channel: channelName })
})

async function executeCommand(sessionId: string, command: string, args: string[]) {
  const session = sessions.get(sessionId)!
  
  try {
    session.status = 'running'
    await pusher.trigger(session.channel, 'status', { status: 'running' })
    
    // Use Bun.spawn for process execution
    const proc = Bun.spawn([command, ...args], {
      stdout: 'pipe',
      stderr: 'pipe',
      stdin: 'pipe'
    })
    
    session.process = proc
    
    // Stream stdout
    const reader = proc.stdout.getReader()
    const decoder = new TextDecoder()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      const output = decoder.decode(value)
      await pusher.trigger(session.channel, 'output', { 
        type: 'stdout', 
        data: output 
      })
    }
    
    // Wait for completion
    const exitCode = await proc.exited
    
    session.status = exitCode === 0 ? 'completed' : 'failed'
    await pusher.trigger(session.channel, 'complete', { 
      exitCode,
      status: session.status 
    })
    
  } catch (error) {
    session.status = 'failed'
    await pusher.trigger(session.channel, 'error', { 
      error: error.message 
    })
  } finally {
    // Cleanup after delay
    setTimeout(() => sessions.delete(sessionId), 300000) // 5 minutes
  }
}

// Handle stdin input
app.post('/commands/:sessionId/input', async (c) => {
  const { sessionId } = c.req.param()
  const { input } = await c.req.json()
  
  const session = sessions.get(sessionId)
  if (!session?.process) {
    return c.json({ error: 'Session not found' }, 404)
  }
  
  const writer = session.process.stdin.getWriter()
  await writer.write(new TextEncoder().encode(input))
  
  return c.json({ success: true })
})
```

### Client Implementation
```typescript
import { useState, useEffect } from 'react'
import Pusher from 'pusher-js'

function CommandExecutor() {
  const [output, setOutput] = useState<string[]>([])
  const [status, setStatus] = useState<string>('idle')
  const [channel, setChannel] = useState<any>(null)
  
  const executeCommand = async (command: string) => {
    // Start execution
    const response = await fetch('/api/commands/execute', {
      method: 'POST',
      body: JSON.stringify({ command, args: [] })
    })
    
    const { sessionId, channel: channelName } = await response.json()
    
    // Subscribe to command channel
    const pusher = new Pusher(/* config */)
    const cmdChannel = pusher.subscribe(channelName)
    
    cmdChannel.bind('status', (data: any) => {
      setStatus(data.status)
    })
    
    cmdChannel.bind('output', (data: any) => {
      setOutput(prev => [...prev, data.data])
    })
    
    cmdChannel.bind('complete', (data: any) => {
      setStatus('completed')
      console.log('Exit code:', data.exitCode)
    })
    
    cmdChannel.bind('error', (data: any) => {
      setStatus('error')
      console.error('Error:', data.error)
    })
    
    setChannel({ channel: cmdChannel, sessionId })
  }
  
  const sendInput = async (input: string) => {
    if (!channel) return
    
    await fetch(`/api/commands/${channel.sessionId}/input`, {
      method: 'POST',
      body: JSON.stringify({ input })
    })
  }
  
  return (
    <div>
      <button onClick={() => executeCommand('claude')}>
        Execute Command
      </button>
      <div>
        Status: {status}
      </div>
      <pre>
        {output.join('')}
      </pre>
      <input 
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            sendInput(e.currentTarget.value + '\n')
            e.currentTarget.value = ''
          }
        }}
      />
    </div>
  )
}
```

## Best Practices

1. **Use appropriate channel types**: Public for broadcasts, private for user-specific, presence for online status
2. **Implement proper authentication**: Always validate channel access server-side
3. **Handle connection states**: Implement reconnection logic and offline handling
4. **Batch triggers**: Use batch triggering for better performance
5. **Clean up subscriptions**: Unsubscribe from channels when components unmount
6. **Use webhook endpoints**: For receiving events server-side
7. **Rate limiting**: Pusher has rate limits, implement queuing for high-volume events
8. **Error handling**: Always handle connection and trigger errors gracefully

## Environment Variables
```env
# Server
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=your_cluster

# Client (Vite)
VITE_PUSHER_KEY=your_key
VITE_PUSHER_CLUSTER=your_cluster
```