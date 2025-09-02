# Claude Code Headless Authentication & Docker Integration

**Version**: Research-based analysis (September 2025)  
**Last Updated**: September 1, 2025  
**Focus**: Claude Pro subscriptions in non-interactive/Docker environments  

## Overview

Running Claude Code with Claude Pro subscriptions in headless environments (Docker, CI/CD, automation) presents unique challenges due to the authentication model designed for interactive use. This documentation compiles current solutions, limitations, and best practices for achieving non-interactive authentication while preserving subscription benefits.

## Current Authentication Challenges

### The Claude Pro Authentication Problem

1. **Interactive OAuth Design**: Claude Code is designed around interactive OAuth authentication through Claude.ai or Anthropic Console
2. **Subscription vs API Key Confusion**: Claude Pro subscriptions don't provide service account tokens - they use OAuth flows
3. **Double Billing Issue**: Users with Claude Pro face potential double billing when forced to use API keys for headless environments
4. **Session Persistence**: Headless mode doesn't persist authentication between sessions

### Known Issues

- **Issue #551**: Non-interactive mode fails to authenticate using provided API key
- **Issue #5891**: Documentation inconsistency between SDK (requiring API key) and Claude Code (using subscription auth)
- **Issue #441**: Users cannot use API keys without signing in first

## Current Solutions and Workarounds

### 1. Docker Container Solutions

#### Claude-YOLO (Recommended Docker Solution)
```bash
# GitHub: thevibeworks/claude-code-yolo
# Docker-based wrapper with authentication passthrough

# OAuth Authentication (Experimental)
export CLAUDE_CODE_OAUTH_TOKEN=$(claude setup-token)
docker run --rm -v $(pwd):/workspace -e CLAUDE_CODE_OAUTH_TOKEN claude-yolo

# API Key Authentication
docker run --rm -v $(pwd):/workspace -e ANTHROPIC_API_KEY=your-key claude-yolo
```

**Features**:
- Secure credential mounting (`~/.claude`, `~/.aws`, `~/.config/gcloud`)
- Container isolation with non-root execution
- Multiple authentication method support
- Directory access control

#### Claude Container (Alternative)
```bash
# GitHub: nezhar/claude-container
# Complete isolation with persistent credentials

docker run -v ~/.claude:/home/claude/.claude -v $(pwd):/workspace claude-container
```

### 2. Credential Transfer Methods

#### Host Pre-Authentication
```bash
# 1. Authenticate on host system first
claude login

# 2. Mount credentials into container
docker run -v ~/.claude:/home/claude/.claude -v $(pwd):/workspace your-image

# 3. Credentials are available inside container
```

#### Environment Variable Setup
```bash
# API Key (if available)
export ANTHROPIC_API_KEY="your-anthropic-api-key"

# OAuth Token (experimental)
export CLAUDE_CODE_OAUTH_TOKEN="your-oauth-token"

# AWS Bedrock
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION="us-east-1"
export AWS_PROFILE="your-profile"

# Google Vertex AI
export CLAUDE_CODE_USE_VERTEX=1
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

### 3. CI/CD Integration Patterns

#### GitHub Actions with OAuth
```yaml
name: Claude Code Review
on: [pull_request]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Authenticate with Claude
        uses: grll/claude-code-login@v1
        with:
          oauth-token: ${{ secrets.CLAUDE_OAUTH_TOKEN }}
      
      - name: Run Claude Code
        run: |
          claude -p "Review this pull request for security issues" --headless
```

#### Docker in CI/CD
```yaml
- name: Run Claude in Docker
  run: |
    docker run --rm \
      -v ${{ github.workspace }}:/workspace \
      -e ANTHROPIC_API_KEY=${{ secrets.ANTHROPIC_API_KEY }} \
      claude-yolo \
      claude -p "Analyze code changes" --headless
```

### 4. Credential Storage Locations

#### macOS
```bash
# Claude credentials
~/.claude/
~/.claude.json

# Keychain storage (OAuth tokens)
security find-generic-password -s "anthropic"
```

#### Linux/Docker
```bash
# Credential directories to mount
~/.claude/          # Claude-specific config
~/.aws/             # AWS Bedrock credentials
~/.config/gcloud/   # Google Vertex AI credentials
```

#### Windows
```powershell
# Claude credentials
%USERPROFILE%\.claude\
%USERPROFILE%\.claude.json

# Windows Credential Store for OAuth tokens
```

## Headless Mode Configuration

### Command Line Usage
```bash
# Basic headless mode
claude -p "Your prompt here" --headless

# With output format
claude -p "Analyze codebase" --headless --output-format stream-json

# With specific tools
claude -p "Review code" --headless --allowed-tools "Read,Grep,WebSearch"

# With maximum turns
claude -p "Debug issue" --headless --max-turns 3
```

### SDK Integration
```typescript
import { query } from "@anthropic-ai/claude-code";

// Headless authentication check
async function ensureHeadlessAuth() {
  if (!process.env.ANTHROPIC_API_KEY && !process.env.CLAUDE_CODE_OAUTH_TOKEN) {
    throw new Error("No authentication available for headless mode");
  }
}

// Headless query execution
async function headlessQuery(prompt: string) {
  await ensureHeadlessAuth();
  
  for await (const message of query({
    prompt,
    options: {
      maxTurns: 3,
      allowedTools: ["Read", "Grep", "Bash"],
      systemPrompt: "You are running in headless mode. Be concise."
    }
  })) {
    if (message.type === "result") {
      return message.result;
    }
  }
}
```

## Best Practices for Headless Environments

### 1. Authentication Strategy Priority
1. **OAuth Token** (if Claude Pro subscription available)
2. **API Key** (for Console users)
3. **Third-party providers** (Bedrock, Vertex)
4. **Credential mounting** (Docker environments)

### 2. Security Considerations
```bash
# Set proper permissions on credential files
chmod 600 ~/.claude.json
chmod 700 ~/.claude/

# Use fine-grained tokens for GitHub integration
export GH_TOKEN="ghp_xxxxxxxxxxxx"  # Fine-grained PAT

# Avoid mounting sensitive directories unnecessarily
docker run -v $(pwd):/workspace  # Only current directory
```

### 3. Error Handling
```typescript
async function robustHeadlessAuth() {
  const authMethods = [
    () => process.env.CLAUDE_CODE_OAUTH_TOKEN,
    () => process.env.ANTHROPIC_API_KEY,
    () => checkCliAuthentication()
  ];

  for (const method of authMethods) {
    try {
      if (await method()) {
        return true;
      }
    } catch (error) {
      continue;
    }
  }
  
  throw new Error("No valid headless authentication method found");
}
```

### 4. Container Configuration
```dockerfile
# Dockerfile for Claude Code headless environment
FROM node:18-alpine

# Create non-root user
RUN addgroup -g 1001 claude && adduser -D -u 1001 -G claude claude

# Set working directory
WORKDIR /workspace

# Install Claude Code
RUN npm install -g @anthropic-ai/claude-code

# Set proper ownership
RUN chown -R claude:claude /workspace

USER claude

# Default command for headless operation
CMD ["claude", "--help"]
```

## Current Limitations and Gaps

### 1. No Native Service Accounts
- Claude Pro subscriptions don't provide dedicated service account tokens
- No official machine-to-machine authentication for Pro users
- OAuth tokens are experimental and limited

### 2. Session Management Issues
- Headless mode doesn't persist authentication between container runs
- Requires re-authentication for each session
- Token refresh mechanisms are not well-documented

### 3. Documentation Inconsistencies
- SDK documentation assumes API key availability
- CLI documentation focuses on interactive OAuth
- Missing official guidance for production deployments

### 4. Double Billing Concerns
- Claude Pro users may need separate API key billing for headless use
- No clear path to leverage existing subscription benefits
- Cost optimization requires workarounds

## Recommended Architecture Patterns

### 1. Development Environment
```bash
# Local development with mounted credentials
docker run -it --rm \
  -v ~/.claude:/home/claude/.claude:ro \
  -v ~/.aws:/home/claude/.aws:ro \
  -v $(pwd):/workspace \
  claude-dev-env
```

### 2. CI/CD Environment
```yaml
# Use secrets management for tokens
environment:
  CLAUDE_CODE_OAUTH_TOKEN: ${{ secrets.CLAUDE_OAUTH_TOKEN }}
  ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}  # Fallback

# Container with minimal permissions
container:
  image: claude-headless:latest
  volumes:
    - ${{ github.workspace }}:/workspace:ro
```

### 3. Production Environment
```bash
# Use credential helpers for dynamic authentication
export CLAUDE_API_KEY_HELPER="/usr/local/bin/get-claude-token.sh"

# Rotate credentials regularly
/usr/local/bin/rotate-claude-credentials.sh
```

## Future Considerations

### Upcoming Features (Speculative)
- Official service account support for enterprise plans
- Improved headless authentication workflows
- Better integration with CI/CD platforms
- Enhanced credential management tools

### Community Solutions
- Enhanced Docker wrappers with better authentication handling
- Third-party credential management tools
- Integration with secret management systems

## Troubleshooting Common Issues

### Authentication Failures
```bash
# Check authentication status
claude whoami

# Verify environment variables
env | grep -E "(CLAUDE|ANTHROPIC)"

# Test headless mode
claude -p "test" --headless --max-turns 1
```

### Docker Permission Issues
```bash
# Fix ownership issues
docker run --user $(id -u):$(id -g) ...

# Check mounted credentials
docker exec -it container-name ls -la ~/.claude/
```

### CI/CD Authentication
```bash
# Debug authentication in CI
echo "Auth methods available:"
[ -n "$CLAUDE_CODE_OAUTH_TOKEN" ] && echo "- OAuth token: ✓"
[ -n "$ANTHROPIC_API_KEY" ] && echo "- API key: ✓"
[ -d "$HOME/.claude" ] && echo "- CLI credentials: ✓"
```

## Sources and References

- **Claude Code Authentication Issues**: [GitHub Issues #441, #551, #5891](https://github.com/anthropics/claude-code/issues)
- **Claude-YOLO Docker Solution**: [GitHub Repository](https://github.com/thevibeworks/claude-code-yolo)
- **Claude Container Alternative**: [GitHub Repository](https://github.com/nezhar/claude-container)
- **Claude Code Best Practices**: [Anthropic Engineering Blog](https://www.anthropic.com/engineering/claude-code-best-practices)
- **Official Setup Documentation**: [Anthropic Docs](https://docs.anthropic.com/en/docs/claude-code/setup)
- **Community Solutions**: [Awesome Claude Code](https://github.com/hesreallyhim/awesome-claude-code)

## Conclusion

While Claude Code's headless authentication for Claude Pro subscriptions remains challenging, several community-driven solutions provide viable workarounds. The most practical approaches involve Docker containerization with credential mounting, OAuth token management (where available), or fallback to API key authentication.

Organizations requiring robust headless integration should:
1. Evaluate community Docker solutions like Claude-YOLO
2. Implement proper credential management practices
3. Plan for potential double billing scenarios
4. Monitor official Anthropic communications for native service account support

The authentication landscape is actively evolving, with both community and official solutions in development to address these gaps.