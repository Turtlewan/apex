# ADR-034 — Sol as the default coder

**Status:** Accepted
**Date:** 2026-07-13
**Supersedes (in part):** ADR-027 (`gpt-5.6-terra` as the default coder model) · ADR-032 (Sol as a
verify-fail escalation rung, and as the standing AFK end-of-run reviewer)
**Related:** ADR-030 (reasoning-effort dial) · ADR-033 A1 (standing AFK Sol end-gate)

> **Fallback coder amended by [ADR-045](./ADR-045-four-role-split.md) (2026-07-19, A1 session-79b):** the Claude fallback coder is **Sonnet 5** (a fresh `model: sonnet` worker), **not Opus**. Opus holds the spec-author, build-orchestrator (owner amendment 2026-07-29), and high-risk-reviewer roles — not the coder role. Every "Opus fallback" / "Opus builds inline" statement below is historical. Sweep recorded in [ADR-046](./ADR-046-doctrine-audit-resolutions.md).

> **Default model amended (2026-10-09, coder-default-gpt61):** the default coder (Engine default and `codex` alias) and the wrapper default used by the Sol cold read and Codex review are now **`gpt-6.1-sol`**. `gpt-5.6-sol` remains an allowed explicit pin. References to `gpt-5.6-sol` as the default below are historical.

## Context

ADR-027 collapsed the multi-model coding router into **one frontier coder + an effort dial**. The
model chosen for that slot was `gpt-5.6-terra` — roughly gpt-5.5 quality at about half the cost
($2.50/$15 per Mtok) — with `gpt-5.6-sol` reserved for three *other* jobs:

1. the plan-check gate (apex-plan),
2. a verify-fail escalation rung above the effort dial (`…→max` → Sol → Opus),
3. the standing end-of-run adversarial pass on AFK builds (ADR-033 A1).

Session 66's Opus×Sol deliberation confirmed "Terra default coder" and parked amendment A3 — a
Terra-vs-Luna-vs-Sol bakeoff — as *"Terra stays until measured."*

The owner has now decided, from accumulated real use rather than a bakeoff, to promote **Sol to the
default coder slot**. That decision is taken as given. This ADR records the two structural
consequences it forces, because Sol cannot hold the coder slot *and* keep jobs (2) and (3).

## Decision

**`gpt-5.6-sol` is the default coder.** Every `▸codex` task dispatches on `-m gpt-5.6-sol`. Terra is
retired from the live system — no `▸terra` tag, no cheap tier, no per-task model routing. There
remains exactly **one Codex model and one effort dial** (the ADR-027 invariant is preserved; only the
model string changes).

Two forced consequences, both resolved here:

### 1. The verify-fail ladder loses the Sol rung → it becomes `ultra`

The old ladder was `low→medium→high→xhigh→max` on Terra, then the **Sol model rung**, then Opus. With
Sol as the coder the model rung is a no-op, so a verify-fail would reach Opus — the scarce shared Max
pool ADR-027 exists to protect — one rung sooner.

The `ultra` effort rung takes its place:

```
Sol @ coder_effort → bump … → max → ultra (once) → Opus fallback
```

`ultra` was previously "a RARE, deliberate, logged escalation — never an automatic rung in the
verify-fail ladder" (ADR-030). **That restriction is lifted for the last rung only.** It is now the
final automatic rung before Opus, and only there. It is still never a *default* `coder_effort`, and
its ADR-028 cost accounting is unchanged (an `ultra` task counts double against `max_parallel_codex`,
or runs sequentially).

This keeps escalation inside the Codex pool for one extra rung, which is the whole point of the ladder.

Known accepted debt: `ultra` is still gated on a head-to-head eval against `max` that has not run. We
are promoting it to a ladder rung on structural grounds (it is the only rung left between `max` and
Opus), not on measured superiority. If the eval later shows `ultra` is not worth its 2–3× token
multiplier, this rung is the first thing to cut.

### 2. The AFK end-gate moves from Sol to Opus

ADR-033 A1 made `gpt-5.6-sol` the standing end-of-run adversarial reviewer for unattended builds.
With Sol as the coder, that pass becomes **Sol reviewing its own run** — a direct violation of
**evaluator-independence**, a named dispatch invariant (apex-orchestrate § Dispatch return contract;
apex-governance). Self-review reliably under-reports the reviewer's own failure modes, which is
precisely the class of bug an unattended end-gate exists to catch.

**The end-gate moves to Opus** (`model: opus`, read-only, effort max, advisory-only — same schema,
same whole-run `run_base_sha..HEAD` diff, same P1/P2 triage). This also brings the end-gate into line
with ADR-032's existing cross-family review rule — *Codex builds → Claude reviews* — which the
per-task reviewer already followed. The end-gate was the one place that rule was not applied; it is
now consistent.

Cost: Opus tokens, once per AFK run (not per task). Accepted — this is the safety gate on unattended
work, and it draws the Opus pool exactly where a deliberate escalation is warranted.

### What does not change

- **Plan-check stays on Sol.** Plans are Opus-authored and Sol-checked — different artifact, different
  author. Evaluator-independence holds; no conflict.
- **Per-task cross-family review** is already *Codex builds → Claude reviews*. Unchanged.
- **The Codex reviewer** (used only when Opus is the fallback *builder*) re-pins to Sol, keeping "one
  Codex model" true across every role.
- ADR-027's core shape: one frontier coder, one effort dial, Opus as the manual quota-out fallback.

## Consequences

- **Cost per task rises.** Sol is the top tier of the GPT-5.6 family; Terra was ~half its price. The
  build phase still runs on the separate ChatGPT/Codex pool, so this spends Codex quota faster but does
  **not** touch the scarce Anthropic Max pool — the config-A pool economics (Opus plans + verifies,
  Codex builds) are intact.
- **The escalation ladder is shorter and more expensive at the top.** `max` → `ultra` → Opus.
- **Amendment A3 (the coder bakeoff) is closed by decision, not by measurement.** If a bakeoff is
  later run and Terra proves competitive on verified-completions-per-dollar for routine tasks, the
  clean way back is a cheap-worker *role tier* (session 66 amendment A4), not a revived routing tree.
- **Sol as a coder is proven live** (2026-07-13, codex-cli 0.144.1, `apex-coder` profile,
  `--sandbox workspace-write`): it wrote source + tests, ran pytest to green, and returned a clean
  final message at exit 0.

## Alternatives considered

- **Keep Terra as a cheap rung** (Sol default, `▸terra` pin for low-risk test-rich tasks) — rejected:
  re-introduces the per-task model menu ADR-027 deliberately collapsed, for a saving that only matters
  at a build volume we do not have.
- **Keep the Sol end-gate** — rejected: breaks evaluator-independence on the one review that runs
  without a human present.
- **Ladder `max` → Opus directly** — rejected: hands the scarce pool a rung of work the Codex pool can
  still absorb.
