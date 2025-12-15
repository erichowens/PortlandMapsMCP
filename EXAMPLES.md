# Example Queries

This document provides example queries you can use with the Portland Maps MCP Server through Claude or other LLM assistants.

## Basic Property Search

```
Search for properties at 1234 SE Hawthorne Blvd Portland
```

```
Find the property at 100 SW Main St
```

```
Look up 5678 N Mississippi Ave Portland OR
```

## Comprehensive Property Information

```
Get property information for 1234 SE Hawthorne Blvd
```

```
Tell me about the property at 100 SW Main St Portland
```

```
What information is available for 5678 N Mississippi Ave?
```

## Zoning Queries

```
What is the zoning for 1234 SE Hawthorne Blvd?
```

```
What zoning restrictions apply to 100 SW Main St Portland?
```

```
Get zoning information for 5678 N Mississippi Ave
```

```
What are the zoning regulations for properties on SE Division St?
```

## Permit History

```
Find permit history for 1234 SE Hawthorne Blvd
```

```
What permits have been issued for 100 SW Main St?
```

```
Has 5678 N Mississippi Ave had any recent building permits?
```

```
Show me the permit history for 910 SW Oak St
```

## Property Tax Information

```
What are the property taxes for 1234 SE Hawthorne Blvd?
```

```
Get tax assessment information for 100 SW Main St
```

```
What is the assessed value of 5678 N Mississippi Ave?
```

## Complex Queries

```
I'm interested in buying a property at 1234 SE Hawthorne. Can you tell me about its zoning, any recent permits, and property tax information?
```

```
Compare the zoning between 100 SW Main St and 200 SW Main St
```

```
What properties near 1234 SE Hawthorne Blvd have similar zoning?
```

```
I need to know if I can open a restaurant at 5678 N Mississippi Ave. What's the zoning there?
```

## Expected Responses

All responses will include:
- Relevant property information or search results
- Direct links to official Portland Maps pages
- A disclaimer noting this is unofficial data
- Attribution to the City of Portland
- Encouragement to verify on the official website

## Important Notes

1. **Addresses**: Include street number, street name, and optionally city/state
2. **Specificity**: More specific addresses get better results
3. **Official Verification**: Always verify critical information on portlandmaps.com
4. **Response Format**: Responses include links to official sources for detailed information
5. **Disclaimer**: Every response includes attribution to Portland Maps

## Example Response Format

When you query "What is the zoning for 1234 SE Hawthorne Blvd?", you might get:

```
Zoning Information Search Results for: 1234 SE Hawthorne Blvd

Found 3 matching locations:

1. 1234 SE HAWTHORNE BLVD
   Type: Address
   Property ID: R123456
   View details: https://www.portlandmaps.com/detail.cfm?propertyid=R123456

[Additional matches...]

To view zoning regulations and maps, visit:
https://www.portlandmaps.com/bps/zoning/

For zoning code details, see:
https://www.portland.gov/bps/zoning

---
**Disclaimer:** This is an unofficial use of Portland Maps data. 
For official information, please visit https://www.portlandmaps.com.
Consider supporting the City of Portland's mapping services.
Data provided by the City of Portland - https://www.portlandmaps.com
```

## Tips for Best Results

1. **Start with search**: Use `search_property` first to find the exact property
2. **Use full addresses**: Include street number, name, and direction (NE, SE, SW, NW)
3. **Follow the links**: The responses include direct links to official information
4. **Ask follow-up questions**: You can ask for more specific information based on initial results
5. **Verify critical info**: Always check portlandmaps.com for official, up-to-date information
