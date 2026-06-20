# Absorption Pass — Google Stitch into the APEX UI workflow

_Date: 2026-06-20 · Mode: planning (Anthropic) · Protocol: report-only, no skill edits._

## Headline verdict

**REJECT-as-new-content / it's already absorbed.** Google Stitch is *not* a new workflow to add —
it is **already the named web lane** of the prompt-to-design system in `apex-ui-ux-design/SKILL.md`
(§ Prompt-to-design lanes). It correctly sits as a **TOOL option inside the existing cheap-mockup /
prompt-to-design lane**, not new skill prose. The only action worth taking is a **factual
correction** to an inaccurate claim already in the skill (its export format), costing ~0 net tokens.

## What APEX already has (verified in-repo)

`apex-ui-ux-design/SKILL.md` § "Prompt-to-design lanes" (lines ~309–366) already encodes Stitch fully:
- **Lane table** maps target stack → tool: **Web (+ Tauri/Electron) → Google Stitch**; SwiftUI → Bitrig;
  Flutter → FlutterFlow; .NET → Uno; etc. (the exact "name it as a tool option" absorb the brief asks for).
- **Detail line:** "Web → Google Stitch (free; prompt → React + agent-readable `DESIGN.md`). Browser
  tool on the user's Google account (free tier ~350 + 200 gens/mo)."
- **The 6-step loop** (screen brief → author prompt → user generates/iterates → lock + fold into
  `design-brief.md` → feed build → visual gate) — planning authors the prompt, user drives the browser
  tool, output folds into the brief, never wired straight to the coder.
- **Aesthetic guardrail:** "brief's art-direction + APEX anti-slop rules outrank any tool's house
  aesthetic; pair `stitch-design-taste` only if Stitch's look is wanted."
- **Stack-matched reuse:** Stitch's web output feeds a React project directly; cross-stack it's a
  reference-to-interpret, never traced (image-less coder gets brief text, not the image).

Prior research already on disk: `docs/research/swiftui-design-tooling/ws-a-prompt-to-design.md`
(Stitch web-only core, SwiftUI unconfirmed), `docs/research/cross-platform-design-tooling.md`
(Tauri/Electron → Stitch applies). Parked user task in `status.md`: "set up free Google Stitch account."

**Conclusion:** there is no missing workflow. The cheap-mockup lane already accommodates Stitch.

## Stitch 2026 — current capabilities (research)

- **Generation:** Gemini-powered text/voice/image → UI. "Vibe design," voice canvas, 5-screen canvas,
  interactive prototyping (Stitch 2.0, March 2026). Web is the strong surface; mobile thinner.
- **Export (CORRECTION — see below):** **HTML/CSS only** is the official code export. **No direct
  React / Vue / SwiftUI export yet** — React is on the leaked roadmap, not shipped. Bridges:
  **export to Figma** (for refinement), **MCP server** (`davideast/stitch-mcp`, Astro routing), and
  **Google AI Studio / Antigravity** hand-off for full app build.
- **Free tier:** **550 generations/month** = 350 standard (Gemini 3.0/2.5 Flash) + 200 experimental/Pro
  (Gemini 3.0/2.5 Pro). Fully free; paid plans expected Q4 2026. No team/multiplayer/version-history.

## The one factual error to fix (the only real "absorb")

The skill's detail line says Stitch outputs **"React + agent-readable `DESIGN.md`."** That is **wrong
at the official-product level** — Stitch exports **HTML/CSS** (+ Figma + MCP/Antigravity). "React" and a
"`DESIGN.md`" artifact are **community-MCP-wrapper** behaviour, not Google-shipped. This matters because
the literal coder is told to expect a React/`DESIGN.md` handoff that the official tool doesn't produce.

- **Target:** `apex-ui-ux-design/SKILL.md`, § Prompt-to-design lanes, the "Web → Google Stitch" detail
  line (~line 334) and the step-5 "Stitch's `DESIGN.md`" reference (~line 354).
- **Suggested replacement (planning to apply in a future edit, NOT now):**
  "Web → Google Stitch (free; prompt/voice/image → **HTML/CSS**, export to **Figma** or via **MCP /
  Antigravity**; React export roadmapped, not shipped). Browser tool on the user's Google account
  (free tier 550 gens/mo: 350 Flash + 200 Pro)." And in step 5, replace "Stitch's `DESIGN.md`" with
  "Stitch's HTML/CSS (and the Figma export when used)."
- **Token cost:** ~0 net (edits existing lines; ~+5 tokens). **No new section, no new prose.**
- **Optional:** the lane already lists Stitch's **Figma export** path implicitly via apex-figma's
  design-to-code pipeline; no new cross-link needed — apex-figma's existing Figma→code path already
  receives a Stitch→Figma export with zero changes.

## Where Stitch sits vs the other lanes (all already in APEX)

| Tool | Output | Free | Best for | APEX status |
|------|--------|------|----------|-------------|
| **Google Stitch** | HTML/CSS (+ Figma / MCP / Antigravity); React roadmapped | 550 gens/mo | **Web** prompt-to-UI, the default web lane | named web lane ✅ |
| **Figma Make** | interactive prototype / app (throwaway) | Figma plan | quick prompt-to-prototype, *not* production handoff | covered in apex-figma § Figma Make ✅ |
| **v0 (Vercel)** | **React + Tailwind/shadcn** production code | freemium | when you want *code-first* React output, not a design surface | not a named lane (see note) |
| **Bitrig** | **real SwiftUI source** + Xcode project | free/~$20·mo | **Apple-native** — no web→SwiftUI translation tax | named native lane ✅ |

**Stitch vs v0:** Stitch is design-surface-first (HTML/CSS → Figma), v0 is code-first (React/shadcn).
For APEX's flow the distinction is small because **tool output folds into `design-brief.md`, never
wires straight to the coder** — DeepSeek rebuilds from the brief. So v0's "production React" advantage
is mostly neutralised by the brief-as-single-source-of-truth contract; v0 doesn't earn a separate lane.
**Stitch vs Figma Make:** Stitch = lock a design → fold into brief; Figma Make = throwaway prototype
(apex-figma already warns "don't route production work through Make output"). **Stitch vs Bitrig:**
orthogonal — Stitch=web, Bitrig=Apple-native; the lane table already picks by target stack.

## Recommendation

1. **Do NOT add new workflow prose or a new skill.** The cheap-mockup / prompt-to-design lane already
   names Stitch as the web tool option — exactly the minimal absorb the brief biases toward, already done.
2. **One factual-correction edit** (defer to a coding/edit pass, or a planning one-off since this is the
   APEX project itself which is write-guard-exempt): fix the Stitch detail line from "React + `DESIGN.md`"
   to "HTML/CSS (+ Figma / MCP / Antigravity)" and update the free-tier number to **550/mo (350+200)**.
   ~0 net tokens, no structural change.
3. **No apex-figma change needed** — its existing Figma→code path absorbs a Stitch→Figma export as-is.
4. Leave the parked user task ("set up free Google Stitch account") as the only open action; once the
   account exists the lane is live with zero further skill work.

## Sources

- [Google Stitch Pricing 2026 (NxCode)](https://www.nxcode.io/resources/news/google-stitch-pricing-plans-complete-guide-2026)
- [Google Stitch Complete Guide 2026 (NxCode)](https://www.nxcode.io/resources/news/google-stitch-complete-guide-vibe-design-2026)
- [AI Design Tools 2026: Figma vs v0 vs Stitch (ortemtech)](https://ortemtech.com/blog/ai-design-tools-comparison-2026-figma-v0-google-stitch/)
- [ALM Corp — Stitch 2026 guide](https://almcorp.com/blog/google-stitch-complete-guide-ai-ui-design-tool-2026/)
- In-repo: `apex-ui-ux-design/SKILL.md` § Prompt-to-design lanes; `docs/research/swiftui-design-tooling/ws-a-prompt-to-design.md`; `docs/research/cross-platform-design-tooling.md`
