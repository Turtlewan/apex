# ADR-025: Claude coding mode (third operating mode)

**Date:** 2026-06-21
**Status:** Superseded — Claude coding mode (indeed the whole mode split) was abolished by [ADR-038](./ADR-038-single-session.md) (one session, no modes, 2026-07-14), which names this ADR in its Supersedes line. Earlier: **soft-pool guard DISCHARGED for coding by [ADR-026](./ADR-026-codex-third-model-family.md) (2026-06-22):** Codex (separate OpenAI pool) replaced Opus/Sonnet as the coding ceiling. Decision text below is a dated record.
**Extends:** ADR-009 (session-start + write-guard), ADR-024 (complexity-routed multi-model coding).
**Aligns with:** ADR-016 (`APEX_MODE`/URL-prefix mode detection earmarked for the backend rewire).

## Context

ADR-024 routes coding build-items across four models including **Sonnet 4.6 / Opus 4.8** as coders. But APEX detects its operating mode **purely from `ANTHROPIC_BASE_URL`**: a `deepseek` URL → coding mode (DeepSeek coder, write-guard open); an Anthropic/unset URL → **planning** mode (write-guard gates non-`.md` writes). The base URL alone **cannot distinguish "Anthropic-for-planning" from "Anthropic-for-coding"** — same URL. So today the Claude batch of an ADR-024 build cannot run as a clean build: swapping to the Anthropic backend forces planning mode, where the write-guard prompts on every code write. Claude-as-coder is therefore a clunky interactive handoff, not a first-class coding flow.

## Decision

Add a **third operating mode — Claude coding mode** — triggered by an explicit second signal on the Anthropic backend:

| Mode | Trigger | Coder | Write-guard | Routes to |
|------|---------|-------|-------------|-----------|
| Planning | Anthropic/unset URL, no flag | Opus (plans) | gates non-`.md` | apex-plan |
| DeepSeek coding | URL contains `deepseek` | Flash / Pro | open | apex-code |
| **Claude coding (new)** | Anthropic/unset URL **+ `APEX_MODE=coding`** | **Sonnet (default) / Opus** | **open (relaxed)** | apex-code |

- **Detection signal = `APEX_MODE=coding`** (env var). Backward-compatible — absent → current behaviour exactly. This is the signal ADR-016 already earmarked for the eventual backend-routing rewire, so it is a down-payment, not a one-off.
- **Coder model** = the session's Claude model (`/model` / `ANTHROPIC_MODEL`); within Claude coding mode Sonnet↔Opus switching is free (same backend). The ADR-024 router assigns it per task.
- **Write-guard relaxed** under `APEX_MODE=coding` — code writes to the target project proceed without the planning-mode prompt (the `~/.claude` + APEX self-hosting exemptions are unchanged).
- **Pool guard = soft** (the one real risk — WS-D): interactive Claude Code draws the **same Max subscription pool as planning**, and the Opus weekly cap is the scarcest resource. There is **no programmatic budget cap for interactive sessions**, so the guard is mode discipline, not enforcement: on entry, **warn** that this draws the planning pool; **default the coder to Sonnet**; let the router pick Opus only when complexity warrants (ADR-024 F2); **track** usage via `/status`. No hard block.
- **Escalation tie-in (ADR-024 F3):** a DeepSeek `pro` task that fails verification escalates to Opus by **crossing into Claude coding mode** (approval-gated), not by an in-DeepSeek-session call.

## Consequences

- **Positive:** makes Claude a **first-class coder** — ADR-024's Claude batch runs as a real build, not a manual planning-side handoff; visual/image work (DeepSeek-incapable) gets a proper coding flow; lays the `APEX_MODE` groundwork ADR-016 wants.
- **Negative / accepted:** interactive Claude coding **draws the planning pool** (soft-guarded, not capped) — heavy Claude builds can still erode planning capacity; the durable fix (isolated, budget-capped) is the **headless `claude -p`** path, deferred. Adds a third mode to the core routing surface (more hook logic, more governance).
- **Risks:** the write-guard relaxation must be **scoped to `APEX_MODE=coding` only** — a bug that relaxes it in planning mode removes the planning-mode safety net (hook change is safety-critical; test the three-mode truth table before shipping). Mode-detection precedence must be unambiguous (`deepseek` URL wins → DeepSeek coding; else `APEX_MODE=coding` → Claude coding; else planning).

## Sources
- ADR-009, ADR-016, ADR-024; `docs/research/model-routing/` (WS-B mechanism, WS-D billing/rate-limit).
