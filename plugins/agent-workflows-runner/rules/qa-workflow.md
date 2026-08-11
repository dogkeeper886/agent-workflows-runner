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
   qw-plan ───────► qw-review-plan      what to test — scenarios persisted as the
            │                            [#<spec>] Test Plan issue
            ▼
   qw-cases ──────► qw-review-cases     write docs/tests/TS-*.md (the format contract)
            │
            ▼
   qw-bind ───────► qw-review-bind      bind each case to its executable, then audit
            │                            the pair — the gate CI runs
            ▼
   qw-run                               `npm test` — the project's runner. A phase, not
                                         a slash command.
```

## The test-plan issue

`qw-plan`'s scenarios persist as a **GitHub issue**, titled `[#<spec>] Test Plan`, labelled
`test-plan` (distinct from dev's `Plan`). `qw-review-plan` reviews it; `qw-cases` reads it and
records the issue number in each `TS-*.md` `plan:` field.

## Producer → review pairing

| Producer | Review | Covers |
|----------|--------|--------|
| `qw-plan`  | `qw-review-plan`  | does the plan cover the spec? |
| `qw-cases` | `qw-review-cases` | each doc: one job, observable, traces back |
| `qw-bind`  | `qw-review-bind`  | doc ↔ executable still agree, else `unbound` |

No producer ships without a review covering its output.

## What this owns — and what it hands off

- **Owns:** the authoring flow, the `docs/tests/` test-doc format (the contract), the binding,
  and the binding audit — the one gate that fails a build when a doc and its executable diverge.
- **Hands off:** running the suite is the project's runner (`qw-run`). Reusing vetted steps (a
  search index) is an **optional** project enhancement.

The format a test doc must follow is the project's test format contract — see
`project-profile.md` → Paths.

## Anchoring, and what is deliberately not checked

A test doc records the **spec issue** its intent came from, by number and unhashed. That is a
trace a human follows, not a signal a gate reads: resolving it means a network call and an auth
dependency inside a CI check, which this pipeline will not take.

So nothing here automatically notices when intent moves underneath a test doc. The binding audit
catches a doc diverging from its **executable**, which is a different failure. Read the trace
yourself when the spec changes.

## Prerequisite

These commands cite two rules that ship in the **`agent-workflows`** plugin — `agent-report.md`
(how a reply reports back) and `profile-doctrine.md` (how a unit resolves a project value).
Claude Code cannot express a dependency between plugins, so install that one too; the README's
install steps name it.

## Project-specific values

The `docs/tests/` path, the `test-plan` label + colour, the `TS-`/`TC-` id schemes, the test-doc
front-matter fields, the default status, and the binding + audit commands are **not** owned by the
`qw-*` units. They resolve from `.claude/rules/project-profile.md`. The values a command shows are
the defaults; change them in the profile, not the command.

The `gh` invocations in these commands are that kind of illustrated default — the profile declares
which issue tracker a project actually uses.
