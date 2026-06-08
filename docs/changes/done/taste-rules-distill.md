# Spec: distill verified taste rules into apex-animation + apex-ui-ux-design

**Identity:** Add a small set of source-verified animation/UI craft rules (from the co-installed
`emil-design-eng` and `design-taste-frontend` v1+v2 skills) into `apex-animation` and
`apex-ui-ux-design`. Source report: `docs/research/repo-studies/taste-skill.md` (CLONED, cited).
Distillation only — no wholesale skill swap, no new skill.

> File-count note: touches 4 skill files (2 skills × SKILL+impl) + SKILL-HISTORY.md. Kept as one
> spec because it is a single coherent distillation with surgical, fully-specified insertions (zero
> exploration). Execute as two independent tasks.

## Files to change
1. `~/.claude/skills/apex-animation/SKILL.md` (modify) — v1.1.0 → 1.2.0
2. `~/.claude/skills/apex-animation/impl.md` (modify) — v1.2.0 → 1.3.0
3. `~/.claude/skills/apex-ui-ux-design/SKILL.md` (modify) — v1.3.0 → 1.4.0
4. `~/.claude/skills/apex-ui-ux-design/impl.md` (modify) — v1.2.0 → 1.3.0
5. `~/apex/SKILL-HISTORY.md` (modify) — prepend 4 rows (newest first)

All: set `last_updated: 2026-06-05`; add the new source line(s) to frontmatter `sources:`.

---

## Task 1 — apex-animation

### 1a. `apex-animation/SKILL.md`
- Frontmatter: bump `version: 1.2.0`, `last_updated: 2026-06-05`; add source
  `- Emil Kowalski design-engineering — animations.dev`.
- **Insert a new section immediately before `## Timing guidelines`:**

```markdown
## Should it animate at all? (decide before "how")

Motion budget is a function of frequency — decide by how often the user sees it:

| Frequency | Decision |
|-----------|----------|
| 100+×/day (keyboard shortcuts, command palette) | No animation, ever |
| Tens×/day (hover, list nav) | Remove or drastically reduce |
| Occasional (modals, drawers, toasts) | Standard animation |
| Rare / first-time (onboarding, celebration) | Can add delight |

**Never animate keyboard-initiated actions** — they repeat hundreds of times/day; motion makes
them feel laggy (Raycast's command palette has no open/close animation by design).
```

- **In `## Timing guidelines`, append below the table:**

```markdown
**Never use `ease-in` for UI** — it delays the start, exactly where the eye is watching, so it
feels slower than `ease-out` at the same duration. Built-in curves are weak; prefer a strong
custom curve, e.g. `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`.
```

- **In `## Accessibility rules`, append:**

```markdown
- Reduced motion means *fewer and gentler*, not none — keep opacity/colour transitions that aid
  comprehension; remove movement, position, and scale. (The impl global kill-all is the safe
  floor; prefer per-component reduced variants where feasible.)
```

### 1b. `apex-animation/impl.md`
- Frontmatter: bump `version: 1.3.0`, `last_updated: 2026-06-05`; add source
  `- Emil Kowalski design-engineering — animations.dev`.
- **Append to `## NEVER do`:**

```markdown
- Use `ease-in` for UI transitions — it delays the start; use `ease-out` or a strong custom curve (`cubic-bezier(0.23, 1, 0.32, 1)`)
- Animate an element in from `scale(0)` — nothing appears from nothing; start at `scale(0.95)` + `opacity: 0`
- Use `@keyframes` for rapidly-retriggered UI (toasts, toggles) — keyframes restart from 0 on interrupt; use CSS transitions / springs, which retarget mid-flight
- (web) Animate via Motion's `x`/`y`/`scale` shorthand under load — they run on the main thread (rAF) and drop frames; use the full transform string: `animate={{ transform: "translateX(100px)" }}`
```

- **Append to `## ALWAYS do`:**

```markdown
- (web) Scale popovers/menus from their trigger: `transform-origin: var(--radix-popover-content-transform-origin)` (Base UI: `var(--transform-origin)`) — **modals are exempt, keep them centered**
- Make exit faster than enter — slow where the user decides, snappy where the system responds
```

- **Append to `## Verification checklist`:**

```markdown
- [ ] (web) Check: no `ease-in` on UI transitions; no entrance from `scale(0)`
- [ ] (web) Check: popovers/menus scale from trigger origin (modals stay centered)
```

---

## Task 2 — apex-ui-ux-design

### 2a. `apex-ui-ux-design/SKILL.md`
- Frontmatter: bump `version: 1.4.0`, `last_updated: 2026-06-05`; add source
  `- design-taste-frontend (taste-skill) — github.com/Leonxlnx/taste-skill`.
- **In `## Generic-AI ("slop") detection`, append two bullets to the list:**

```markdown
- Template placeholder content: "John Doe" names, generic egg/Lucide-user avatars, round fake
  numbers (`99.99%`, `50%`), "Acme"/"Nexus" brand names, filler verbs ("Elevate", "Seamless",
  "Unleash", "Next-Gen"). Use organic names, believable data (`47.2%`), concrete verbs.
- Em-dashes in UI copy as a writing tell — prefer commas/parentheses/restructured sentences.
```

- **In `## Questions to ask before designing`, append a bullet:**

```markdown
- Does the target platform have an *official* design system (GOV.UK, IBM Carbon, Microsoft
  Fluent, GitHub Primer, Shopify Polaris)? If so, install and use the official package — don't
  reinvent it.
```

- **In `## Pre-delivery quality checklist`, append an item:**

```markdown
- [ ] Full-height/hero sections use `min-h-[100dvh]`, never `h-screen` (iOS Safari toolbar collapse causes a layout jump)
```

- **In `## Escalation rules` → FLAG, append:**

```markdown
- Redesign silently changes a URL/slug, nav label, or form field `name` — preserve it or call out the change (SEO / muscle-memory / integration breakage)
```

### 2b. `apex-ui-ux-design/impl.md`
- Frontmatter: bump `version: 1.3.0`, `last_updated: 2026-06-05`; add source
  `- design-taste-frontend (taste-skill) — github.com/Leonxlnx/taste-skill`.
- **Append to `## NEVER do`:**

```markdown
- (web) Use `h-screen` for full-height/hero sections — use `min-h-[100dvh]` (iOS Safari toolbar collapse → layout jump)
- Ship template placeholder content — "John Doe", egg avatars, round fake numbers (`99.99%`/`50%`), "Acme"/"Nexus" names, filler verbs ("Elevate"/"Seamless"/"Unleash"); use organic names, believable data, concrete verbs
- (redesign) Silently change URLs/slugs, nav labels, or form field `name` attributes — preserve unless the change is explicitly requested, and flag any change
```

- **Append to `## Verification checklist`:**

```markdown
- [ ] (web) Check: no `h-screen` on full-height sections — `min-h-[100dvh]` used
- [ ] Check: no template placeholder content (names/avatars/round numbers/filler verbs)
```

---

## Task 3 — SKILL-HISTORY.md
Prepend 4 rows (newest first), format `Date | Skill | Files | Version | Event | What Changed | Sources`:

```
2026-06-05 | apex-ui-ux-design | impl.md | 1.3.0 | updated (impl) | min-h-[100dvh] not h-screen; no template placeholder content; redesign identifier-preservation | taste-skill
2026-06-05 | apex-ui-ux-design | SKILL.md | 1.4.0 | updated (SKILL) | mock-content + em-dash slop tells; official-DS honesty rule; min-h-[100dvh]; redesign SEO-preservation FLAG | taste-skill
2026-06-05 | apex-animation | impl.md | 1.3.0 | updated (impl) | NEVER ease-in / scale(0) / keyframes-for-interruptible / Motion x-y under load; ALWAYS origin-aware popovers, exit-faster-than-enter | Emil Kowalski animations.dev
2026-06-05 | apex-animation | SKILL.md | 1.2.0 | updated (SKILL) | frequency/keyboard "should it animate at all" gate; never-ease-in + custom curves; reduced-motion gentler-not-none | Emil Kowalski animations.dev
```

---

## Acceptance criteria
1. Each of the 4 skill files → verify: frontmatter `version` bumped, `last_updated: 2026-06-05`, new `sources:` line present.
2. apex-animation SKILL → verify: `grep -c "Should it animate at all" SKILL.md` = 1; the frequency table and "Never animate keyboard-initiated" line present.
3. apex-animation impl → verify: `## NEVER do` contains the 4 new bullets; `## ALWAYS do` contains origin-aware popover + exit-faster-than-enter.
4. apex-ui-ux-design SKILL → verify: slop list contains the placeholder-content bullet; checklist contains `min-h-[100dvh]`; FLAG contains the redesign-identifier line.
5. apex-ui-ux-design impl → verify: `## NEVER do` contains the h-screen, placeholder-content, and redesign bullets.
6. Length cap → verify each SKILL.md ≤ 500 lines (`wc -l`); all four remain well under.
7. SKILL-HISTORY.md → verify: 4 new rows at the top, newest-first, columns correct.
8. **Lightweight Iron Law** (per [[iron-law-application-depth]] — content add, not new domain):
   confirm a bare agent makes ≥1 of these mistakes unprompted (e.g. animates a command palette,
   uses `ease-in`/`h-screen`), then confirm the added rule names the correction. Full RED/GREEN
   subagent dogfood not required for this convention-level edit.

## Commands to run
```
wc -l ~/.claude/skills/apex-animation/SKILL.md ~/.claude/skills/apex-animation/impl.md ~/.claude/skills/apex-ui-ux-design/SKILL.md ~/.claude/skills/apex-ui-ux-design/impl.md
grep -n "Should it animate at all" ~/.claude/skills/apex-animation/SKILL.md
grep -n "min-h-\[100dvh\]" ~/.claude/skills/apex-ui-ux-design/SKILL.md ~/.claude/skills/apex-ui-ux-design/impl.md
head -8 ~/apex/SKILL-HISTORY.md
```
