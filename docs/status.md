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
| retro-wrapper-hygiene | PARKED at the Sol gate per pass-or-park: re-verify 20/22 RESOLVED, BLOCK on 5 narrow remainders (closed fix list in handoff `2026-07-30-evening.md`) | `docs/drafts/retro-wrapper-hygiene.md` | owner picks: one more dictated round (recommended) · park to wave 2 · override |

<!-- CODING:END -->

<!-- PLANNING:START -->
## Pending Specs
| Spec | Summary |
|------|---------|
| retro-wrapper-hygiene *(draft — PARKED, see In-Flight)* | P1(a) capacity lease · P5 orphan/adopt/teardown · ledger telemetry · dwc empty-list refusal · declared_runtime_paths pre-flight. risk:high — 5-item closed fix list pending owner branch decision |
| retro-planning-gates | P3 reachability · P4(a/e) review-round cap + digest-bound reviews (two-phase sidecar) · template contract-pointer + Permissions-boilerplate fix · P7(a) plan-check max→xhigh. Owns spec-template.md |
| retro-scope-check-narrowing | P2(a) exact-list scope-check exclusions (presence-split ignored-only predicate, statuses-map snapshot) · `.codex-scratch/` sole sanctioned scratch prescription · lockstep generated per-entry tests |
| retro-validator-versioning | validator contract version + 11-fixture corpus + report-only migration sweep (-CorpusManifestPath, ERROR rows) · zero semantics change. Prereq: retro-planning-gates (template line) |

## Open Questions

- **Owner queue (2026-07-30):** staged CLAUDE.md applied 18:2x ✔ (D1 worktree-branch carve-out now
  live). Remaining: audit the host's autonomous doctrine calls (handoff `docs/handoff/2026-07-30.md`
  Decisions list). Doctrine-sweep is COMMITTED: apex `9e3deb1` · ~/.claude `2c9f1f5`.
- **Next planning target: the retro P1–P7 spec set** (`docs/research/artemis-retro-2026-07-29.md`)
  — now carries FOUR pointed dependencies from the sweep: build-orchestrator agent contract ·
  integrated-tree digest binding (first live reproduction: family gate exit-12s on tasks 1–21) ·
  D8 teardown hook allowance P5(c) · D5 docs/audit content-aware classifier change. Plus the D6
  docs-agent permissions follow-up. **Issue-13 CLOSED (2026-07-30):** historic kills = harness-era process-tree deaths (wrapper
  exonerated); current harness kills nothing (six probes ~100 min incl. a 40-min idle run; E4/E5a
  classified manual stops). **P1(b) UNBLOCKED** — version-pinned caveat + real-codex ~12-min
  confirmation goes into P1(b) ACs. `docs/research/issue13-kill-ceiling-rootcause-2026-07-30.md`.
- **Owner decisions (2026-07-30 evening):** P4(b) pre-draft Sol architecture pass = ALL
  Deep-Details specs (ADR-032 amendment queued, applies from wave 2) · D6 docs-agent allow-list
  drafted THIS session for owner approval · sandbox-TEMP researched now, spec in wave 2.
- Cohort + Atlas stratifications DONE (`docs/research/ledger-stratification-2026-07-30.md`):
  ~85% of dwc + 87.5% of critical_violation are two env signatures (sandbox TEMP-in-repo, scratch
  cleanup); Atlas 72%-blocked = denominator artifact (one iterative review spec; AGENTS.md
  hypothesis refuted); 60% of retry churn = sandbox-verify gap. **New retro lever not in P1–P7:
  writable out-of-repo TEMP in the sandbox profile.** Still queued: `attended` telemetry
  definition; effort-policy bakeoff evidence (last build all-medium: 23/23 green).
- Remaining catalogued debt: scopelock's 2 pre-existing failures · verdict-test try-placement ·
  `tasks/` runtime-exclusion (retro P5(d)). Manual cleanups owed: `%TEMP%\apex-wt-c45` + branch
  `wave-c45`; bulk `artemis-wt-*` (P5(c) mechanism).
- A concurrent session is active in this repo and ~/.claude (its `docs/drafts/gpt-5.6-family-adoption.md`
  edit and new `hooks/apex-ledger-append.ps1` are theirs — do not touch).
<!-- PLANNING:END -->
