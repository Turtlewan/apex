# Research: WS-3 — Design Skill-Set Audit

**Date:** 2026-06-12
**Confidence:** HIGH for inventory, overlap, and conflict findings (all sourced from direct file reads); MEDIUM for token estimates (line-count proxies, not tokeniser output); ASSUMED where provenance is inferred from writing style/structure.

---

## Summary

The owner operates 22 design-related skills across two populations. The APEX cluster (7 skills) is well-structured, mutually non-overlapping, and of genuinely good quality. The third-party cluster (15 skills) contains significant redundancy: at least 8 skills share the same "anti-slop taste" brief, producing contradictory rules across several key dimensions. Total estimated context load when a generic UI request fires all plausible triggers is ~35,000–45,000 tokens — several multiples of what a well-curated set requires. Recommended deletions free approximately 25,000–30,000 tokens.

---

## Inventory Table

### Population A — APEX Cluster

| Skill | Purpose | ~Lines | Trigger surface | Provenance |
|---|---|---|---|---|
| `apex-ui-ux-design` | Screen design, flows, visual identity, slop-detection, scored visual audit | 179 SKILL + impl.md | new screens / redesign / "is this UI good" / UI spec review | Owner-maintained |
| `apex-design-system` | Component library, design tokens, theming (web: React + Tailwind + shadcn) | 107 SKILL + impl.md | "design system", "shadcn", "design tokens", "theme this" | Owner-maintained |
| `apex-animation` | Motion — transitions, scroll, gestures, micro-interactions | 111 SKILL + 123 impl.md | "animate this", "add a transition", "scroll animation" | Owner-maintained |
| `apex-frontend` | React 19 components, Tailwind, bundle perf, composition patterns | 105 SKILL + impl.md | "React component", "Tailwind", "this UI is slow" | Owner-maintained |
| `apex-figma` | Design-to-code from Figma via MCP; token extraction | 104 SKILL | Figma URL paste / "turn this design into a component" | Owner-maintained |
| `apex-accessibility` | WCAG 2.2 AA, EAA, contrast, focus, touch targets (skim scope) | 101 SKILL + impl.md | "a11y", "WCAG", any frontend change | Owner-maintained |
| `apex-ui-testing` | Playwright, Storybook, Chromatic, axe-core visual/a11y test planning (skim scope) | 90 SKILL | new components / redesigns / "add tests for this UI" | Owner-maintained |

### Population B — Third-Party Cluster

| Skill | Purpose | ~Lines | Trigger surface | Provenance |
|---|---|---|---|---|
| `design-taste-frontend` | Anti-slop taste enforcement via dial system (8/6/4 baseline), Framer Motion, bento, perpetual micro-animations | 227 | "build a landing page", any frontend generation | [ASSUMED] Leonxlnx/taste-skill (GitHub) |
| `emil-design-eng` | Emil Kowalski animation philosophy: restraint, easing, springs, component building | 680 | "animate this", "UI polish", "review this component" | [ASSUMED] community encode of animations.dev |
| `frontend-design` | Distinctive production-grade frontend; bold aesthetic direction, avoids AI slop | 43 | "build web components", "landing page", any UI build | [COMMUNITY] likely Anthropic official (LICENSE.txt present) |
| `gpt-taste` | Awwwards-level GSAP design; AIDA structure, bento grids, Python RNG layout selection | 75 | "build a landing page", any design generation | [ASSUMED] community skill |
| `high-end-visual-design` | "$150k agency level" UI; variance engine, double-bezel architecture, spring physics | 99 | any frontend / "premium UI" | [ASSUMED] community skill |
| `minimalist-ui` | Editorial minimalism: warm monochrome, bento, no gradients/shadows | 86 | any UI generation without explicit style | [ASSUMED] community skill |
| `industrial-brutalist-ui` | Swiss grid + military terminal aesthetic; monospace, harsh structure, CRT effects | 93 | "brutalist", "data dashboard", "declassified" | [ASSUMED] community skill |
| `stitch-design-taste` | Generates DESIGN.md files for Google Stitch; encodes design system in natural-language rules | 185 | Google Stitch / "generate DESIGN.md" | [ASSUMED] community Stitch-specific skill |
| `design-motion-principles` | Dual-mode (Create/Audit) motion expert; three designer lenses (Emil/Jakub/Jhey); context-aware weighting | 123 SKILL + 10 reference files (~700 lines total) | "animate", "audit motion", any motion work | [ASSUMED] owner-authored or community; high quality |
| `image-to-code` | Image-first website design workflow; 38-section rules for Codex/image-gen environments | 1229 | "build a website" in Codex-style environments | [ASSUMED] community/Codex-specific |
| `imagegen-frontend-web` | Per-section horizontal image generation for landing pages; AWWWARDS art direction | 988 | "design a landing page", any marketing site | [ASSUMED] community/image-gen environment |
| `imagegen-frontend-mobile` | Premium mobile app screen image generation (iOS/Android concepts) | 1466 | "make a mobile app", "design app screens" | [ASSUMED] community/image-gen environment |
| `redesign-existing-projects` | Code-level redesign checklist: typography, colour, layout, interactivity, content | 170 | "redesign this", "upgrade the UI", existing project | [ASSUMED] community skill |
| `brandkit` | Premium brand-kit image generation: logos, identity decks, brand boards | 799 | "create a brand", "logo", "brand guidelines" | [ASSUMED] community/image-gen |
| `write-feature-spec` | (Listed in system-reminder; not design-specific — omitted from detail) | N/A | N/A | — |

---

## Overlap & Conflict Matrix

### Cluster 1: "Anti-AI-Slop Taste" Rules (8-way overlap)

The following skills all prohibit the same LLM UI clichés. The rules themselves are substantially identical; the differences are minor wording variations:

**Skills involved:** `design-taste-frontend`, `gpt-taste`, `high-end-visual-design`, `minimalist-ui`, `stitch-design-taste`, `redesign-existing-projects`, `frontend-design`, `image-to-code`, `imagegen-frontend-web`, `imagegen-frontend-mobile`

**Shared prohibited items (nearly verbatim across files):**
- "No Inter font" — appears in `design-taste-frontend` §7 ("NO Inter Font: Banned"), `minimalist-ui` §2 ("DO NOT use 'Inter'"), `high-end-visual-design` §2 ("Banned Fonts: Inter"), `stitch-design-taste` §3, `gpt-taste` §1, `redesign-existing-projects` §Typography, `frontend-design` body text
- "No AI purple/blue gradients" — appears in all 8 skills
- "No generic names (John Doe, Acme)" — appears in `design-taste-frontend` §7, `minimalist-ui` §2, `gpt-taste` §7, `stitch-design-taste` §9, `redesign-existing-projects` §Content, `image-to-code` §29, `imagegen-frontend-web` §8
- "No filler words (Elevate, Seamless, Unleash)" — identical list across 7 skills
- "Use `min-h-[100dvh]` not `h-screen`" — `design-taste-frontend` §2, `high-end-visual-design` §3, `stitch-design-taste` §6, `redesign-existing-projects` §Layout
- "No 3-column equal card grid" — `design-taste-frontend` §7, `stitch-design-taste` §6, `minimalist-ui` §5 (implicit), `redesign-existing-projects` §Layout

This is pure duplication. Loading 8 skills to enforce the same slop-prevention list multiplies context cost with no benefit.

### Cluster 2: Typography Font Recommendations (CONFLICTING)

**`design-taste-frontend` §7:** "NO Inter Font: Banned. Use `Geist`, `Outfit`, `Cabinet Grotesk`, or `Satoshi`."

**`industrial-brutalist-ui` §3.1:** "Neo-Grotesque / Heavy Sans-Serif. Optimal Web Fonts: **Neue Haas Grotesk (Black), Inter (Extra Bold/Black)**, Archivo Black..."

These directly contradict. `design-taste-frontend` hard-bans Inter; `industrial-brutalist-ui` recommends it as a primary font for structural headers. If both activate on a "data-heavy dashboard" request, the model receives conflicting mandatory instructions.

**`minimalist-ui` §3:** Recommends `SF Pro Display`, `Geist Sans`, `Helvetica Neue`, `Switzer` for body.
**`high-end-visual-design` §2:** Bans `Inter, Roboto, Arial, Open Sans, Helvetica`.
**`minimalist-ui` §3:** Lists `Helvetica Neue` as a target font.

`minimalist-ui` recommends `Helvetica Neue`; `high-end-visual-design` bans `Helvetica` outright — direct conflict.

### Cluster 3: Motion Intensity (CONFLICTING)

**`design-taste-frontend` MOTION_INTENSITY baseline: 6** with "Perpetual Micro-Interactions: When MOTION_INTENSITY > 5, embed continuous, infinite micro-animations (Pulse, Typewriter, Float, Shimmer, Carousel) in standard components."

**`emil-design-eng` §Animation Decision Framework:** "100+ times/day (keyboard shortcuts, command palette toggle) — No animation. Ever. Tens of times/day (hover effects) — Remove or drastically reduce." Emil's restraint philosophy is fundamentally incompatible with design-taste-frontend's perpetual infinite loops on standard components.

**`apex-animation` SKILL.md §Frequency table:** matches Emil exactly — "100+/day: No animation, ever."

**`gpt-taste` §5:** "Static interfaces are strictly forbidden. You must write real GSAP ScrollTriggers."

Three different motion philosophies: (1) heavy perpetual physics (design-taste-frontend, gpt-taste), (2) contextual restraint (emil-design-eng, design-motion-principles), (3) structured motion budget (apex-animation). They will issue contradictory guidance simultaneously.

### Cluster 4: Card / Container Architecture (CONFLICTING)

**`high-end-visual-design` §4A "The Double-Bezel (Doppelrand / Nested Architecture)":** "Never place a premium card, image, or container flatly on the background. They must look like physical, machined hardware using nested enclosures... outer shell + inner core."

**`image-to-code` §16 "Anti-Nested-Box Rule":** "Do not default to box-in-box-in-box layouts. Avoid: giant rounded section containers wrapping everything, cards inside larger cards inside outer cards."

**`minimalist-ui` §2:** "DO NOT use `rounded-full` for large containers, cards, or primary buttons." vs. `high-end-visual-design` §4B: "Primary interactive buttons must be fully rounded pills (`rounded-full`)."

These are direct, hard contradictions on core component patterns.

### Cluster 5: Glassmorphism (CONFLICTING)

**`design-taste-frontend` §4:** "Implement buttons that pull slightly toward the mouse cursor... 'Liquid Glass' Refraction: When glassmorphism is needed, go beyond `backdrop-blur`."

**`apex-ui-ux-design` SKILL.md §Slop detection:** "Glassmorphism / blur cards used decoratively with no depth purpose" → FLAG to redesign.

**`minimalist-ui` §2:** "DO NOT use gradients, neon colors, or 3D glassmorphism (beyond subtle navbar blurs)."

### Cluster 6: Icon Library (CONFLICTING)

**`design-taste-frontend` §2:** "You MUST use exactly `@phosphor-icons/react` or `@radix-ui/react-icons`."
**`apex-ui-ux-design` §checklist:** "No emoji as icons — SVG (web: Lucide/Heroicons)."
**`apex-design-system` component stack:** "Icons: Lucide."
**`high-end-visual-design` §2:** "Banned Icons: Standard thick-stroked Lucide, FontAwesome, or Material Icons. Use only ultra-light, precise lines (e.g., Phosphor Light, Remix Line)."
**`minimalist-ui` §6:** "Use 'Phosphor Icons (Bold or Fill weights)' or 'Radix UI Icons'."

Lucide is APEX's canonical choice; the third-party cluster bans it (or bans thick-stroked variants). This creates a real conflict for coding mode where impl.md rules govern actual code written.

---

## Trigger-Collision Analysis

**Scenario: User says "build me a landing page"**

Plausibly activating skills and estimated token load:

| Skill | Triggers on | ~Tokens |
|---|---|---|
| `apex-ui-ux-design` | "build" + UI context | ~2,500 |
| `apex-frontend` | "React component" / build context | ~1,500 |
| `apex-design-system` | component library context | ~1,500 |
| `design-taste-frontend` | any frontend generation | ~3,200 |
| `frontend-design` | "build web components", "landing page" | ~700 |
| `gpt-taste` | "build a landing page" | ~1,100 |
| `high-end-visual-design` | "premium UI" / generic frontend | ~1,400 |
| `minimalist-ui` | generic UI generation | ~1,200 |
| `stitch-design-taste` | design system generation | ~2,700 |
| `redesign-existing-projects` | "upgrade the UI" (borderline) | ~2,400 |
| `image-to-code` | "visually important web tasks" | ~17,000 |
| `imagegen-frontend-web` | "design a landing page" | ~13,000 |
| `emil-design-eng` | "UI polish" context | ~9,500 |
| `design-motion-principles` | motion in any frontend | ~2,500 (SKILL only) |

**Estimated combined context: ~60,000 tokens.** After APEX cluster overlap (~6,000 tokens) the net load is still ~54,000 tokens just for skill context — before any user content, codebase files, or conversation history. This is untenable at any context window size where cost matters, and actively degrades output quality by forcing the model to reconcile contradictory rules.

A well-curated set (APEX cluster + 3 specialised third-party keepers) would be ~15,000 tokens for the same request.

---

## Gap Analysis

The combined set covers anti-slop taste rules exhaustively but misses several areas:

1. **Art direction / brief stage.** No skill covers the upstream step: translating a product category, brand personality, and target user into a visual brief before any code or mockup is written. `apex-ui-ux-design` has the industry-specific table and questions, but nothing codifies the brief-writing process or the "why this aesthetic for this product" reasoning chain. `brandkit` handles brand identity but not product UI direction.

2. **Visual QA rubric with screenshot loop.** `apex-ui-ux-design` has a scored audit (0–10 per dimension). `apex-ui-testing` covers Chromatic visual regression. But no skill defines a **live screenshot → compare → iterate** loop for checking rendered output against intent. `image-to-code` comes closest (analyze generated images before coding) but is Codex-environment-specific.

3. **Layout theory / grid systems.** Multiple skills reference "asymmetric grid" or "12-column grid" without any grounding in layout theory (modular scale, optical alignment, baseline grids, typographic scale systems). The rules are output-oriented ("use CSS Grid") rather than principle-based ("why this grid").

4. **Data visualisation design.** No skill covers chart design, data-density judgments for dashboards, or colour-in-data principles. Several skills mention "dashboards" but only in passing (TanStack Table in apex-design-system; Recharts/Tremor noted).

5. **Content-level design (microcopy, error messages, empty states at copy level).** The slop-prevention rules ban generic copy but don't provide positive guidance on writing good microcopy (tone, voice, error message structure, onboarding copy patterns).

6. **Cross-surface design continuity.** Multiple skills acknowledge web/native split but no skill covers how a single product maintains visual coherence across web + iOS + Android simultaneously (shared token layer, platform adaptation rules).

---

## APEX Cluster Quality Read

### apex-ui-ux-design
**Verdict: Genuinely strong.** The skill earns its keep: it covers the industry-specific design reasoning table, the "slop detection" list with concrete examples, the scored visual audit format, the app-flow artifact convention (ADR-013), the 2026 "Calm UI" context, and clear escalation rules. The boundary definitions (not apex-design-system, not apex-animation, not apex-accessibility) are precise and accurate.

**Weaknesses:** The pre-delivery checklist overlaps ~40% with apex-accessibility (contrast, touch targets, focus states). The "What's current (2026)" section will need updating at its 30d staleness threshold. The "scored visual audit" mode is excellent but the 0–10 scoring guidance is vague — what does a "7 on typography hierarchy" mean without reference anchors?

**Strengthening opportunities:** Add reference anchors to the scored audit (what does each numeric band mean?). Add an explicit art-direction brief stage before the design questions.

### apex-design-system
**Verdict: Good, web-specific.** It correctly scopes itself to React + Tailwind + shadcn and explicitly defers native to apex-swift. The 2026 content (unified radix-ui package, shadcn CLI v4, Tailwind v4 oklch tokens) is current. Storybook integration guidance is solid.

**Weaknesses:** Thin on design-token governance (the `@theme` → semantic token → component token hierarchy isn't walked through). No guidance on what to do when a project is NOT using shadcn (custom primitives path). The review checklist has no "does the token name mean something, or is it `color-blue-500`?" check.

**Strengthening opportunities:** Add a token naming convention section. Add a "starting without shadcn" path.

### apex-animation
**Verdict: Very strong; best-in-set for implementation detail.** The frequency-based decision table, GSAP licensing note, timing guidelines, and escalation rules are all production-grade. The impl.md is particularly clean — the NEVER/ALWAYS contract is enforced at the right level of specificity. The main thing missing is a richer guidance on CSS `@starting-style` (the modern no-JS entry animation, well-documented in `emil-design-eng`).

**Weaknesses:** The 150–300ms micro-interaction guideline in SKILL.md conflicts slightly with the more nuanced per-use-case breakdown in the timing table (button press feedback should be 150–200ms, not 300ms). Minor — but a code-generator will pick the upper bound.

**Strengthening opportunities:** Add `@starting-style` pattern. Tighten the micro-interaction band to 150–200ms to match the table.

### apex-frontend
**Verdict: Solid technical reference.** React 19/Compiler notes are correct and current. The composition patterns section (compound components over boolean prop explosion) is good. Deferral discipline (to apex-design-system, apex-nextjs, apex-ui-ux-design, apex-accessibility) is clean.

**Weaknesses:** This is a pure technical skill with minimal design guidance. It is correctly separated from design concerns — this is not a weakness but a design decision to note.

### apex-figma
**Verdict: Good.** The MCP tool comparison (official vs GLips Framelink), seat/billing gating flags, CVE note, and Figma Make disambiguation are all practically useful. The design-to-code workflow and token extraction section are solid.

**Weaknesses:** The references/ directory (react-tailwind-tokens.md) is not verifiable from this audit pass. Light on "what to do when the Figma file has no design tokens at all."

---

## Keep / Merge / Delete Recommendation

### KEEP (no change needed)

| Skill | Reason |
|---|---|
| `design-motion-principles` | Unique value: dual Create/Audit modes, three-designer lenses with context-aware weighting, 10 reference files covering motion cookbook, anti-patterns, accessibility, performance. **Not redundant** with apex-animation or emil-design-eng — it synthesises all three into a richer framework. Estimated size: ~900 lines total across SKILL + references. Worth the load for motion-heavy work. |
| `industrial-brutalist-ui` | Only skill covering this aesthetic domain. No conflict with APEX cluster (it's opt-in by trigger: "brutalist"/"terminal"/"declassified"). Keep as a specialised option. ~93 lines. |
| `imagegen-frontend-web` | Covers image-generation workflow in image-capable environments. Not activated in normal Claude Code sessions (requires image generation). Keep but understand the trigger is environment-specific. ~988 lines — large but the environment gate limits actual load. |
| `imagegen-frontend-mobile` | Same as above: mobile-specific, image-generation environment only, unique domain (app screens vs websites). Keep. ~1,466 lines. |
| `brandkit` | Brand identity / logo domain not covered by any other skill. Keep. ~799 lines. |

### MERGE (collapse into another skill)

| Skill | Merge target | Rationale | Token savings |
|---|---|---|---|
| `emil-design-eng` | `apex-animation` (or `design-motion-principles`) | Emil's content is entirely about animation/interaction. `apex-animation` already cites Emil Kowalski as a primary source. `design-motion-principles` already contains an Emil lens. The 680-line standalone is redundant. The unique content (CSS `@starting-style`, `clip-path` animations, `useSpring` for decorative mouse-tracking, Sonner build principles, WAAPI) should be absorbed into `apex-animation` impl.md and/or `design-motion-principles` references. | ~680 lines / ~9,500 tokens |
| `stitch-design-taste` | N/A — **delete** if Stitch is not actively used | Its value is Google Stitch DESIGN.md generation, which is Stitch-specific. If the owner does not use Google Stitch, this is dead weight. If Stitch IS used, keep as a very narrow tool. The taste rules it encodes are already in the APEX cluster. | ~185 lines / ~2,700 tokens |

### DELETE (clear redundancy)

| Skill | Evidence | Token savings |
|---|---|---|
| `design-taste-frontend` | Its anti-slop rules are duplicated across 7 other skills. Its dial system (DESIGN_VARIANCE 8, MOTION_INTENSITY 6) conflicts with apex-animation's frequency-based motion budget and with emil-design-eng's restraint philosophy. Its perpetual micro-animation mandate actively conflicts with Emil/APEX restraint. Its icon ban conflicts with APEX's Lucide canonical choice. Unique content: the dial abstraction and the "Creative Arsenal / Bento 2.0 Paradigm" sections — worth extracting to `apex-ui-ux-design` if desired. | ~3,200 tokens |
| `gpt-taste` | Near-complete overlap with `design-taste-frontend` and `high-end-visual-design`. Adds: Python RNG layout simulation (a cute but unnecessary process step), AIDA structure enforcement, and GSAP ScrollTrigger mandate. GSAP guidance already lives in `apex-animation`. The AIDA structure is useful but can be added as a 5-line note to `apex-ui-ux-design`. Unique value: essentially zero after those two extractions. | ~1,100 tokens |
| `high-end-visual-design` | Substantially duplicates `design-taste-frontend` and `gpt-taste`. Conflicts with `minimalist-ui` on Helvetica, conflicts with `image-to-code` on nested architecture. Adds: the Double-Bezel / Doppelrand technique and Button-in-Button pattern. These are genuinely useful micro-patterns but can be a section in `apex-design-system` or `apex-ui-ux-design`. | ~1,400 tokens |
| `minimalist-ui` | Sole specialised minimalist aesthetic skill — keep if the owner uses this style. But: all its anti-patterns are covered elsewhere, and it conflicts with `high-end-visual-design` on Helvetica Neue. **Conditional delete**: remove if rarely triggered; retain if the owner regularly builds editorial/document-style UIs. If retained, add a tag to its frontmatter so it only loads on explicit minimalist requests. | ~1,200 tokens |
| `frontend-design` | At 43 lines it is the shortest skill in the set. Its content ("bold aesthetic direction, avoid AI slop, unexpected choices") is entirely subsumed by `apex-ui-ux-design` §§ Generic-AI detection and Industry-specific reasoning. The LICENSE.txt suggests it may be an Anthropic official skill that is now superseded by the owner's own APEX equivalent. | ~700 tokens |
| `redesign-existing-projects` | Strong checklist (170 lines) but 80% overlap with `apex-ui-ux-design`'s scored audit and `apex-frontend`'s review checklist. Unique content: the "strategic omissions" section (legal links, 404 page, cookie consent, form validation, skip-to-content link) and the "fix priority order" — these are worth extracting to `apex-ui-ux-design` §escalation or a new "completeness checklist." | ~2,400 tokens |
| `image-to-code` | At 1,229 lines, this is the largest skill in the set. It is a highly specialised workflow for Codex (OpenAI's code environment with image generation). In standard Claude Code sessions without image generation, it loads ~17,000 tokens of instructions that cannot be executed. It has near-total content overlap with `imagegen-frontend-web` (same anti-slop rules, same section structure, same combinatorial variation engine). If the owner only uses Claude Code (not Codex), **delete**. If Codex is used, keep but set an environment-specific trigger. | ~17,000 tokens |

### Summary table

| Action | Skills | Est. tokens freed |
|---|---|---|
| DELETE | `design-taste-frontend`, `gpt-taste`, `high-end-visual-design`, `frontend-design`, `redesign-existing-projects`, `image-to-code` | ~25,800 |
| MERGE/ABSORB | `emil-design-eng` → apex-animation/design-motion-principles | ~9,500 |
| CONDITIONAL | `minimalist-ui` (keep if editorial style used; delete otherwise) | ~1,200 |
| CONDITIONAL | `stitch-design-taste` (keep only if Google Stitch is actively used) | ~2,700 |
| KEEP | `design-motion-principles`, `industrial-brutalist-ui`, `imagegen-frontend-web`, `imagegen-frontend-mobile`, `brandkit` | — |

**Total conservative savings (confirmed deletes + merge): ~35,300 tokens**

---

## Assumptions & Gaps

1. **Token estimates** are derived from line counts × ~14 tokens/line (empirical SKILL.md prose density). Actual tokeniser output will vary; treat as ±20% estimates. [ASSUMED]

2. **Trigger analysis** assumes all skills are registered in the harness in a way that allows multi-skill activation on a single request. If the harness enforces single-skill dispatch, collision impact is lower. [ASSUMED based on how apex-orchestrate routes]

3. **`image-to-code` / `imagegen-*` environment gating**: It is assumed these are NOT automatically gated behind image-capability detection in the current harness. If they are already gated, their collision cost is zero. [ASSUMED — not verified from harness config]

4. **`stitch-design-taste` active use**: Whether the owner uses Google Stitch is unknown. The recommendation to delete conditionally requires that information. [UNKNOWN]

5. **`minimalist-ui` / `industrial-brutalist-ui` conflict**: These two styles are mutually exclusive by design (light vs dark substrate, rounded vs sharp corners). They would not both activate on the same request, so they don't conflict in practice — but neither is they're actively differentiated by trigger keywords in their description fields. Adding explicit trigger keywords (e.g., "minimalist", "brutalist") to their descriptions would improve routing precision.

6. **Referenced skills not read**: `write-feature-spec` was listed in system-reminder but flagged as not design-specific and omitted. If it contains design-related spec templates, that should be reviewed separately.

7. **`design-motion-principles` references/**: The 10 reference files (~700 lines) were not read in full. The audit is based on the SKILL.md index. The motion cookbook, anti-checklist, and accessibility files are cited by the skill as load-on-demand — their content quality is inferred from the SKILL.md description as high-quality. [COMMUNITY — owner-or-community authored, high structural quality]
