# Review the Test Plan

## Rules

Doctrine — the same in every project, and travels with these units:
@${CLAUDE_PLUGIN_ROOT}/rules/qa-workflow.md

Doctrine from the prerequisite `agent-workflows` plugin, cited by name because no cross-plugin
path resolves: `agent-report` (how a reply reports back) and `profile-doctrine` (how a unit
resolves a project value).

Values — this project's:
@.claude/rules/project-profile.md

```
Check the proposed scenarios cover the spec — and stay coverage, not a frozen
step-by-step spec of their own.

Target: the `[#<spec>] Test Plan` issue written by `/qw-plan` (label `test-plan`).

## PURPOSE

The paired review for `/qw-plan`. Gates the persisted **test-plan issue** before
`qw-cases` writes any docs, so coverage gaps are caught cheaply. See `qa-workflow.md`.

Fits in the qa-workflow:

    qw-plan → qw-review-plan → qw-cases → qw-review-cases → qw-bind → qw-review-bind → qw-run

---

## WORKFLOW

    /qw-review-plan 76
        │
        ├─► Step 1: Read the test-plan issue
        │   - Find it (`test-plan` is qa's own label — distinct from dev's `plan`):
        │       gh issue list --search "[#<spec>] Test Plan" --label test-plan --state all
        │     (ad-hoc target: search "Test Plan: <subject>"). Read its scenarios.
        │   - If none exists, report and stop (run `/qw-plan` first).
        │
        ├─► Step 2: Coverage vs the spec
        │   - [ ] Every item in the spec's success criteria maps to a scenario.
        │   - [ ] Nothing essential to verifying the spec is missing.
        │   - [ ] No scenario goes beyond the spec's need.
        │
        ├─► Step 3: Each scenario
        │   - [ ] One coherent slice; independently runnable.
        │   - [ ] Maps to at least one of the project's executables (or names the gap).
        │   - [ ] No duplication of a scenario already in docs/tests/ (grep the spec anchor).
        │
        └─► Step 4: Decision (recorded on the issue)
            - PASS: covers the spec → comment "Reviewed — covers the spec" on the issue;
              proceed to `/qw-cases`.
            - REVISE: comment the missing or excess scenario on the issue; back to `/qw-plan`.

---

## OUTPUT

PASS or REVISE, recorded as a comment on the test-plan issue. Reported per `agent-report` —
the verdict first, and a section with nothing to report says so.

---

## API Notes

- Coverage gate only — step detail is `qw-cases`/`qw-review-cases`'s job.
- Review paired with the producer `/qw-plan`; it gates the persisted
  `[#<spec>] Test Plan` issue, recording PASS/REVISE as a comment on it.
```
