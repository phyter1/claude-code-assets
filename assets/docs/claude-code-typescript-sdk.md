# Claude Code TypeScript SDK

**Version**: 1.0.98 (Latest)  
**Last Updated**: August 31, 2025  
**Package**: `@anthropic-ai/claude-code`  
**Weekly Downloads**: 5,482,588  
**Official Documentation**: https://docs.anthropic.com/en/docs/claude-code/sdk/sdk-typescript

## Overview and Purpose

The Claude Code TypeScript SDK is an official library for building custom AI agents with Claude that can execute code, read files, search the web, and perform complex multi-turn conversations. It's designed for developers building web applications or working in Node.js environments who want to integrate Claude's agentic capabilities directly into their applications.

### Key Features
- **Multi-turn conversations** with streaming message support
- **Tool integration** with granular permission control
- **Custom tool creation** via Model Context Protocol (MCP)
- **Session management** with conversation resumption
- **Type-safe** tool definitions using Zod
- **Production-ready** with error handling and rate limiting

## Installation

### Global Installation (CLI)
```bash
npm install -g @anthropic-ai/claude-code
```

### Project Installation (SDK)
```bash
npm install @anthropic-ai/claude-code
```

### Requirements
- Node.js 18+
- TypeScript (recommended)
- Anthropic API key

## Core Concepts and Architecture

### Primary Interface
The main interface is the `query()` function, which returns an async iterator that streams messages as they arrive:

```typescript
import { query } from "@anthropic-ai/claude-code";

for await (const message of query(options)) {
  // Handle streaming messages
}
```

### Message Types
The SDK uses a structured message format with different types:

```typescript
type SDKMessage = 
  | { type: "assistant"; message: Message; session_id: string; }
  | { type: "user"; message: MessageParam; session_id: string; }
  | { type: "result"; subtype: "success" | "error_max_turns" | "error_during_execution"; /* ... */ }
  | { type: "system"; subtype: "init"; /* ... */ }
```

### Built-in Tools
Claude Code comes with powerful built-in tools:
- **Bash**: Execute shell commands
- **Read/Write**: File operations
- **WebSearch**: Internet search capabilities
- **Grep**: Code search functionality
- **Edit**: File editing operations

## API Reference

### `query(options)` Function

The primary function for interacting with Claude Code.

#### Parameters

```typescript
interface QueryOptions {
  prompt: string;                    // The initial prompt/question
  abortController?: AbortController; // For cancelling requests
  options?: {
    maxTurns?: number;              // Maximum conversation turns (default: varies)
    systemPrompt?: string;          // System-level instructions
    appendSystemPrompt?: string;    // Additional system instructions
    allowedTools?: string[];        // Permitted tools array
    permissionMode?: "default" | "acceptEdits" | "denyEdits";
    mcpConfig?: string;             // MCP server configuration file
    mcpServers?: McpServerConfig[]; // Direct MCP server configuration
    cwd?: string;                   // Working directory
    continueSession?: boolean;      // Continue previous session
    sessionId?: string;             // Specific session to resume
  };
}
```

#### Return Value
Returns an `AsyncIterable<SDKMessage>` that yields messages as they arrive.

#### Example Usage

```typescript
import { query } from "@anthropic-ai/claude-code";

// Basic usage
for await (const message of query({
  prompt: "Analyze the performance of this Node.js application",
  options: {
    maxTurns: 5,
    systemPrompt: "You are a performance engineer",
    allowedTools: ["Bash", "Read", "WebSearch"]
  }
})) {
  if (message.type === "result") {
    console.log("Final result:", message.result);
  } else if (message.type === "assistant") {
    console.log("Claude:", message.message.content);
  }
}
```

### Custom Tool Creation

Create custom tools using the Model Context Protocol (MCP):

```typescript
import { query, tool, createSdkMcpServer } from "@anthropic-ai/claude-code";
import { z } from "zod";

const customServer = createSdkMcpServer({
  name: "my-custom-tools",
  version: "1.0.0",
  tools: [
    tool(
      "calculate_compound_interest",
      "Calculate compound interest for an investment",
      {
        principal: z.number().describe("Initial investment amount"),
        rate: z.number().describe("Annual interest rate (as decimal)"),
        time: z.number().describe("Investment period in years"),
        n: z.number().default(12).describe("Compounding frequency per year")
      },
      async (args) => {
        const amount = args.principal * Math.pow(1 + args.rate / args.n, args.n * args.time);
        const interest = amount - args.principal;
        return {
          content: [{
            type: "text",
            text: `Final amount: $${amount.toFixed(2)}\nInterest earned: $${interest.toFixed(2)}`
          }]
        };
      }
    )
  ]
});
```

## Usage Examples and Code Snippets

### 1. Basic Code Analysis
```typescript
import { query } from "@anthropic-ai/claude-code";

async function analyzeCode() {
  for await (const message of query({
    prompt: "Review the security of my authentication middleware",
    options: {
      allowedTools: ["Read", "Grep", "WebSearch"],
      systemPrompt: "You are a security expert. Focus on finding vulnerabilities.",
      maxTurns: 3
    }
  })) {
    if (message.type === "result") {
      console.log("Security analysis complete:", message.result);
    }
  }
}
```

### 2. SRE Agent with Monitoring Tools
```typescript
async function investigateOutage() {
  for await (const message of query({
    prompt: "Investigate the payment service outage",
    options: {
      mcpConfig: "sre-tools.json",
      allowedTools: ["mcp__datadog", "mcp__pagerduty", "mcp__kubernetes"],
      systemPrompt: "You are an SRE. Use monitoring data to diagnose issues.",
      maxTurns: 4
    }
  })) {
    if (message.type === "result") {
      console.log("Outage investigation:", message.result);
    }
  }
}
```

### 3. Multi-turn Conversation with Session Management
```typescript
import { query } from "@anthropic-ai/claude-code";

async function continuousAssistant() {
  let sessionId: string | undefined;
  
  // Initial conversation
  for await (const message of query({
    prompt: "Help me refactor this React component",
    options: { maxTurns: 2 }
  })) {
    if (message.session_id) sessionId = message.session_id;
    if (message.type === "result") {
      console.log("First phase done:", message.result);
    }
  }

  // Continue the conversation
  for await (const message of query({
    prompt: "Now add unit tests for the refactored component",
    options: { 
      sessionId,
      maxTurns: 3
    }
  })) {
    if (message.type === "result") {
      console.log("Tests added:", message.result);
    }
  }
}
```

### 4. Business Process Automation
```typescript
async function legalAssistant() {
  for await (const message of query({
    prompt: "Review this contract clause for potential issues: 'The party agrees to unlimited liability...'",
    options: {
      systemPrompt: "You are a legal assistant. Identify risks and suggest improvements.",
      allowedTools: ["WebSearch", "Read"],
      maxTurns: 2
    }
  })) {
    if (message.type === "result") {
      console.log("Legal review:", message.result);
    }
  }
}
```

## Configuration Options

### Environment Variables

#### Authentication
```bash
# Primary method - Anthropic API key
export ANTHROPIC_API_KEY="your-api-key"

# Alternative providers
export CLAUDE_CODE_USE_BEDROCK=1    # Amazon Bedrock
export CLAUDE_CODE_USE_VERTEX=1     # Google Vertex AI
```

#### Tool Permissions
```typescript
const options = {
  // Control which tools Claude can access
  allowedTools: ["Bash", "Read", "Write", "WebSearch", "Grep"],
  
  // Permission modes for file operations
  permissionMode: "acceptEdits" | "denyEdits" | "default",
  
  // Working directory
  cwd: "/path/to/project"
};
```

#### Session Configuration
```typescript
const options = {
  maxTurns: 10,           // Limit conversation length
  continueSession: true,   // Resume last conversation
  sessionId: "abc123",     // Resume specific session
};
```

### MCP Server Configuration

Create an MCP configuration file (`mcp-config.json`):

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem", "/path/to/allowed/files"]
    },
    "brave-search": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "your-brave-api-key"
      }
    }
  }
}
```

Then use it in your code:
```typescript
for await (const message of query({
  prompt: "Search for recent security vulnerabilities in Node.js",
  options: {
    mcpConfig: "./mcp-config.json",
    allowedTools: ["mcp__brave-search"]
  }
})) {
  // Handle messages
}
```

## Best Practices and Common Patterns

### 1. Error Handling and Timeouts
```typescript
import { query } from "@anthropic-ai/claude-code";

async function robustQuery(prompt: string) {
  const abortController = new AbortController();
  
  // Set timeout
  const timeout = setTimeout(() => {
    abortController.abort();
  }, 30000); // 30 seconds

  try {
    for await (const message of query({
      prompt,
      abortController,
      options: {
        maxTurns: 5,
        allowedTools: ["Read", "WebSearch"]
      }
    })) {
      if (message.type === "result") {
        clearTimeout(timeout);
        
        if (message.subtype === "error_max_turns") {
          console.warn("Reached maximum turns without completion");
        }
        
        return message;
      }
    }
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      console.error('Query timed out');
    } else {
      console.error('Query failed:', error);
    }
    throw error;
  }
}
```

### 2. Tool Permission Management
```typescript
// Restrictive permissions for automated tasks
const restrictedOptions = {
  allowedTools: ["Read", "Grep"], // Read-only access
  permissionMode: "denyEdits",
  maxTurns: 2
};

// Permissive for interactive development
const developmentOptions = {
  allowedTools: ["Bash", "Read", "Write", "Edit", "WebSearch"],
  permissionMode: "acceptEdits",
  maxTurns: 10
};
```

### 3. Session Management Pattern
```typescript
class ClaudeAssistant {
  private currentSessionId?: string;
  
  async query(prompt: string, options: Partial<QueryOptions> = {}) {
    const queryOptions = {
      ...options,
      sessionId: this.currentSessionId
    };
    
    for await (const message of query({ prompt, options: queryOptions })) {
      // Track session ID for continuity
      if (message.session_id) {
        this.currentSessionId = message.session_id;
      }
      
      if (message.type === "result") {
        return message;
      }
    }
  }
  
  resetSession() {
    this.currentSessionId = undefined;
  }
}
```

### 4. Cost Monitoring
```typescript
async function monitoredQuery(prompt: string) {
  let totalCost = 0;
  
  for await (const message of query({
    prompt,
    options: { maxTurns: 5 }
  })) {
    if (message.type === "result") {
      totalCost = message.total_cost_usd;
      console.log(`Query completed. Cost: $${totalCost.toFixed(4)}`);
      console.log(`Duration: ${message.duration_ms}ms`);
      console.log(`API calls: ${message.duration_api_ms}ms`);
    }
  }
  
  return totalCost;
}
```

## Error Handling

### Common Error Types
```typescript
for await (const message of query({ prompt, options })) {
  if (message.type === "result") {
    switch (message.subtype) {
      case "success":
        console.log("Query completed successfully");
        break;
        
      case "error_max_turns":
        console.warn("Reached maximum conversation turns");
        break;
        
      case "error_during_execution":
        console.error("Error occurred during execution");
        break;
    }
    
    // Check for execution errors
    if (message.is_error) {
      console.error("Query failed with error");
    }
  }
}
```

### Abort Controller Usage
```typescript
const abortController = new AbortController();

// Cancel after 30 seconds
setTimeout(() => abortController.abort(), 30000);

try {
  for await (const message of query({
    prompt: "Long-running analysis task",
    abortController,
    options: { maxTurns: 20 }
  })) {
    // Handle messages
  }
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Query was cancelled');
  }
}
```

## Authentication and Setup Requirements

### 1. Anthropic API Key (Primary)
```bash
# Set environment variable
export ANTHROPIC_API_KEY="your-anthropic-api-key"

# Or set in your application
process.env.ANTHROPIC_API_KEY = "your-anthropic-api-key";
```

Get your API key from the [Anthropic Console](https://console.anthropic.com/).

### 2. Amazon Bedrock Integration
```bash
export CLAUDE_CODE_USE_BEDROCK=1

# Configure AWS credentials
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_REGION="us-east-1"
```

### 3. Google Vertex AI Integration
```bash
export CLAUDE_CODE_USE_VERTEX=1

# Configure Google Cloud credentials
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

## Integration Examples

### 1. Express.js API Integration
```typescript
import express from 'express';
import { query } from '@anthropic-ai/claude-code';

const app = express();
app.use(express.json());

app.post('/api/code-review', async (req, res) => {
  const { code, language } = req.body;
  
  try {
    for await (const message of query({
      prompt: `Review this ${language} code for best practices and potential issues:\n\n${code}`,
      options: {
        systemPrompt: "You are a senior code reviewer. Provide constructive feedback.",
        allowedTools: ["WebSearch"], // No file access needed
        maxTurns: 2
      }
    })) {
      if (message.type === "result") {
        res.json({
          review: message.result,
          cost: message.total_cost_usd,
          duration: message.duration_ms
        });
        return;
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000);
```

### 2. GitHub Actions Integration
```typescript
// github-action-claude.ts
import { query } from '@anthropic-ai/claude-code';
import * as core from '@actions/core';

async function reviewPR() {
  const prFiles = core.getInput('files');
  
  for await (const message of query({
    prompt: `Review these changed files for security issues and code quality:\n${prFiles}`,
    options: {
      systemPrompt: "You are a security-focused code reviewer for a CI/CD pipeline.",
      allowedTools: ["Read", "Grep"],
      maxTurns: 3
    }
  })) {
    if (message.type === "result") {
      core.setOutput('review', message.result);
      
      if (message.result.includes("CRITICAL") || message.result.includes("HIGH RISK")) {
        core.setFailed("Critical security issues found");
      }
      return;
    }
  }
}

reviewPR().catch(error => core.setFailed(error.message));
```

### 3. Webpack Plugin Integration
```typescript
import { query } from '@anthropic-ai/claude-code';

class ClaudeAnalysisPlugin {
  apply(compiler) {
    compiler.hooks.done.tapAsync('ClaudeAnalysisPlugin', async (stats, callback) => {
      const bundleSize = stats.toJson().assets.reduce((acc, asset) => acc + asset.size, 0);
      
      if (bundleSize > 1000000) { // > 1MB
        for await (const message of query({
          prompt: `The bundle size is ${bundleSize} bytes. Analyze the webpack stats and suggest optimizations.`,
          options: {
            systemPrompt: "You are a webpack optimization expert.",
            allowedTools: ["Read"],
            maxTurns: 2
          }
        })) {
          if (message.type === "result") {
            console.log("Bundle optimization suggestions:", message.result);
            break;
          }
        }
      }
      
      callback();
    });
  }
}
```

### 4. Testing and QA Automation
```typescript
import { query } from '@anthropic-ai/claude-code';
import { test, expect } from '@playwright/test';

test('AI-generated test cases', async ({ page }) => {
  // Generate test scenarios using Claude
  for await (const message of query({
    prompt: "Generate comprehensive test cases for a login form with email and password fields",
    options: {
      systemPrompt: "You are a QA engineer. Generate Playwright test scenarios.",
      maxTurns: 1
    }
  })) {
    if (message.type === "result") {
      // Parse and execute the generated test cases
      console.log("Generated test scenarios:", message.result);
      
      // Example: Execute one of the suggested tests
      await page.goto('/login');
      await page.fill('[data-testid="email"]', 'invalid-email');
      await page.fill('[data-testid="password"]', 'password123');
      await page.click('[data-testid="submit"]');
      
      await expect(page.locator('[data-testid="error"]')).toContainText('Invalid email');
      break;
    }
  }
});
```

## Type Definitions

The SDK provides comprehensive TypeScript types:

```typescript
// Main query function
declare function query(options: QueryOptions): AsyncIterable<SDKMessage>;

// Configuration interfaces
interface QueryOptions {
  prompt: string;
  abortController?: AbortController;
  options?: QueryOptionsConfig;
}

interface QueryOptionsConfig {
  maxTurns?: number;
  systemPrompt?: string;
  appendSystemPrompt?: string;
  allowedTools?: string[];
  permissionMode?: "default" | "acceptEdits" | "denyEdits";
  mcpConfig?: string;
  mcpServers?: McpServerConfig[];
  cwd?: string;
  continueSession?: boolean;
  sessionId?: string;
}

// Message types
type SDKMessage = 
  | AssistantMessage
  | UserMessage 
  | ResultMessage
  | SystemMessage;

interface ResultMessage {
  type: "result";
  subtype: "success" | "error_max_turns" | "error_during_execution";
  duration_ms: number;
  duration_api_ms: number;
  is_error: boolean;
  num_turns: number;
  result?: string;
  session_id: string;
  total_cost_usd: number;
}

// Tool creation
declare function tool<T extends ZodSchema>(
  name: string,
  description: string,
  schema: T,
  handler: (args: z.infer<T>) => Promise<ToolResponse>
): Tool;

declare function createSdkMcpServer(config: McpServerConfig): McpServer;
```

## Related Packages

### Official Anthropic SDK
For direct API access without the agentic capabilities:
```bash
npm install @anthropic-ai/sdk
```

### Community SDKs
- **claude-code-sdk-ts**: Fluent, chainable TypeScript SDK with additional features
- **claude-code-js**: Alternative JavaScript implementation

## Sources and References

- **Official Documentation**: https://docs.anthropic.com/en/docs/claude-code/sdk/sdk-typescript
- **NPM Package**: https://www.npmjs.com/package/@anthropic-ai/claude-code
- **Claude Code Overview**: https://docs.anthropic.com/en/docs/claude-code/overview
- **Setup Guide**: https://docs.anthropic.com/en/docs/claude-code/setup
- **CLI Reference**: https://docs.anthropic.com/en/docs/claude-code/cli

## Version Notes and Compatibility

- **Node.js**: Requires version 18 or higher
- **TypeScript**: Fully typed with comprehensive type definitions
- **Semantic Versioning**: Breaking changes communicated via semantic versioning
- **API Compatibility**: Uses the latest Anthropic API endpoints
- **MCP Protocol**: Supports the latest Model Context Protocol specification

The Claude Code TypeScript SDK represents a significant advancement in AI-powered development tools, providing production-ready capabilities for building sophisticated AI agents that can understand and interact with codebases, execute complex workflows, and integrate seamlessly into existing development processes.