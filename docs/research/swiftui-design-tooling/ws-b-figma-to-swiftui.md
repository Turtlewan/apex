# Research: Figma → SwiftUI Design-to-Code Pipelines

**Date:** 2026-06-12
**Confidence:** Medium — primary sources verified where fetchable; some tool pages returned 403/404 so ratings sourced from community comparison articles.
**Re-research after:** 2026-06-26 (Builder.io SwiftUI GA likely imminent; Xcode 27 + Figma MCP SwiftUI skill in early beta)
**Facet:** Figma → SwiftUI pipelines (Workstream B of the broader SwiftUI design tooling survey)

---

## Summary

As of mid-2026 there is a real but immature Figma → SwiftUI pipeline ecosystem. Every pathway converts an *existing* Figma design — none generate a design from scratch on its own (Figma AI / Figma Make can generate designs separately, but that is a distinct step). The best results (~80–90% layout completion per screen) come from a layered workflow: Figma MCP + Code Connect + an agent skill — not from any single plugin. For an imageless coder like DeepSeek, all pipelines produce text output (SwiftUI `.swift` files), so the lane is viable — but only if the design is already in Figma and is well-structured (Auto Layout, named components, mobile frames).

---

## Key Findings

### 1. Builder.io Visual Copilot — SwiftUI is BETA, not GA

- **Status:** SwiftUI listed as `(Beta)` alongside Flutter, Compose, and Email. All other 10 frameworks are GA. [VERIFIED — https://www.builder.io/c/docs/figma-to-code-visual-editor-options]
- **Output mechanism:** Three-stage pipeline: proprietary AI model (trained on 2M data points) → Mitosis open-source compiler → fine-tuned LLM refinement. Two quality tiers: "Fast" (instant, proprietary model) and "Quality" (slower, fine-tuned LLM). [VERIFIED — https://www.builder.io/blog/figma-to-swiftui]
- **Integration:** CLI workflow available (`Generate code with CLI` documented). No MCP server. The CLI is designed for integration with AI IDEs (Cursor, Windsurf). [VERIFIED — https://www.builder.io/c/docs/figma-to-code-visual-editor-options]
- **Pricing:** Free tier exists (up to 5 users); Pro starts at $19+/month per the tools comparison; "Agent Credits" sold as $25/500 on pay-as-you-go for Pro+. SwiftUI tier not broken out separately. [VERIFIED — https://www.builder.io/m/pricing; COMMUNITY — https://theswiftk.it.com/blog/figma-to-swiftui-tools-compared-2026]
- **Convert vs Generate:** Converts only — requires an existing Figma file. Does not generate designs.
- **Quality caveats:** Highly dependent on design hygiene (Auto Layout is "the single most impactful action"; translucency and overlaps degrade output). Beta status means SwiftUI output is less reliable than React. [VERIFIED — https://www.builder.io/blog/figma-to-swiftui]
- **Agent-readability:** CLI output is `.swift` text files — an imageless coder can adapt. Mitosis compilation step may produce non-idiomatic SwiftUI (more mechanical than "designcode with Claude" approach).

---

### 2. Figma MCP Server — First-party SwiftUI, but Xcode 27 beta only and output is inconsistent

- **What it emits:** `get_design_context` emits framework-specific code snippets by default in React + Tailwind. SwiftUI output requires explicit prompt override ("generate in iOS/SwiftUI"). The tool does NOT emit raw design JSON — it emits code. [VERIFIED — https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/; COMMUNITY — https://alexbobes.com/tech/figma-mcp-the-cto-guide-to-design-to-code-in-2026/]
- **SwiftUI skill for Xcode:** Figma ships a first-party "SwiftUI skill" for the Figma MCP server in **Xcode 27 beta** — this is the most native path. Requires downloading Xcode 27 beta. [VERIFIED — https://help.figma.com/hc/en-us/articles/41061095668759-Xcode-and-Figma-Set-up-the-MCP-server]
- **Quality:** "Results are improving but less consistent" for iOS compared to web frameworks. Multiple sources agree. [COMMUNITY — https://alexbobes.com/tech/figma-mcp-the-cto-guide-to-design-to-code-in-2026/; COMMUNITY — https://medium.com/@akash.ingawale12/setting-up-figma-mcp-server-in-cursor-for-ios-development-35f9231ad819]
- **Token cost — HEAVY:** `get_design_context` responses are large. A complex page can return **350,000+ tokens** in a single call, hitting MCP client limits (some clients cap at 25,000 tokens). Real-world Halodoc measurement: ~10k tokens for the Figma MCP call + ~34k for AI processing = ~44k total per screen at $0.13/screen. [COMMUNITY — https://alexbobes.com/tech/figma-mcp-the-cto-guide-to-design-to-code-in-2026/; VERIFIED — https://blogs.halodoc.io/how-we-generate-production-swiftui-from-figma-using-ai-skill-at-halodoc/]
- **Mitigation:** Break work into smaller Figma frame selections to avoid token overflow.
- **Code Connect integration:** Figma Code Connect maps Figma components to actual Swift APIs — dramatically improves output quality by ensuring the MCP emits real component calls rather than raw SwiftUI primitives. Requires upfront mapping work per component. [VERIFIED — https://help.figma.com/hc/en-us/articles/23920389749655-Code-Connect]
- **Figma Dev Mode / MCP access cost:** Dev seat required, $12/month (Professional annual) for MCP server access. [COMMUNITY — search result synthesis]
- **Chicken-and-egg:** The MCP converts only — design must exist in Figma first.
- **`generate_figma_design` tool:** One of 18 MCP tools. Described as sending "live UI for web apps" — unclear if SwiftUI path is supported here. [VERIFIED — https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/]
- **Agent-readability for DeepSeek:** Output is `.swift` source text from a tool call response — fully readable by an imageless coder. The concern is volume: 350k token responses from a single `get_design_context` call would blow DeepSeek's context. Using Code Connect + targeted frame selection keeps this manageable (~44k total).

---

### 3. Figma Plugins — Ecosystem map

| Plugin / Tool | SwiftUI Status | Quality (0–10) | Free/Paid | Converts / Generates | Notes |
|---|---|---|---|---|---|
| **Figma to Code** (bernaferrari) | GA | 5/10 | Free | Converts only | Open-source; produces absolute-positioned ZStack code; verbose and not idiomatic. [VERIFIED — https://www.figma.com/community/plugin/842128343887142055] |
| **SwiftUI Code Generator** (Figma community) | GA | ~5/10 | Free | Converts only | Basic; useful for rapid inspection not production. [VERIFIED — https://www.figma.com/community/plugin/1286775547400510368] |
| **Trace** | GA | 7/10 | Freemium | Converts only | Live preview in Xcode; well-regarded for a freemium tool. [COMMUNITY — https://theswiftk.it.com/blog/figma-to-swiftui-tools-compared-2026] |
| **Locofy Lightning** | GA | 9/10 | $15+/month | Converts only | Highest fidelity in comparisons; AI tagging system. [COMMUNITY — https://theswiftk.it.com/blog/figma-to-swiftui-tools-compared-2026] |
| **Anima** | GA | 8/10 | $31+/month | Converts only | Mixed reviews in 2026 — consistent but absolute-positioned output ("div soup" equivalent); community recommends Locofy over Anima. [COMMUNITY — https://figmaforge.io/anima-alternatives; COMMUNITY — https://theswiftk.it.com/blog/figma-to-swiftui-tools-compared-2026] |
| **Builder.io Visual Copilot** | Beta | 8/10 | $19+/month | Converts only | See finding #1. CLI integration is a plus. [VERIFIED — https://www.builder.io/c/docs/figma-to-code-visual-editor-options] |
| **Codia (Design2Code)** | GA | ~7/10 | Paid (tier unclear) | Converts only | "Intelligent Twin Engine"; Open API available; produces structural SwiftUI stacks, not drop-in production code. [VERIFIED — https://www.codia.ai/blog/figma-to-swiftui] |
| **DhiWise** | PAUSED | N/A | — | Converts only | iOS/SwiftUI support explicitly paused in 2026; company focused on Flutter/React. [VERIFIED — https://www.dhiwise.com/ios] |
| **Designcode with Claude** | GA | 8/10 | $119 one-time | Converts only | Highest reasoning quality; produces idiomatic SwiftUI patterns. Uses Claude reasoning, not a mechanical compiler. [COMMUNITY — https://theswiftk.it.com/blog/figma-to-swiftui-tools-compared-2026] |
| **Sigma** (bannzai, GitHub) | Unclear/stale | Low | Free/OSS | Converts only | Older open-source plugin; maintenance status unclear. [COMMUNITY — https://github.com/bannzai/Sigma] |

---

### 4. Chicken-and-egg: no tool generates a design — they only convert

Every tool in this survey requires a pre-existing Figma design. None generate a design from a text prompt and then export SwiftUI. The design must be created first.

**Adjacent capability — Figma AI / Figma Make:** Figma itself (not plugins) now offers:
- **First Draft:** Text prompt → Figma layout (auto layout + components). [VERIFIED — https://similarlabs.com/blog/figma-ai-review]
- **Figma Make:** Text → multi-screen prototype with navigation and interactions. [VERIFIED — https://similarlabs.com/blog/figma-ai-review]
- **Code-to-Canvas:** Paste SwiftUI/React/HTML → editable Figma component. This is the *reverse* direction — useful for round-tripping. [VERIFIED — https://peerlist.io/princy/articles/figma-ai-updates]

These are part of Figma's subscription (variable credit consumption for complex generations) — not separate products. So the full chain is possible: **Figma AI (text → design) → Figma MCP or plugin (design → SwiftUI code)** — but this is two separate tools in sequence, with a human review step between them strongly recommended.

---

### 5. Best-practice production workflow (Halodoc real-world data)

Halodoc published the most concrete production benchmark found in this research:

- **Stack:** Figma MCP + Code Connect + custom "Skill" agent file (reusable task script)
- **Prerequisites required:** Mature design system in Figma + Code Connect mappings per component
- **Output per screen:** `ScreenNameView.swift` + `ScreenNameViewModel.swift` — auto-generated
- **Completion rate:** ~80–90% on well-scoped screens
- **Token cost:** ~10k (Figma MCP) + ~34k (AI processing) = ~44k tokens per screen = $0.13/screen
- **Time savings:** 6 hours → 30–45 minutes per mid-complexity screen
- **Manual gaps remaining:** Image asset export to `.xcassets`, localization key wiring, complex screens needing a second pass, state management, navigation, accessibility
[VERIFIED — https://blogs.halodoc.io/how-we-generate-production-swiftui-from-figma-using-ai-skill-at-halodoc/]

---

## What No Tool Solves (universal gaps)

All tools surveyed share the same post-generation manual work:
1. State management (loading / error / empty states)
2. Navigation wiring
3. Networking / persistence
4. Accessibility
5. App Store compliance / platform edge cases

Tools cover ~layout only — roughly 20% of the total development surface. [COMMUNITY — https://theswiftk.it.com/blog/figma-to-swiftui-tools-compared-2026]

---

## Options Comparison Table

| Path | SwiftUI Status | Token Cost | Agent-Readable | Generates Design? | Monthly Cost | Recommended For |
|---|---|---|---|---|---|---|
| Figma MCP + Code Connect + Skill | Improving (inconsistent) | Heavy: up to 350k/call; manageable ~44k with scoping | Yes (.swift text) | No | $12/mo Dev seat | Best production results if design system exists |
| Figma MCP in Xcode 27 (SwiftUI Skill) | Beta (Xcode 27 beta only) | Likely similar to above | Yes | No | $12/mo Dev seat | Native IDE integration; too early to rely on |
| Builder.io Visual Copilot + CLI | Beta | N/A (per-generation credits) | Yes (.swift via CLI) | No | $19+/mo | CI/CD integration; SwiftUI still beta |
| Locofy Lightning | GA | N/A (SaaS) | Yes | No | $15+/mo | Highest fidelity; good for handoff speed |
| Designcode with Claude | GA | Claude API costs + $119 | Yes | No | $119 one-time + API | Most idiomatic SwiftUI output |
| Free plugins (Figma to Code, SwiftUI Generator) | GA | None | Yes (verbose) | No | Free | Rapid inspection; not production |
| Figma AI + any converter | AI generates design; converter converts | Figma credits + converter cost | Yes (downstream) | Yes (design step) | Figma subscription | Full text→design→code chain |

---

## Gaps in This Research

- Trace plugin page returned 403 — could not verify quality claims independently; relying on community comparison.
- Builder.io pricing page does not break out SwiftUI-specific tier; free vs paid boundary for SwiftUI beta unclear.
- Figma MCP `generate_figma_design` tool's SwiftUI support is undocumented — may produce web output only.
- Codia pricing not publicly listed.
- No independent SwiftUI output sample from any tool was retrievable to assess code quality directly.
- Figma Make (AI design generation) + MCP export as a complete chain has not been publicly benchmarked for SwiftUI as of this writing.

---

## Sources

- [Builder.io — Figma to SwiftUI blog](https://www.builder.io/blog/figma-to-swiftui) — VERIFIED
- [Builder.io — Visual Editor code generation options](https://www.builder.io/c/docs/figma-to-code-visual-editor-options) — VERIFIED
- [Builder.io — Pricing](https://www.builder.io/m/pricing) — VERIFIED
- [Figma Help — Xcode and Figma MCP server setup](https://help.figma.com/hc/en-us/articles/41061095668759-Xcode-and-Figma-Set-up-the-MCP-server) — VERIFIED
- [Figma Help — Guide to the Figma MCP server](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server) — VERIFIED
- [Figma Developer Docs — MCP Server Tools and Prompts](https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/) — VERIFIED
- [Figma Help — Code Connect](https://help.figma.com/hc/en-us/articles/23920389749655-Code-Connect) — VERIFIED
- [Halodoc Engineering Blog — Production SwiftUI from Figma](https://blogs.halodoc.io/how-we-generate-production-swiftui-from-figma-using-ai-skill-at-halodoc/) — VERIFIED
- [alexbobes.com — Figma MCP CTO Guide 2026](https://alexbobes.com/tech/figma-mcp-the-cto-guide-to-design-to-code-in-2026/) — COMMUNITY
- [theswiftk.it.com — Figma to SwiftUI 7 Tools Compared 2026](https://theswiftk.it.com/blog/figma-to-swiftui-tools-compared-2026) — COMMUNITY
- [Codia — Figma to SwiftUI](https://www.codia.ai/blog/figma-to-swiftui) — VERIFIED (partial)
- [SimilarLabs — Figma AI Review 2026](https://similarlabs.com/blog/figma-ai-review) — VERIFIED
- [Peerlist — What Is Figma AI (Figma Make, Code-to-Canvas)](https://peerlist.io/princy/articles/figma-ai-updates) — COMMUNITY
- [DhiWise iOS](https://www.dhiwise.com/ios) — VERIFIED (iOS paused)
- [Medium — Figma MCP in Cursor for iOS](https://medium.com/@akash.ingawale12/setting-up-figma-mcp-server-in-cursor-for-ios-development-35f9231ad819) — COMMUNITY
- [Figma Community — Figma to Code plugin](https://www.figma.com/community/plugin/842128343887142055/figma-to-code-html-tailwind-flutter-swiftui) — VERIFIED (page gated)
- [Figma Community — SwiftUI Code Generator plugin](https://www.figma.com/community/plugin/1286775547400510368/swiftui-code-generator) — VERIFIED (page gated)
