# Claude Code Assets

This repository contains assets for the [Claude Agents Installer](https://github.com/phyter1/claude-agents-installer) CLI tool.

## Contents

- **agents/**: Specialized AI agents for various development tasks
- **docs/**: Comprehensive documentation for popular JavaScript/TypeScript libraries
- **reference_code/**: Example projects and boilerplate code

## Manifest

The `manifest.json` file contains metadata about all available assets. It can be regenerated using:

```bash
bun create-manifest.js
```

## Usage

These assets are fetched by the Claude Agents Installer CLI. To install the CLI:

```bash
curl -fsSL https://raw.githubusercontent.com/phyter1/claude-agents-installer/main/scripts/install.sh | bash
```

## Contributing

To add new assets:

1. Add files to the appropriate directory (`agents/`, `docs/`, or `reference_code/`)
2. Run `bun create-manifest.js` to update the manifest
3. Submit a pull request

## License

MIT