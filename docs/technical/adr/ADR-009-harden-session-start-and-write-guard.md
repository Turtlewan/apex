# ADR-009: Harden session-start orchestration and the planning write-guard

**Date:** 2026-06-02
**Status:** Accepted

## Context

ADR-002 bound two modes to two backends and stated enforcement was mechanical: a SessionStart
hook surfaces the backend, and a PreToolUse hook hard-blocks non-`.md` `Write`/`Edit` in
planning mode. Two gaps surfaced in practice:

1. **The orchestrator was being skipped.** "Run `apex-orchestrate` first" lived only as prose
   in the global `CLAUDE.md`. The SessionStart hook injected mode/policy context but never
   instructed the model to invoke `apex-orchestrate` — and it pre-empted the orchestrator's
   first-session duties (handoff summary, spec list), so the model felt already-oriented and
   went straight into the task. This showed up most in non-APEX projects, where the concrete
   task dominated attention.

2. **The write-guard was a no-op.** `backend-pretool-write.ps1` had been reduced to `exit 0`,
   so planning mode could edit any source file despite the stated hard-block. Separately, APEX
   is self-hosting: planning mode legitimately edits APEX's own non-`.md` files (hooks, scripts)
   under `~/.claude/`, which a blanket hard-block forbids.

## Decision

Harden both hooks rather than rely on prose.

- **SessionStart** (`backend-session-start.ps1`) leads its injected context with an imperative
  to invoke `apex-orchestrate` as the first action (both backends, every project), stops
  pre-empting the orchestrator's duties, and directs the model to open its first user-visible
  reply with a banner — `[APEX] Using APEX system -- {MODE} mode` — as visible proof the
  orchestrator ran.
- **PreToolUse** (`backend-pretool-write.ps1`) is restored as an **ask-gate, not a hard deny**:
  in planning mode a non-`.md` `Write`/`Edit` returns `permissionDecision: ask` (default
  guidance = do it in a DeepSeek coding session), while the APEX project itself and any file
  under `~/.claude/` (APEX system files) are exempt and pass silently.

The banner is a soft instruction — a hook can *ask* for a `Skill` call, not *force* one — so it
is deliberately also the observable tell that routing happened: no banner means the orchestrator
was skipped.

## Consequences

**Good:**
- Orchestrator routing is far more likely to fire and is now visibly verifiable each session.
- The write-guard guards again, while APEX-self and deliberate one-off code edits stay possible
  (ask-gate) instead of impossible (hard deny) or unguarded (no-op stub).
- The APEX self-hosting exemption is explicit rather than incidental.

**Bad:**
- Banner and routing remain soft instructions; a determined miss is still possible. The next
  lever — a `UserPromptSubmit` re-assertion until the orchestrator has run — is deferred until
  observed necessary.
- The banner is ASCII-only (`[APEX]`, `--`) because the hook→JSON→context pipeline mangles
  non-ASCII characters.

**Neutral:**
- Refines ADR-002's enforcement detail (hard-block → ask-gate + exemption). ADR-002's core
  decision (dual-backend, two-mode, file-based handoff) stands unchanged.
