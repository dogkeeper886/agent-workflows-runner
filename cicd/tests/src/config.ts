/**
 * Project configuration for the test framework.
 * 
 * Customize this file for your project's needs.
 */

import 'dotenv/config'; // load cicd/tests/.env into process.env before any value below is read

/**
 * Available test suites - extend this array for your project.
 * Examples: ['build', 'integration', 'e2e'] or ['build', 'runtime', 'inference', 'models']
 */
export const SUITES: string[] = ['build', 'integration', 'e2e'];
export type Suite = string;

/**
 * Pick a subset of environment variables by NAME → { name: value } map.
 * Forwards a server's credentials (e.g. "API_URL,API_KEY") without hardcoding the
 * values — they come from the environment / CI secrets.
 */
export function pickEnv(names: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const n of names.split(',').map((s) => s.trim()).filter(Boolean)) {
    const v = process.env[n];
    if (v !== undefined) out[n] = v;
  }
  return out;
}

/**
 * Project configuration.
 */
export const CONFIG = {
  // Project identification
  projectName: 'my-project',
  
  // Session file prefix for log collection
  sessionPrefix: 'test-session',
  
  // Default timeouts (in milliseconds)
  defaultTimeout: 60000,
  defaultStepTimeout: 30000,
  
  // Agent Judge — an opt-in second opinion. The default verdict is the simple
  // (deterministic, model-free) judge; set JUDGE_MODE=dual to also run this.
  judge: {
    // 'simple' (default) = deterministic checks only. 'dual' = also run the agent judge.
    mode: process.env.JUDGE_MODE || 'simple',
    // Command that launches the ACP agent the judge talks to. Empty → the bundled
    // Claude ACP agent (@agentclientprotocol/claude-agent-acp), keyless via the
    // agent's own auth (~/.claude / CLAUDE_CODE_OAUTH_TOKEN). Set to any other ACP
    // agent's command to swap models/vendors — config, not code. Model selection
    // lives in the agent, not here.
    agent: process.env.JUDGE_AGENT || '',
    timeout: 300000,
    stdoutLimit: 1000,
    stderrLimit: 500,
    logsLimit: 3000,
  },
  
  // Log collection settings
  logs: {
    cleanupAge: 24 * 60 * 60 * 1000, // 24 hours
    maxBuffer: 50 * 1024 * 1024, // 50MB
  },

  // MCP client settings (for projects using mcp-client.ts)
  mcp: {
    // Legacy: the single-tool client (mcp-client.ts) reads MCP_SERVER_COMMAND directly.
    serverCommand: 'node dist/mcpServer.js',

    // test-mcp (target + verifier paths): which real stdio MCP server to drive, and
    // which model runtime drives it. Generic defaults — point them at your server/runtime
    // via .env (see .env.example). Credentials are forwarded by NAME via MCP_ENV.
    command: process.env.MCP_COMMAND || 'node dist/mcpServer.js',
    args: (process.env.MCP_ARGS || '').split(' ').filter(Boolean),
    cwd: process.env.MCP_CWD || undefined,
    prompt: process.env.MCP_PROMPT || 'List the available items.',
    env: pickEnv(process.env.MCP_ENV || ''),
    backend: process.env.MCP_BACKEND || 'ollama', // selects the ChatBackend (model runtime)
    host: process.env.OLLAMA_HOST || 'http://localhost:11434', // ollama backend host
  },
};

/**
 * Error patterns to detect in logs.
 * The Simple Judge will fail tests if any of these patterns are found.
 * 
 * Customize for your project's specific error indicators.
 */
export const ERROR_PATTERNS: RegExp[] = [
  /\berror\b/i,
  /\bfailed\b/i,
  /\bexception\b/i,
  /\bpanic\b/i,
  /segmentation fault/i,
  /out of memory/i,
  /OOM/,
];

/**
 * Patterns that indicate a test should NOT be failed.
 * Use these to exclude false positives from ERROR_PATTERNS.
 */
export const ERROR_EXCLUSIONS: RegExp[] = [
  /error.*handled/i,
  /expected.*error/i,
];
