# Research: WS-2 — External Design-Tool Integrations

**Date:** 2026-06-12
**Confidence:** Medium-High. Primary sources fetched from official docs and current blog posts. Token overhead estimates are measured community reports (not vendor-official). A few pricing datapoints from third-party analysis sites where official pages blocked fetching.

---

## Summary

The owner already has the Canva MCP connector wired in. The verdict is: **the Canva connector is the wrong tool for app UI design** — it is marketing/brand-asset tooling, not UI component tooling. Figma MCP is the right architectural answer but requires a paid Dev seat and (critically) requires designs to already exist in Figma, creating a chicken-and-egg problem for a solo dev without a designer. The highest-value integrations for this pipeline are: **Subframe MCP** (design-to-React-code, Claude Code integration shipped, text output that DeepSeek can consume) and **Google Stitch** (free, prompt-to-React export, no lock-in). Playwright MCP is already present but the CLI mode is 4x more token-efficient; the Playwright MCP should be kept for planning-side visual verification only. Mobbin MCP is a noteworthy new entrant for pattern-grounded design but requires a vision model to get value from.

---

## Key Findings

### 1. Canva MCP — What It Actually Does

The Canva harness has **two distinct MCP surfaces** that must be distinguished:

**A. Canva Connect MCP** (the "Create with Canva" MCP the owner already has wired in) — exposes 34 tools across 9 categories: Designs (10 tools), Editing Transactions (5 tools), Folders (4 tools), Comments (4 tools), Assets (2 tools), Autofill (2 tools), Brand Templates (2 tools), Design Imports (1 tool), Exports (1 tool), Resizes (1 tool). [VERIFIED — https://www.canva.dev/docs/mcp/tools/]

**B. Canva Dev MCP** — a separate, developer-tools-focused server for people *building Canva Apps* (plugins/integrations inside Canva's platform). It helps generate Canva App SDK code, migrate UI to App UI Kit, run design reviews against Canva's app guidelines. [VERIFIED — https://www.canva.dev/docs/apps/mcp-server/]

**Critical context-fit assessment:** The Canva Connect MCP (what is wired in) is optimised for *creating branded marketing content* — presentations, social posts, posters, PDFs — using Canva's template and brand-kit infrastructure. It can generate and export designs, but the design paradigm is Canva's template/element model, not app-screen/component architecture. When Canva's MCP generates "designs" it produces Canva documents (exported as PNG/PDF/PPTX), not React components, Figma frames, or design tokens. [VERIFIED — https://www.canva.dev/docs/mcp/] [COMMUNITY — https://a2a-mcp.org/entry/canva-mcp-server]

**Canva's own use-case framing:** the May 2026 launch of the Canva MCP for ChatGPT/Codex explicitly targets "on-brand visuals" and "campaign social posts or presentation slides" — not app screens. [VERIFIED — https://www.canva.com/newsroom/news/deep-research-integration-mcp-server/]

**Plan gate:** Core tools (generate, edit, search, export, comments, assets) on all plans. Resize on Pro+. Autofill/brand templates on Enterprise. [VERIFIED — https://www.canva.dev/docs/mcp/]

**Token overhead:** 34 tools × ~300–500 tokens/tool schema = **~10,000–17,000 tokens of schema overhead per session**. [ASSUMED based on per-tool overhead reported at https://docs.bswen.com/blog/2026-04-24-mcp-token-overhead/ — Canva-specific measurement not found]

**Verdict for app-dev pipeline:** The Canva connector burns significant context budget for capabilities that are not relevant to building app screens. For a solo dev building web/native apps, the marketing-asset tools are rarely needed. The 34-tool schema weight is always loaded whether used or not.

---

### 2. Figma Dev Mode MCP Server — 2026 State

**Tools exposed (14 total as of Feb 2026):** [VERIFIED — https://alexbobes.com/tech/figma-mcp-the-cto-guide-to-design-to-code-in-2026/]
- `get_design_context` — structured React + Tailwind representation of a selected frame, layer hierarchy, color/typography/spacing values, Auto Layout settings, component variants, design variables/tokens, text content, shadows [VERIFIED — https://www.figma.com/blog/introducing-figma-mcp-server/]
- `get_variable_defs` — extracts design token variables with optional code syntax mappings (e.g. returns `var(--color-bg-primary)` if Code Connect configured) [VERIFIED — https://www.figma.com/blog/introducing-figma-mcp-server/]
- `get_metadata` — high-level node mapping
- `get_screenshot` — visual reference image of a node
- `get_code_connect_map` — component mapping from Figma node to actual codebase component via Code Connect
- `generate_figma_design` — reverse: code-to-Figma (Claude Code only)
- Additional tools for FigJam, Make file resources, and variable/component creation [VERIFIED — https://help.figma.com/hc/en-us/articles/32132100833559]

**Plan gates:** Dev or Full seat on any paid plan required for MCP server access (Professional Full seat = $16/month billed annually). Starter (free) plan: limited to 6 MCP tool calls/month — effectively unusable. [VERIFIED — https://www.figma.com/pricing/ and https://github.com/figma/mcp-server-guide/blob/main/README.md]

**Token overhead:** The Figma MCP returns design context per-call, not at schema load. Schema overhead is modest (~14 tools × ~500 tokens = ~7,000 tokens). However, the design context payloads are large: single card component ~161,900 tokens, full homepage ~433,600 tokens, complex multi-page apps 1M+ tokens. [VERIFIED — https://alexbobes.com/tech/figma-mcp-the-cto-guide-to-design-to-code-in-2026/]

**Code Connect requirement:** Code Connect is a one-time setup that maps Figma components to actual codebase components, enabling MCP to return real code snippets instead of AI-approximated code. Without Code Connect configured, get_design_context returns generic React/Tailwind approximations. [VERIFIED — https://help.figma.com/hc/en-us/articles/23920389749655-Code-Connect]

**The chicken-and-egg problem for solo devs without a designer:** Figma MCP assumes designs already exist in Figma. The value proposition is design-to-code, not blank-page design. The official guide explicitly assumes a "mature design system in place." A solo dev starting from scratch would need to design in Figma first (30-60min per screen to structure properly with Auto Layout, correct naming, etc.) before any MCP value is extracted. Without proper Auto Layout, the AI agent falls back to absolute positioning. [VERIFIED — https://alexbobes.com/tech/figma-mcp-the-cto-guide-to-design-to-code-in-2026/]

**Figma Make** (prompt-to-Figma): generates Figma frames from text prompts, accessible with Professional full seat (3,000 AI credits/month). A complex prompt consumes 60–340 credits. Designed for early-stage exploration, not final deliverables. [VERIFIED — https://mantlr.com/blog/figma-make-pricing-2026] [VERIFIED — https://www.banani.co/blog/figma-pricing-and-credits]

**Verdict for app-dev pipeline:** High value IF designs already live in Figma. The flywheel requires investment in structured Figma files first, then MCP pays back. For a solo dev starting fresh with no Figma library, the setup cost is substantial. The existing `apex-figma` skill already covers this integration path. Figma MCP for visual verification (get_screenshot → planning-side Claude for review) is practical but the per-call token cost is high.

---

### 3. AI UI-Generation Tools as Design-Ideation Layer

#### v0 by Vercel

Prompt-to-React/Next.js UI generation. As of 2026, uses Claude 3.7 Sonnet as backend. Exports standard React/Next.js code (no lock-in). February 2026 update added VS Code-style editor, Git integration, DB connectivity, and agentic workflows. [VERIFIED — https://weavai.app/blog/en/2026/04/25/v0-by-vercel-2026-ai-ui-generator-review-pricing/]

An unofficial `v0-mcp` server (community, not Vercel official) wraps v0 with 4 tools: `v0_generate_ui` (text-to-component), `v0_generate_from_image` (design-to-code), `v0_chat_complete` (iteration), `v0_setup_check`. Requires a v0 API key. [VERIFIED — https://github.com/hellolucky/v0-mcp]

**Pipeline integration:** v0 is a *parallel first-draft* tool — use it for initial screen generation by prompting from a planning-side Claude session, then iterate with Claude Code from the exported codebase. The MCP wrapper makes it callable from within a Claude session, but the unofficial community origin is a risk. [COMMUNITY — https://github.com/hellolucky/v0-mcp]

**Pricing:** Free tier with limited generations; Pro/Team at ~$20/month; pay-as-you-go API credits for MCP use. [ASSUMED — pricing page not fetched; based on review sites]

#### Google Stitch

Free (Google Labs). As of March 2026 (Stitch 2.0): multi-screen generation, infinite canvas, voice input, design system imports. Exports React code, DESIGN.md (agent-friendly markdown format documenting design decisions), interactive prototypes, and ZIP downloads. Also exports to Figma. Has an MCP server for IDE integration and an SDK. [VERIFIED — https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-ai-ui-design/] [VERIFIED — https://www.nxcode.io/resources/news/google-stitch-pricing-plans-complete-guide-2026]

**Current limits:** 350 standard generations/month + 200 experimental generations/month (all free). Paid plans expected Q4 2026. [VERIFIED — https://www.nxcode.io/resources/news/google-stitch-pricing-plans-complete-guide-2026]

**Critical fit:** The DESIGN.md export is particularly relevant — it is text output that an image-less model (DeepSeek) can read directly. Stitch generates React components that can feed the build pipeline without any screenshot step. The MCP server means it could be called planning-side. [VERIFIED — https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-ai-ui-design/]

**Limitation:** Web-only (no iOS/Android native design), still in Google Labs (may deprecate or gate), not battle-tested at production quality.

#### Subframe

AI-native design tool with Figma-like visual canvas that outputs clean React + Tailwind + Radix UI code deterministically (not AI-approximated — the code mirrors the design 1:1). MCP integration with Claude Code and Cursor shipped (2025). [VERIFIED — https://www.subframe.com/] [VERIFIED — https://docs.subframe.com/guides/mcp-server]

**MCP tools (22 tools across 8 categories):** Discovery (list_projects, generate_auth_token, get_project_info), Pages (list_pages, get_page_info, design_page, edit_page, delete_page), Components (5 tools), Snippets (4 tools), Flows (3 tools), Design Documents (write_design_document), Theme (get_theme, edit_theme), Async Jobs (wait_for_jobs). [VERIFIED — https://docs.subframe.com/guides/mcp-server]

**What the MCP returns:** React/Tailwind code (get_page_info, get_component_info return actual component code), design variations, theme tokens. Text output — **DeepSeek-consumable**. [VERIFIED — https://docs.subframe.com/guides/mcp-server]

**Pricing:** Free (1 project, 10 pages, 2 prototypes, limited AI); Pro at $29/editor/month (unlimited projects, pages, full AI). [VERIFIED — https://www.subframe.com/]

**Agent skills:** Subframe ships Claude Code agent skills alongside the MCP, providing guided workflows that teach the agent how to best use the MCP tools. [VERIFIED — https://docs.subframe.com/guides/mcp-server]

**Limitations:** React-only (no Vue/Svelte). Limited design exploration AI (not a blank-page ideation tool). Learning curve. [COMMUNITY — https://www.banani.co/blog/subframe-ai-review]

#### Magic Patterns

Screenshot-to-React/Tailwind (and text-to-UI). Takes a screenshot or image and generates React + Tailwind + Shadcn components. No MCP — export is manual copy-paste or GitHub sync. [VERIFIED — https://tooldirectory.ai/tools/magic-patterns]

**Pricing:** Free (limited), Hobby $19/month (unlimited generations), Pro $75/month (team + custom design systems). [VERIFIED — https://aiproductivity.ai/pricing/magic-patterns/]

**Pipeline fit:** Screenshot → Magic Patterns → React code → paste into codebase. Useful for converting a rough screenshot or wireframe to a code starting point. No direct pipeline integration.

#### Mobbin MCP (May 2026 launch)

621,500+ real app screens from shipped products searchable by AI agents (Claude, Cursor, Lovable). Returns visual design references — screenshots of real app flows. [VERIFIED — https://markets.financialcontent.com/wral/article/bizwire-2026-5-13-mobbin-launches-mcp-server-giving-ai-tools-621500-real-app-screens-to-reference]

**Critical limitation for this pipeline:** Returns visual references (screenshots). An image-less coding model (DeepSeek) cannot use visual references. The value is planning-side only — Claude (vision-capable) can pull pattern references to ground a design brief before handing the spec to DeepSeek. [ASSUMED based on product description — confirmation that text summaries are NOT returned not found]

**Pricing:** All paid Mobbin plans (Pro from €10/month billed annually). [VERIFIED — https://chatforest.com/reviews/mobbin-mcp-server/]

---

### 4. Visual Verification Tooling

#### Playwright MCP (already in harness)

60+ tools exposed. Primary mode: **accessibility tree snapshots** (not screenshots). Works through structured data describing every interactive element with stable @ref IDs. Screenshot capability exists (`browser_take_screenshot`) but is opt-in. [VERIFIED — https://github.com/microsoft/playwright-mcp]

**Token overhead:** ~3,500 tokens schema overhead for the MCP server before any interaction. Each interaction appends to context. A typical browser task consumes ~114,000 tokens via MCP vs ~27,000 via CLI — **4x more expensive**. [VERIFIED — https://www.joanmedia.dev/ai-blog/cli-vs-mcp-the-technical-comparison-for-playwright-browser-automation] [VERIFIED — https://www.halmurattahir.com/blog/ai-testing/playwright-mcp-vs-cli-vs-agents-2026/]

**Microsoft recommendation (2026):** Microsoft now recommends Playwright CLI over MCP for coding agents (filesystem access required). CLI uses ~68 tokens total for the skill definition vs ~3,600 for the full MCP schema. [VERIFIED — https://playwright.dev/docs/getting-started-mcp]

**Use pattern for this pipeline:** Keep Playwright MCP active in planning-side sessions (Claude has vision, can evaluate screenshots). For coding-side (DeepSeek), prefer CLI + accessibility tree snapshots — the text output is sufficient for functional verification and token cost is ~4x lower.

#### vercel-labs/agent-browser

Open source, free, npm installable. Browser automation CLI using Chrome DevTools Protocol. Accessibility tree snapshots with compact @eN element refs (~200–400 tokens vs 3,000–5,000 for raw DOM). Also supports `screenshot` command (saves to file). New `--annotate` flag overlays numbered labels on screenshots for multimodal model use. [VERIFIED — https://github.com/vercel-labs/agent-browser] [VERIFIED — https://agent-browser.dev/]

**Pipeline fit:** Text-mode operation fits DeepSeek perfectly — the coding model gets structured element refs without image input. Screenshot mode can be used planning-side for Claude visual review. No subscription cost.

#### Chromatic (visual regression)

Free tier: 5,000 snapshots/month, Chrome only. Paid from $179/month (35,000 snapshots, cross-browser). Storybook-first workflow — designed for component-isolated UI development. [VERIFIED — https://www.chromatic.com/pricing]

**Solo dev fit:** Free tier is sufficient for spot-checking. However, requires Storybook setup — adds infrastructure overhead. Not plug-and-play with a Claude Code pipeline.

#### Percy (BrowserStack)

Free tier: 5,000 screenshots. Mid-market tool, BrowserStack-integrated. Per-snapshot cost is 6x higher than Chromatic at scale. [VERIFIED — https://crosscheck.cloud/blogs/percy-vs-applitools-vs-chromatic-visual-regression-testing/]

---

### 5. Token Overhead General Context

Every MCP server's full tool schema is injected at session start, into every message. Benchmarks from 2026:
- ~1,000 tokens per well-documented tool definition [VERIFIED — https://github.com/modelcontextprotocol/modelcontextprotocol/issues/2808]
- Playwright MCP: ~3,500 tokens for 22–26 tools [VERIFIED — https://www.jdhodges.com/blog/claude-code-mcp-server-token-costs/]
- Canva MCP (34 tools): estimated ~10,000–17,000 tokens [ASSUMED — no direct measurement found]
- Figma MCP (14 tools): estimated ~7,000 tokens schema + large per-call design context payloads [ASSUMED for schema; per-call costs VERIFIED]
- Subframe MCP (22 tools): estimated ~7,000–11,000 tokens [ASSUMED]

The owner's harness already uses ToolSearch (deferred tool loading) which reduces this overhead by up to 85%. With deferred loading, only tools actively needed in a session are loaded into context. [VERIFIED — context from owner's harness description]

---

## Integration Cost / Fit Table

| Tool | Tools # | Schema tokens (est) | Setup effort | Subscription cost | Useful for DeepSeek (text output)? | Where in pipeline | Verdict |
|---|---|---|---|---|---|---|---|
| **Canva Connect MCP** (already in) | 34 | ~12,000 | Already done | Free (core) | Partial (export to PNG/PDF — no code) | Planning-side asset generation | SKIP for app UI; keep if marketing collateral needed |
| **Figma Dev Mode MCP** | 14 | ~7,000 schema + large per-call | High (requires Figma designs + Code Connect setup) | $16/mo (Pro Dev seat) | Yes (design tokens, layout text) + screenshots for Claude | Planning-side design-to-code handoff | TRY if willing to invest in Figma library |
| **Subframe MCP** | 22 | ~8,000 | Medium (account + project setup) | Free (1 project) / $29/mo | Yes — returns React/Tailwind code text | Planning-side design generation, coding-side code pull | TRY — best fit for this pipeline |
| **Google Stitch** (no MCP yet confirmed) | N/A | N/A | Low (Google account) | Free | Yes — DESIGN.md export + React code ZIP | Planning-side ideation, export to coding-side | TRY — free, text-friendly output |
| **v0 MCP (unofficial)** | 4 | ~2,000 | Medium (community server, API key) | API credits | Yes — returns React code | Planning-side component generation | TRY with caution (unofficial) |
| **Magic Patterns** | None (no MCP) | 0 | Low (browser tool) | Free / $19/mo | Yes (manual export) | Ad-hoc screenshot-to-code | SKIP as pipeline integration; use ad-hoc |
| **Mobbin MCP** | ~5–8 est | ~3,000 | Low (paid plan) | €10/mo | No — returns screenshots | Planning-side reference only (Claude vision) | SKIP if DeepSeek is primary builder; TRY if Claude does more coding |
| **Playwright MCP** (already in) | 60+ | ~3,500 | Already done | Free (OSS) | Partial (accessibility tree is text) | Planning visual verification (screenshots), coding functional testing | KEEP for planning screenshots; prefer CLI for coding sessions |
| **agent-browser** | CLI (not MCP) | ~68 tokens | Low (npm install) | Free (OSS) | Yes — accessibility tree text output | Coding-side functional + light visual verification | TRY — low overhead, DeepSeek-friendly |
| **Chromatic** | N/A (CI tool) | N/A | High (requires Storybook) | Free (5k snaps) / $179/mo | N/A | Visual regression CI gate | SKIP unless Storybook already in place |
| **Figma Make** | Part of Figma | Same as Figma | Medium | Included in Figma Pro seat | Yes (outputs Figma frames → then MCP) | Planning-side blank-page design | SKIP standalone; use only if Figma already paid |

---

## Keep / Try / Skip Verdicts

### KEEP (already in harness, preserve with conditions)
- **Playwright MCP** — keep active for planning-side visual verification (screenshot → Claude vision review). For coding sessions with DeepSeek, switch to Playwright CLI mode to recover the 4x token overhead. The existing MCP tools handle the planning use case well.

### TRY (worth adding / experimenting)
1. **Subframe MCP** — strongest fit for this pipeline. It generates React/Tailwind code from design prompts on a visual canvas, returns text code that DeepSeek can consume directly, ships Claude Code agent skills, free tier covers initial experimentation. The deterministic code-gen (no AI approximation) is a key differentiator. Risk: React-only, $29/mo if you exceed the free project limit.

2. **Google Stitch** — free, prompt-to-React-code, DESIGN.md text export that is explicitly "agent-friendly markdown". Works planning-side to generate initial screen designs and export to coding-side as code or structured text. Risk: Google Labs (experimental status), no confirmed stable MCP server, may deprecate.

3. **agent-browser** — free, low overhead, text-mode accessibility tree snapshots fit DeepSeek perfectly for functional verification. The screenshot command with `--annotate` supports planning-side visual review. Better token cost profile than Playwright MCP for coding sessions.

### SKIP
- **Canva Connect MCP (for app UI)** — wrong tool for the job. 34 marketing/brand-asset tools loaded constantly for a use case (app component generation) it does not serve. Recommendation: remove from default session config; keep only if the pipeline needs to generate branded marketing assets. [ASSUMED the owner does not have a primary marketing-asset use case]
- **Figma Dev Mode MCP (standalone)** — skip as a *starting point* without an existing Figma library. The investment to set up structured Figma files with Auto Layout and Code Connect is a full design project in itself. Revisit if the owner decides to maintain a Figma design system as the source of truth.
- **Mobbin MCP** — vision-only value; DeepSeek cannot process screenshots. Only useful planning-side. €10/mo for an occasional reference lookup is poor ROI when Stitch or Subframe's generate capability can produce grounded designs from text.
- **Magic Patterns** — no MCP integration; manual copy-paste workflow does not fit an automated pipeline. Useful ad-hoc but not worth wiring in.
- **Chromatic / Percy** — Storybook infrastructure prerequisite makes this high-effort for a solo dev. The free Playwright screenshot → Claude review workflow covers the visual regression need with zero additional infrastructure.

---

## Assumptions & Gaps

| # | Item | Type | Confidence |
|---|------|------|-----------|
| 1 | Canva token overhead (~12,000) is extrapolated from per-tool benchmarks; no Canva-specific measurement found | ASSUMED | Low-medium |
| 2 | Subframe MCP token overhead extrapolated from 22-tool count; no direct measurement found | ASSUMED | Low-medium |
| 3 | Google Stitch MCP server: existence confirmed (blog post + MCP export mentioned) but tool list, token cost, and stability status not verified | ASSUMED partial | Low |
| 4 | Mobbin MCP returns screenshots (not text descriptions); based on product positioning as visual reference library — if it returns text annotations, it could be useful for DeepSeek too | ASSUMED | Medium |
| 5 | v0 MCP is unofficial/community; Vercel does not ship an official MCP server as of research date | VERIFIED | High |
| 6 | Figma per-call token costs (161,900 tokens for a single card) are from one practitioner's 2026 measurements, not Figma official docs | COMMUNITY | Medium |
| 7 | Microsoft "Playwright CLI preferred over MCP for coding agents" is current for 2026 | VERIFIED | High |

---

## Sources

- [Canva MCP tools and rate limits](https://www.canva.dev/docs/mcp/tools/)
- [Canva Connect MCP overview](https://www.canva.dev/docs/mcp/)
- [Canva Dev MCP server (for Canva app developers)](https://www.canva.dev/docs/apps/mcp-server/)
- [Canva newsroom: MCP for ChatGPT/Codex](https://www.canva.com/newsroom/news/deep-research-integration-mcp-server/)
- [Figma MCP server blog post](https://www.figma.com/blog/introducing-figma-mcp-server/)
- [Figma MCP guide (help center)](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server)
- [Figma pricing 2026](https://www.figma.com/pricing/)
- [Figma mcp-server-guide README (GitHub)](https://github.com/figma/mcp-server-guide/)
- [Figma Code Connect docs](https://help.figma.com/hc/en-us/articles/23920389749655-Code-Connect)
- [Figma MCP CTO guide 2026 (alexbobes.com)](https://alexbobes.com/tech/figma-mcp-the-cto-guide-to-design-to-code-in-2026/)
- [Figma Make pricing 2026 (mantlr.com)](https://mantlr.com/blog/figma-make-pricing-2026)
- [Figma pricing & credits analysis (banani.co)](https://www.banani.co/blog/figma-pricing-and-credits)
- [v0 by Vercel review 2026 (weavai.app)](https://weavai.app/blog/en/2026/04/25/v0-by-vercel-2026-ai-ui-generator-review-pricing/)
- [v0-mcp unofficial server (GitHub)](https://github.com/hellolucky/v0-mcp)
- [Google Stitch blog post](https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-ai-ui-design/)
- [Google Stitch pricing guide (nxcode.io)](https://www.nxcode.io/resources/news/google-stitch-pricing-plans-complete-guide-2026)
- [Subframe website](https://www.subframe.com/)
- [Subframe MCP server docs](https://docs.subframe.com/guides/mcp-server)
- [Subframe AI review (banani.co)](https://www.banani.co/blog/subframe-ai-review)
- [Magic Patterns pricing](https://aiproductivity.ai/pricing/magic-patterns/)
- [Magic Patterns review (tooldirectory.ai)](https://tooldirectory.ai/tools/magic-patterns)
- [Mobbin MCP launch (financialcontent.com)](https://markets.financialcontent.com/wral/article/bizwire-2026-5-13-mobbin-launches-mcp-server-giving-ai-tools-621500-real-app-screens-to-reference)
- [Mobbin MCP review (chatforest.com)](https://chatforest.com/reviews/mobbin-mcp-server/)
- [Playwright MCP GitHub](https://github.com/microsoft/playwright-mcp)
- [Playwright CLI vs MCP comparison (joanmedia.dev)](https://www.joanmedia.dev/ai-blog/cli-vs-mcp-the-technical-comparison-for-playwright-browser-automation)
- [Playwright MCP vs CLI 2026 (halmurattahir.com)](https://www.halmurattahir.com/blog/ai-testing/playwright-mcp-vs-cli-vs-agents-2026/)
- [Playwright MCP getting started](https://playwright.dev/docs/getting-started-mcp)
- [agent-browser website](https://agent-browser.dev/)
- [agent-browser GitHub (vercel-labs)](https://github.com/vercel-labs/agent-browser)
- [Chromatic pricing](https://www.chromatic.com/pricing)
- [Percy vs Chromatic vs Applitools 2026 (crosscheck.cloud)](https://crosscheck.cloud/blogs/percy-vs-applitools-vs-chromatic-visual-regression-testing/)
- [MCP token overhead per tool (modelcontextprotocol issue #2808)](https://github.com/modelcontextprotocol/modelcontextprotocol/issues/2808)
- [MCP token cost analysis (jdhodges.com)](https://www.jdhodges.com/blog/claude-code-mcp-server-token-costs/)
- [MCP tool definitions inflate token costs (bswen.com)](https://docs.bswen.com/blog/2026-04-24-mcp-token-overhead/)
- [Figma MCP token overhead forum request](https://forum.figma.com/ask-the-community-7/request-expose-the-optimized-estimated-tokens-schema-via-api-48396)
