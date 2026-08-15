# qa-workflow

Turns a spec into **trustworthy tests** — readable markdown in `docs/tests/` authored from a
reviewed test plan, each case bound to the executable that runs it. This plugin owns the whole
lifecycle: planning, authoring, binding, and the audit that catches a doc and its executable
diverging.

## The flow

```
   the spec issue the tests exist for   ──or──  "write a test for X"   (on request)
            │
            ▼
   qa-plan ───────► qa-review-plan      what to test — scenarios persisted as the
            │                            [#<spec>] Test Plan issue
            ▼
   qa-cases ──────► qa-review-cases     write docs/tests/TS-*.md (the format contract)
            │
            ▼
   qa-bind ───────► qa-review-bind      bind each case to its executable, then audit
            │                            the pair — the gate, exiting non-zero for CI
            ▼
   qa-run                               run the suite (the project's runner — see
                                         project-profile). A phase, not a slash command.
```

## The test-plan issue

`qa-plan`'s scenarios persist as a **GitHub issue**, titled `[#<spec>] Test Plan`, labelled
`test-plan` (distinct from dev's `Plan`). `qa-review-plan` reviews it; `qa-cases` reads it and
records the issue number in each `TS-*.md` `plan:` field. Nothing auto-closes it — no change
request targets a test plan — so close it by hand once its docs have landed.

## Producer → review pairing

| Producer | Review | Covers |
|----------|--------|--------|
| `qa-plan`  | `qa-review-plan`  | does the plan cover the spec? |
| `qa-cases` | `qa-review-cases` | each doc: one job, observable, traces back |
| `qa-bind`  | `qa-review-bind`  | doc ↔ executable still agree, else `unbound` |

No producer ships without a review covering its output.

## What this owns — and what it hands off

- **Owns:** the whole lifecycle — the authoring flow, the `docs/tests/` test-doc format (the
  contract), the binding, the binding audit (the one gate that fails on a doc and its executable
  diverging), how the bound executables are designed (`connected-flow.md`), and running the
  suite. Nothing here is deferred to somebody else's layer.
- **Resolves from the profile:** which command runs the suite and which runs the audit. The
  lifecycle is owned; the concrete invocations are project values.
- **Optional:** reusing vetted steps via a search index — a project enhancement, not part of the
  flow.

The format a test doc must follow is the project's test format contract — see
`project-profile.md` → Paths.

## Anchoring, and what is deliberately not checked

A test doc records the **spec issue** its intent came from, by number and unhashed. That is a
trace a human follows, not a signal a gate reads: resolving it means a network call and an auth
dependency inside a CI check, which this pipeline will not take.

So nothing here automatically notices when intent moves underneath a test doc. The binding audit
catches a doc diverging from its **executable**, which is a different failure. Read the trace
yourself when the spec changes.

## Prerequisites

There are two, and neither is expressible as a plugin dependency — Claude Code has no such
declaration, so both are the adopter's to satisfy. `setup-agent-runner` checks for both.

**The `agent-workflows` plugin.** These commands cite two of its rules — `agent-report.md`
(how a reply reports back) and `profile-doctrine.md` (how a unit resolves a project value).
Install it too; the README's install steps name it.

**The test framework itself, in the project.** `qa-bind` and `qa-review-bind` shell out to
project-side scripts — the scaffolder and the audit — and this plugin ships neither. They
arrive when the runner is installed into the repo being tested: `make install TARGET=<project>`
from the `agent-workflows-runner` checkout, or its agent-driven `/install` skill. Which scripts
they are afterwards is a project value: `project-profile.md` → binding + run layer.

The two differ in *scale*, which is why one can be satisfied while the other is not: the
plugin is installed **once per user** and reaches every repo that user opens; the framework is
installed **once per project** and reaches only that one. A user with the plugin still meets a
missing script in the next repo they open.

A unit that shells out to a script the profile names **checks it resolves first** and stops
with what is actually wrong — this project has no bound-test tooling, install the framework —
rather than passing an `npm ERR! Missing script` up to someone who was told the prerequisites
were satisfied.

## Project-specific values

The `docs/tests/` path, the `test-plan` label + colour, the `TS-`/`TC-` id schemes, the test-doc
front-matter fields, the default status, and the binding + audit commands are **not** owned by the
`qa-*` units. They resolve from `.claude/rules/project-profile.md`. The values a command shows are
the defaults; change them in the profile, not the command.

The `gh` invocations in these commands are that kind of illustrated default — the profile declares
which issue tracker a project actually uses.
