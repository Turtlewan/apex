# Absorption Pass — HyperFrames

_Date: 2026-06-20 · Protocol: dedup-aware absorption, report-only (no skill edits)_

## Step 1 — Identification

**HyperFrames** is an **open-source HTML-to-video rendering framework built by HeyGen**,
designed specifically for AI coding agents.

- **Confidence: HIGH.** Single dominant referent; no meaningful ambiguity once searched. The
  name superficially suggests "frames" (UI/Framer), but every authoritative source (the
  `heygen-com/hyperframes` GitHub repo, `hyperframes.heygen.com` docs, MindStudio write-up)
  describes the same thing: **deterministic video generation from HTML**.
- It is **NOT** a UI design tool, prototyping product, or design-to-code tool. It produces
  **MP4 video**, not interfaces or components.

**What it does:**
- You write a video as a plain **HTML document**. Elements carry data attributes for timing
  (`data-start`, `data-duration`) and layout (`data-track-index`).
- A **headless Chrome + FFmpeg** pipeline renders the HTML frame-by-frame into a deterministic
  MP4 (same input → identical output; good for CI and bulk templated video).
- Animation runtimes: **GSAP, CSS animations, Lottie, Three.js, Anime.js, Web Animations API**,
  or any seekable runtime via a "Frame Adapter" pattern.
- **Agent-first integration:** installable skills (`npx skills add heygen-com/hyperframes`) for
  Claude Code / Cursor / Gemini CLI. The agent loop is plan → author HTML → wire animation →
  add media → lint → preview → render. CLI: `init`, `preview` (live reload), `render`, `add`.
- Use cases: product-launch / feature-announcement videos, docs-to-video & website-to-video
  explainers, animated data-viz, kinetic-caption social clips, PR/code-diff walkthroughs.

**Other candidates considered (and rejected as the referent):** Framer "frames", generic design
"hyperframe" wireframing terms — none have a real product behind them in the AI-UI-build context.
The HeyGen framework is unambiguously the intended target.

## Step 2 — Relevant existing APEX surface

- **apex-animation/SKILL.md** (read): owns *interface* motion — transitions, scroll effects,
  micro-interactions, reduced-motion, timing/easing, GSAP/Motion/SwiftUI. It is about animating
  **live UI**, not rendering **video files**. GSAP/Lottie/Web Animations overlap *only* at the
  primitive-library level, not at the workflow level.
- **No APEX skill provides HTML-to-video / motion-graphics / video-export generation.** Searched
  the full skill set — closest is `design-motion-principles` (UI motion design), still not video.
- apex-ui-ux-design (cheap-mockup / prompt-to-design) and apex-figma (design-to-code) are
  **out of scope** — HyperFrames is neither.

## Step 3 — Capability classification

| Capability | Verdict | Reasoning |
|---|---|---|
| HTML-as-video-composition model (data-attr timeline) | **REJECT** (out-of-scope) | Video generation is not an APEX domain. APEX builds *applications and their UIs*, not marketing/explainer video assets. No project need on record. |
| Headless-Chrome + FFmpeg deterministic render pipeline | **REJECT** (out-of-scope + rival tooling) | Specific product infrastructure; would be a brand-new domain skill, not an absorb into the UI workflow. |
| Agent-driven video production loop (plan→author→render) | **REJECT** (niche + rival tooling) | This is HyperFrames' *own* agent workflow — a competing skill-system for a domain APEX doesn't cover. Absorbing it would mean **adopting a new domain wholesale**, not deduping the UI workflow. Violates "never let rival coding workflows co-exist" unless APEX actually wants the domain. |
| Animation runtimes (GSAP / Lottie / CSS / WAAPI) | **ALREADY-HAVE** | apex-animation already owns GSAP/Motion/CSS selection + licensing + reduced-motion. Model knows Lottie/WAAPI cold. Nothing missing. |
| "Talk to a director, not learn an SDK" agent-ergonomics framing | **REJECT** (model-redundant) | Generic prompt-ergonomics philosophy a capable model already applies; no token-worthy rule. |

**No ABSORB items.**

## Recommendation

**Reject wholesale — absorb nothing.** HyperFrames is a capable, agent-native tool, but it is a
**video-generation framework in a domain APEX does not currently cover** (UI building, not video
production). It is not design-to-code, not prototyping, and not UI animation, so there is no
overlap with apex-animation / apex-ui-ux-design / apex-figma to dedup against, and nothing to add
to the UI workflow.

If the user ever wants APEX to **produce marketing/explainer/demo videos** as a deliverable, the
correct move is a **separate, deliberate new-domain decision** (a fresh `apex-video` or similar
skill via apex-skill-author), evaluated on its own merits — **not** an absorption into the UI
workflow. Flag for the user as an optional future direction, not a gap.

**Token cost of absorbing anything here: not justified (0 ABSORB).**

## Sources
- https://github.com/heygen-com/hyperframes
- https://hyperframes.heygen.com/quickstart
- https://github.com/heygen-com/hyperframes/blob/main/docs/guides/claude-design-hyperframes.md
- https://www.mindstudio.ai/blog/what-is-hyperframes-html-video-renderer-ai-agents
