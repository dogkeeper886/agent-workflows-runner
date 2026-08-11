# `dw-test-design` stays in this repo, flat under `.claude/commands/`

This repo carried stale forks of the nine `dw-*` and two `doc-*` commands the upstream
`agent-workflows` plugin already ships, shadowing the installed copies. Deleting them left
`dw-test-design` — the one command upstream does **not** ship — as the sole occupant of a
`.claude/commands/dev-workflow/` directory named for a pipeline this repo no longer owns.

We keep it here and move it flat, to `.claude/commands/dw-test-design.md`.

## Considered Options

- **Move it into `plugins/agent-workflows-runner/commands/`** — this repo's own plugin,
  and the candidate the ticket named. Rejected: that plugin's stated job is the `qw-*` QA
  lifecycle, and a `dw-*` command inside it would be a second job. The command also
  references `/dw-implement` and `/dw-create-pr`, which ship from a *different* plugin —
  shipping it here would hand every installing project a command whose chain has a
  cross-plugin dependency Claude Code cannot express.
- **Leave it in `.claude/commands/dev-workflow/`** — smallest diff. Rejected: the
  directory is named for the pipeline we just stopped owning, so the name asserts
  something no longer true, and a future reader would reasonably read it as more of the
  same shadowing.
- **Contribute it upstream** so the plugin ships all twelve. Not rejected on the merits —
  it is simply a change to another repo, out of this ticket's scope. If upstream takes it,
  this ADR is superseded and the command is deleted here.

## Consequences

The command resolves as `/dw-test-design` rather than `dev-workflow:dw-test-design`.

`.claude/commands/` now holds exactly one file, and the rule of thumb for it is: a command
here is one upstream does not ship. Anything upstream ships is installed, never copied.

`dw-test-design`'s producer→review pairing is not stated in the plugin's
`rules/dev-workflow.md` — upstream has no row for a command it does not ship. The pairing
is declared in `CLAUDE.md` §5 instead: its review is running the suite.

`make install` copies the repo-root `CLAUDE.md` into adopting projects but never copies
`.claude/commands/`, so that file names a command adopting projects do not receive. That
mismatch predates this decision — `templates/CLAUDE.md` exists for adopting projects and
nothing consumes it — and is tracked separately.
