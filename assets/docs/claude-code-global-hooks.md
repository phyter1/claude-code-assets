# Claude Code Global Hooks: Comprehensive Guide

**Version**: Latest (v1.0.20+)  
**Last Updated**: September 1, 2025  
**Source**: Official Anthropic Documentation, Claude Code Hooks Reference  

## Overview

Claude Code global hooks are user-defined shell commands that execute automatically at specific points in Claude Code's lifecycle, providing deterministic control over Claude Code's behavior across all projects. Unlike project-specific hooks, global hooks are configured once and apply system-wide to every Claude Code session.

## What Are Global Hooks

Global hooks are automation commands stored in your user configuration (`~/.claude/settings.json`) that:
- Execute automatically during Claude Code operations
- Apply to all projects and sessions
- Provide deterministic behavior (unlike relying on LLM responses)
- Run with your current environment's credentials and permissions
- Can modify, delete, or access any files your user account can access

### Key Characteristics
- **Automatic Execution**: Run without user intervention at defined lifecycle events
- **System-Wide Scope**: Apply to all Claude Code projects and sessions
- **Shell Command Based**: Execute arbitrary shell commands
- **Event-Driven**: Triggered by specific Claude Code events
- **Security-Sensitive**: Run with full user permissions

## Global vs Project-Specific Hooks

### Global Hooks
- **Location**: `~/.claude/settings.json`
- **Scope**: All Claude Code projects and sessions
- **Use Cases**: Personal preferences, system-wide automation, security policies
- **Management**: `claude config set -g <key> <value>`
- **Examples**: Code formatting, logging, desktop notifications, security checks

### Project-Specific Hooks
- **Location**: `.claude/settings.json` (shared) or `.claude/settings.local.json` (personal)
- **Scope**: Individual projects only
- **Use Cases**: Project conventions, team workflows, build processes
- **Management**: Project-level configuration
- **Examples**: Project-specific linting, custom build steps, team notifications

### Settings Hierarchy (Precedence)
1. **Enterprise managed policies** (highest priority)
2. **Command line arguments**
3. **Local project settings** (`.claude/settings.local.json`)
4. **Shared project settings** (`.claude/settings.json`)
5. **User settings** (`~/.claude/settings.json`) (lowest priority)

## Available Hook Events

### 1. PreToolUse
- **Trigger**: Before any tool call is executed
- **Capability**: Can block tool execution (exit code 2)
- **Use Cases**: Security validation, permission checking, pre-processing
- **Data Access**: Tool name, input parameters, context

### 2. PostToolUse
- **Trigger**: After tool call completes
- **Capability**: Cannot block, only react
- **Use Cases**: Logging, cleanup, post-processing, notifications
- **Data Access**: Tool name, input/output, execution results

### 3. UserPromptSubmit
- **Trigger**: When user submits a prompt to Claude
- **Use Cases**: Prompt logging, analytics, user behavior tracking
- **Data Access**: User prompt content, session context

### 4. SessionStart
- **Trigger**: At the beginning of a Claude Code session
- **Use Cases**: Environment setup, logging session start, notifications
- **Data Access**: Session metadata, project context

### 5. Stop
- **Trigger**: When Claude Code agent response completes
- **Use Cases**: Response logging, cleanup, analytics
- **Data Access**: Response metadata, conversation context

### 6. SubagentStop
- **Trigger**: When a subagent completes its task
- **Use Cases**: Subagent result processing, logging, notifications
- **Data Access**: Subagent results, parent context

### 7. PreCompact
- **Trigger**: Before context compression occurs
- **Use Cases**: Context backup, logging, custom compression logic
- **Data Access**: Current context, compression metadata

### 8. Notification
- **Trigger**: When Claude Code generates system notifications
- **Use Cases**: Custom notification handling, logging, routing
- **Data Access**: Notification content, type, context

## Global Hook Configuration

### Configuration File Location
Global hooks are stored in:
```
~/.claude/settings.json
```

### Basic Configuration Structure
```json
{
  "hooks": {
    "EventName": [
      {
        "matcher": "ToolPattern",
        "hooks": [
          {
            "type": "command",
            "command": "shell-command-here",
            "timeout": 60000
          }
        ]
      }
    ]
  }
}
```

### Managing Global Configuration
```bash
# Set global configuration
claude config set -g hooks.PreToolUse[0].matcher "Bash"

# View global configuration
claude config get -g hooks

# Edit global settings directly
$EDITOR ~/.claude/settings.json
```

## Practical Examples

### 1. Global Command Logging
Log all bash commands executed across all projects:
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '\"\\(.tool_input.command) - \\(.tool_input.description // \\\"No description\\\")\"' >> ~/.claude/bash-command-log.txt"
          }
        ]
      }
    ]
  }
}
```

### 2. Global Security Policy
Block access to sensitive directories:
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Read|Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/scripts/security-check.sh \"$CLAUDE_TOOL_INPUT_FILE_PATH\""
          }
        ]
      }
    ]
  }
}
```

### 3. Global Desktop Notifications
Notify on important events:
```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"Claude Code session started in $PWD\" with title \"Claude Code\"'"
          }
        ]
      }
    ]
  }
}
```

### 4. Global Code Formatting
Auto-format code files on write:
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "if [[ \"$CLAUDE_TOOL_INPUT_FILE_PATH\" =~ \\.(ts|js|tsx|jsx)$ ]]; then prettier --write \"$CLAUDE_TOOL_INPUT_FILE_PATH\"; fi"
          }
        ]
      }
    ]
  }
}
```

### 5. Global Analytics and Metrics
Track Claude Code usage patterns:
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "echo \"$(date): $CLAUDE_TOOL_NAME used\" >> ~/.claude/usage-analytics.log"
          }
        ]
      }
    ]
  }
}
```

## Environment Variables Available

### Standard Hook Variables
- `$CLAUDE_TOOL_NAME`: Name of the tool being executed
- `$CLAUDE_TOOL_INPUT_*`: Tool input parameters (varies by tool)
- `$CLAUDE_PROJECT_DIR`: Current project directory
- `$PWD`: Current working directory

### Tool-Specific Variables
- **File Operations**: `$CLAUDE_TOOL_INPUT_FILE_PATH`
- **Bash Commands**: `$CLAUDE_TOOL_INPUT_COMMAND`
- **Edit Operations**: `$CLAUDE_TOOL_INPUT_OLD_STRING`, `$CLAUDE_TOOL_INPUT_NEW_STRING`

## Hook Execution Behavior

### Execution Model
- **Parallel Execution**: All matching hooks run simultaneously
- **Timeout**: Default 60-second timeout (configurable per command)
- **Deduplication**: Identical commands are automatically deduplicated
- **Exit Codes**: 
  - `0`: Success (continues execution)
  - `2`: Block action with stderr feedback to Claude
  - Other: Non-blocking error (logged but execution continues)

### Performance Considerations
- Hooks add latency to tool execution
- Long-running hooks can timeout
- Multiple hooks run in parallel, not sequentially
- Consider using background processes for heavy operations

## Security Considerations

### Critical Security Warnings
⚠️ **Global hooks run with full user permissions automatically**
⚠️ **Can access, modify, or delete any files your user account can access**
⚠️ **Execute arbitrary shell commands without user intervention**

### Security Best Practices

#### 1. Input Validation and Sanitization
```bash
# Always validate input parameters
if [[ -z "$CLAUDE_TOOL_INPUT_FILE_PATH" ]]; then
  echo "Error: No file path provided" >&2
  exit 1
fi

# Sanitize file paths
SAFE_PATH=$(realpath "$CLAUDE_TOOL_INPUT_FILE_PATH" 2>/dev/null)
if [[ $? -ne 0 ]]; then
  echo "Error: Invalid file path" >&2
  exit 1
fi
```

#### 2. Path Traversal Protection
```bash
# Block path traversal attempts
if [[ "$CLAUDE_TOOL_INPUT_FILE_PATH" =~ \.\. ]]; then
  echo "Error: Path traversal detected" >&2
  exit 2
fi

# Ensure operations stay within project directory
if [[ ! "$SAFE_PATH" =~ ^"$CLAUDE_PROJECT_DIR" ]]; then
  echo "Error: Operation outside project directory" >&2
  exit 2
fi
```

#### 3. Sensitive File Protection
```bash
# Block access to sensitive files
BLOCKED_PATTERNS=(".env" ".secret" "id_rsa" "*.key" "passwords.txt")
for pattern in "${BLOCKED_PATTERNS[@]}"; do
  if [[ "$CLAUDE_TOOL_INPUT_FILE_PATH" =~ $pattern ]]; then
    echo "Error: Access to sensitive file blocked" >&2
    exit 2
  fi
done
```

#### 4. Safe Shell Variable Usage
```bash
# Always quote variables to prevent command injection
command_to_run="some-tool --file=\"$CLAUDE_TOOL_INPUT_FILE_PATH\""

# Use arrays for complex commands
command_args=(
  "some-tool"
  "--file"
  "$CLAUDE_TOOL_INPUT_FILE_PATH"
  "--option"
  "$SAFE_OPTION"
)
"${command_args[@]}"
```

#### 5. Absolute Paths and Command Validation
```bash
# Use absolute paths for all executables
PRETTIER="/usr/local/bin/prettier"
if [[ ! -x "$PRETTIER" ]]; then
  echo "Error: Prettier not found at $PRETTIER" >&2
  exit 1
fi

# Validate commands exist before execution
if ! command -v jq >/dev/null 2>&1; then
  echo "Error: jq command not found" >&2
  exit 1
fi
```

## Best Practices

### 1. Hook Development
- Start with simple, single-purpose hooks
- Test hooks thoroughly in isolated environments
- Use exit codes appropriately (0 for success, 2 to block, other for errors)
- Implement proper error handling and logging
- Consider hook execution time and performance impact

### 2. Maintenance and Organization
- Document your hooks and their purposes
- Use version control for hook scripts
- Organize complex hooks in separate script files
- Regularly review and update hook configurations
- Monitor hook execution logs for issues

### 3. Team Collaboration
- Share useful global hook patterns with team members
- Use project-specific hooks for team-wide automation
- Document hook dependencies and requirements
- Consider hook compatibility across different environments

### 4. Debugging and Troubleshooting
- Add logging to hooks for debugging
- Use the `/hooks` command to manage hooks interactively
- Test hooks with various input scenarios
- Monitor hook execution times and optimize as needed

## Advanced Patterns

### 1. Conditional Hook Execution
```bash
#!/bin/bash
# Only run formatting in development environment
if [[ "$NODE_ENV" == "production" ]]; then
  echo "Skipping formatting in production" >&2
  exit 0
fi

# Continue with formatting logic
prettier --write "$CLAUDE_TOOL_INPUT_FILE_PATH"
```

### 2. Multi-Tool Hook Matching
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/scripts/universal-code-processor.sh"
          }
        ]
      }
    ]
  }
}
```

### 3. Context-Aware Hook Behavior
```bash
#!/bin/bash
# Different behavior based on file type
case "$CLAUDE_TOOL_INPUT_FILE_PATH" in
  *.ts|*.tsx)
    tsc --noEmit "$CLAUDE_TOOL_INPUT_FILE_PATH"
    ;;
  *.py)
    python -m py_compile "$CLAUDE_TOOL_INPUT_FILE_PATH"
    ;;
  *.go)
    go fmt "$CLAUDE_TOOL_INPUT_FILE_PATH"
    ;;
  *)
    echo "Unknown file type, skipping validation"
    ;;
esac
```

### 4. Hook Chaining and Dependencies
```bash
#!/bin/bash
# Chain multiple operations with proper error handling
set -e  # Exit on any error

echo "Running pre-commit checks..."

# Format code
prettier --write "$CLAUDE_TOOL_INPUT_FILE_PATH"
echo "✓ Code formatted"

# Run linting
eslint "$CLAUDE_TOOL_INPUT_FILE_PATH" --fix
echo "✓ Linting passed"

# Run type checking
tsc --noEmit "$CLAUDE_TOOL_INPUT_FILE_PATH"
echo "✓ Type checking passed"

echo "All pre-commit checks completed successfully"
```

## Common Use Cases for Global Hooks

### 1. Development Environment Automation
- Automatic code formatting on save
- Consistent linting across all projects
- TypeScript compilation validation
- Import organization and cleanup

### 2. Security and Compliance
- Sensitive file access blocking
- Credential detection and alerting
- Security policy enforcement
- Audit logging for compliance

### 3. Productivity Enhancement
- Desktop notifications for important events
- Automatic backup of modified files
- Progress tracking and analytics
- Custom development metrics

### 4. Quality Assurance
- Automated testing triggers
- Code coverage validation
- Performance impact analysis
- Documentation synchronization

### 5. Team Workflow Integration
- Git commit message standardization
- Issue tracker integration
- Slack or Teams notifications
- Deployment pipeline triggers

## Limitations and Considerations

### 1. Performance Impact
- Hooks add latency to tool execution
- Consider the cumulative impact of multiple hooks
- Long-running hooks may timeout (default 60 seconds)
- Network-dependent hooks can be unreliable

### 2. Environment Dependencies
- Hooks depend on system tools and utilities being available
- Path differences across operating systems
- Environment variable availability
- User permission variations

### 3. Error Handling Complexity
- Hooks failures can be difficult to debug
- Need proper error reporting mechanisms
- Consider graceful degradation when hooks fail
- Balance between strict enforcement and usability

### 4. Configuration Management
- Global settings affect all projects
- Changes require careful testing
- Version control considerations for hook scripts
- Team synchronization challenges

## Troubleshooting

### Common Issues and Solutions

#### 1. Hook Not Executing
- **Check matcher pattern**: Ensure it matches the intended tools
- **Verify command syntax**: Test the shell command independently
- **Review file permissions**: Ensure hook scripts are executable
- **Check timeout settings**: Long-running commands may be timing out

#### 2. Permission Denied Errors
- **File permissions**: Ensure proper read/write permissions
- **Script execution**: Make hook scripts executable (`chmod +x`)
- **Path access**: Verify access to target files and directories
- **Environment variables**: Check if required variables are set

#### 3. Hook Blocking Operations
- **Exit codes**: Ensure proper exit code usage (0 for success, 2 to block)
- **Error messages**: Provide clear error messages via stderr
- **Logic validation**: Review hook logic for unintended blocking
- **Testing**: Test hooks with various input scenarios

#### 4. Performance Issues
- **Timeout configuration**: Adjust timeout settings if needed
- **Command optimization**: Optimize slow shell commands
- **Background execution**: Consider background processing for heavy operations
- **Hook reduction**: Remove unnecessary hooks or combine them efficiently

## Future Considerations

### Planned Enhancements
- Enhanced debugging and monitoring tools
- Visual hook configuration interfaces
- Template marketplace for common hook patterns
- Integration with popular development tools

### Community Resources
- **Official Documentation**: https://docs.anthropic.com/en/docs/claude-code/hooks
- **Hook Examples Repository**: https://github.com/disler/claude-code-hooks-mastery
- **Community Discussions**: Claude Code community forums and Discord
- **Best Practices Articles**: Anthropic Engineering Blog

## Conclusion

Claude Code global hooks provide powerful automation capabilities that can significantly enhance development workflows, security, and productivity. When implemented thoughtfully with proper security considerations, they enable deterministic behavior across all projects while maintaining the flexibility and power of Claude Code's agentic development model.

Key success factors:
1. **Start Simple**: Begin with basic, single-purpose hooks
2. **Security First**: Always validate inputs and implement proper security measures
3. **Test Thoroughly**: Test hooks in isolated environments before global deployment
4. **Monitor Performance**: Be mindful of execution time and system impact
5. **Document Everything**: Maintain clear documentation of hook purposes and dependencies

Global hooks are most valuable when they automate repetitive, error-prone tasks while preserving developer control and system security.

## Sources and References

- **Official Hooks Reference**: https://docs.anthropic.com/en/docs/claude-code/hooks
- **Hooks Setup Guide**: https://docs.anthropic.com/en/docs/claude-code/hooks-guide
- **Claude Code Settings**: https://docs.anthropic.com/en/docs/claude-code/settings
- **Configuration Guide**: https://docs.anthropic.com/en/docs/claude-code/configuration
- **Security Documentation**: https://docs.anthropic.com/en/docs/claude-code/security
- **Community Examples**: https://github.com/disler/claude-code-hooks-mastery
- **Best Practices**: https://www.anthropic.com/engineering/claude-code-best-practices