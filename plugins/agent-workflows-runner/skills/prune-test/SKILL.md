---
name: prune-test
description: |
  Removes tests that no longer prove anything the suite does not already prove above them —
  component tests whose subject is now covered by a system-level test, and which survive only
  to restate the internal structure they were written against. Refuses to run where that
  cover does not exist, lists every candidate before touching one, and deletes only what a
  person confirms. It never writes.
when_to_use: |
  Use when tests have become an obstacle rather than a check — "these tests keep breaking
  every time I refactor", "why do I have to update ten tests to rename one thing", "the unit
  tests are in the way", "can we delete some of these", "this suite is too slow", "we have
  too many tests". Reach for it when review-ci-system reports a key point now covered at
  system level while component tests for the same thing remain, which is the case nobody
  thinks to raise. Not for deleting a failing test, and not for deleting tests to make a
  build green.
argument-hint: "[key point or path]"
---

# Remove what only restates structure

Target: $ARGUMENTS — what to consider. Nothing means the whole suite.

**A component test asserts today's internal structure.** That is useful while the structure is
still moving: it gives fast, precisely located feedback during construction. Afterwards it
inverts — the structure changes for a good reason, the test fails for no reason, and the
change is what gets questioned rather than the test.

This unit removes those, and only those. **Deleting a test is not a way to make a build
green**, and a failing test is evidence rather than a candidate.

## 1. The precondition, and it is absolute

**A test is only prunable where the thing it covers is already covered above it.** Check that
first, per candidate, and refuse where it does not hold.

Take the suite from what the project's runner collects — its test script, its config's
include globs — so the population is the same one the project tests with. Where
`review-ci-system` built a matrix in this session, read the cover from it rather than working
it out again: two derivations of the same fact by different routes will eventually disagree,
and nothing would say which was right.

Pruning before the level above exists removes the only tests there are. That is not a
smaller version of this job; it is the opposite of it.

So each candidate needs a named system-level or higher test that covers the same key point.
If nothing above covers it, the component test is the only cover there is — it stays,
whatever else is true about it.

## 2. What makes a candidate

| Candidate | Not a candidate |
|---|---|
| Asserts an internal call, a private shape, an argument passed between two units | Asserts observable behaviour, at any level |
| Breaks on renames and moves that changed no behaviour | Has caught a real defect that the level above missed |
| Its key point is covered by a named test above it | Its key point is covered nowhere else |
| A pure duplicate of another test at the same level | Currently failing — that is a finding, not a redundancy |

**Where you cannot tell which key point a test serves, leave it.** An untraceable test is an
unread one, and unread is not redundant.

## 3. Show the list before touching anything

Every candidate, by file and name, each with the test above it that covers the same ground.
A candidate presented without its replacement is not reviewable — the reader has no way to
judge the trade.

**State the cost in the same breath.** Component tests localise a failure to a line; a system
test localises it to a system. Removing them buys freedom to refactor and pays in debugging
time when something does break. That is the trade being made deliberately, and the person
answering deserves to see it named rather than discover it later.

## 4. One question, then delete only what was confirmed

Ask once, covering the whole list. On a no, remove nothing and report it as kept — **a test
someone chose to keep is a decision, not a failure**, and it does not come back up next run
as though the answer had not been given.

On a yes, delete exactly what was named. Nothing else is touched, and this unit adds no line
to any file — every edit it makes is a removal, which is what makes it safe to run twice.

## Steps

Copy this checklist and tick each item as you finish it:

    Task Progress:
    - [ ] Coverage above established per candidate, by name
    - [ ] Candidates that cover something nothing else covers excluded
    - [ ] Failing tests excluded — they are findings
    - [ ] Untraceable tests left alone
    - [ ] List shown with its replacements, and the cost stated
    - [ ] Asked once, for the whole list
    - [ ] Only the confirmed files deleted; nothing written

## Report

Two lines and a question:

    PRUNED — 9 component tests removed, each covered by a named system test.
    Next: run the suite once to confirm nothing else depended on them.
    Want the list?

A refusal is the more common verdict, and reads the same way:

    NOT PRUNED — nothing above covers these; they are the only cover there is.
    Next: cover those key points at system level first, then run this again.

So does a decision to keep:

    KEPT — 9 candidates shown, none removed.
    Next: nothing.

The candidate list, the covering tests and the trade are prepared and held until asked.
