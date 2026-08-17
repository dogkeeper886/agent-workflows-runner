---
name: create-test
description: |
  Writes a test that proves something about the running system rather than about a fake, and
  does not stop until it has been seen failing for the right reason and passing twice against
  a fresh environment. Works at system level or above, in whatever framework the project
  already uses, from one named thing the system must do. Any dependency it has to substitute
  is named in the result, never left silent.
when_to_use: |
  Use whenever a test is to be written or extended — "write a test for X", "add a case for
  the login flow", "we need coverage here", "test this", "prove that works", "can you cover
  the error path", "there's no test for that". Reach for it when review-ci-system names a gap
  worth closing, and when someone reports a bug that shipped, since the test that would have
  caught it is the first thing to write. Not for judging an existing suite, not for running
  one, and not for deleting a test.
argument-hint: "[what to prove, or the key point it comes from]"
---

# Write a test that proves something

Target: $ARGUMENTS — what the test must prove.

**A test earns its place by what it would catch, not by existing.** The failure this unit
exists to prevent is the test that passes forever: it substitutes every dependency, asserts a
value it fed the substitute itself, and reports green while the system it claims to cover is
broken. Such a test is worse than none, because it is counted.

## 1. Name what it proves

One thing the system must do, stated before any code is written. Where `review-ci-system`
named a gap, that is it. Where the request is looser — *"test the login flow"* — turn it into
a claim that can be false: *a user with a valid password reaches the dashboard; one with a
stale session does not.*

**If you cannot state what would make it fail, do not write it yet.** That sentence is the
test; the code is only how it is checked.

## 2. System level or above. Never a new component test

| Write | Why |
|---|---|
| System — the assembled thing through its real entry point | it answers *does this work* |
| System integration — plus the real external services | it answers *does this work with them* |
| Acceptance — the delivered thing as a user or operator meets it | it answers *is this ready* |

A component test asserts today's internal structure. It answers *did I break this refactor*,
which is a different and smaller question, and it is what the suite already has too much of.

**One exception, and it is narrow:** a pure algorithm with no dependencies — a parser, a
comparison, a date calculation — has no level above component that means anything. Write it
there and say so.

## 3. Use the framework the project already runs

Find it the way the project does: its test script, its test config, the runner its CI calls.
Write the new test as a file that runner already collects.

**Do not introduce a second test system beside a working one.** A project running vitest with
seventeen suites does not need a YAML runner placed next to it — that leaves two answers to
*did it pass* and nobody knowing which is authoritative.

Reach for a second runner only where the project's own framework structurally cannot go — a
live end-to-end pass against services its suite deliberately stubs — and then use whatever
the project has for that, adding one only if it has none.

## 4. Functional unless asked

The default is a functional test: does it do the thing. A non-functional one — load,
performance, security, usability — needs a stated target, a stated environment and a stated
threshold, and inventing those produces a measurement nobody agreed to. Offer it; never
assume it.

## 5. Reach the real thing, or say what you substituted

The point of writing above component level is that something real is exercised. Start from
the real dependency and substitute only where you must.

Where a substitution is unavoidable — a paid API, a device that is not present, a service
with no test instance — **say so in the result**, in the report and in a comment at the seam.
A silent fake is how a suite comes to prove nothing while looking complete.

And a fake large enough to reimplement the dependency's behaviour — minting ids, enforcing
its rules — is a second implementation with nothing checking it matches. If you write one,
write the contract test that pins it to the real thing, or do not rely on it.

## 6. Fixtures: stable names, threaded, torn down

Five rules, and they are what makes a suite survive its own failures:

1. **Consume what an earlier stage produced.** A new test does not bootstrap its own parent
   objects; it declares what it depends on and reads the ids from there.
2. **No literal instance ids.** Every id is created at run time and threaded downstream. The
   only safe literals are values portable across any fresh environment.
3. **Stable names, never suffixed.** No random value, no timestamp, no pid in a fixture name.
   Look up by name, reuse if present, create if not — so a fixture leaked by a failed run is
   found rather than duplicated.
4. **Link it into the chain.** A fixture that relates to nothing else is an island, and
   islands hide the integration failures this level exists to catch.
5. **Tear down what you created**, and verify the removal where the system can report it.

## 7. Run it. Two gates, and neither is optional

**Gate one: has it been seen failing for the right reason?** A test that has only ever passed
proves nothing about what it asserts. Break the thing it covers on purpose — revert the fix,
change the value, stop the service — and watch it fail with a message that names the real
cause. If it still passes, it asserts nothing; go back to step 1.

**Gate two: does it pass twice against a fresh environment?** Once proves it runs. Twice
proves it cleaned up after itself. A second run that fails on a leftover fixture is a
teardown defect, not a flake; go back to step 6.

Only when both gates are met is the test written.

## Steps

Copy this checklist and tick each item as you finish it:

    Task Progress:
    - [ ] What it proves stated as a claim that could be false
    - [ ] Level chosen — system or above, or the algorithm exception declared
    - [ ] Written for the runner the project already collects with
    - [ ] Every substitution named in the report and at the seam
    - [ ] Fixtures stably named, threaded, torn down
    - [ ] Seen failing for the right reason
    - [ ] Passed twice against a fresh environment

## Report

Two lines and a question:

    WRITTEN — a write reaches the real backend and the id it answers with is the id a read
    answers to. Failed correctly with the service stopped; passed twice fresh.
    Next: review what the suite proves now.
    Want the test?

A test that met one gate and not the other is not written, and says so:

    NOT WRITTEN — passes, but still passes with the backend stopped, so it asserts nothing.
    Next: I rewrite it against the real call.

So is a target that cannot be reached from here:

    BLOCKED — this needs the real service and none is reachable from this environment.
    Next: give me one, or I write it one level down and say what it does not prove.

The test, the failure it was seen producing, and the substitutions are prepared and held
until asked.
