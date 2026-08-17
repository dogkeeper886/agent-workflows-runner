---
paths:
  - ".claude/commands/**/*.md"
  - ".claude/skills/**/*.md"
  - "plugins/**/*.md"
---

# project-profile

The one place this project declares its specifics. The shipped commands and skills state
their *intent* and resolve any project-specific value — a path, an ID scheme, a label, an
integration, a format, an audience — **from this file**, instead of hardcoding it.
Customize a workflow by editing this file, not the units.

**How a unit uses it.** Where a command or skill would otherwise bake in a value, it
points at the matching section here (e.g. "create the *plan* label — see project-profile →
Labels"). The values below are this runner's real values — the agent-workflows
test-framework runner, which owns the whole QA lifecycle: planning, authoring, binding,
and the audit. Change a line here and every unit follows.

**What belongs here vs. not.** This file is for **declarative** customization — a value or
a list. A whole **procedure** (how this runner binds a doc to its YAML, runs the suite, and
audits the pair) is *not* a value; it lives in the `qa-*` commands and the `cicd/` runner,
never crammed into a general unit. Lists → here; procedures → a command. This is the rules
files' "what this owns vs. what it hands off" boundary, made concrete.

---

## Paths

- stories dir: `docs/stories/`
- tests dir: `docs/tests/`
- diagrams dir: `docs/diagrams/` (SVG source) + `docs/diagrams/png/` (rendered)
- story format contract: `docs/stories/README.md`
- test format contract: `docs/tests/README.md`

## ID schemes

- story id: `STORY-XXX` (zero-padded sequential, e.g. `STORY-001`)
- scenario id: `TS-NN`
- case id: `TC-NN`
- executable (cicd YAML) id: `TC-<SUITE>-XXX` — `TC-BUILD-XXX`, `TC-INTEGRATION-XXX`, `TC-E2E-XXX`,
  one per suite dir under `cicd/tests/testcases/<suite>/`
- title prefixes: `[STORY-XXX] Plan` · `[#<spec>] Test Plan` · `[STORY-XXX] <task>`

## Front-matter & format contract (test docs)

- test-doc filename: `TS-NN-<slug>.md` in the tests dir
- front-matter fields: `id, title, namespace, spec, plan, status`
- namespace: `test-framework`
- spec anchor: the issue number the intent came from — recorded unhashed, traced by a human
- default status: `green` (the audit's other state is `unbound`, maintained by `qa-review-bind`)

## Connected flow

How this project instantiates the portable rules in the plugin's `rules/connected-flow.md`.

Not instantiated. This repo's own suite is a single standalone case (`TC-INT-MCP-001`, which
runs against a bundled mock server) plus the standalone examples under `templates/testcases/`,
so there is no hand-off, no fixture chain and no teardown stage yet. The rules bind the first
executable that creates a fixture; this section is filled in then.

## This project's binding + run layer

The `qa-*` commands state the intent; these are the concrete commands behind it here:

- bind a case to its executable: `qa-bind` → sets each TC's `Script:` to a
  `cicd/tests/testcases/**/*.yml`
- audit a binding — the gate: `qa-review-bind` → `npm --prefix cicd/tests run audit-bind` (the
  `Script:` resolves and the doc's step count matches the YAML's, else `unbound`)
- run the suite (the `qa-run` phase — a phase, not a slash command): `npm test`
- scaffold a doc from a YAML: `npm --prefix cicd/tests run port-yaml -- <yaml>`
- reuse index: **none** — reuse is an optional enhancement; it is not present here.
