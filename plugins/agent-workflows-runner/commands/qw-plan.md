# Plan What to Test

## Rules

Doctrine — the same in every project, and travels with these units:
@${CLAUDE_PLUGIN_ROOT}/rules/qa-workflow.md

Doctrine from the prerequisite `agent-workflows` plugin, cited by name because no cross-plugin
path resolves: `agent-report` (how a reply reports back) and `profile-doctrine` (how a unit
resolves a project value).

Values — this project's:
@.claude/rules/project-profile.md

```
Derive the scenarios that verify a spec (or an on-request target) — the "what
to test", before any test doc is written.

Target: the spec issue the tests exist for, or an ad-hoc request ("write a test for X").

## PURPOSE

The front of the qa-workflow — the test analogue of reading a spec before
implementing. It produces a short list of **scenarios** (each a TS-to-be) that together
cover the need, and **persists them as a `[#<spec>] Test Plan` GitHub issue** so the plan
survives the session and `qw-review-plan` reviews a real artifact (not a chat message);
`qw-cases` then writes against it. See `qa-workflow.md`.

Fits in the qa-workflow:

    qw-plan → qw-review-plan → qw-cases → qw-review-cases → qw-bind → qw-review-bind → qw-run

---

## WORKFLOW

    /qw-plan 76
        │
        ├─► Step 1: Read the need
        │   - If a spec issue: read it (the problem, the stories, what success looks like):
        │       gh issue view <spec>
        │   - If an on-request target: restate what behaviour is to be verified.
        │
        ├─► Step 2: Check what already exists
        │   - List the docs/tests/ scenarios already anchored to this spec:
        │       grep -l 'spec: <spec>' docs/tests/
        │   - If the project has a reuse index, query it for cases already covering this
        │     behaviour, so the plan reuses vetted coverage instead of duplicating it (optional).
        │   - Check for an existing test-plan issue (extend it, don't duplicate):
        │       gh issue list --search "[#<spec>] Test Plan" --label test-plan --state all
        │     (`test-plan` is qa's own label — distinct from dev's `plan`)
        │
        ├─► Step 3: Propose scenarios
        │   - Break the need into scenarios (TS-to-be), each:
        │     • one coherent slice of behaviour, • independently runnable,
        │     • mappable to one or more of the project's executables (bound later, by qw-bind).
        │   - For each, name the cases (TC-to-be) it will hold, at a sentence each.
        │
        ├─► Step 4: Open the test-plan issue
        │   - Ensure the label (idempotent):
        │       gh label create "test-plan" --color "006b75" --description "The qa test plan for a spec (what to test)" --force
        │   - Write the scenarios into a GitHub issue so they outlive the session
        │     (the template below). Title: [#<spec>] Test Plan
        │     (ad-hoc target → "Test Plan: <subject>", no spec prefix). Label: test-plan.
        │       gh issue create --label "test-plan" --title "[#<spec>] Test Plan" --body "…"
        │
        └─► Step 5: Hand off — stop for review
            - Show the test-plan issue URL for `/qw-review-plan`, then `/qw-cases`.
            - STOP. Do NOT write TS docs — that is `/qw-cases`.

---

## TEST-PLAN ISSUE BODY

    ## Scenarios
    ### TS-01 (to-be): <scenario title>
    - Objective: <the slice of behaviour it verifies>
    - Cases: TC-01 <one line>, TC-02 <one line>

    ### TS-02 (to-be): …

    Part of #<spec>

---

## OUTPUT

The test-plan issue URL and its scenarios. Reported per `agent-report` — the verdict first,
and a section with nothing to report says so.

---

## API Notes

- A scenario here is a *plan item*, not yet a file — `qw-cases` writes the doc.
- The scenarios persist as a `[#<spec>] Test Plan` issue (label `test-plan`; ad-hoc →
  `Test Plan: <subject>`) — the same plan-as-issue form `dev-workflow` uses, with its own
  `test-plan` label so it never collides with dev's plan issues (label `plan`).
- The spec is the goal; keep the plan to coverage, not step detail.
- Producer paired with `/qw-review-plan`, which reviews the issue.
```
