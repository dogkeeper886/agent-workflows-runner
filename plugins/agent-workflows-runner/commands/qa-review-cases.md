# Review the Test Docs

## Rules

Doctrine — the same in every project, and travels with these units:
@${CLAUDE_PLUGIN_ROOT}/rules/qa-workflow.md

Doctrine from the prerequisite `agent-workflows` plugin, cited by name because no cross-plugin
path resolves: `agent-report` (how a reply reports back) and `profile-doctrine` (how a unit
resolves a project value).

Values — this project's:
@.claude/rules/project-profile.md

```
Check each test doc does one clear job, has observable steps, and traces back to
its spec — before it is bound and run.

Target: the docs/tests/TS-*.md docs written by /qa-cases for a spec.

## PURPOSE

The paired review for `/qa-cases`. Gates the written docs for quality and traceability.

Fits in the qa-workflow:

    qa-plan → qa-review-plan → qa-cases → qa-review-cases → qa-bind → qa-review-bind → qa-run

---

## WORKFLOW

    /qa-review-cases 76
        │
        ├─► Step 1: Each doc
        │   - [ ] One scenario, one job; cases are coherent slices of it.
        │   - [ ] Front-matter complete: `spec` names the issue the intent came from,
        │         namespace set, status present.
        │   - [ ] Each step's Expected Result is observable — checkable, not vague.
        │   - [ ] Conforms to the format contract (project-profile → Paths).
        │
        ├─► Step 2: Traceability
        │   - [ ] The `spec` issue exists and is the one this scenario verifies.
        │   - [ ] No duplicate of an existing scenario for the same spec.
        │
        └─► Step 3: Decision
            - PASS: docs do their job and trace back → hand off to `/qa-bind`.
            - REVISE: fix the named doc — smallest change first — and re-check.

---

## OUTPUT

PASS or REVISE, per doc. Reported per `agent-report` — the verdict first, and a section
with nothing to report says so.

---

## API Notes

- This reviews the *doc* (intent); the doc↔script binding is reviewed in `/qa-review-bind`.
- Published-deliverable phrasing/typography is out of scope here.
- Review paired with the producer `/qa-cases`.
```
