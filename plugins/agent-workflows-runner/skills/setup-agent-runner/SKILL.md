---
name: setup-agent-runner
description: |
  Adopts the agent-workflows-runner plugin into a project — writes the profile sections the
  qa-* units resolve against, checks the two prerequisites these commands cannot declare, and
  finds the forked `agent-runner-flow` skill and `qa-*`/`qw-*` command copies that silently
  shadow the placed ones. Use before the first run of qa-plan, qa-cases, qa-bind or
  qa-review-bind, when a qa-* unit stops because it cannot resolve a project value, when
  `/qa-review-bind` fails on a missing script, or when migrating a repo that installed the
  test framework with `make install`.
---

# Setup agent-workflows-runner

**Placing the plugin puts the `qa-*` units where an agent loads them. This is the other half —
adoption.** The placed units describe *some* project; this makes them describe *this* one. It
runs once per repo, and again only to change an answer.

Four things, and the last two are the ones nobody expects to need:

- **Profile values** — the sections the `qa-*` units resolve against, so no unit stops on an
  unresolvable value
- **The connected-flow instantiation** — the project's own fixtures, hand-off and teardown, so
  `connected-flow.md`'s portable rules have a concrete referent
- **The prerequisite check** — two of them, neither expressible as a plugin dependency, one of
  which fails as a missing npm script rather than as anything recognisable
- **Fork migration** — the copies `make install` scattered into the project, which still appear
  in the menu with nothing announcing which one ran

This is prompt-driven, not a script. Explore, present what you found, confirm, then write.

## It writes only what this plugin owns

A project may place several plugins that all read one `project-profile.md`. The rules are in
`agent-workflows`' `profile-doctrine.md` → "More than one plugin writes this file", and they
bind here: own only what you read, add or update in place and never truncate, and treat a value
already there as a decision rather than something to overwrite.

The sections this plugin owns, and nothing else:
**Paths · ID schemes · Front-matter & format contract · Connected flow · Binding + run layer.**
See [profile-sections.md](./profile-sections.md).

If `agent-workflows` is also placed, its sections — Labels, Linking & branch, Platform, Git,
Docs & diagrams, Reports, Review semantics — belong to **its** setup unit. Leave them alone
whether present or absent, and say at the end that `setup-agent-workflows` covers them.

## Process

### 1. Explore

Read the repo's actual starting state. Don't assume, and don't ask for anything a command can
answer:

- `.claude/rules/project-profile.md` — does it exist? Which sections? Which of **ours** are
  missing, and which are present with values differing from the defaults?
- The test-doc directory the profile names, or `docs/tests/` if it names none — do docs already
  exist, and in what shape? An existing `TS-*.md` states the project's real id scheme and
  front-matter fields better than any question does
- The executables — the suite directories, and whether the cases there form a connected flow or
  are the standalone examples the framework ships. This is what the Connected flow section
  describes, and it is read, not asked
- `.claude/skills/`, `.claude/commands/` — local units. Flag `agent-runner-flow`, any `qw-*` or
  local `qa-*` copy, and a local `rules/qa-workflow.md`
- `~/.claude/plugins/known_marketplaces.json` — what is actually placed, and from a directory or
  a pinned commit. Also tells you whether `agent-workflows` is placed

### 2. Check both prerequisites

Neither is a plugin dependency, because Claude Code cannot express one. Both are cheap to check
and expensive to hit at run time — see `qa-workflow.md` → Prerequisites.

| Prerequisite | Check | If absent |
|---|---|---|
| the `agent-workflows` plugin | is it placed? | the `qa-*` units cite `agent-report` and `profile-doctrine` and will not resolve them — name the install, don't work around it |
| the test framework, in the project | do the scaffolder and audit scripts the profile names actually run? | `/qa-bind` and `/qa-review-bind` fail on a missing script. Name the framework install; a project can adopt everything else meanwhile |

Run the audit rather than reading for it — a script named in `package.json` that exits non-zero
on a missing dependency is the same failure one command later.

Report both as findings. Neither blocks writing the profile.

### 3. Present findings and ask

Summarise what is present, what is missing, and what conflicts. Then take the sections in
order — one topic, one answer, then the next.

**Lead each with the recommended answer so it can be accepted in a word.** Explain only where
the choice genuinely branches. Skip a topic exploration already settled: an id scheme visible in
an existing `TS-*.md` is not a question, and neither is a tests directory that is already there.

Worth actually asking about, because the default is a guess and a wrong one costs something
real: the **binding + run layer** (which command runs the suite and which runs the audit — the
gate resolves from it, so a wrong value fails CI), and the **connected flow** (its hand-off and
teardown, which no exploration can invent). The rest have defaults that reproduce this toolkit's
behaviour — say so, and move on.

A project with no connected suite yet is a real state. Record it as such; do not invent a flow
to fill the section.

### 4. Confirm

Show a draft before writing anything: the profile sections to add, any existing value you
propose to change, and the forks found with what each one became. Let the user edit.

On a refusal, write nothing and report what would have been written — a project that declines
adoption is a state to record, not an error, and the draft is what makes the next run cheap.

### 5. Write the profile

Create `.claude/rules/project-profile.md` with the doctrine preamble
([profile-sections.md](./profile-sections.md) → The doctrine half) if it is absent. Otherwise
leave the preamble and every foreign section exactly as found, and add or update only ours.

Seed values and per-section guidance: [profile-sections.md](./profile-sections.md).

### 6. Migrate the forks — ask before removing

Skip entirely when exploration found none.

This is the destructive half: **show exactly what would go, touch nothing else, and ask first.**

| Fork | Became |
|---|---|
| `.claude/skills/agent-runner-flow/` | `rules/connected-flow.md`, shipped by this plugin and cited by `qa-bind` and `qa-review-bind` |
| `.claude/commands/qw-*` (or a local `qa-*` copy) | the `qa-*` commands this plugin ships |
| `.claude/rules/qa-workflow.md` | this plugin's rule of the same name |

Say the consequence that is not guessable *before* asking:

- **A forked `agent-runner-flow` may hold the project's real flow.** Its last section is a
  fill-in block for the project's own fixtures, hand-off and teardown, and the plugin's rule
  carries no such content — it points at the profile instead. Move that block into the profile's
  Connected flow section **first**, then remove the fork. Deleting it in the other order loses
  the only written description of how the suite actually hangs together.
- **A local `qa-*` command is silently newer or older than the placed one**, and nothing
  surfaces the conflict. Until the fork is gone, `/agent-workflows-runner:qa-bind` is the only
  form that says which copy ran.

On no, leave every fork in place and carry it to the report as unresolved — a shadowing fork the
user chose to keep is a decision, not a failure. On yes, remove only the files named above.

### 7. Report

Per `agent-report`, in the words from `.claude/rules/project-profile.md` → Reports — resolve
them from the file this run just wrote rather than from memory.

**Checked** carries the sections written, the prerequisites verified, and the forks removed.
**Not done** carries the foreign sections deliberately left alone. A missing prerequisite, or a
fork the user kept, is **Unresolved** and named.

**Next** is exactly one step, and it depends on what exploration found:

- a prerequisite missing → install it; name which one and the command
- `agent-workflows` placed, its sections absent → run `setup-agent-workflows`
- no connected suite yet → the first bound executable is what fills the Connected flow section;
  name `/qa-plan` as where that starts
- otherwise → the units are ready; name the first one this project will actually use
