# Claude Code SDK Authentication & Credentials

**Version**: 1.0.98+ (Latest)  
**Last Updated**: September 1, 2025  
**Package**: `@anthropic-ai/claude-code`  
**Official Documentation**: https://docs.anthropic.com/en/docs/claude-code/iam

## Overview

The Claude Code SDK provides flexible authentication mechanisms that work seamlessly with the Claude Code CLI. When developing hook scripts or applications with the SDK, understanding how authentication is resolved is crucial for production deployments.

## Authentication Methods & Precedence

The SDK follows a specific credential resolution order:

### 1. Environment Variables (Highest Priority)
```bash
# Primary API key authentication
export ANTHROPIC_API_KEY="your-api-key-here"

# Alternative authentication token
export ANTHROPIC_AUTH_TOKEN="your-auth-token"

# Custom headers for specialized authentication
export ANTHROPIC_CUSTOM_HEADERS='{"Custom-Header": "value"}'

# Third-party provider flags
export CLAUDE_CODE_USE_BEDROCK=1    # Amazon Bedrock
export CLAUDE_CODE_USE_VERTEX=1     # Google Vertex AI
```

### 2. CLI Authentication Integration
When the Claude Code CLI is already authenticated, the SDK automatically inherits those credentials:

- **macOS**: Credentials stored in encrypted macOS Keychain
- **Linux/Windows**: Credentials stored in secure system credential stores
- **CLI Sessions**: Active OAuth tokens and API keys are automatically accessible

### 3. Configuration File Hierarchy
Settings are resolved in this precedence order:
1. Enterprise managed policies
2. Command line arguments
3. Local project settings (`.claude/settings.json`)
4. Shared project settings
5. User settings (`~/.claude/settings.json`)

## Automatic CLI Authentication

### How It Works
```typescript
import { query } from "@anthropic-ai/claude-code";

// SDK automatically detects and uses CLI authentication
// No explicit credential configuration needed
for await (const message of query({
  prompt: "Analyze this codebase",
  options: {
    maxTurns: 5,
    allowedTools: ["Read", "Grep", "WebSearch"]
  }
})) {
  // Handles authentication automatically
}
```

### Verification
Check if CLI authentication is working:
```bash
# Verify CLI authentication status
claude doctor

# Check current authentication method
claude whoami
```

## Authentication Configuration Examples

### 1. Basic Environment Variable Setup
```typescript
// Set before importing the SDK
process.env.ANTHROPIC_API_KEY = "your-api-key";

import { query } from "@anthropic-ai/claude-code";

// SDK uses the environment variable automatically
```

### 2. Dynamic Authentication Helper
Configure a credential helper script in settings:

```json
// ~/.claude/settings.json
{
  "apiKeyHelper": {
    "command": "/path/to/get-api-key.sh",
    "refreshInterval": 300000  // 5 minutes
  }
}
```

Helper script example:
```bash
#!/bin/bash
# get-api-key.sh
# Return API key from secure storage
security find-generic-password -w -s "anthropic-api-key"
```

### 3. AWS Bedrock Authentication
```bash
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION="us-east-1"
export AWS_PROFILE="your-profile"
```

```typescript
import { query } from "@anthropic-ai/claude-code";

// SDK automatically uses AWS credential chain
for await (const message of query({
  prompt: "Process this data",
  options: {
    maxTurns: 3
  }
})) {
  // Uses Bedrock authentication
}
```

### 4. Google Vertex AI Authentication
```bash
export CLAUDE_CODE_USE_VERTEX=1
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

## Hook Script Authentication Patterns

### 1. Inheriting CLI Authentication
```typescript
// hooks/pre-commit.ts
import { query } from "@anthropic-ai/claude-code";

// Automatically uses CLI credentials
async function reviewCommit() {
  for await (const message of query({
    prompt: "Review staged changes for security issues",
    options: {
      allowedTools: ["Bash", "Read", "Grep"],
      maxTurns: 2
    }
  })) {
    if (message.type === "result") {
      return message.result;
    }
  }
}
```

### 2. Environment-Based Authentication
```typescript
// hooks/deploy.ts
import { query } from "@anthropic-ai/claude-code";

// Check for required credentials
if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY required for deployment hooks");
}

async function deploymentCheck() {
  // SDK uses environment variable
  for await (const message of query({
    prompt: "Verify deployment configuration",
    options: {
      allowedTools: ["Read", "Bash"],
      maxTurns: 3
    }
  })) {
    // Process messages
  }
}
```

### 3. Fallback Authentication Strategy
```typescript
// hooks/ci-integration.ts
import { query } from "@anthropic-ai/claude-code";

async function ensureAuthentication() {
  // Priority order: ENV var -> CLI auth -> fail
  if (!process.env.ANTHROPIC_API_KEY) {
    try {
      // Test CLI authentication
      for await (const message of query({
        prompt: "test",
        options: { maxTurns: 1 }
      })) {
        break; // CLI auth works
      }
    } catch (error) {
      if (error.message.includes("authentication")) {
        throw new Error("No valid authentication found. Run 'claude login' or set ANTHROPIC_API_KEY");
      }
    }
  }
}

await ensureAuthentication();
```

## Credential Storage & Security

### Storage Locations
- **macOS**: Encrypted macOS Keychain
- **Linux**: System keyring (gnome-keyring, kde-wallet)
- **Windows**: Windows Credential Store

### Token Types Stored
- OAuth tokens (for Claude.ai authentication)
- API keys (for Console authentication) 
- Third-party credentials (AWS, GCP)
- Custom authentication tokens

### Security Features
- Encrypted storage on all platforms
- Automatic token refresh (OAuth)
- Credential expiration handling
- Secure credential helper integration

## Best Practices

### 1. Production Deployments
```bash
# Use API keys for production environments
export ANTHROPIC_API_KEY="prod-api-key"

# Avoid CLI authentication in production
# Use dedicated service accounts
```

### 2. Development Environments
```bash
# CLI authentication for development
claude login

# Verify authentication
claude doctor
```

### 3. CI/CD Environments
```bash
# Set API key as secure environment variable
export ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY_SECRET}"

# Use read-only permissions where possible
export CLAUDE_PERMISSION_MODE="denyEdits"
```

### 4. Hook Script Configuration
```typescript
// Check authentication early in hook scripts
async function validateAuth() {
  if (!process.env.ANTHROPIC_API_KEY) {
    const hasCliAuth = await checkCliAuthentication();
    if (!hasCliAuth) {
      console.error("Authentication required: run 'claude login' or set ANTHROPIC_API_KEY");
      process.exit(1);
    }
  }
}

async function checkCliAuthentication(): Promise<boolean> {
  try {
    for await (const message of query({
      prompt: "auth test",
      options: { maxTurns: 1 }
    })) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}
```

## Troubleshooting Authentication Issues

### Common Problems

1. **"Authentication failed" errors**
   ```bash
   # Check CLI authentication status
   claude whoami
   
   # Re-authenticate if needed
   claude login
   ```

2. **Environment variable not recognized**
   ```bash
   # Verify environment variable is set
   echo $ANTHROPIC_API_KEY
   
   # Check for typos in variable name
   env | grep ANTHROPIC
   ```

3. **CLI authentication not inherited by SDK**
   ```bash
   # Verify CLI is properly authenticated
   claude doctor
   
   # Check credential storage
   # macOS:
   security find-generic-password -s "anthropic"
   ```

4. **Third-party authentication issues**
   ```bash
   # AWS Bedrock
   aws sts get-caller-identity
   
   # Google Vertex AI
   gcloud auth application-default print-access-token
   ```

### Debug Authentication Flow
```typescript
import { query } from "@anthropic-ai/claude-code";

async function debugAuth() {
  console.log("ANTHROPIC_API_KEY:", process.env.ANTHROPIC_API_KEY ? "Set" : "Not set");
  console.log("CLAUDE_CODE_USE_BEDROCK:", process.env.CLAUDE_CODE_USE_BEDROCK);
  console.log("CLAUDE_CODE_USE_VERTEX:", process.env.CLAUDE_CODE_USE_VERTEX);
  
  try {
    for await (const message of query({
      prompt: "Authentication test",
      options: { maxTurns: 1 }
    })) {
      console.log("Authentication successful");
      break;
    }
  } catch (error) {
    console.error("Authentication failed:", error.message);
  }
}
```

## Environment Variable Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `ANTHROPIC_API_KEY` | Primary API authentication | `sk-ant-api03-...` |
| `ANTHROPIC_AUTH_TOKEN` | Custom bearer token | `Bearer custom-token` |
| `ANTHROPIC_CUSTOM_HEADERS` | Additional HTTP headers | `{"X-Custom": "value"}` |
| `CLAUDE_CODE_USE_BEDROCK` | Enable Bedrock authentication | `1` |
| `CLAUDE_CODE_USE_VERTEX` | Enable Vertex AI authentication | `1` |
| `AWS_REGION` | AWS region for Bedrock | `us-east-1` |
| `AWS_PROFILE` | AWS profile for Bedrock | `production` |
| `GOOGLE_APPLICATION_CREDENTIALS` | GCP service account | `/path/to/creds.json` |

## Integration Examples

### Express.js API with Authentication
```typescript
import express from 'express';
import { query } from '@anthropic-ai/claude-code';

const app = express();

// Authentication middleware
app.use(async (req, res, next) => {
  try {
    // Test authentication with a minimal query
    for await (const message of query({
      prompt: "auth test",
      options: { maxTurns: 1 }
    })) {
      next();
      return;
    }
  } catch (error) {
    res.status(401).json({ error: "Claude Code authentication failed" });
  }
});

app.post('/api/code-review', async (req, res) => {
  // Authentication is verified by middleware
  // SDK uses existing credentials
});
```

### GitHub Actions Authentication
```yaml
# .github/workflows/claude-review.yml
name: Claude Code Review
on: [pull_request]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code
      
      - name: Run code review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          node -e "
          import { query } from '@anthropic-ai/claude-code';
          // SDK uses ANTHROPIC_API_KEY automatically
          // No additional authentication needed
          "
```

## Sources and References

- **Identity and Access Management**: https://docs.anthropic.com/en/docs/claude-code/iam
- **Claude Code Settings**: https://docs.anthropic.com/en/docs/claude-code/settings
- **SDK Overview**: https://docs.anthropic.com/en/docs/claude-code/sdk/sdk-overview
- **Setup Guide**: https://docs.anthropic.com/en/docs/claude-code/setup
- **Amazon Bedrock Integration**: https://docs.anthropic.com/en/docs/claude-code/amazon-bedrock
- **Google Vertex AI Integration**: https://docs.anthropic.com/en/docs/claude-code/vertex-ai

## Version Notes

- **CLI Integration**: Automatic credential inheritance available in v1.0.98+
- **Environment Variables**: Supported in all versions
- **Third-party Providers**: Bedrock and Vertex AI support added in v1.0.95+
- **Credential Helpers**: Dynamic authentication scripts supported in v1.0.90+

The Claude Code SDK's authentication system is designed to be transparent and flexible, automatically leveraging existing CLI authentication while providing robust environment variable and configuration file support for various deployment scenarios.