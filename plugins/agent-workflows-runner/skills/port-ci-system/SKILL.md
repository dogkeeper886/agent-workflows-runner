---
name: port-ci-system
description: |
  Gives a project its first way to run itself and get a verdict, where nothing does that yet.
  Decides by purpose rather than by folder — a shell script that exercises the system and
  fails on a bad result already counts, and a project that has one needs no runner from
  anybody. Where nothing counts, it asks before placing a file, builds in that project's own
  idiom rather than importing another repository's, and stops at one honest test and one
  command a person can type.
when_to_use: |
  Use when a project has no way to check itself — "we have no tests at all", "set up testing
  here", "there's no CI", "how do we even run this", "nothing here is tested", "add a test
  harness", "we need a build check". Reach for it on a repository nobody has tested yet, and
  before writing any test into a project whose runner you have not confirmed exists. Not for
  a project that already runs something, however small — that one has gaps to close rather
  than a runner to gain, and fix-ci-system owns it.
argument-hint: "[project directory]"
---

# Give a project its first runner

Target: $ARGUMENTS — the project. Nothing means this repo.

**A project with one honest test and a command to run it is further along than one with a
framework nobody has exercised.** That is the whole of this unit's ambition, and stopping
there is the point rather than a shortfall.

## 1. Does anything already run this system and judge the result?

**Decide by purpose, never by name or by folder.** A directory called `test/` may hold
fixtures and nothing else, and a project with no such directory may be thoroughly checked by
a shell script somebody wrote in an afternoon.

Read what each candidate does, and count it in where it does that:

| Looks like | Counts where |
|---|---|
| `check.sh`, `verify.sh`, `smoke.sh`, an unnamed script in `scripts/` | it exercises the system and fails on a bad result |
| a `Makefile` target — `make check`, `make verify`, `make e2e` | same |
| a CI workflow step that is not a build | it asserts something rather than only compiling |
| a git hook, a cron entry, a scheduled job | it runs the system and someone hears about a failure |
| a notebook, a fixture-loading script, a seeded query | it is run to find out whether something works |
| a framework suite — vitest, pytest, go test, JUnit | obviously, but it is one form among these, not the definition |

Anything whose purpose is to run the system and report a verdict counts, whatever it is
called and wherever it sits.

Something counts → stop here. This unit has nothing to do, and adding a second system
beside a working one leaves two answers to *did it pass* and nobody knowing which is
authoritative. Report `ALREADY HAS ONE`, name it, and hand the reader to `fix-ci-system`,
whose job is the gaps in what exists.

Nothing counts → continue, and say what you looked at and why none of it qualified.
*"There is a `test/` directory holding only fixtures"* is a finding, and a reader who
disagrees can correct you before anything is placed.

## 2. Ask before placing anything

Placing a runner puts files into somebody's repository, adds an entry to their manifest, and
may add a CI trigger that runs on every push from then on. That is a decision about how the
project is built, not a detail of this run.

Say, before touching anything:

- which files land, and where
- what the manifest gains
- whether a CI trigger is part of it, and what it will run
- that this is one runner and one test, not a framework

**On no, build nothing and stop.** A project that declines has made a choice, and it is
reported as `NOT PORTED` rather than worked around by writing tests with no way to run them.

## 3. Build it in the project's own idiom

**Do not copy another repository into it.** A pasted runner arrives carrying somebody else's
assumptions — their paths, their config, their examples — and every one of them is a thing
the adopting project now maintains without having chosen it.

Reach in this order:

1. **What the project's ecosystem already expects.** A TypeScript project gets its standard
   runner, a Python one gets its own, a Go one needs nothing installed at all. This is almost
   always the answer, and it is the one a contributor will recognise.
2. **What the project already half has.** A `Makefile` with a build target gains a check
   target beside it. A CI workflow that only compiles gains a step that asserts.
3. **A case-and-judge runner of your own** — a case file naming steps, patterns that must
   appear and patterns that must not, and a judge that decides on exit codes and those
   patterns rather than on anybody's opinion — where the project must drive a real deployment
   end to end and its ecosystem's runner structurally cannot.

Then wire exactly one thing:

- one test that runs the project's own build or entry point, at system level, written the way
  that project writes things
- one command a person can type, declared in the project's manifest
- one CI trigger, if the project has CI at all — and if it does not, say so rather than
  inventing a platform

## 4. Run it once, and report what it said

A runner nobody has watched produce a result is a runner nobody knows is wired up.

Green or red, report which. **A red first test is often the runner working** — it has reached
something real and found it wanting, which is more than a green test against nothing proves.
Do not edit the project's code to turn it green; that is somebody else's change, and this
unit has no standing to make it.

Then stop. What the new runner is worth, and what it does not yet cover, is a question for
`review-ci-system` — and it can only be asked once something exists to review.

## Steps

Copy this checklist and tick each item as you finish it:

    Task Progress:
    - [ ] Judged by purpose whether anything already runs and judges
    - [ ] Stopped and handed off if something did
    - [ ] Asked before placing a file, naming what arrives
    - [ ] Built in the project's own idiom, not copied from elsewhere
    - [ ] One test, one command, one trigger where a platform exists
    - [ ] Ran it once and reported what it said
    - [ ] Nothing in the project's own code edited

## Report

Two lines and a question:

    PORTED — one system-level test, one command, one CI trigger. Ran it once: red, on a
    missing environment variable the build has always needed.
    Next: review-ci-system, to find out what it proves.
    Want the test?

The three other outcomes read the same way:

    ALREADY HAS ONE — scripts/verify.sh builds, starts the service and asserts on its
    health endpoint. That is a test system.
    Next: fix-ci-system, for the gaps in it.

    NOT PORTED — this project wants no runner built into it.
    Next: nothing here.

    BLOCKED — the project's own build does not run in this environment, so a test that
    calls it cannot either.
    Next: an environment where it builds, then run this again.

The test, the command, and what the run said are prepared and held until asked.
