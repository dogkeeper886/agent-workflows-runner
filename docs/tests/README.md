# `docs/tests/` — the test-doc format

Each test is a **readable markdown document** that lives here, close to the spec it verifies.
The markdown owns **why / what** (intent); the bound `cicd/` YAML owns **how it runs**
(execution). `qa-bind` links them and `qa-review-bind` audits the link — via
`npm --prefix cicd/tests` (`audit-bind` / `port-yaml`).

This file is the format contract, defined once and here: the `qa-*` commands ship in this
repo's own plugin (`plugins/agent-workflows-runner/`) and resolve this path from
`.claude/rules/project-profile.md` → Paths.

## One file = one scenario (TS), many cases (TC)

A **scenario** groups related **cases**, each case a sequence of **steps**.

```
docs/tests/
  TS-01-<slug>.md     # a scenario: TC-01, TC-02, … each with a Steps table
  TS-02-….md
```

- **TS** (scenario) — the file. Holds the front-matter and a `## Why this scenario exists`.
- **TC** (case) — a `### TC-NN:` section. Has an objective, a **`Script:`** line (the bound
  `cicd/` YAML), and a **Steps** table.
- **Step** — one row of a case's Steps table: an **Action** and its **Expected Result**. The
  audit treats the doc's step count vs the YAML's step count as the binding check.

## Front-matter (scenario level)

```yaml
---
id: TS-01                       # scenario id, unique within the namespace
title: Stack builds and runs its lifecycle
namespace: test-framework       # which repo/tenant this test belongs to
spec: 76                        # the issue this scenario's intent came from
plan: 28                        # the [#<spec>] Test Plan issue it was authored from (optional)
status: green                   # green | unbound  (maintained by qa-review-bind)
---
```

- `spec` is the **trace back to intent** — an issue number, recorded unhashed. A human follows
  it; no gate resolves it, because resolving it means a network call inside a CI check.
- The **`Script:` binding is per-TC, not in front-matter** — a scenario's cases can map to
  different executables.

## Case (TC) structure

```markdown
### TC-01: Project build verification

- **Objective:** the stack builds from a clean checkout.
- **Script:** cicd/tests/testcases/build/TC-BUILD-001.yml
- **Preconditions:** Node and npm available.

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Run `node --version` | prints `vNN.NN.NN` |
| 2 | Run `npm install` | completes without error |
```

The Steps table is **machine-extractable** on purpose: one row = one `Action → Expected Result`,
and the row count is what `audit-bind` compares to the YAML's `steps:`.

## Binding, running, auditing

- **Bind** (`qa-bind`): set each TC's `Script:` to the `cicd/tests/testcases/**/*.yml` that runs
  it. Or revert: `npm --prefix cicd/tests run port-yaml -- <yaml>` scaffolds a doc from a YAML.
- **Audit** (`qa-review-bind`): `npm --prefix cicd/tests run audit-bind` — the `Script:` resolves
  and the step counts match, else `unbound`. Exits non-zero, so a CI job can gate on it.
- **Run**: `npm test` (the cicd assert-first runner).

The audit is the **only** gate. A doc diverging from its executable is caught; intent moving
underneath a doc is not — see `plugins/agent-workflows-runner/rules/qa-workflow.md`.

## Traceability

- **spec → tests:** `grep -l 'spec: <N>' docs/tests/`
- **test → spec / script:** the front-matter `spec:` and each case's `Script:` line.
- **test → plan:** the front-matter `plan:` line (the `[#<spec>] Test Plan` issue number).
- **script → test:** the `Script:` path points at the YAML.

No hand-maintained index — the links live in the files and resolve by `grep`/path.
