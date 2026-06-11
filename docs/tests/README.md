# `docs/tests/` — the test-doc format

Each test is a **readable markdown document** that lives here, close to the story it verifies.
The markdown owns **why / what** (intent); the bound `cicd/` YAML owns **how it runs**
(execution). `qw-bind` links them, `qw-review-bind` audits the link, and `qw-drift` watches
for divergence — all via `npm --prefix cicd/tests` (`audit-bind` / `drift` / `port-yaml`).

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
story: STORY-001                # the need this scenario verifies (→ docs/stories/STORY-001.md)
story_hash: 7474d8b6…           # sha256 of the linked story file at last sync (drift anchor)
plan: 28                        # the [STORY-XXX] Test Plan issue it was authored from (optional)
status: green                   # green | stale | unbound  (maintained by qw-drift)
---
```

- `story` + `story_hash` are the **drift anchor**: when the story changes, its hash no longer
  matches and `qw-drift` flags the scenario `stale`.
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

## Binding, running, drift (this repo's job)

- **Bind** (`qw-bind`): set each TC's `Script:` to the `cicd/tests/testcases/**/*.yml` that runs
  it. Or revert: `npm --prefix cicd/tests run port-yaml -- <yaml>` scaffolds a doc from a YAML.
- **Audit** (`qw-review-bind`): `npm --prefix cicd/tests run audit-bind` — the `Script:` resolves
  and the step counts match, else `unbound`.
- **Run**: `npm test` (the cicd assert-first runner).
- **Drift** (`qw-drift`): `npm --prefix cicd/tests run drift` — `stale` if `story_hash` no longer
  matches the story; `unbound` if a doc and its script diverged.

## Traceability

- **story → tests:** `grep -l 'story: STORY-XXX' docs/tests/`
- **test → story / script:** the front-matter `story:` and each case's `Script:` line.
- **script → test:** the `Script:` path points at the YAML.

No hand-maintained index — the links live in the files and resolve by `grep`/path.
