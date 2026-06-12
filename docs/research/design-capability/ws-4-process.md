# Research: WS-4 — Design process in agentic dev

**Date:** 2026-06-12
**Confidence:** Medium-high. Core patterns (DESIGN.md, screenshot gate, PostToolUse hooks, Playwright computed-style assertions) are verified from primary sources published 2025–2026. Workflow cost estimates and iteration counts are practitioner-reported, not controlled-study data. Items marked [ASSUMED] are inferences from pattern data.

---

## Summary

The central finding is that design quality in agentic development in 2026 is solved by a three-layer pattern: **lock tokens before code runs** (DESIGN.md / designtoken.md as spec input), **split judgment from execution** (vision-capable model reviews output that an imageless coder produced), and **assert numerically** (CSS computed-style and accessibility-tree assertions proxy visual correctness without screenshots). For a planning/coding split like APEX — where Claude owns design judgment and DeepSeek executes blind — each layer maps cleanly to a pipeline stage. The highest-evidence finding is that a screenshot → vision critique → fix-spec loop, running in CI or as a post-build gate fired from planning mode, collapses visual iteration from 10+ cycles to 2–3. The second highest-evidence finding is that writing design constraints as DESIGN.md (Google Labs spec, April 2026) into a spec prevents the imageless coder from filling gaps with training-data defaults. The third is that PostToolUse hooks wired to CSS/accessibility linters can catch measurable violations (contrast, spacing scale, typography hierarchy) without any human seeing pixels.

---

## Key findings

### 1. Where design happens in 2026 AI-assisted dev

**Design precedes coding as a distinct artifact phase.** The practitioner consensus across multiple 2025–2026 sources is that spec-first workflows produce dramatically better outputs than prompt-then-iterate. Addy Osmani describes "a waterfall in 15 minutes" — design brief → spec.md → task list → code — with design decisions locked before any tool writes a file. [VERIFIED — https://addyosmani.com/blog/ai-coding-workflow/]

**The DESIGN.md format (Google Labs, April 2026) is the reference standard for encoding visual identity into AI-executable text.** Published April 10 2026, it has 11,000+ GitHub stars and is the spec behind Google Stitch. It combines YAML front matter (exact token values: colors, typography, spacing, rounded, components) with markdown prose (rationale, do's and don'ts). The linter enforces nine rules including broken token references, WCAG AA contrast failures, and orphaned tokens. [VERIFIED — https://github.com/google-labs-code/design.md]

**Tokens-first, screens-second is the dominant sequence.** The Builder.io workflow (4-stage: intent → generate → refine → integrate) indexes the component library and design tokens first so agents "default to approved patterns" instead of inventing components. [VERIFIED — https://www.builder.io/m/explainers/ai-agent-workflow-building-ui]

**Figma MCP with Code Connect is the highest-fidelity design handoff path, but requires Organization/Enterprise tier.** The MCP server exposes variables, component variants, and Auto Layout properties to coding agents. Color/typography accuracy is 95%+ with Figma variables connected; without Code Connect the agent generates duplicates instead of imports. [VERIFIED — https://alexbobes.com/tech/figma-mcp-the-cto-guide-to-design-to-code-in-2026/]

**Design brief framing prevents AI defaults.** Without narrative context, agents fill spec gaps with training-data defaults (generic color choices, uniform spacing, no intentionality). A 3–5 sentence creative brief covering emotion, audience, visual territory, and constraints anchors output. [VERIFIED — https://design-rise.com/ai-as-your-art-director-step-by-step-workflow-for-modern-designers-2026-guide/]

**designtoken.md (150+ lines) is a richer alternative to DESIGN.md for pure token coverage.** It provides full 40-token color scales (4 roles × 10 stops), 9-level typography hierarchy, 12-step spacing scale, 5-level elevation, and component state tokens. Optimized for machine-parseable tables. [VERIFIED — https://designtoken.md/]

### 2. Visual feedback loop with an imageless coder

**Round-trip screenshot testing is the most cited pattern for visual quality with AI coders.** The workflow: coding agent writes file → screenshot harness captures PNG (via Playwright page.screenshot or Capybara) → vision-capable model (Claude) reviews the PNG and describes visual problems → fix spec is generated → loop. Practitioner reports: reduces "does this look right?" to "does this look good?" and collapses visual iteration to 2–3 cycles vs 10+. [VERIFIED — https://medium.com/@rotbart/giving-claude-code-eyes-round-trip-screenshot-testing-ce52f7dcc563, https://luca-becker.me/blog/level-up-agentic-coding-mcp-2-playwright/]

**The Anthropic engineering team (harness-design post) provides the most rigorous evidence for the evaluator-separate-from-generator pattern.** Three-agent architecture: Planner expands brief → Generator implements → Evaluator (vision-capable, uses Playwright MCP) navigates live pages, takes screenshots, and assesses against sprint contracts. Key finding: "self-evaluation bias" — models praise their own output even when quality is mediocre — makes the separate evaluator essential, not optional. [VERIFIED — https://www.anthropic.com/engineering/harness-design-long-running-apps]

**Playwright MCP snapshot mode gives imageless agents text-proxy visual access.** In default Snapshot Mode, Playwright MCP reads the accessibility tree as structured YAML. Agents get element roles, hierarchy, accessible names, ARIA states — without screenshots. This enables semantic structure verification. It does NOT verify visual appearance, positioning, colors, or styling. [VERIFIED — https://playwright.dev/docs/aria-snapshots, https://testdino.com/blog/accessibility-tree]

**CSS computed-style assertions via page.evaluate() are the primary text proxy for numerical visual verification.** Playwright's `toHaveCSS()` and `window.getComputedStyle()` inside `page.evaluate()` can assert spacing, contrast color values, font sizes, and display properties numerically. Example: `await expect(locator).toHaveCSS('padding', '24px')`. Known limitation: custom CSS properties (variables) have edge-case failures; compute resolved values instead. [VERIFIED — https://testerops.com/playwright-and-css-validation/, https://shiv-jirwankar.medium.com/get-css-properties-of-web-element-with-playwright-e092fdc9f462]

**VS Code's internal workflow shows the "agents check correctness, humans evaluate delight" split in production.** They use Playwright screenshot verification confirming features match expected behavior, plus golden scenario automation for core flows, plus human gatekeeping for taste decisions. [VERIFIED — https://code.visualstudio.com/blogs/2026/03/13/how-VS-Code-Builds-with-AI]

### 3. Design QA gates

**PostToolUse hooks in Claude Code are the primary enforcement mechanism for automated design quality verification.** Hooks fire after every Write/Edit, can run CSS validators, Playwright commands, axe-core, and inject findings back to Claude as `additionalContext`. They cannot block (the file is already written); for pre-write blocking, PreToolUse is required. [VERIFIED — https://code.claude.com/docs/en/hooks]

**The solodesign.cc pattern: PostToolUse "output verification gates" checking design system compliance (spacing, colors, typography) and accessibility baseline (WCAG 2.2 AA).** These are Claude Code hooks written as explicit criteria that fire after every AI action. The article emphasizes: "runs every time, no discipline required." Specific gates: spec completeness, design system compliance, accessibility baseline, brand voice. [VERIFIED — https://solodesign.cc/blog/ai-design-quality-gates/]

**CI visual QA with Claude + Playwright MCP: 2–4 minutes per PR, 3 viewports (desktop/tablet/mobile), pass/fail checklists posted as PR comments.** The granda.org CI pipeline boots a Docker environment, hands the URL to Claude Code with Playwright MCP, exercises interactive elements from the diff, and posts structured PR comments with inline screenshots. No hardcoded test plans — the agent infers test surface from the code diff. [VERIFIED — https://granda.org/en/2026/02/06/visual-qa-as-a-ci-pipeline-stage/]

**DESIGN.md linter rules (9 rules including contrast-ratio) provide a parseable, automatable quality gate.** The linter checks WCAG AA contrast failures, orphaned tokens, broken token references, and section order. Running the linter against the DESIGN.md before starting a coding session is a zero-cost pre-flight check. [VERIFIED — https://github.com/google-labs-code/design.md]

**At solo scale, the pragmatic gate recommendation is in-editor review only for fast iteration; CI visual gate only when a feature touches visible surfaces.** [COMMUNITY — solodesign.cc, granda.org]

### 4. Spec-level design encoding

**DESIGN.md Do's and Don'ts section is the primary mechanism for forbidden-pattern encoding.** The article author reports: "the don'ts pulled more weight than the do's." Effective examples from practitioners: "Don't use drop shadows on cards — use borders", "Don't nest cards", "Don't use full-uppercase text", "Button radius: 8px, always", "use primary button color on one CTA per screen, never stacked". [VERIFIED — https://designproject.io/blog/design-md-file/]

**Constraint language strategy: explicit prohibitions are more effective than positive constraints for imageless coders.** When prose is permissive, agents fill gaps with training-data defaults. When prose is prohibitive and specific ("primary.900 — used only for the highest-emphasis action on a screen"), agents have no gap to fill. [VERIFIED — https://designproject.io/blog/design-md-file/, https://betterstack.com/community/guides/ai/design-md-ai/]

**"Sprint contracts" (Anthropic harness design) are the coding-side equivalent: a written agreement on what "done" looks like before any code is written.** The generator and evaluator negotiate the contract before implementation. This is analogous to acceptance criteria in a spec, but includes visual acceptance criteria. [VERIFIED — https://www.anthropic.com/engineering/harness-design-long-running-apps]

**Figma MCP with Code Connect achieves 85% accuracy for well-structured designs without extra prompting.** Color/typography 90–95%; component hierarchy 85%; responsive breakpoints and hover states require explicit prompting. Without Code Connect: agent generates duplicates, hardcodes values. [VERIFIED — https://alexbobes.com/tech/figma-mcp-the-cto-guide-to-design-to-code-in-2026/]

**For spec-level encoding without Figma: extract design tokens into the spec as an explicit DESIGN.md section** (inline or as a referenced file), plus a "Do's and Don'ts" section listing at minimum: 3–5 forbidden patterns derived from reviewing previous AI failures, exact pixel/rem values for spacing and radius, named color roles with usage context, and typography hierarchy with purpose labels. [ASSUMED — synthesis of DESIGN.md spec + practitioner constraint-language findings]

**The AGENTS.md / SKILL.md / DESIGN.md three-layer split** is an emerging 2026 pattern where: AGENTS.md handles behavioral rules for the agent, SKILL.md handles capability routing, and DESIGN.md handles visual identity constraints. These are consumed separately so visual rules don't pollute agent behavior instructions. [COMMUNITY — https://dev.to/aws-builders/agentsmd-skillmd-designmd-how-ai-instructions-split-into-three-layers-d0g]

---

## Recommended process sketch

End-to-end process adapted to the APEX planning/coding split, with per-stage cost:

### Stage 0: Design brief (Planning mode — before any spec is written)
**Who sees pixels:** human + Claude (vision) reviewing reference examples
**Artifacts produced:** `DESIGN.md` at project root + 3–5 sentence creative brief embedded in spec identity block
**What happens:**
- Author DESIGN.md with YAML token front matter (colors, typography, spacing, rounded, components) and markdown prose (overview, do's and don'ts)
- Run the DESIGN.md linter before committing: checks contrast ratios, orphaned tokens, broken refs
- Populate Do's and Don'ts from previous AI failures (reverse-engineer slop patterns)
**Cost:** 30–60 minutes first time; incremental thereafter

### Stage 1: Spec encoding (Planning mode — writing the execution spec)
**Who sees pixels:** nobody
**Artifacts produced:** `docs/changes/<feature>.md` spec
**What happens:**
- Every UI task in the spec references DESIGN.md token names explicitly (e.g., "use `{colors.primary.900}` for the CTA, `{spacing.lg}` for card padding")
- Include a "Design constraints" block per screen/component task listing: exact token values, named component references, forbidden pattern list (3–5 prohibitions)
- Write acceptance criteria as verifiable checks: `toHaveCSS('padding', '24px')`, aria-snapshot matches, contrast ratio ≥ 4.5:1
- "Sprint contract" language: state what the visual output will look like before coding begins
**Cost:** +10–15 min per spec (mostly copying token refs and negation rules)

### Stage 2: Coding (DeepSeek — imageless execution)
**Who sees pixels:** nobody
**What happens:**
- DeepSeek reads spec + DESIGN.md (passed as context); tokens are explicit, no gap-filling needed
- PostToolUse hooks fire on every Write/Edit to UI files: run CSS token compliance check (assert computed spacing matches scale), run axe-core contrast check, run Playwright accessibility-tree snapshot
- Hooks inject findings as `additionalContext` back to DeepSeek; DeepSeek self-corrects in the same session
- Text-proxy assertions in tests: `toHaveCSS`, `getComputedStyle` for spacing/contrast, ARIA snapshot for semantic structure
**Cost:** ~0 extra time if hooks are pre-configured; first-time hook setup ~2 hours

### Stage 3: Post-build screenshot gate (Planning mode — vision review)
**Who sees pixels:** Claude (vision model) — first time pixels are seen
**Artifacts produced:** fix spec (`docs/changes/<feature>-visual-fix.md`) if failures found; or "LGTM" note appended to handoff
**What happens:**
- After DeepSeek finishes a spec, planning mode runs a screenshot pass: Playwright captures 3 viewports (desktop/tablet/mobile) for each changed screen
- Claude reviews screenshots against DESIGN.md (are tokens applied? do's/don'ts respected?) and the creative brief (does it feel right?)
- If issues found: Claude writes a focused fix spec — exact failing elements, exact required corrections using DESIGN.md token refs; DeepSeek executes
- Loop: typically 2–3 cycles, not 10+
**Cost:** 5–10 min per feature (Playwright screenshots + Claude review); 90 sec for single-component changes

### Stage 4: CI visual QA gate (optional — on PR/commit)
**Who sees pixels:** Claude Code + Playwright MCP headless
**Artifacts produced:** PR comment with pass/fail checklist and viewport screenshots
**What happens:**
- On each PR touching UI files, CI runs Claude Code + Playwright MCP: navigates to local dev server, exercises interactive elements from the diff, screenshots 3 viewports, posts structured PR comment
- 2–4 minutes per PR; suitable for features, not every commit
**Cost:** 2–4 min CI time; negligible at solo scale

### Stage 5: Design retrospective (infrequent — after shipped features)
**Who sees pixels:** human
**What happens:**
- Review shipped screens against DESIGN.md Do's and Don'ts
- Add any new AI failures as prohibition rules to DESIGN.md
- This makes subsequent sessions progressively tighter
**Cost:** 15–30 min monthly

---

**Per-stage summary table:**

| Stage | Mode | Sees pixels? | Primary tool | Cost |
|-------|------|-------------|-------------|------|
| 0: Design brief | Planning | Human + Claude | DESIGN.md linter | 30–60 min first run |
| 1: Spec encoding | Planning | Nobody | Spec authoring | +10–15 min/spec |
| 2: Coding | Coding (DeepSeek) | Nobody | PostToolUse hooks + CSS assertions | Near-zero ongoing |
| 3: Screenshot gate | Planning | Claude (vision) | Playwright + Claude review | 5–10 min/feature |
| 4: CI gate | CI | Claude Code + MCP | Playwright MCP in CI | 2–4 min/PR (optional) |
| 5: Retrospective | Human | Human | Manual review | 15–30 min/month |

---

## Assumptions & gaps

**[ASSUMED]** The recommendation to pass DESIGN.md as explicit context to DeepSeek (not just as a root file) is inferred from the DESIGN.md spec's intent; there is no published evidence of DeepSeek specifically consuming DESIGN.md in the APEX pattern. Testing needed.

**[ASSUMED]** The PostToolUse hook approach described (run CSS validator, inject additionalContext) is synthesized from the Claude Code hooks documentation and the solodesign.cc gate pattern. No published APEX-specific hook configuration exists for this yet.

**Gap:** No published evidence of a "planning-mode screenshot gate" implemented as a Claude Code skill/command that explicitly bridges the planning/coding split (planning mode runs Playwright, sees screenshots, writes fix specs). The pattern is implied by the round-trip screenshot testing work but not documented as a planning-side workflow step.

**Gap:** Measured quality improvement data for DESIGN.md specifically is anecdotal (Stripe vs generic dashboard demo from betterstack.com). No A/B quantification exists.

**Gap:** Figma MCP Code Connect requires Organization/Enterprise Figma tier — not viable for solo/indie builds. Alternative (Framelink MCP, manual token export) is feasible but less accurate.

**Gap:** The granda.org CI pipeline is Django-specific; adapting to other stacks requires parallel implementation effort.

**[ASSUMED]** "2–3 cycles instead of 10+" for the screenshot loop is practitioner-reported from luca-becker.me and rotbart/medium; not a controlled study.

---

## Sources

- https://addyosmani.com/blog/ai-coding-workflow/
- https://medium.com/@rotbart/giving-claude-code-eyes-round-trip-screenshot-testing-ce52f7dcc563
- https://tweag.github.io/agentic-coding-handbook/WORKFLOW_VISUAL_FEEDBACK/
- https://luca-becker.me/blog/level-up-agentic-coding-mcp-2-playwright/
- https://www.anthropic.com/engineering/harness-design-long-running-apps
- https://github.com/google-labs-code/design.md
- https://betterstack.com/community/guides/ai/design-md-ai/
- https://wavespeed.ai/blog/posts/design-md-vs-design-tokens-ai-workflows/
- https://designtoken.md/
- https://designproject.io/blog/design-md-file/
- https://www.builder.io/m/explainers/ai-agent-workflow-building-ui
- https://solodesign.cc/blog/ai-design-quality-gates/
- https://granda.org/en/2026/02/06/visual-qa-as-a-ci-pipeline-stage/
- https://code.claude.com/docs/en/hooks
- https://playwright.dev/docs/aria-snapshots
- https://testerops.com/playwright-and-css-validation/
- https://shiv-jirwankar.medium.com/get-css-properties-of-web-element-with-playwright-e092fdc9f462
- https://code.visualstudio.com/blogs/2026/03/13/how-VS-Code-Builds-with-AI
- https://www.figma.com/blog/design-systems-ai-mcp/
- https://alexbobes.com/tech/figma-mcp-the-cto-guide-to-design-to-code-in-2026/
- https://design-rise.com/ai-as-your-art-director-step-by-step-workflow-for-modern-designers-2026-guide/
- https://dev.to/aws-builders/agentsmd-skillmd-designmd-how-ai-instructions-split-into-three-layers-d0g
- https://alexop.dev/posts/spec-driven-development-claude-code-in-action/
- https://joshmcdonald.medium.com/running-a-small-team-on-a-big-project-spec-driven-development-with-claude-code-9a1b97f58551
