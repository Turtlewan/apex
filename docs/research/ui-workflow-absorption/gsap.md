# GSAP — Dedup-aware absorption pass (apex-animation)

Date: 2026-06-20 · Protocol: report only, no skill edits.

## Verdict: ALREADY-HAVE (one small ABSORB)

apex-animation already covers GSAP thoroughly for a planning/coding decision skill.
GSAP's 2026 story is overwhelmingly *library facts a frontier coding model reproduces
cold* (RED-probe mindset → REJECT). The only genuine, behaviour-shaped gap is the
React integration contract (`@gsap/react` `useGSAP`), and even that is borderline.

---

## Step 1 — Current APEX coverage (verified in files)

SKILL.md:
- § Library selection table — Motion vs GSAP vs ScrollTrigger vs View Transitions vs MagicUI.
- § GSAP licensing — "100% free since 30 Apr 2025 (Webflow acquisition), all Club plugins
  (SplitText, MorphSVG, DrawSVG) free for commercial; SplitText rewritten ~50% smaller."
- Stack-assumptions row — GSAP timeline / ScrollTrigger as the sequence/scroll path.
- Escalation: FLAG GSAP for CSS-achievable transitions; FLAG Motion used for SVG morph.

impl.md:
- § GSAP scroll-linked pattern — `registerPlugin(ScrollTrigger)` + reduced-motion guard +
  `gsap.from(... scrollTrigger:{trigger,start})`.
- NEVER: GSAP for simple show/hide achievable with CSS/Motion.
- Flag-for-planning: MorphSVG vs Motion; ScrollTrigger vs Motion scroll APIs.

So: licensing, plugin-free status, ScrollTrigger, MorphSVG decision, and the
GSAP-vs-Motion routing are **all already present**.

---

## Step 2 — 2026 research findings

- **Licensing/Webflow**: GreenSock acquired by Webflow Oct 2024; entire toolset incl. all
  former Club plugins free (incl. commercial) since Apr 2025. Webflow Interactions now
  GSAP-powered (summer 2025). → APEX already states this.
- **Plugins now free**: ScrollTrigger, Flip, SplitText, MorphSVG, DrawSVG, MotionPath. APEX
  names SplitText/MorphSVG/DrawSVG; does not name Flip or MotionPath explicitly.
- **`@gsap/react` / `useGSAP`**: official React integration. Drop-in for
  `useEffect`/`useLayoutEffect`; wraps `gsap.context()` so all GSAP created inside is
  **auto-reverted on unmount**; `scope` ref scopes selector text to the component;
  `dependencies` array controls re-run; `contextSafe()` wraps animations created in event
  handlers so they're also tracked for cleanup. APEX has **no React-GSAP snippet** (its only
  GSAP code is a vanilla ScrollTrigger block).
- **GSAP-beats-Motion cases (2026 consensus)**: complex multi-step timelines/sequencing;
  scroll storytelling (ScrollTrigger scrub/pin); SVG path morph (MorphSVG) and path motion;
  text reveals (SplitText); high element counts (60+ animating together / 15+ scroll
  triggers) where the imperative engine outperforms. Motion wins for declarative React UI:
  hover/press, layout, AnimatePresence exit, tab/toggle. APEX's selection table already
  encodes this split correctly.

---

## Step 3 — Candidate classification

| Candidate | Class | Note |
|-----------|-------|------|
| GSAP free / all plugins free / Webflow acquisition | ALREADY-HAVE | SKILL § GSAP licensing |
| ScrollTrigger usage + reduced-motion guard | ALREADY-HAVE | impl § GSAP scroll-linked pattern |
| MorphSVG vs Motion routing | ALREADY-HAVE | SKILL escalation + impl flag |
| GSAP-vs-Motion "when each wins" split | ALREADY-HAVE | SKILL § Library selection |
| SplitText / DrawSVG named | ALREADY-HAVE | SKILL § GSAP licensing |
| Flip / MotionPath plugin names | REJECT | Model knows these cold; naming 2 more plugins adds no decision. Not worth a line. |
| "Use GSAP at 60+ elements / 15+ scroll triggers" heuristic | REJECT (borderline) | A scale heuristic, not in APEX. But it's soft/blog-sourced and the existing "GSAP for complex/scroll, Motion for UI" split already routes correctly. Adding a numeric threshold invites false precision. |
| GSAP imperative vs Motion declarative; "can use both" | REJECT | Generic library philosophy; model reproduces cold. |
| **`@gsap/react` `useGSAP` cleanup contract** | **ABSORB (small)** | The one *behaviour rule* with teeth: GSAP in React without `useGSAP` leaks animations / fails Strict Mode double-invoke. This is a "do it this way" rule, not trivia. |

---

## ABSORB item (single)

**`useGSAP` for all React-GSAP work** → target: **impl.md**, immediately after the existing
"GSAP scroll-linked pattern" block (so the React contract sits beside the vanilla one).

~8–10 lines:

```tsx
// React: always drive GSAP through useGSAP (never raw useEffect — leaks on unmount + StrictMode double-invoke)
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
gsap.registerPlugin(useGSAP)

function Hero() {
  const scope = useRef(null)
  useGSAP(() => {
    // selectors scoped to `scope`; auto-reverted on unmount
    gsap.from(".title", { opacity: 0, y: 40, duration: 0.6 })
  }, { scope })           // deps: [] re-run control; contextSafe() for event-handler tweens
  return <section ref={scope}>...</section>
}
```

Plus one NEVER line in impl § NEVER do:
- (web/React) Drive GSAP from a raw `useEffect` — use `useGSAP` from `@gsap/react`; it
  scopes selectors and auto-reverts on unmount (raw effects leak + double-fire in StrictMode).

**Token cost**: ~12 lines / ~110 tokens total.

**Why it clears the RED-probe bar**: it's not "what GSAP is" — it's a project-specific
*do-this-not-that* that prevents a real, repeated DeepSeek failure mode (React leak / Strict
Mode double-init). Behaviour rules earn their place; this is one.

---

## Single highest-value recommendation

Add the `useGSAP` NEVER-line + 8-line snippet to **impl.md** (~110 tokens). It is the only
GSAP item that changes what gets built rather than restating what a model already knows.
Everything else about GSAP's 2026 state is already in apex-animation or is model-redundant —
**reject the rest**, including naming more plugins (Flip/MotionPath) and the numeric
"60+ elements" heuristic.
