# ADR-020 — Capability-routed UI escalation (Claude steps in on the visual slice)

**Status:** **Superseded / moot** by [ADR-027](./ADR-027-codex-primary-opus-fallback-deepseek-archived.md)
(2026-06-23). This ADR's entire premise — "DeepSeek V4 is image-blind; Claude is multimodal" — no
longer holds: under ADR-027 the coder is **Codex (`gpt-5.5`, native vision)** or **Opus (multimodal)**
on fallback. A sighted coder fixes a visual divergence as a **normal coding task**; the bounded
planning-mode UI-code-edit carve-out below is no longer needed and is retired in apex-governance. The
live-preview design loop (design lane → build → visual gate) survives in apex-ui-ux-design — only the
*image-blindness* escalation rationale is gone. Original text retained below for history.
_Originally: Accepted · 2026-06-16 (session 45)_
**Amended:** [ADR-002](./ADR-002-dual-backend-two-mode-workflow.md) (dual-backend two-mode workflow)

## Context

APEX's core split routes *planning* to Claude and *coding* to DeepSeek (ADR-002). The split is
enforced by the planning-mode write-guard (`backend-pretool-write.ps1`), which on a non-`.md` code
file in a non-APEX project returns `permissionDecision: 'ask'` — an **approval prompt**, not a hard
block. (The SessionStart banner wrongly described it as "hard-block"; corrected here.)

That split is right for almost everything, but it collides with one capability fact: **DeepSeek V4
is image-blind; Claude is multimodal.** UI work is the one domain where seeing the rendered pixels is
sometimes load-bearing — spacing rhythm, optical alignment, pixel-level divergence from the locked
design. Feeding prose corrections to a blind coder can fail to converge precisely there. The user
asked for "both modes able to do UI changes, because Claude may need to step in."

Two shapes were weighed: **co-equal UI editor** (Claude may write any UI code anytime) and **bounded
escalation** (Claude is a scalpel for the visual slice only). Co-equal erodes the split and the cost
discipline (Claude output ≈29× DeepSeek's per the model-comparison work). Bounded escalation gives
the user the capability exactly where eyes are required and nowhere else.

## Decision

Adopt **bounded, capability-routed UI escalation**. Default is unchanged: DeepSeek is the primary UI
coder, building blind against `design-brief.md`. Claude (planning) may make a **direct UI code edit**
only when all hold:

1. There is a **visual divergence** from the locked design (caught by the live preview or the
   post-build visual gate).
2. The fix is **inherently visual** (pixel/spacing/alignment/optical judgment that prose can't pin
   down) **OR** prose feedback to the blind coder has failed to converge (≥2 rounds).
3. Claude can actually **see the render** — a screenshot/preview exists (web: Playwright MCP
   screenshot or a pasted image; SwiftUI: a Mac/Xcode preview → **Mac-gated**).

Bounds (all simultaneous):
- **View-layer only.** Confined to the presentation layer (markup / styles / view files). Never
  business logic, data, auth, or any critical-files-list path.
- **Smallest surgical change**, then hand back to DeepSeek for any follow-on volume — Claude is a
  scalpel, not the main loop.
- **Approval-gated + logged.** Each edit goes through the write-guard `ask` (in a non-APEX project),
  user approves, and the touched files are recorded in the handoff / status In-Flight so the next
  coding session knows Claude edited them.

**Capability, not authority** (consistent with ADR-019): this carve-out widens *which model may make
a UI edit*, and changes **no** gate — critical-file confirmation, the autonomy level, and every hard
block are untouched.

## Consequences

- The user gets a live, eyes-on UI loop (design lane → build → **live preview** → visual gate →
  Claude escalation) — homed in `apex-ui-ux-design`; the authority rule homed in `apex-governance`.
- Cost stays bounded: escalation is a triggered scalpel, not a second coding lane.
- The escalation needs **no new write-guard logic** — the existing `ask` already permits the approved
  edit. Two corrections were made alongside it: the SessionStart banner wording (`hard-block` →
  `approval prompt`), and a **pre-existing bug the escalation test exposed** — the guard's APEX
  exemption keyed off the *working directory*, so a session launched from `~/apex` silently bypassed
  the gate for *every* file anywhere. Fixed to key off the **file path** (a file under `~/apex` or
  `~/.claude`), matching ADR-009's stated intent; validated across four payload cases.
- **Stack reality:** the live-preview + escalation loop is fully usable for **web on Windows**
  (Cursor Simple Browser + Playwright screenshot); for **SwiftUI it is Mac-gated** (no Windows
  render path) — on Windows the only SwiftUI visual path remains the Bitrig design lane.
