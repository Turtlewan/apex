# Baseline Design Structure: System-First vs Screen-First (2024–2026)

**Facet:** Established baseline of modern UI design practice  
**Date:** 2026-06-17  
**Researcher:** Phase-2 retrieval agent

---

## Q1: How do mature product teams structure UI design today?

### Design Tokens — DTCG Standard

[VERIFIED] The W3C Design Tokens Community Group (DTCG) published the first stable specification (2025.10) on October 28, 2025. The spec defines a JSON-based interchange format (`application/design-tokens+json`, extensions `.tokens` / `.tokens.json`) for exchanging design decisions across tools and platforms.
- Source: https://www.designtokens.org/tr/2025.10/format/
- Source (announcement): https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/

[VERIFIED] Every token has a `$value`, optional `$type`, `$description`, `$deprecated`, and `$extensions`. Eleven base types (color, dimension, font-family, font-weight, duration, cubic-Bézier, number, stroke style, border, transition, shadow). Groups nest arbitrarily and inherit `$type` downward — this encodes a hierarchical tier model.
- Source: https://www.designtokens.org/tr/2025.10/format/

[VERIFIED] More than 10 tools already implement DTCG: Figma, Sketch, Framer, Penpot, Supernova, Knapsack, zeroheight.
- Source: https://www.designtokens.org/faq/

[COMMUNITY] Style Dictionary v4 ships "first-class support" for DTCG; v5 targets the 2025.10 spec.
- Source: https://styledictionary.com/info/dtcg/

[COMMUNITY] Token adoption: 56% of design teams in 2024 → 84% in 2025 (zeroheight Design Systems Report 2025, ~300 professionals).
- Source: https://zeroheight.com/blog/design-systems-report-2025-an-overview/

### Three-Tier Token Architecture (de facto standard)

[COMMUNITY] Tokens are organized in three tiers: **primitive/global** (raw values: `color.blue.500`) → **semantic/alias** (intent-named: `color.action.primary`) → **component** (`button.background.default`). Promotion from component to semantic requires cross-component reuse.
- Source: https://thedesignsystem.guide/design-tokens (via search synthesis)
- Source: https://medium.com/eightshapes-llc/naming-tokens-in-design-systems-9e86c7444676

[VERIFIED] Material Design 3 calls these tiers "reference tokens" → "system tokens" → "component tokens."
- Source: https://m3.material.io/foundations/design-tokens

### Atomic Design / System-First Structure

[VERIFIED] Brad Frost's Atomic Design (atomicdesign.bradfrost.com) defines the canonical bottom-up hierarchy:
1. **Atoms** — basic HTML elements (buttons, inputs, labels), irreducible
2. **Molecules** — combinations of atoms with a single purpose (e.g., search form)
3. **Organisms** — complex sections combining molecules and atoms (e.g., header)
4. **Templates** — page-level layouts without real content
5. **Pages** — templates with real content, validating system effectiveness
- Source: https://atomicdesign.bradfrost.com/chapter-2/

[VERIFIED] Frost's core claim: "a project's level of effort is much better determined by the functionality and components contained within those pages, rather than the quantity of pages themselves." The university example (30,000 pages = 3 content types + 2 layouts) demonstrates that page-counting is the wrong unit of design work.
- Source: https://atomicdesign.bradfrost.com/chapter-1/

[VERIFIED] Figma's own design system guidance (Design Systems 102) recommends the same foundations-first order: foundations (color, typography, spacing, accessibility) → components → implementation. No starting-from-screens recommendation in Figma's primary guide.
- Source: https://www.figma.com/blog/design-systems-102-how-to-build-your-design-system/

### Is System-First the Dominant Practice?

[COMMUNITY] As of 2025, system-first / atomic design remains the dominant framing — it is what design system tooling, token tooling, and major corporate design systems (Material 3, Polaris, Carbon) are built on. AI-driven top-down layout generation (used by ~62% of teams in 2024) represents an emerging counter-pressure, but is not yet dominant.
- Source: https://www.designsystemscollective.com/is-atomic-design-still-relevant-in-2025-d9c214788cfe (paywalled redirect, finding from search result summary)
- Source: https://dev.to/m_midas/atomic-design-and-its-relevance-in-frontend-in-2025-32e9

---

## Q2: Is there an explicit notion of LEVERAGE in the foundational layers?

### Nathan Curtis / EightShapes — Systems Solve Once

[VERIFIED] Nathan Curtis's core principle: **"Systems solve the easy problems so Products can solve hard problems more easily."** The corollary: shared components (buttons, forms, tokens) solved once remove redundant decision-making from every product team.
- Source: https://eightshapes.com/articles/principles-of-designing-systems/

[VERIFIED] Curtis principle #2: "Include what's shared, omit what's not." Well-crafted single-use components do not belong in the system — contribution earns inclusion only when multiple products benefit.
- Source: https://eightshapes.com/articles/principles-of-designing-systems/

[VERIFIED] Curtis principle #8: "Favor quality over quantity." Foundational elements (buttons, tokens) require higher quality investment than edge-case components, because they propagate across the entire product surface.
- Source: https://eightshapes.com/articles/principles-of-designing-systems/

[VERIFIED] Tokens as the highest-leverage layer: Nathan Curtis, "Effective token names improve and sustain a team's shared understanding of visual style through design, code, and other interdisciplinary handoffs." Tokens encode decisions once; they propagate automatically to every component that references them.
- Source: https://medium.com/eightshapes-llc/naming-tokens-in-design-systems-9e86c7444676

### Design Drift as the Named Anti-Pattern

[VERIFIED] "Design drift" is the established term for what happens when teams design screens individually without a shared component/token foundation: inconsistent button appearances, redundant near-identical components, token overrides, differing density rules across product areas.
- Source: https://figr.design/blog/figma-design-system-drift
- Source: https://www.uxpin.com/studio/blog/design-drift/

[VERIFIED] Figr: "When all UI is assembled from the same components referencing the same tokens, visual drift across screens is prevented by the architecture, eliminating the need for a designer to manually police every pull request for spacing inconsistencies."
- Source: https://figr.design/blog/figma-design-system-drift

[COMMUNITY] Root cause analysis: drift is "almost always a workflow problem" — static mockups that don't reflect production constraints, and engineers rebuilding UI from scratch because design ↔ code handoff lacks a shared component model.
- Source: https://figr.design/blog/figma-design-system-drift

### MailChimp / Snowflake Example (Atomic Design)

[VERIFIED] Brad Frost cites MailChimp: after establishing patterns from their four primary screens, teams discovered those same systems "will actually work here and here" throughout other sections — a multiplicative consistency return on the foundational investment.
- Source: https://atomicdesign.bradfrost.com/chapter-1/

---

## Q3: Starting from One Reference Screen — Extract, Then Promote?

### Brad Frost's "Interface Inventory" — the Established Practice

[VERIFIED] Brad Frost formalizes starting from existing screens as the **Interface Inventory**: "a comprehensive collection of the bits and pieces that make up your user interface." Process:
1. Assemble a cross-disciplinary team
2. Screenshot unique UI patterns across the full experience (30–90 min)
3. Categorize patterns by type (buttons, forms, nav, etc.)
4. Present findings to establish shared vocabulary
5. Create an über-document consolidating all discoveries

This is the canonical technique for extracting a system from screens rather than building one from scratch.
- Source: https://atomicdesign.bradfrost.com/chapter-4/

[VERIFIED] The interface inventory's value: "you don't need to be a designer to recognize that having 37 unique button styles probably isn't a good idea." It makes inconsistency undeniable and builds stakeholder buy-in for system investment.
- Source: https://atomicdesign.bradfrost.com/chapter-4/

[COMMUNITY] This is sometimes called "auditing the interface" or "UI audit" in broader practice. The interface inventory is recognized in 2024 practitioner discourse as the bridge from "we have screens" to "we have a system."
- Source: https://medium.com/@marcintreder/design-systems-sprint-1-the-interface-inventory-1f78d376e49a

### The "Rule of Three" / Promotion Threshold

[VERIFIED] Nathan Curtis articulates the promotion threshold explicitly: keep token/component decisions **local** (component-scoped) until reuse is evident; promote to **global/semantic** level when **3 or more** components share the decision. Curtis: "Avoid polluting a global namespace prematurely."
- Source: https://medium.com/eightshapes-llc/naming-tokens-in-design-systems-9e86c7444676

[COMMUNITY] The same "rule of three" threshold (3 or more instances → promote to shared) applies in broader design system community guidance for component promotion, mirroring the software engineering heuristic.
- Source: https://thedesignsystem.guide/design-tokens (via search synthesis on "rule of thumb of 3 or more")

[ASSUMED] A named practice of "designing ONE reference/anchor screen first, then extracting all tokens and components from it" is not documented under a specific practitioner-coined term. The closest is: (a) Brad Frost's interface inventory (extract from existing screens) and (b) Figma's audit-first guidance. The sequence "anchor screen → extract → promote" is implied by both but not branded as a named methodology.

---

## Q4: Component States — Separate Design Pass?

### Material Design 3 — States as a First-Class Design Concern

[VERIFIED] Material Design 3 defines a systematic interaction states model. States are driven by "state layers" — semi-transparent overlays — rather than wholesale component redesigns. The canonical state set:
- **Enabled** (default, interactive)
- **Disabled** (de-emphasized, not interactive — lower opacity)
- **Hover** (low-emphasis overlay, cursor over component)
- **Focused** (higher-emphasis overlay + focus ring, keyboard navigation)
- **Pressed** (ripple effect from point of contact)
- **Dragged** (overlay + elevation change)
- Source: https://m3.material.io/foundations/interaction/states/applying-states

[VERIFIED] M3 principle: "Each state should be visually similar and not drastically alter a component, but must have clear affordances that distinguish it from other states." States are not redesigns — they are incremental overlays on the default.
- Source: https://m3.material.io/foundations/interaction/states/applying-states

### Polaris (Shopify) — States as a Distinct Layer

[VERIFIED] Polaris treats interaction states as **distinct from static appearance**: "Successful interaction feedback is informative, not decorative." States communicate through subtle, intentional changes. The doc covers: default, hover, loading/progress, error/validation, and multi-device signifiers (mouse, touch, keyboard, voice, game controllers, accessibility devices).
- Source: https://polaris-react.shopify.com/design/interaction-states

### Figma Workflow — States as Variants (Integrated, Not Afterthought)

[COMMUNITY] Current Figma practice: component states are encoded as **variants** within a component set. States must be "planned, named, and handled inside your components — not hacked together frame-by-frame." The recommended full state set for interactive components:
- Default, Hover, Pressed/Active, Disabled, Loading, Error/Validation, Focused
- Source: https://designilo.com/2025/07/10/designing-state-driven-components-in-figma-without-losing-your-mind/

[COMMUNITY] States are treated as a **separate intentional design pass** from the static default appearance, but encoded within the same component via Figma variants + properties. The Designilo article: "Design for every state (Even the Boring Ones)" — empty, loading, and error states are explicitly called out as frequently skipped.
- Source: https://designilo.com/2025/07/10/designing-state-driven-components-in-figma-without-losing-your-mind/

[VERIFIED] Supercharge Design documents the essential button states: default, hover, active, disabled, loading — with specific visual treatment guidance for each.
- Source: https://supercharge.design/articles/button-states-explained

### Carbon Design System (IBM) — States in Patterns

[VERIFIED] Carbon covers component states including disabled states as a documented pattern. The system distinguishes "loading, empty and error states" as a separate pattern category, explicitly acknowledging that these require distinct design treatment.
- Source: https://carbondesignsystem.com/patterns/disabled-states/
- Source (loading/error/empty): https://design-system.agriculture.gov.au/patterns/loading-error-empty-states (Australian Government design system, following Carbon pattern)

---

## Bottom Line for the Layer Model

1. **System-first is the established practice.** Tokens → primitive components → patterns → screens is the canonical order across all major design systems (Material 3, Polaris, Carbon, Figma's own guidance). Designing screens one-by-one without a shared foundation is the named anti-pattern (design drift).

2. **Leverage is explicit and foundational.** The primary leverage point is the token + primitive component layer: decisions made there propagate automatically to every surface. Per-screen hand-polishing is low-leverage and a known drift generator — Nathan Curtis's "solve once" principle is industry consensus.

3. **States are a distinct, mandatory design pass.** Every major design system (M3, Polaris, Carbon, Figma community guidance) treats interaction states (default/hover/focused/disabled/loading/error/empty) as a separate concern from static appearance. States are encoded as component variants, not afterthoughts.
