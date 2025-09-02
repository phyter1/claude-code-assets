# Claude Code Docker Integration with Pro Subscription

**Version**: Comprehensive Analysis (September 2025)  
**Last Updated**: September 1, 2025  
**Focus**: Running Claude Code with Claude Pro subscriptions in Docker environments  
**Official Sources**: Anthropic Documentation, Community Solutions, GitHub Repositories  

## Overview

Claude Code with Docker provides a secure, containerized environment for AI-assisted development while maintaining Claude Pro subscription benefits. This guide covers official Docker setups, authentication methods, best practices, and configuration for production environments.

As of 2025, Claude Code is included in Claude Pro and Max subscriptions, offering unified access to both Claude (web, desktop, mobile) and Claude Code (terminal) with shared usage limits and seamless authentication.

## Table of Contents

1. [Authentication Methods](#authentication-methods)
2. [Official Docker Setup](#official-docker-setup)
3. [Community Docker Solutions](#community-docker-solutions)
4. [Configuration Files](#configuration-files)
5. [Environment Variables](#environment-variables)
6. [Best Practices](#best-practices)
7. [CI/CD Integration](#cicd-integration)
8. [Troubleshooting](#troubleshooting)
9. [Security Considerations](#security-considerations)

## Authentication Methods

### 1. Claude Pro/Max Subscription Authentication (Recommended)

**For Pro/Max subscribers**, Claude Code supports OAuth authentication through Claude.ai:

```bash
# Interactive authentication (host machine)
claude login

# Follow OAuth flow to authenticate with Claude Pro subscription
# This creates persistent credentials in ~/.claude/
```

**Docker Integration:**
```bash
# Mount credentials into container
docker run -v ~/.claude:/home/claude/.claude:ro \
           -v ~/.claude.json:/home/claude/.claude.json:ro \
           -v $(pwd):/workspace \
           your-claude-image
```

### 2. API Key Authentication (Fallback)

For headless environments or when OAuth isn't available:

```bash
# Set API key environment variable
export ANTHROPIC_API_KEY="your-api-key-here"

# Docker with environment variable
docker run -e ANTHROPIC_API_KEY="your-api-key" \
           -v $(pwd):/workspace \
           your-claude-image
```

### 3. Third-Party Provider Authentication

**AWS Bedrock:**
```bash
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION="us-east-1"
export AWS_PROFILE="your-profile"

# Mount AWS credentials
docker run -v ~/.aws:/home/claude/.aws:ro \
           -e CLAUDE_CODE_USE_BEDROCK=1 \
           -e AWS_REGION="us-east-1" \
           your-claude-image
```

**Google Vertex AI:**
```bash
export CLAUDE_CODE_USE_VERTEX=1
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"

# Mount GCP credentials
docker run -v ~/.config/gcloud:/home/claude/.config/gcloud:ro \
           -e CLAUDE_CODE_USE_VERTEX=1 \
           your-claude-image
```

## Official Docker Setup

### Anthropic Dev Container (Recommended)

Anthropic provides an official development container setup:

```bash
# Clone the reference implementation
git clone https://github.com/anthropics/claude-code-devcontainer
cd claude-code-devcontainer

# Open in VS Code with Dev Containers extension
code .
# Select "Reopen in Container" when prompted
```

**Key Components:**

1. **devcontainer.json** - Controls container settings, extensions, and volume mounts
2. **Dockerfile** - Defines the container image and installed tools  
3. **init-firewall.sh** - Establishes network security rules

### Dev Container Configuration

```json
// .devcontainer/devcontainer.json
{
  "name": "Claude Code Development",
  "build": {
    "dockerfile": "Dockerfile"
  },
  "mounts": [
    // Persist Claude credentials
    "source=${localEnv:HOME}/.claude,target=/home/claude/.claude,type=bind,consistency=cached",
    "source=${localEnv:HOME}/.claude.json,target=/home/claude/.claude.json,type=bind,consistency=cached",
    
    // Mount project workspace
    "source=${localWorkspaceFolder},target=/workspace,type=bind,consistency=cached",
    
    // Performance optimization for node_modules
    "source=claude-node-modules,target=/workspace/node_modules,type=volume"
  ],
  "postCreateCommand": "npm install",
  "extensions": [
    "anthropic.claude-code"
  ],
  "settings": {
    "claude.code.enabled": true
  }
}
```

### Dockerfile Example

```dockerfile
# .devcontainer/Dockerfile
FROM node:18-bullseye

# Create non-root user
RUN useradd -m -s /bin/bash claude
USER claude
WORKDIR /home/claude

# Install Claude Code
RUN npm install -g @anthropic-ai/claude-code

# Set up firewall rules (security)
COPY init-firewall.sh /usr/local/bin/
RUN sudo chmod +x /usr/local/bin/init-firewall.sh

# Default working directory
WORKDIR /workspace

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD claude --version || exit 1

CMD ["/bin/bash"]
```

## Community Docker Solutions

### 1. Claude-YOLO (Most Popular)

**Repository**: [thevibeworks/claude-code-yolo](https://github.com/thevibeworks/claude-code-yolo)

**Features:**
- Container isolation with `--dangerously-skip-permissions`
- Secure credential mounting
- Non-root execution
- Multiple authentication methods

```bash
# OAuth Authentication (Recommended for Pro users)
export CLAUDE_CODE_OAUTH_TOKEN=$(claude setup-token)
docker run --rm -v $(pwd):/workspace \
           -e CLAUDE_CODE_OAUTH_TOKEN \
           thevibeworks/claude-yolo

# API Key Authentication
docker run --rm -v $(pwd):/workspace \
           -e ANTHROPIC_API_KEY="your-key" \
           thevibeworks/claude-yolo

# With mounted credentials
docker run --rm -v $(pwd):/workspace \
           -v ~/.claude:/home/claude/.claude:ro \
           -v ~/.aws:/home/claude/.aws:ro \
           thevibeworks/claude-yolo
```

### 2. Claude Container (Alternative)

**Repository**: [nezhar/claude-container](https://github.com/nezhar/claude-container)

**Features:**
- Complete isolation from host system
- Persistent credentials and workspace access
- Automated setup scripts

```bash
# Basic usage
docker run -v ~/.claude:/home/claude/.claude \
           -v $(pwd):/workspace \
           nezhar/claude-container

# With custom settings
docker run -v ~/.claude:/home/claude/.claude \
           -v $(pwd):/workspace \
           -v ./custom-settings.json:/home/claude/.claude/settings.json \
           nezhar/claude-container
```

### 3. ClaudeBox (Development Environment)

**Repository**: [RchGrav/claudebox](https://github.com/RchGrav/claudebox)

**Features:**
- Pre-configured development profiles
- Multiple language support
- Integrated development tools

```bash
# Development environment
docker run -it --rm \
           -v ~/.claude:/home/claude/.claude:ro \
           -v $(pwd):/workspace \
           rchgrav/claudebox:dev

# Production profile
docker run -it --rm \
           -v ~/.claude:/home/claude/.claude:ro \
           -v $(pwd):/workspace \
           rchgrav/claudebox:production
```

## Configuration Files

### Settings Hierarchy

Claude Code uses a hierarchical configuration system:

1. **Enterprise managed policies** (highest priority)
2. **Command line arguments**
3. **Local project settings** (`.claude/settings.json`)
4. **Shared project settings**
5. **User settings** (`~/.claude/settings.json`)

### Example settings.json

```json
{
  "model": "claude-sonnet-4-20250514",
  "maxTokens": 4096,
  "permissions": {
    "allowedTools": ["Read", "Write", "Bash", "Grep", "WebSearch"],
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Write(./production.config.*)",
      "Bash(rm *)",
      "Bash(sudo *)"
    ]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write(*.py)",
        "hooks": [
          {
            "type": "command",
            "command": "python -m black $file"
          }
        ]
      },
      {
        "matcher": "Write(*.ts)",
        "hooks": [
          {
            "type": "command", 
            "command": "npx prettier --write $file"
          }
        ]
      }
    ]
  },
  "apiKeyHelper": {
    "command": "/usr/local/bin/get-claude-token.sh",
    "refreshInterval": 300000
  }
}
```

### MCP Server Configuration

```json
// .mcp.json - Available to entire team
{
  "mcpServers": {
    "puppeteer": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "--init", "-e", "DOCKER_CONTAINER=true", "mcp/puppeteer"]
    },
    "sentry": {
      "command": "docker", 
      "args": ["run", "-i", "--rm", "mcp/sentry"]
    }
  }
}
```

### Custom Commands

Store reusable prompt templates in `.claude/commands/`:

```markdown
<!-- .claude/commands/security-review.md -->
# Security Review

Please perform a comprehensive security review of the current changes:

1. Check for hardcoded secrets or API keys
2. Analyze authentication and authorization logic
3. Review input validation and sanitization
4. Look for potential injection vulnerabilities
5. Verify proper error handling that doesn't leak information
6. Check for insecure dependencies

Focus on critical security issues that could lead to data breaches or system compromise.
```

## Environment Variables

### Core Authentication Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `ANTHROPIC_API_KEY` | Primary API authentication | `sk-ant-api03-...` |
| `ANTHROPIC_AUTH_TOKEN` | Custom bearer token | `Bearer custom-token` |
| `CLAUDE_CODE_OAUTH_TOKEN` | OAuth token for Pro users | `oauth-token-here` |

### Third-Party Provider Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `CLAUDE_CODE_USE_BEDROCK` | Enable AWS Bedrock | `1` |
| `CLAUDE_CODE_USE_VERTEX` | Enable Google Vertex AI | `1` |
| `AWS_REGION` | AWS region for Bedrock | `us-east-1` |
| `AWS_PROFILE` | AWS profile for Bedrock | `production` |
| `GOOGLE_APPLICATION_CREDENTIALS` | GCP service account | `/path/to/creds.json` |

### Debug and Control Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `ANTHROPIC_LOG` | Enable debug logging | `debug` |
| `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` | Disable telemetry | `true` |
| `BASH_DEFAULT_TIMEOUT_MS` | Bash command timeout | `120000` |
| `MCP_TIMEOUT` | MCP server timeout | `30000` |
| `CLAUDE_CODE_API_KEY_HELPER_TTL_MS` | API helper refresh rate | `300000` |

### Docker Environment Configuration

```bash
# .env file for Docker Compose
ANTHROPIC_API_KEY=your-api-key-here
CLAUDE_CODE_USE_BEDROCK=1
AWS_REGION=us-east-1
AWS_PROFILE=default
ANTHROPIC_LOG=debug
CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=false
BASH_DEFAULT_TIMEOUT_MS=120000
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  claude-code:
    image: your-claude-image
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - CLAUDE_CODE_USE_BEDROCK=${CLAUDE_CODE_USE_BEDROCK}
      - AWS_REGION=${AWS_REGION}
      - ANTHROPIC_LOG=${ANTHROPIC_LOG}
    volumes:
      - ~/.claude:/home/claude/.claude:ro
      - ~/.aws:/home/claude/.aws:ro
      - ./workspace:/workspace
    working_dir: /workspace
```

## Best Practices

### 1. Security Through Containerization

**Principle**: Isolate Claude Code from the host system while maintaining functionality.

```bash
# Use non-root user in containers
docker run --user $(id -u):$(id -g) \
           -v ~/.claude:/home/claude/.claude:ro \
           -v $(pwd):/workspace \
           your-claude-image

# Limit network access with firewall rules
docker run --cap-add=NET_ADMIN \
           -v ~/.claude:/home/claude/.claude:ro \
           your-claude-image
```

### 2. Credential Management

**Mount credentials as read-only:**
```bash
# Read-only credential mounts prevent accidental modification
-v ~/.claude:/home/claude/.claude:ro
-v ~/.aws:/home/claude/.aws:ro
-v ~/.config/gcloud:/home/claude/.config/gcloud:ro
```

**Use environment variables for CI/CD:**
```bash
# Prefer environment variables over mounted files in CI
export ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY_SECRET}"
export CLAUDE_PERMISSION_MODE="denyEdits"
```

### 3. Performance Optimization

**Use Docker volumes for node_modules:**
```yaml
# docker-compose.yml
volumes:
  - claude-node-modules:/workspace/node_modules  # Performance optimization
  - ./:/workspace                                # Bind mount project files
```

**Implement health checks:**
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD claude --version || exit 1
```

### 4. Team Configuration

**Version control shared settings:**
```bash
# Check into git for team sharing
.claude/
├── settings.json      # Shared team settings
├── commands/          # Custom slash commands
│   ├── review.md
│   └── deploy.md
└── .gitignore        # Exclude local settings
```

**Use local overrides for personal preferences:**
```json
// .claude/settings.local.json (not in git)
{
  "model": "claude-sonnet-4-20250514",  // Personal preference
  "maxTokens": 8192,                   // Higher limit for complex tasks
  "permissions": {
    "allowDangerousOperations": true   // Personal development setting
  }
}
```

### 5. Resource Management

**Set appropriate limits:**
```yaml
# docker-compose.yml
services:
  claude-code:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
        reservations:
          memory: 512M
          cpus: '0.5'
```

**Monitor container resource usage:**
```bash
# Monitor resource usage
docker stats claude-container

# Set up logging
docker run --log-driver=json-file \
           --log-opt max-size=10m \
           --log-opt max-file=3 \
           your-claude-image
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/claude-review.yml
name: Claude Code Review
on: [pull_request]

jobs:
  claude-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker
        uses: docker/setup-docker@v2
      
      - name: Authenticate with Claude
        env:
          CLAUDE_CODE_OAUTH_TOKEN: ${{ secrets.CLAUDE_OAUTH_TOKEN }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          # Priority: OAuth token > API key
          if [ -n "$CLAUDE_CODE_OAUTH_TOKEN" ]; then
            echo "Using OAuth authentication"
            export AUTH_METHOD="oauth"
          elif [ -n "$ANTHROPIC_API_KEY" ]; then
            echo "Using API key authentication"
            export AUTH_METHOD="api_key"
          else
            echo "No authentication method available"
            exit 1
          fi
      
      - name: Run Claude Code Review
        run: |
          docker run --rm \
            -v ${{ github.workspace }}:/workspace \
            -e CLAUDE_CODE_OAUTH_TOKEN="${{ secrets.CLAUDE_OAUTH_TOKEN }}" \
            -e ANTHROPIC_API_KEY="${{ secrets.ANTHROPIC_API_KEY }}" \
            -e CLAUDE_PERMISSION_MODE="denyEdits" \
            thevibeworks/claude-yolo \
            claude -p "Review this pull request for security issues and code quality" \
                  --headless \
                  --max-turns 3 \
                  --output-format stream-json
      
      - name: Comment on PR
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const review = fs.readFileSync('claude-review.json', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## Claude Code Review\n\n${review}`
            });
```

### GitLab CI

```yaml
# .gitlab-ci.yml
claude_review:
  stage: review
  image: docker:latest
  services:
    - docker:dind
  variables:
    DOCKER_DRIVER: overlay2
  before_script:
    - docker pull thevibeworks/claude-yolo
  script:
    - |
      docker run --rm \
        -v $CI_PROJECT_DIR:/workspace \
        -e ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
        -e CLAUDE_PERMISSION_MODE="denyEdits" \
        thevibeworks/claude-yolo \
        claude -p "Analyze merge request changes" --headless --max-turns 2
  only:
    - merge_requests
```

### Jenkins Pipeline

```groovy
// Jenkinsfile
pipeline {
    agent any
    
    environment {
        ANTHROPIC_API_KEY = credentials('anthropic-api-key')
        CLAUDE_PERMISSION_MODE = 'denyEdits'
    }
    
    stages {
        stage('Claude Code Review') {
            steps {
                script {
                    docker.image('thevibeworks/claude-yolo').inside(
                        "-v ${WORKSPACE}:/workspace -e ANTHROPIC_API_KEY -e CLAUDE_PERMISSION_MODE"
                    ) {
                        sh '''
                            claude -p "Review code changes for quality and security" \
                                  --headless \
                                  --max-turns 3 \
                                  --allowed-tools "Read,Grep,Bash"
                        '''
                    }
                }
            }
        }
    }
    
    post {
        always {
            archiveArtifacts artifacts: 'claude-review-*.json', fingerprint: true
        }
    }
}
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Authentication Failures

**Issue**: "Authentication failed" errors in Docker

**Solutions:**
```bash
# Check authentication status on host
claude whoami

# Verify environment variables
docker run --rm your-image env | grep -E "(CLAUDE|ANTHROPIC)"

# Test authentication in container
docker run --rm -it \
  -v ~/.claude:/home/claude/.claude:ro \
  -e ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
  your-image \
  claude -p "test" --headless --max-turns 1
```

#### 2. Permission Denied Errors

**Issue**: Cannot access mounted credentials

**Solutions:**
```bash
# Fix ownership issues
docker run --user $(id -u):$(id -g) ...

# Check file permissions
ls -la ~/.claude/
chmod 600 ~/.claude.json
chmod 700 ~/.claude/

# Verify inside container
docker exec -it container-name ls -la ~/.claude/
```

#### 3. Network Connectivity Issues

**Issue**: Cannot reach Anthropic API from container

**Solutions:**
```bash
# Test network connectivity
docker run --rm your-image ping api.anthropic.com

# Check firewall rules
docker run --rm your-image iptables -L

# Debug with curl
docker run --rm -e ANTHROPIC_API_KEY your-image \
  curl -H "Authorization: Bearer $ANTHROPIC_API_KEY" \
       https://api.anthropic.com/v1/messages
```

#### 4. Performance Issues

**Issue**: Slow file operations in Docker

**Solutions:**
```yaml
# Use Docker volumes for large directories
volumes:
  - node-modules-volume:/workspace/node_modules
  - ./:/workspace

# Optimize bind mount consistency
volumes:
  - ./:/workspace:cached  # macOS optimization
```

### Debug Commands

```bash
# Check Claude Code installation
docker run --rm your-image claude --version

# Verify authentication methods
docker run --rm your-image claude doctor

# Test basic functionality
docker run --rm \
  -v ~/.claude:/home/claude/.claude:ro \
  -v $(pwd):/workspace \
  your-image \
  claude -p "List files in current directory" --headless --max-turns 1

# Debug environment variables
docker run --rm your-image printenv | grep -E "(CLAUDE|ANTHROPIC|AWS|GOOGLE)"
```

## Security Considerations

### 1. Principle of Least Privilege

**Container Security:**
```dockerfile
# Use non-root user
RUN useradd -m -s /bin/bash claude
USER claude

# Drop unnecessary capabilities
docker run --cap-drop=ALL --cap-add=NET_RAW your-image

# Use read-only root filesystem
docker run --read-only --tmpfs /tmp your-image
```

**Permission Restrictions:**
```json
{
  "permissions": {
    "deny": [
      "Read(./.env*)",
      "Read(./secrets/*)",
      "Write(./production.*)",
      "Bash(rm *)",
      "Bash(sudo *)",
      "Bash(curl * | bash)"
    ],
    "allowedTools": ["Read", "Grep", "Write"]
  }
}
```

### 2. Network Isolation

**Firewall Configuration:**
```bash
# init-firewall.sh
#!/bin/bash

# Allow essential outbound connections
iptables -A OUTPUT -d api.anthropic.com -p tcp --dport 443 -j ACCEPT
iptables -A OUTPUT -d registry.npmjs.org -p tcp --dport 443 -j ACCEPT
iptables -A OUTPUT -d github.com -p tcp --dport 443 -j ACCEPT

# Allow DNS
iptables -A OUTPUT -p udp --dport 53 -j ACCEPT

# Default deny
iptables -A OUTPUT -j DROP
```

**Docker Network Restrictions:**
```yaml
# docker-compose.yml with network isolation
version: '3.8'
services:
  claude-code:
    networks:
      - claude-network
    
networks:
  claude-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
    internal: true  # No external access
```

### 3. Secret Management

**Environment Variables:**
```bash
# Use Docker secrets for sensitive data
echo "your-api-key" | docker secret create anthropic-api-key -

docker service create \
  --secret anthropic-api-key \
  --env ANTHROPIC_API_KEY_FILE=/run/secrets/anthropic-api-key \
  your-claude-service
```

**Credential Helpers:**
```bash
#!/bin/bash
# get-claude-token.sh
# Retrieve token from secure storage
vault kv get -field=api_key secret/claude/anthropic
```

### 4. Monitoring and Auditing

**Log Security Events:**
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash(*)",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'AUDIT: Bash command attempted: $command' >> /var/log/claude-audit.log"
          }
        ]
      }
    ]
  }
}
```

**Container Monitoring:**
```bash
# Monitor container behavior
docker run --security-opt no-new-privileges \
           --security-opt apparmor:docker-claude \
           your-claude-image

# Enable audit logging
docker run --log-driver=syslog \
           --log-opt syslog-address=tcp://logserver:514 \
           your-claude-image
```

## Production Deployment Patterns

### 1. Multi-Stage Build

```dockerfile
# Multi-stage Dockerfile for production
FROM node:18-alpine AS base
RUN addgroup -g 1001 claude && adduser -D -u 1001 -G claude claude
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM base AS runtime
COPY --from=deps /app/node_modules ./node_modules
COPY --chown=claude:claude . .
USER claude

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD claude --version || exit 1

CMD ["claude", "--help"]
```

### 2. Kubernetes Deployment

```yaml
# kubernetes/claude-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: claude-code
spec:
  replicas: 2
  selector:
    matchLabels:
      app: claude-code
  template:
    metadata:
      labels:
        app: claude-code
    spec:
      containers:
      - name: claude-code
        image: your-registry/claude-code:latest
        env:
        - name: ANTHROPIC_API_KEY
          valueFrom:
            secretKeyRef:
              name: claude-secrets
              key: api-key
        - name: CLAUDE_PERMISSION_MODE
          value: "restrictive"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        securityContext:
          runAsNonRoot: true
          runAsUser: 1001
          readOnlyRootFilesystem: true
          allowPrivilegeEscalation: false
          capabilities:
            drop:
              - ALL
        volumeMounts:
        - name: workspace
          mountPath: /workspace
        - name: claude-config
          mountPath: /home/claude/.claude
          readOnly: true
      volumes:
      - name: workspace
        emptyDir: {}
      - name: claude-config
        secret:
          secretName: claude-config
```

### 3. Docker Swarm Service

```bash
# Deploy Claude Code as Docker Swarm service
docker service create \
  --name claude-code \
  --replicas 3 \
  --env ANTHROPIC_API_KEY_FILE=/run/secrets/anthropic-api-key \
  --secret anthropic-api-key \
  --mount type=bind,source=/shared/workspace,target=/workspace \
  --constraint 'node.role == worker' \
  --update-delay 30s \
  --update-parallelism 1 \
  your-registry/claude-code:latest
```

## Performance Optimization

### 1. Container Image Optimization

```dockerfile
# Optimized Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM alpine:latest
RUN apk add --no-cache nodejs npm bash
RUN adduser -D -s /bin/bash claude
COPY --from=builder --chown=claude:claude /app /app
USER claude
WORKDIR /app
CMD ["node", "index.js"]
```

### 2. Volume Configuration

```yaml
# docker-compose.yml with optimized volumes
version: '3.8'
services:
  claude-code:
    image: your-claude-image
    volumes:
      # Use tmpfs for temporary files
      - type: tmpfs
        target: /tmp
        tmpfs:
          size: 100M
      
      # Named volume for dependencies
      - node-modules:/workspace/node_modules
      
      # Cached bind mount for project files
      - type: bind
        source: ./
        target: /workspace
        consistency: cached
      
      # Read-only config mounts
      - type: bind
        source: ~/.claude
        target: /home/claude/.claude
        read_only: true

volumes:
  node-modules:
    driver: local
```

### 3. Caching Strategies

```bash
# Use BuildKit for improved caching
export DOCKER_BUILDKIT=1

docker build \
  --cache-from your-registry/claude-code:cache \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  -t your-registry/claude-code:latest .

# Push cache layers
docker push your-registry/claude-code:cache
```

## Monitoring and Observability

### 1. Health Checks

```dockerfile
# Comprehensive health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD claude --version && \
      claude -p "health check" --headless --max-turns 1 && \
      echo "Health check passed" || exit 1
```

### 2. Logging Configuration

```yaml
# docker-compose.yml with logging
version: '3.8'
services:
  claude-code:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
        labels: "service=claude-code"
    environment:
      - ANTHROPIC_LOG=debug
```

### 3. Metrics Collection

```bash
# Prometheus metrics endpoint
docker run -p 9090:9090 \
  -e CLAUDE_METRICS_ENABLED=true \
  -e CLAUDE_METRICS_PORT=9090 \
  your-claude-image
```

## Future Considerations

### Upcoming Features (Speculative)

1. **Native Kubernetes Operator** - Simplified deployment and management
2. **Enhanced MCP Integration** - Better Docker MCP server support
3. **Improved Authentication** - Native service account support for Pro users
4. **Resource Optimization** - Better container resource utilization
5. **Security Enhancements** - Advanced container security policies

### Community Roadmap

1. **Standardized Docker Images** - Official Anthropic-maintained images
2. **Helm Charts** - Kubernetes deployment templates
3. **Operator Framework** - Custom resource definitions for Claude Code
4. **CI/CD Templates** - Pre-built pipeline configurations

## Conclusion

Running Claude Code with Claude Pro subscriptions in Docker provides a secure, scalable approach to AI-assisted development. The combination of official Docker support, community solutions, and robust configuration options enables teams to integrate Claude Code into their development workflows while maintaining security and performance.

Key takeaways:
- **Authentication**: OAuth for Pro users, API keys for headless environments
- **Security**: Container isolation with credential mounting
- **Configuration**: Hierarchical settings with team collaboration features
- **Performance**: Optimized Docker images and volume configurations
- **CI/CD**: Comprehensive integration patterns for major platforms

As Claude Code continues to evolve, Docker integration will become increasingly important for enterprise deployments and team collaboration.

## Sources and References

- **Official Anthropic Documentation**: https://docs.anthropic.com/en/docs/claude-code/
- **Claude Code Best Practices**: https://www.anthropic.com/engineering/claude-code-best-practices
- **Development Containers**: https://docs.anthropic.com/en/docs/claude-code/devcontainer
- **Claude Code Settings**: https://docs.anthropic.com/en/docs/claude-code/settings
- **Docker MCP Integration**: https://www.docker.com/blog/the-model-context-protocol-simplifying-building-ai-apps-with-anthropic-claude-desktop-and-docker/
- **Community Solutions**:
  - Claude-YOLO: https://github.com/thevibeworks/claude-code-yolo
  - Claude Container: https://github.com/nezhar/claude-container
  - ClaudeBox: https://github.com/RchGrav/claudebox
- **Configuration Guides**:
  - https://claudelog.com/configuration/
  - https://ainativedev.io/news/configuring-claude-code
  - https://timsh.org/claude-inside-docker/

## Version History

- **v1.0.0** (September 2025): Initial comprehensive documentation
- Includes Claude Pro subscription support, official Docker integration
- Community solutions analysis, security best practices
- CI/CD integration patterns, troubleshooting guides