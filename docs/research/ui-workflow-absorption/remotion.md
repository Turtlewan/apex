# Absorption pass — Remotion (programmatic video in React)

_Date: 2026-06-20 · Mode: planning · Protocol: dedup-aware absorption, report-only (no skill edits)._

## Verdict: REJECT / DEFER

Programmatic video generation is **out of scope** for APEX's UI-building workflow as it
stands. No current or near-term project needs it. Recommend **DEFER** with one concrete
trigger condition (below); do not author a skill, do not fold into an existing skill yet.

---

## Step 1 — Current APEX coverage (boundary established)

- **apex-animation** — UI *motion*: transitions, entrance/exit, scroll effects, gestures,
  page transitions, micro-interactions. Explicitly **NOT video rendering**. Libraries are
  Motion / GSAP / CSS (web) and SwiftUI built-ins (native). Output = animated DOM/views in a
  running app, never a rendered media file.
- **apex-ui-ux-design** — screen/flow/visual-identity design; owns the design-brief and
  app-flow artifacts, the cheap-mode mockup loop, and the visual review gate. The closest it
  gets to "render to image" is screenshots/PNGs **of UI for review**, not produced video.
- **No video / Remotion / "render to MP4" skill exists.** Confirmed by glob
  (`apex-{video,remotion,media}`) and a content grep across all skills
  (`remotion|programmatic video|render mp4|video render`) — zero hits.

**Boundary:** APEX animates *interfaces*; nothing in it *produces a video file* as a
deliverable. Remotion sits on the far side of that line — it is a media-production tool, not
a UI-building tool.

## Step 2 — What Remotion is (2026)

- **Core capability:** write a video as React/TypeScript components (compositions on a
  frame timeline), then **render a real MP4/H.265/ProRes/etc. file**. Output is a media
  artifact, not a live interface. `<Player>` can embed a composition in a React app for
  preview/parameterization.
- **Use cases:** programmatic / **data-driven video at scale** — personalized marketing
  clips, year-in-review summaries, data-viz videos that re-render on fresh data, automated
  social/e-learning content from templates + variables.
- **Remotion Lambda:** distributed renderer on AWS Lambda; "minutes of video for pennies."
  Cost = AWS compute + (for companies) the Remotion licence fee.
- **Remotion Skills (Jan 2026):** an agent layer letting an AI assistant generate/modify/
  render Remotion videos from natural language. Notable: it emits **deterministic source
  code** (same prompt → same video, frame-editable) — the opposite of pixel generators
  (Sora/Runway), which are non-deterministic and non-editable.
- **Licensing (company-size gated):** free for individuals + companies ≤3 people (incl.
  commercial). 4+ employees → Company Licence, **$100/mo minimum** (4 seats @ $25).
  Enterprise from **$500/mo**. The licence is on top of AWS render cost.

## Step 3 — Is programmatic video IN SCOPE for APEX's UI workflow?

**No.** Three reasons:

1. **Different domain, different deliverable.** apex-animation animates a live UI; Remotion
   *produces a video file*. They share "React" and "timeline" vocabulary but the output,
   the consumer, and the success criteria are unrelated. Folding video into apex-animation
   would blur its crisp "UI motion, not video rendering" boundary — exactly the kind of
   scope-creep the skill explicitly guards against.

2. **No demand.** No APEX-built project today renders video. A skill with zero pull is
   speculative configurability — violates the project's Simplicity-First stance and the
   [[absorption-red-probe-before-content]] memory (content earns its place only on a clear
   pull). The frontier model already knows Remotion exists; nothing here needs a skill to
   *trigger* its use.

3. **Artemis (personal assistant) pull — weak/absent.** Plausible-but-thin paths: an
   assistant that auto-generates a "your week in review" clip, or data-viz video summaries.
   But (a) that's a *feature idea*, not a current requirement, and (b) even if Artemis
   wanted it, it's a backend/media-pipeline concern (render job → file → deliver), closer to
   apex-jobs + apex-storage + apex-ai-systems than to the UI workflow. It would **not** enter
   via the UI lane. So: no pull strong enough to act on; do not invent demand.

### Why not NEW SKILL (now)

A real apex-video skill would need: composition model, the `<Player>` vs render split,
Lambda vs local/CI rendering, the company-size licence gate as a cost trap, codec/container
selection, and the "deterministic code vs pixel-gen" framing. Rough scope ≈ a 200–350-line
SKILL.md + impl.md — a **non-trivial always-considered-during-routing token cost** for a
domain with no consumer. Not justified.

### Why not FOLD

There is no thin, natural home. apex-animation is the tempting target and the explicitly
wrong one (it disclaims video). Bolting a render-to-MP4 paragraph onto a UI-motion skill
would be the worse outcome — it imports a whole media-production domain under a label that
promises the opposite.

## Recommendation

**DEFER.** Take no action now. Revisit **only when a concrete project requires producing a
video artifact** (the trigger: a spec/requirement says "generate/render a video" — e.g.
Artemis ships a video-summary feature, or a marketing-clip-at-scale need appears). At that
point:

- If the need is one-off/small → handle it inside that project's specs using
  apex-jobs (render job) + apex-storage (output file) + apex-ai-systems (if AI-scripted),
  no new skill.
- If video generation becomes **recurring across projects** → *then* author **apex-video**
  as a distinct domain (NOT a fold into apex-animation), and add the Remotion company-size
  licence as a first-class cost gate. Run the Iron Law baseline test first
  ([[absorption-red-probe-before-content]]) — much of Remotion's API may be model-known and
  need only thin behaviour rules.

No skill edits made (report-only protocol honoured).

## Sources

- [Remotion — make videos programmatically](https://www.remotion.dev/)
- [Remotion Lambda — distributed renderer](https://www.remotion.dev/lambda)
- [Remotion license & pricing](https://www.remotion.dev/docs/license) · [company licensing](https://www.remotion.pro/license)
- [Remotion (2026) overview — toolworthy.ai](https://www.toolworthy.ai/tool/remotion)
- [Remotion Skills 2026 — gaga.art](https://gaga.art/blog/remotion-skills/)
- [Dynamic video with React + Remotion — Qubika](https://qubika.com/blog/dynamic-video-creation-react-remotion/)
- [Remotion Claude (deterministic code vs pixel-gen) — remotionvideo.com](https://www.remotionvideo.com/remotion-claude)
- [GSAP vs Motion (UI-animation boundary) — motion.dev](https://motion.dev/docs/gsap-vs-motion)
