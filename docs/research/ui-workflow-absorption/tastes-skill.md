# Absorption pass — Taste-Skill (anti-slop frontend skill for AI agents)

_Pass date: 2026-06-20 · Protocol: dedup-aware, report-only (no skill edits)._

## Step 1 — External skill identified

**Taste-Skill — "The Anti-Slop Frontend Framework for AI Agents"**
- Repo: github.com/Leonxlnx/taste-skill (`design-taste-frontend`); site: tasteskill.dev/docs
- 46.8k★ (one mirror); created 2026-02-19. Portable `SKILL.md` files for Claude Code / Cursor / Codex / Gemini CLI / v0 / Lovable etc. Framework-agnostic (React/Next/Vue/Svelte/HTML).
- Purpose: inject opinionated design rules to stop LLMs emitting generic UI (centred hero + 3-col feature grid + purple gradient + emoji icons). Has aesthetic variants (editorial, mechanical/Swiss), imagegen reference-board skills, and three dials: `DESIGN_VARIANCE`, `MOTION_INTENSITY`, `VISUAL_DENSITY` (1–10).

**This is the SAME skill APEX already absorbed from.** It is cited in `apex-ui-ux-design` SKILL.md frontmatter (`design-taste-frontend (taste-skill) — github.com/Leonxlnx/taste-skill`) and is the source of the COMPLETED spec `docs/changes/done/taste-rules-distill.md` (2026-06-05, distilled jointly with Emil Kowalski's `emil-design-eng`). So this is a re-pass on an already-absorbed source.

## Step 2 — APEX's existing taste coverage (dedup baseline)

`apex-ui-ux-design/SKILL.md` already encodes:
- **§ Generic-AI ("slop") detection** — ~22 bullets incl. purple→blue gradient, decorative glassmorphism, generic centred hero, uniform `grid-cols-3/4` card walls, filler CTA copy, Inter/`font-sans` everywhere, nested cards + uniform max-rounding, oversized equal padding, shadow-heavy stacks, coloured left-border stripe, **all-caps eyebrow/kicker**, reflexive bento, amateur SVG mascots, emoji-as-icons, default stroke-icon set verbatim, fake dashboard mockups + floating pills, glossy 3D-blob AI hero, uniform symmetric sections, **template placeholder content (John Doe / round fake numbers / Acme / filler verbs)**, **em-dashes in UI copy**. FLAGs (overridable by explicit brief), with a 7-day refresh cadence (`docs/research/ai-slop-watch/`).
- **§ Microcopy** — positive form of the copy rules (buttons name the action, empty/error/believable-content).
- **§ Scored visual audit** — 10-dimension 0–10 rubric (colour consistency, type hierarchy, spacing rhythm, component consistency, responsive, dark mode, motion, a11y, density, polish) + score bands (avg <7 or any dim <4 = FLAG).
- **§ Questions before designing** — incl. **official-design-system honesty rule** (GOV.UK/Carbon/Fluent/Primer/Polaris → install official package).
- **§ Industry-specific design reasoning** — category→style/avoid table (the "infer the right direction" job).
- **§ Aesthetic direction** — brief-first (tokens + art-direction + forbidden patterns), research vs keywords paths.
- **§ Escalation → FLAG** — **redesign silently changes URL/slug/nav-label/form-`name` → preserve or call out.**
- **Pre-delivery checklist** — incl. `min-h-[100dvh]` not `h-screen`; emoji icons; focus states; loading/empty/error states.
- `impl.md` (coder-side NEVER/ALWAYS) — h-screen ban, template-placeholder ban, redesign-identifier ban, **concentric radius**, emoji-icon ban + verification checklist.
- Sibling skills: `apex-animation` (scroll-driven not hand-rolled listeners, ease-in ban, frequency/keyboard "should it animate at all" gate — also from the same taste/Emil distill), `apex-accessibility` (WCAG/contrast/dark-mode contrast), `apex-design-system` (tokens), `apex-design-motion-principles`.

## Step 3 — Rule-by-rule comparison

| Taste-Skill rule | Verdict | Note |
|---|---|---|
| Brief inference §0 (read page-kind/vibe/audience/refs; declare a one-line design read; don't default to AI-purple + 3 centred cards) | ALREADY-HAVE | = § Aesthetic direction (brief-first) + § Industry-specific reasoning + slop list (centred hero, grid-cols-3, purple). |
| Design-system mapping §2 (Material/Fluent/Carbon/Polaris/Primer/GOV.UK/shadcn/Radix → use official package; label aesthetic briefs as web approximations) | ALREADY-HAVE | = § Questions official-DS honesty rule (added in the prior distill). |
| Animation §5 (canonical sticky-stack / horizontal-pan / scroll-reveal; no hand-rolled scroll listeners / rAF touching React state) | ALREADY-HAVE | = apex-animation (scroll-driven CSS / IntersectionObserver / GSAP ScrollTrigger; no `window.addEventListener('scroll')`). |
| Dark mode §8 (dual-mode default, WCAG AA both themes, hierarchy parity) | ALREADY-HAVE | rubric dim 6 + apex-accessibility. |
| Dark mode: **off-black / off-white, never pure `#000`/`#fff`** | REJECT (model-redundant) | Frontier models know this cold; a one-line craft truism. Low decision-shaping value; rubric "polish" already covers. |
| Three Locks §4: **one accent colour per page** | ALREADY-HAVE | rubric dim 1 (colour consistency / palette tokens, not random hex) + design-brief tokens. |
| Three Locks: **one corner-radius system per page** | ALREADY-HAVE | slop "uniform max-rounding follows the scale not maximised" + impl concentric-radius. |
| Three Locks: **page theme lock (no mid-page light/dark flips)** | REJECT (model-redundant) | Obvious; near-zero real occurrence; not worth a line. |
| Hero discipline: headline ≤2 lines, subtext ≤20 words/4 lines, CTA above fold, nav ≤80px single line, hero fits viewport | REJECT (mostly model-redundant + over-specific) | The *intent* (no oversized vague hero) is the slop "generic centred hero" bullet + microcopy. The exact numerics (20 words, 80px, 2 lines) are brittle, marketing-page-specific, and prescriptive in a way APEX deliberately avoids (APEX flags *unconsidered* heroes, doesn't hard-cap dimensions). Not absorbing the numbers. |
| Anti-slop: em/en-dashes banned everywhere | ALREADY-HAVE | em-dash bullet (prior distill). |
| Anti-slop: section-numbering eyebrows (00/INDEX, 001·Capabilities) | ALREADY-HAVE | = "all-caps eyebrow/kicker" slop bullet (the numbered eyebrow is the same tell). |
| Anti-slop: hero version labels / version footers (V0.6, BETA, Build 0048, "last sync 4s ago") | CONSIDER → REJECT | Narrow, marketing-landing-specific decoration tells. Real but low-frequency; APEX's slop list already targets "describing its own features" + fake-dashboard decoration. Adding 3–4 micro-bans dilutes the list for marginal coverage. |
| Anti-slop: photo-credit captions / decorative text strips (`BRAND. MOTION. SPATIAL.`) | REJECT (dup-ish, niche) | Variant of decorative-label slop already flagged (eyebrow/kicker, self-describing prose). |
| Anti-slop: **locale/time/weather strips** (`Lisbon 14:23 · 18°C`) | CONSIDER → REJECT | A genuinely specific 2026 award-site tell not in APEX's list — but extremely niche (high-craft marketing only) and a frontier model rarely emits it unprompted. Below the bar; note as a candidate for the next `ai-slop-watch` refresh if it recurs in the wild, not a standalone absorb. |
| Anti-slop: scroll cues ("Scroll", down-arrow) | REJECT (model-redundant/niche) | Minor; not decision-shaping. |
| Anti-slop: **decorative status dots** (green dots with no semantic state) | CONSIDER → REJECT | Plausibly novel vs APEX's list, but a small tell; redundant with the general "decoration not signal" theme (shadows/stripes/dots all instances of same principle already stated). Not worth a dedicated line. |
| Anti-slop: `border-t + border-b on every row` on long lists/spec tables → use cards/tabs/scroll-snap | PARTIAL-NEW → REJECT | The left-border-stripe + over-uniform-grid bullets already cover "row-decoration as a tell." The specific "bordered spec-table rows" instance is narrow; the prescribed alternatives (marquee/carousel) are taste-variant, not universally better. Model knows table styling. |
| Anti-slop: **div-based fake product UI** (fake task lists/terminals/dashboards) → real screenshots/generated images | ALREADY-HAVE | = "fake dashboard mockups + floating icon pills as hero decoration `[trending-2026]`". |
| Anti-slop: three-equal-card feature rows → zig-zag / asymmetric | ALREADY-HAVE | = "uniform grid-cols-3/4 card walls" + "uniform symmetric sections — vary rhythm". |
| Anti-slop: AI-purple / mesh-blob gradients → neutral base + one accent (LILA exception: explicit purple brand) | ALREADY-HAVE | = purple→blue gradient + glossy-blob bullets; the "explicit brand overrides" is APEX's FLAG-not-BLOCK override model already. |
| Hand-rolled decorative SVG illustrations discouraged | ALREADY-HAVE | = "amateur SVG mascot/scene illustrations" slop bullet. |
| Redesign protocol §11 (audit-first; greenfield/preserve/overhaul modes; URL/nav/form-name never change silently) | ALREADY-HAVE | = § Escalation redesign-identifier FLAG + § Scored visual audit (the audit-first review mode) + impl redesign ban. |
| Pre-flight §14 ("no box, no ship") | ALREADY-HAVE | = Pre-delivery quality checklist + the readiness/visual-review gates. |
| Anti-laziness rules (block placeholder comments, skipped sections, half-finished output) | ALREADY-HAVE (elsewhere) | This is a *coding-discipline* rule, not taste — covered by `apex-coding-principles` / `apex-code` (no TODO stubs, complete output). Out of scope for a taste skill anyway. |
| Three dials (DESIGN_VARIANCE / MOTION_INTENSITY / VISUAL_DENSITY 1–10) | REJECT (architecture, not a heuristic) | A config mechanism. APEX expresses the same intent qualitatively via design-brief art-direction + § Industry-specific density column + apex-animation frequency gate. A numeric-dial layer would be speculative configurability the project explicitly avoids (CLAUDE.md §2). |

## Verdict

**No ABSORB items clear the bar.** Every behaviour-shaping rule in Taste-Skill is already encoded in APEX (largely *because* APEX already ran the `taste-rules-distill` pass against this exact source on 2026-06-05). The residue is either (a) model-redundant craft truisms a frontier model knows cold (off-black/off-white, theme-lock, scroll cues), (b) niche marketing-landing micro-bans whose value doesn't justify diluting the slop list (version footers, photo-credit captions, decorative text strips), or (c) an architecture/config mechanism (the 1–10 dials) that conflicts with APEX's simplicity-first, qualitative-brief approach.

**One watch-item, not an absorb:** the **locale/time/weather strip** tell (`Lisbon 14:23 · 18°C`) and possibly **decorative status dots** are specific, real 2026 award-site tells not literally in APEX's list. They are below the standalone-absorb bar (too niche, rarely emitted unprompted), but are legitimate candidates to fold in *if they recur* during the next scheduled `docs/research/ai-slop-watch/` refresh (cadence 7d) — which is the correct, already-existing channel for incremental slop-tell additions. No skill edit recommended from this pass.

**Overlap estimate: ~95%.** The two skills are near-isomorphic on taste because one was distilled from the other. Confirms the [[absorption-red-probe-before-content]] / taste-is-usually-model-redundant priors.
