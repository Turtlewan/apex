# ADR-038: One session — the planning/coding mode split is removed

**Date:** 2026-07-14
**Status:** Accepted
**Supersedes:** ADR-025 (Claude coding mode), ADR-032 § build-host flip, and the mode-detection half of ADR-027
**Related:** ADR-036 (knowledge layer removed), ADR-037 (three context files)

> **Fallback coder amended by [ADR-045](./ADR-045-four-role-split.md) (2026-07-19, A1 session-79b):** the Claude fallback coder is **Sonnet 5** (a fresh `model: sonnet` worker), **not Opus**. Opus holds the spec-author, build-orchestrator (owner amendment 2026-07-29), and high-risk-reviewer roles — not the coder role. Every "Opus fallback" / "Opus builds inline" statement below is historical. Sweep recorded in [ADR-046](./ADR-046-doctrine-audit-resolutions.md).

## Context

APEX had three operating modes — planning, Claude-coding, DeepSeek-coding — detected from
`ANTHROPIC_BASE_URL` + `APEX_MODE`, with a SessionStart hook branching on them, a PreToolUse
write-guard enforcing "planning does not write code," two PowerShell launchers (`apex-build`,
`apex-opus`) to enter a build session, and a `BACKEND-ROUTING.md` to document it all.

**The mode split existed for exactly one reason, and it was mechanical:**

`ANTHROPIC_BASE_URL` is a **session-level** environment variable. Reaching DeepSeek meant restarting
Claude Code with a different base URL. The coder was therefore *physically unreachable from a
planning session* — so planning and coding **had** to be separate sessions. Every other piece of the
mode machinery (the flag, the launchers, the write-guard, the hook branches, the handoff-as-mode-
boundary) was scaffolding erected around that one hard constraint.

**The constraint is gone.** ADR-027 made **Codex the primary coder**, and Codex is dispatched as a
`codex exec` **subprocess** — its own binary, its own auth, its own quota. It is reachable from *any*
session. No base-URL swap. No relaunch.

Nobody noticed. The mode system outlived its cause by months, and the user finally named it: *"I want
to run everything within a single session, not change to apex backend coding or whatever."*

This is the third time in one day that DeepSeek-era scaffolding was found still standing after
DeepSeek left — after the 36 domain skills (ADR-036, rails for a weak coder) and the keyword registry
(a router for a model that wouldn't self-select skills).

## Decision

**There is one session. It plans, it builds, it verifies.**

Deleted:
- `APEX_MODE` — the env var and every branch on it.
- The `apex-build` / `apex-opus` PowerShell launchers.
- `hooks/backend-pretool-write.ps1` — the write-guard. It existed solely to enforce *"planning does
  not write code — defer it to a coding session."* With no coding session to defer to, its only
  remaining effect was to prompt on every non-`.md` edit in a session that is supposed to build.
- `apex-orchestrate` Step 3.5 (mode detection) and the three-branch SessionStart hook.

Kept, because they are **task** distinctions rather than **session** distinctions:
- `apex-plan` / `apex-code` / `apex-debug` routing. You still plan, then build — you just don't
  restart to do it. The orchestrator routes by task.
- **Codex as the coder**, dispatched per task as a `codex exec` subprocess. Unchanged — and it is
  precisely *why* this ADR is possible.
- **Opus as the fallback coder** — now a fresh `model: opus` worker in the same session.
- **Cross-family review** (Codex builds → Claude reviews; ADR-032/034). Unchanged.
- **Build/AFK vs Edit as *autonomy* modes** (apex-governance) — how much the agent asks, not which
  session you are in. This is the mechanism that actually drained the spec queues in sessions 65/68/69.
- The **handoff doc**, demoted: it now spans a *day* boundary, not a mode boundary.

## Consequences

**Good**
- No relaunching, no env vars, no launchers, no mode banner. Plan and build in one conversation.
- The pool economics are untouched — which was the whole point of Codex-primary. Codex builds burn
  the ChatGPT/Codex quota; the scarce Anthropic Max pool is spent only on planning, review, and the
  Opus fallback. That property came from Codex being a *subprocess*, never from the session split.
- One fewer hook, one fewer PS script, one fewer routing doc, and ~40 lines of mode logic gone from
  the skills.

**Bad / accepted**
- **Nothing now stops code being written in any session.** The write-guard was the brake. This is a
  deliberate trade: the user does not want the deferral the brake enforced. The destructive-command
  guard (`rm -rf` and friends) and the permanent hard blocks (push to main, merge a PR, drop a
  table) are untouched — the removed guard was only ever a "are you sure you want to write a
  non-`.md` file?" speed bump.
- Long build + long plan now share one context window. The mode split gave each a fresh one for
  free. Mitigation is `/compact` at phase boundaries (already apex-orchestrate's documented
  practice) — a deliberate compaction at a logical boundary, rather than an arbitrary auto-compact
  mid-task.
- DeepSeek recovery now needs a manual base-URL swap with no mode scaffolding to catch it. Acceptable:
  DeepSeek has been archived since ADR-027 and this path has not been used.

**Neutral**
- `BACKEND-ROUTING.md` is largely obsolete and should be reduced to the model-routing table or deleted.
- The PS profile's launchers are host-local and uncommittable; they must be removed by hand
  (`. $PROFILE` to reload after).
