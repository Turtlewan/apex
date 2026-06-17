# Impeccable Absorption Pass — Extraction Report

## Identity

- **URL:** https://github.com/pbakaus/impeccable  
- **Commit SHA:** 1268f10  
- **License:** Apache-2.0 (LICENSE file confirmed)  
- **What it is (from SKILL.md):** "Design skills, commands, and anti-pattern detection for AI coding agents" — a Claude Code (and multi-harness) skill that ships a SKILL.md-based design workflow **plus** a Node.js CLI/browser-extension detector for UI anti-patterns.  
- **Package name/version:** `impeccable@3.0.2` (package.json); SKILL.md internal version `3.7.1`
- **Runtime:** Node.js ≥ 24, ESM (`"type": "module"`); bundled for browser as a single JS file; Bun used for builds.  
- **Dependency footprint for the detector:** Zero runtime deps for the core detector (pure-Node); Bun/Astro/etc. are dev-only build tools.

---

## Layer A — Prose / Skill-Content Layer

Source: `.claude/skills/impeccable/SKILL.md` (168 lines), `reference/init.md`, `demos/landing-demo/PRODUCT.md`, `DESIGN.md`

### A1. Setup convention: PRODUCT.md + DESIGN.md (per-project)

Impeccable's `init` command writes two root project files:

- **`PRODUCT.md`** — strategic: register (`brand` or `product`), users, purpose, brand personality, anti-references, design principles, accessibility. Source: `reference/init.md` lines 97–123.
- **`DESIGN.md`** — visual system: color tokens, typography, components in the [Google Stitch DESIGN.md format](https://stitch.withgoogle.com/docs/design-md/format/). Source: `reference/init.md` lines 127–133.

The "anti-references" field in PRODUCT.md is the key structural invention: it is explicit negative-space branding ("avoid the Fraunces-cream-peach SaaS template"; "three-icon feature tile rows"). See `demos/landing-demo/PRODUCT.md` for a representative example.

### A2. Register concept (brand vs. product)

Every project is classified as exactly one of:
- **`brand`** — marketing/landing/campaign; design IS the product.
- **`product`** — app UI/admin/dashboard/tool; design SERVES the product.

Register drives which reference file is loaded (`reference/brand.md` vs `reference/product.md`), which design heuristics apply, and which anti-patterns are prioritised. Source: `SKILL.md` lines 21–22.

### A3. Absolute bans list (prose, inline in SKILL.md)

Section "## Absolute bans" (SKILL.md lines 79–91) is a `match-and-refuse` list with the directive: _"If you're about to write any of these, rewrite the element with different structure."_ Includes:

- Side-stripe borders (`border-left`/`border-right` > 1px as colored accent)
- Gradient text (`background-clip: text` + gradient)
- Glassmorphism as default
- Hero-metric template (big number, small label, gradient accent)
- Identical card grids (icon + heading + text, repeated)
- Tiny uppercase tracked eyebrow above every section
- Numbered section markers (01/02/03) as default scaffolding
- Text overflowing its container

### A4. AI slop test + register-specific reflex checks

SKILL.md lines 92–99: "The AI slop test" introduces a **two-altitude category-reflex check**:
- **First-order:** can someone guess theme + palette from category alone? → rework.
- **Second-order:** can someone guess aesthetic family from category + anti-references? → rework even then.

### A5. Design guidance: Color, Typography, Layout, Motion, Interaction

Detailed prose guidance in SKILL.md §§ General rules, New projects only (lines 30–91):

**Color rules (highlights):**
- Body text ≥4.5:1 contrast; large text ≥3:1; placeholder text 4.5:1.
- The cream/sand/beige body bg is "the saturated AI default of 2026" — named explicitly with the hue range: `OKLCH L 0.84-0.97, C < 0.06, hue 40-100`.
- Token names like `--paper`, `--cream`, `--sand`, `--bone` are labelled as tells.
- Tinted neutrals: add 0.005–0.015 chroma toward the brand's own hue.
- Four color-strategy levels: Restrained / Committed / Full palette / Drenched.

**Typography rules:**
- Body line length 65–75ch.
- Don't pair similar-category fonts; pair on contrast axis.
- Hero ceiling: clamp() max ≤ 6rem (~96px).
- Display letter-spacing floor: ≥ -0.04em.
- `text-wrap: balance` on h1–h3; `text-wrap: pretty` on prose.

**Motion rules (especially novel):**
- Ease out with exponential curves (ease-out-quart/quint/expo); no bounce/elastic.
- `@media (prefers-reduced-motion: reduce)` mandatory.
- Stagger per-list items is legitimate; uniform reveal on every section is the reflex tell.
- Reveal animations must enhance an already-visible default (class-triggered-only transitions fail on hidden tabs and headless renderers — ships blank).

**Layout:**
- Cards are the lazy answer; nested cards always wrong.
- Flexbox for 1D, Grid for 2D.
- Semantic z-index scale (never 999/9999).

### A6. Command vocabulary (26 sub-commands)

Impeccable ships 26 named commands for the agent: craft, shape, init, document, extract, critique, audit, polish, bolder, quieter, distill, harden, onboard, animate, colorize, typeset, layout, delight, overdrive, clarify, adapt, optimize, live, plus pin/unpin/hooks. Each has a `reference/<command>.md`. This is the full structured design workflow, not a design ruleset.

### A7. Copy / microcopy rules (inline in SKILL.md + absolute bans)

- Em-dash overuse (>2 em-dashes) is an AI cadence tell.
- Marketing buzzwords (streamline/empower/supercharge/world-class/etc.) flagged by name.
- Aphoristic cadence copy ("Not a feature. A platform.") — once is fine, the pattern is the tell.

---

## Layer B — Mechanical Layer: The Deterministic Detector

### B1. Rule count

**Exactly 44 rules** (confirmed by `grep -c "id:" cli/engine/registry/antipatterns.mjs` → `44`).

Source file: `cli/engine/registry/antipatterns.mjs`

### B2. Full rule list (id + what it checks)

Category `slop` (AI tells, on by default):

| ID | Name | What it checks |
|----|------|---------------|
| `side-tab` | Side-tab accent border | Thick colored border on one side of a card (≥2px on L/R, not on others, non-neutral color) |
| `border-accent-on-rounded` | Border accent on rounded element | Top/bottom accent border on a rounded card (radius > 0, border ≥ 2px) |
| `overused-font` | Overused font | Inter, Roboto, Fraunces, Geist, Plus Jakarta Sans, Space Grotesk in font-family |
| `single-font` | Single font for everything | Only one font family used across the entire page |
| `flat-type-hierarchy` | Flat type hierarchy | Font sizes too close together (< 1.25 ratio between steps) |
| `gradient-text` | Gradient text | `background-clip: text` + gradient background |
| `ai-color-palette` | AI color palette | Purple/violet gradients (hue 260–310); cyan-on-dark (hue 160–200) |
| `cream-palette` | Cream / beige palette | Warm cream/beige page background (OKLCH L 0.84–0.97, C < 0.06, hue 40–100) |
| `nested-cards` | Nested cards | Cards inside cards (card-like element containing another card-like element) |
| `monotonous-spacing` | Monotonous spacing | >60% of spacing values identical; ≤3 unique values in ≥10 occurrences |
| `bounce-easing` | Bounce or elastic easing | animation name matching bounce/elastic/wobble/jiggle/spring; cubic-bezier Y outside [0,1] |
| `dark-glow` | Dark mode with glowing accents | Colored box-shadow with blur > 4px on dark background (luminance < 0.1) |
| `icon-tile-stack` | Icon tile stacked above heading | 32–128px squarish icon container (with background/border/icon child) above heading |
| `italic-serif-display` | Italic serif display headline | h1 (or h2 ≥48px) in italic serif font ≥48px |
| `hero-eyebrow-chip` | Hero eyebrow / pill chip | Small element above h1: tracked-uppercase ≤14px OR bold+accent-colored ≤14px |
| `repeated-section-kickers` | Repeated section kicker labels | ≥3 uppercase tracked labels above h2/h3/h4 across the page |
| `numbered-section-markers` | Numbered section markers (01/02/03) | Section labels starting with 01/02/03 etc. |
| `em-dash-overuse` | Em-dash overuse | >2 em-dashes in body copy |
| `marketing-buzzword` | Marketing buzzword | streamline/empower/supercharge/world-class/enterprise-grade/next-generation/cutting-edge etc. |
| `aphoristic-cadence` | Aphoristic-cadence copy | ≥3 "Not X. Just Y." or "X. Y." rebuttal-sentence patterns |
| `oversized-h1` | Oversized hero headline | Long full-sentence h1 at display scale |
| `extreme-negative-tracking` | Crushed letter spacing | Letter-spacing tighter than character separation point |
| `broken-image` | Broken or placeholder image | `<img>` with empty/missing/placeholder src |

Category `quality` (design/accessibility issues, on by default):

| ID | Name | What it checks |
|----|------|---------------|
| `gray-on-color` | Gray text on colored background | Neutral-gray text on a chromatic background |
| `low-contrast` | Low contrast text | WCAG AA: <4.5:1 body, <3:1 large text |
| `layout-transition` | Layout property animation | `transition:` on width/height/padding/margin |
| `line-length` | Line length too long | Text lines >~80 characters |
| `cramped-padding` | Cramped padding | Text too close to container edge (<8px padding inside bordered/colored container) |
| `body-text-viewport-edge` | Body text touching viewport edge | Body paragraphs flush against viewport edge, no horizontal padding |
| `tight-leading` | Tight line height | Line-height < 1.3× font size |
| `skipped-heading` | Skipped heading level | h1→h3 with no h2 (breaks screen reader navigation) |
| `justified-text` | Justified text | `text-align: justify` without hyphenation |
| `tiny-text` | Tiny body text | Body text below 12px |
| `all-caps-body` | All-caps body text | Long passages in uppercase |
| `wide-tracking` | Wide letter spacing on body text | Letter-spacing > 0.05em on body text |
| `text-overflow` | Content overflowing its container | Content wider than its container |
| `clipped-overflow-container` | Positioned child clipped by overflow container | `overflow: hidden` wrapping an absolutely-positioned child |
| `design-system-font` | Font outside DESIGN.md | Font family not declared in project DESIGN.md |
| `design-system-color` | Color outside DESIGN.md (advisory) | Literal color outside the DESIGN.md palette |
| `design-system-radius` | Radius outside DESIGN.md (advisory) | Border-radius value outside the DESIGN.md scale |

Category `slop` — gated (opt-in via `--gpt` or `--gemini` flag, off by default):

| ID | Gate | Name | What it checks |
|----|------|------|---------------|
| `gpt-thin-border-wide-shadow` | `gpt` | Hairline border with wide shadow | 1px border + wide diffuse shadow |
| `repeating-stripes-gradient` | `gpt` | Repeating-gradient stripes | `repeating-linear-gradient` as decoration |
| `theater-slop-phrase` | `gpt` | Theater framing copy | "X theater" framing in copy |
| `image-hover-transform` | `gemini` | Image hover transform | `img:hover { transform }` or Tailwind hover-scale/rotate on `<img>` |

**Total: 44 rules (23 slop on-by-default + 1 quality-boundary + 17 quality + 3 gpt-gated + 1 gemini-gated = 44).**

### B3. Detection engines — three parallel paths

Source: `cli/engine/engines/` + `cli/engine/rules/checks.mjs` (2672 lines)

The detector has **three distinct runtime modes** that all share the same rule registry:

1. **Static-HTML (jsdom)** — `cli/engine/engines/static-html/detect-html.mjs`  
   Parses HTML files with jsdom, walks the DOM, calls `getComputedStyle`. Includes a Tailwind v4 custom-property resolver (`buildCustomPropMap`) and an OKLCH→RGB converter (hand-coded Björn Ottosson matrices) because jsdom returns literal `oklch(...)` strings that browsers would auto-compute.

2. **Browser extension** — `cli/engine/detect-antipatterns-browser.js` + `extension/`  
   Same detection logic bundled as a Manifest V3 Chrome extension (content script + devtools panel). Runs the detector on the live rendered DOM using real `getComputedStyle`; no jsdom needed. Extension version 1.2.0.

3. **Regex/text** — `cli/engine/engines/regex/detect-text.mjs`  
   Runs without DOM; scans raw HTML/CSS/JS source text via regex. Used for text-heavy checks (em-dash, buzzwords, aphoristic cadence, repeating-gradient, image-hover-transform) and as a fast pre-pass.

There is also a **visual/screenshot** engine (`cli/engine/engines/visual/screenshot-contrast.mjs`) for contrast checks against rendered pixels — but this is the most optional and least documented mode.

### B4. Delivery mechanisms

- **CLI:** `npx impeccable detect [file-or-dir-or-url...]` — Node.js CLI (`cli/bin/cli.js`), published to npm as `impeccable`. Zero runtime npm deps. Invoke: `npx impeccable src/` or `npx impeccable detect https://example.com`.
- **Browser extension:** Chrome Manifest V3 extension (`extension/`). Popup + devtools panel. Ships the bundled detector JS.
- **PostToolUse hook (Claude Code):** Wired via `.claude/settings.json` with `PostToolUse → Edit|Write|MultiEdit → node hook.mjs`. Fires the detector after every UI file edit; surfaces findings as system reminders. The skill script at `.claude/skills/impeccable/scripts/hook.mjs` runs the bundled detector on the changed file.
- **Cursor preToolUse hook:** Blocks proposed writes when the detector finds issues, before the write lands.
- **Codex/Gemini/Kiro/etc.:** The repo ships parallel skill copies for `.agents/skills/`, `.gemini/skills/`, `.kiro/skills/`, `.qoder/skills/`, `.trae/skills/`, `.rovodev/skills/` etc. (the multi-harness install mechanism).
- **Skill-local detect script:** `node .claude/skills/impeccable/scripts/detect.mjs` — the bundled detector available without an npm install, used by the SKILL.md routing logic.

### B5. Deterministic vs. LLM

**100% deterministic.** The detector is pure regex/DOM/AST checks with no LLM calls. It can run in CI, hooks, and headless environments without any API access. The closest it comes to heuristic is the monotonous-spacing check (statistical: >60% of spacing values identical) and the repeated-section-kickers check (counts ≥3 matching kickers). All are threshold-based, not model-based.

---

## Candidate Table

| Candidate | Layer | Dedup vs apex-ui-ux-design | Token-cost | Notes |
|-----------|-------|---------------------------|------------|-------|
| **Prose slop list** (absolute bans + AI slop test) | A | **already-have** — APEX has a `§ Generic-AI ("slop") detection` section with ~20 items, overlapping substantially (gradient text, glassmorphism, cream palette, border stripe, nested cards, eyebrow above every section, numbered markers, em-dash, buzzwords). Impeccable's list is more granular and has the two-altitude reflex test. | High — loaded every session | Minor additions possible (e.g. aphoristic-cadence copy, oversized h1 framing, reveal-animation gates content visibility); the two-altitude first/second-order reflex check is a structural addition not in APEX. |
| **Register concept** (brand vs product) | A | **partial** — APEX has `§ Industry-specific design reasoning` table but no named brand/product binary that drives different reference files. Impeccable's register drives which of 26 command references loads. APEX uses it implicitly via category lookup. | Low — a concept, not token-heavy | Could be integrated as a structured field in `design-brief.md`. |
| **PRODUCT.md / DESIGN.md per-project scaffold** | A | **already-have (partial)** — APEX's ADR-017 `design-brief.md` is ≈ PRODUCT.md + DESIGN.md merged. Anti-references in PRODUCT.md = APEX's "forbidden patterns". Format differs: Impeccable uses two separate root files; APEX uses one in `docs/technical/architecture/`. Structure is equivalent. | Zero (init-time only) | The "register" field in PRODUCT.md and the explicit anti-references section are the notable elements APEX doesn't yet formally name as distinct brief fields. |
| **Color strategy axis** (Restrained→Committed→Full palette→Drenched) | A | **novel** — APEX has no equivalent structured palette commitment scale. | Low (4-row table) | Strong, actionable. Could add as a decision step in § Aesthetic direction. |
| **Cream/beige palette tell with OKLCH range** (`L 0.84–0.97, C < 0.06, hue 40–100`) | A | **partial** — APEX slop list mentions the pattern generally; Impeccable gives the exact OKLCH range and the token-name tells (`--paper`, `--cream`, etc.). | Low (3 lines) | The OKLCH range is operationally precise; APEX could adopt it verbatim in the slop section. |
| **Motion: reveal-gated-on-class anti-pattern** | A | **novel** — "Don't gate content visibility on a class-triggered transition; transitions pause on hidden tabs/headless renderers, so the reveal never fires and the section ships blank." APEX's motion section (apex-animation) doesn't cover this failure mode. | Low (2 lines) | Genuinely novel and practically important. Belongs in APEX's motion rules or apex-animation. |
| **Two-altitude category-reflex test** (first-order vs second-order reflex) | A | **novel** — APEX has no equivalent; it lists slop patterns but not the concept of second-order reflexes (avoiding the first reflex and falling into a predictable second one). | Low (4 lines) | Conceptually important. Adds depth to the slop detection section without much token cost. |
| **44-rule deterministic detector (CLI + hook)** | B | **novel** — APEX has zero equivalent; all its slop detection is prose-only (LLM-judgment). Impeccable's detector is deterministic, zero-LLM, runs in CI/hooks, and is already PostToolUse-wired. | **Near-zero** (out-of-band) | **The key novel candidate.** APEX could adopt this in two ways: (1) reference `npx impeccable detect` in `apex-code/impl.md` as a verification recipe step after UI edits; (2) adopt the PostToolUse hook pattern into project settings. |
| **PostToolUse design-lint hook** | B | **novel** — APEX has no PostToolUse UI lint hook. Impeccable wires one in `.claude/settings.json` via `node hook.mjs` that fires after Edit/Write on UI files. | **Zero** (hook script is out-of-band) | Adoption path: add `npx impeccable hooks on` as a step in APEX's UI project setup flow. Token-free. |
| **Tailwind v4 / OKLCH resolver in detector** | B | n/a (implementation detail, not a skill concern) | Zero | Technically impressive; not a skill content concern. |
| **26 named sub-commands** (craft/shape/audit/critique/polish/bolder/quieter/distill/animate/colorize/typeset/layout/etc.) | A | **novel as structure** — APEX has no equivalent command vocabulary; it routes to domain specialists (apex-animation, apex-accessibility, etc.) rather than task-typed commands. | **HIGH** — each reference/*.md would add significant load if pulled in | This is Impeccable's primary architecture. Adopting the full command set would make apex-ui-ux-design into a replica of Impeccable. **Do not adopt.** The task-routing concept (naming design operations precisely) could be added more lightly as a routing table. |
| **Browser extension** | B | n/a — not a skill concern | Zero | Out-of-scope for APEX skill adoption. |
| **Palette seed script** (`palette.mjs`) | B | **novel** — APEX has no equivalent; it picks a brand-seed color via a deterministic script. | Zero (out-of-band) | Low-value adoption; APEX's design brief flow already covers color strategy. |

---

## Bottom Line: What Is Genuinely Novel vs. APEX

### Novel (worth considering):

1. **The deterministic detector CLI + PostToolUse hook** (Layer B, **novel**, near-zero token cost). This is the most meaningful gap. APEX's slop detection is prose-LLM-judgment; Impeccable's is a zero-LLM, CI-runnable, PostToolUse-wired linter. Adoption path: add a note in `apex-ui-ux-design/impl.md` or `apex-code`'s verification recipe: "if the project has `npx impeccable` available, run `npx impeccable detect <ui-files>` after each UI wave." Full hook adoption requires a coding-session step.

2. **Two-altitude category-reflex test** (Layer A, **novel**, Low cost). The second-order reflex concept — "you avoided cream but landed in the next predictable aesthetic lane" — is absent from APEX and genuinely tightens the slop check. 4 lines, low cost.

3. **Color strategy commitment axis** (Restrained→Committed→Full palette→Drenched) (Layer A, **novel**, Low cost). Structured; APEX has no palette-commitment decision framework.

4. **Reveal-gated-on-class anti-pattern** (Layer A, **novel**, Low cost). Technically precise and not covered in APEX's motion guidance.

5. **Cream/beige OKLCH range** (Layer A, **partial→novel in specificity**, Low cost). APEX names the pattern; Impeccable gives the exact OKLCH coordinates + token-name tells.

### Already-have / partial (do not re-propose):

- Prose slop list (substantial overlap; minor additions possible but marginal)
- PRODUCT.md / DESIGN.md scaffold (≈ APEX `design-brief.md`)
- Anti-references (= APEX "forbidden patterns")
- Register concept (partially covered by industry-specific table)
- Design rules for color/typography/layout/motion (significant overlap; Impeccable is more granular in some areas)

### Do not adopt:

- **26-command sub-command architecture** — HIGH token cost, creates an Impeccable replica inside APEX. The routing concept is fine; the full reference/*.md load is not.
- Browser extension, palette script, live-mode browser injection — out-of-scope.

---

_Generated: 2026-06-17. Source: git clone https://github.com/pbakaus/impeccable @ 1268f10 (Apache-2.0)._
