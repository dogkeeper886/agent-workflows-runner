# Write the Test Docs

## Rules

Doctrine — the same in every project, and travels with these units:
@${CLAUDE_PLUGIN_ROOT}/rules/qa-workflow.md

Doctrine from the prerequisite `agent-workflows` plugin, cited by name because no cross-plugin
path resolves: `agent-report` (how a reply reports back) and `profile-doctrine` (how a unit
resolves a project value).

Values — this project's:
@.claude/rules/project-profile.md

```
Turn a reviewed test plan into readable test docs in docs/tests/ — reusing vetted
steps where a reuse index is available, instead of re-inventing them.

Target: the reviewed `[#<spec>] Test Plan` issue from `/qa-review-plan` (its scenarios).

## PURPOSE

The authoring producer of the qa-workflow. Writes each planned scenario as a
`docs/tests/TS-*.md` doc in the format contract (the project's test format contract —
see project-profile → Paths): front-matter + cases, each case a Steps table of
Action / Expected Result rows.

Fits in the qa-workflow:

    qa-plan → qa-review-plan → qa-cases → qa-review-cases → qa-bind → qa-review-bind → qa-run

---

## WORKFLOW

    /qa-cases 76
        │
        ├─► Step 1: Read the test-plan issue
        │   - Find it (`test-plan` is qa's own label — distinct from dev's `plan`):
        │       gh issue list --search "[#<spec>] Test Plan" --label test-plan --state all
        │     Read its scenarios; note its number <plan>. (No plan issue → the scenarios
        │     came from /qa-plan in chat; <plan> is absent.)
        │
        ├─► Step 2: One file per scenario
        │   - Create docs/tests/TS-NN-<slug>.md with front-matter:
        │       id, title, namespace, spec: <spec> (the issue the intent came from),
        │       plan: <plan> (the test-plan issue number — omit when there is none),
        │       status: green
        │   - (Format and field meanings: the format contract.)
        │
        ├─► Step 3: Write each case (TC) — reuse before re-inventing
        │   - If the project has a reuse index, query it before writing: is the case's
        │     objective already covered? is there a vetted step for the action you mean?
        │     Reuse or extend a close match instead of coining a near-duplicate (optional).
        │   - Fill the Steps table: each row one Action + its Expected Result.
        │
        └─► Step 4: Hand off
            - Run `/qa-review-cases` to gate the docs.
            - Reviewed docs then go to `/qa-bind` — bind each case to its executable, then
              `/qa-review-bind` and run. (If a reuse index exists, the new docs get indexed
              there.)

---

## OUTPUT

The test docs written. Trace carries each doc's path and the test-plan issue. Reported
per `agent-report` — the verdict first, and a section with nothing to
report says so.

---

## API Notes

- Reuse is optional: if the project has a reuse index, query it for a vetted case or
  step before authoring a near-duplicate, so coverage converges instead of duplicating.
- `spec`: the issue number the scenario's intent came from — recorded unhashed, so a human
  can trace a test back to why it exists. Nothing resolves it automatically; a gate that
  did would need a network call.
- `plan`: the `[#<spec>] Test Plan` issue number — the scenario source and the trace
  back. Absent for ad-hoc tests written without a plan.
- Producer paired with `/qa-review-cases`.
```
