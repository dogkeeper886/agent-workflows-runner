# STORY-003: Rewrite the README as agent-workflows' runner half, with diagrams

## User Story

As someone discovering this repo for the first time,
I want a README that explains — in words and in pictures — that this is a worked
example of the runner half of `agent-workflows`, one I port into my own project,
So that I understand what it is, how it pairs with the commands repo, and how to
adapt its patterns to my own repo without reading the source.

## The Need

The sibling repo `agent-workflows` has a README that lands fast: a short intro, a
"why", and a set of numbered diagrams (one concept per file — flow charts, pipelines,
an anti-drift graph, the family graph) carried as SVG source in `docs/diagrams/` and
rendered PNG in `docs/diagrams/png/`. A newcomer gets the shape of the thing at a
glance.

This repo's README is 466 lines of prose with no diagrams. It already calls itself
"the runner half of the `agent-*` family," but it doesn't *show* that relationship,
and it doesn't visually explain its own key points — the dual-judge flow, the YAML
test structure, how a project installs it. The two repos are meant to be read as a
pair; right now only one of them looks the part.

The user wants this README brought up to the sibling's level: reframed to read as an
**extension of `agent-workflows`** — and, importantly, as a **worked example you port
from**, not a package you install unchanged. Every project's test setup differs, so the
reader adapts the patterns to their own repo; this repo is the reference, not a drop-in.
The README should be illustrated with per-concept diagrams in the same SVG+PNG, one-
item-per-file style. Doing this well requires actually studying both repos' commands and
skills first, so the diagrams and framing reflect how the design really works rather
than a guess.

## Success Looks Like

- The README opens by placing this repo as the runner that `agent-workflows` drives,
  framed as a **worked example the reader ports into their own (different) repo** — not
  a package installed unchanged — and so that a reader sees the two repos as a pair they
  adopt together, consistent with the sibling repo's own framing of the family.
- Each key point a newcomer needs is backed by a diagram: at least the dual-judge
  decision flow, the YAML test-case / suite structure, and the **`make install` port
  flow** (what gets copied where, into the reader's own repo) — plus the cross-repo
  relationship.
- Diagrams follow the sibling's convention: one concept per file, numbered, SVG source
  in `docs/diagrams/` with a matching rendered PNG in `docs/diagrams/png/`, embedded in
  the README with descriptive alt text.
- A reader who has never seen either repo can tell, from the README alone, what this
  framework is, how it relates to `agent-workflows`, and how to port it in.
- The README follows current README best practice: a title + one-line what/why/who, a
  table of contents, a quickstart / `make install` near the top, usage with copy-paste
  examples, and a structure scannable enough to read cold — answering what, why, and
  how without reading the source.

## Open Questions

- **Framing — settled.** This repo is a **worked example you port from**: every
  project's test setup differs, so the reader adapts the patterns rather than installing
  unchanged. The port mechanism is **`make install TARGET=… NAME=…`** — a well-known,
  easy-to-describe Make target that copies the runner source, example test cases,
  scripts, workflows, and skills into the target repo and stamps in the project name
  (with `/install` as the agent-driven alternative). The README should **feature the
  Makefile prominently** — show how it's used and what it does — as the concrete bridge
  between "this is an example" and "here's how you bring it into your repo."
- **Approach — settled.** Full rewrite: delete the current 466-line README and write a
  fresh one from current understanding against README best practice, not a patch of the
  old prose.
- **`docs/skill-inventory.md` — remove, but mine first.** It's a STORY-001 decision
  record ("retire nothing"), referenced by nothing, so deleting it breaks no links. Its
  artifact → role → referenced-by table is, however, the best existing map of what each
  command/skill is and who uses it — harvest that into the README/diagrams before the
  file is deleted, so the mapping isn't lost.
- Which key points earn a diagram, and the final diagram list + numbering — the four
  above are a starting set, not a fixed scope.
- Diagram toolchain: how the sibling's SVGs were authored and rendered to PNG (by hand,
  Mermaid, a script?), and whether to match that toolchain or pick our own.
- Whether the diagrams should live only here, or whether the cross-repo relationship
  diagram is shared with / mirrored in `agent-workflows`.

## Status

- Created: 2026-06-12
- Plan: #29
- Issues: #30, #31, #32 — PR #33 open
