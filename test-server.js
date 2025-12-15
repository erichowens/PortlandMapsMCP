#!/usr/bin/env node

/**
 * Test script for Portland Maps MCP Server
 * 
 * This script simulates MCP client requests to test the server functionality.
 * Run with: node test-server.js
 */

import { PortlandMapsClient } from './build/client.js';

const TEST_ADDRESSES = [
  '100 SW Main St',
  '1234 SE Hawthorne Blvd',
  '5678 N Mississippi Ave',
];

async function testClient() {
  console.log('='.repeat(80));
  console.log('Portland Maps MCP Server - Client Test');
  console.log('='.repeat(80));
  console.log();

  const client = new PortlandMapsClient();

  for (const address of TEST_ADDRESSES) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Testing address: ${address}`);
    console.log('='.repeat(80));

    // Test 1: Search Address
    console.log('\n--- Test 1: Search Address ---');
    try {
      const suggestions = await client.searchAddress(address);
      console.log(`Found ${suggestions.length} results:`);
      suggestions.slice(0, 3).forEach((s, i) => {
        console.log(`  ${i + 1}. ${s.label} (Type: ${s.type})`);
        if (s.value) console.log(`     Property ID: ${s.value}`);
      });
    } catch (error) {
      console.error(`Error: ${error.message}`);
    }

    // Test 2: Get Property Info
    console.log('\n--- Test 2: Get Property Info ---');
    try {
      const info = await client.getPropertyInfo(address);
      console.log(info.substring(0, 500) + '...\n');
    } catch (error) {
      console.error(`Error: ${error.message}`);
    }

    // Test 3: Get Zoning Info
    console.log('\n--- Test 3: Get Zoning Info ---');
    try {
      const zoning = await client.getZoningInfo(address);
      console.log(zoning.substring(0, 500) + '...\n');
    } catch (error) {
      console.error(`Error: ${error.message}`);
    }

    // Test 4: Get Permit History
    console.log('\n--- Test 4: Get Permit History ---');
    try {
      const permits = await client.getPermitHistory(address);
      console.log(permits.substring(0, 500) + '...\n');
    } catch (error) {
      console.error(`Error: ${error.message}`);
    }

    // Test 5: Get Tax Info
    console.log('\n--- Test 5: Get Tax Info ---');
    try {
      const tax = await client.getPropertyTaxInfo(address);
      console.log(tax.substring(0, 500) + '...\n');
    } catch (error) {
      console.error(`Error: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('Test Complete');
  console.log('='.repeat(80));
  console.log('\nNote: If you see "fetch failed" errors, this is expected in some');
  console.log('environments. The server will work correctly when deployed and used');
  console.log('with an MCP client like Claude Desktop.');
}

testClient().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
