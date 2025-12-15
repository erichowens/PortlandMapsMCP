# Developer Guide

This guide is for developers who want to understand, modify, or extend the Portland Maps MCP Server.

## Architecture

### Overview

```
┌─────────────────┐
│  MCP Client     │  (Claude Desktop, etc.)
│  (LLM Host)     │
└────────┬────────┘
         │ stdio (JSON-RPC)
         │
┌────────▼────────┐
│  MCP Server     │  src/index.ts
│  (This project) │
└────────┬────────┘
         │
┌────────▼────────┐
│  API Client     │  src/client.ts
│                 │
└────────┬────────┘
         │ HTTPS
         │
┌────────▼────────┐
│  Portland Maps  │
│  Public APIs    │
└─────────────────┘
```

### Components

1. **src/index.ts** - Main MCP server
   - Implements MCP protocol
   - Defines and handles tools
   - Manages stdio transport
   - Error handling

2. **src/client.ts** - Portland Maps API client
   - Encapsulates API calls
   - Formats responses
   - Adds disclaimers
   - Error handling

## Project Structure

```
PortlandMapsMCP/
├── src/                    # Source code
│   ├── index.ts           # Main MCP server
│   └── client.ts          # Portland Maps client
├── build/                 # Compiled JavaScript (generated)
├── node_modules/          # Dependencies (generated)
├── package.json           # Project configuration
├── package-lock.json      # Dependency lock file
├── tsconfig.json          # TypeScript configuration
├── .gitignore            # Git ignore rules
├── README.md             # Main documentation
├── API.md                # API reference
├── CONFIGURATION.md      # Setup guide
├── EXAMPLES.md           # Usage examples
├── DEVELOPER.md          # This file
└── test-server.js        # Test script
```

## Development Setup

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn
- TypeScript knowledge
- Understanding of async/await

### Installation

```bash
# Clone repository
git clone https://github.com/erichowens/PortlandMapsMCP.git
cd PortlandMapsMCP

# Install dependencies
npm install

# Build project
npm run build
```

### Development Workflow

```bash
# Watch mode (auto-rebuild on changes)
npm run dev

# Manual build
npm run build

# Run server
npm start

# Test (in another terminal)
node test-server.js
```

## Code Structure

### MCP Server (src/index.ts)

The main server file implements the Model Context Protocol:

```typescript
class PortlandMapsServer {
  private server: Server;           // MCP SDK server
  private client: PortlandMapsClient; // API client

  constructor() {
    // Initialize server with metadata
    this.server = new Server({
      name: 'portlandmaps-mcp-server',
      version: '1.0.0',
    }, {
      capabilities: { tools: {} }
    });

    // Setup request handlers
    this.setupHandlers();
  }

  private setupHandlers() {
    // Handle ListTools request
    this.server.setRequestHandler(ListToolsRequestSchema, ...);
    
    // Handle CallTool request
    this.server.setRequestHandler(CallToolRequestSchema, ...);
  }

  async run() {
    // Connect to stdio transport
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}
```

Key concepts:

1. **Tools**: Each tool is defined with name, description, and input schema
2. **Handlers**: Server responds to ListTools and CallTool requests
3. **Transport**: Uses stdio for communication with MCP client
4. **Error Handling**: Catches and formats errors appropriately

### API Client (src/client.ts)

The client encapsulates Portland Maps API interactions:

```typescript
export class PortlandMapsClient {
  private readonly baseUrl = 'https://www.portlandmaps.com';
  private readonly apiUrl = `${this.baseUrl}/api`;
  
  private addDisclaimer(data: string): string {
    // Adds required disclaimer to all responses
  }

  async searchAddress(address: string): Promise<PropertySuggestion[]> {
    // Calls Portland Maps suggest API
  }

  async getPropertyInfo(address: string): Promise<string> {
    // Returns formatted property information
  }

  // Additional methods...
}
```

Key concepts:

1. **Encapsulation**: All API calls go through this client
2. **Disclaimers**: Added to every response
3. **Error Handling**: Wraps API errors with context
4. **Formatting**: Converts API responses to readable text

## Adding New Tools

To add a new tool:

1. **Define the tool** in TOOLS array:

```typescript
{
  name: 'my_new_tool',
  description: 'What the tool does',
  inputSchema: {
    type: 'object',
    properties: {
      param1: {
        type: 'string',
        description: 'Parameter description',
      },
    },
    required: ['param1'],
  },
}
```

2. **Add method to client** (if needed):

```typescript
async myNewMethod(param1: string): Promise<string> {
  // Implementation
  const result = await this.apiCall(param1);
  return this.addDisclaimer(result);
}
```

3. **Handle in CallTool**:

```typescript
case 'my_new_tool': {
  const { param1 } = args as { param1: string };
  const result = await this.client.myNewMethod(param1);
  return {
    content: [{ type: 'text', text: result }],
  };
}
```

## Portland Maps APIs

### Suggest API

**Endpoint**: `https://www.portlandmaps.com/api/suggest/`

**Parameters**:
- `query`: Search term
- `city`: Filter by city (e.g., "Portland")
- `county`: Filter by county
- `count`: Maximum results (default 10)

**Response**:
```json
{
  "candidates": [
    {
      "label": "1234 SE HAWTHORNE BLVD",
      "value": "R123456",
      "type": "Address",
      "city": "Portland",
      "county": "Multnomah"
    }
  ]
}
```

### Property Details

**URL Pattern**: `https://www.portlandmaps.com/detail.cfm?propertyid={id}`

Note: This is a web page, not an API. The MCP server provides links rather than scraping.

### OpenData API

**Base URL**: `https://www.portlandmaps.com/od/rest/services/COP_OpenData_Property/MapServer`

This is an ArcGIS REST API with various endpoints for spatial queries.

## Testing

### Manual Testing

1. **Start the server**:
```bash
npm start
```

2. **Test with MCP Inspector** (if available):
```bash
npx @modelcontextprotocol/inspector node build/index.js
```

3. **Test with Claude Desktop**:
   - Configure in claude_desktop_config.json
   - Restart Claude Desktop
   - Test queries

### Automated Testing

The `test-server.js` script tests the client directly:

```bash
node test-server.js
```

Note: Network tests may fail in restricted environments.

### Integration Testing

Test with actual MCP client:

1. Configure the server in your MCP client
2. Send test requests
3. Verify responses include disclaimers
4. Check links are valid

## Error Handling

The server handles errors at multiple levels:

### Client Errors

```typescript
try {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return await response.json();
} catch (error) {
  throw new Error(`Failed to ...: ${error.message}`);
}
```

### Server Errors

```typescript
try {
  // Handle tool call
  return { content: [...] };
} catch (error) {
  return {
    content: [{ type: 'text', text: `Error: ${error.message}` }],
    isError: true,
  };
}
```

### Process Errors

```typescript
this.server.onerror = (error) => {
  console.error('[MCP Error]', error);
};

process.on('SIGINT', async () => {
  await this.server.close();
  process.exit(0);
});
```

## Best Practices

### Adding Disclaimers

**Always** add disclaimers to tool responses:

```typescript
private addDisclaimer(data: string): string {
  const disclaimer = 
    '\n\n---\n' +
    '**Disclaimer:** This is an unofficial use of Portland Maps data. ' +
    'For official information, please visit https://www.portlandmaps.com. ' +
    'Consider supporting the City of Portland\'s mapping services.\n' +
    'Data provided by the City of Portland - https://www.portlandmaps.com';
  return data + disclaimer;
}
```

### Providing Links

**Always** include links to official sources:

```typescript
const url = `https://www.portlandmaps.com/detail.cfm?propertyid=${id}`;
result += `View details: ${url}\n`;
```

### Error Messages

Make error messages helpful:

```typescript
throw new Error(`Failed to search address: ${error.message}`);
// Not: throw error;
```

### Input Validation

Validate inputs when possible:

```typescript
if (!address || address.trim().length === 0) {
  throw new Error('Address is required');
}
```

## Debugging

### Enable Verbose Logging

Add debug output:

```typescript
console.error('Searching for:', address);
console.error('API response:', JSON.stringify(data, null, 2));
```

### Check stdio Transport

The server uses stdio, so regular console.log won't work for user output. Use console.error for debugging:

```typescript
console.error('Debug message'); // ✅ Goes to stderr
console.log('User message');    // ❌ Goes to stdout (protocol)
```

### Test Client Directly

Test the client without the MCP layer:

```javascript
import { PortlandMapsClient } from './build/client.js';

const client = new PortlandMapsClient();
const results = await client.searchAddress('1234 Main St');
console.log(results);
```

## Deployment

### Local Development

```bash
npm run dev    # Watch mode
npm start      # Run once
```

### Production Build

```bash
npm run build
npm start
```

### Publishing to npm

```bash
npm version patch  # or minor, major
npm publish
```

### Distribution

Users can install via:

```bash
npm install -g portlandmaps-mcp-server
```

## Contributing

### Code Style

- Use TypeScript
- Follow existing patterns
- Add JSDoc comments
- Use async/await
- Handle errors gracefully

### Pull Requests

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit PR with description

### Documentation

Update documentation when adding features:
- README.md - User-facing changes
- API.md - New tools or parameters
- EXAMPLES.md - Usage examples
- This file - Implementation details

## Resources

### MCP Resources

- [MCP Specification](https://modelcontextprotocol.io/)
- [MCP SDK TypeScript](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Examples](https://github.com/modelcontextprotocol/servers)

### Portland Maps Resources

- [Portland Maps](https://www.portlandmaps.com)
- [Portland Maps Help](https://www.portland.gov/ppd/portlandmaps-help-guides)
- [Portland GIS Open Data](https://gis-pdx.opendata.arcgis.com/)
- [Portland Maps Development](https://www.portlandmaps.com/development/)

### TypeScript/Node.js

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [npm Documentation](https://docs.npmjs.com/)

## License

MIT License - See LICENSE file.

## Support

- Issues: GitHub Issues
- Discussions: GitHub Discussions
- Contact: See README.md
