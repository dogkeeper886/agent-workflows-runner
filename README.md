# agent-workflows-runner

**The runner half of [`agent-workflows`](https://github.com/dogkeeper886/agent-workflows)** — a YAML-driven, dual-judge test framework: **a worked example you port into your own repo**, not a package you install unchanged.

`agent-workflows` authors the commands and test docs; this repo runs the tests they describe. Fast and deterministic by default (the simple judge), with an opt-in agent judge as a second opinion — an Agent Client Protocol client that runs **keyless on a Claude Code subscription**, so no Console API key is needed and swapping the model or vendor is just configuration.

![The agent family: agent-workflows authors commands and test docs; this runner executes them; agent-studio wraps both into a product](docs/diagrams/png/01-agent-family.png)

## Contents

- [Why this framework](#why-this-framework)
- [How the dual judge works](#how-the-dual-judge-works)
- [The ACP agent judge](#the-acp-agent-judge)
- [Quick start — port it in](#quick-start--port-it-in)
- [Configuration](#configuration)
- [Running tests](#running-tests)
- [Writing test cases](#writing-test-cases)
- [CI workflow patterns](#ci-workflow-patterns)
- [MCP testing](#mcp-testing)
- [Skills and commands](#skills-and-commands)
- [Directory structure](#directory-structure)
- [The agent family](#the-agent-family)
- [License](#license)

## Why this framework

Testing on exit codes alone misses the failures that matter: a process exits `0` but produces the wrong output. This runner pairs a fast deterministic judge with an opt-in semantic one, so a test passes only when the result is *actually* right.

Because the semantic judge brings a reasoning model to the verdict, the framework is more than a static-script checker for one product:

| Use case | What it covers | Status |
|----------|----------------|--------|
| **Static / deterministic testing** | exit codes, expected patterns, error detection — the simple judge | **shipping** |
| **AI-produced content testing & audit** | the agent judge grades generated output against human-readable criteria, not just pass/fail commands | **shipping** |
| **Agent-driven testing via MCP** | the judge attaches MCP tools so an agent pulls in external resources to gather what a test needs | **roadmap** — where this is heading, not yet built |

> The MCP-agent direction is not implemented. Today, `mcp-client.ts` lets a test call *your* MCP server's tools (see [MCP testing](#mcp-testing)) — that is "test your MCP server," not "the judge uses MCP."

## How the dual judge works

![Dual-judge verdict: the simple judge always runs; the agent judge runs only in dual mode, and then both must pass](docs/diagrams/png/02-dual-judge.png)

The **simple judge** always runs — deterministic, model-free, milliseconds. The **agent judge** runs only when you opt in with `JUDGE_MODE=dual`, and then **both must pass**. An unreachable or unauthenticated agent degrades cleanly, falling back to the simple judge with a notice.

| Scenario | Exit code | Simple judge | Agent judge |
|----------|-----------|--------------|-----------|
| Command fails | 1 | catches | catches |
| "Error" in output | 0 | catches | catches |
| Wrong output format | 0 | misses | catches |
| Incomplete results | 0 | misses | catches |
| Semantic mismatch | 0 | misses | catches |

## The ACP agent judge

The [Agent Client Protocol](https://agentclientprotocol.com) (ACP) is an open, vendor-neutral standard — created by [Zed Industries](https://zed.dev) — for driving coding agents over a JSON-RPC stdio link. The agent judge is an ACP **client**: it spawns a configured agent as a child process, runs one prompt turn per test (`initialize → session/new → session/prompt`), and reads back a JSON verdict — `{ pass, reason, evidence }`. It only evaluates — it refuses every tool-permission request the agent makes.

![The agent judge as an ACP client: it spawns an ACP agent over stdio; the agent authenticates keyless and drives a model, returning a JSON verdict; JUDGE_AGENT swaps the agent](docs/diagrams/png/05-acp-agent-judge.png)

Routing the verdict through ACP is what makes the headline claims true:

- **Keyless.** Authentication is the agent's job, not the judge's. The bundled Claude agent runs on your Claude Code subscription (`~/.claude` locally, `CLAUDE_CODE_OAUTH_TOKEN` in CI) — no Console API key.
- **Swap = config.** The model lives inside the agent. Point `JUDGE_AGENT` at any other ACP agent to change model or vendor without touching runner code.

If the agent can't be reached or isn't authenticated, the judge detects it up front and falls back to the simple judge with a notice.

## Quick start — port it in

This repo is a worked example. The `make install` target copies the runner — source, example test cases, scripts, CI workflows, and Claude tooling — into your repo and stamps in your project name. You then adapt it; every project's tests differ.

![Porting the runner: make install copies the runner into your repo and stamps in your name; then you adapt config and write your own test cases](docs/diagrams/png/04-make-install.png)

```bash
cd /path/to/agent-workflows-runner
make install TARGET=/path/to/your/project NAME=your-project

cd /path/to/your/project/cicd/tests
npm install
npm test                 # run all tests with the simple judge
```

Then edit `cicd/tests/src/config.ts` for your project (see [Configuration](#configuration)) and write your own cases (see [Writing test cases](#writing-test-cases)).

Other Makefile targets:

```bash
make help                              # show usage
make clean TARGET=/path/to/project     # remove the framework from a project
make diagrams                          # re-render docs/diagrams/*.svg → png/
```

**Agent-driven alternative.** In your project, tell Claude Code `/install /path/to/agent-workflows-runner` (or "Install the test framework from …"). The agent detects your project type, asks a few configuration questions, and installs only what you need with values pre-filled.

## Configuration

Edit `cicd/tests/src/config.ts` in your project:

```typescript
export const SUITES: string[] = ['build', 'integration', 'e2e'];

export const CONFIG = {
  projectName: 'your-project',

  // Agent judge — opt-in second opinion (default verdict is the simple judge)
  judge: {
    mode: process.env.JUDGE_MODE || 'simple',   // 'simple' | 'dual'
    agent: process.env.JUDGE_AGENT || '',        // '' → bundled Claude ACP agent (keyless); set to another ACP agent's command to swap model/vendor
    timeout: 300000,
    // …plus stdout/stderr/log truncation limits — see config.ts
  },
};

// Project-specific error patterns
export const ERROR_PATTERNS: RegExp[] = [/\berror\b/i, /\bfailed\b/i];
```

For CI, configure the judge through the environment instead of editing source:

| Variable | Purpose | Default |
|----------|---------|---------|
| `JUDGE_MODE` | `simple` (deterministic only) or `dual` (opt in the agent judge) | `simple` |
| `JUDGE_AGENT` | command that launches the ACP agent the judge drives; unset uses the bundled Claude ACP agent, keyless on a Claude Code subscription. Set it to another ACP agent to swap model/vendor — config, not code | unset |
| `CLAUDE_CODE_OAUTH_TOKEN` | authenticates the bundled Claude agent on a GitHub-hosted CI runner; not needed on a self-hosted runner that's logged into Claude Code (`~/.claude`) | unset |

> **Keyless by design.** The agent judge authenticates through the agent — your Claude Code login — not a Console API key, and the model lives in the agent, so swapping it (`JUDGE_AGENT`) is config, not code.

## Running tests

```bash
cd your-project/cicd/tests

npm test                    # all tests (simple judge — fast, no model)
npm test -- --suite build   # one suite
npm test -- --id TC-001     # one test
npm test -- --tag auth      # tests tagged 'auth'
npm test -- --dry-run       # preview what would run
npm run list                # list available tests

# opt in the agent judge (env-configured, not a flag)
JUDGE_MODE=dual npm test                              # keyless via your Claude Code login (~/.claude)
JUDGE_AGENT="my-acp-agent" JUDGE_MODE=dual npm test   # drive a different ACP agent (model/vendor)
```

## Writing test cases

A test case is YAML — configuration, not code. Drop files into `cicd/tests/testcases/<suite>/`.

![Anatomy of a YAML test case: identity fields, ordered steps with expect/reject patterns, and human-readable criteria for the agent judge](docs/diagrams/png/03-testcase-anatomy.png)

```yaml
id: TC-BUILD-001
name: Project Build
suite: build
priority: 1
timeout: 60000
dependencies: []
tags: [build, compile]

steps:
  - name: Install dependencies
    command: npm install
    timeout: 60000

  - name: Run build
    command: npm run build
    expectPatterns:
      - "Successfully compiled"
    rejectPatterns:
      - "error"

criteria: |
  Verify the project builds without errors.
```

`expectPatterns` must appear in the step output; `rejectPatterns` must not; `criteria` is the human-readable pass condition the agent judge evaluates the run against.

### Tags

Tags drive per-feature filtering and CI splitting (`--tag`, `tag:` in workflows):

```yaml
tags: [auth, api]          # feature tags
tags: [build, compile]     # suite-aligned tags
tags: [smoke]              # category tags
```

### Variable capture

A step can capture a value from JSON output and pass it to a later step via `{{variable}}`. Variables resolve from captured output first, then fall back to `process.env` — a CI-friendly pattern.

```yaml
steps:
  - name: Create resource
    command: curl -s -X POST http://localhost:3000/api/resources -d '{"name":"test"}'
    expectPatterns: ["id"]
    capture:
      resourceId: "id"

  - name: Verify resource exists
    command: curl -s http://localhost:3000/api/resources/{{resourceId}}
    expectPatterns: ["test"]
```

Capture paths support dot-notation and array-find syntax:

| Path | Resolves to |
|------|-------------|
| `id` | `response.id` |
| `data.name` | `response.data.name` |
| `items[0].id` | first element's `id` |
| `data[name=foo].id` | first element in `data` where `name === "foo"` |
| `$[type=user].email` | root-array find where `type === "user"` |

MCP tool responses (double-encoded JSON in `content[0].text`) are unwrapped automatically before capture.

## CI workflow patterns

The framework ships composable GitHub Actions. The recommended pattern: each feature gets a thin workflow that delegates to the reusable `test-run.yml`.

```
.github/workflows/
├── build.yml                # standalone build step
├── test-run.yml             # reusable test runner (supports --tag and --suite)
├── test-feature-example.yml # example per-feature workflow (~25 lines)
└── ci.yml                   # full pipeline: build → tests in parallel
```

```yaml
# .github/workflows/test-auth.yml
name: "Test: Auth"
on:
  workflow_dispatch:
    inputs:
      judge_mode: { type: choice, options: ["simple", "dual"] }
  workflow_call:
    inputs:
      judge_mode: { type: string }
jobs:
  test:
    uses: ./.github/workflows/test-run.yml
    with:
      tag: auth
      judge_mode: ${{ inputs.judge_mode }}
```

**To add a feature test:** tag your cases (`tags: [my-feature]`), copy `test-feature-example.yml` to `test-my-feature.yml`, change the `tag`, and add it as a job in `ci.yml`. Configure the judge through repository Variables (`JUDGE_MODE`, and `JUDGE_AGENT` to swap agents); on a GitHub-hosted runner, add the `CLAUDE_CODE_OAUTH_TOKEN` secret so the agent authenticates keyless — a self-hosted runner logged into Claude Code needs no secret.

## MCP testing

For MCP server projects, `mcp-client.ts` spawns your server and calls a tool, so you can assert on the result in a test step:

```bash
export MCP_SERVER_COMMAND="node dist/mcpServer.js"
npx tsx cicd/tests/src/mcp-client.ts get_venues '{}'
```

```yaml
steps:
  - name: Query venues
    command: npx tsx cicd/tests/src/mcp-client.ts get_venues '{}'
    expectPatterns: ["totalCount"]
    rejectPatterns: ["isError"]
```

Requires `@modelcontextprotocol/sdk` in your project (`npm install @modelcontextprotocol/sdk`).

## Skills and commands

The `.claude/` tooling splits in two — what gets **shipped into your project**, and what stays here as **maintainer tooling** for working on this repo.

**Shipped into your project by `/install`** — AI-assisted test authoring:

| Skill | Purpose |
|-------|---------|
| `/install` | install the framework into a project (the entry point; ships the three below) |
| `/ci-testcase` | generate YAML test cases from requirements |
| `/ci-run` | execute tests with guided output |
| `/add-tool` | add new MCP tools following standard patterns |
| `agent-runner-flow` | integration-test design rules — one connected, self-contained end-to-end flow |

**Maintainer tooling in this repo** — the dev-workflow this repo is built with (see `CLAUDE.md` §5–6):

| Artifact | Role |
|----------|------|
| `dev-workflow/dw-*` commands | story → plan → tasks → implement → PR → merge pipeline |
| `qa-workflow/qw-*` commands | test-doc planning, authoring, binding, drift |
| `reviewing-phrasing` / `reviewing-typography` | human-read doc review — the words / the look |
| `reviewing-artifacts` | agent-read artifact review (commands, skills, docs) |
| `review-docs-privacy` | security + documentation-quality review |

## Directory structure

What `make install` lays down in your project:

```
your-project/
├── CLAUDE.md                    # AI agent guidance
├── .claude/
│   ├── skills/                  # /ci-testcase, /ci-run, /add-tool, agent-runner-flow
│   └── rules/                   # YAML schema + CI workflow patterns
├── cicd/
│   ├── tests/
│   │   ├── src/
│   │   │   ├── config.ts        # ← configure here
│   │   │   ├── cli.ts  loader.ts  executor.ts  types.ts
│   │   │   ├── mcp-client.ts    # MCP tool client (optional)
│   │   │   ├── log-collector.ts
│   │   │   ├── judge/           # simple-judge.ts + agent-judge.ts
│   │   │   └── reporter/        # console + JSON
│   │   ├── testcases/
│   │   │   ├── build/           # ← your tests
│   │   │   ├── integration/
│   │   │   └── e2e/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── scripts/
│   │   └── format-results.sh
│   └── results/
└── .github/workflows/           # build.yml, test-run.yml, ci.yml, …
```

## The agent family

This runner is one of three repos (see the diagram up top):

| Repo | Role | Status |
|------|------|--------|
| [**agent-workflows**](https://github.com/dogkeeper886/agent-workflows) | dev-workflow + qa-workflow commands and the test docs they author | shipped |
| **agent-workflows-runner** (this repo) | executes the test scripts the qa-workflow docs map to — a dual-judge framework (fast checks + opt-in agent judge) | shipped |
| **agent-studio** | local-first web GUI over the workflows + runner; closes the Dev → QA → PM loop | working name (currently `ai-qa-studio`), planning |

## License

MIT
