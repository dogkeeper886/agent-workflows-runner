# Remove list: rules, the test-doc layer, the profile, and what install copied

These are documents and files this toolkit wrote into a project. Each one was true when
written and none of them is read by anything now, which is the shape that costs an agent a
wrong answer rather than no answer.

## `.claude/rules/`

Delete outright. Every unit that cited these now carries what it needs inline.

`qa-workflow.md` · `connected-flow.md` · `test-yaml-format.md`

**Except:** `agent-report.md` and `profile-doctrine.md`, which belong to the
`agent-workflows` plugin. They are its, not ours — check `known_marketplaces.json` and leave
them to that plugin's cleanup.

## `.claude/rules/project-profile.md`

**Keep the file. Delete this plugin's sections from it.**

| Delete | Leave |
|---|---|
| `Paths`, `ID schemes`, `Front-matter & format contract`, `Connected flow`, `This project's binding + run layer` | the preamble, and every section this plugin did not write — `Labels`, `Linking & branch`, `Git`, `Docs & diagrams`, `Reports`, `Review semantics` belong to `agent-workflows` |

The units resolve none of ours any more: each skill states its own defaults and derives the
rest from the project.

If the file holds nothing but our sections, it is empty of meaning; say so and let the user
decide whether the file goes too.

## The test-doc layer

Delete outright.

`docs/tests/README.md` — the format contract · `docs/tests/TS-*.md` — the scenario docs ·
any `Script:` binding inside them

The markdown owned intent and the executable owned execution, and an audit existed to catch
the two diverging. That is a document over the code, kept true by a gate — the exact
staleness this toolkit now refuses to create.

**Read one before proposing the directory.** A `TS-*.md` may hold reasoning a person wrote
that exists nowhere else. Where it does, say so and offer to carry it into the executable
first.

## What install copied in

Delete outright.

| File | Why it goes |
|---|---|
| `templates/testcases/**` copied into the project | Example cases. Once they have sat in a suite directory a while they are indistinguishable from the project's own, and they run against nothing real |
| `audit-bind` and `port-yaml` scripts, and their entries in `package.json` | One audited a test doc against its executable, the other scaffolded a doc from one. Both served the layer above |
| Build targets calling any of the above — `make check-install`, `make diagrams`, an `audit-bind` script entry | They fail by construction once the script is gone, and a red target nobody can fix reads as a broken project |
| `cicd/` where it was installed and never used — no test case, no run, no CI job referencing it | An unused runner is read as the project's test strategy by the next agent to arrive |

**`cicd/` is the one to slow down on.** Where it holds even one case the project wrote, it is
theirs. Report it and leave it.

## Never

The project's own tests, at any level. `docs/adr/`. Anything you cannot trace to this
toolkit. A suite is the project's record of what it believes about itself, and a wrong
deletion there is not recoverable from this plugin's history.
