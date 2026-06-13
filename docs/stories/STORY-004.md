# STORY-004: Let the LLM judge run on a Claude Code subscription

## User Story

As someone running the template's tests on a Claude Code Pro/Max subscription,
I want the LLM judge to work without a Console API key,
So that I can get the second-opinion verdict on my own plan instead of being shut out unless I pay per token for a separate key.

## The Need

The dual-judge experience is meant to be available to anyone who wants a second
opinion — that was the promise STORY-001 left in place. But the LLM judge reaches its
model through the raw Anthropic client, and that client only knows one way to
authenticate: a Console API key (`ANTHROPIC_API_KEY`), billed per token, or an
Anthropic-compatible endpoint you stand up yourself.

A Claude Code subscription doesn't come with a Console key. So the person most likely
to be running this tooling — someone already on Pro or Max, already authenticated
through `~/.claude` — can't turn on `LLM_JUDGE_MODE=dual` at all. The SDK 401s on a
placeholder key, and there's no path that uses the subscription they already pay for.

This isn't a hypothetical. The sibling repo `testlink-mcp` hit the same wall and got
past it: its test framework runs Claude **keyless on the subscription** (its
`agent-judge` authenticates through `~/.claude` locally and a `CLAUDE_CODE_OAUTH_TOKEN`
in CI, no Console key anywhere). The capability exists in the family; this template
just doesn't have it yet.

The raw Anthropic path isn't wrong — request-in, JSON-verdict-out is the right shape
for one-shot judging, and it's the right answer when you *do* have a key or a local
endpoint. The gap is purely auth: there's no keyless option for the subscription case.

## Success Looks Like

- Someone on a Claude Code subscription with no Console API key can turn on the LLM
  judge and have it actually run — drawing on the subscription they already have,
  not a separate per-token key.
- The same works unattended in CI, authenticated the keyless way rather than by a
  Console key baked into a secret.
- The existing key / local-endpoint path still works exactly as it does today — this
  adds a way in for subscription users, it doesn't take the current one away.
- Choosing between "use my subscription" and "use my key/endpoint" is a matter of
  configuration, not a code change.
- When the chosen path can't authenticate or reach a model, the run degrades cleanly
  to the deterministic judge, the same way it does today — the default path stays
  model-free and nothing hard-fails for lack of a key.
- The README and judge docs read true: a subscription user can find the keyless path
  and a key-holder can find theirs, without either being told to do the impossible.

## Open Questions

- What's the keyless mechanism? The issue proposes `@anthropic-ai/claude-agent-sdk`
  (a non-interactive `query()` per judgment); the sibling `testlink-mcp` proved it
  with the Agent Client Protocol (`@agentclientprotocol/sdk` + a bundled Claude ACP
  agent). Which fits this template better is a research/POC question for the plan.
- How is the backend selected — a new setting (e.g. `LLM_JUDGE_BACKEND=agent-sdk|messages`),
  inferred from whether a key is present, or something else? What's the least
  surprising default?
- Reusing a subscription OAuth token with the *raw* SDK is prohibited — confirm the
  chosen path is a sanctioned keyless route, not a token reused the wrong way.
- How does the keyless path authenticate in CI versus locally (`CLAUDE_CODE_OAUTH_TOKEN`
  vs `~/.claude`), and does that ripple into the CI workflows that already let a caller
  pick a judge mode?
- Does the keyless backend change the per-judgment cost/latency or the shape of the
  verdict enough to matter, given the model runs through an agent loop rather than a
  single Messages call?
- This is a *template* others port — does the keyless path add a dependency or a setup
  step that every downstream install inherits, and is that acceptable?

## Status

- Created: 2026-06-13
- Issues: #35
- Plan: #36
- Tasks: #37 ✓, #38, #39 ✓, #40 ✓
- PRs: #41 (#37 + #39 — merged 2026-06-13), #43 (#40 — merged 2026-06-13)
- Tests: none
