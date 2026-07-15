# Project: APEX — Coding/Development System
_A system of Claude Code skills: orchestration, planning, coding, and the gates between them._

stack: Markdown / Claude Code skills
autonomy_level: L2

> **This file is LIVE STATE ONLY. It is rewritten, never appended to. Hard cap: 100 lines.**
> History does not live here: what changed → `git log` · what the build learned → `docs/handoff/` ·
> why a decision was made → `docs/technical/adr/` · durable user/project facts → memory.
> A row whose work is done gets **deleted**, not marked done. Model/provider routing lives in
> `~/.claude/CLAUDE.md`, not here. See ADR-037.

_Last updated:_ 2026-07-15

<!-- CODING:START -->
## In-Flight
| What | State | File | Next |
|------|-------|------|------|
| Reconciliation pass — **M2b** (dispatch pre-flight, exit 72) and **M3** (Files-to-Change completeness) | not started | `docs/research/reconciliation-pass.md` | M2b: design in Sol's 4 pre-flight BLOCKs (before-reservation placement so no phantom row, tree-pin the pre-flight, `&&`-aware test-line split, no circular DetectOnly). M3 as planned. |

_**M1 (encoding gate)** committed `~/.claude` 4876e79. **M2a (baseline commit hook)** committed
`~/.claude` d0a18df — staged-snapshot pre-commit hook, 2 cross-family BLOCK rounds → CLEAN. The
pipe-deadlock fix that unblocked Codex dispatch is committed too (51b795a)._
<!-- CODING:END -->

<!-- PLANNING:START -->
## Pending Specs
| Spec | Summary |
|------|---------|
| _none_ | — |

## Open Questions

- **The reconciliation pass RAN (session 72).** 58 Artemis memories → **23 are APEX-GENERIC** (build-system
  lessons parked in a consumer project); 12 of those had recurred *after* being written down. Report:
  `docs/research/reconciliation-pass.md`. **The finding: the lessons that stopped recurring are exactly
  the ones that got a hook or a script. Every lesson still recurring only ever got a paragraph.**
  Six were already mechanised by session 71's rebuild and can be **retired** (stdin wedge · orchestrator
  early-return · status.md rewrites · quiet-tree deletions · `ab-revert` worktree trap · part of the git
  traps). **M1 (encoding gate) is now built.** Two remain:

- **M2a — baseline commit hook: DONE** (`~/.claude` d0a18df). The *before-commit* end of the rule is
  now a git pre-commit hook that verifies the STAGED snapshot and blocks a red commit. **M2b is the
  *before-dispatch* end** — a wrapper pre-flight (fast lint+mypy subset) that refuses to launch a build
  on a red baseline (new exit 72). Deferred because Sol's 4 BLOCKs all lived there; design them in.

- **Two latent `codex-dispatch.ps1` bugs found (session 73), not yet fixed** — worth a short debug pass:
  (a) the child's stdin isn't pinned to UTF-8, so a **non-ASCII prompt is rejected by codex** ("input is
  not valid UTF-8") — likely breaks real dispatches with em-dashes in the prompt from non-console
  contexts; (b) the M1 **encoding scan sweeps transcript/log dirs**, tripping a spurious exit 73 on a
  review dispatch into any log-bearing tree (masks the verdict). Both worked around this session.

- **M3 — Files-to-Change completeness.** `spec-files-to-change-include-tests` +
  `specs-underlist-api-shape-tests`, bitten 3×+, are **one rule**: a spec's `## Files to Change` must
  contain every file its acceptance criteria and task bodies name — that list is also the wave-grouping
  and the scope-lock, so an omission forces the coder out of scope (now exit 65). Mechanically checkable.

- **The readiness gate is itself ten checkboxes of prose in a SKILL.md, self-checked by the model** —
  structurally identical to "always dispatch through the wrapper", which lost three times running until
  a hook made it impossible. **On this pass's own logic it is the next prose control to fail.**

- **Migrate the 23 APEX-GENERIC memories out of Artemis** into APEX's own memory (and delete the 6 now
  enforced). A lesson about the build system, filed under the thing it built, is invisible to the next
  project.

- **Round 8 of the harness review was never run.** The round-7 fixes are new and unreviewed. Known
  limits, accepted trade-offs, and the hook's false-positive cost are written down in
  `docs/technical/harness-known-limits.md`. **If you change the harness, have the other family review
  it — and do not trust the author's summary, including mine.**

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
