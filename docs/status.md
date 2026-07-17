# Project: APEX — Coding/Development System
_A system of Claude Code skills: orchestration, planning, coding, and the gates between them._

stack: Markdown / Claude Code skills
autonomy_level: L2

> **This file is LIVE STATE ONLY. It is rewritten, never appended to. Hard cap: 100 lines.**
> History does not live here: what changed → `git log` · what the build learned → `docs/handoff/` ·
> why a decision was made → `docs/technical/adr/` · durable user/project facts → memory.
> A row whose work is done gets **deleted**, not marked done. Model/provider routing lives in
> `~/.claude/CLAUDE.md`, not here. See ADR-037.

_Last updated:_ 2026-07-17

<!-- CODING:START -->
## In-Flight
| What | State | File | Next |
|------|-------|------|------|
| _none_ | — | — | Next: **round 8 (#10)** — final cross-family review of ALL harness work steps 1–3 + the accumulated FLAG backlog (see Open Questions). Deserves a fresh session. |

<!-- CODING:END -->

<!-- PLANNING:START -->
## Pending Specs
| Spec | Summary |
|------|---------|
| _none_ | — |

## Open Questions

- **Audit + reconciliation reports on disk:** `docs/research/apex-v2-joint-audit-2026-07-15.md` (10
  BLOCKs, execution order) and `docs/research/reconciliation-pass.md`. Steps 1–3 closed #1–#9 (+ #13);
  step 3 (2026-07-17, `~/.claude` **b3cee7a**): two-tier critical-file gate + exit-76 Layer B +
  executable family gate, all suites green, 3 wave reviews + apex-reviewer + Opus review, no BLOCK.
  Only **#10 (round 8)** remains.

- **Migrate the 23 APEX-GENERIC memories out of Artemis** into APEX's own memory (and delete the 6 now
  enforced). A lesson about the build system, filed under the thing it built, is invisible to the next
  project.

- **Round 8 (#10) — accumulated review backlog. Do not trust the author's summary, incl. mine.**
  Step-3 FLAGs (all LOW, full detail in `docs/handoff/2026-07-17-session75.md`): classifier
  `-Test`-mandatory hang risk / comma-`-Paths` silent-0 misuse / inert `-AdditionalPaths` surface;
  wrapper `-Phase` unvalidated (typo skips Layer B + scope lock + baseline — ValidateSet closes it) +
  `$LASTEXITCODE` sentinel is discipline-dependent; family gate corrupt-line silent skip /
  `started`-MinValue ordering / `worktree_key` case-sensitive false-13; tree-pin blind to
  ignored-untracked files (all of `~/.claude`); exit-65 runtime adjudication has no ledger record;
  pre-family-field ledger rows permanently gate-13 (migration boundary). Older feeds:
  the round-7 harness fixes (unreviewed; limits in `docs/technical/harness-known-limits.md`); step-2
  carryover FLAGs (code-confirmed, non-blocking) — (a) `codex-dispatch.ps1` writes/truncates the log
  BEFORE the exit-71 shared-worktree check, so a same-spec+task second dispatch truncates a live sibling's
  log; (b) `apex-spec-validate.ps1` check-1 counts a URL/version string as a "file"; (c) pin-cleanup gated
  on `$preflightPinArmed` can leak a partial pin on an I/O failure mid-`tree-pin -Pin`; (d) Task-7 exit-71
  cleanup reviewer-traced not live-tested; **scope-check runtime-path exclusion** (see below); test suites
  that can't fail loudly (`scope-check-test.ps1`, `dispatch-test.ps1` print FAIL but exit 0). Step-2.5
  cap-guard FLAGs: (e) `context-cap-guard.js` `path.basename` throws on a non-string `file_path` (unreachable
  from CC's schema; fails open on crash — add a `typeof` guard); (f) it matches by BASENAME, so once blocking
  it gates ANY `status.md`/`CLAUDE.md`/`AGENTS.md` in any repo, not just APEX's (correct for AGENTS.md/32KB,
  over-reach for the line caps); (g) the "shrinking edit" test lands at cap not over it (equal-size test covers
  the over-cap case).

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
