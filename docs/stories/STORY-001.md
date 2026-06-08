# STORY-001: Bring the template's testing experience back in line with its tooling

## User Story

As a maintainer of the test-framework-template,
I want the template's test runner and its Claude tooling to describe the same, modernized experience — fast by default, with an optional LLM judge that talks to its model the standard way,
So that someone installing the template gets a coherent setup instead of commands and docs that promise a workflow the code doesn't actually run.

## The Need

This template was adopted downstream by `ai-qa-step-graph`, which then matured the
experience. Two things drifted apart here:

- **The tooling has already been copied in** — the `dev-workflow` and `qa-workflow`
  commands under `.claude/commands/`, the `reviewing-artifacts` / `reviewing-phrasing`
  / `reviewing-typography` skills, and the `CLAUDE.md` discipline. They sit in the repo
  untracked and unreconciled.
- **The test runner still behaves the old way.** It leans on an LLM judge by default,
  and that judge reaches its model through a hand-rolled HTTP call to Ollama rather than
  the standard client every other Anthropic-compatible tool uses.

So the copied-in commands and docs talk about a testing flow the runner doesn't deliver,
and the template carries skills it may no longer use. A person installing this template
can't trust that what the tooling says is what the code does. The experience should be:
fast and deterministic out of the box, with the LLM judge there when you want a second
opinion, reached through the standard client so any Anthropic-compatible endpoint
(including a local one) is just configuration — and with the tooling trimmed to what the
template actually uses.

## Success Looks Like

- Running the tests with no extra flags is fast and needs no model — the deterministic
  checks are the default verdict.
- The LLM judge is still available as a second opinion when asked for; the dual-judge
  idea is kept, not dropped.
- When the LLM judge does run, it reaches its model through the standard Anthropic client,
  so pointing it at any Anthropic-compatible endpoint (a hosted one or a local Ollama) is
  a matter of configuration, not a code change — and it degrades cleanly when no endpoint
  is configured.
- The copied-in commands, reviewing skills, and `CLAUDE.md` are reconciled into the repo
  and describe this same experience — nothing references a workflow the runner no longer
  performs.
- The template ships only the skills it actually uses; ones that no longer earn their
  place are retired.
- The README and rules read true against the runner's actual behavior.

## Open Questions

- Which skills count as "unused" and should be retired, versus kept? (Needs an
  inventory of what the template actually exercises before anything is removed.)
- Should the default-vs-opt-in choice be a flag, an environment setting, or both — and
  what is the least surprising default name for the dual mode?
- How should a configured-but-unreachable model endpoint behave — skip with a notice, or
  fail the run? (Leaning skip, to keep the default path model-free.)
- Does retiring/reconciling tooling ripple into the CI workflows that currently let a
  caller pick a judge mode?
- The downstream `step-store` semantic-reuse pattern (vector store + its own service) is
  explicitly **out of scope** here — is it worth a separate future story, or not for a
  template?

## Status

- Created: 2026-06-08
- Tasks: #15, #16, #17
- Tests: none
