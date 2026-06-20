# Impeccable — Re-examination Pass (UI-Workflow Absorption)

**Date:** 2026-06-20
**Type:** Re-examination of a PRIOR absorption pass — report only, no skill edits.
**Verdict:** CONFIRM-CLOSED. Nothing reopens. One outstanding item: the recorded validation gate.

---

## 1. What impeccable IS

`github.com/pbakaus/impeccable` @ `1268f10` (Apache-2.0, `impeccable@3.0.2`, SKILL v3.7.1).
A Claude Code (multi-harness) **design skill** in two layers:

- **Layer A — prose:** a SKILL.md design workflow + **26 named sub-commands** (craft/shape/audit/
  critique/polish/animate/colorize/typeset/…), an "absolute bans" slop list, a two-altitude
  category-reflex ("AI slop") test, a Restrained→Drenched colour-commitment axis, the cream/AI-default
  OKLCH range, and a reveal-gated-on-class motion bug note. PRODUCT.md + DESIGN.md per-project scaffold.
- **Layer B — mechanical:** a **44-rule deterministic, LLM-free anti-pattern detector** (Node ≥24,
  zero runtime deps). Three engines (jsdom static-HTML · Chrome extension live-DOM · regex/text) +
  optional visual/screenshot. CI/headless-runnable. Ships a PostToolUse hook
  (`Edit|Write|MultiEdit → node hook.mjs → system reminder`). Invoke: `npx impeccable detect <file|dir|url>`.

## 2. What was ADOPTED (ADR-022, 2026-06-17)

The detector only, as an **opt-in, web-UI-scoped, externally-referenced** deterministic design-lint —
**referenced, never embedded or mandated**:

- **`apex-ui-testing/impl.md` § Deterministic design-lint** (lines 138–152) — the maintained extension
  of the existing hand-written forbidden-pattern gate. `npx impeccable@latest detect <…>` on demand;
  `npx impeccable@latest hooks on` for the PostToolUse hook. **Advisory, not a hard gate** — findings
  reconcile against `design-brief.md`. Opt-in per project; web-UI only; Node ≥24. Verification checklist
  carries a conditional line (164). Frontmatter cites ADR-022 + the Impeccable source.
- **`apex-ui-ux-design/SKILL.md`** — one-line planning pointers from § Visual review gate (lines 305–307)
  and the consistency-gates note (line 431, "optional design-lint → apex-ui-testing, ADR-022"). Taste
  stays planning-side; the lint is the deterministic mechanical subset for the image-blind coder.

Rationale unique to APEX: the DeepSeek coding executor is **image-blind**, so a deterministic DOM/CSS
linter is a mechanical proxy for the visual review the coder cannot perform — same principle ADR-012
*kept* for the destructive-command block. ADR-022 **refines** (does not contradict) ADR-012 P3.3:
ADR-012 rejected *building a regex hook to judge taste*; ADR-022 *references an external, maintained,
style-aware detector to lint the deterministic subset*.

## 3. What was REJECTED (and why it stays rejected)

- **The "prose four"** — two-altitude reflex test, colour-commitment axis, cream OKLCH range,
  reveal-gated-on-class motion bug. Two fresh bare-agent RED probes (non-leading senior-design prompts)
  reproduced **all four cold**, often with more depth than Impeccable. Per
  [[absorption-red-probe-before-content]], copying them into a planning skill (read by Opus/Fable)
  spends always-loaded tokens to teach the model what it already knows. **REJECT — content didn't earn
  its place.** This is exactly the settled call this pass must not re-absorb.
- **26-command sub-command architecture** — HIGH always-loaded token cost; would make
  apex-ui-ux-design a replica of Impeccable and a rival workflow (violates [[apex-sole-coding-workflow]]).
- **Browser extension, palette seed script, visual/screenshot engine** — out of scope for skill adoption.
- **Prose slop list / PRODUCT.md+DESIGN.md scaffold / anti-references / register** — already-have
  (≈ APEX slop section, design-brief / ADR-017, forbidden patterns, industry table).

## 4. Re-examination — does the broader UI-workflow refresh reopen anything?

No. Checked each rejected item against the current state of the landing skills:

- **Prose four:** the RED-probe rejection is a property of the *model*, not of APEX's skill coverage.
  A UI-workflow refresh changes APEX's skills, not Opus/Fable's cold capability — so the probe verdict
  does not move. No reopen.
- **26 commands:** still a rival-workflow + token-cost reject; the sole-coding-workflow memory makes
  this a standing hard no. No reopen.
- **Scaffold / anti-references / register:** still subsumed by `design-brief.md` (ADR-017) and the
  forbidden-pattern gate. No new gap the refresh exposes.
- **Detector adoption itself:** already present and correctly placed in both impl.md and SKILL.md;
  framing (advisory, opt-in, web-only, reconcile-against-brief) is intact and internally consistent.
  Nothing to add. No previously-missed Layer-B item found (extension / scripts / visual engine all
  remain legitimately out of scope for a markdown skill system).

No concrete, previously-missed item surfaced.

## 5. Outstanding item — the validation gate (status note, NOT a new absorb)

ADR-022 records: **"Unproven until run against a real web-UI coding build"** — no web-UI project exists
in the APEX repo itself (pure Markdown). This is a `coding-session` gate (not Mac-gated). The detector
adoption remains **unvalidated** as of 2026-06-20: validate `npx impeccable detect` + the optional
PostToolUse hook on the first real web-UI build (e.g. an Artemis web surface), confirming findings
reconcile sanely against `design-brief.md` and the advisory framing holds in practice.

This is a status note carried forward, not a new thing to absorb.

## Bottom line

Impeccable is **CLOSED**. The detector adoption (ADR-022) is settled and correctly landed; everything
else stays rejected for the same reasons. The only open thread is the validation gate — exercise the
referenced detector on the first real web-UI coding build. No skill edits warranted.

_Re-research after 2026-09-17 only if revisiting the detector dependency (design tooling ~90d)._
