# ADR-002: Dual-backend, two-mode workflow (planning on Claude, coding on DeepSeek)

**Date:** 2026-05-31 _(back-filled — the decision predates the ADR practice; documented as part of the ADR-001 dogfood pass)_
**Status:** Accepted

## Context

This machine runs Claude Code against two interchangeable backends, switched via the
`ANTHROPIC_BASE_URL` environment variable:

- **Claude (Anthropic)** — strong at judgment, design, and decision-making; the expensive token.
- **DeepSeek V4 Flash** — cheap and fast, but executes literally and does not fill gaps with
  judgment (degrades on long tool chains and design calls).

Using one backend for everything wastes the strength of the other: Claude burns expensive
tokens on mechanical edits, while DeepSeek makes design/judgment calls it is not reliable at.
A solo developer also needs a guard rail against accidentally doing the wrong *kind* of work
on the wrong backend (e.g. letting Flash improvise an architectural decision).

## Decision

Bind two **modes** to the two backends, detected automatically from `ANTHROPIC_BASE_URL` at
session start:

- **Planning mode (Claude)** — judgment work: specs, ADRs, design, research, review. May write
  **only** `.md`/`.txt` files.
- **Coding mode (DeepSeek)** — execution work: implement specs, write any file.

Enforcement is mechanical, not advisory:
- A **SessionStart hook** surfaces the active backend and mode.
- A **PreToolUse hook** hard-blocks `Write`/`Edit` on non-`.md` files in planning mode.

The two modes communicate only through **files**: planning emits a spec (`docs/changes/`)
forward; coding emits a handoff doc (`docs/handoff/`) back. No shared live process state.

## Consequences

**Good:**
- Each backend is used for what it is good at — expensive judgment is reserved for Claude;
  cheap literal execution goes to DeepSeek.
- The hooks make the boundary impossible to cross by accident, not just by convention.
- File-based handoff makes the planning↔coding boundary durable across session resets.

**Bad:**
- Round-trip latency: a change flows plan → spec → code → handoff → plan.
- Specs must be *complete and unambiguous* before they freeze, because Flash cannot fill gaps —
  this pushes heavy discipline onto planning (see ADR-003).
- Two backends mean two contexts to keep coherent.

**Neutral:**
- Skills are pure `.md`, so planning mode can author them directly without a coding round-trip —
  the backend gate permits this (see ADR-004).
