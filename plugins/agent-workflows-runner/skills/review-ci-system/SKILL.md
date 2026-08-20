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
argument-hint: "[project directory]"
---

# Review what the tests prove

Target: $ARGUMENTS — the project under review. Nothing means this repo.

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

Check what came back before using it. A key point that describes structure rather than
naming a behaviour — *"rules are rows read once at startup"* — yields a matrix row nothing
can ever fill. Ask for it again as something a test could cover, and ask whether any
behaviour was explained only inside another point's mechanism: absorbed like that it is
indistinguishable from one never found, and the row will simply be missing.

Check the paths too. A key point should arrive with the traversals that would prove it, each
naming what must be true of the infrastructure afterwards. One that arrives with none, or
with paths that stop at a response code, cannot be scored — ask for it again rather than
guessing what would count.

Do not derive key points from the test names. They describe what someone chose to test,
which is the thing under examination. Deriving the standard from the subject makes any suite
look complete.

## 2. Classify every test by what it is allowed to touch

**Never by folder. Never by name.** A directory called `integration/` full of tests that
mock every dependency contains no integration tests, and the name is what made that
invisible.

**Find the tests by purpose, not by framework.** Where the project has a runner, take the set
from what it collects — the test script in its manifest, the include globs in its config —
never from whichever directory looks like it holds tests.

But a runner with a collector is one form a test system takes, not the definition. Anything
that runs the system and judges the result belongs in the set: a `verify.sh`, a `make check`
target, a CI step that asserts rather than only compiling, a git hook, a scheduled job, a
script somebody runs by hand to find out whether something works. A project with a 40-line
shell script and no framework has a suite, and reporting it as having none is wrong in the
direction that matters — it reads as *nothing to review* when the truth is *nothing a
collector could find*.

Say how the set was assembled. *"18 files, from vitest's default glob"* and *"one shell script,
found by reading what `scripts/` does"* are different claims and the reader is entitled to
know which they have.

A file that could not be classified is reported as unread; it is never counted as absent,
because an empty cell and an unread file mean opposite things.

Then read each test and answer one question: what real thing does it reach?

| Level | Reaches | Counts |
|---|---|---|
| Component (unit) | nothing real — single process, everything substituted | **no** |
| Component integration | other units, still all substituted | **no** |
| System | the assembled system through its real entry point | yes |
| System integration | the system plus real external services | yes |
| Acceptance | the delivered thing, as a user or operator meets it | yes |

Why the first two do not count. They are allowed to exist — but a component test asserts
today's internal structure, so when the structure changes for a good reason the test fails
for no reason, and the change is what gets questioned. It is a restriction written down. It
answers "did I break this refactor", never "does the system work".

Level is only half the filter. The other half is relevance: a test counts only if it
reaches a key point. A system-level test exercising something on nobody's list fills no cell.

Then ask the question that decides the cell: which path did it assert? `analysis-sut`
returns, per key point, the paths that would prove it — a caller action, a route through the
system, and what must be true of the infrastructure afterwards. A test fills a cell when it
made that infrastructure assertion against the real thing, not when it merely exercised the
route.

The difference is the whole review. *"Submitting bad content returns 422"* is a response a
stub can produce. *"Returns 422 and the backend holds nothing"* is a path, and a substituted
dependency cannot answer it — a fake cannot fail to write to something real. Where a test
asserts the response and not the state, say so: it addressed the key point and filled no
cell.

## 3. Build the matrix

Key points as rows. Counting tests as cells. A cell holds the paths of that key point whose
infrastructure assertion was observed — never the tests that merely touched it. One extra
column, and it is the one that does the work:

```
                  #1     #2     #3     #4    the project's own
                 4 paths 6 paths 3 paths 2 paths   stated gap
   system         0/4    0/6    0/3    0/2            ·
   system-int      ·      ·      ·      ·            1/2
   acceptance      ·      ·      ·      ·             ·
   ───────────────────────────────────────────────────────────
   behind a fake   every test can land here, in one column
```

The last row is not a footnote. Seeing every test in it at once is usually the finding.

**A partly covered cell is not a full one.** Where a key point has four paths and one was
asserted, the cell says so — `1/4` — because the gap is which paths remain, not whether
anything was done. The paths `analysis-sut` marked as unassertable by a fake are the ones to
name first: no quantity of substituted tests will ever reach them.

Read the project's own admissions before judging. READMEs, comments and ADRs often name
the gap outright — *"needed for the checks that suite cannot make"* — and a stated gap is
worth more than an inferred one. Quote it.

## 4. The verdict is a sentence, not a percentage

Say what passing proves. Then say what it does not. Then name **one** gap as the first worth
closing.

A percentage is what lets a large suite read as protection. Never produce one, and never
accept one as an answer.

**Hold the work list, and hand it over when the detail is asked for.** One gap is what a
reader acts on; the rest is what they plan with, and today it exists only inside the run and
vanishes with it — so the next review re-derives all of it from scratch. Prepare:

- how many paths are asserted, and of how many
- how many of the rest **no fake can reach**, since no work in the existing suite's style
  will ever touch those
- how many are reachable with the environment already standing, and how many need something
  built first — the difference between an afternoon and a project
- the remaining paths ranked, each with its key point and its identifier, so the reader can
  pick one and hand it straight to `create-test`

Rank by what the gap costs, not by what is easy: a path carrying a load-bearing claim outranks
three cheap ones. Say which are blocked and on what.

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

A validation API in front of a third-party system. Every helper commented, the suite green,
and enough tests that the count itself reads as protection.

Classified: every one runs in a single process, with the third-party client faked and the
database emulated in memory. All of them land in *behind a fake*. Every cell is empty.

The project's own README named the two guarantees its suite could not make — *that a write
lands, and that the id it answers with is the id a read answers to*. Those two were exactly
the two untested.

Verdict: **the suite proves the code agrees with fakes the same author wrote.** It does not
prove a write reaches the real system. First gap: the acceptance pair the README already
names.

## Steps

Copy this checklist and tick each item as you finish it:

    Task Progress:
    - [ ] Test set found by purpose — a runner's collection, or whatever else runs and judges
    - [ ] Key points obtained — never from the test names
    - [ ] Every test classified by what it reaches, not by where it lives
    - [ ] Each counting test tied to the path whose infra assertion it made
    - [ ] Anything unclassifiable reported as unread, not as absent
    - [ ] Matrix built, with the behind-a-fake column filled in
    - [ ] The project's own stated gaps read and quoted
    - [ ] One gap named as first, and the remaining paths ranked and held
    - [ ] Nothing written, nothing deleted

## Report

**Two readers, two shapes.** A skill or a script that called this one cannot answer a
question, so a matrix held back from it is a matrix lost:

| Who asked | What they get |
|---|---|
| A person | two lines and a question; the matrix held until they ask |
| Another skill, or a caller that is not a reader | the whole matrix, the per-test classification and the findings, with no offer and nothing held |

The same rule binds this skill as a *caller*. Asking `analysis-sut` for key points, say up
front that this is a call rather than a reader, so the full list comes back with nothing
held — and where the study is delegated to a subagent, pass the rules with the method: it
writes no file, the docs stay shut until the model is derived, and the result says which it
held. Rules that do not travel with the work are rules nobody can report on.

For a person, two lines and a question:

    REVIEWED — 0/15 paths asserted; every test behind a fake. Nothing proves a write
    reaches the real backend.
    Next: close the acceptance pair the README already names.
    Want the matrix?

A suite that does prove something reads the same way:

    REVIEWED — 12 of 14 key-point cells filled. #3 has no system-level test.
    Next: cover #3, or accept the gap.

And a refusal is a verdict too:

    NOT REVIEWED — this repo's ground truth yielded no key points to judge against.
    Next: say what this system is meant to do, and I will classify against that.

The matrix, the per-test classification, the findings and the work list are prepared and held
until asked. A reader who asks for the detail gets the arithmetic in one line — *2 asserted, 56
remaining, 41 of them beyond any fake, 15 reachable with what is already running* — and then
the ranked list.
