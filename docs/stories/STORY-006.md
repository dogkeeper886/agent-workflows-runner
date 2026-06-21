# STORY-006: Verify LLM-generated content against live ground truth (agent-driven testing via MCP)

## User Story

As someone testing an AI system that calls tools,
I want the framework to check not just *that a command ran* but *whether the model
actually used the right tools and told the truth* — confirmed against the real data,
So that a test passes only when the AI's behavior and its answer are genuinely correct,
not merely non-empty.

## The Need

Today this framework verifies static things well: exit codes, expected patterns, and —
with the agent judge — whether generated text reads as reasonable against written
criteria. But the agent judge evaluates *passively*: it reads the output and forms an
opinion. It cannot go and check. So two failures slip through:

1. **Tool use is untested.** When the system under test is a model that's supposed to
   drive tools (an MCP server), nothing confirms it picked the right tool, called it with
   valid arguments, and got a real result back.
2. **Answers are taken on trust.** A fluent, plausible answer that silently invents or
   misreads the underlying data passes — because no one fetches the real data to compare.

The framework's own README lists "agent-driven testing via MCP" as **roadmap, not yet
built** — the judge attaching live tools to gather what a test needs. A downstream adopter
has since proven it works end-to-end. This story brings that capability home: the
framework should be able to put a model in front of a *real* MCP server and grade both
its tool use and the truthfulness of its answer against what the live tools actually
return.

Because this is the upstream others port from, the capability must stay **portable**: it
cannot bind the framework to any one model runtime or vendor, and a project must be able
to point it at *their* system under test without editing shared code.

## Success Looks Like

- A test can run a model against a real MCP server and report whether it could actually
  use the server's tools (right tool, valid arguments, real result, a non-empty answer) —
  a clean verdict, including a clear "this model can't do tools" result rather than a
  crash.
- A test can independently verify the model's answer against live ground truth: something
  trustworthy calls the server's read-only tools itself, compares the answer to the real
  data, and fails answers that claim things the data doesn't support — even when those
  answers look fluent.
- When the independent verifier can't run (e.g. missing credentials in CI), the test
  **fails closed** with a clear reason — never a false green.
- The verification reaches the live tools through an open, vendor-neutral agent standard,
  so the model doing the checking can be swapped by configuration rather than code.
- A project adopting the framework points it at *their* model runtime and *their* MCP
  server through one declared place; the shared runner code carries no single-vendor
  assumptions.
- The README's "agent-driven testing via MCP" capability is marked **shipping**, and the
  docs make clear how this differs from the existing single-tool MCP call helper.

## Open Questions

- Where exactly is the seam that keeps the model runtime swappable, and what is the
  minimal contract it must expose? (Worked out on the plan.)
- How is the read-only boundary for the independent verifier enforced and proven, so a
  verification run can never mutate the system it's checking? (Plan / proof of concept.)
- What does the verifier need to authenticate in CI, and how does the fail-closed
  behavior surface there? (Plan.)
- How should the new capability be exposed — a dedicated run mode, a workflow, an example
  — and how does it sit alongside the existing MCP call helper without duplicating it?
- What's the right deterministic backstop so the checking model can't simply wave an
  answer through? (Plan.)

## Status

- Created: 2026-06-21
- Plan: #57
- Issues: ✅ #58 (PR #64), ✅ #59 (PR #65), ✅ #60 (PR #66), #61, #62, #63
