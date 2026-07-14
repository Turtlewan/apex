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

_ADR-036/037/038 + the AFK revert are shipped: `~/.claude` `d968fd0` · `~/apex` `29da72b`. Rows deleted per the new rule — git is the record._
<!-- CODING:END -->

<!-- PLANNING:START -->
## Pending Specs
| Spec | Summary |
|------|---------|
| _none_ | — |

## Open Questions

- **Stale present-tense claims in records (P2).** When a model pin changes, ~20 config files get
  updated and **zero records do**. Live config is correct; the rot is in prose. Three classes, three
  rules: *decision records* (an ADR saying "we chose gpt-5.5") are correct as-is — never edit, that
  falsifies history; *present-tense claims about the live system* ("the coder **is** gpt-5.5") are
  stale and must catch up; *missing supersession* headers must be added. Recurred on the Terra→Sol
  swap. Missing mechanism: a pin-change sweep that covers the record class, not just config.
  Generalises past model pins to any fact living in both config and prose.

- **Session-66 model-usage amendments — parked until ~2026-07-25** (awaiting more GPT-5.6 data).
  Four, unapplied: **A1** Sonnet 5 as the Claude coding fallback (Opus → judgment-only rung)
  [MED-HIGH] · **A2** wave concurrency 3→2 + token/$ guardrails [HIGH] · **A3** coder bakeoff —
  *closed by decision, not measurement* (ADR-034 made Sol default) · **A4** cheap-worker tier
  (Luna/Haiku; test-rich + file-disjoint + fixed-interface only) — needs its own ADR + eval.
  Report: `docs/research/gpt56-vs-claude-model-usage/README.md`.

- **Codex Remote on Windows may retire the "autonomous builds are Mac-gated" assumption.** That gate
  was the DeepSeek base-URL swap, which Cloud Routines couldn't honour — but the coder is now Codex,
  which is Windows-native and headless. **Verify first:** Codex Remote watches the *Codex app's*
  sessions, a different surface from APEX's `codex exec` subprocess. Confirm what is actually
  observable/approvable before building a remote autonomous loop.

- **`ultra` effort rung is un-evaled.** ADR-034 promoted it to the final automatic rung on structural
  grounds (Sol became the coder, so the ladder lost its Sol rung). It has never been measured against
  `max`. First to cut if an eval disappoints.

- **ADR-036 proving runs still owed.** The knowledge-layer cut is unvalidated in a real build: does a
  spec review still catch what it used to, without a domain rulebook? Does a build verify correctly
  from AGENTS.md alone? First real build after the cut is the proving run.
<!-- PLANNING:END -->
