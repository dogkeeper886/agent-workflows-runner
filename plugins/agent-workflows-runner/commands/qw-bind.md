# Bind a Test Doc to its Executable

## Rules

Doctrine — the same in every project, and travels with these units:
@${CLAUDE_PLUGIN_ROOT}/rules/qa-workflow.md

Doctrine from the prerequisite `agent-workflows` plugin, cited by name because no cross-plugin
path resolves: `agent-report` (how a reply reports back) and `profile-doctrine` (how a unit
resolves a project value).

Values — this project's:
@.claude/rules/project-profile.md

```
Link each case in a test doc to the executable that runs it — or port an
existing executable into a new test-doc scaffold (the revert direction).

Target: a docs/tests/TS-*.md scenario, or an executable to port.

## PURPOSE

Binding is **audit, not codegen**: the markdown owns *intent* (why / what), the
executable owns *execution* (how it runs). This command establishes the link between
them; its paired review `/qw-review-bind` checks the link still holds.

Fits in the qa-workflow:

    qw-plan → qw-review-plan → qw-cases → qw-review-cases → qw-bind → qw-review-bind → qw-run
    (qw-run = `npm test` — the project's runner; a phase, not a slash command)

---

## WORKFLOW

### A. Forward — bind an existing test doc

    /qw-bind docs/tests/TS-01-stack-lifecycle.md
        │
        ├─► For each `### TC-NN:` case, set a `Script:` line to the executable that
        │   runs it (e.g. cicd/tests/testcases/integration/TC-INTEGRATION-001.yml).
        ├─► Keep the case's Steps table aligned 1:1 with the executable's steps — the
        │   audit treats a step-count mismatch as `unbound`.
        └─► Run `/qw-review-bind` to confirm the binding.

### B. Revert — port an executable into a doc scaffold

    /qw-bind cicd/tests/testcases/build/TC-BUILD-001.yml
        │
        ├─► Generate a scaffold from the executable:
        │     npm --prefix cicd/tests run port-yaml -- <yaml> > docs/tests/TS-NN-<slug>.md
        │   The scaffold carries the steps and the `Script:` binding; objective,
        │   expected results, spec anchor, and namespace are TODOs.
        ├─► Fill the TODOs: `namespace`, `spec` (the issue the intent came from), each
        │   TC's objective and Expected Result column. (Format contract: project-profile → Paths.)
        └─► Run `/qw-review-bind` to confirm the binding, then `/qw-review-cases` for meaning.

---

## OUTPUT

The bound docs, one `Script:` per case. Reported per `agent-report` — the verdict first,
and a section with nothing to report says so.

---

## API Notes

- `port-yaml` is a scaffolder, not a translator — a human/agent fills meaning.
- The binding + audit commands are project values — see project-profile.
- Producer paired with `/qw-review-bind` (the audit).
```
