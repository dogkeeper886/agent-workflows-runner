# connected-flow

How the **executables** a binding points at must be designed. `qa-bind` links a test doc to
the file that runs it and `qa-review-bind` audits the pair — but that audit is structural: it
checks the `Script:` resolves and the step counts match. It cannot see a suite that hardcodes
a backend id, re-bootstraps its own fixtures, or leaks them. A test can be `bound` and still
be wrong in every way that matters at run time.

This is what closes that gap, and it travels with the units for the same reason the audit
does: a project that installs the commands without the design rules authors executables the
gate will happily pass.

Mechanics — the executable's schema, how the suite runs — belong to the project and resolve
from `project-profile.md`. This file is the *why* and the *rules*.

## The goal (non-negotiable)

The integration tests are **one self-contained, connected end-to-end flow** — not a bag of
independent tests. A run provisions its own fixtures, threads them through every stage, and
tears them all down, leaving the backend as it found it. It must pass against a **fresh**
backend — the only precondition being that the backend's API is reachable — repeatably.

## The five rules

1. **Embed every test in the flow — never an island.**
   A new test consumes fixtures produced upstream and declares the producing stage through
   whatever ordering field the executable format has (`dependencies:` here). It does **not**
   bootstrap its own project/parent objects. If it creates a fixture, that fixture is removed
   in the shared teardown stage, not by the test itself.

2. **No hardcoded instance IDs.**
   Never write a real backend ID into a test. Every ID is created at runtime by a stage and
   threaded downstream. The only allowed literals are values portable across any fresh
   spin-up (e.g. a built-in default account).

3. **No IDs in names; no random or timestamp suffixes.**
   Fixtures are **stable named test data**. Do not embed a runtime id or a random/`$$`/
   timestamp value into a name to get uniqueness — use a stable name with **idempotent
   reuse-or-create** (look up by name, reuse if present, else create). This survives a fixture
   leaked by a failed run.

4. **Everything is connected — no parallel islands.**
   Fixtures must relate to each other, mirroring the system's real graph. A new entity that
   doesn't connect to the chain is not embedded — link it.

5. **Teardown leaves the backend clean.**
   The final stage removes everything the flow created and depends on every fixture-consuming
   test so it runs last. It verifies removal where it can (e.g. a read-back reports the entity
   gone).

## Checklist for a new or edited executable

- [ ] Declares the stage(s) producing the IDs it reads as its dependencies, so the run order
      follows the data rather than a hand-kept sequence
- [ ] Reads fixture IDs from the shared hand-off — zero hardcoded instance IDs
- [ ] Any fixture it creates has a **stable name** + idempotent reuse-or-create
- [ ] Any fixture it creates is published to the hand-off and removed in teardown
- [ ] The new entity is **linked into** the connected graph, not standalone
- [ ] Steps emit a marker to assert on, and parse structured responses rather than dumping raw
      output — a raw dump puts stray error strings in front of a deterministic judge
- [ ] The suite still passes against a fresh backend, twice (idempotent)

## Anti-patterns

- A "self-contained" test that creates *and* tears down its own parent objects in isolation —
  it duplicates setup and breaks the shared lifecycle. Embed it instead.
- Hardcoded instance IDs, or IDs and random values baked into fixture names.
- An entity created but never connected to the flow's chain.
- A fixture created with no corresponding teardown — it leaks across runs.

## This project's flow

The rules above are portable; their instantiation is not. The hand-off that carries fixture
IDs, the stable fixtures each stage creates, how they connect, and the teardown stage are
**values** — `project-profile.md` → Connected flow, written during adoption by
`setup-agent-runner`.

A project whose profile has no such section has not instantiated a flow. Say so rather than
inventing one: the rules still bind, and the first connected suite is what fills the section
in.
