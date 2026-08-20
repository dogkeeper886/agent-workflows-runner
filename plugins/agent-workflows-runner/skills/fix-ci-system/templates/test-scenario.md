<!--
TITLE: name the behaviour, not the activity.
  good — A write refused by the Rules reaches TestLink with nothing
  bad  — Test the rules          (activity)
  bad  — Rules                   (a topic)

One scenario = one key point = one behaviour the system must have.
Its cases are the paths that would prove it. Four or five scenarios is a
project; fifty is a board nobody reads.

REQUIRED: What it verifies · Derived from · Cases · Done when · Context
-->

## What it verifies

<the behaviour, stated as something that could be false>

One sentence. If the system stopped doing this, what would break for whom.

## Derived from

<the files this was read out of — paths, so the claim is checkable>

Derived from the code, never from the existing tests. A scenario taken from test
names describes what someone chose to test, which is the thing under examination.

## Cases

Each case is one path: a caller action, the route it takes through the system, and
what must be true of the infrastructure afterwards. Mark the ones no substituted
dependency can assert — those are where coverage is really decided.

| # | Caller does | Route through the system | Infrastructure afterwards | Fake can assert? |
|---|---|---|---|---|
| 1 | | | | no |
| 2 | | | | yes |

**A case with no infrastructure assertion is not a case.** *"Returns 422"* is a
response a fake can produce; *"returns 422 and the backend holds nothing"* is a
path. The second half is the whole point.

## What must be standing

<what has to be running before any of these can be executed — a live service, a
database with its schema applied, a container, credentials that exist>

Say what is not automatable here rather than pretending it is.

## Done when

- [ ] Every case above has a test, written at system level or above
- [ ] Each test asserts its infrastructure outcome, not only the response
- [ ] Each has been run at least once, and what it said is recorded below
- [ ] A red test is recorded as a finding with the defect it exposes — not chased green

**A red test does not block this issue.** A case whose test is written and failing
is done work: the path is now watched, and the defect belongs to whoever owns that
code. Note it and move on.

## Context

Session: `.sessions/<session-uuid>.jsonl`
<what is worth reading in it, by heading or line range>

## Out of scope

<cases deliberately not covered here, and why — so a later gap reads as a decision>
