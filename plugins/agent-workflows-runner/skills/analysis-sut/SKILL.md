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

## 4. One ASCII diagram per key point

Every key point gets one. #1 included: it is the organizing idea, so it is the diagram the reader
needs most.

Draw the real mechanism with real names from the code. Boxes labelled *service* and
*database* describe every system ever built and this one not at all.

**Count check: diagrams drawn == key points on the list.** If there are fewer, either draw the
rest or shorten the list.

## 5. Then read the docs, and only to contradict

With the model already derived, read the README, the architecture records, the comments, the
example config. Report every claim the code does not support: a table that does not exist, a
command that would fail, a route never defined, a described mechanism that was replaced.

This costs almost nothing once the code has been read, and it is often the most valuable
thing returned — the contradictions are invisible to everyone who trusts the document.

## 6. Study in the background

Spawn a subagent for the reading and take back only the list.

Studying a repo means opening entry points, manifests, schemas, routes and config. All of
that lands in context and none of it is the answer. A subagent spends its own context and
returns the conclusion. Where no subagent is available, do it inline — the method does not
change, only the cost.

Give the subagent the method above, the target path, and the focus if one was supplied.

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
    - [ ] One ASCII diagram per key point — count matches
    - [ ] Mechanism written in the code's own names, not generic ones
    - [ ] Docs read last, contradictions reported or "none found"
    - [ ] No file written anywhere

## Report

Two lines and a question:

    STUDIED — 4 key points, #1 the validation gate on the only path out.
    11 places the docs contradict the code.
    Next: review what the tests prove against these.
    Want the list?

When the code will not yield an idea, that is a verdict rather than a shorter list:

    NOT STUDIED — no entry point resolves; this looks like a library with no assembled
    system to describe.
    Next: name what runs it, and I will study that instead.

The list, the diagrams and the contradictions are prepared and held until asked.
