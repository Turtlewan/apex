# Project: APEX — Coding/Development System
_A system of Claude Code skills: orchestration, planning, coding, and the gates between them._

stack: Markdown / Claude Code skills
autonomy_level: L2

> **This file is LIVE STATE ONLY. It is rewritten, never appended to. Hard cap: 100 lines.**
> History does not live here: what changed → `git log` · what the build learned → `docs/handoff/` ·
> why a decision was made → `docs/technical/adr/` · durable user/project facts → memory.
> A row whose work is done gets **deleted**, not marked done. Model/provider routing lives in
> `~/.claude/hooks/apex-session-context.md` (hook-injected), not here. See ADR-037.

_Last updated:_ 2026-07-29

<!-- CODING:START -->
## In-Flight
| What | State | File | Next |
|------|-------|------|------|

<!-- CODING:END -->

<!-- PLANNING:START -->
## Pending Specs
| Spec | Summary |
|------|---------|

## Open Questions

- **NEXT SESSION: draft + build the doctrine-sweep spec** (apex-plan). Source:
  `docs/research/doctrine-audit-2026-07-29/README.md` — ~55 findings from 4-reviewer audit;
  **D1–D8 all RATIFIED 2026-07-29** (D1 via Sol deliberation `0e7d2938`); spec = ADR amendment
  drafts + mechanical categories 1–10. Then (or same wave plan) the retro P1–P7 specs:
  `docs/research/artemis-retro-2026-07-29.md` (Sol-checked v2; effort policy: review xhigh,
  coding medium provisional + bakeoff; prerequisite task: issue-13 kill-ceiling root-cause).
  Overhaul session's own changes are COMMITTED (`~/.claude` b1a312d + c48dd1e; handoff
  `docs/handoff/2026-07-29-overhaul.md`).

- **Queued analyses (from Sol review):** stratify the 281 `done_with_concerns` / 159
  `critical_violation` / 186 retried-task-key ledger cohorts; stratify Atlas's 88 blocked rows
  before diagnosing; `attended` telemetry definition.

- Remaining catalogued debt: scopelock's 2 pre-existing failures · verdict-test try-placement ·
  wave-final digest-binding granularity (known-limits row) · `tasks/` runtime-exclusion entry now
  carried by retro plan P5(d). Manual step still open: delete `%TEMP%\apex-wt-c45` + branch
  `wave-c45` (fully integrated; `!` one-liners). 20+ stale `artemis-wt-*` worktrees await the
  P5(c) creator-owned teardown mechanism (bulk cleanup via `!` when convenient).

- A concurrent session is active in this repo (its `docs/drafts/gpt-5.6-family-adoption.md` edit
  left uncommitted deliberately).
<!-- PLANNING:END -->
