---
name: fix-ci-system
description: |
  Closes the distance between what a project's tests prove and what its system must do.
  It takes the unasserted paths a review found, files them as test scenarios a cold
  agent could pick up — one per behaviour, its paths as cases — and then writes as many as
  the session allows, at system level or above, asserting what must be true of the
  infrastructure rather than what the system answered. A test that goes red because the
  system is wrong is finished work and a finding, never a failure to be chased green.
when_to_use: |
  Use when the tests are the problem rather than the code — "our CI is useless", "we have no
  tests at all", "the suite is green and things still break", "close the coverage gaps", "set
  up testing here", "fix our test setup", "add the tests we're missing". Reach for it when
  review-ci-system reports paths unasserted and the answer is to write them, and when a
  project has no runner and someone has to be first. Not for judging a suite — that is the
  review — and not for deleting tests.
argument-hint: "[project directory] [path id, or nothing for the whole list]"
---

# Close the gap between what is proved and what must work

Target: $ARGUMENTS — the project, and optionally one path. No path means work the list.

**A test earns its place by what it would catch.** The failure this unit exists to prevent
is the test that passes forever: it substitutes every dependency, asserts a value it fed the
substitute itself, and reports green while the system it claims to cover is broken. Such a
test is worse than none, because it is counted.

Two situations arrive here, and the first question sorts them.

## 1. Is there a test system to fix?

**Decide by purpose, never by name or by folder** — the same test `port-ci-system` states in
full, and it is the canonical one. Anything whose purpose is to run this system and report a
verdict counts — a `verify.sh`, a `make check`, a CI step that asserts
rather than only compiling, a git hook, a scheduled job, a framework suite. A directory called
`test/` holding only fixtures does not.

**Something counts → continue.** However small, however unlike a framework. A project with a
40-line shell script has a test system, and it has gaps like any other.

**Nothing counts → this is the wrong unit.** There is nothing to measure and nothing to close,
because no runner exists to close it in. Stop, say what you looked at, and hand the reader to
`port-ci-system`, which gives a project its first one.

## 2. Get the metric before writing anything

The gap is what a review measured, never what looks thin. Where `review-ci-system` produced
a matrix and a work list in this session, use them. Where it did not, run it — it derives the
key points, enumerates the paths each would prove, and scores which have been asserted
against real infrastructure.

**All paths asserted → there is nothing to fix.** Say so and stop. This is a real outcome and
it should be reported as one rather than met with invented work.

**Short → take the work list.** Each entry is a caller action, a route through the system, and
what must be true of the infrastructure afterwards. That third part is the test's job; the
first two only get you to it.

## 3. File the work before doing any of it

**A session ends; an issue does not.** The work list, the paths, what was probed and
what was learned all vanish when the run stops — and the next session re-derives every
bit of it. Filing is cheap and durable; writing is expensive and session-bound. So file
first, then work as much as the session allows.

**One scenario per key point, its paths as cases.** Not one issue per path: fifty-eight
issues is a board nobody reads, and a key point is the unit somebody can finish. Use
[test-scenario.md](./templates/test-scenario.md) for the issue body and
[test-case.md](./templates/test-case.md) for any case large enough to be worked alone.

Reach for `file-issue` to create them, so each one carries the session log beside it and
a cold agent can act on it. Where the scenarios together are more than one person picks
up at once — four scenarios and fifty-eight cases usually are — reach for `plan-work` to
group them with whatever the platform already provides.

**File against the project under test, not against this toolkit.** The gaps are theirs.

Where `file-issue` and `plan-work` are not installed — they ship in a different plugin, and
nothing here can require one — create the issues directly with the platform's own CLI, carry
the session log path in the body yourself, and say in the report that is what happened. A
missing skill is a slower route, never a reason to leave the work unfiled.

Then, when the run stops for any reason, comment on each issue with what actually
happened: which cases now have a test, what each said when it ran, which are red and on
what defect. An issue nobody updated reads exactly like an issue nobody worked.

## 4. Ask what to write, then write it

One question, before the first test. Show what the run would cost and let the person
size it:

- how many paths are open, and how many this run would take
- which ones, named, in the order they would be done
- what each needs standing up — a database, a container, a live third party
- that a red test is a finished test here, so some of these may end red

On a number smaller than the list, take that many. On no, write nothing and say so. The
work list survives in the report either way, so declining costs nothing but the run.

Then one path at a time, in the order the review ranked them — the ones no fake can reach
first, since no other work will ever touch those.

For each:

Write it at system level or above. System, system integration, or acceptance. Never a new
component test: that asserts today's internal structure and answers *did I break this
refactor*, which is the question the suite already answers too often.

Write it for the runner the project already collects with, as a file that runner already
finds.

Reach the real thing. Start from the real dependency and substitute only where you must —
a paid API, a device that is not present. Where you must, say so in the report and in a
comment at the seam. A silent fake is how a suite comes to prove nothing while looking
complete.

**Assert the infrastructure, not the answer.** *"Returns 422"* is a response a fake can
produce. *"Returns 422 and the backend holds nothing"* is the path. A test that stops at a
status code closes no cell, however green it goes.

Fixtures survive their own failures. Consume what an earlier stage produced rather than
bootstrapping parents; no literal instance ids; stable names with look-up-or-create, never a
random or timestamped suffix; link it into the chain; tear down what you created and verify
the removal where the system can report it.

Then run it once — to learn what it says, not to make it green.

Whether it passes is the system's business. What this unit owes is a test that asserts
something real, and one run tells you whether it does:

| It does | What that means |
|---|---|
| **Passes** | The path holds. Check it can fail — point it at something absent, or stop the dependency — because a test that has only ever passed proves nothing about what it asserts |
| **Fails, and the message names a real cause** | The test is finished. The system is wrong, and you have found something the suite could not. This is a good outcome, not an unfinished one |
| **Fails on its own setup** | The test is not finished. Fixtures, environment, or an assertion that cannot hold |

**Never edit the code under test to turn a red test green.** That is repairing and then
grading your own repair, and it is how a real finding disappears.

Write the fixtures so a second run works — look-up-or-create, teardown that verifies — because
a test that only runs once is a test somebody will delete. But a second run is how you write
it, not a gate it has to pass before it counts.

## 5. Four ways a case ends, and only one is a failure of this unit

| Outcome | What it means | What happens next |
|---|---|---|
| **Written, green** | The test asserts the path and the system holds | Take the next path |
| **Written, red** | The test asserts the path and the system does not hold. **Still written** — the work is done and a defect is found | Report the defect with the failure verbatim. Take the next path |
| **Not written** | It fails on its own setup, or asserts nothing that could fail | Rewrite it. It is not a finding, it is unfinished |
| **Blocked** | The real dependency cannot be reached from here | Report what failed. Do not substitute a fake to reach green. Take the next path |

**Only *not written* is a failure of this unit.** A red test is finished work and a finding at
once, and treating it as unfinished is what pushes an agent toward editing the system until
the test agrees with it.

**Three things, kept apart, each with its own gate and its own verdict.** They are routinely
collapsed into one, and the collapse is what makes an agent quietly fix source code to finish
a test:

| The thing | Gated by | Its verdict |
|---|---|---|
| **Filing the work** | not gated — it costs nothing and survives the session | `FILED` |
| **Writing a test** | asked in step 4, before the first one | `WRITTEN` / `NOT WRITTEN` |
| **Whether it passes** | not this unit's to decide, and gated by nothing | reported as green or red, never chased |

A test can be written and red, and both halves are true at once. A port can be declined and
the review still stands. Nothing here waits on a result to call its own work done.

**A red test does not fill a cell, and that is not a contradiction.** The matrix scores paths
the system holds; a red test has established that this one does not. The path moves from
*unwatched* to *watched and failing*, which is worth saying in the report — it fills when the
defect is fixed, by somebody whose job that is.

## 6. Until the list is clean

Keep going. After each path the list shortens, whether the test came out green or red.

Stop when one of these is true, and say which:

- the list is empty — every path asserted
- every path left is blocked, and each blocker is named
- the person says stop

**Ask before a long run, not during it.** Twenty paths is twenty environments stood up and
torn down. Say how many are left and what they will cost before starting, then work without
interrupting for each one.

## Steps

Copy this checklist and tick each item as you finish it:

    Task Progress:
    - [ ] Established whether a test system exists at all
    - [ ] Test system judged by purpose, not by folder or name
    - [ ] Metric taken from a review rather than from what looks thin
    - [ ] Scenarios filed — one per key point, cases in its table, before any writing
    - [ ] Session saved beside them, and each issue commented with what happened
    - [ ] Writing asked for before the first test, with the cost named
    - [ ] Work list ordered — unreachable-by-a-fake first
    - [ ] Per path: system level or above, project's own runner
    - [ ] Per path: infra asserted, not the response
    - [ ] Per path: run once, and what it said reported
    - [ ] Per path: red results reported as findings, not chased green
    - [ ] No code under test edited to make a test pass
    - [ ] Blocked paths recorded with their blocker, and the list continued
    - [ ] Stopped for a stated reason

## Report

Two lines and a question:

    FILED AND WRITTEN — 4 scenarios filed with 58 cases; 8 now have a test, 6 green and 2
    red on one defect in the absence regex. 50 remain, and they are on the board.
    Next: fix that regex — both red tests turn green with no new test written.
    Want the list?

Where there is no runner at all, this is the wrong unit and says so:

    NO RUNNER — nothing here runs the system and judges the result.
    Next: port-ci-system, then come back.

Where the review found nothing to do:

    NOTHING TO FIX — every path asserted against real infrastructure.
    Next: nothing.

And a run that stopped early is a verdict too:

    STOPPED — 4 scenarios filed, 3 cases written, 55 remaining. The environment cannot
    reach the payment sandbox from here, and every case left needs it.
    Next: give me an environment that can, or these stay open — the issues hold the plan
    either way.

The scenarios filed, the tests written, what each said when it ran, the substitutions and the
blockers are prepared and held until asked.
