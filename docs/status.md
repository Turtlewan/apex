# Project: APEX — Coding/Development System
_A system of Claude Code skills: orchestration, planning, coding, and the gates between them._

stack: Markdown / Claude Code skills
autonomy_level: L2

> **This file is LIVE STATE ONLY. It is rewritten, never appended to. Hard cap: 100 lines.**
> History does not live here: what changed → `git log` · what the build learned → `docs/handoff/` ·
> why a decision was made → `docs/technical/adr/` · durable user/project facts → memory.
> A row whose work is done gets **deleted**, not marked done. Model/provider routing lives in
> `~/.claude/CLAUDE.md`, not here. See ADR-037.

_Last updated:_ 2026-07-18

<!-- CODING:START -->
## In-Flight
| What | State | File | Next |
|------|-------|------|------|
| Wave B2 build | partial | docs/changes/round8-c{1,2,3}-*.md | HALTED mid-c1 by user (session clear). c1 task-1 DONE, task-3 coder RUNNING at halt (adopt on resume), tasks 2/4 pending, then c2→c3. **Full resume state: `docs/progress/wave-b2-c1-halt.md`** — drain it first. |

<!-- CODING:END -->

<!-- PLANNING:START -->
## Pending Specs
| Spec | Summary |
|------|---------|
| round8-c1-digest-emitters | tree-pin `-Digest` mode + scope-check `-WrittenPathsFile` attribution emission. Build FIRST. |
| round8-c2-dispatch-binding | Dispatcher digest binding (exits 77/78), post-hoc critical classification, adopt-path controls, SKILL.md 2.11.0. After c1. |
| round8-c3-gate-compare | Family-gate digest state-matrix compare + override disqualification. After c2. |

## Open Questions

- **Audit + reconciliation reports on disk:** `docs/research/apex-v2-joint-audit-2026-07-15.md` (10
  BLOCKs, execution order) and `docs/research/reconciliation-pass.md`. Steps 1–3 closed #1–#9 (+ #13);
  step 3 (2026-07-17, `~/.claude` **b3cee7a**): two-tier critical-file gate + exit-76 Layer B +
  executable family gate, all suites green, 3 wave reviews + apex-reviewer + Opus review, no BLOCK.
  **#10 (round 8) DONE 2026-07-17** — all audit steps closed; only the 6 deferred design items remain (below).

- **Migrate the 23 APEX-GENERIC memories out of Artemis** into APEX's own memory (and delete the 6 now
  enforced). A lesson about the build system, filed under the thing it built, is invisible to the next
  project.

- **★ NEXT — build Wave B2** (3 pending specs, c1→c2→c3). This closes ADR-044 / D6 and with it
  the whole round-8 deferred set. Known debt deliberately left: scopelock's 2 pre-existing
  failures (cleanup-spec class, findings doc) · verdict-test try-placement consistency (FLAG) ·
  deleted-leaf-in-collapsed-dir attribution blind spot (stated limit, c1).

- **Live session data lives inside the judged tree:** `~/.claude` co-hosts the session runtime
  (`projects/`, `sessions/`, `backups/`, `jobs/`…), so EVERY dispatch into that tree exits 65 while a
  session runs — the host's own transcript is "out of scope". Interim: host adjudicates 65s whose flagged
  list ⊆ runtime dirs. Real fix = a scope-check runtime-path exclusion (round 8). **Design note (Sol,
  step-2.5 r1):** git-status CLASS is useless as a discriminator here — the blanket `*` ignore makes
  churn `!!`, not `??`, and force-added memory/skills are tracked. Use the git INDEX (tracked vs not)
  as the discriminator; residual gap = a new untracked file under a runtime dir stays masked — decide
  accept-as-known-limit vs pattern-tighten. (Attempted in step 2.5, pulled as too hard for that spec.)

- **Stale present-tense claims in records (P2).** When a model pin changes, ~20 config files get
  updated and **zero records do**. Live config is correct; the rot is in prose. *Decision records*
  (an ADR saying "we chose gpt-5.5") are correct as-is — never edit, that falsifies history;
  *present-tense claims about the live system* ("the coder **is** gpt-5.5") are stale and must catch
  up; *missing supersession* headers must be added. Missing mechanism: a pin-change sweep that covers
  the record class, not just config.

- **Session-66 model-usage amendments — parked until ~2026-07-25** (awaiting more GPT-5.6 data).
  **A1** Sonnet 5 as the Claude coding fallback [MED-HIGH] · **A2** wave concurrency 3→2 + token/$
  guardrails [HIGH] · **A4** cheap-worker tier (needs its own ADR + eval). A3 closed by ADR-034.
  Report: `docs/research/gpt56-vs-claude-model-usage/README.md`.

- **Codex Remote on Windows may retire the "autonomous builds are Mac-gated" assumption.** Verify
  first: Codex Remote watches the *Codex app's* sessions, a different surface from APEX's
  `codex exec` subprocess. Confirm what is observable/approvable before building a remote loop.

- **`ultra` effort rung is un-evaled.** Promoted on structural grounds (ADR-034), never measured
  against `max`. First to cut if an eval disappoints.
<!-- PLANNING:END -->
