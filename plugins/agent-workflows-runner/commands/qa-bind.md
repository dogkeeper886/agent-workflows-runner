# Bind a Test Doc to its Executable

## Rules

Doctrine — the same in every project, and travels with these units:
@${CLAUDE_PLUGIN_ROOT}/rules/qa-workflow.md
@${CLAUDE_PLUGIN_ROOT}/rules/connected-flow.md

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
them; its paired review `/qa-review-bind` checks the link still holds.

How the executable is *designed* is doctrine, not a project value — one connected flow,
no hardcoded instance IDs, fixtures stable-named and torn down (see `connected-flow`).
Binding one that breaks those rules produces a pair the audit passes and a fresh backend
fails.

Fits in the qa-workflow:

    qa-plan → qa-review-plan → qa-cases → qa-review-cases → qa-bind → qa-review-bind → qa-run
    (qa-run = `npm test` — the project's runner; a phase, not a slash command)

---

## WORKFLOW

### A. Forward — bind an existing test doc

    /qa-bind docs/tests/TS-01-stack-lifecycle.md
        │
        ├─► For each `### TC-NN:` case, set a `Script:` line to the executable that
        │   runs it (e.g. cicd/tests/testcases/integration/TC-INTEGRATION-001.yml).
        ├─► Keep the case's Steps table aligned 1:1 with the executable's steps — the
        │   audit treats a step-count mismatch as `unbound`.
        ├─► Read the executable against `connected-flow` before binding it. A hardcoded
        │   instance ID, self-bootstrapped fixtures, or a fixture with no teardown is a
        │   defect to raise — the audit cannot see any of them.
        └─► Run `/qa-review-bind` to confirm the binding.

### B. Revert — port an executable into a doc scaffold

    /qa-bind cicd/tests/testcases/build/TC-BUILD-001.yml
        │
        ├─► Generate a scaffold from the executable — the project declares the scaffolder
        │   (project-profile → binding + run layer). Here:
        │     npm --prefix cicd/tests run port-yaml -- <yaml> > docs/tests/TS-NN-<slug>.md
        │   No such command means the framework is not installed in this project — say
        │   that (qa-workflow → Prerequisites), not what the shell printed.
        │   The scaffold carries the steps and the `Script:` binding; objective,
        │   expected results, spec anchor, and namespace are TODOs.
        ├─► Fill the TODOs: `namespace`, `spec` (the issue the intent came from), each
        │   TC's objective and Expected Result column. (Format contract: project-profile → Paths.)
        └─► Run `/qa-review-bind` to confirm the binding, then `/qa-review-cases` for meaning.

---

## OUTPUT

The bound docs, one `Script:` per case. Reported per `agent-report` — the verdict first,
and a section with nothing to report says so.

---

## API Notes

- `port-yaml` is a scaffolder, not a translator — a human/agent fills meaning.
- The binding + audit commands are project values — see project-profile.
- Producer paired with `/qa-review-bind` (the audit).
```
