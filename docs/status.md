# Project: APEX — Coding/Development System
_A system of Claude Code skills: orchestration, planning, coding, and the gates between them._

stack: Markdown / Claude Code skills
autonomy_level: L2

> **This file is LIVE STATE ONLY. It is rewritten, never appended to. Hard cap: 100 lines.**
> History does not live here: what changed → `git log` · what the build learned → `docs/handoff/` ·
> why a decision was made → `docs/technical/adr/` · durable user/project facts → memory.
> A row whose work is done gets **deleted**, not marked done. Model/provider routing lives in
> `~/.claude/hooks/apex-session-context.md` (hook-injected), not here. See ADR-037.

_Last updated:_ 2026-07-30

<!-- CODING:START -->
## In-Flight
| What | State | File | Next |
|------|-------|------|------|
| doctrine-sweep close-out | built 23/23 · verified · reviewed (FLAG→fixed) · archived — **awaiting the two commit approvals** | `docs/changes/done/doctrine-sweep.md` | owner approves the two drafted commits (handoff § Build addendum); on approval, host commits path-scoped + appends the ADR-042 human-review gate rows |

<!-- CODING:END -->

<!-- PLANNING:START -->
## Pending Specs
| Spec | Summary |
|------|---------|

## Open Questions

- **Owner queue (2026-07-30, handoff `docs/handoff/2026-07-30.md` + its Build addendum):**
  (1) approve the two doctrine-sweep commits (drafts in the handoff); (2) apply staged CLAUDE.md:
  `! cp ~/CLAUDE.md.new ~/.claude/CLAUDE.md && rm ~/CLAUDE.md.new`; (3) audit the host's
  autonomous doctrine calls (handoff Decisions list).
- **Next planning target: the retro P1–P7 spec set** (`docs/research/artemis-retro-2026-07-29.md`)
  — now carries FOUR pointed dependencies from the sweep: build-orchestrator agent contract ·
  integrated-tree digest binding (first live reproduction: family gate exit-12s on tasks 1–21) ·
  D8 teardown hook allowance P5(c) · D5 docs/audit content-aware classifier change. Plus the D6
  docs-agent permissions follow-up. Prerequisite task: issue-13 kill-ceiling root-cause.
- Queued analyses: done_with_concerns/critical_violation/retry cohort stratification; Atlas
  blocked-row stratification; `attended` telemetry definition; effort-policy bakeoff evidence
  (this build ran all-medium: 23/23 green, 2 concerns, 1 sandbox crash).
- Remaining catalogued debt: scopelock's 2 pre-existing failures · verdict-test try-placement ·
  `tasks/` runtime-exclusion (retro P5(d)). Manual cleanups owed: `%TEMP%\apex-wt-c45` + branch
  `wave-c45`; bulk `artemis-wt-*` (P5(c) mechanism).
- A concurrent session is active in this repo and ~/.claude (its `docs/drafts/gpt-5.6-family-adoption.md`
  edit and new `hooks/apex-ledger-append.ps1` are theirs — do not touch).
<!-- PLANNING:END -->
