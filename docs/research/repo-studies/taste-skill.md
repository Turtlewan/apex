# Repo Study: taste-skill (Leonxlnx) — Source-Grounded Re-Run

_Research date: 2026-06-05_
_Clone SHA: 3c7017d636c3a4aad378433ea6d0cfa6c921da4a_
_CLONED: yes_

---

## 1. Identity

- **URL:** https://github.com/Leonxlnx/taste-skill
- **Commit SHA (HEAD):** `3c7017d636c3a4aad378433ea6d0cfa6c921da4a`
- **License:** MIT (Copyright 2026 Leonxlnx)
- **What it is:** Anti-slop frontend skill suite for Claude Code / Cursor / Codex. Installs via `npx skills add`. Fights generic AI aesthetic at the architecture level.
- **Skills in repo** (`skills/` folder, 13 entries):
  1. `taste-skill/` → name: `design-taste-frontend` (v2, 1206 lines — substantial rewrite of v1)
  2. `taste-skill-v1/` → name: `design-taste-frontend-v1` (226 lines — preserved legacy)
  3. `gpt-tasteskill/` → name: `gpt-taste`
  4. `minimalist-skill/` → name: `minimalist-ui`
  5. `brutalist-skill/` → name: `industrial-brutalist-ui`
  6. `brandkit/` → name: `brandkit`
  7. `image-to-code-skill/` → name: `image-to-code`
  8. `imagegen-frontend-web/` → name: `imagegen-frontend-web`
  9. `imagegen-frontend-mobile/` → name: `imagegen-frontend-mobile`
  10. `output-skill/` → name: `full-output-enforcement`
  11. `redesign-skill/` → name: `redesign-existing-projects`
  12. `soft-skill/` → name: `high-end-visual-design`
  13. `stitch-skill/` → name: `stitch-design-taste`

---

## 2. Per-Skill Upstream vs Local Comparison

| Upstream skill (path) | Local match path | Status | Novel rule? |
|---|---|---|---|
| `skills/taste-skill/SKILL.md` (v2, 1206 lines) | `skills/design-taste-frontend/SKILL.md` (226 lines) | **DIFFERENT — local is upstream v1 body** | Yes — see Section 3 |
| `skills/taste-skill-v1/SKILL.md` (226 lines) | `skills/design-taste-frontend/SKILL.md` | **Identical body** (frontmatter name/description differ only) | No |
| `skills/gpt-tasteskill/SKILL.md` | `skills/gpt-taste/SKILL.md` | **IDENTICAL** | No |
| `skills/minimalist-skill/SKILL.md` | `skills/minimalist-ui/SKILL.md` | **IDENTICAL** | No |
| `skills/brutalist-skill/SKILL.md` | `skills/industrial-brutalist-ui/SKILL.md` | **IDENTICAL** | No |
| `skills/brandkit/SKILL.md` | `skills/brandkit/SKILL.md` | **IDENTICAL** | No |
| `skills/image-to-code-skill/SKILL.md` | `skills/image-to-code/SKILL.md` | **IDENTICAL** | No |
| `skills/imagegen-frontend-web/SKILL.md` | `skills/imagegen-frontend-web/SKILL.md` | **IDENTICAL** | No |
| `skills/imagegen-frontend-mobile/SKILL.md` | `skills/imagegen-frontend-mobile/SKILL.md` | **IDENTICAL** | No |
| `skills/output-skill/SKILL.md` | `skills/full-output-enforcement/SKILL.md` | **IDENTICAL** | No |
| `skills/redesign-skill/SKILL.md` | `skills/redesign-existing-projects/SKILL.md` | **IDENTICAL** | No |
| `skills/soft-skill/SKILL.md` | `skills/high-end-visual-design/SKILL.md` | **IDENTICAL** | No |
| `skills/stitch-skill/SKILL.md` | `skills/stitch-design-taste/SKILL.md` | **IDENTICAL** | No |

**Summary: 12 of 13 upstream skills are byte-identical to local. 1 is different: the upstream v2 `taste-skill/SKILL.md` vs the local `design-taste-frontend/SKILL.md` which contains the v1 body.**

---

## 3. The One Difference: upstream `taste-skill` v2 vs local `design-taste-frontend` (v1)

The local `design-taste-frontend/SKILL.md` is the upstream v1 body (226 lines). The upstream default (`skills/taste-skill/SKILL.md`) is a **substantial 1206-line rewrite** with genuinely novel mechanisms APEX's cluster does not contain.

### Novel rules / mechanisms in upstream v2 (quoted from `skills/taste-skill/SKILL.md`):

**1. Design Read one-liner before any code (Section 0.B)**
> "Before any code, state in one line: **'Reading this as: \<page kind> for \<audience>, with a \<vibe> language, leaning toward \<design system or aesthetic family>.'**"
> "If the brief is ambiguous, ask one question, do not guess… Ask exactly **one** clarifying question - never a multi-question dump."

**2. Dial inference lookup table — vibe words → numeric values (Section 1.A)**
> | Signal | VARIANCE | MOTION | DENSITY |
> | "minimalist / clean / calm / editorial / Linear-style" | 5-6 | 3-4 | 2-3 |
> | "trust-first / public-sector / regulated / accessibility-critical" | 3-4 | 2-3 | 4-5 |
> | "redesign - preserve" | match existing | +1 | match existing |

No local skill maps vibe-words to dial values with this table.

**3. Brief → Design System map: when to reach for an official package vs. build custom (Section 2.A)**
> "Microsoft / enterprise SaaS / dashboards → `@fluentui/react-components`"
> "Google-ish UI, Material-flavored product → `@material/web` + Material 3 tokens"
> "Shopify app surfaces → `polaris.js`"
> "**Honesty rule:** if the brief reads as one of the systems above, install and use the **official** package. Do not recreate its CSS by hand."
> "**One system per project.** Do not mix Fluent React with Carbon in the same tree."

No local skill contains a design-system routing table of this specificity.

**4. Serif discipline with a ban list of specific typefaces (Section 4.1)**
> "**Specifically BANNED as defaults:** `Fraunces` and `Instrument_Serif` (the two LLM-favorite display serifs)."
> "**EMPHASIS RULE:** When you want to emphasize a word within a headline, use **italic or bold of the SAME font**. Do NOT inject a random serif word into a sans headline (or vice versa) just to add visual interest. Mixed-family emphasis is amateur."
> "**ITALIC DESCENDER CLEARANCE (mandatory):** When italic is used in display type and the word contains a descender letter (`y g j p q`), `leading-[1]` or `leading-none` will clip the descender. Use `leading-[1.1]` minimum and add `pb-1` or `mb-1` reserve."

**5. Premium-consumer palette ban with specific hex families (Section 4.2)**
> "Backgrounds: `#f5f1ea`, `#f7f5f1`, `#fbf8f1`, `#efeae0`, `#ece6db`, `#faf7f1`, `#e8dfcb` (all 'warm paper / cream / chalk / bone') — BANNED as default reach for premium-consumer briefs."
> "Accents: `#b08947`, `#b6553a`, `#9a2436`, `#9c6e2a`, `#bc7c3a`, `#7d5621` (all 'brass / clay / oxblood / ochre')"
> "Text: `#1a1714`, `#1a1814`, `#1b1814` (all 'espresso / warm near-black')"

**6. GSAP canonical skeletons — Sticky Stack and Horizontal Pan (Section 5.A/B)**
> Full working TSX implementations of `StickyScrollStack` and `HorizontalPan` with exact `ScrollTrigger` params (`start: "top top"`, `pin: true`, correct `scrub`) and React `ctx.revert()` cleanup. Pre-flight check verifies these exact skeletons were used.

**7. Dark mode protocol as mandatory (Section 8)**
> "Design for **both modes from the start**. Never ship light-only or dark-only without explicit user instruction."
> "**No pure `#000000` and no pure `#ffffff`** — use off-black (zinc-950, near-black warm gray) and off-white."
> "**Test in Both Modes Before Finishing.** Open the page in both modes during development."

**8. AI Tells: em-dash hard ban (Section 9.G)**
> "**ZERO em-dashes (`—`) anywhere on the page.** Headlines, eyebrows, pills, body, quotes, attribution, captions, buttons, alt text. Zero. (Section 9.G - non-negotiable.)"

**9. Reference vocabulary of named patterns (Section 10)**
> Named glossary of ~50 named UI patterns (Kinetic Marquee, Chroma Grid, Hover Image Trail, Dynamic Island, Morphing Modal, etc.) with the rule: "The agent should KNOW these pattern names to communicate about them."

**10. Redesign protocol with explicit SEO preservation rules (Section 11)**
> "**SEO migration is the #1 redesign risk.** … Do not change information architecture unless asked. Keep page slugs, anchor IDs, primary nav labels stable."
> "Never modify without explicit user approval: URL structure / route slugs, Primary nav labels, Form field names or order (breaks analytics + autofill)."

**11. 55-item pre-flight checklist (Section 14)**
> Mechanical binary checklist covering: brief inference declared, em-dash count is zero, page theme lock (no mid-page light/dark flips), color consistency lock, shape consistency lock, button contrast, CTA wrap, eyebrow count ≤ ceil(sectionCount/3), zigzag alternation cap, duplicate CTA intent ban, marquee max-one-per-page, section-layout-repetition check, etc.

**12. Apple Liquid Glass honest web approximation (Appendix C)**
> "There is no `liquid-glass.css` from Apple for normal websites… Label it as [approximation] in comments."
> Full CSS skeleton (`backdrop-filter` + layered borders) labeled explicitly as approximation.

---

## 4. Candidate Table

| Candidate | Lens | Dedup against APEX cluster | Token cost | Verdict |
|---|---|---|---|---|
| `taste-skill` v2 (`design-taste-frontend` upgrade) | Core anti-slop frontend skill | Local has v1 body (226 lines); v2 is 5x larger and substantially different | Medium-high (~1200 lines; replaces, doesn't add to, cluster) | **CONDITIONAL ADOPT** — see rationale |
| All other 12 skills | Same as local | Byte-identical to local files | Zero (no change) | **REJECT** — already have |

### Rationale for CONDITIONAL ADOPT on v2

The upstream v2 `design-taste-frontend` is a genuine substantial rewrite, not a minor update. Novel mechanisms it adds that none of APEX's existing cluster contains:
- The "Design Read" one-liner gate (brief inference before code)
- Vibe-word → dial-value lookup table
- Official design-system routing map (Fluent, Carbon, Polaris, Primer, GOV.UK, shadcn, etc.)
- Specific hex-family bans for the premium-consumer palette trap
- Specific typeface bans (Fraunces, Instrument_Serif) plus italic descender clearance rule
- GSAP canonical skeletons with exact ScrollTrigger parameters
- Mandatory dual dark/light mode protocol
- Em-dash hard ban
- Named pattern vocabulary (~50 patterns)
- SEO-preservation redesign protocol with "never silently change" list
- 55-item binary pre-flight checklist

These are all verifiable, actionable rules absent from the local v1. The dedup concern is that the 12 other skills are unchanged, so this is a single-file upgrade (replace `~/.claude/skills/design-taste-frontend/SKILL.md` with the v2 content). Token cost is real — v2 is 5x the v1 — but it replaces the existing slot rather than adding a new cluster member.

**Condition:** The upgrade is a straight replacement of one file. APEX's other design skills (gpt-taste, minimalist-ui, etc.) are already current. No new skills need to be added; only `design-taste-frontend/SKILL.md` would be swapped to the v2 body.

---

## 5. Bottom Line

12 of 13 upstream skills are byte-identical to local installed versions — zero absorption value for those. The single meaningful finding is that **the local `design-taste-frontend` skill is the upstream v1 body (226 lines), while the upstream default has been substantially rewritten as v2 (1206 lines)**. The v2 contains ~12 novel mechanisms absent from the entire APEX design cluster. The absorption action, if approved, is a single-file replacement of `~/.claude/skills/design-taste-frontend/SKILL.md` with the v2 content from `skills/taste-skill/SKILL.md` at commit `3c7017d`.

**CLONED: yes**
