# Example Configuration for Claude Desktop

This file shows how to configure the Portland Maps MCP Server with Claude Desktop.

## Configuration Location

### macOS
`~/Library/Application Support/Claude/claude_desktop_config.json`

### Windows
`%APPDATA%\Claude\claude_desktop_config.json`

### Linux
`~/.config/Claude/claude_desktop_config.json`

## Configuration File

```json
{
  "mcpServers": {
    "portlandmaps": {
      "command": "node",
      "args": [
        "/absolute/path/to/PortlandMapsMCP/build/index.js"
      ]
    }
  }
}
```

## If Installed Globally via npm

```json
{
  "mcpServers": {
    "portlandmaps": {
      "command": "portlandmaps-mcp-server"
    }
  }
}
```

## Multiple MCP Servers

You can configure multiple MCP servers:

```json
{
  "mcpServers": {
    "portlandmaps": {
      "command": "node",
      "args": [
        "/absolute/path/to/PortlandMapsMCP/build/index.js"
      ]
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/username/Documents"
      ]
    }
  }
}
```

## Verifying Installation

After configuring, restart Claude Desktop. You should see the Portland Maps tools available when you start a conversation.

Try asking Claude:
- "What tools do you have available?"
- "Search for properties at 1234 SE Hawthorne Blvd Portland"
- "What is the zoning for 100 SW Main St?"

## Troubleshooting

If the server doesn't appear:
1. Check that the path in the config file is correct and absolute
2. Verify the build directory exists: `/path/to/PortlandMapsMCP/build/`
3. Check Claude Desktop logs for errors
4. Restart Claude Desktop after making config changes
5. Ensure Node.js is in your PATH
