# Research: anthropics/skills

**Date:** 2026-06-05
**Repo:** https://github.com/anthropics/skills
**Owner:** Anthropic (primary contact: Keith Lazuka, klazuka@anthropic.com)
**License:** Mixed — most example skills: Apache 2.0; document skills (docx, pptx, pdf, xlsx): Proprietary / source-available (not open source)
**Purpose:** Official Anthropic reference collection of Claude Skills — demonstrates what's possible with the skills system and ships the document-manipulation skills that power Claude's "Create files" feature in production.

---

## Repo Identity

Published May 2026 alongside the Claude Code plugin marketplace. Skills are the `.claude.ai` / Claude Code equivalent of what APEX calls a "skill" — YAML-frontmatter + Markdown instructions folder. They use the same `SKILL.md` pattern. The repo also contains the official Agent Skills spec (now redirected to agentskills.io/specification) and a minimal template.

### Distribution Mechanism

A `.claude-plugin/marketplace.json` file groups skills into three installable plugins for Claude Code:

| Plugin | Skills Bundled |
|---|---|
| `document-skills` | xlsx, docx, pptx, pdf |
| `example-skills` | algorithmic-art, brand-guidelines, canvas-design, doc-coauthoring, frontend-design, internal-comms, mcp-builder, skill-creator, slack-gif-creator, theme-factory, web-artifacts-builder, webapp-testing |
| `claude-api` | claude-api |

Install via: `/plugin install document-skills@anthropic-agent-skills`

---

## Full Skill Inventory

### Document Skills (Proprietary license)

#### `pdf`
Read, extract text/tables, merge, split, rotate, watermark, create, fill forms, encrypt/decrypt, OCR on scanned PDFs. Python-first (pypdf, pdfplumber, reportlab, pytesseract). Bundled scripts: `convert_pdf_to_images.py`, `fill_pdf_form_with_annotations.py`, `extract_form_field_info.py`, `fill_fillable_fields.py`, `check_bounding_boxes.py`, `create_validation_image.py`. Companion files: `forms.md`, `reference.md`.

Notable mechanism: Claude uses bundled scripts as black-box tools — invoked, not read into context. Scripts provide deterministic form-filling that avoids free-style XML manipulation errors.

#### `docx`
Create, read, edit, manipulate Word documents. Two clear pathways: (a) create new with docx-js (JavaScript), (b) edit existing by unpack→edit XML→repack. Bundled Python scripts: `accept_changes.py`, `comment.py`, XML schema validators, LibreOffice integration (`soffice.py`). Workflow enforces validation after generation.

Notable mechanism: Uses LibreOffice (headless) for `.doc`→`.docx` conversion and accepting tracked changes. docx-js for creation. Explicit US Letter vs A4 default warning hardcoded.

#### `pptx`
Create and edit PowerPoint presentations. Two paths: editing existing (unpack XML + `thumbnail.py` for visual overview), creating from scratch (pptxgenjs). Strong design guidance — explicit color palettes, "sandwich" dark/light structure, avoidance of boring slides. Companion files: `editing.md`, `pptxgenjs.md`.

Notable mechanism: `thumbnail.py` renders slide thumbnails before editing — avoids blind XML surgery. Design palette table is notable content (10 named palettes with hex codes).

#### `xlsx`
Create, edit, analyze Excel files. Python (openpyxl, pandas, xlwings) for creation/analysis; LibreOffice for formula recalculation (`recalc.py`). Strong financial modeling conventions: color-coding standards (blue=inputs, black=formulas, green=cross-sheet links, red=external), number formatting rules, documentation requirements for hardcodes.

Notable mechanism: LibreOffice recalculation script handles formula persistence (Excel formulas don't recalculate unless opened in Excel/Libre). Financial color conventions are unusually opinionated and domain-specific.

---

### Example Skills (Apache 2.0, except claude-api)

#### `skill-creator`
The most complex skill in the repo. An end-to-end skill authoring + eval pipeline:
- **Intent capture** — structured interview (what/when/output/test)
- **Research phase** — parallel subagent research via MCPs
- **SKILL.md authoring** — templated, with the three-level loading system (metadata / SKILL.md / bundled resources), 500-line cap guidance, progressive disclosure pattern
- **Eval loop** — spawns WITH-skill and WITHOUT-skill (or old-vs-new) subagent pairs simultaneously; saves outputs to versioned workspace dirs; runs grader agent to score expectations; repeats
- **Description improver** — separate script (`improve_description.py`) to tune triggering accuracy
- **Benchmark loop** — aggregate across many iterations with variance analysis

Scripts: `run_eval.py`, `run_loop.py`, `aggregate_benchmark.py`, `generate_report.py`, `improve_description.py`, `quick_validate.py`, `package_skill.py`, `utils.py`

Sub-agents: `analyzer.md` (post-hoc analysis of winner vs loser), `comparator.md` (blind comparison), `grader.md` (expectation scoring)

JSON schemas: `evals.json`, `history.json`, `grading.json`

Notable mechanism: **Blind comparator pattern** — outputs are compared without revealing which skill produced them, reducing evaluator bias. Parallel spawning (baseline + with-skill in the same turn) for speed. Versioned improvement history tracking.

#### `claude-api`
Build, debug, optimize Claude API / Anthropic SDK apps. Multi-language (Python, TypeScript, Java, Go, Ruby, C#, PHP, cURL). Covers: managed agents, prompt caching, streaming, tool use, batches, files API, model migration. Companion reference docs per language + shared docs. Strong "do not use OpenAI shims" discipline.

Notable mechanism: explicit language detection decision tree at top of skill; language-specific docs loaded on demand (never all at once); `shared/live-sources.md` for always-fresh SDK repo URLs; explicit defaults (Opus 4.8, adaptive thinking, streaming).

#### `mcp-builder`
Build MCP (Model Context Protocol) servers in Python (FastMCP) or TypeScript (MCP SDK). Four-phase workflow: research/planning → implementation → testing → evaluation. Bundled: `evaluation.py`, `connections.py`, reference docs for both language stacks.

Notable mechanism: fetches MCP spec live from modelcontextprotocol.io (via WebFetch) rather than copying — avoids stale spec drift.

#### `webapp-testing`
Playwright-based web app testing skill. Decision tree for static vs dynamic apps. Helper `with_server.py` manages server lifecycle. "Reconnaissance-then-action" pattern (screenshot first, identify selectors, then act).

Notable mechanism: explicit "do NOT read source of helper scripts until absolutely necessary — call them as black boxes" instruction to protect context window.

#### `frontend-design`
Production-grade frontend interface creation. Strong anti-"AI slop" design philosophy: avoid Inter/Roboto/Arial, purple gradients, centered layouts. Commit to extreme aesthetic direction. React / Vue / HTML/CSS/JS.

Notable mechanism: "differentiation question" baked into design thinking — forces articulation of one unforgettable element before coding.

#### `web-artifacts-builder`
Multi-component claude.ai HTML artifacts: React 18 + TypeScript + Vite + Parcel + Tailwind + shadcn/ui. Scripts for init and bundle-to-single-HTML. Pre-installs 40+ shadcn/ui components.

Notable mechanism: bundles a `shadcn-components.tar.gz` asset — avoids network dependency during build.

#### `algorithmic-art`
Generative art via p5.js with seeded randomness. Two-phase: write an "Algorithmic Philosophy" manifesto first, then express it in code. Output: `.md` + `.html` + `.js`.

Notable mechanism: philosophy-first forces intentional aesthetic before code — produces less generic output.

#### `canvas-design`
Static visual art in PNG/PDF using Python canvas. Same philosophy-first two-phase approach as algorithmic-art but for static graphics.

#### `brand-guidelines`
Anthropic's official brand colors and typography (specific to Anthropic internal use). Colors: `#141413` / `#faf9f5` / `#d97757` etc. Fonts: Poppins (headings), Lora (body). Applies post-processing styling to artifacts.

#### `doc-coauthoring`
Structured co-authoring workflow for documentation. Three-stage: Context Gathering → Refinement & Structure → Reader Testing. The "Reader Testing" stage is notable: test the doc with a fresh Claude (no context) before others read it.

#### `internal-comms`
Template library for internal business communications: 3P updates (Progress/Plans/Problems), newsletters, FAQs, incident reports. Routes to format-specific example files. Persona-customizable ("using the formats that my company likes").

#### `slack-gif-creator`
Animated GIFs optimized for Slack. Python PIL + custom `GIFBuilder` class. Constraints: 128x128 emoji / 480x480 message, 10-30 FPS, palette size guidance.

#### `theme-factory`
10 pre-built color/font themes for slides/docs/HTML. Display `theme-showcase.pdf` → user picks → apply. Themes: Ocean Depths, Sunset Boulevard, Forest Canopy, Modern Minimalist, Golden Hour, Arctic Frost, Desert Rose, Tech Innovation, Botanical Garden, Midnight Galaxy.

---

## Skill-Creator vs apex-skill-author: Explicit Dedup

| Dimension | Anthropic `skill-creator` | APEX `apex-skill-author` | Assessment |
|---|---|---|---|
| **Core premise** | Build skill via iterative eval loop; measure quality quantitatively | Baseline-test first (Iron Law), write minimal fix, register | Different emphasis: skill-creator is measurement-first; apex-skill-author is test-failure-first |
| **Baseline testing** | Spawns baseline (no skill) and with-skill subagents simultaneously; compares outputs | RED/GREEN: bare subagent fails → write skill that fixes failures → re-run | APEX is closer to TDD (RED before GREEN); skill-creator is more A/B benchmarking. APEX explicitly requires failure capture before writing |
| **Blind comparison** | Built-in blind comparator subagent (outputs compared without knowing source) | Not present — relies on direct output inspection | skill-creator has a novel mechanism APEX lacks |
| **Eval schemas** | Formal `evals.json`, `history.json`, `grading.json` schemas; versioned iterations | No formal schema — relies on planning-mode judgment | skill-creator is more rigorous for iterative improvement; APEX leans on human judgment |
| **Description optimization** | Separate `improve_description.py` script that tests triggering accuracy | Ad-hoc — description is part of authoring but no automated test | skill-creator has a distinct automated step APEX lacks |
| **Prompt-independence testing** | Not explicit | Explicitly required at 3 strictness levels (supportive/neutral/competing) | APEX stronger here — this is a named concept with a testing protocol |
| **Frontmatter contract** | `name`, `description` (optional: `compatibility`). Very minimal | Rich: `skill`, `backend`, `version`, `last_updated`, `sources`, `staleness_threshold`, `description` | APEX significantly richer — tracks provenance, staleness, backend routing |
| **Registry / triple-write** | No registry concept — skills are just folders | Mandatory triple-write (registry + SKILLS.md + SKILL-HISTORY.md) | APEX has a more formal governance model |
| **SKILL vs impl split** | Single `SKILL.md` per skill; bundled resources | Explicit SKILL.md (planning) + impl.md (coding) split | APEX unique — tied to dual-backend architecture |
| **Length discipline** | 500-line soft cap on SKILL.md; progressive disclosure documented | Hard 500-line cap; two-tier core/references for impl.md | Same cap, APEX has more formalized tier structure for impl.md |
| **Skill types taxonomy** | Not explicit | Discipline / Technique / Pattern / Reference / Stack — each with distinct baseline test style | APEX more structured |
| **Communication style** | Explicitly calibrates for non-technical users (plumbers, grandparents) | Assumes technical audience | skill-creator's user-awareness is novel |

**Verdict on dedup:** These are complementary, not duplicative. skill-creator focuses on the *measurement and iteration* side (evals, benchmarks, blind comparison, automated description optimization). apex-skill-author focuses on the *discipline and governance* side (Iron Law, prompt-independence, dual-backend routing, frontmatter provenance, registry). APEX is equal-or-ahead on governance; skill-creator is ahead on automated quality measurement. The blind comparator pattern and eval schemas are genuinely novel relative to APEX.

---

## Per-Skill Assessment Table

| Skill | Lens | Dedup vs APEX | Token-cost | Verdict |
|---|---|---|---|---|
| **pdf** | Artemis | Novel (APEX has nothing) | Low (on-demand) | **Absorb for Artemis** — powerful document handling for a personal assistant; scripts are the key value |
| **docx** | Artemis | Novel | Low (on-demand) | **Absorb for Artemis** — Word doc creation/editing is a core personal assistant task |
| **pptx** | Artemis | Novel | Low (on-demand) | **Absorb for Artemis** — presentation creation is relevant; design palette table is strong content |
| **xlsx** | Artemis | Novel | Low (on-demand) | **Absorb for Artemis** — spreadsheet work is a universal personal assistant task; financial color conventions are useful |
| **skill-creator** | APEX | Partial (different emphasis — eval loop vs Iron Law) | Med (spawns subagents) | **Selective absorb into apex-skill-author** — blind comparator pattern + eval schemas + description improver are novel mechanisms worth documenting as optional techniques. Do NOT replace the Iron Law. |
| **claude-api** | APEX | Already have (APEX has a `claude-api` skill installed from this very repo) | Med | **Already absorbed** — APEX installed this via plugin |
| **mcp-builder** | APEX | Partial (APEX has no dedicated MCP-building skill) | Low | **Candidate for APEX** — building MCP servers is a software-building task squarely in APEX's domain; live-spec-fetch mechanism is notable |
| **webapp-testing** | APEX | Partial (APEX has `apex-ui-testing`) | Low | **Check overlap with apex-ui-testing first** — reconnaisance-then-action pattern and server lifecycle script may be novel; but may already be covered |
| **frontend-design** | APEX | Already have (`apex-frontend`, `design-taste-frontend`, `frontend-design`) | Low | **Skip** — heavily overlapping with existing APEX design skills |
| **web-artifacts-builder** | APEX | Partial (APEX has no shadcn/ui artifact bundler) | Low | **Niche** — specific to claude.ai artifact format; not relevant for APEX's software-building context |
| **algorithmic-art** | Neither | Novel | Low | **Skip** — creative/art skill, not software-building; not Artemis-relevant |
| **canvas-design** | Neither | Novel | Low | **Skip** — same as above |
| **brand-guidelines** | Neither | Novel (but Anthropic-internal) | Low | **Skip** — Anthropic brand colors, not applicable to user's projects |
| **doc-coauthoring** | Artemis | Novel | Low | **Weak candidate for Artemis** — structured doc writing workflow is a personal assistant feature; reader-testing pattern is interesting but low priority |
| **internal-comms** | Neither | Novel | Low | **Skip** — enterprise template library, too narrow/persona-specific |
| **slack-gif-creator** | Neither | Novel | Low | **Skip** — novelty skill, not software-building or Artemis-relevant |
| **theme-factory** | Artemis | Partial (APEX has design themes) | Low | **Low priority** — pre-built themes could serve Artemis; but not urgent |
| **mcp-builder** | APEX | Novel | Low | **Candidate** — MCP building is squarely a dev task |

---

## Detailed Candidate Analysis

### Priority 1: Document Skills (pdf, docx, pptx, xlsx) → Artemis

These are the most actionable findings. They are:
- **Not software-building tools** — wrong lens for APEX itself
- **Exactly right for a personal assistant** — Artemis will handle user documents
- **Production-quality** — these power Claude's actual "Create files" feature; not toy implementations
- **Self-contained with bundled scripts** — clean to deploy as Artemis-adjacent skills
- **Low token cost** — on-demand loading; no always-installed baseline cost

The scripts in each skill are the key value-add (LibreOffice integration, XML validation, form-filling, formula recalculation). The instructions alone without the scripts would be noticeably weaker.

License note: These are Proprietary/source-available. Anthropic has shared them "for developers as a reference" — appropriate for co-installing as skills in a personal project. Not open source, so don't redistribute the scripts commercially.

Recommendation: When Artemis build begins, install the `document-skills` plugin directly via `/plugin install document-skills@anthropic-agent-skills`. Do not copy-absorb the scripts into APEX — just reference-install.

### Priority 2: skill-creator eval mechanisms → apex-skill-author (selective)

Three specific mechanisms worth adding as optional techniques in apex-skill-author:

1. **Blind comparator pattern** — when two skill versions are being compared, strip identifying info before grading to reduce bias. Currently not in apex-skill-author.
2. **Versioned eval schemas** (`evals.json` / `history.json`) — for skills where improvement is iterated over many rounds, a formal schema beats ad-hoc notes. Add as an optional `## When to run quantitative evals` section.
3. **Description optimization as a distinct step** — the idea of testing triggering accuracy separately from content accuracy is sound. Worth a brief mention.

What NOT to absorb: the full eval loop, the benchmark scripts, the grader subagents. These are designed for Claude.ai's skill distribution context (testing before publishing). APEX's Iron Law is more appropriate for the APEX use case (coding assistant correctness under pressure). The prompt-independence testing APEX has is stronger for APEX's discipline-skill use case.

### Priority 3: mcp-builder → new apex-mcp skill (or fold into apex-backend)

MCP server building is a legitimate software-building task. The live-spec-fetch mechanism (always-fresh from modelcontextprotocol.io) is important — the MCP spec evolves fast. APEX has no dedicated MCP skill. If/when a project needs MCP server development, building from this would be the right starting point. Lower priority than document skills since MCP building is less frequent than document handling.

### webapp-testing vs apex-ui-testing

Need to check apex-ui-testing content before deciding. The reconnaisance-then-action pattern and `with_server.py` lifecycle management are concrete — if apex-ui-testing lacks these, worth adding. Parked pending apex-ui-testing read.

---

## What APEX Already Has (no action needed)

- `claude-api` — installed directly from this repo as a plugin; already present
- `frontend-design` — covered by apex-frontend + design-taste-frontend + existing frontend-design skill
- Web testing — apex-ui-testing (check overlap before absorbing webapp-testing)

---

## Bottom Line

anthropics/skills is a **productivity / document-manipulation skills collection** at its core, not a software-building system. The mismatch with APEX's mission is real: most skills (art, themes, comms, GIFs) are irrelevant to APEX. The document skills (pdf/docx/pptx/xlsx) are high quality and genuinely useful — but for Artemis (personal assistant), not APEX (software builder). The highest-priority action is registering these for direct plugin install when Artemis build begins, not absorbing them into APEX now. The skill-creator's eval mechanisms offer 3 specific techniques worth selectively folding into apex-skill-author (blind comparison, eval schemas, description-accuracy testing) — not a wholesale replacement of the Iron Law.

**Ranked actions:**
1. (When Artemis build starts) Install `document-skills` plugin via Claude Code marketplace — no copy needed
2. (Next apex-skill-author update) Add blind comparator + eval schemas + description-accuracy-testing as optional extensions
3. (If MCP server project arises) Use mcp-builder as foundation for a new apex-mcp skill
4. (Low priority) Check apex-ui-testing vs webapp-testing for reconnaisance pattern gap
