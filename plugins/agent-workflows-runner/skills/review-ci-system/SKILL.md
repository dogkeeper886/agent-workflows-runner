---
name: review-ci-system
description: |
  Judges what a project's tests actually prove, rather than how many there are. Classifies
  every test by what it is allowed to touch, discards the levels that cannot answer
  "is this covered", and lays the rest against what the system must do — so a suite that is
  large, tidy and green is still reported as proving nothing when that is the truth. Writes
  no test and deletes none; it names the one gap worth closing and stops.
when_to_use: |
  Use whenever someone touches the machinery that tests or runs a project — creates a test
  file, edits one, reads one, deletes one, adds or edits a CI workflow — and whenever the
  question is what the tests are worth: "is this covered", "are these tests any good", "do
  the tests actually test anything", "the suite is green but it broke in production", "why
  did this ship broken", "review our test setup", "what's our coverage". Reach for it before
  writing a new test, because what to write is decided by what is missing, and before
  trusting a green suite, which is the case that never asks for review. Not for running the
  tests, and not for writing or deleting one.
argument-hint: "[path to the project, or nothing for the current repo]"
---

# Review what the tests prove

Target: $ARGUMENTS — the project under review, or this repo.

**A test count is read as safety and is not evidence of any.** A suite can be large, evenly
organised, carefully commented, and green, and still prove almost nothing — because
everything it touches is a fake the suite wrote itself. Size, tidiness and coverage
percentage cannot detect that. One question can:

> If every test passes, what is now known to work?

That is the only question this unit asks. Everything below is machinery for answering it
honestly.

## 1. Get the key points first

**A suite cannot be judged from the tests alone.** "Counts" has no meaning until something
says what the system must do — so the rows come before the cells, always.

Derive them from ground truth — the code, not the docs: entry points, build files, schema,
routes, config. About three, ranked, #1 the organizing idea. `analysis-sut` does exactly
this and is the route to prefer where it is installed; where it is not, do the study here
and say that is what happened. If key points were already produced in this session, reuse
them rather than studying twice.

**Do not derive key points from the test names.** They describe what someone chose to test,
which is the thing under examination. Deriving the standard from the subject makes any suite
look complete.

## 2. Classify every test by what it is allowed to touch

**Never by folder. Never by name.** A directory called `integration/` full of tests that
mock every dependency contains no integration tests, and the name is what made that
invisible.

**Find the tests the way the project runs them.** Take the set from what its own runner
collects — the test script in its manifest, the include globs in its test config — not from
whichever directory looks like it holds tests. A file that could not be classified is
reported as unread; it is never counted as absent, because an empty cell and an unread file
mean opposite things.

Then read each test and answer one question: what real thing does it reach?

| Level | Reaches | Counts |
|---|---|---|
| Component (unit) | nothing real — single process, everything substituted | **no** |
| Component integration | other units, still all substituted | **no** |
| System | the assembled system through its real entry point | yes |
| System integration | the system plus real external services | yes |
| Acceptance | the delivered thing, as a user or operator meets it | yes |

**Why the first two do not count.** They are allowed to exist — but a component test asserts
today's internal structure, so when the structure changes for a good reason the test fails
for no reason, and the change is what gets questioned. It is a restriction written down. It
answers "did I break this refactor", never "does the system work".

**Level is only half the filter. The other half is relevance:** a test counts only if it
reaches a key point. A system-level test exercising something on nobody's list fills no cell.

## 3. Build the matrix

Key points as rows. Counting tests as cells. One extra column, and it is the one that does
the work:

```
                  #1     #2     #3     #4    the project's own
                                              stated gap
   system          ·      ·      ·      ·          ·
   system-int      ·      ·      ·      ·          ·
   acceptance      ·      ·      ·      ·          ·
   ───────────────────────────────────────────────────────
   behind a fake   225 tests land here, in one column
```

The last row is not a footnote. Seeing every test in it at once is usually the finding.

**Read the project's own admissions before judging.** READMEs, comments and ADRs often name
the gap outright — *"needed for the checks that suite cannot make"* — and a stated gap is
worth more than an inferred one. Quote it.

## 4. The verdict is a sentence, not a percentage

Say what passing proves. Then say what it does not. Then name **one** gap as the first worth
closing.

A percentage is what let a suite of 225 tests read as protection. Never produce one, and
never accept one as an answer.

Three findings that recur, each worth naming when it appears:

- **The oracle test.** An assertion that depends on a value the test supplied to a fake it
  wrote. That is the code agreeing with itself.
- **The second implementation.** A fake large enough to reimplement the dependency's
  behaviour — minting ids, enforcing rules — with nothing checking it matches the real thing.
  There is no contract test.
- **Islands.** Every test builds its own world, nothing is threaded, nothing is torn down —
  because nothing is real enough to leak.

## 5. Offer. Never run

This unit **writes nothing and deletes nothing, ever.** A reviewer able to fix what it finds
stops reporting honestly: it starts finding what it knows how to fix.

Two offers, and both stop for a person:

- a gap worth closing → write the test at system level or above (`create-test`, where it is
  installed)
- component tests whose key point is now covered above them → propose removing them
  (`prune-test`), and only once that cover actually exists

## Worked example

A validation API in front of a third-party system: 225 passing tests across 17 files, every
helper commented, the suite green.

Classified: every test runs in a single process, with the third-party client faked and the
database emulated in memory. All 225 land in *behind a fake*. Every key-point cell is empty.

The project's own README named the two guarantees its suite could not make — *that a write
lands, and that the id it answers with is the id a read answers to*. Those two were exactly
the two untested.

Verdict: **the suite proves the code agrees with fakes the same author wrote.** It does not
prove a write reaches TestLink. First gap: the acceptance pair the README already names.

## Steps

Copy this checklist and tick each item as you finish it:

    Task Progress:
    - [ ] Test set taken from what the project's runner collects
    - [ ] Key points obtained — never from the test names
    - [ ] Every test classified by what it reaches, not by where it lives
    - [ ] Anything unclassifiable reported as unread, not as absent
    - [ ] Matrix built, with the behind-a-fake column filled in
    - [ ] The project's own stated gaps read and quoted
    - [ ] One gap named as first
    - [ ] Nothing written, nothing deleted

## Report

Two lines and a question:

    REVIEWED — 225 tests, every one behind a fake. Nothing proves a write reaches TestLink.
    Next: close the acceptance pair the README already names.
    Want the matrix?

A suite that does prove something reads the same way:

    REVIEWED — 12 of 14 key-point cells filled. #3 has no system-level test.
    Next: cover #3, or accept the gap.

And a refusal is a verdict too:

    NOT REVIEWED — this repo's ground truth yielded no key points to judge against.
    Next: say what this system is meant to do, and I will classify against that.

The matrix, the per-test classification and the findings are prepared and held until asked.
