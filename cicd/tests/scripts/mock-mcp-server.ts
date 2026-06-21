#!/usr/bin/env npx tsx
/**
 * Minimal stdio MCP server for host verification (no network, no real backend).
 * Exposes one read-only tool, `get_fact`, returning a fixed payload. Uses the
 * low-level Server API (stable across SDK versions).
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server({ name: 'mock', version: '1.0.0' }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    { name: 'get_fact', description: 'Return the known fact.', inputSchema: { type: 'object', properties: {}, required: [] } },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  if (req.params.name === 'get_fact') {
    return { content: [{ type: 'text', text: 'The sky is blue. Venue venue-3 has id 5500.' }] };
  }
  return { content: [{ type: 'text', text: `unknown tool: ${req.params.name}` }], isError: true };
});

await server.connect(new StdioServerTransport());
