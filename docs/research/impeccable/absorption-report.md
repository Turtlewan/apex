# Impeccable Absorption Pass — Report & Recommendation

**Date:** 2026-06-17
**Source:** `github.com/pbakaus/impeccable` @ `1268f10` · Apache-2.0 · `impeccable@3.0.2` (SKILL v3.7.1)
**Protocol:** absorption-pass-protocol + absorption-red-probe-before-content (report first, no edits until approved)
**Extraction detail:** `./extraction.md`

## Summary

Impeccable = a Claude Code design skill (prose + 26 commands) **plus** a 44-rule deterministic,
LLM-free anti-pattern detector (Node CLI + Chrome extension + PostToolUse hook). The prose layer is
already-have or model-redundant; the **detector is the only genuinely novel candidate** and maps to
APEX's known prose-only-enforcement gap. Recommendation: adopt the detector as an **opt-in, web-UI-scoped,
externally-referenced deterministic design-lint** (not embedded code, not a mandated step), gated on a
live coding env — written up as an ADR. Reject everything else.

## RED-probe result — prose layer (all four FAIL → do not absorb)

`apex-ui-ux-design` is a planning skill (read by Opus/Fable), so the fair test is whether a capable
model produces the concept cold. Two fresh bare agents (no APEX skills), non-leading senior-design
prompts:

| Prose candidate | Produced cold? | Evidence |
|---|---|---|
| Two-altitude category-reflex test (1st/2nd order) | **YES** | "you didn't escape the mean; you moved to the new mean… predictability is picking an aesthetic that exists as a recognizable named bundle at all" |
| Color-commitment axis (Restrained→Drenched) | **YES** | Reproduced the 4-band spectrum incl. the "juniors stuck in band 1" insight that is the point of it |
| Cream/AI-default OKLCH ranges | **YES** | Emitted specific OKLCH ranges + the warm-hue escape (H 40–90) mirroring Impeccable's cream tell (hue 40–100) |
| Reveal-gated-on-class motion bug | **YES** | Gave the exact fix ("revealed state default, animation additive, gate hidden styles behind a JS-set class") + headless/prerender blank mechanism, more thorough than Impeccable |

Conclusion: copying any of these into the skill spends always-loaded tokens to teach Opus what it
already knows. **REJECT all four** (behaviour rules earn their place; content usually doesn't — and
this content didn't).

## The one real candidate — the deterministic detector (Layer B, novel)

- **44 rules**, 100% deterministic (regex/DOM/computed-style), **zero LLM calls**, **zero runtime npm deps**, Node ≥24, Apache-2.0.
- Three engines: jsdom static-HTML · Chrome extension (live DOM) · regex/text. CI-runnable, headless-safe.
- Already PostToolUse-hook-wired (`Edit|Write|MultiEdit → node hook.mjs → system reminder`).
- Invocation: `npx impeccable detect <file|dir|url>`.

**Why it fits APEX specifically:** the coding executor (DeepSeek) is **image-blind**. A deterministic
DOM/CSS linter that flags slop tells (gradient text, cream palette, nested cards, low contrast,
em-dash overuse, layout-property transitions) *after* each UI edit is a mechanical proxy for the
visual review the coder cannot perform. This is the strongest argument for it and is unique to APEX's
two-backend setup. DESIGN.md-awareness (rules check against a declared palette) ≈ APEX's design-brief,
so deliberate choices (e.g. an intentional cream brand) don't false-positive when a brief exists.

**Costs / risks:** external Node tool (young, single maintainer, v3.x); web-only (useless for native/
backend stacks — APEX is stack-neutral); opinionated ruleset; lock-in if embedded. All mitigated by
keeping it **referenced + opt-in + web-UI-scoped**, never embedded or mandated.

**Precedent:** ECC pass (ADR-012) rejected gateguard hook-bloat but kept ONE deterministic hard-block
(destructive-command-guard); the "safety-guard Freeze" parked item shows appetite for deterministic
hooks once the Mac coding env is live. Same shape here.

### Three options for the mechanism (the decision)

| # | Option | Token cost | Lock-in | Fills gap? |
|---|--------|-----------|---------|-----------|
| A | **Reference-only** — one opt-in line in `apex-ui-ux-design`/`apex-ui-testing` verify recipe: "web-UI projects may run `npx impeccable detect` as a deterministic design-lint." No hook. | ~near-zero | none | partially (manual) |
| B | **Reference + recommended PostToolUse hook recipe** for web-UI coding projects (opt-in, gated on live coding env). Real automatic deterministic gate. | ~zero (out-of-band) | low (external tool) | **yes** |
| C | **Note-and-reject** — stay pure-prose; record that a deterministic option exists. | zero | none | no |

Recommended: **B**, scoped + opt-in + Mac/coding-env-gated, captured as an ADR (decision = APEX
*references* an external deterministic design-linter for web UI rather than embedding/building one or
staying prose-only).

## Reject (clear)

- **26-command sub-command architecture** — HIGH always-loaded cost; would make apex-ui-ux-design a
  replica of Impeccable and a rival workflow (violates [[apex-sole-coding-workflow]]).
- **Browser extension, palette seed script, visual/screenshot engine** — out of scope for skill adoption.
- **Prose slop list / PRODUCT.md+DESIGN.md scaffold / anti-references / register** — already-have
  (≈ APEX slop section, design-brief/ADR-017, forbidden patterns, industry table).

## Bottom line

One thing earns adoption: the deterministic detector, as an opt-in external reference (Option B
recommended). Everything else is dedup or model-redundant. This closes the Impeccable thread.

_Re-research after: 2026-09-17 (design tooling ~90d) — only if revisiting the detector dependency._
