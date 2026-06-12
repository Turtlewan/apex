# Research synthesis: SwiftUI design / design-to-code tooling — is there a "Stitch for SwiftUI"?

**Date:** 2026-06-12
**Confidence:** MEDIUM-HIGH (primary sources on the core facts; several tools are weeks-old / beta, so maturity claims are softer)
**Re-research after:** 2026-06-26 (AI/LLM tooling 14-day clock; Xcode 27 is beta, Bitrig/iSwift are new, Stitch is in Labs)
**Source files:** `ws-a-prompt-to-design.md` · `ws-b-figma-to-swiftui.md` · `ws-c-apple-native-and-llm-direct.md` (3 parallel gather agents, 2026-06-12)
**Decision at stake:** whether/how to add a SwiftUI design lane to APEX, parallel to the web Stitch lane (`apex-ui-ux-design` v1.7.0).

---

## Summary

Yes — a "Stitch for SwiftUI" now exists: **Bitrig** (and **iSwift.dev**) take a text prompt and
return **real SwiftUI source code**, which is strictly better than the web-Stitch lane for native
work because it skips the web→SwiftUI translation tax. Neither exposes an API/MCP, so they keep the
**same human-at-the-prompt division of labour** APEX already uses for the web lane. Separately and
independently, the single highest-confidence win is free: **Xcode 27 (WWDC, 2026-06-08) ships seven
Apple-authored agent skills as exportable Markdown** — `swiftui-specialist` + `swiftui-whats-new-27`
— that can be loaded as DeepSeek context to raise idiomatic-SwiftUI output regardless of the design
tool. Apple ships **no** first-party design-to-code/prompt-to-UI tool. Figma→SwiftUI works but is the
heaviest path (Figma seat, Code Connect, 350k-token blowup risk, 20–50% cleanup, Xcode-27-beta-gated)
— a fallback for when designs already live in Figma, not the default.

## Key findings (cross-workstream)

- **Google Stitch is still web-only.** Official CLI (`davideast/stitch-mcp`) exports HTML/CSS→Astro;
  SwiftUI appears only on third-party aggregators + a "2026 expected" roadmap line — unconfirmed.
  [VERIFIED — github.com/davideast/stitch-mcp · COMMUNITY — almcorp.com]
- **Bitrig = closest prompt→SwiftUI fit.** Ex-Apple SwiftUI engineers, YC-backed, Mac app (Mar 2026),
  Claude-Sonnet-powered: prompt → real `.swift` → simulator → export full Xcode project. Free tier
  (5 daily credits) / Plus ~$19.99/mo. **No API/MCP — human at the prompt.** [VERIFIED — 9to5Mac, bitrig.com]
- **iSwift.dev** — browser equivalent, prompt → SwiftUI Xcode project. Free / Pro ~$20/mo. No API/MCP;
  lower recognition. [COMMUNITY — Swift Forums, iswift.dev]
- **DetailsPro** — best pure SwiftUI *design* tool, real 1:1 `.swift` export, but **zero AI/prompt**
  (human designs visually). $5.99/mo or $129 once. [VERIFIED — detailspro.app]
- **Xcode 27 ships 7 Apple-authored agent skills as plain Markdown** (`swiftui-specialist`,
  `swiftui-whats-new-27` [Liquid Glass 2 + APIs with no training data], uikit-modernization,
  test-modernizer, security-audit, c-bounds-safety, device-interaction). Exportable → loadable as
  coding-model context. [VERIFIED — Apple Newsroom, WWDC session 258]
- **Xcode 26.3 (Feb 2026)** already does agentic coding via the Claude Agent SDK and **captures Xcode
  Previews to see and iterate** on SwiftUI — but only helps if the *coder* is vision-capable, which the
  APEX split prevents. [VERIFIED — Apple Newsroom, Anthropic blog]
- **No Apple first-party design-to-code / prompt-to-UI / image-to-SwiftUI tool** was announced.
  [VERIFIED — cross-checked]
- **Figma→SwiftUI:** all tools are *converters not generators*; output *is* agent-readable `.swift`
  (blind-coder concern moot); Figma MCP can emit **350k+ tokens/screen** unscoped (~44k scoped w/ Code
  Connect, ~$0.13); Builder.io Visual Copilot SwiftUI = **beta**; most-native path gated on **Xcode 27
  beta**; **20–50% cleanup always** (no tool infers `@State`/`@Binding`/`@Observable`). [VERIFIED —
  Halodoc eng blog, builder.io docs · COMMUNITY — alexbobes.com]
- **Apple UICoder** (2025 research, ~1M synthetic SwiftUI samples) — unreleased; signals Apple intent.
  [COMMUNITY]

## Options comparison

| Path | Output | Generates or converts? | Fits image-less coder? | Cost | Maturity | Best for |
|------|--------|------------------------|------------------------|------|----------|----------|
| **Bitrig** (prompt→SwiftUI) | real `.swift` + Xcode project | generates | ✅ native text, no translation | free / ~$20 mo | new (Mar 2026), no API/MCP | **the SwiftUI design lane** |
| **iSwift.dev** | SwiftUI Xcode project | generates | ✅ | free / ~$20 mo | newer, less known | Bitrig alternative |
| **DetailsPro** | 1:1 SwiftUI `.swift` | neither (manual visual) | ✅ | $5.99 mo / $129 | mature, no AI | hand-crafting a reference |
| **Web Stitch + translate** (current lane) | React + DESIGN.md | generates (web) | ⚠️ needs web→SwiftUI translation | free | shipping | fast *visual* ideation only |
| **Figma→SwiftUI** (Visual Copilot / MCP+Code Connect) | `.swift` (20–50% cleanup) | converts only | ✅ but token-heavy | $12 mo + cleanup | SwiftUI beta / Xcode-27-gated | when designs already in Figma |
| **Apple first-party** | — | — | — | — | **does not exist** | — |
| **Xcode 27 Apple Markdown skills** | context, not designs | n/a (floor-raiser) | ✅ load as DeepSeek context | free | beta (gated on access) | **idiomatic-SwiftUI floor, do regardless** |

## Recommended approach

**Three moves, independent of each other:**

1. **(Do regardless, highest confidence, free) Absorb Apple's Xcode 27 SwiftUI agent skills.** Load
   `swiftui-specialist` + `swiftui-whats-new-27` as coding-mode context for SwiftUI builds (reference
   them from `apex-swift`, or bind them in the SwiftUI `stack_skills` recipe). They directly raise the
   blind coder's idiomatic-SwiftUI floor and cover post-training-cutoff APIs (Liquid Glass 2). Pure
   Markdown = exactly APEX's medium. *Gated on Xcode 27 beta access to obtain the files.*

2. **(The SwiftUI design lane) Mirror the web Stitch lane with Bitrig (primary) / iSwift.dev (alt).**
   Same opt-in, human-at-the-prompt shape as the web lane: planning authors the prompt from the brief
   → user runs Bitrig → it returns **real SwiftUI source** → fold tokens/structure into
   `design-brief.md` + keep the source as a concrete reference the coder adapts. Strictly better than
   Stitch-for-SwiftUI: output is already native, so **no web→SwiftUI translation tax**.

3. **(Native review gate) Add a planning-side Xcode-Preview-capture review step** — the native analogue
   of the web screenshot gate: after DeepSeek builds, capture the Xcode Preview, Claude scores it
   against the brief, findings → fix-spec. *Mac-gated.*

**Keep Figma→SwiftUI as a documented fallback only** (designs-already-in-Figma case); not the default —
cost + Code Connect + token blowup + 20–50% cleanup + Xcode-27-beta gating make it the heaviest path.

## Assumptions / gaps

- Bitrig/iSwift credit tiers and output quality not hands-on validated; both new, no API/MCP (human-driven).
- Xcode 27 is **beta** — obtaining the Apple Markdown skill files needs beta access; the Figma-plugin-for-Xcode-27 design-token bridge details are TBC.
- All Mac-gated items (Bitrig is Mac-only; Preview-capture gate; Xcode 27) are **unvalidatable on the Windows planning box**.
- Stitch SwiftUI claims explicitly distrusted until an official source confirms.

## Sources
- ws-a/b/c files in this directory (full per-claim citations there).
- Apple Newsroom + developer.apple.com (WWDC 2026 / Xcode 27, session 258); Anthropic blog (Xcode 26.3 Agent SDK).
- 9to5Mac, MacRumors (WWDC coverage); bitrig.com; iswift.dev; detailspro.app; github.com/davideast/stitch-mcp.
- Halodoc engineering blog (Figma MCP + Code Connect SwiftUI benchmark); builder.io docs.
