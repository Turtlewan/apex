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
| issue-13 probes | SUSPENDED — E4 (12.0-min) and E5a (0.9-min) both ended with the manual-stop signature ("was stopped"); no timer fits both. Probing stopped in case the stops were human | `docs/research/issue13-kill-ceiling-rootcause-2026-07-30.md` | owner answers: did you stop those two background tasks? yes → E1–E3 verdict stands (no ceiling while session active); no → harness reap policy, needs one more controlled probe |

<!-- CODING:END -->

<!-- PLANNING:START -->
## Pending Specs
| Spec | Summary |
|------|---------|

## Open Questions

- **Owner queue (2026-07-30):** staged CLAUDE.md applied 18:2x ✔ (D1 worktree-branch carve-out now
  live). Remaining: audit the host's autonomous doctrine calls (handoff `docs/handoff/2026-07-30.md`
  Decisions list). Doctrine-sweep is COMMITTED: apex `9e3deb1` · ~/.claude `2c9f1f5`.
- **Next planning target: the retro P1–P7 spec set** (`docs/research/artemis-retro-2026-07-29.md`)
  — now carries FOUR pointed dependencies from the sweep: build-orchestrator agent contract ·
  integrated-tree digest binding (first live reproduction: family gate exit-12s on tasks 1–21) ·
  D8 teardown hook allowance P5(c) · D5 docs/audit content-aware classifier change. Plus the D6
  docs-agent permissions follow-up. **Issue-13 (2026-07-30): historic mechanisms root-caused** (600-s foreground cap + subagent
  turn-end reap on the mid-July harness; wrapper exonerated — zero kill paths). Current-harness
  status UNRESOLVED pending one owner answer (see In-Flight row); P1(b) stays gated meanwhile.
  `docs/research/issue13-kill-ceiling-rootcause-2026-07-30.md`.
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
