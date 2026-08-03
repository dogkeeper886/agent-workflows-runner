---
paths:
  - ".claude/commands/**/*.md"
  - ".claude/skills/**/*.md"
---

# project-profile

The one place this project declares its specifics. The shipped commands and skills state
their *intent* and resolve any project-specific value — a path, an ID scheme, a label, an
integration, a format, an audience — **from this file**, instead of hardcoding it.
Customize a workflow by editing this file, not the units.

**How a unit uses it.** Where a command or skill would otherwise bake in a value, it
points at the matching section here (e.g. "create the *plan* label — see project-profile →
Labels"). The values below are this runner's real values — the agent-workflows
test-framework runner, the binding + run + drift layer that upstream's `qa-workflow` hands
off to. Change a line here and every unit follows.

**What belongs here vs. not.** This file is for **declarative** customization — a value or
a list. A whole **procedure** (how this runner binds a doc to its YAML, runs the suite, and
audits drift) is *not* a value; it lives in this repo's own commands (`qw-bind`,
`qw-review-bind`, `qw-drift`) and the `cicd/` runner, never crammed into a general unit.
Lists → here; procedures → a project-owned command. This is the rules files' "what this
owns vs. what it hands off" boundary, made concrete.

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
- title prefixes: `[STORY-XXX] Plan` · `[STORY-XXX] Test Plan` · `[STORY-XXX] <task>`

## Labels

Names the workflow uses; colours where the workflow pins one (`#hex`), otherwise the
project's choice.

- plan: `plan` (`#5319e7`)
- test plan: `test-plan` (`#006b75`)
- priority: `priority:high` · `priority:medium` · `priority:low`
- type: `feature` · `enhancement` · `bug` · `docs`
- status: `status:in-progress` · `status:needs-review` · `status:blocked`

## Linking & branch

- story back-reference (in titles/bodies): `[STORY-XXX]`
- plan back-reference (task → plan): `Part of #<plan>`
- issue closure (PR → issue): `Fixes #N` / `Closes #N`
- feature branch name: `issue-<N>-<slug>`

## Git

- default branch: *derive it* (`gh repo view --json defaultBranchRef -q .defaultBranchRef.name`), don't assume `main`
- merge strategy: `--merge` (preserve history; switch to `--squash` only if the project requires)

## Front-matter & format contract (test docs)

- test-doc filename: `TS-NN-<slug>.md` in the tests dir
- front-matter fields: `id, title, namespace, story, story_hash, plan, status`
- namespace: `test-framework`
- drift anchor: `story_hash` — the `sha256` of the story file (`sha256sum`), recorded so
  `qw-drift` can tell the story has moved.
- default status: `green` (drift states `stale` | `unbound`, maintained by `qw-drift`)

## Docs & diagrams

- README output: `README.md`
- diagram policy: SVG source committed under `docs/diagrams/`, rendered to PNG under
  `docs/diagrams/png/` via `make diagrams` (no Mermaid / inline diagram blocks)
- diagrams dir: `docs/diagrams/` (SVG source) + `docs/diagrams/png/` (rendered) — also under Paths

## Review semantics

- canonical format (source of truth): `markdown`
- live integrations: `GitHub` — tools the project genuinely uses; coupling to one listed
  here is correct, not drift. (A downstream adds its own, e.g. Jira, Confluence, TestLink.)
- deliverable (triggers a paired review): a unit that *produces or changes* an output —
  by name (`create-`/`sync-`/`publish-`/`draft-`/`init-`) or as a producing gerund skill
  (`planning-…`, `drafting-…`)
- audience (human-read docs): engineers and newcomers

## This project's binding + run + drift layer (NOT deferred)

Upstream's `qa-workflow` hands binding and running off to "the project's own layer." **This
repo IS that layer.** Binding, audit, and drift are owned here, not deferred:

- bind a case to its executable: `qw-bind` → sets each TC's `Script:` to a
  `cicd/tests/testcases/**/*.yml`
- audit a binding: `qw-review-bind` → `npm --prefix cicd/tests run audit-bind` (the `Script:`
  resolves and the doc's step count matches the YAML's, else `unbound`)
- run the suite (the `qw-run` phase — a phase, not a slash command): `npm test`
- watch for drift: `qw-drift` → `npm --prefix cicd/tests run drift` (`stale` when `story_hash`
  no longer matches the story)
- scaffold a doc from a YAML: `npm --prefix cicd/tests run port-yaml -- <yaml>`
- reuse index: **none** — reuse is the optional enhancement upstream describes; it is not
  present here.
