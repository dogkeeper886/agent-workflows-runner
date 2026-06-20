# STORY-005: Re-base the runner onto the upstream template's customization seam

## User Story

As someone porting this runner into my own project,
I want the generalized workflow tooling to stay generic and all the project-specific
values to live in one declared place,
So that I customize a single profile instead of editing — and later having to re-merge —
the shared commands, skills, and rules.

## The Need

The upstream sibling `ai-qa-workflow` was redesigned into a reusable **template**: it
introduced a customization seam, `.claude/rules/project-profile.md`, where a project
declares *all* its specifics — paths, ID schemes, labels, branch and merge conventions,
format contracts, audience, live integrations. The generalized commands, skills, and
rules then **resolve** those values from the profile instead of hardcoding them. You
customize the profile; you never touch the generic units.

This runner forked **before** that redesign. It never got the seam, so its
project-specific values are scattered through the generic units, and some of its
generalized commands carry pre-template text that has since gone stale — including
references to a `step-store` / `make query` layer this runner doesn't even have. The
result: the runner can't cleanly track upstream's improvements, and anyone adopting it
has to edit the generic parts to make it theirs, which is exactly what the template
redesign set out to end.

The runner also has its own real identity that the upstream doesn't: a `cicd/` test
runner and a binding / run / drift layer (`qw-bind`, `qw-review-bind`, `qw-drift`).
Upstream's qa-workflow *defers* that layer to "the project's own layer" — this runner
*is* that layer. So this is not a blind copy of upstream: the generic base should come
from upstream, but the runner's own commands, skills, and rules must be preserved as a
clearly separated layer, and the profile must declare that this project owns binding and
running rather than deferring them.

## Success Looks Like

- A newcomer customizing the runner edits **one** file — the profile — to point it at
  their paths, IDs, labels, and conventions, and never has to modify a generalized
  command, skill, or rule.
- The generalized tooling matches upstream closely enough that future upstream
  improvements can be pulled in by re-syncing, not hand-reconciling.
- The runner's own layer — the `cicd/` runner, its binding/run/drift commands, its
  runner-specific skills and rules — is intact and visibly separate from the generic
  base, and the profile names that layer as something this project owns, not defers.
- Stale references to tooling the runner doesn't have (the `step-store` / `make query` /
  `make up` layer) are gone; the docs point at the runner's real commands.
- The docs read true: the test-doc format contract still describes the runner's actual
  binding/drift behavior, and a reader can find the one place to customize.

## Open Questions

- How much of upstream is a byte-identical adoption versus a runner-aware merge, and
  which files fall in each bucket? (Worked out on the plan.)
- Adopting upstream's qa-workflow means test plans become persisted GitHub issues rather
  than chat-only — is that behavior change wanted here, given GitHub is a live
  integration for this repo?
- How should the test-doc format contract reconcile upstream's "binding is out of scope"
  stance with the fact that this runner owns binding/run/drift?
- Which runner-specific lines in the shared units (the `dw-test-design` review pairing,
  the `code-review` / `/review` gate guidance in CLAUDE.md) must survive the merge rather
  than be overwritten by the upstream version?

## Status

- Created: 2026-06-21
- Plan: #48
- Issues: #49 (PR #53, open), #50, #51, #52
- PRs: #53 (#49) — open
