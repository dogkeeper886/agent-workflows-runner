# STORY-002: Rename repo to `agent-workflows-runner`

## User Story

As a maintainer of the agent-workflows family,
I want this repo renamed from `test-framework-template` to `agent-workflows-runner`
and framed as the family's runner,
So that the `agent-*` naming is consistent everywhere and the sibling repo's
reference sweep can close.

## The Need

The sibling repo `ai-qa-workflow` was renamed to `agent-workflows` to align an
`agent-*` family: **agent-workflows** (the commands), **agent-workflows-runner**
(this repo — the test runner the workflows drive), and **agent-studio** (the
flagship). This repo is the only one still carrying its origin name,
`test-framework-template`, which reads as a generic starter kit rather than the
runner half of a named family. Until it's renamed, the family naming is incomplete
and `agent-workflows` #78 — which updates that repo's references to this one — stays
blocked.

The intent is a **slug-and-framing** rename, not a full rebrand: align the repo's
name and present it as the family's runner, while keeping the "dual-judge test
framework" descriptor and leaving the build labels and package name as they are. How
far the README reframe goes is left to the issue.

## Success Looks Like

- The repo is `dogkeeper886/agent-workflows-runner`; the local `origin` remote points
  at it and pushes work.
- No stale `test-framework-template` slug or URL references remain, except the
  historical record in `docs/stories/STORY-001.md`.
- The README reads as `agent-workflows-runner` in the `agent-*` family, keeping the
  "dual-judge test framework" descriptor.
- `agent-workflows` #78 is unblocked — the runner rename is done and noted there.

## Open Questions

- README reframe depth — H1 + intro only, or a fuller two-product-family rewrite?
- Coordination/timing so #78's reference sweep doesn't run before this rename lands.
- Whether the GitHub repo description / topics need updating alongside the slug.
- Out of scope, to confirm on the issue: `Makefile` labels, `cicd/tests/package.json`
  `"name"`, and the historical `docs/stories/STORY-001.md` line stay untouched; the
  family table + `docs/integrations/README.md` row live in the `agent-workflows` repo
  under #78.

## Status

- Created: 2026-06-11
- Plan: #24
- Issues: ✅ #25 (repo rename, closed), ✅ #26 (refs + README — merged, PR #28), #27 (#78 handoff, pending)
