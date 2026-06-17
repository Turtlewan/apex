# ADR-022: Deterministic design-lint — reference Impeccable's detector, opt-in and web-UI-scoped
**Date:** 2026-06-17
**Status:** Accepted

## Context
The Impeccable absorption pass (`docs/research/impeccable/`) studied `github.com/pbakaus/impeccable`
@ `1268f10` (Apache-2.0) — a Claude Code design skill that ships a **44-rule deterministic, LLM-free
anti-pattern detector** (Node CLI + Chrome extension + PostToolUse hook) alongside its prose.

Two layers were judged separately:
- **Prose** (slop lists, a first/second-order "reflex" test, a Restrained→Drenched colour-commitment
  axis, the cream/AI-default OKLCH range, a reveal-gated-on-class motion bug). Two fresh bare-agent
  RED probes (non-leading senior-design prompts) reproduced **all four** novel prose candidates cold,
  often with more depth than Impeccable. Per [[absorption-red-probe-before-content]] this is
  model-redundant for a planning skill (read by Opus/Fable) → **absorb none**.
- **The detector** (Layer B) — the only genuinely novel candidate. APEX's design-slop enforcement is
  prose-only (LLM judgment); the detector is deterministic, zero-LLM, zero-runtime-dep (Node ≥24),
  CI/headless-runnable, and already PostToolUse-hook-wired.

This re-opens **ADR-012 P3.3**, which *rejected* ECC's `design-quality-check` PostToolUse hook on the
grounds that "a PostToolUse regex can only pattern-match, not judge; the judgment home is planning."
That reasoning still holds for **taste** — but it conflated two things ADR-012 didn't separate:
1. **Taste/fidelity** (does it look good?) — genuinely planning-side judgment; unchanged, still the
   § Visual review gate's job.
2. **Mechanical tells** (contrast < 4.5:1, gradient text, nested cards, layout-property transitions,
   cream-palette OKLCH) — a *deterministic-checkable* subset that needs **no model compliance** and is
   checkable at coding time, where planning's vision is absent.

The new, decisive frame ADR-012 did not weigh: the coding executor (DeepSeek) is **image-blind**, so a
deterministic DOM/CSS linter is a mechanical proxy for the visual review the coder cannot perform —
the same principle ADR-012 *kept* for the destructive-command block ("works because it needs no model
compliance"). Impeccable is also not the regex toy ADR-012 rejected: it resolves computed styles and
OKLCH, and APEX would **reference** it (not build or maintain it).

## Options considered
| Option | Score | Reasoning |
|--------|-------|-----------|
| Reference-only (verify-recipe note, no hook) | 2 | Fills the gap only manually; little better than nothing for an image-blind coder. |
| **Reference + recommended PostToolUse hook recipe (opt-in, web-UI-scoped, env-gated)** | **3 (chosen)** | Real automatic deterministic gate; external tool stays referenced not embedded; respects stack-neutrality (web-only) and leanness (near-zero token cost, out-of-band). |
| Embed/port the rules into APEX | 1 | Maintenance burden, lock-in, duplicates a maintained tool; violates the leanness charter. |
| Note-and-reject (stay prose-only) | 1 | Leaves the prose-only-enforcement gap open when a clean, free, zero-dep filler exists. |

## Decision
**Reference Impeccable's detector as an opt-in, web-UI-scoped deterministic design-lint, with a
recommended PostToolUse hook recipe — not embedded, not mandated.**
- Lives in `apex-ui-testing/impl.md` § Deterministic design-lint as the maintained extension of the
  existing hand-written forbidden-pattern gate; a one-line planning-side pointer in
  `apex-ui-ux-design` § Visual review gate.
- **Opt-in per project** — wired only when the spec or `design-brief.md` calls for it; never added
  unprompted. **Web-UI only** (the detector is DOM/CSS-bound; native/backend stacks ignore it).
- **Advisory, not a hard gate** — the ruleset is opinionated and may flag a deliberate brief choice;
  findings reconcile against `design-brief.md`.
- **Reject** the rest of Impeccable: the prose four (RED-probe-redundant), the 26-command architecture
  (HIGH always-loaded cost + would make a rival workflow — [[apex-sole-coding-workflow]]), the browser
  extension, and the palette/visual scripts (out of scope).

This **refines, does not contradict, ADR-012 P3.3**: ADR-012 rejected *building a regex hook to judge
design*; ADR-022 *references an external, maintained, style-aware detector to mechanically lint the
deterministic subset* for an image-blind coder. Taste stays planning-side.

## Consequences
- **Positive.** Closes the prose-only-enforcement gap for web UI at near-zero token/maintenance cost;
  gives the image-blind coder a mechanical slop proxy; reversible (a referenced tool, no embedded code).
- **Negative / accepted.** Adds an optional external Node ≥24 dependency for projects that opt in;
  ties to one opinionated ruleset (mitigated by advisory-only + brief reconciliation); web-only.
- **Validation gate.** Unproven until run against a real web-UI coding build (no web-UI project exists
  in the APEX repo itself — it's pure Markdown). Validate on the first such build (e.g. an Artemis web
  surface); this is a `coding-session` gate, not Mac-gated.

## Sources
- `docs/research/impeccable/extraction.md` + `absorption-report.md` (clone @ `1268f10`, Apache-2.0)
- Two bare-agent RED probes (2026-06-17) — prose candidates reproduced cold
- ADR-012 (deterministic-enforcement hooks — the decision this refines)
