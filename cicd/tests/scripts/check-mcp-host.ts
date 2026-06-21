#!/usr/bin/env npx tsx
/**
 * Host-loop check: drive runMcpHost against the mock stdio MCP server with a STUB
 * ChatBackend (canned tool call → final answer). Proves the generic loop works with
 * no real model runtime. Run: npm run check:mcp-host
 */
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { runMcpHost } from '../src/mcp/host.js';
import type { ChatBackend, ChatRequest, ChatResponse } from '../src/mcp/chat-backend.js';

const here = dirname(fileURLToPath(import.meta.url));
const tsxBin = join(here, '..', 'node_modules', '.bin', 'tsx');
const mockServer = join(here, 'mock-mcp-server.ts');

/** Round 1 → call get_fact; round 2 → final answer. No network. */
class StubBackend implements ChatBackend {
  readonly name = 'stub';
  private round = 0;
  async chat(_req: ChatRequest): Promise<ChatResponse> {
    this.round++;
    const metrics = { inTokens: 10, outTokens: 5, totalDurationNs: 1e9, evalDurationNs: 1e9 };
    if (this.round === 1) {
      return {
        content: '',
        toolCalls: [{ name: 'get_fact', arguments: {} }],
        assistantMessage: { role: 'assistant', content: '', tool_calls: [{ function: { name: 'get_fact', arguments: {} } }] },
        metrics,
      };
    }
    return { content: 'The sky is blue (venue-3, id 5500).', toolCalls: [], metrics };
  }
}

const traj = await runMcpHost({
  backend: new StubBackend(),
  model: 'stub-model',
  prompt: 'Tell me the fact.',
  servers: [{ name: 'mock', command: tsxBin, args: [mockServer] }],
  numCtx: 2048,
  timeoutMs: 30000,
});

assert.equal(traj.error, undefined, `no host error (got: ${traj.error})`);
assert.equal(traj.supported, true, 'model supported');
assert.deepEqual(traj.toolNames, ['get_fact'], 'server tool listed + merged');
assert.equal(traj.toolCalls.length, 1, 'one tool call recorded');
assert.equal(traj.toolCalls[0].name, 'get_fact', 'called the real tool');
assert.equal(traj.toolResults.length, 1, 'one tool result recorded');
assert.equal(traj.toolResults[0].isError, false, 'tool call succeeded against the real server');
assert.ok(traj.toolResults[0].content.includes('5500'), 'captured the real server result');
assert.ok(traj.finalAnswer.includes('blue'), 'final answer captured');
assert.equal(traj.outTokens, 10, 'metrics summed across both rounds (5+5)');
assert.equal(traj.maxPromptTokens, 10, 'peak prompt tokens tracked');

process.stdout.write('\nmcp host: trajectory ok — supported, real tool call+result, final answer, metrics summed\n');
