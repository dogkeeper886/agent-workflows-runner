#!/usr/bin/env npx tsx
/**
 * test-mcp orchestration check (no real model needed):
 *  1. SIMPLE mode — stub backend + mock stdio MCP server → exit 0 (model used the tool).
 *  2. VERIFY-LIVE fail-closed — when the verifier cannot run, an otherwise-passing model
 *     must FAIL (exit 1), never a false green. Triggered deterministically here via a
 *     verify-server-name that matches no configured server (no agent spawn, no auth needed);
 *     the agent-unavailable trigger routes through the identical fail-closed verdict path.
 * Run: npm run check:mcp-test
 */
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import type { ChatBackend, ChatRequest, ChatResponse } from '../src/mcp/chat-backend.js';
import { runMcpTest } from '../src/mcp/test-mcp.js';

const here = dirname(fileURLToPath(import.meta.url));
const tsxBin = join(here, '..', 'node_modules', '.bin', 'tsx');
const mockServer = join(here, 'mock-mcp-server.ts');
const servers = [{ name: 'mcp', command: tsxBin, args: [mockServer] }];

/** Round 1 → call get_fact; round 2 → final answer. Fresh per run. */
class Stub implements ChatBackend {
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

// 1) Simple mode — structural check passes ⇒ exit 0.
const simpleCode = await runMcpTest({
  models: ['stub'], prompt: 'Tell me the fact.', servers, backend: new Stub(),
  numCtx: 2048, judge: false, timeoutMs: 30000,
});
assert.equal(simpleCode, 0, 'simple mode: model used the tool + produced an answer ⇒ pass');

// 2) verify-live that cannot run (no server matches --verify-server-name) ⇒ FAIL CLOSED.
const verifyCode = await runMcpTest({
  models: ['stub'], prompt: 'Tell me the fact.', servers, backend: new Stub(),
  numCtx: 2048, judge: false, verifyLive: true, verifyAllow: ['get_fact'],
  verifyServerName: 'no-such-server', timeoutMs: 30000,
});
assert.equal(verifyCode, 1, 'verify-live that cannot run FAILS closed (never a false green)');

process.stdout.write('\ntest-mcp: simple mode passes; verify-live fails closed when it cannot run\n');
