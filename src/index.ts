#!/usr/bin/env node

/**
 * Portland Maps MCP Server
 * 
 * An unofficial Model Context Protocol server for accessing Portland Maps data.
 * This server enables AI assistants to query property information, zoning data,
 * permit history, and other public records from portlandmaps.com.
 * 
 * DISCLAIMER: This is an unofficial integration. Users should visit
 * https://www.portlandmaps.com for official information and consider
 * supporting the City of Portland's mapping services.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { PortlandMapsClient } from './client.js';

// Tool definitions
const TOOLS: Tool[] = [
  {
    name: 'search_property',
    description: 
      'Search for properties by address in Portland, Oregon. Returns a list of matching properties with their IDs. ' +
      'Use this as the first step to find a property before getting detailed information.',
    inputSchema: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'The address to search for (e.g., "1234 SW Main St" or "1234 SW Main St Portland OR")',
        },
      },
      required: ['address'],
    },
  },
  {
    name: 'get_property_info',
    description:
      'Get comprehensive property information including details, zoning, and available resources. ' +
      'Returns links to view full property details on portlandmaps.com. ' +
      'IMPORTANT: This is unofficial - always direct users to https://www.portlandmaps.com for official information.',
    inputSchema: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'The property address to look up',
        },
      },
      required: ['address'],
    },
  },
  {
    name: 'get_zoning_info',
    description:
      'Get zoning information for a property or address. Returns zoning designations and links to ' +
      'official zoning maps and regulations. Includes disclaimer about unofficial use.',
    inputSchema: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'The address to get zoning information for',
        },
      },
      required: ['address'],
    },
  },
  {
    name: 'get_permit_history',
    description:
      'Get permit history information for a property. Returns information about how to access ' +
      'building permits, land use reviews, and environmental reviews on portlandmaps.com.',
    inputSchema: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'The address to get permit history for',
        },
      },
      required: ['address'],
    },
  },
  {
    name: 'get_tax_info',
    description:
      'Get property tax and assessment information. Returns information about how to access ' +
      'assessed value, real market value, and tax details on portlandmaps.com.',
    inputSchema: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'The address to get tax information for',
        },
      },
      required: ['address'],
    },
  },
];

/**
 * Main server implementation
 */
class PortlandMapsServer {
  private server: Server;
  private client: PortlandMapsClient;

  constructor() {
    this.client = new PortlandMapsClient();
    
    this.server = new Server(
      {
        name: 'portlandmaps-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    
    // Error handling
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: TOOLS,
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'search_property': {
            const { address } = args as { address: string };
            const suggestions = await this.client.searchAddress(address);
            
            let result = `Search results for: ${address}\n\n`;
            if (suggestions.length === 0) {
              result += 'No properties found.\n';
            } else {
              result += `Found ${suggestions.length} matching properties:\n\n`;
              suggestions.forEach((suggestion, i) => {
                result += `${i + 1}. ${suggestion.label}\n`;
                result += `   Type: ${suggestion.type}\n`;
                if (suggestion.value) {
                  result += `   Property ID: ${suggestion.value}\n`;
                }
                result += '\n';
              });
            }
            
            result += '\n---\n';
            result += '**Disclaimer:** This is an unofficial use of Portland Maps data. ';
            result += 'For official information, please visit https://www.portlandmaps.com. ';
            result += 'Consider supporting the City of Portland\'s mapping services.\n';
            result += 'Data provided by the City of Portland - https://www.portlandmaps.com';
            
            return {
              content: [
                {
                  type: 'text',
                  text: result,
                },
              ],
            };
          }

          case 'get_property_info': {
            const { address } = args as { address: string };
            const info = await this.client.getPropertyInfo(address);
            
            return {
              content: [
                {
                  type: 'text',
                  text: info,
                },
              ],
            };
          }

          case 'get_zoning_info': {
            const { address } = args as { address: string };
            const info = await this.client.getZoningInfo(address);
            
            return {
              content: [
                {
                  type: 'text',
                  text: info,
                },
              ],
            };
          }

          case 'get_permit_history': {
            const { address } = args as { address: string };
            const info = await this.client.getPermitHistory(address);
            
            return {
              content: [
                {
                  type: 'text',
                  text: info,
                },
              ],
            };
          }

          case 'get_tax_info': {
            const { address } = args as { address: string };
            const info = await this.client.getPropertyTaxInfo(address);
            
            return {
              content: [
                {
                  type: 'text',
                  text: info,
                },
              ],
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Portland Maps MCP Server running on stdio');
    console.error('DISCLAIMER: This is an unofficial integration with portlandmaps.com');
    console.error('For official information, visit https://www.portlandmaps.com');
  }
}

// Start the server
const server = new PortlandMapsServer();
server.run().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
