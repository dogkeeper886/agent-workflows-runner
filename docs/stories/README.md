# `docs/stories/` — the story format

Each story is a **readable markdown document** that lives here. It states a **need** — a
goal, not a spec — in the user's terms. The markdown is the *canonical* record of *why* a
piece of work exists; it is the stable anchor the plan and task issues trace back to.
`dw-story` writes these; `dw-review-story` reviews them.

The **how** — the agreed approach and the work itself — lives in the **plan issue** and the
**task issues** on GitHub, **not here**. A story says what's needed and what success looks
like; it does not freeze a design. Keeping the *how* out of the story is what lets the
approach evolve on the issues without rewriting the need.

## One file = one story

```
docs/stories/
  STORY-001.md   # one story: the need + success, nothing about the build
  STORY-002.md
```

- File + id follow the project's `STORY-XXX` convention — `STORY-NNN.md`, no slug (see `.claude/rules/project-profile.md`).
- A story is **plain markdown — no front-matter.** It opens with `# STORY-NNN: <Title>`.

## Sections

In order, every story carries:

```markdown
# STORY-NNN: <specific title>

## User Story
As <role>, I want <goal>, so that <benefit>.

## The Need
<the problem behind the request, in the user's terms — the why, not the how>

## Success Looks Like
- <an outcome someone could observe once this is delivered>

## Open Questions
- <what's genuinely unresolved — or "none known"; deferred to the plan/issues>

## Status
- Created: <date>
```

- **User Story** — a real role, action, and a benefit that isn't just the action restated.
- **The Need** — the problem and why it matters, in the reader's terms. No files, APIs, or
  step-by-step build detail.
- **Success Looks Like** — observable, user-facing outcomes — not implementation steps.
- **Open Questions** — the uncertain *how*, deferred to the plan/issues. Empty-because-skipped
  is a finding, not a pass.
- **Status** — the record below.

## Status conventions

The Status block grows as the work moves, linking the story to its GitHub artifacts:

```markdown
## Status

- **Completed: <date>** — <one line on what shipped> (PRs #<n>, #<n>).
- Created: <date>
- Plan: #<plan-issue>
- Issues: ✅ #<n> (PR #<n>), ✅ #<n>, …
```

- `Created:` on every story; the **bold `Completed:`** line is added (first) once delivered.
- `Plan:` is the `[STORY-XXX] Plan` issue (`dw-plan`); `Issues:` are the tasks (`dw-tasks`),
  ✅ when closed.

## Goal, not spec

`dw-review-story` gates exactly this: the story is **complete** (every section present and
substantive) and stays a **goal document** — no leaked implementation, success written as
outcomes, the technical *how* left to the issues. A story decidable by someone who won't
build it has passed.

## Traceability

- **story → plan/tasks:** the `Status` block's `Plan:` and `Issues:` lines.
- **plan/task → story:** the issue's `[STORY-XXX]` title prefix and `Part of` link.

No hand-maintained index — the links live in the files and the issues, and resolve by
path / `gh`.

## Beyond the story (the plan + issues)

The approach, the task breakdown, and the build history are the **plan issue** and **task
issues'** concern, not this format's. The story records the need; the issues carry the how
(see `.claude/rules/dev-workflow.md`).
