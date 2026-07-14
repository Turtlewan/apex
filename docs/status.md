# Project: APEX — Coding/Development System
_A system of Claude Code skills: orchestration, planning, coding, and the gates between them._

stack: Markdown / Claude Code skills
autonomy_level: L2

> **This file is LIVE STATE ONLY. It is rewritten, never appended to. Hard cap: 100 lines.**
> History does not live here: what changed → `git log` · what the build learned → `docs/handoff/` ·
> why a decision was made → `docs/technical/adr/` · durable user/project facts → memory.
> A row whose work is done gets **deleted**, not marked done. Model/provider routing lives in
> `~/.claude/CLAUDE.md`, not here. See ADR-037.

_Last updated:_ 2026-07-14

<!-- CODING:START -->
## In-Flight
| What | State | File | Next |
|------|-------|------|------|
| _none_ | — | — | — |

_The APEX v2 proving run is DONE (session 71). The harness was rebuilt on its findings and committed:
`~/.claude` `f458902` · `~/apex` `1266fd3`. Artemis shipped cap-deps-1a/1b/2 and AL-7c independently._
<!-- CODING:END -->

<!-- PLANNING:START -->
## Pending Specs
| Spec | Summary |
|------|---------|
| _none_ | — |

## Open Questions

- **NEXT UP — the reconciliation pass.** Artemis carries **57 memory files**, and a large slice are
  APEX lessons parked in a consumer project (`ab-revert-codex-worktree-trap`, `codex-exec-stdin-wedge`,
  `codex-rewrites-status-md`, `autonomous-wave-build-cadence`, …). One question per lesson: **is it
  enforced, or merely written down?** Evidence it matters: `ab-revert-codex-worktree-trap` was already
  named and understood **and still destroyed a coder's work on 2026-07-14**;
  `tauri-gateway-serde-silent-drop` has been named **85 times** and still recurs. **A memory is not a
  mechanism.** Needs a fresh context window (57 memories + 5 handoffs + 62 ADRs + AGENTS.md).

- **One mechanism already identified for that pass:** a readiness-gate check that refuses a spec whose
  acceptance criteria require files its own `## Files to change` list forbids. Mechanically checkable;
  has bitten three times, most recently AL-7c task 3 (caught only because exit 67 now works).

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
