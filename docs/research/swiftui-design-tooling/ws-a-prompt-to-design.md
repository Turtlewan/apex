# Research: Prompt-to-Design / AI-Native UI Design Tools — SwiftUI & Native iOS Output

**Facet:** WS-A — Prompt-to-design tools that output SwiftUI or native iOS designs/code
**Date:** 2026-06-12
**Confidence:** Medium (primary sources partially inaccessible; some claims from third-party summaries only)
**Re-research after:** 2026-06-26 (Google Stitch Labs status volatile; Xcode 27 is beta)
**Researcher:** apex-research subagent

---

## Summary

A genuine "Stitch for SwiftUI" now exists in multiple forms — the category has arrived in 2026.
The clearest fit for an image-less coding agent is **Bitrig** (prompt → real SwiftUI text → Xcode export)
and **iSwift.dev** (prompt → full SwiftUI Xcode project). Google Stitch's SwiftUI export is unconfirmed
at the official product level — primary evidence is web-only HTML/CSS/React output with SwiftUI on the
roadmap, and third-party MCP wrappers providing a partial bridge. DetailsPro and Judo are strong
visual-design tools but lack AI/prompt features entirely.

---

## Key Findings

### 1. Google Stitch — Web-only at core; SwiftUI unconfirmed at primary layer [PARTIALLY VERIFIED]

- Launched Google I/O 2025 (Google Labs experiment); Stitch 2.0 March 2026 added 5-screen canvas,
  interactive prototyping, voice canvas.
- **Primary source (developers.googleblog.com) confirms:** generates "clean, functional front-end code"
  and exports via HTML/CSS, MCP server, SDK, AI Studio links, Antigravity.
  [VERIFIED — https://developers.googleblog.com/stitch-a-new-way-to-design-uis/]
- **Official `davideast/stitch-mcp` GitHub** shows web-only export: HTML/CSS → Astro routing; no SwiftUI.
  [VERIFIED — https://github.com/davideast/stitch-mcp]
- **Third-party summary sites** claim "seven frameworks including SwiftUI" and that Gemini models are
  fine-tuned per framework. This appears to be anticipatory/community-sourced.
  [COMMUNITY — https://www.aipedia.wiki/tools/google-stitch/; https://almcorp.com/blog/...]
  The roadmap item "Expanded Code Export" lists SwiftUI as expected but not yet delivered.
  [COMMUNITY — almcorp.com guide]
- **Third-party MCP wrappers** (e.g. `oogleyskr/stitch-mcp-server`, `gabelul/stitch-kit`) add
  React/TSX, and some claim SwiftUI via an AI conversion layer — but these are community tools, not
  Google-shipped.
  [COMMUNITY — https://github.com/oogleyskr/stitch-mcp-server]
- **Agent-readability verdict:** The official tool produces HTML/CSS + React text — readable by a
  coding agent for web. SwiftUI text output is NOT confirmed from Google directly. iOS HIG coverage
  described as "thinner than Android" in independent review.
  [COMMUNITY — https://www.aipedia.wiki/tools/google-stitch/]
- **Pricing:** Free while in Google Labs; no durable SLA or paid tier announced.
- **Bottom line:** Still web-only in official output. SwiftUI is roadmap, not shipped. Community
  wrappers exist but add fragility.

---

### 2. DetailsPro — Best-in-class SwiftUI design tool; zero AI/prompt features [VERIFIED]

- Mac/iPad/iPhone/Vision Pro universal app. Visual no-code designer using real SwiftUI components
  (VStack, HStack, SF Symbols, shapes, modifiers). True 1:1 SwiftUI fidelity — not a mock.
  [VERIFIED — https://detailspro.app/]
- **SwiftUI export:** Yes — "Export to Xcode as Swift files" produces actual `.swift` text files
  importable into Xcode. This IS agent-readable text.
  [VERIFIED — https://apps.apple.com/us/app/detailspro/id1524366536]
- **AI/prompt features:** None. No prompt input, no generation, no LLM integration.
  [VERIFIED — product page makes zero mention of AI]
- **Pricing:** Free with unlimited files; Premium Monthly $5.99 / Yearly $59.99 / One-time $129.
  [VERIFIED — App Store listing]
- **No API or MCP server.** Design→code requires manual human interaction.
- **Agent-readability verdict:** The output (exported Swift files) is perfectly agent-readable text —
  but a human must create the design first. It cannot take a text prompt.
- **Maturity:** Established product, actively maintained, highest SwiftUI fidelity of any design tool.

---

### 3. Judo — Visual SwiftUI canvas; no AI; low recent activity [COMMUNITY]

- No-code visual canvas for SwiftUI design. Generates SwiftUI under the hood; can export an Xcode
  project with one click.
  [VERIFIED — https://developer.judo.app/]
- **AI/prompt features:** None found. Search results show no AI features in any 2025–2026 coverage.
  [COMMUNITY — multiple review aggregators]
- **Activity concerns:** G2 profile reportedly "inactive / not managed for over a year" but pricing
  page still live and trial still available.
  [COMMUNITY — G2.com review data; https://www.judo.app/pricing]
- **Agent-readability:** Exports an Xcode project (SwiftUI text). Agent-readable if you have
  the Judo file, but no programmatic/prompt entry point.
- **Pricing:** Free 7-day trial; paid tiers unclear.
  [ASSUMED — no verified current pricing found]
- **Bottom line:** Mature enough to use today; likely lower development velocity than competitors.
  No prompt/AI story.

---

### 4. Bitrig — Strongest "prompt → SwiftUI code" fit for an image-less agent [VERIFIED]

- Built by ex-Apple SwiftUI engineers; YC-backed (2025). Mac app (macOS 15+ Apple Silicon)
  released March 2026; iOS app released Oct 2025.
  [VERIFIED — https://9to5mac.com/2026/03/06/ai-powered-coding-platform-bitrig-gets-a-mac-app-for-building-iphone-apps/]
- **Workflow:** Describe your app in natural language → real Swift/SwiftUI code generated → integrated
  iPhone simulator preview → export full Xcode project.
  [VERIFIED — 9to5Mac primary reporting]
- **Code output:** Actual editable Swift/SwiftUI source code — not pseudo-code, not screenshots.
  "The same code you'd write by hand." Export as standalone Xcode project.
  [VERIFIED — https://bitrig.com/]
- **Agent-readability:** High. Outputs real `.swift` text files in an Xcode project. A blind coding
  agent can read, edit, and build from this output directly.
- **Powered by:** Claude Sonnet 4.0 (confirmed).
  [COMMUNITY — https://phandroid.com/2025/10/02/...]
- **Pricing:** Free tier (5 daily credits); Plus plans at ~$19.99/month (200–1,600 monthly credits).
  [COMMUNITY — 9to5Mac, multiple aggregators; exact 2026 tier pricing not primary-verified]
- **No public API or MCP server** found in any source reviewed.
- **Maturity:** Early-stage but actively shipping (Mac app added March 2026 after iOS launch).

---

### 5. iSwift.dev — Web-based "build a full SwiftUI app from one prompt" [COMMUNITY]

- Browser-based AI app builder targeting SwiftUI for iOS, iPadOS, watchOS, macOS.
  [COMMUNITY — https://www.iswift.dev/]
- **Workflow:** Natural language prompt → SwiftUI code with live browser preview → full Xcode project
  download.
  [COMMUNITY — Product Hunt, Swift Forums announcements]
- **Code output:** Full Xcode project export (.swift files). Multiple sources confirm this is actual
  source code, not just screenshots.
  [COMMUNITY — https://forums.swift.org/t/swiftui-apps-with-ai-export-as-a-xcode-project/79012]
- **Agent-readability:** High (same as Bitrig — exports text SwiftUI). No API/MCP server confirmed.
- **Pricing:** Free tier; Pro from $20/month.
  [COMMUNITY — iswift.dev/pricing page; no primary fetch succeeded]
- **Maturity:** Announced "Build iOS apps with ONE prompt" feature May 6, 2026 — actively shipping.
  Lower brand recognition than Bitrig.

---

### 6. Xcode 27 Agentic Coding (WWDC 2026) — IDE-level SwiftUI generation [VERIFIED]

- Announced WWDC June 2026. Claude (Anthropic), Gemini, and GPT agents built natively into Xcode 27.
  [VERIFIED — https://www.macrumors.com/2026/06/09/apple-outlines-major-ai-and-developer-tool-updates/]
- Agents can: write code, run tests, interact with Device Hub (simulator), inspect Figma designs
  via plugin, and generate SwiftUI views matching mockups.
  [COMMUNITY — https://www.aimadetools.com/blog/xcode-27-agentic-coding-claude-gemini-gpt/]
- Self-validation loop: agent writes SwiftUI → launches in simulator → checks visual output → iterates.
  [COMMUNITY — multiple WWDC coverage sources]
- **Agent-readability:** Native IDE context — code lives in the project tree, fully text-accessible.
- **Relevance to APEX:** This is the "agent writes SwiftUI" paradigm built into Apple's own IDE — but
  it's an Xcode-resident workflow, not a standalone "prompt → SwiftUI" pipeline external tools can
  call. No public MCP server from Apple.
- **Status:** Beta (Xcode 27 beta as of June 2026).

---

### 7. Trace AI — Discontinued; historical note [COMMUNITY]

- Browser-based SwiftUI component generator from prompts. Exported Swift files and Xcode projects.
  Community component library.
  [COMMUNITY — https://www.toolmage.com/en/tool/trace/]
- **Status:** "No longer being maintained by the team" per at least one source.
  [COMMUNITY — Toolify.ai alternatives page]
- Monthly traffic ~2.2K. Mentioned in passing; not a viable option.

---

### 8. Compot — SwiftUI component library + AI coding assistant [VERIFIED]

- Free iOS/Mac App Store app. Library of 100+ pre-built vanilla SwiftUI components + in-app AI
  coding assistant (Q&A, debug, suggestions).
  [VERIFIED — https://apps.apple.com/us/app/compot-swiftui-with-ai/id6471916279]
- **Prompt feature:** Yes — "generate SwiftUI code from images or text." But this is a component-level
  helper, not a full-app generator.
- **Code output:** Vanilla SwiftUI (no package dependencies), copy-paste ready.
  [VERIFIED — App Store description]
- **Pricing:** Free.
- **Agent-readability:** High for components; limited for full-app scenarios. No API/MCP.

---

## Options Comparison Table

| Tool | Prompt→SwiftUI? | Output type | Agent-readable (text)? | MCP/API? | Pricing | Maturity | Status |
|---|---|---|---|---|---|---|---|
| **Bitrig** | Yes (full app) | Xcode project (.swift) | Yes | None found | Free / ~$20/mo | Early but shipping | Active |
| **iSwift.dev** | Yes (full app) | Xcode project (.swift) | Yes | None found | Free / $20/mo | Newer | Active |
| **DetailsPro** | No — visual only | .swift files (export) | Yes (post-design) | None | $6/mo or $129 | Mature | Active |
| **Judo** | No — visual only | Xcode project | Yes (post-design) | None | Unclear | Declining? | Uncertain |
| **Google Stitch** | Yes (web UI) | HTML/CSS/React (primary) | Partial (web only) | Yes (MCP, web) | Free (Labs) | Labs/volatile | SwiftUI on roadmap |
| **Compot** | Yes (component) | .swift snippets | Yes | None | Free | Stable | Active |
| **Trace AI** | Yes (was) | .swift / Xcode project | Yes | None | Unknown | Abandoned | Inactive |
| **Xcode 27 agents** | Yes (in IDE) | Native Xcode project | Yes | None (external) | Free (Xcode) | Beta | Active (WWDC 2026) |

---

## Gaps & Open Questions

1. **Bitrig API/MCP:** No public API or MCP server found. An image-less coding agent (DeepSeek) cannot
   call Bitrig headlessly today — a human must prompt it, then hand the exported Xcode project to the agent.
2. **iSwift.dev API/MCP:** Same gap — no programmatic entry point confirmed. Pricing page was
   inaccessible during research; $20/mo figure is community-sourced.
3. **Google Stitch SwiftUI maturity:** Third-party aggregators claim SwiftUI in the export menu, but
   official GitHub MCP (davideast/stitch-mcp) shows Astro/HTML only. Needs direct product test to
   confirm current state. Official blog says "front-end code" without naming SwiftUI.
4. **DetailsPro AI roadmap:** No AI features today; none announced. Worth monitoring — it has the
   best SwiftUI fidelity of any tool and could add an AI layer.
5. **Judo health:** Low signal on whether actively maintained. Should be verified before committing
   to it.

---

## Sources

| Tag | Source | URL |
|---|---|---|
| VERIFIED | Google Developers Blog — Stitch launch | https://developers.googleblog.com/stitch-a-new-way-to-design-uis/ |
| VERIFIED | Google Stitch official | https://stitch.withgoogle.com/ |
| VERIFIED | DetailsPro product site | https://detailspro.app/ |
| VERIFIED | DetailsPro App Store | https://apps.apple.com/us/app/detailspro/id1524366536 |
| VERIFIED | Judo developer docs | https://developer.judo.app/ |
| VERIFIED | Bitrig product site | https://bitrig.com/ |
| VERIFIED | Compot App Store | https://apps.apple.com/us/app/compot-swiftui-with-ai/id6471916279 |
| VERIFIED | MacRumors — WWDC 2026 AI/dev tools | https://www.macrumors.com/2026/06/09/apple-outlines-major-ai-and-developer-tool-updates/ |
| VERIFIED | 9to5Mac — Bitrig Mac app | https://9to5mac.com/2026/03/06/ai-powered-coding-platform-bitrig-gets-a-mac-app-for-building-iphone-apps/ |
| VERIFIED | GitHub — davideast/stitch-mcp | https://github.com/davideast/stitch-mcp |
| COMMUNITY | aipedia.wiki — Stitch review | https://www.aipedia.wiki/tools/google-stitch/ |
| COMMUNITY | ALM Corp — Stitch 2026 guide | https://almcorp.com/blog/google-stitch-complete-guide-ai-ui-design-tool-2026/ |
| COMMUNITY | GitHub — oogleyskr/stitch-mcp-server | https://github.com/oogleyskr/stitch-mcp-server |
| COMMUNITY | Pasquale Pillitteri — Stitch MCP/Claude | https://pasqualepillitteri.it/en/news/647/google-stitch-mcp-export-claude-code-design-to-code |
| COMMUNITY | iSwift.dev | https://www.iswift.dev/ |
| COMMUNITY | iSwift.dev — best AI for Xcode 2026 | https://www.iswift.dev/comparisons/best-ai-for-xcode-2026 |
| COMMUNITY | Swift Forums — iSwift.dev announcement | https://forums.swift.org/t/swiftui-apps-with-ai-export-as-a-xcode-project/79012 |
| COMMUNITY | Toolmage — Trace AI | https://www.toolmage.com/en/tool/trace/ |
| COMMUNITY | YC — Bitrig | https://www.ycombinator.com/companies/bitrig |
| COMMUNITY | aimadetools — Xcode 27 agentic | https://www.aimadetools.com/blog/xcode-27-agentic-coding-claude-gemini-gpt/ |
| COMMUNITY | 9to5Mac — Xcode 27 Gemini | https://9to5mac.com/2026/06/10/xcode-27-expands-agentic-coding-toolset-with-gemini-integration/ |
| COMMUNITY | Phandroid — Bitrig iOS launch | https://phandroid.com/2025/10/02/ex-apple-engineers-launch-bitrig-vibe-coding-app-builds-swiftui-apps-on-your-iphone/ |
