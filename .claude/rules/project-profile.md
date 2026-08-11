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
audits the pair) is *not* a value; it lives in the `qw-*` commands and the `cicd/` runner,
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
- front-matter fields: `id, title, namespace, spec, plan, status`
- namespace: `test-framework`
- spec anchor: the issue number the intent came from — recorded unhashed, traced by a human
- default status: `green` (the audit's other state is `unbound`, maintained by `qw-review-bind`)

## Docs & diagrams

- README output: `README.md`
- diagram policy: SVG source committed under `docs/diagrams/`, rendered to PNG under
  `docs/diagrams/png/` via `make diagrams` (no Mermaid / inline diagram blocks)
- diagrams dir: `docs/diagrams/` (SVG source) + `docs/diagrams/png/` (rendered) — also under Paths

## Reports

The words a gate report uses. The contract itself — the questions a report answers and
why — is `.claude/rules/agent-report.md`; a unit resolves the wording from here.

- verdict vocabulary: `PASS` · `REVISE` · `HAND BACK`
- extra verdict (artifact review only): `CUT` — the artifact duplicates another or does
  nothing useful; propose removal
- section names: `Verdict` · `Findings` · `Checked` · `Not done` · `Unresolved` ·
  `Trace` · `Next`
- empty-section marker: `none` (a section with nothing to report says so; it is not dropped)
- finding columns: `# · severity · location · what's wrong · smallest fix`
- formats by medium: chat session → plain text, tables, ASCII diagrams · document or
  issue → whatever renders there. For a *published* human-read doc the diagram policy
  under Docs & diagrams applies instead.

## Review semantics

- canonical format (source of truth): `markdown`
- live integrations: `GitHub` — tools the project genuinely uses; coupling to one listed
  here is correct, not drift. (A downstream adds its own, e.g. Jira, Confluence, TestLink.)
- deliverable (triggers a paired review): a unit that *produces or changes* an output —
  by name (`create-`/`sync-`/`publish-`/`draft-`/`init-`) or as a producing gerund skill
  (`planning-…`, `drafting-…`)
- audience (human-read docs): engineers and newcomers

## This project's binding + run layer

The `qw-*` commands state the intent; these are the concrete commands behind it here:

- bind a case to its executable: `qw-bind` → sets each TC's `Script:` to a
  `cicd/tests/testcases/**/*.yml`
- audit a binding — the gate: `qw-review-bind` → `npm --prefix cicd/tests run audit-bind` (the
  `Script:` resolves and the doc's step count matches the YAML's, else `unbound`)
- run the suite (the `qw-run` phase — a phase, not a slash command): `npm test`
- scaffold a doc from a YAML: `npm --prefix cicd/tests run port-yaml -- <yaml>`
- reuse index: **none** — reuse is an optional enhancement; it is not present here.
