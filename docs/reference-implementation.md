# Socket Server Basic - Reference Implementation

## Overview

The `socket_server_basic` directory contains a reference implementation of a Pusher-based WebSocket server and client setup using Hono and Bun. This serves as a working example for the Code Wrapper project's real-time communication architecture.

## Project Structure

```
.claude/reference_code/socket_server_basic/
├── src/
│   ├── server.ts           # Main Hono server with Pusher auth endpoints
│   ├── client.ts           # Pusher client implementation example
│   ├── pusher-server.ts    # Pusher server configuration
│   ├── pusher-client.ts    # Pusher client configuration
│   ├── authenticator.ts    # User authentication logic
│   └── authorizer.ts       # Channel authorization logic
├── package.json
├── tsconfig.json
└── .env                    # Environment configuration (Soketi instance)
```

## Key Components

### 1. Server Implementation (`server.ts`)

The server provides:
- **Hono API server** running on port 8080
- **CORS support** for cross-origin requests
- **Authentication endpoints** for Pusher:
  - `/pusher/user-auth` - User authentication for user-specific features
  - `/pusher/auth` - Channel authorization for private/presence channels
- **Event triggering examples**:
  - Public channel events every 5 seconds
  - Private encrypted channel events every 3 seconds
- **Server-side Pusher client** for bidirectional communication

### 2. Client Configuration (`pusher-client.ts`)

Configures Pusher client with:
- **Soketi connection** (self-hosted Pusher-compatible server)
- **Authentication headers** with Bearer token
- **User and channel authentication** endpoints
- **Encryption support** for secure channels
- **WebSocket transport** configuration

### 3. Server Configuration (`pusher-server.ts`)

Configures Pusher server SDK for:
- **Soketi backend** connection
- **TLS/SSL** secure connections
- **Encryption master key** for encrypted channels
- **Service credentials** for API access

### 4. Client Example (`client.ts`)

Demonstrates:
- **Multiple client connections** (client1 and client2)
- **Public channel** subscription and messaging
- **Private encrypted channel** subscription
- **Client-triggered events** on public channels
- **Connection state management**
- **Error handling**

## Authentication Flow

1. **User Authentication** (`/pusher/user-auth`):
   - Receives socket ID from Pusher
   - Validates Bearer token
   - Returns user authentication response

2. **Channel Authorization** (`/pusher/auth`):
   - Receives socket ID and channel name
   - Validates Bearer token
   - Authorizes channel access
   - Returns channel authorization response

## Channel Types Demonstrated

### Public Channel (`public-channel`)
- No authentication required
- Broadcasting to all subscribers
- Client-triggered events supported

### Private Encrypted Channel (`private-encrypted-admin`)
- Requires authentication
- End-to-end encryption
- Admin-only access pattern

## Running the Reference Implementation

### Prerequisites
1. Bun runtime installed
2. Soketi server instance (or Pusher account)
3. Environment variables configured

### Setup

1. Navigate to the reference directory:
```bash
cd .claude/reference_code/socket_server_basic
```

2. Install dependencies:
```bash
bun install
```

3. Configure environment variables in `.env`:
```env
SOKETI_PORT=6001
SOKETI_HOST="your-soketi-host.com"
SOKETI_SERVICE_USER="your-service-user"
SOKETI_SERVICE_KEY="your-service-key"
SOKETI_SERVICE_SECRET="your-service-secret"
SOKET_ENCRYPTION_MASTER_KEY_BASE64="your-encryption-key"
AUTH_TOKEN="your-auth-token"
```

4. Run the server:
```bash
bun run src/server.ts
```

5. Run the client (in another terminal):
```bash
bun run src/client.ts
```

## Key Patterns for Code Wrapper Implementation

### 1. Command Session Channels
```typescript
// Create unique channel per command session
const sessionChannel = `private-command-${sessionId}`

// Server triggers events
await pusher.trigger(sessionChannel, 'output', {
  type: 'stdout',
  data: outputChunk
})

// Client subscribes to session
const channel = client.subscribe(sessionChannel)
channel.bind('output', handleOutput)
```

### 2. Interactive Input Handling
```typescript
// Client sends input via API
await fetch('/api/commands/input', {
  method: 'POST',
  body: JSON.stringify({ 
    sessionId, 
    input: userInput 
  })
})

// Server pipes to process stdin
process.stdin.write(input)
```

### 3. Connection State Management
```typescript
client.connection.bind('state_change', (states) => {
  // Handle: connecting, connected, disconnected, failed
  updateUIState(states.current)
})
```

### 4. Error Recovery
```typescript
client.connection.bind('error', (error) => {
  // Implement retry logic
  if (error.type === 'WebSocketError') {
    setTimeout(() => client.connect(), 5000)
  }
})
```

## Security Considerations

1. **Token-based authentication** for all private channels
2. **Channel-specific authorization** to prevent unauthorized access
3. **Encrypted channels** for sensitive data
4. **HTTPS/WSS only** in production
5. **Rate limiting** on authentication endpoints

## Differences from Production Code Wrapper

| Aspect | Reference Implementation | Production Code Wrapper |
|--------|-------------------------|------------------------|
| Server | Soketi (self-hosted) | Pusher Cloud (managed) |
| Auth | Simple token | Full user authentication |
| Channels | Demo channels | Session-specific channels |
| Commands | Mock triggers | Real CLI execution |
| Persistence | None | Session storage |

## Lessons for Implementation

1. **Use private channels** for command sessions to ensure security
2. **Implement proper authentication** before allowing channel subscriptions
3. **Handle connection states** gracefully with user feedback
4. **Use encrypted channels** for sensitive command output
5. **Implement cleanup** for completed sessions
6. **Add rate limiting** to prevent abuse
7. **Log all authentication attempts** for security auditing

## Testing Patterns

```typescript
// Test authentication endpoint
const authResponse = await fetch('/pusher/auth', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer test-token'
  },
  body: new URLSearchParams({
    socket_id: 'test-socket',
    channel_name: 'private-test'
  })
})

// Test event triggering
await pusher.trigger('test-channel', 'test-event', {
  message: 'test'
})

// Test client subscription
const channel = client.subscribe('test-channel')
await new Promise(resolve => {
  channel.bind('pusher:subscription_succeeded', resolve)
})
```

This reference implementation provides a solid foundation for building the Code Wrapper's real-time features while demonstrating best practices for Pusher integration with Hono and Bun.