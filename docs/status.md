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
| build-orchestrator-contract | PARKED (Sol r4: 36/43; ONE line — :306-307 "carry neither" contradicts the identity partition) | `docs/drafts/build-orchestrator-contract.md` | wave-3: one-line fix + widened sweep + single Sol re-check → promote |

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
  fixture fidelity · exit-81 stream inconsistency (4) teardown mutex-across-git perf debt.
- **Wave-3 queue** (unblocked now the wrapper build closed): preflight baseline digest→green cache
  + cheap-gates-first ordering (`docs/research/preflight-baseline-cache-plan-2026-07-31.md`) ·
  sandbox-TEMP fix (`docs/research/sandbox-temp-research-2026-07-30.md`) · P2(b/c) AGENTS.md verify
  contracts + per-worktree venv · family-gate integrated-tree digest binding · apex-plan:156
  residual (owned by orchestrator spec) · orchestrator spec one-line fix (row above).
- Queued analyses: `attended` telemetry definition (shipped in wrapper spec — verify in practice) ·
  effort-policy bakeoff evidence (P7 a3) · post-ship scope-check re-census (~10 build days after wave 2).
- **Harness kill anomaly (2026-07-31/08-01):** background dispatches externally killed 4/9 (whole
  tree; owner says not them; cause unknown); foreground 10-min timeout also kills the tree;
  schtasks/Start-Process detachment classifier-blocked. Mitigations in memory + handoff. Watch.
- Remaining catalogued debt: scopelock's 2 pre-existing failures · `tasks/` runtime-exclusion
  (P5(d) shipped — verify). Cleanup DONE 2026-08-01: all 5 apex-wt-* worktrees removed (adr032's
  transplanted ADR edits stashed on `codex/adr032`), 368 Sol plan-check temp files deleted;
  c45/artemis worktrees were already gone. STILL OWED: ledger orphan `3b651688` abandon — exit-82
  refused (live ~/.claude tree dirty with session memory edits; retry after a memory commit at a
  clean moment) · owner branch deletions (D8): `codex/retro-wrapper-hygiene`, `codex/adr032`,
  `codex/retro-planning-gates`, `codex/retro-scope-check`, `codex/retro-valver`, `wave-c45`.
- A concurrent session is active in this repo and ~/.claude (its `docs/drafts/gpt-5.6-family-adoption.md`
  edit and `hooks/apex-ledger-append.ps1` are theirs — do not touch, do not commit).
<!-- PLANNING:END -->
