# Research synthesis: How apps are designed in the AI era (2025–2026)

**Date:** 2026-06-17
**Confidence:** HIGH on the established spine + the AI-pipeline direction (multiple primary + convergent practitioner sources); MEDIUM on drift *magnitude* (qualitative only — no numeric study) and on the AI-era promotion-threshold inversion (reasoned from evidence, not directly measured).
**Re-research after:** 2026-07-17 (AI design tooling moves ~14–30d).
**Purpose:** ground the parked UI "layer stack" model against current practice before codifying it into `apex-ui-ux-design`.
**Facet files:** `baseline-design-structure.md` · `ai-design-pipeline-shift.md` · `ai-consistency-enforcement.md`.

## Summary
Modern UI design is **system-first**: design tokens (primitive→semantic→component) + a component library are the single source of truth, and Atomic Design (atoms→…→pages) is still the canonical hierarchy. The APEX layer model (L0–L5) is largely a **restatement of these canonical structures** — so the taxonomy itself is industry-standard, not novel. What the AI era genuinely changes is *enforcement and sequencing*, not the structure. The codify-worthy residue is narrow.

## Convergent findings (highest confidence — multiple agents)

1. **System-first wins, but the contract = tokens + PROSE + locally-inspectable components — NOT tokens alone.** Tokens-only generation drifts from ~screen 5–8; a prose `DESIGN.md` (rationale, not just values) re-anchors and kills the drift. [COMMUNITY: wavespeed/Dora; corroborated by Figma MCP VERIFIED] The industry-converging shape is `AGENTS.md`/`CLAUDE.md` → `DESIGN.md` as the single UI entry point.

2. **Consistency needs THREE enforcement layers; each is insufficient alone** [VERIFIED across Storybook MCP, Figma Dev Mode MCP, Fragments, design-lint]:
   - **(a) Context injection** at generation time — DESIGN.md / design-system MCP / component registry / Cursor rules.
   - **(b) Deterministic lint / PR gate** at commit time — token-compliance + raw-element detection ("47 raw `<button>`s across 12 files").
   - **(c) Visual verification** post-render.
   "Context injection alone is insufficient because text-only agents cannot self-verify rendered output."

3. **The blind-builder problem is empirically real and is the central constraint** [VERIFIED — arXiv 2604.19750, Mar 2026]: text-only agents gain ~3% on GUI tasks; adding a visual-feedback loop → +6.6pp task success, +30.3% visual-quality, +17.6pp colour accuracy. Reference screens reduce *input* ambiguity but cannot verify *output*. Website-screenshot references are brittle — agents can't infer structure from a picture.

4. **The dominant AI drift mode is "component multiplication"** — the coder builds a 2nd slightly-different card. And: **agents treat npm-imported components as "aspirational, not operational" — only LOCALLY INSPECTABLE components get reliably reused.** [COMMUNITY, consistent across sources]

5. **Division of labour the industry is settling on maps onto the layer model:** humans/strong model own tokens + brand + 1–3 key/hero screens + a11y; AI fills component permutations + layout assembly within the contract (~75% AI completion before human refinement). [COMMUNITY: sixtythirtyten; corroborated]

## Verdict on the APEX layer model

| Claim in the model | Verdict vs practice |
|---|---|
| L0–L5 taxonomy (tokens→primitives→patterns→archetypes→states→signature) | **Canonical** = DTCG token tiers + Atomic Design. Model-redundant — a capable planner knows it. **Don't codify the taxonomy.** |
| Leverage = L0–L2; screen-polishing = the anti-pattern | **Canonical** — Nathan Curtis "solve once"; the failure has a standard name, **"design drift."** Validated, but not a discovery. |
| Fork 1: anchor-screen-first, then extract | **APEX-specific (greenfield).** The named industry practice (Frost's *Interface Inventory*) extracts from *many existing* screens — a brownfield audit. Greenfield "one anchor → extract" is unvalidated but reasonable. |
| States are a separate pass | **Validated** — states are a deliberate planned pass (Material 3 state layers; empty/loading/error "most skipped"). The seam is real. |
| "Designed once, assembled many" | **Validated** as the goal — but only holds with the 3-layer enforcement above; "designed once" without enforcement is a wish. |

## The rule-of-two question — resolved (and it inverts under AI)

- **Human practice = rule of THREE** (Curtis): promote a local thing to a shared component only at 3+ uses — *avoid premature abstraction*. The cost being managed is designer effort + namespace pollution.
- **AI build inverts the cost structure.** Abstraction is now **cheap** (the model drafts a reusable component instantly); the expensive failure is **drift / component-multiplication** by a blind coder. So you promote **early (≈ rule of one)**.
- **But the threshold is the wrong lever — the real lever is enforcement.** Promote-early only helps if the promoted component is **locally inspectable + lint-enforced**; a promoted-but-unenforced component still gets multiplied. So the rule isn't "promote at N uses" — it's **"the moment a piece could recur, define it as a locally-inspectable, lint-enforced contract."** The threshold debate dissolves into the enforcement question (finding #2/#4).

## What this means for APEX (codification guidance)

APEX **already implements the industry-converging 3-layer enforcement**, which is the real story:
- (a) context injection ≈ `design-brief.md` (ADR-017) — *check it is prose-rich, not just a token table* (finding #1).
- (b) commit-time lint ≈ the just-shipped Impeccable detector + token-compliance tests + forbidden-pattern gate (ADR-022).
- (c) visual verification ≈ the planning-mode visual review gate.

**Codify-worthy residue (small):**
1. **The promotion inversion** — AI build promotes-early because drift-cost > abstraction-cost, *paired with* enforcement (genuinely novel + actionable).
2. **Local-inspectability rule** — the component contract must be in-repo/inspectable (local components / Storybook), never an imported library the blind coder can't see.
3. **Name the 3-layer enforcement as one system** (inject → lint → verify) so APEX's three existing features are understood as one defense.
4. (Lower priority) greenfield anchor-first-extract sequencing.
**Do NOT codify** the L0–L5 taxonomy or the leverage claim — canonical, model-redundant.

## Open questions (not resolved by this research)
- **Register gates the layers?** (brand/marketing = mostly bespoke L3/L5; product = L0–L2 leverage). Plausible but unevidenced here.
- **Drift magnitude** — no numeric study exists; all evidence qualitative.

## Sources
See the three facet files for full citations. Headline primary sources: DTCG 2025.10; Material 3; atomicdesign.bradfrost.com; eightshapes.com (Curtis); figma.com/blog design-systems-ai-mcp; ui.shadcn.com/docs/mcp; arXiv 2604.19750; designmd.app.
