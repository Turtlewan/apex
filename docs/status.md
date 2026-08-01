# Project: APEX — Coding/Development System
_A system of Claude Code skills: orchestration, planning, coding, and the gates between them._

stack: Markdown / Claude Code skills
autonomy_level: L2

> **This file is LIVE STATE ONLY. It is rewritten, never appended to. Hard cap: 100 lines.**
> History does not live here: what changed → `git log` · what the build learned → `docs/handoff/` ·
> why a decision was made → `docs/technical/adr/` · durable user/project facts → memory.
> A row whose work is done gets **deleted**, not marked done. Model/provider routing lives in
> `~/.claude/hooks/apex-session-context.md` (hook-injected), not here. See ADR-037.

_Last updated:_ 2026-08-01

<!-- CODING:START -->
## In-Flight
| What | State | File | Next |
|------|-------|------|------|
| wrapper-follow-ups | **BUILD-READY, promoted 2026-08-02** (`docs/changes/wrapper-follow-ups.md` 0b2ab0ce; plan-check converged 11→4→0 FLAG-only in 3 disposition rounds; validator 0). 9 tasks: 6 owner items + producer-side emission via Exit-Dispatch + registry. Risk high, sequential. BUILD STARTING (host interim-executor; owner-gated ~/.claude AGENTS.md task will PARK — owner AFK). | `docs/changes/wrapper-follow-ups.md` | build now → integrate → per-spec commit |
| orchestrator-activation | **BUILD-READY, promoted 2026-08-02** (`docs/changes/orchestrator-activation.md` 42842c4f; plan-check converged 12→4→0 FLAG-only; validator 0). Routes attended builds to the passed v1 agent (artifacts d87a0280/0b4ea056, amended + battery 161/161); channel probes BOTH CONFIRMED 2026-08-01 (detached 14.5min done; foreground migrated at 600s ceiling, done) — evidence in issue-13 § Caveats. | `docs/changes/orchestrator-activation.md` | build AFTER wrapper-follow-ups integrates (ordering edge on apex-code/SKILL.md); hooks task needs live owner confirmation |

<!-- CODING:END -->

<!-- PLANNING:START -->
## Pending Specs
| Spec | Summary |
|------|---------|

## Open Questions

- **Wrapper-hygiene build SHIPPED 2026-08-01** (commits `d5d872f` ~/.claude · `ecd4a25` apex; handoff
  `docs/handoff/2026-08-01.md`). **Owner queue — 4 adjudication items** (details handoff § Owner
  adjudication; recommended: fold all into one small wave-3 "wrapper-hygiene follow-ups" spec):
  (1) -AllowSharedWorktree/exit-80 spec amendment (narrow live-sibling exclusion to running/stalled)
  (2) spec's `branch -[dD]` acceptance-grep narrowing, then remove the ([char]45) evasion
  (3) delta-review low advisories: gate row_kind skip breadth · -Adopt stdout diff tail · lease
  fixture fidelity · exit-81 stream inconsistency (4) teardown mutex-across-git perf debt
  (5) NEW 2026-08-01 late: -Adopt phase catch-22 — adopt requires -Phase build|review AND matches
  rows by spec+phase, so rows recorded with test phases (verify-fast/verify-stall, 7 dispatcher-test
  orphans in ~/.claude) are unrecoverable by adopt; abandon 82s on the dirty tree. Wrapper fix or
  clean-moment abandon. (6) Sol r5 exit-79 doctrine note: SKILL.md:169 queues BOTH 79 conditions,
  but the invalid-capacity-contract sub-case is permanent — consider a distinct exit or park rule.
- **Wave-3 queue** (unblocked now the wrapper build closed): preflight baseline digest→green cache
  + cheap-gates-first ordering (`docs/research/preflight-baseline-cache-plan-2026-07-31.md`) ·
  sandbox-TEMP fix (`docs/research/sandbox-temp-research-2026-07-30.md`) · P2(b/c) AGENTS.md verify
  contracts + per-worktree venv · family-gate integrated-tree digest binding · apex-plan:156
  residual (owned by orchestrator spec) · orchestrator spec re-alignment (row above; was "one-line
  fix" — invalidated by Sol r5).
- Queued analyses: `attended` telemetry definition (shipped in wrapper spec — verify in practice) ·
  effort-policy bakeoff evidence (P7 a3) · post-ship scope-check re-census (~10 build days after wave 2).
- **Harness kill anomaly (2026-07-31/08-01):** background dispatches externally killed 4/9 (whole
  tree; owner says not them; cause unknown); foreground 10-min timeout also kills the tree;
  schtasks/Start-Process detachment classifier-blocked. Mitigations in memory + handoff. Watch.
- Remaining catalogued debt: scopelock's 2 pre-existing failures · `tasks/` runtime-exclusion
  (P5(d) shipped — verify). Cleanup DONE 2026-08-01: all 5 apex-wt-* worktrees removed (adr032's
  transplanted ADR edits stashed on `codex/adr032`), 368 Sol plan-check temp files deleted;
  c45/artemis worktrees were already gone. 2026-08-01 late: both apex-worktree orphans
  (audit-step2-m2b-m3 task10 ×2) resolved via -Adopt → adopted-blocked (abandon refuses exit-82 on
  the dirty tree; adopt is the working recovery for dead orphans). STILL OWED: ~24 orphans on
  OTHER worktrees — ~9 hold ~/.claude and will exit-80-wedge any dispatch there under the new
  strict wrapper (adopt-sweep at a clean moment) · ledger orphan `3b651688` abandon (exit-82,
  dirty ~/.claude) · owner branch deletions (D8): `codex/retro-wrapper-hygiene`, `codex/adr032`,
  `codex/retro-planning-gates`, `codex/retro-scope-check`, `codex/retro-valver`, `wave-c45`.
- A concurrent session is active in this repo and ~/.claude (its `docs/drafts/gpt-5.6-family-adoption.md`
  edit and `hooks/apex-ledger-append.ps1` are theirs — do not touch, do not commit).
<!-- PLANNING:END -->
