# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## 5. Workflow discipline

Substantial work flows through a pipeline; each step is a gate that stops for a
human decision (commands suggest the next, they never auto-run it).

These pipelines are **plugins you install** — nothing here ships them, and none of their
commands exist in this project until you do. `agent-workflows` carries the dev and doc
pipelines; `agent-workflows-runner` carries the `qa-*` QA lifecycle and requires it:

```bash
/plugin marketplace add dogkeeper886/agent-workflows
/plugin install agent-workflows@agent-workflows

/plugin marketplace add dogkeeper886/agent-workflows-runner
/plugin install agent-workflows-runner@agent-workflows-runner
```

**dev-workflow** — a need into shipped code:

```
dw-story → dw-review-story → dw-plan → [human reviews the plan issue]
        → dw-tasks → dw-review-tasks → dw-implement → dw-review-implement
        → dw-create-pr → [human review + /review] → dw-merge
```

**qa-workflow** — a spec into trustworthy tests:

```
qa-plan → qa-review-plan → qa-cases → qa-review-cases → qa-bind → qa-review-bind → qa-run
```

**doc-workflow** — a codebase into its README:

```
doc-gen-readme → doc-review-readme → [human reviews] → PR
```

Each flow and its producer→review pairing live in the rules of the plugin that ships it —
`rules/dev-workflow.md` and `rules/doc-workflow.md` in `agent-workflows`,
`rules/qa-workflow.md` in `agent-workflows-runner`. Trivial work skips the plan:
`dw-story → dw-tasks`. `qa-run` is `npm test`, a phase rather than a command, and
`qa-review-bind`'s audit (`npm --prefix cicd/tests run audit-bind`) is the one gate — it
exits non-zero, so wire it into CI if you want it to fail a build.

Two review gates are external skills these plugins do not own — invoke them by hand:
- `code-review` (bundled): adversarial diff review. Run after `dw-implement`,
  alongside `dw-review-implement`. Earns its cost on logic/risk; skip for pure docs.
- `/review` (builtin): PR overview. Run after `dw-create-pr`, before `dw-merge`.

Don't wire these into the pipeline commands — they may not exist in every install,
and a command that references a missing skill is a dangling pointer.

**Right-size it.** A typo or a one-line doc change does not need the full chain —
use judgment; branch + PR + merge is enough. The three review passes overlap:
`dw-review-implement` is the always-on substance gate, `code-review` is for real
logic or risk, `/review` is the PR summary. Running all three on a trivial diff is
ritual, not rigor.

## 6. Artifact & doc review discipline

Match the reviewer to **who reads** the file you changed:

- **Human-read docs** (README, `docs/` prose): run `reviewing-phrasing` (the words)
  + `reviewing-typography` (the look) — the human-read doc review.
- **Agent-read tooling** (commands, skills, CLAUDE.md, rules): run
  `reviewing-artifacts` (does it do its job — one job, complete, goal-not-spec,
  fits the project, right for its reader).

These ship from the `agent-workflows` plugin installed above. Like the dev-workflow
gates, they stop for a human and never auto-run — invoke them by hand.

**Right-size it.** A typo or a one-line tweak does not need a review pass — use
judgment. Reach for these when a change is substantial enough that the look, the
wording, or the artifact's fitness actually matters.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
