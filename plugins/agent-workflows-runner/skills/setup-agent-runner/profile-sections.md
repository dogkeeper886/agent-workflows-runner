# The sections this plugin owns

Seed values for `.claude/rules/project-profile.md`. These are the **only** sections
`setup-agent-runner` writes — see `agent-workflows`' `profile-doctrine.md` → "More than one
plugin writes this file". Anything else in the file belongs to another plugin or to the
project.

Every value below is a **default that reproduces this toolkit's own behaviour**, so a project
that accepts all of them behaves exactly as the toolkit does. Which unit reads which section is
the right-hand column; it is also the answer to "can I delete this one?"

| Section | Read by |
|---|---|
| Paths | `qa-cases`, `qa-review-cases`, `qa-bind` |
| ID schemes | `qa-plan`, `qa-cases`, `qa-bind` |
| Front-matter & format contract | `qa-cases`, `qa-review-cases`, `qa-review-bind` |
| Connected flow | `qa-bind`, `qa-review-bind` |
| This project's binding + run layer | `qa-bind`, `qa-review-bind` |

**`Paths` is shared in practice.** Other plugins write their own lines into the same section — a
stories directory, a diagrams directory. Add the test-doc lines in place and leave every other
line alone; this is the "own only what you read" rule at line granularity rather than section
granularity.

---

## The doctrine half

Written only when the file does not exist at all. It is identical in every project, so
whichever setup unit first finds it missing writes it, and the next one finds it correct and
leaves it alone.

```markdown
# project-profile

**The values this project declares.** Every unit resolves its project-specific values from
here rather than hardcoding them, so a workflow is customized by editing this file and not
the units. Change a line here and every unit follows.

This file is reached by name: a unit cites `.claude/rules/project-profile.md`, and a
project that has not written one leaves that reference unresolved rather than quietly
borrowing another project's values.

How that resolution works — the two wiring styles, what belongs here rather than in a
project skill, and what happens when a value cannot be resolved — is the `agent-workflows`
plugin's `rules/profile-doctrine.md`, which ships with the units. That file is the same in
every project; this one is not.
```

---

## The value sections

### Paths

```markdown
## Paths

- tests dir: `docs/tests/`
- test format contract: `docs/tests/README.md`
```

If the project already keeps test docs somewhere else, propose that path — exploration found it,
so do not make the user say it twice.

### ID schemes

Read from an existing `TS-*.md` where one exists; ask only when the project has no test docs at
all.

```markdown
## ID schemes

- scenario id: `TS-NN`
- case id: `TC-NN`
- executable id: `TC-<SUITE>-XXX` — one per suite directory under the project's suite root
- title prefix (test plan issue): `[#<spec>] Test Plan`
```

### Front-matter & format contract

```markdown
## Front-matter & format contract (test docs)

- test-doc filename: `TS-NN-<slug>.md` in the tests dir
- front-matter fields: `id, title, namespace, spec, plan, status`
- namespace: <the repo or tenant these tests belong to>
- spec anchor: the issue number the intent came from — recorded unhashed, traced by a human
- default status: `green` (the audit's other state is `unbound`, maintained by `qa-review-bind`)
```

`namespace` is the one field with no default — it is what tells two repos' test docs apart in a
shared tracker. Propose the repository name.

### Connected flow

The instantiation of `connected-flow.md`'s portable rules. **Read from the suite, not asked** —
open the executables and describe what is actually there. Ask only for what the files cannot
say, which is usually the teardown intent.

```markdown
## Connected flow

How this project instantiates the portable rules in the plugin's `rules/connected-flow.md`.

- hand-off: <how stages publish and read fixture IDs, e.g. files under `/tmp/<project>-flow/`>
- stable fixtures: <the named test data each stage creates idempotently, and any portable
  literal such as a built-in default account>
- the connected graph: <how the fixtures relate — what covers, belongs to, or records what>
- teardown: <the final stage that removes everything the flow created, and depends on every
  fixture-consuming test so it runs last>
- run: <the command, and the requirement that it passes twice in a row against a fresh backend>
```

A project whose suite is still the framework's standalone example cases has **not** instantiated
a flow. Write that, in one line, rather than a template of empty placeholders:

```markdown
## Connected flow

Not instantiated. The suite is still standalone cases, so there is no hand-off, no fixture
chain and no teardown stage yet. `connected-flow.md`'s rules bind the first executable that
creates a fixture; this section is filled in then.
```

An empty placeholder block reads as a flow nobody described. One honest line reads as a flow
that does not exist yet, which is the true state and the one a reviewer can act on.

### This project's binding + run layer

The concrete commands behind the `qa-*` units' stated intent. **Worth asking about** — the gate
resolves the audit command from here, so a wrong value fails CI rather than the thing it was
checking.

```markdown
## This project's binding + run layer

The `qa-*` commands state the intent; these are the concrete commands behind it here:

- bind a case to its executable: `qa-bind` → sets each TC's `Script:` to an executable path
- audit a binding — the gate: `qa-review-bind` → `npm --prefix cicd/tests run audit-bind`
- run the suite (the `qa-run` phase — a phase, not a slash command): `npm test`
- scaffold a doc from an executable: `npm --prefix cicd/tests run port-yaml -- <file>`
- reuse index: **none** — reuse is an optional enhancement, not part of the flow
```

The `npm --prefix` invocations are the framework's, and they exist only once it is installed
into the project — the second prerequisite. Verify each one runs before writing it; a value
that names a script nobody can run is worse than an absent section, because the unit stops
somewhere unrelated.
