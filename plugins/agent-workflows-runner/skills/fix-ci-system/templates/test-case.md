<!--
One case = one path = one checkable outcome. It belongs to a scenario and is
usually a row in that scenario's table rather than an issue of its own; write it
out in full only where it is large enough to be worked on alone.

REQUIRED: Proves · Preconditions · Steps · Expected · Infrastructure afterwards
NOT INCLUDED, deliberately: actual result, status, last-run date. See the note at
the foot.
-->

## Proves

<the claim, stated so it could be false>

Scenario: <the behaviour this case is one path through>

## Preconditions

<what must be true before the first step — a service reachable, a schema applied,
a fixture placed, a credential present>

Name what the test must set up itself and what it expects to find already there.
A precondition nobody stated is a flake nobody can explain.

## Test data

<the exact values, or the rule that generates them>

Stable names, never suffixed with a random value or a timestamp: look up by name,
reuse if present, create if not, so a fixture leaked by a failed run is found
rather than duplicated. No literal instance ids — every id is created at run time
and threaded on.

## Steps

Actions only. What the caller does, in order, one observable thing each.

1.
2.

## Expected

<what the system answers — status, shape, the field that matters>

## Infrastructure afterwards

<what must be true of the real thing when the steps are done: a row created, a row
untouched, a row gone, a count unmoved>

**This is the field that makes it a test rather than an echo.** Everything above it
a substituted dependency can produce. This it cannot: a fake cannot fail to write
to something real.

## Level

<system · system integration · acceptance>

Never component: that asserts today's internal structure and answers *did I break
this refactor*, which is a different and smaller question.

---

<!--
No "actual result", no "status", no "last run" field, on purpose. Those are true
for one run and wrong from the next one on, and nothing announces when they rot —
which is how a test document comes to describe a system that has moved. What
happened when it ran lives in the suite, in the run's output, and in this issue's
state. The template says what should be true; the run says what was.
-->
