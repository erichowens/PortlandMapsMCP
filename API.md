# API Reference

This document describes the Portland Maps MCP Server tools and their usage.

## Overview

The Portland Maps MCP Server exposes 5 tools for querying property information from portlandmaps.com. All tools return text responses with links to official sources and include attribution disclaimers.

## Tools

### 1. search_property

Search for properties by address in Portland, Oregon.

**Purpose**: Find properties and get their property IDs for more detailed queries.

**Input Schema**:
```json
{
  "address": "string (required)"
}
```

**Input Example**:
```json
{
  "address": "1234 SW Main St Portland OR"
}
```

**Output**: 
- List of matching properties
- Property IDs
- Property types (Address, Taxlot, etc.)
- Attribution and disclaimer

**Use Case**: First step when you need to find a specific property before getting detailed information.

---

### 2. get_property_info

Get comprehensive property information including details, zoning, and available resources.

**Purpose**: Retrieve overview of property information with links to official detailed pages.

**Input Schema**:
```json
{
  "address": "string (required)"
}
```

**Input Example**:
```json
{
  "address": "1234 SE Hawthorne Blvd"
}
```

**Output**:
- Search results for the address
- Property IDs
- Links to full property details on portlandmaps.com
- Available information types (owner, lot size, zoning, permits, etc.)
- Links to additional resources
- Attribution and disclaimer

**Use Case**: Getting a comprehensive overview of what information is available for a property.

---

### 3. get_zoning_info

Get zoning information for a property or address.

**Purpose**: Query zoning designations and get links to zoning maps and regulations.

**Input Schema**:
```json
{
  "address": "string (required)"
}
```

**Input Example**:
```json
{
  "address": "5678 N Mississippi Ave"
}
```

**Output**:
- Search results for the address
- Property IDs
- Links to property detail pages
- Links to zoning maps (https://www.portlandmaps.com/bps/zoning/)
- Links to zoning code information
- Attribution and disclaimer

**Use Case**: Determining zoning restrictions, permitted uses, and regulations for a property.

---

### 4. get_permit_history

Get permit history information for a property.

**Purpose**: Find information about building permits, land use reviews, and environmental reviews.

**Input Schema**:
```json
{
  "address": "string (required)"
}
```

**Input Example**:
```json
{
  "address": "910 SW Oak St"
}
```

**Output**:
- Best matching property
- Link to property details page with permits tab
- Types of permits available (building, land use, environmental, historic)
- Link to permit search tool
- Attribution and disclaimer

**Use Case**: Checking construction history, land use changes, or permit requirements.

---

### 5. get_tax_info

Get property tax and assessment information.

**Purpose**: Access property assessment and taxation data.

**Input Schema**:
```json
{
  "address": "string (required)"
}
```

**Input Example**:
```json
{
  "address": "2222 NE Alberta St"
}
```

**Output**:
- Best matching property
- Link to property details page with assessment & taxation tab
- Types of tax information available (assessed value, real market value, tax amount)
- Link to Multnomah County assessment information
- Attribution and disclaimer

**Use Case**: Researching property values, tax amounts, or assessment history.

---

## Response Format

All tool responses follow this format:

```
[Main Content]
- Property information
- Search results
- Links to official sources

---
**Disclaimer:** This is an unofficial use of Portland Maps data. 
For official information, please visit https://www.portlandmaps.com. 
Consider supporting the City of Portland's mapping services.
Data provided by the City of Portland - https://www.portlandmaps.com
```

## Address Formats

The tools accept various address formats:

**Recommended**:
- `"1234 SE Hawthorne Blvd"`
- `"1234 SE Hawthorne Blvd Portland OR"`
- `"100 SW Main St"`

**Also Accepted**:
- `"1234 Hawthorne"` (may return multiple results)
- `"1234 SE Hawthorne"` (without street type)
- Partial addresses (use for searching)

**Tips**:
- Include street direction (NE, SE, SW, NW) for better accuracy
- Include street type (St, Ave, Blvd) for better accuracy
- More specific = better results
- Search returns multiple matches if ambiguous

## Error Handling

All tools handle errors gracefully:

- **No results found**: Returns a message indicating no matches
- **API errors**: Returns error message with details
- **Invalid input**: Returns validation error

## Rate Limiting

⚠️ **Important**: The Portland Maps API may have rate limits.

- This server does not implement rate limiting
- Be mindful of request frequency
- Consider implementing caching for production use
- Contact City of Portland for API guidelines

## Data Sources

### Primary APIs

1. **Portland Maps Suggest API**
   - Endpoint: `https://www.portlandmaps.com/api/suggest/`
   - Purpose: Address search and property lookup
   - Returns: Property suggestions with IDs

2. **Portland Maps Detail Pages**
   - Format: `https://www.portlandmaps.com/detail.cfm?propertyid={id}`
   - Purpose: Full property information
   - Contains: All property details, zoning, permits, taxes, etc.

3. **Portland Maps OpenData API**
   - Endpoint: `https://www.portlandmaps.com/od/rest/services/COP_OpenData_Property/MapServer`
   - Purpose: GIS and spatial data
   - Format: GeoJSON, JSON

### Reference URLs

- **Zoning Maps**: https://www.portlandmaps.com/bps/zoning/
- **Zoning Code**: https://www.portland.gov/bps/zoning
- **Permit Search**: https://www.portlandmaps.com/permits/
- **GIS Open Data**: https://gis-pdx.opendata.arcgis.com/
- **Property Tax**: https://multco.us/assessment-taxation

## Attribution Requirements

Every response includes:

1. **Disclaimer** that this is unofficial
2. **Link** to official Portland Maps website
3. **Attribution** to City of Portland as data provider
4. **Encouragement** to support City services

This is required by the problem statement:
> "This is an unofficial use of Portland maps so frequent efforts must be made toward redirecting to the original site, supporting and funding any applications and distributions of Portland maps"

## Usage Examples

See [EXAMPLES.md](EXAMPLES.md) for detailed usage examples with an LLM client.

## TypeScript Types

The server uses these TypeScript interfaces:

```typescript
interface PropertySuggestion {
  label: string;
  value: string;
  type: string;
  city?: string;
  county?: string;
}

interface PropertyDetails {
  address: string;
  propertyId: string;
  taxlot?: string;
  owner?: string;
  zoning?: string;
  zoningDescription?: string;
  landUse?: string;
  yearBuilt?: string;
  squareFeet?: string;
  acreage?: string;
  taxMapNumber?: string;
  propertyClass?: string;
}

interface ZoningInfo {
  zone: string;
  description: string;
  overlay?: string;
  planDistrict?: string;
  additionalInfo?: string;
}
```

## Implementation Details

- **Protocol**: Model Context Protocol (MCP) 1.0
- **Transport**: stdio (standard input/output)
- **Message Format**: JSON-RPC 2.0
- **Language**: TypeScript/Node.js
- **SDK**: @modelcontextprotocol/sdk

## Limitations

1. **No Direct Data Access**: Server provides links to official sources rather than scraping data
2. **Search Only**: Complex queries require multiple tool calls
3. **No Caching**: Each request hits the API
4. **No Authentication**: Uses public API endpoints only
5. **Read-Only**: Cannot modify or submit data

## Future Enhancements

Potential improvements:

- Caching layer for frequently accessed properties
- More detailed data extraction from OpenData APIs
- Batch property lookups
- GIS coordinate queries
- Neighborhood/district searches
- Comparison tools
- Historical data access

## Support

For API questions:
- Portland Maps: https://www.portlandmaps.com
- City of Portland: https://www.portland.gov

For MCP Server issues:
- GitHub: https://github.com/erichowens/PortlandMapsMCP
