# ADR-035 — Host-direct build: when the planning host may build the queue itself

**Status:** Accepted
**Date:** 2026-07-13 (session 69)
**Extends:** ADR-027 (Codex-primary, one coder + one dial) · ADR-028/029 (parallel Codex waves) · ADR-033 (AFK mode-independence)
**Evidence:** RED baseline, 2 bare-Opus probes, session 69 (§ Why there is no skill)

## Context

Twice now (session 65, session 69) the planning host has authored a queue of specs and then **built
them itself** — writing every file with its own `Write`/`Edit` tools, verifying, reviewing, in
sequence — instead of dispatching `codex exec` per task. Both runs succeeded. The user asked whether
this is a supported mode and, if so, to make it invocable.

It works because of two conditions **specific to the APEX repo**, neither of which holds elsewhere:

1. The planning write-guard **exempts APEX and `~/.claude`** (self-hosting), so the host's edits pass
   without a prompt. In any other repo, every non-`.md` edit prompts.
2. APEX **has no build step**. It is pure Markdown; the "verify loop" is a grep and a line count.
   There is no suite for a dispatched coder to iterate against.

The pattern was never designed — it emerged because the user said "apply directly" and it worked.
It has no ADR, and `apex-code` does not describe it (that skill assumes coding mode + Codex dispatch).

## Decision

**Host-direct build is a legitimate but narrow mode. It must win on a structural argument, never on
convenience. When both paths are viable, the tie goes to dispatch.**

### The gate — host-direct requires ALL of:

- **The work is not dispatchable as one `codex exec`.** The decisive case is **cross-repo**: `codex
  exec -C <root>` takes a *single* root, so a task spanning `~/.claude` **and** `~/apex` cannot be one
  dispatch. This is the strongest — and often the only honest — reason to build host-direct.
- **There is no verification recipe for a coder to iterate against.** Dispatch's core value is that the
  coder self-verifies to green *without spending host tokens*. Against a grep and a line count it has
  nothing to iterate on, so you pay dispatch overhead and still verify yourself.
- **The work is judgment-dense, not mechanical.** Formulaic edits ("apply convention X across N files")
  are exactly what the plentiful pool is for — dispatch them even in APEX.
- **It fits under the ceiling** (below).

Fail any one → **dispatch**.

### The ceiling — context, not quota

The binding constraint on host-direct is the **host's context window**, and it bites by *accumulation*:
every Read, Write echo, diff, and grep stays in the linear transcript.

**Practical ceiling: ~2–3 specs, or ~10–20 substantial file writes.** Beyond that, quality decays before
the wall — stale reads (editing against a version replaced 30 turns ago), convention drift across late
files, decisions forgotten within the same queue.

Two properties make this dangerous rather than merely limiting:

- **The degradation is silent.** Host-direct does not stop; it gets quietly worse. A session cannot
  detect its own decay from the inside — **"it feels fine" is not evidence**, and neither is "it worked
  last time" (a small remembered sample, almost certainly of smaller batches).
- **It fails hard, not soft.** Dispatch commits state to worktrees and branches. Host-direct's state is
  *in the context*. If the pool exhausts or the session dies at spec 2 of 5, the work isn't half-saved —
  the reasoning is gone and the next session restarts cold.

**Mid-run checkpoint (required):** at the halfway point of any host-direct run, re-assess against the
ceiling. Over it → commit what's done and fork the remainder to Codex. Do not "push on because it's
nearly finished."

Note: file *count* alone is a poor proxy. Session 69's Terra→Sol swap touched ~24 files but was mostly
one-line mechanical pin swaps with ~4 substantial writes — comfortably inside the ceiling. Count
*substantial* writes.

### The bias this exists to counter

The host systematically **misprices** this choice, and the error runs one way:

> It *feels* dispatch's costs — handoff, supervision, integration — and is *blind* to host-direct's:
> pool depletion and context decay are never experienced. The preference is computed over an incomplete
> cost function, tilted toward the path that is pleasant for the agent.

Host-direct also spends the **scarce** pool (Opus/Max) to save the **plentiful** one (Codex) — the exact
inversion the two-pool config-A economics exist to prevent — and collapses author and reviewer into one
context, removing the fresh-eyes pass. Frictionlessness is weak evidence of correctness and strong
evidence of absent controls.

Therefore: **any host-direct argument that reduces to "it's smoother" is the bias, and is rejected.**

## Why there is no skill (the load-bearing part of this ADR)

**A `apex-hostbuild` skill was proposed and rejected on RED-baseline evidence. Do not re-propose it
without new evidence.**

Two bare-Opus probes (no skill, no repo access, no ADRs) reproduced the entire decision rule cold:

- Correctly chose host-direct for the cross-repo/no-suite case and dispatch for the 19-stage pytest case,
  deriving *both* structural reasons unprompted.
- Independently identified context accumulation as the binding constraint and put a number on it
  (~10–20 substantial writes / 2–3 specs), including the silent-degradation property.
- Independently produced the operating rule — *"when both are viable, the tie goes to dispatch"* — and
  the self-serving-bias diagnosis quoted above.
- Under a **competing prompt** (tired user, 60 files, auth changes, *"just apply it all directly, you've
  done this before and it worked fine"*), the bare agent **still refused and dispatched**, and named the
  survivorship error in the user's own reasoning.

The judgment is **model-native and survives adversarial pressure**. A skill teaching it would document
what the model already does, cost context on every load, and rot. What is *not* native is a small set of
APEX-specific **facts** — those live in `apex-plan/references/model-routing.md` § Host-direct build,
which is where a reader will already be when the question arises.

This is the Iron Law working as intended: RED did not fail, so nothing was written.

## Consequences

- Host-direct stays legal for APEX/`~/.claude` markdown work — which is most of what this repo is.
- **Nothing new is invocable.** The existing trigger ("build this list") suffices; the judgment fires on
  its own. This is a deliberate non-feature.
- Non-APEX repos: AFK arming (ADR-033) removes the per-edit prompt, but **does not** fix the pool
  economics or the ceiling. Arming makes host-direct *possible* elsewhere, never *advisable*.
- **Open, and pointing the other way:** the B1 scope hole (`docs/findings/artemis-13-7-issues.md`) means a
  dispatched Codex can currently write outside its authorized file list with nothing stopping it. Until
  the post-dispatch diff check lands, dispatch carries a real risk host-direct does not — a live argument
  for host-direct in this repo that this ADR expects to expire.
