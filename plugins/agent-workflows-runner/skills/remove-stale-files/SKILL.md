---
name: remove-stale-files
description: |
  Finds and removes what this plugin's earlier versions wrote into a project: the `qa-*` and
  `qw-*` commands that shadow the placed skills, the markdown test-doc layer nothing reads
  any more, the rule files those units cited, the sections this plugin wrote into
  `project-profile.md`, and the example cases install copied in. Shows every file before
  touching one, and deletes only on a yes. It never adds: every edit it makes is a removal.
when_to_use: |
  Use whenever one of the files below is read, edited, or about to be created. Its presence
  is the trigger; nobody has to ask for a cleanup. In `.claude/commands/`: `qa-plan`,
  `qa-cases`, `qa-bind`, `qa-review-plan`, `qa-review-cases`, `qa-review-bind`, and their
  older `qw-*` spellings, plus `dw-test-design`. In `.claude/skills/`: `setup-agent-runner`,
  `agent-runner-flow`, and a local copy of any name this plugin ships. In `.claude/rules/`:
  `qa-workflow.md`, `connected-flow.md`, `test-yaml-format.md`, and the sections this plugin
  wrote into `project-profile.md`. Elsewhere: `docs/tests/` and its format contract,
  `templates/testcases/`, `audit-bind` and `port-yaml` scripts, and build targets that call
  them. Also on request: "clean up the old test tooling", "why are there two qa-bind", "is
  this rule still read", "we retired that workflow, what is left". Not for a file the project
  wrote itself, and not for what the `agent-workflows` plugin left — that plugin has its own.
---

# Remove stale files

**A stale file is worse than a missing one.** A missing file sends an agent to the code. A
stale one answers, plausibly and wrongly, and nothing marks it as out of date. The cost
lands later, on whoever traces a bad decision back to a document that read as current.

So this unit deletes, and only deletes. Nothing it touches gains a line, which is what
makes it safe to run twice.

## The boundary

**Remove only what this plugin wrote, or what shadows what it ships.** Everything else is
the project's, and a project's file is reported, never touched.

| Removable | Never |
|---|---|
| A local copy of a name this plugin ships | The project's own tests, at any level |
| A unit this plugin shipped and retired | `docs/adr/`, and any document the project authored |
| A rule file this plugin shipped | `agent-workflows`' rules and profile sections |
| Sections this plugin wrote into `project-profile.md` | Foreign sections in that same file |
| The test-doc layer and the scripts that served it | A test suite the project wrote itself |

The two lists are [fork-migration.md](./fork-migration.md) for `.claude/commands/` and
`.claude/skills/`, and [stale-documents.md](./stale-documents.md) for the rest.

**When you cannot trace a file to this plugin, it is the project's.** Say so and move on.

## Process

### 1. Detect

    ls .claude/commands/ .claude/skills/ .claude/rules/ 2>/dev/null
    ls docs/tests/ templates/testcases/ 2>/dev/null

Then find the script entries wherever this project keeps its manifests and build files —
depth and layout are the project's, and a monorepo has several:

    grep -rn 'audit-bind\|port-yaml' --include=package.json --include=Makefile .

Then read `~/.claude/plugins/known_marketplaces.json`. A fork is only redundant if the
placed copy is there, and `installed_plugins.json` pins an `installPath` into a cache
snapshot that may be many commits stale. On a `"source": "directory"` marketplace that
snapshot is not what loads at all.

Nothing found is a result. Report `CLEAN` and stop.

### 2. Show, and say the consequence

Name every file, and what replaces it. Say the unguessable parts **before** asking:

- **`qa-bind` and `qa-review-bind` have no replacement anywhere.** Removing them ends the
  binding audit; nothing rebuilds it, because the markdown layer it policed is gone.
- **`setup-agent-runner` has no successor either.** A project that used it to configure new
  repos loses that outright — this unit takes only its removal half.
- **The test-doc layer is content, not tooling.** `docs/tests/TS-*.md` may hold intent
  written by a person that exists nowhere else. Read one before proposing the directory.
- **A retired unit with no successor takes its capability with it.** That is the case to
  slow down on, because there is no new name to type in its place.

### 3. Ask

One question, covering the whole list. On no, remove nothing and report the shadowing as
`KEPT`: a fork the user chose to keep is a decision, not a failure.

### 4. Remove

Only the files named in step 2. In `project-profile.md`, delete this plugin's sections and
leave the file, its preamble, and every foreign section exactly as found.

### 5. Report

`CLEAN` · `REMOVED` · `KEPT` · `FAILED`, in the two lines and a question of
`reporting-outcomes`. `FAILED` is for a removal that errored: a path gone since detection,
a permission refusal, a file git will not drop. Never report the other three over it.

    REMOVED — 6 commands and 3 rule files; project-profile.md kept, foreign sections intact.
    Next: restart the session so the placed skills load.
    Want the file list?

## Steps

Copy this checklist and tick each item as you finish it:

    Task Progress:
    - [ ] Detected: commands, skills, rules, the test docs, the installed examples, the scripts
    - [ ] Each hit traced to this plugin, or left alone as the project's
    - [ ] Consequences stated before the question
    - [ ] Asked once, for the whole list
    - [ ] Removed only what was named
    - [ ] Reported: CLEAN, REMOVED, KEPT or FAILED
