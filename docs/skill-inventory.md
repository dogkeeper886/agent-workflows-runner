# Skill & Command Inventory

The record behind STORY-001's question *"which skills does the template actually
use, and which should be retired?"* Inventory first, then retire — and the
inventory found nothing unused, so nothing was retired.

## What's here and who uses it

| Artifact | Role | Referenced by |
|---|---|---|
| `install` skill | Installs the framework into a project | the entry point; ships the three skills below |
| `ci-testcase` skill | Generates YAML test cases | shipped into projects by `install`; `/ci-testcase` |
| `ci-run` skill | Runs test cases (simple judge default, LLM judge opt-in) | shipped into projects by `install` |
| `add-tool` skill | Adds MCP tools | shipped into projects by `install` |
| `review-docs-privacy` skill | Security + doc-quality review | README skills table |
| `reviewing-artifacts` skill | Agent-read artifact review | `CLAUDE.md` §6 |
| `reviewing-phrasing` skill | Human-read doc — the words | `CLAUDE.md` §6 |
| `reviewing-typography` skill | Human-read doc — the look | `CLAUDE.md` §6 |
| `dev-workflow/dw-*` commands | Story → tasks → implement → PR → merge pipeline | `CLAUDE.md` §5 |
| `qa-workflow/qw-*` commands | Test-doc planning, authoring, binding, drift | `dw-story`, `qw-drift` |

## Decision

**Retire nothing.** Every skill and command is referenced — the test-framework
skills (`install`, `ci-run`, `ci-testcase`, `add-tool`) are shipped by `install`;
the rest are maintainer tooling wired into this repo's `CLAUDE.md` §5/§6. None is
orphaned, so there is no unused skill to retire.

Scoping the template down to only the shipped test-framework skills would be a
deliberate change of intent, not an unused-code cleanup — and it would contradict
the `CLAUDE.md` discipline this repo runs on. Out of scope here.
