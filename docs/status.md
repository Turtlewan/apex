# Project: APEX â€” Coding/Development System
_A system of Claude Code skills: orchestration, planning, coding, and the gates between them._

stack: Markdown / Claude Code skills
autonomy_level: L2

> **This file is LIVE STATE ONLY. It is rewritten, never appended to. Hard cap: 100 lines.**
> History does not live here: what changed â†’ `git log` Â· what the build learned â†’ `docs/handoff/` Â·
> why a decision was made â†’ `docs/technical/adr/` Â· durable user/project facts â†’ memory.
> A row whose work is done gets **deleted**, not marked done. Model/provider routing lives in
> `~/.claude/hooks/apex-session-context.md` (hook-injected), not here. See ADR-037.

_Last updated:_ 2026-07-30 (late evening)

<!-- CODING:START -->
## In-Flight
| What | State | File | Next |
|------|-------|------|------|
| **wave-2 routine build: DONE 2026-07-31 ~09:45** | 4 specs built, verified, integrated into both live trees, archived to done/: planning-gates (3 tasks) Â· scope-check-narrowing (4+host T4; suite 114â†’176) Â· validator-versioning (5 tasks; suite 19â†’33, contract 1.0.0, corpus+sweep live) Â· adr032 (3 tasks, both trees). Host close-out done: SKILL-HISTORY 3 rows, apex-planâ†’2.4.0, apex-codeâ†’2.14.0. TWO COMMITS AWAIT OWNER (drafts in chat): ~/.claude (~72 files incl. build) + apex (ADR-032/044 amendments, archives, registry) | `docs/changes/done/` | owner approves the two commits; then the wrapper-hygiene build (attended, risk:high) and the orchestrator one-line wave-3 fix |
| build-orchestrator-contract | PARKED (Sol r4: 36/43; ONE line â€” :306-307 "carry neither" contradicts the identity partition) | `docs/drafts/build-orchestrator-contract.md` | wave-3: one-line fix + widened sweep + single Sol re-check â†’ promote |

<!-- CODING:END -->

<!-- PLANNING:START -->
## Pending Specs
| Spec | Summary |
|------|---------|

## Open Questions

- **Owner queue: CLEAR.** Done 2026-07-30/31: doctrine audit ratified (all 11 calls, both handoffs
  stamped) Â· channel conflict arbitrated (attendance-keyed: attended=detached, AFK=harness-owned;
  in the orchestrator spec's final round) Â· wave-2 sweep committed `f28c038` Â· D6 allow-list applied.
- **Wave-3 queue** (all behind the wrapper-hygiene build): **preflight baseline digestâ†’green cache
  + cheap-gates-first ordering** (owner-queued 2026-07-31 from the Artemis suite-cost issue; plan:
  `docs/research/preflight-baseline-cache-plan-2026-07-31.md` â€” ~68 min/session yield) Â· sandbox-TEMP
  fix (`docs/research/sandbox-temp-research-2026-07-30.md`) Â· P2(b/c) AGENTS.md verify contracts +
  per-worktree venv Â· family-gate integrated-tree digest binding (first repro exists) Â· apex-plan:156
  residual (owned by the orchestrator spec).
- Queued analyses: `attended` telemetry definition (ships in wrapper spec) Â· effort-policy bakeoff
  evidence (P7 a3) Â· post-ship scope-check re-census (~10 build days after wave 2).
- Remaining catalogued debt: scopelock's 2 pre-existing failures Â· verdict-test try-placement Â·
  `tasks/` runtime-exclusion (P5(d), ships in wrapper spec). Manual cleanups owed: `%TEMP%\apex-wt-c45`
  + branch `wave-c45` Â· bulk `artemis-wt-*` Â· `%TEMP%\codex-*-plan-check*` Sol report files (~15) Â·
  ledger orphan `3b651688` (dead plan-check row, adopt/abandon when P5 ships).
- A concurrent session is active in this repo and ~/.claude (its `docs/drafts/gpt-5.6-family-adoption.md`
  edit and `hooks/apex-ledger-append.ps1` are theirs â€” do not touch). It ran builds this evening
  (`newsletter-daily-synthesis`, `dismissal-vocabulary-widening`).
<!-- PLANNING:END -->
