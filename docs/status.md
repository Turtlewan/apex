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
| build-orchestrator-contract | PARKED at pass-or-park (Sol r2: 24 of 30 cumulative findings resolved; 8-item closed remainder in handoff `2026-07-30-evening.md` § Wave-2 addendum — 7 mechanical + ONE OWNER ARBITRATION: high-risk channel doctrine, ADR-029 literal sequential-foreground vs the >10-min detached kill-mitigation; churn zone's third form) | `docs/drafts/build-orchestrator-contract.md` | owner arbitrates the channel conflict → one dictated round, or park to wave 3. Builds NOT blocked: interim-executor path governs until this ships |

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

- **Owner queue:** (1) audit host doctrine calls — `docs/handoff/2026-07-30.md` Decisions +
  `2026-07-30-evening.md` Decisions (incl. the D1-exception host-takeover ruling); (2) paste the D6
  allow-list into `~/.claude/settings.json` (7 lines, in chat — classifier blocks the host's write);
  (3) arbitrate the high-risk channel conflict (In-Flight row); (4) approve the wave-2 sweep commit
  (drafted in chat).
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
