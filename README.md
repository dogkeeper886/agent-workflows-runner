# agent-workflows-runner

The test runner in the `agent-*` family — `agent-workflows` (the workflows), **`agent-workflows-runner`** (this repo, the runner they drive), and `agent-studio` (the flagship).

A reusable, YAML-driven dual-judge test framework for CI/CD pipelines. Fast and deterministic by default (the simple judge), with an opt-in LLM judge as a second opinion — reached through the Anthropic SDK, so any Anthropic-compatible endpoint (hosted or local) is just configuration.

## Project Goal

This test framework is the runner half of the `agent-*` family: the executable that `agent-workflows` drives. Extracted from production MCP server projects, it provides a **reusable testing foundation** any project can adopt.

### Why This Framework?

Traditional testing often relies solely on exit codes, which can miss subtle failures where a process completes "successfully" but produces incorrect results. This framework addresses that gap by combining:

- **Deterministic Verification**: Fast, reliable checks for exit codes, expected patterns, and error detection
- **Semantic Analysis**: LLM-powered evaluation that understands whether test output actually meets human-readable criteria

### Design Philosophy

The framework is built around three core principles:

1. **Reusability**: Install into any project with a single command. The YAML-driven approach means tests are configuration, not code—making them accessible to developers and non-developers alike.

2. **Comprehensive Logging**: Every test execution produces detailed, timestamped logs with test markers for precise extraction. This enables effective debugging, auditing, and tracking of test history.

3. **Proper Test Design**: Tests are organized by suite (build, integration, e2e), support dependencies between test cases, and provide clear pass/fail criteria that both humans and LLMs can evaluate.

### Key Technologies

| Technology | Purpose |
|------------|---------|
| **TypeScript** | Strict type safety and modern async/await patterns |
| **YAML** | Declarative test case definitions |
| **Anthropic SDK** | Reaches any Anthropic-compatible endpoint (hosted or local) for the opt-in semantic judge |
| **Docker Compose** | Log collection with marker-based extraction |
| **GitHub Actions** | CI/CD pipeline orchestration |

### Notable Features

- **Dual-Judge System**: Fast deterministic judge by default; opt in the semantic LLM judge (`LLM_JUDGE_MODE=dual`) and both must pass
- **YAML-Driven Tests**: Tests defined as configuration, not code
- **Tag-Based Filtering**: Filter tests by feature tag via `--tag` for per-feature CI workflows
- **Variable Capture**: Extract values from step output and pass to later steps via `{{variable}}`
- **Environment Variable Substitution**: Variables fall back to `process.env` for CI-friendly patterns
- **Dependency Resolution**: Tests can depend on other tests passing first
- **Log Collection with Markers**: Precise extraction of logs per test from Docker streams
- **MCP Client**: Test MCP server tools with configurable server command
- **Claude Skills**: AI-assisted test authoring via `/ci-testcase`, `/ci-run`, `/add-tool`
- **Per-Feature CI Workflows**: Composable GitHub Actions with reusable test runner
- **Installable Template**: Add to any project via `/install` or `make install`
- **Flexible Output**: Console (colored) and JSON formats for CI consumption

## Architecture

### Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              TEST EXECUTION FLOW                            │
└─────────────────────────────────────────────────────────────────────────────┘

     ┌──────────────┐
     │  YAML Files  │   testcases/build/*.yml
     │  (Test Defs) │   testcases/integration/*.yml
     └──────┬───────┘   testcases/e2e/*.yml
            │
            ▼
  ┌─────────────────────┐
  │     TestLoader      │  • Parse YAML test definitions
  │     (loader.ts)     │  • Validate required fields
  └─────────┬───────────┘  • Resolve dependencies
            │              • Filter by suite or tag
            ▼
  ┌─────────────────────┐
  │   Dependency Sort   │  • Topological sort by dependencies
  │                     │  • Secondary sort by priority
  └─────────┬───────────┘  • Auto-include cross-suite deps
            │
            ▼
  ┌─────────────────────┐     ┌──────────────────┐
  │    TestExecutor     │────▶│   LogCollector   │
  │   (executor.ts)     │     │ (log-collector)  │
  └─────────┬───────────┘     └────────┬─────────┘
            │                          │
            │  • Run shell commands    │  • docker compose logs
            │  • Capture stdout/stderr │  • Test markers
            │  • Check patterns        │  • Per-test extraction
            │  • Substitute variables  │
            │    (captured + env vars) │
            ▼                          ▼
     ┌─────────────────────────────────────┐
     │            TestResult[]             │
     │  (exit codes, logs, timing, etc.)   │
     └─────────────────┬───────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                           DUAL-JUDGE VERIFICATION                            │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│    ┌─────────────────────────┐         ┌─────────────────────────┐          │
│    │      Simple Judge       │         │       LLM Judge         │          │
│    │    (simple-judge.ts)    │         │    (llm-judge.ts)       │          │
│    ├─────────────────────────┤         ├─────────────────────────┤          │
│    │ Exit code == 0          │         │ Semantic analysis       │          │
│    │ Expected patterns       │         │ Criteria evaluation     │          │
│    │ No rejected patterns    │         │ Context understanding   │          │
│    │ No error patterns       │         │ Evidence extraction     │          │
│    ├─────────────────────────┤         ├─────────────────────────┤          │
│    │ Speed: Milliseconds     │         │ Speed: Seconds          │          │
│    │ Mode: Deterministic     │         │ Mode: AI-powered        │          │
│    └───────────┬─────────────┘         └───────────┬─────────────┘          │
│                │                                   │                         │
│                │         ┌───────────┐             │                         │
│                └────────▶│  BOTH     │◀────────────┘                         │
│                          │  MUST     │                                       │
│                          │  PASS     │                                       │
│                          └─────┬─────┘                                       │
│                                │                                             │
└────────────────────────────────┼─────────────────────────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │       Reporters        │
                    ├────────────────────────┤
                    │ ConsoleReporter        │  Colored terminal output
                    │ JsonReporter           │  Structured JSON files
                    └────────────┬───────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │    Final Results       │
                    ├────────────────────────┤
                    │ results/               │
                    │ ├── summary.json       │
                    │ ├── TC-*.json          │
                    │ └── TC-*.log           │
                    └────────────────────────┘
```

### Why Dual-Judge?

Traditional tests only check exit codes. A process can exit with code 0 but produce incorrect results:

| Scenario | Exit Code | Simple Judge | LLM Judge |
|----------|-----------|--------------|-----------|
| Command fails | 1 | Catches | Catches |
| "Error" in output | 0 | Catches | Catches |
| Wrong output format | 0 | Misses | Catches |
| Incomplete results | 0 | Misses | Catches |
| Semantic mismatch | 0 | Misses | Catches |

The LLM judge reads the criteria from YAML and evaluates whether the actual output semantically satisfies the requirements—catching failures that pattern matching alone would miss.

**The LLM judge is opt-in.** By default a run uses the simple judge only: fast, deterministic, and model-free. Set `LLM_JUDGE_MODE=dual` to also run the LLM judge — then both must pass (the verification above). A configured-but-unreachable endpoint degrades cleanly, falling back to the simple judge with a notice.

## Quick Start

### Recommended: Agent-Driven Install

In your project directory, tell Claude Code:

> Install the test framework from /path/to/agent-workflows-runner

Or use the slash command:

```
/install /path/to/agent-workflows-runner
```

The agent will detect your project type (MCP server, Docker, etc.), ask configuration questions, and install only what you need with values pre-configured.

### Alternative: Manual Install

```bash
cd /path/to/agent-workflows-runner
make install TARGET=/path/to/your/project NAME=your-project
cd /path/to/your/project/cicd/tests
npm install
# Then edit config.ts manually
```

Additional Makefile commands:

```bash
make help                                    # Show usage
make clean TARGET=/path/to/project           # Remove framework from project
```

## Configuration

Edit `cicd/tests/src/config.ts` in your project:

```typescript
// Extend with custom suite names for your project
export const SUITES: string[] = ['build', 'integration', 'e2e'];

export const CONFIG = {
  projectName: 'your-project',
  
  // LLM Judge — opt-in second opinion (default verdict is the simple judge)
  llm: {
    mode: process.env.LLM_JUDGE_MODE || 'simple',          // 'simple' | 'dual'
    baseUrl: process.env.LLM_JUDGE_URL || undefined,        // unset → hosted Anthropic API
    apiKey: process.env.ANTHROPIC_API_KEY || 'local',
    model: process.env.LLM_JUDGE_MODEL || 'claude-haiku-4-5-20251001',
    timeout: 300000,
    stdoutLimit: 1000,
    stderrLimit: 500,
    logsLimit: 3000,
  },
};

// Project-specific error patterns
export const ERROR_PATTERNS: RegExp[] = [
  /\berror\b/i,
  /\bfailed\b/i,
  // Add your patterns...
];
```

### Environment Variables

For CI environments, configure the judge without editing source:

| Variable | Purpose | Default |
|----------|---------|---------|
| `LLM_JUDGE_MODE` | `simple` (deterministic only) or `dual` (opt in the LLM judge) | `simple` |
| `LLM_JUDGE_MODEL` | Model for judging | `claude-haiku-4-5-20251001` |
| `LLM_JUDGE_URL` | Base URL of an Anthropic-compatible endpoint (unset → hosted Anthropic API) | unset |
| `ANTHROPIC_API_KEY` | API key for the hosted API (a placeholder works for a local endpoint that ignores auth) | `local` |

**Tip:** To judge against a local Anthropic-compatible model server, set `LLM_JUDGE_URL` to its address. Keeping the judge on a separate endpoint from any model your project itself tests avoids resource contention.

## Running Tests

```bash
cd your-project/cicd/tests

npm test                    # Run all tests (simple judge — fast, no model)
npm test -- --suite build   # Run specific suite
npm test -- --id TC-001     # Run specific test
npm test -- --tag auth      # Run tests tagged 'auth'
npm test -- --dry-run       # Preview what would run
npm run list                # List available tests
npm run list -- --tag auth  # List tests by tag

# Opt in the LLM judge (env-configured, not a flag)
LLM_JUDGE_MODE=dual npm test
LLM_JUDGE_MODE=dual LLM_JUDGE_URL=http://host:11434 LLM_JUDGE_MODEL=gemma3:12b npm test
```

## CI Workflow Patterns

The template includes composable GitHub Actions workflows:

```
.github/workflows/
├── build.yml                # Standalone build step
├── test-run.yml             # Reusable test runner (supports --tag and --suite)
├── test-feature-example.yml # Example per-feature workflow (~25 lines)
├── ci.yml                   # Full pipeline: build -> tests in parallel
├── test-pipeline.yml        # Legacy suite-based pipeline
└── test-suite.yml           # Legacy reusable suite runner
```

### Per-Feature Pattern (Recommended)

Each feature gets a thin workflow file that delegates to `test-run.yml`:

```yaml
# .github/workflows/test-auth.yml
name: "Test: Auth"
on:
  workflow_dispatch:
    inputs:
      judge_mode:
        type: choice
        options: ["simple", "dual"]
  workflow_call:
    inputs:
      judge_mode:
        type: string
jobs:
  test:
    uses: ./.github/workflows/test-run.yml
    with:
      tag: auth
      judge_mode: ${{ inputs.judge_mode }}
```

**Adding a new feature test:**
1. Tag your test cases: `tags: [my-feature]`
2. Copy `test-feature-example.yml` to `test-my-feature.yml`
3. Change the `tag` value
4. Add as a job in `ci.yml`

Configure the judge with GitHub repository variables and secrets (`Settings > Variables/Secrets > Actions`): `LLM_JUDGE_MODE`, `LLM_JUDGE_MODEL`, `LLM_JUDGE_URL`, and the `ANTHROPIC_API_KEY` secret.

## MCP Testing

For MCP server projects, `mcp-client.ts` spawns your server and calls tools:

```bash
# Configure your server command
export MCP_SERVER_COMMAND="node dist/mcpServer.js"

# Test a tool directly
npx tsx cicd/tests/src/mcp-client.ts get_venues '{}'

# Use in YAML test cases
```

```yaml
steps:
  - name: Query venues
    command: npx tsx cicd/tests/src/mcp-client.ts get_venues '{}'
    expectPatterns:
      - "totalCount"
    rejectPatterns:
      - "isError"
```

Requires `@modelcontextprotocol/sdk` (install in your project: `npm install @modelcontextprotocol/sdk`).

## Claude Skills

AI-assisted workflows via Claude Code slash commands:

| Skill | Purpose |
|-------|---------|
| `/ci-testcase` | Generate YAML test cases from requirements |
| `/ci-run` | Execute tests with guided output |
| `/add-tool` | Add new MCP tools following standard patterns |
| `/install` | Install framework into a project |
| `/review-docs-privacy` | Review for security and documentation quality |

These are installed to `.claude/skills/` by the install flow.

## Writing Test Cases

Create YAML files in `cicd/tests/testcases/<suite>/`:

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

### Tags

Tags enable per-feature filtering and CI workflow splitting:

```yaml
tags: [auth, api]          # Feature tags
tags: [build, compile]     # Suite-aligned tags
tags: [smoke]              # Test category tags
```

### Variable Capture

Steps can capture values from JSON output and pass them to later steps using `{{variable}}` substitution. Variables resolve from captured step output first, then fall back to `process.env`:

```yaml
id: TC-INT-002
name: Create and verify resource
suite: integration
goal: Verify resource creation and retrieval
timeout: 30000
dependencies: []
tags: [api, resources]

steps:
  - name: Create resource
    command: curl -s -X POST http://localhost:3000/api/resources -d '{"name":"test"}'
    expectPatterns:
      - "id"
    capture:
      resourceId: "id"

  - name: Verify resource exists
    command: curl -s http://localhost:3000/api/resources/{{resourceId}}
    expectPatterns:
      - "test"

criteria: |
  Resource is created and can be retrieved by ID.
```

**Capture paths** support dot-notation and array find syntax:

| Path | Resolves to |
|------|------------|
| `id` | `response.id` |
| `data.name` | `response.data.name` |
| `items[0].id` | First element's `id` |
| `data[name=foo].id` | First element in `data` where `name === "foo"` |
| `$[type=user].email` | Root array find where `type === "user"` |

MCP tool responses (double-encoded JSON in `content[0].text`) are automatically unwrapped before capture.

## Directory Structure

```
your-project/
├── CLAUDE.md                    # AI agent guidance
├── .claude/
│   ├── skills/                  # AI-assisted workflows
│   │   ├── ci-testcase/         # /ci-testcase — generate test cases
│   │   ├── ci-run/              # /ci-run — execute tests
│   │   └── add-tool/            # /add-tool — add MCP tools
│   └── rules/                   # Context-aware rules
│       ├── test-yaml-format.md  # YAML schema reference
│       └── workflow-patterns.md # CI workflow design patterns
├── cicd/
│   ├── tests/
│   │   ├── src/
│   │   │   ├── config.ts        # ← Configure here
│   │   │   ├── cli.ts
│   │   │   ├── types.ts
│   │   │   ├── loader.ts
│   │   │   ├── executor.ts
│   │   │   ├── mcp-client.ts    # MCP tool client (optional)
│   │   │   ├── log-collector.ts
│   │   │   ├── judge/
│   │   │   └── reporter/
│   │   ├── testcases/
│   │   │   ├── build/           # ← Your tests
│   │   │   ├── integration/
│   │   │   └── e2e/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── scripts/
│   │   └── format-results.sh
│   └── results/
└── .github/workflows/
    ├── build.yml                # Standalone build
    ├── test-run.yml             # Reusable test runner
    ├── test-feature-example.yml # Per-feature template
    ├── ci.yml                   # Full pipeline orchestrator
    ├── test-pipeline.yml        # Legacy pipeline
    └── test-suite.yml           # Legacy suite runner
```

## License

MIT
