# Rename the QA lifecycle commands from `qw-*` to `qa-*`

`qw-` abbreviated `qa-workflow`, and dated from when the commands lived in a
`.claude/commands/qa-workflow/` directory. That directory is gone — the commands ship from
this repo's plugin now — and `qw-` was the last survivor of a naming scheme its own author
has moved off.

The six commands become `qa-plan`, `qa-review-plan`, `qa-cases`, `qa-review-cases`,
`qa-bind`, `qa-review-bind`. The `qa-run` phase follows.

## The precedent this follows

`agent-workflows#135` renamed `dw-create-pr` / `dw-merge` to `ship-create-pr` /
`ship-merge`, after `#123` deleted the seven `dw-*` commands that competed with
`mattpocock/skills`. Its reasoning gives two rules, and both decide this:

1. **A prefix must name something that still exists**, and should name what the commands
   *do* — not where they used to live, and not what ships them. `dw-` named a deleted
   pipeline, so it "named nothing."
2. **Keep a prefix.** They explicitly rejected bare `/merge` and `/create-pr`: the
   unqualified form is invocable, so a command lands in a shared namespace already holding
   things like `resolving-merge-conflicts`. A prefix also keeps the group clustered in the
   `/` menu.

## Considered Options

- **Keep `qw-`.** Rejected. It is an opaque abbreviation — `dw-` and `doc-` at least
  gesture at "dev" and "doc"; nothing about `qw-` says QA to someone who has not read the
  docs. It also no longer matches any sibling: upstream ships `doc-*` and `ship-*`.
- **Rename to the repo name, `agent-workflows-runner-*`.** Rejected. Claude Code already
  namespaces plugin commands as `<plugin>:<command>`, so this yields
  `/agent-workflows-runner:agent-workflows-runner-plan` — the prefix stated twice, and 30
  characters before the word carrying the meaning. `profile-doctrine.md`'s `<repo-name>-`
  rule is scoped to a project's *own* units, "ones no other project wants"; these are the
  shared ones, shipped to every consuming project. And #135 chose `ship-`, four characters
  naming a job, over `agent-workflows-create-pr`.
- **Drop the prefix — `/plan`, `/cases`, `/bind`.** Rejected for the reason #135 gives:
  the bare form is invocable, and those names are far too generic for a shared namespace.
- **`qa-`.** Chosen. Short, a real word, and it names the discipline the commands serve —
  the same virtue `ship-` has. It matches `rules/qa-workflow.md`, which every one of these
  commands cites as its first line of doctrine.

## Consequences

**It resolves a live collision from our side.** Both plugins are installed at user scope
and both currently ship `qw-cases`, `qw-plan`, `qw-review-cases` and `qw-review-plan` —
verified with `claude plugin details` on each. That is ADR-0002 of the upstream repo
(`complement-mattpocock-skills`) mid-landing: it moves the QA authoring half here, and
upstream keeps its copies until `agent-workflows#128` removes them. Renaming clears the
overlap without waiting on another repo. **#128 is still the other half** — this decision
does not close it.

**No ASCII realignment was needed.** `qw-` and `qa-` are both three characters, so every
diagram and aligned comment column survives the rename untouched. #135 had to realign by
hand because `dw-` → `ship-` grew by two.

**Discovery rests on the prefix.** The `/` menu is where a user meets these commands, and
typing `/qa` filters to the family. The qualified `<plugin>:<command>` form is for
disambiguation, not browsing. The per-command description the menu shows is each file's H1
heading — these commands carry no front-matter `description:` — so the H1s remain the only
per-command prose a user reads.

**`docs/stories/` keeps the old names.** STORY-005 still says `qw-bind`, `qw-review-bind`,
`qw-drift`; those records describe what was true when written, and `qw-drift` names a
command deleted long since. The same call #135 made for its two completed stories.
