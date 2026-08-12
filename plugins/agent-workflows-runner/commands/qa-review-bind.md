# Review a Test Doc ↔ Script Binding

## Rules

Doctrine — the same in every project, and travels with these units:
@${CLAUDE_PLUGIN_ROOT}/rules/qa-workflow.md

Doctrine from the prerequisite `agent-workflows` plugin, cited by name because no cross-plugin
path resolves: `agent-report` (how a reply reports back) and `profile-doctrine` (how a unit
resolves a project value).

Values — this project's:
@.claude/rules/project-profile.md

```
Audit that each test doc and its bound executable still agree — flag any case
whose doc and script have diverged as `unbound`.

Target: the docs/tests/ scenarios (all, or one named file).

## PURPOSE

The paired review for `/qa-bind`, and the qa-workflow's one gate: binding is
audit-not-codegen, so something has to *check* that the markdown and the executable
haven't drifted apart. Divergence is silent until something looks; this looks,
deterministically, in CI and on demand. It runs the audit and adds a human/agent pass
for meaning.

Fits in the qa-workflow:

    qa-plan → qa-review-plan → qa-cases → qa-review-cases → qa-bind → qa-review-bind → qa-run
    (qa-run = `npm test` — the project's runner; a phase, not a slash command)

---

## WORKFLOW

    /qa-review-bind
        │
        ├─► Step 1: Run the deterministic audit
        │   The project declares which command that is — see project-profile → binding + run
        │   layer. Here: `npm --prefix cicd/tests run audit-bind`.
        │   For each case it checks:
        │     - the `Script:` path resolves to a file, and
        │     - the doc's step count matches the executable's step count.
        │   A failure prints `UNBOUND` with the reason; the command exits non-zero,
        │   so CI can gate on it. A run over zero docs warns — nothing was checked.
        │
        ├─► Step 2: Read the meaning the audit can't
        │   For each `bound` case, skim that the doc's Actions/Expected Results
        │   still describe what the executable actually does — structure can match while
        │   meaning has drifted. Flag any semantic mismatch.
        │
        └─► Step 3: Decision
            - PASS: every case `bound` (audit exits 0) and meaning holds.
            - REVISE: for each `UNBOUND` (or semantic mismatch), fix the doc's
              Steps/`Script:` or the binding — smallest change first — then re-run.

---

## OUTPUT

PASS or REVISE, with each `UNBOUND` case named. Reported per `agent-report` — the verdict
first, and a section with nothing to report says so.

---

## API Notes

- The audit is structural + deterministic, and exits non-zero — the runnable check a CI job
  can gate on. Semantic agreement is the reviewer's job.
- `unbound` is one of the test doc's `status` values (see the format contract).
- A test doc's `spec` anchor is a trace for a human, not a signal this gate reads —
  resolving it would put a network call in a CI check.
- Review paired with the producer `/qa-bind`.
```
