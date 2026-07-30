# Project: APEX — Coding/Development System
_A system of Claude Code skills: orchestration, planning, coding, and the gates between them._

stack: Markdown / Claude Code skills
autonomy_level: L2

> **This file is LIVE STATE ONLY. It is rewritten, never appended to. Hard cap: 100 lines.**
> History does not live here: what changed → `git log` · what the build learned → `docs/handoff/` ·
> why a decision was made → `docs/technical/adr/` · durable user/project facts → memory.
> A row whose work is done gets **deleted**, not marked done. Model/provider routing lives in
> `~/.claude/hooks/apex-session-context.md` (hook-injected), not here. See ADR-037.

_Last updated:_ 2026-07-30 (late evening)

<!-- CODING:START -->
## In-Flight
| What | State | File | Next |
|------|-------|------|------|
| build-orchestrator-contract | PARKED to wave 3 (Sol r3: 31 of 38 cumulative resolved; channel doctrine owner-ratified and IN the spec). 5-item closed remainder, all mechanical: (1) refusal-shape nullability sentence + AC literal contradict the exit-75 live-run_id contract; (2) phase-token AC expects count 2, spec has 1 unspaced + 1 spaced; (3) exit-124 needs a no-final carrier (watchdog leaves child alive); (4) exit-80's request_abandon lacks a structured run_id source; (5) `apex-t8-bullet.txt` missing from scratch Create/Delete | `docs/drafts/build-orchestrator-contract.md` | wave-3 planning reopens with this list (or owner says "one more round" to finish now). Builds NOT blocked: interim-executor governs until this ships |

<!-- CODING:END -->

<!-- PLANNING:START -->
## Pending Specs
| Spec | Summary |
|------|---------|
| retro-wrapper-hygiene | P1(a) capacity lease · P5 orphan/adopt/teardown (Exit-Dispatch, obligation events, abandon CAS) · ledger telemetry · dwc empty-list refusal · declared_runtime_paths pre-flight. risk:high, Sol CLEAN r7. **Builds FIRST** (wrapper file gates wave 3) |
| retro-planning-gates | P3 reachability · P4(a/e) review-round cap + digest-bound reviews (two-phase sidecar) · template contract-pointer + Permissions-boilerplate fix · P7(a) plan-check max→xhigh. Owns spec-template.md |
| retro-scope-check-narrowing | P2(a) exact-list scope-check exclusions (presence-split predicate, statuses-map snapshot) · `.codex-scratch/` sole sanctioned scratch · lockstep generated tests. Shared-file edge w/ orchestrator spec declared |
| retro-validator-versioning | validator contract version + 11-fixture corpus + report-only sweep (-CorpusManifestPath, ERROR rows) · zero semantics change. Prereq: retro-planning-gates |
| adr032-predraft-architecture-pass | pre-draft Sol architecture pass, mandatory all Deep-Details (owner 2026-07-30) · approval-gate enforcement for risk:high · always-recorded sidecar row (`— (pre-draft)` sentinel no-op) · cold-read sidecar exclusion. Prereq: retro-planning-gates |

## Open Questions

- **Owner queue: CLEAR.** Done 2026-07-30/31: doctrine audit ratified (all 11 calls, both handoffs
  stamped) · channel conflict arbitrated (attendance-keyed: attended=detached, AFK=harness-owned;
  in the orchestrator spec's final round) · wave-2 sweep committed `f28c038` · D6 allow-list applied.
- **Wave-3 queue** (all behind the wrapper-hygiene build): sandbox-TEMP fix (research:
  `docs/research/sandbox-temp-research-2026-07-30.md` — wrapper per-run out-of-repo TEMP + artemis
  AGENTS.md redirect deletion + gitignore seeding) · P2(b/c) AGENTS.md verify contracts + per-worktree
  venv · family-gate integrated-tree digest binding (first repro exists) · apex-plan:156 residual is
  now owned by the parked orchestrator spec.
- Queued analyses: `attended` telemetry definition (ships in wrapper spec) · effort-policy bakeoff
  evidence (P7 a3) · post-ship scope-check re-census (~10 build days after wave 2).
- Remaining catalogued debt: scopelock's 2 pre-existing failures · verdict-test try-placement ·
  `tasks/` runtime-exclusion (P5(d), ships in wrapper spec). Manual cleanups owed: `%TEMP%\apex-wt-c45`
  + branch `wave-c45` · bulk `artemis-wt-*` · `%TEMP%\codex-*-plan-check*` Sol report files (~15) ·
  ledger orphan `3b651688` (dead plan-check row, adopt/abandon when P5 ships).
- A concurrent session is active in this repo and ~/.claude (its `docs/drafts/gpt-5.6-family-adoption.md`
  edit and `hooks/apex-ledger-append.ps1` are theirs — do not touch). It ran builds this evening
  (`newsletter-daily-synthesis`, `dismissal-vocabulary-widening`).
<!-- PLANNING:END -->
