# Remove list: `.claude/commands/` and `.claude/skills/`

A fork is a local copy of a unit this plugin ships or shipped. Both appear in the menu,
under different namespaces, and nothing announces which one ran.

`/agent-workflows-runner:review-ci-system` always reaches the placed unit. A bare
`/review-ci-system` reaches the fork when one exists. Until the fork is gone, the namespaced
form is the only one that says which copy ran.

## Renamed: delete the fork, type the new name

| Fork | Placed unit |
|---|---|
| `qa-plan`, `qw-plan` | `analysis-sut` — what must be tested, derived from the code |
| `qa-cases`, `qw-cases` | `create-test` |
| `qa-review-plan`, `qa-review-cases`, `qw-review-plan`, `qw-review-cases` | folded into the producer — the review is a step inside it, not a second unit |
| `dw-test-design` | `analysis-sut`, then `review-ci-system` |
| `qa-run` where it exists as a command | nothing to type: running the suite is the project's own runner |

## Shadowing: delete the fork, the placed one is the same job

A local copy of any name this plugin ships now: `analysis-sut`, `review-ci-system`,
`create-test`, `prune-test`, `remove-stale-files`.

## Retired: nothing replaces these

Delete only after saying so. There is no new name to type.

| Fork | What it leaves behind |
|---|---|
| `qa-bind`, `qa-review-bind` | **nothing at all.** The binding audit ends here — it checked a markdown doc against the executable it named, and that layer is gone |
| `setup-agent-runner` | **nothing.** It wrote the profile sections and migrated forks; this unit takes only the second half, and no unit configures a repo any more |
| `agent-runner-flow` | its five design rules — no hardcoded ids, stable fixture names, one connected chain, teardown — now live inside `create-test`, where they are acted on rather than read |
| `qw-drift` | drift detection, and it belongs to the `agent-workflows` plugin's list rather than this one. Leave it to that cleanup |

## Not ours

Every other file in those two directories. Report it, leave it.
