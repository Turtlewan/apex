# Project: APEX — Coding/Development System
_A system of Claude Code skills: orchestration, planning, coding, and the gates between them._

stack: Markdown / Claude Code skills
autonomy_level: L2

> **This file is LIVE STATE ONLY. It is rewritten, never appended to. Hard cap: 100 lines.**
> History does not live here: what changed → `git log` · what the build learned → `docs/handoff/` ·
> why a decision was made → `docs/technical/adr/` · durable user/project facts → memory.
> A row whose work is done gets **deleted**, not marked done. Model/provider routing lives in
> `~/.claude/CLAUDE.md`, not here. See ADR-037.

_Last updated:_ 2026-07-19

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

- **Audit + reconciliation reports on disk:** `docs/research/apex-v2-joint-audit-2026-07-15.md` (10
  BLOCKs, execution order) and `docs/research/reconciliation-pass.md`. Steps 1–3 closed #1–#9 (+ #13);
  step 3 (2026-07-17, `~/.claude` **b3cee7a**): two-tier critical-file gate + exit-76 Layer B +
  executable family gate, all suites green, 3 wave reviews + apex-reviewer + Opus review, no BLOCK.
  **#10 (round 8) DONE 2026-07-17** — all audit steps closed; only the 6 deferred design items remain (below).

- **★ USER RATIFICATION QUEUE (2026-07-19 "do all" run — see session-79b handoff):**
  **A1** Sonnet 5 as the Claude CODING fallback (recommend ADOPT; edits global CLAUDE.md + apex-code
  SKILL.md) · **A2** `max_parallel_codex` 3→2, guardrail half closed as moot (recommend ADOPT) ·
  **ADR-045** four-role split (drafted, supersedes ADR-035 — ratify or amend) · manual deletion of
  `%TEMP%\apex-wt-c45` + branch `wave-c45` (fully integrated).

- **2026-07-19 "do all" run SHIPPED** (live ~/.claude `1035192` `5cd10e9`, full battery + live smoke
  green): c4 closed c2's coverage debt (pin-first + adopt-77 cases, lockstep comments); c5 shipped the
  scope-check runtime-path exclusion (index-or-HEAD host-curated discriminator — the live-tree exit-65
  wedge is DEAD; 138 session paths excluded in the live smoke). Memory migration done (15 moved,
  5 deleted-enforced). P2 repair done (49 files; pin-change-sweep checklist at
  `docs/technical/pin-change-sweep.md`). Codex Remote answered: `codex exec` is OUTSIDE the remote
  surface; only Xcode/Swift stays Mac-gated (`docs/research/codex-remote-windows-2026-07.md`).
  Session-66 assessment: `docs/research/session66-amendments-assessment-2026-07-19.md` (A4 stays
  parked; `ultra` keeps an event-triggered eval design — first 3 real escalations become the corpus).

- Remaining catalogued debt: scopelock's 2 pre-existing failures · verdict-test try-placement ·
  wave-final digest-binding granularity (known-limits row) · add `tasks/` to the tree-pin/scope-check
  runtime lists (lockstep pair edit, queue with next harness spec). Worktrees `apex-wt-waveb1`/`-waveb2`
  deleted 2026-07-19 by user.

- A concurrent session is active in this repo (transient `docs/changes/gpt-5.6-family-adoption.md`
  sighting; its draft left uncommitted by this session's sweep deliberately).
<!-- PLANNING:END -->
