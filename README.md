# Portland Maps MCP Server

A Model Context Protocol (MCP) server exposing PortlandMaps + ArcGIS-backed property and GIS datasets as typed tools with provenance. Provides AI assistants access to property information, zoning data, permit history, and other public records from [portlandmaps.com](https://www.portlandmaps.com).

**⚠️ DISCLAIMER:** This is an **unofficial** integration with Portland Maps. All users should visit [https://www.portlandmaps.com](https://www.portlandmaps.com) for official information. Please consider supporting and funding the City of Portland's mapping services and applications.

## Features

This MCP server enables large language models (LLMs) like Claude, ChatGPT, and others to:

- **Resolve Addresses**: Normalize addresses to stable identifiers (property_id/taxlot_id) with point geometry and confidence scores
- **Get Property Information**: Access comprehensive property details including ownership, lot size, and year built
- **Query Zoning**: Look up zoning designations, overlays, and plan districts
- **View Permit History**: Access information about building permits, land use reviews, and environmental reviews
- **Get Tax Information**: View property assessment and taxation data

All responses include proper attribution and disclaimers directing users to the official Portland Maps website. The `resolve_address` tool provides typed outputs with data provenance tracking (portlandmaps_api, arcgis_geocoder, internal_fallback).

## API Requirements & Authentication

### Portland Maps API
- **Suggest API**: Currently uses the public suggest endpoint which does not require authentication for basic queries
- **Full API Access**: For production use with higher rate limits, you may need to request an API key from [portlandmaps.com/development](https://www.portlandmaps.com/development/)
- **Rate Limiting**: Public endpoints have rate limits; monitor `X-Rate-Limit-*` headers in responses

### ArcGIS Geocoding
- **Oregon Geocoder**: Uses the public Oregon Address geocoder service (`navigator.state.or.us`) - no API key required for basic use
- **World Geocoder**: Falls back to ArcGIS World Geocoder (`geocode.arcgis.com`) - free for limited use, API key recommended for production
- **Production Use**: For high-volume geocoding, consider registering for an ArcGIS Developer account at [developers.arcgis.com](https://developers.arcgis.com)

**Note:** The current implementation works without API keys for demonstration and light use. For production deployments, obtain appropriate API keys and configure environment variables as needed.

## Installation

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn

### Install from Source

```bash
# Clone the repository
git clone https://github.com/erichowens/PortlandMapsMCP.git
cd PortlandMapsMCP

# Install dependencies
npm install

# Build the project
npm run build
```

### Install as Package

```bash
npm install -g portlandmaps-mcp
```

## Usage

### With Claude Desktop

Add the server to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "portlandmaps": {
      "command": "node",
      "args": ["/path/to/PortlandMapsMCP/build/index.js"]
    }
  }
}
```

Or if installed globally:

```json
{
  "mcpServers": {
    "portlandmaps": {
      "command": "portlandmaps-mcp"
    }
  }
}
```

### With Other MCP Clients

The server uses stdio transport and can be integrated with any MCP-compatible client:

```bash
node build/index.js
```

## Available Tools

### 1. `resolve_address`

Resolve a human-entered address or partial query into normalized address candidates with stable identifiers and geometry.

**Input:**
- `query` (string, required): Address or partial query (minimum 3 characters)
- `max_results` (integer, optional): Maximum candidates to return (1-25, default 10)
- `bbox` (array, optional): Bounding box filter as [minLon, minLat, maxLon, maxLat] in WGS84
- `include_raw` (boolean, optional): Include raw API response data

**Output:**
- Array of address candidates with:
  - `normalized_address`: Standardized address string
  - `score`: Confidence score (0-100)
  - `property_id`: Stable property identifier
  - `taxlot_id`: Tax lot identifier (if available)
  - `x_lon`, `y_lat`: Accurate WGS84 coordinates from ArcGIS Oregon geocoder
  - `source`: Data provenance (portlandmaps_api, arcgis_geocoder, internal_fallback)

**Geocoding:** Uses Oregon-specific ArcGIS geocoder for precise coordinates with automatic fallback to world geocoder if needed.

**Example:**
```
Query: "1234 SW Main St"
Max Results: 5
```

### 2. `get_property_info`

Get comprehensive property information.

**Input:**
- `address` (string): The property address

**Returns:** Property details, zoning info, and links to official records

### 3. `get_zoning_info`

Get zoning information for a property.

**Input:**
- `address` (string): The address to look up

**Returns:** Zoning designations and links to zoning maps

### 4. `get_permit_history`

Get permit history information.

**Input:**
- `address` (string): The address to look up

**Returns:** Information about accessing permit records

### 5. `get_tax_info`

Get property tax and assessment information.

**Input:**
- `address` (string): The address to look up

**Returns:** Links to tax and assessment information

## Example Queries

Here are some example queries you can make through an LLM using this MCP server:

- "What is the zoning for 1234 SE Hawthorne Blvd in Portland?"
- "Find permit history for 5678 N Mississippi Ave"
- "What are the property tax details for 910 SW Oak St?"
- "Search for properties at 1111 SW Broadway"
- "Get comprehensive information about 2222 NE Alberta St"

## Data Sources

This server integrates with:

- **Portland Maps API**: Property search and suggestions (`portlandmaps.com/api/suggest`)
- **Portland Maps OpenData**: Property details and GIS data
- **Portland Bureau of Planning and Sustainability**: Zoning information
- **ArcGIS Oregon Geocoder**: Precise coordinate geocoding (`navigator.state.or.us`)
- **ArcGIS World Geocoder**: Fallback geocoding service (`geocode.arcgis.com`)

### Geocoding Implementation

The `resolve_address` tool uses a multi-tiered approach for accurate coordinates:

1. **Primary**: Oregon-specific ArcGIS geocoder for high-accuracy Portland addresses
2. **Fallback**: ArcGIS World Geocoder if Oregon service is unavailable
3. **Last Resort**: Portland city center coordinates if all geocoding fails

This ensures addresses always have coordinates, with provenance tracking via the `source` field:
- `arcgis_geocoder`: Coordinates from ArcGIS services (highest accuracy)
- `portlandmaps_api`: Property data from Portland Maps without geocoding
- `internal_fallback`: Default coordinates when geocoding unavailable

All data is publicly available from the City of Portland and ESRI/ArcGIS services.

## Attribution & Disclaimer

This is an **unofficial** tool that accesses public data from Portland Maps. 

- **Official Website**: https://www.portlandmaps.com
- **Data Provider**: City of Portland, Oregon
- **Zoning Information**: https://www.portlandmaps.com/bps/zoning/
- **GIS Open Data**: https://gis-pdx.opendata.arcgis.com/

**Please support the City of Portland's mapping services:**
- Visit and use the official Portland Maps website
- Support funding for City of Portland technology services
- Provide feedback to the City to improve their services

## Development

### Build

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

This will watch for changes and rebuild automatically.

### Project Structure

```
PortlandMapsMCP/
├── src/
│   ├── index.ts       # Main MCP server implementation
│   └── client.ts      # Portland Maps API client
├── build/             # Compiled JavaScript (generated)
├── package.json       # Project configuration
├── tsconfig.json      # TypeScript configuration
└── README.md          # This file
```

## API Rate Limiting

The Portland Maps API may have rate limits. This server does not implement caching or rate limiting. Users should:

- Be mindful of request frequency
- Consider implementing caching for production use
- Contact the City of Portland for API access guidelines

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

Please ensure all contributions maintain proper attribution to Portland Maps and include appropriate disclaimers.

## License

MIT License - See [LICENSE](LICENSE) file for details

This software is independent of the City of Portland. The Portland Maps data is provided by the City of Portland and subject to their terms of use.

## Acknowledgments

- **City of Portland** for providing public access to property data
- **Portland Maps Team** for maintaining the excellent portlandmaps.com service
- **Model Context Protocol** community for the MCP standard

## Support

For issues with this MCP server:
- Open an issue on GitHub

For issues with Portland Maps data or services:
- Visit https://www.portlandmaps.com
- Contact the City of Portland

---

**Remember**: This is an unofficial tool. Always verify critical information on the official Portland Maps website.
