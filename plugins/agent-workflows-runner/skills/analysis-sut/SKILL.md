---
name: analysis-sut
description: |
  Works out what a system must do, from its code rather than its documentation, and returns
  it as a short ranked list of key points — each with the paths it was derived from, the
  mechanism in the code's own names, and a diagram. Reads the existing docs only to report
  where they contradict the code. Saves nothing: the study is reproduced when needed rather
  than stored, because a stored one goes stale silently and is believed anyway.
when_to_use: |
  Use when the question is what a system does or what about it is worth testing — "what
  should we test here", "where do I start with tests", "what's worth testing", "what does
  this system actually do", "I'm new to this codebase", "walk me through it", "what are the
  moving parts". Reach for it before judging or writing any test, since what counts as
  coverage is decided by what must be tested, and reach for it on an unfamiliar repo before
  trusting anything its README says. Also called by review-ci-system, which cannot classify
  a suite without it. Not for finding one file or one function — that is a search.
argument-hint: "[path] [focus]"
---

# What must be tested

Target: $ARGUMENTS — a path and an optional focus. No path means this repo; no focus means
the whole system.

**A system's documentation is a claim about it, not a description of it.** Docs are written
once and the code moves; nothing announces the divergence, so the stale sentence is read as
current and believed. One study of a well-documented repo found eleven places where its own
README and architecture decision records asserted things the code did not do.

So the model is derived from the code. The docs are read afterwards, and only to report
where they disagree.

## What this returns

A ranked list, about three key points, each carrying seven things:

| Field | What goes in it |
|---|---|
| **#** | Rank. #1 is the organizing idea |
| **Key point** | One line, concrete |
| **Ground truth** | The paths it was derived from — makes the claim checkable |
| **Mechanism** | What actually happens, in the code's own names: real functions, routes, tables, types |
| **Why it matters** | What a newcomer cannot understand without it |
| **Diagram** | ASCII, one per key point |
| **Contradicts** | Any doc claim the code does not support, or "none" |

**Mechanism is where a study earns its keep.** *"A service talks to a database"* is not a
finding. *"`store.rules()` is called once at startup and zero rows throws, so the server does
not start"* is — it names what is there and can be checked against the file.

## 1. Read the ground truth

The real artifacts, in whatever form this project has them: entry points, the build or
package manifest, the schema, route definitions, the container or compose files, config and
its defaults, the top-level layout. Trace how the parts connect, not just what they are.

Where ground truth lives varies. Those are examples, not a checklist — a Rust workspace, a
Terraform root and a Rails app keep it in different places, and the question is always the
same: what does this actually run.

**Read the docs last.** Reading them first supplies a model, and everything after gets read
as confirmation of it.

## 2. Find #1 before listing anything

**#1 is the organizing idea: what this is, why it exists, and how its parts form one whole.**
For a multi-part system that is usually how the components compose and depend on each other;
for a single tool, the core abstraction or the main flow.

Find it before enumerating features. A list of features assembled first will not add up to an
idea afterwards, and the reader gets an inventory instead of an explanation.

Then #2 onward — the ones a diagram explains better than prose, each grounded in #1. Rank
them.

## 3. About three. Four at most

A longer list is an index, and an index is what a reader skips. Shortening is how the count
comes down — never by dropping a diagram from a key point that stays.

**And never by folding one into #1.** #1 states the organizing idea and carries no other key
point's mechanism. A behaviour absorbed into it keeps its words, loses its rank and its
drawing, and cannot be told apart from one never found. Step 4 is where that is caught and
what to do about it.

Prefer a behaviour to a description. *"Rules are rows read once at startup"* describes
structure; *"three refusals, one per stage — schema, rules, the call itself"* names something
a test either covers or does not. This list is what coverage is measured against, so a
descriptive key point yields a row nothing can ever fill.

## 4. Settle the list, then draw it

**Ask this before drawing anything: is any behaviour explained only inside another key
point's mechanism?**

A yes means it is a key point. Promote it, and take step 3's route out of the cap — demote
the weakest, or go to five and say why the list is five. Then ask again over the new list,
until the answer is no. Only then count.

Reaching the cap is not an answer to this question. The cap is what causes it: a behaviour
found after four are ranked has nowhere to go, and folding it into #1 leaves the count
passing and the point gone.

Then draw. One ASCII diagram per key point, #1 included — it is the organizing idea, so it is
the diagram the reader needs most. Draw the real mechanism with real names from the code:
boxes labelled *service* and *database* describe every system ever built and this one not at
all.

Count check: diagrams drawn == key points on the settled list. If there are fewer, either
draw the rest or shorten the list.

Keep a diagram inside 80 columns. It is read in a terminal, and one that wraps is one nobody
reads.

## 5. Then read the docs, and only to contradict

With the model already derived, read the prose files — README, architecture records, example
config, anything under a docs directory. Report every claim the code does not support: a
table that does not exist, a command that would fail, a route never defined, a described
mechanism that was replaced.

*Docs* here means those files. Comments inside source are read in step 1 along with the code
they sit in; deferring them would mean reading the same file twice.

This pass belongs to whoever read the code, which under step 6 is the subagent. Handing it
back to the caller means the caller reads the docs and the code both, and the delegation
bought nothing.

This costs almost nothing once the code has been read, and it is often the most valuable
thing returned — the contradictions are invisible to everyone who trusts the document.

## 6. Study in the background

Spawn one subagent for the reading and take back its whole result.

Studying a repo means opening entry points, manifests, schemas, routes and config. All of
that lands in context and none of it is the answer. A subagent spends its own context and
returns the conclusion. Where no subagent is available, do it inline — the method does not
change, only the cost. One subagent, not several: step 2 requires #1 to be found before
anything is enumerated, and parallel studies each find a different #1.

**Hand over the constraints, not only the method.** A subagent given the steps and nothing
else is not bound by the rules those steps exist to serve — it may write a scratch file, or
open the docs first, and the reply will say neither. Pass, explicitly:

- the target path, absolute, and the focus if one was supplied
- steps 1 to 5, in order
- **it writes no file anywhere** (step 7), and must say so in its result
- the docs stay shut until step 5
- the count check, and the absorption question beside it

Then require the result to state which of those it held. A rule nobody was asked about is a
rule nobody can report on.

## 7. It writes no file

Not in the repo, not in a scratch directory, not a cache. The list is returned in the reply
and lives in the session.

A saved study is a document, and this skill exists because documents go stale invisibly. The
study is cheap to reproduce and current every time it is reproduced; persisting it trades
that for staleness and saves nothing worth having.

Two consequences, both accepted: two sessions studying the same system each pay for it, and
there is nothing to diff against a previous study — a *what changed* would need the stored
copy this rule forbids.

## Steps

Copy this checklist and tick each item as you finish it:

    Task Progress:
    - [ ] Ground truth read first; docs untouched until step 5
    - [ ] #1 identified before any feature was listed
    - [ ] List ranked, four key points at most
    - [ ] No behaviour explained only inside another key point's mechanism
    - [ ] One ASCII diagram per key point — count matches, each inside 80 columns
    - [ ] Mechanism written in the code's own names, not generic ones
    - [ ] Contradictions reported, or "none found"
    - [ ] Constraints handed to the subagent, and it reported which it held
    - [ ] No file written anywhere

## Report

**Two readers, two shapes.** A skill that called this one cannot answer a question, so a
payload held back from it is a payload lost:

| Who asked | What they get |
|---|---|
| A person | two lines and a question; the list held until they ask |
| Another skill, or a subagent's caller | the whole list — every field, every diagram, the contradictions — returned with no offer and nothing held |

For a person, two lines and a question:

    STUDIED — 4 key points, #1 the validation gate on the only path out.
    11 places the docs contradict the code.
    Next: review what the tests prove against these.
    Want the list?

When the code will not yield an idea, that is a verdict rather than a shorter list:

    NOT STUDIED — no entry point resolves; this looks like a library with no assembled
    system to describe.
    Next: name what runs it, and I will study that instead.

The list, the diagrams and the contradictions are prepared and held until asked.
