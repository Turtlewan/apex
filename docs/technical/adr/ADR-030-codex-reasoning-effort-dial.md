# ADR-030 — Codex reasoning-effort dial (per-spec build effort)

**Status:** Accepted
**Date:** 2026-06-27
**Extends:** ADR-027 (Codex-primary / Opus-fallback) · supersedes the per-task model-routing intent of ADR-024/025

> **Fallback coder amended by [ADR-045](./ADR-045-four-role-split.md) (2026-07-19, A1 session-79b):** the Claude fallback coder is **Sonnet 5** (a fresh `model: sonnet` worker), **not Opus**. Opus holds the spec-author, build-orchestrator (owner amendment 2026-07-29), and high-risk-reviewer roles — not the coder role. Every "Opus fallback" / "Opus builds inline" statement below is historical. Sweep recorded in [ADR-046](./ADR-046-doctrine-audit-resolutions.md).

## Context

The Codex CLI exposes a **reasoning-effort dial** — `model_reasoning_effort ∈ {none, low, medium,
high, xhigh}`, default `medium`, settable per invocation via `codex exec -c model_reasoning_effort="…"`.
APEX has never set it, so every Codex build has run at the implicit `medium` default.

This is the lever our own session-60 codex-migration research predicted: *"one frontier model
(`gpt-5.5`) + reasoning-effort dial + cheap `gpt-5.4-mini` replaces the whole ADR-024/025 router."*
The router collapsed in ADR-027 (one proactive coder); the effort dial is the remaining unused half.

Pool economics make it nearly free to exploit. Under config-A (Opus-plan / Codex-build / Opus-verify),
the build phase runs on Codex's **separate pool**, not the scarce Opus subscription pool. Paying `high`
on a hard task spends Codex tokens, which are abundant relative to the Opus pool we protect.

## Decision

1. **Keep `gpt-5.5` as the single build model.** No per-task model routing returns. The cheap
   `gpt-5.4-mini` tier is **deferred** — adding a second model string re-introduces exactly the routing
   ADR-027 collapsed; revisit only if a measured cost problem appears.

2. **Expose reasoning effort as a per-spec lever:** spec frontmatter `coder_effort: {low|medium|high|xhigh}`,
   default `medium` (absent = `medium` = byte-identical to today's behaviour). apex-code passes
   `-c model_reasoning_effort=<value>` on every `codex exec` dispatch for that spec.
   - `low` — trivial mechanical specs (rename, config, boilerplate, docstrings): saves Codex tokens + latency.
   - `medium` — default.
   - `high` — `risk: high`, auth / security / data / concurrency, or algorithmically hard specs.
   - `xhigh` — explicit opt-in for the hardest async / eval-like work only.

3. **Effort escalation on verify-fail.** When a Codex task fails its Verification Recipe and is retried,
   bump effort one notch (`medium → high → xhigh`) **before** the existing recovery → Opus-fallback
   ladder. A capable-but-under-thought retry is cheaper to fix with more thinking on the same pool than
   by switching coder.

Effort is set inline per dispatch (`-c`), never baked into the `apex-coder` profile — the profile stays
a static safety/sandbox config; effort is a per-build choice.

## Consequences

- Planning gains a real cost/quality dial with one frontmatter line; no new model, no routing tree.
- Hard/risky specs get more reasoning at low marginal cost to the protected Opus pool.
- Trivial specs can run cheaper/faster than the `medium` default.
- The dial is orthogonal to the Codex↔Opus fallback (model choice) and to parallel dispatch (ADR-028/029).
- Risk: `high`/`xhigh` consume more Codex tokens → faster Codex quota burn → earlier Opus fallback. The
  per-spec default (not blanket-high) and the live token meter in the observability log bound this.
