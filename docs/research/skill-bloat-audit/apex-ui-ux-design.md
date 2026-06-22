# Skill Bloat Audit — apex-ui-ux-design/SKILL.md

**Audit date:** 2026-06-22  
**Skill version:** 1.23.1  
**Current total lines:** 498  
**Lines added this week (since 2026-06-14):** ~218 (git diff +lines across 8 commits)  
**Cap status:** 498 / 500 — **AT LIMIT. One routine edit pushes over.**

---

## Summary

This skill is the highest-accrual file in the system and is now functionally at the 500-line hard cap. The last week added roughly 218 lines across 8 commits covering: AI-slop-watch, cross-platform design lanes, cheap-mockup UI workflow, ADR-020 live-preview/escalation block, Cursor co-editing detail, three reference galleries, AI-era consistency contract + layer-stack residue note, and Stitch lane fact correction. Of the ~498 total lines, approximately 150–190 are cuttable or moveable without any loss of planning-mode behavioural guidance.

---

## Finding 1 — Cheap-mode preview tiers (lines 473–486): MOVE-TO-REFERENCES

**Section:** Cheap-mode preview by target surface — Tier A/B/C table  
**Line range:** 473–486  
**Rubric:** 6 (SPECULATIVE/UNUSED), 7 (CAP PROXIMITY)  
**Severity:** HIGH  
**Est. lines saved:** ~14 in body; the section closes with "Full per-target table + commands + caveats: `docs/research/cheap-mode-native/`" — meaning this is a lossy partial repeat of a file that already exists.

**Finding:** Lines 473–486 reproduce a 3-tier render-path table (Flutter goldens, Android Paparazzi, Avalonia, Playwright, adb, FlaUI, iOS simulator) that is also documented in `docs/research/cheap-mode-native/`. The closing sentence already tells planners to go there. The in-skill table is therefore redundant — a reader following the pointer gets richer detail. The Apple SwiftUI gate note (line 483–486) is the only item worth keeping (1–2 lines); the full 3-tier breakdown should live only in the research file.

**Action:** CUT lines 473–482; keep the SwiftUI hard-gate note and the pointer. Saves ~12 lines.

---

## Finding 2 — Interactive co-review loop prose (lines 453–471): COMPRESS

**Section:** Two cheap-mode loops — interactive co-review block  
**Line range:** 446–471  
**Rubric:** 4 (VERBOSITY), 3 (DUPLICATION)  
**Severity:** HIGH  
**Est. lines saved:** ~12–15

**Finding:** The interactive co-review description (lines 453–471) is heavily over-written. It narrates: where to save the file, the Cursor in-editor render default with a memory-tag citation, the browser-tab alternative, a note that the browser stays open (parenthetical), `live-server`/`vite` mention, a separate "multiple options" block with a Windows PowerShell command for opening Chrome tabs, and a note about Playwright tabs. This is workflow documentation that belongs in a references file, not planning-mode behavioural rules. The planning model needs one clear rule ("write to `docs/research/mockups/<name>.html`; user views in Cursor's pane; loop comments → edit → re-view") not a step-by-step tutorial.

The PowerShell Chrome-launch one-liner (`Start-Process chrome -ArgumentList …`) at lines 469–470 is the most egregious — it is setup/tooling detail that belongs in a `references/cheap-mockup-workflow.md`.

**Action:** COMPRESS to ~4 lines of behavioural rule + pointer to references file. Saves ~14 lines.

---

## Finding 3 — AI-era consistency contract (lines 424–444): COMPRESS + CHANGELOG-AS-CONTENT

**Section:** Keeping it consistent — the AI-era contract  
**Line range:** 424–444  
**Rubric:** 2 (CHANGELOG-AS-CONTENT), 1 (MODEL-REDUNDANT), 4 (VERBOSITY)  
**Severity:** HIGH  
**Est. lines saved:** ~10–12

**Finding:**  
Three sub-issues in this block:

a) The parenthetical at lines 435–436 — "The L0–L5 'layer stack' framing that produced these rules is deliberately **not** codified — it restates design tokens + Atomic Design, which the planning model already knows; only this AI-era residue earns lines" — is a changelog/rationale note explaining a *past authoring decision*. This is CHANGELOG-AS-CONTENT: it explains what was cut and why. The planning model doesn't need this meta-commentary; it belongs in SKILL-HISTORY or an ADR.

b) The "promote early (rule of one)" principle at lines 426–428 (plus explanation at 428–429) is good, but the parenthetical elaboration "Human design waits ~3 uses before extracting a shared component; an AI build inverts it — drafting a reusable piece is cheap, drift is the costly failure" (lines 427–428) is verbosity adding ~0 behaviour.

c) Lines 431–434 (the three-gate consistency rule) is valuable but the dense prose is expressible in ~half the lines as a tight 3-item list.

**Action:** CUT the rationale parenthetical at 435–436 entirely; COMPRESS the three gates to a tight list. Saves ~8 lines.

---

## Finding 4 — Prompt-to-design lanes table + loop (lines 309–368): SPLIT-TO-REFERENCES

**Section:** Prompt-to-design lanes (opt-in)  
**Line range:** 309–368  
**Rubric:** 7 (CAP PROXIMITY), 4 (VERBOSITY), 6 (SPECULATIVE/UNUSED — Flutter/Uno/.NET lanes)  
**Severity:** MEDIUM-HIGH  
**Est. lines saved:** 20–30 (table + loop detail to references; keep opt-in trigger + lane-pick summary)

**Finding:** The lanes section (59 lines) carries:

- A 7-row platform table (lines 317–326) covering Flutter, .NET MAUI, WinUI 3, Uno, KMP — these are "no dedicated tool" or early-stage lanes. Most projects will never touch them. They dilute the two mature lanes (Stitch/Bitrig) and push unrelated content into planning context.
- A 6-step "The loop" (lines 347–365) that reads as user-facing documentation ("User generates + iterates", "Ping-pong until it's right", "do not attempt to run the tool"). This is instruction prose appropriate for a `references/design-lane-workflow.md`, not planning-mode behavioural rules.
- The "division of labour" paragraph (lines 342–346) is partially MODEL-REDUNDANT — a planning model already knows it can't drive browser tools.

**Action:** MOVE the 6-step loop and the "two mature lanes in detail" descriptions to `references/design-lane-workflow.md`. Keep in skill: the opt-in trigger sentence, the 2-column table (web→Stitch, SwiftUI→Bitrig only, others one-liner), and the "design the spine once" principle. Cut the "no dedicated tool → text-first" row — it's the default, not a lane. Saves ~20–25 lines.

---

## Finding 5 — AI-slop detection list (lines 208–245): COMPRESS (partial model-redundant)

**Section:** Generic-AI ("slop") detection  
**Line range:** 208–245  
**Rubric:** 1 (MODEL-REDUNDANT), 4 (VERBOSITY)  
**Severity:** MEDIUM  
**Est. lines saved:** ~8–10 (list is valuable, but the maintenance cadence block + rationale prose are not)

**Finding:** Two sub-issues:

a) Lines 210–213 describe a self-maintaining cadence mechanism: "Last AI-slop refresh: 2026-06-16 · cadence: 7d. When elapsed, a planning session runs a design-only (no colour) slop-pattern research pass → dated file in `docs/research/ai-slop-watch/` → proposes deduped additions → on approval lands via apex-skill-author; log each run in `docs/research/ai-slop-watch/log.md`." This is CHANGELOG-AS-CONTENT / maintenance metadata that lives in SKILL-HISTORY and the log file, not the loaded skill body. The planning model doesn't act on a last-refresh date embedded in the skill — this is documentation of process, not a behavioural rule.

b) The slop list itself (lines 220–242) is 23 items. Items 1–20 are HIGH-value; items 21–23 (`[trending-2026]` tagged items: fake dashboard pill-heroes, glossy 3D blobs, reflexively uniform sections) are trend-survey content that a capable model already avoids — borderline MODEL-REDUNDANT. Lowest-priority trim.

c) Lines 215–219 (FLAG-not-BLOCK rationale) and 244–245 (fix principle) are valuable; keep them.

**Action:** CUT the cadence/maintenance block (lines 210–213) — it belongs in the log file, not the skill. Optionally trim the 3 `[trending-2026]` items if the model reliably avoids them. Saves ~5–8 lines.

---

## Finding 6 — Live preview section (ADR-020 block, lines 370–397): CHANGELOG-AS-CONTENT + VERBOSITY

**Section:** Live preview + Claude visual escalation (during build) — ADR-020  
**Line range:** 370–397  
**Rubric:** 2 (CHANGELOG-AS-CONTENT), 4 (VERBOSITY)  
**Severity:** MEDIUM  
**Est. lines saved:** ~10

**Finding:** The section header cites ADR-020 by name and the prose ("This is capability, not authority — it changes no gate, critical-file confirmation, or hard block", line 395–396) reads as a cross-reference defence against potential confusion — i.e., a rationale-for-the-rule embedded in the rule. CHANGELOG-AS-CONTENT.

The escalation conditions (lines 389–394) list 5 sub-conditions in parenthetical chains with cost figures (≈29×) and gate citations. The cost figure (29×) appears twice in this section (lines 394, 405). The conditions and bounds are behaviorally important but are over-written — the prose nesting makes it hard to scan.

The "full loop" (steps 1–5, lines 378–397) partly re-tells the design→build→gate flow already established in the Cheap-mode section. The web live-preview instruction ("Simple Browser: Show" command palette hint, lines 382–383) is tooling detail that belongs in a references file.

**Action:** COMPRESS the escalation rule to a tight 3-condition checklist; CUT the ADR-020 rationale parenthetical and the Simple Browser setup prose (move to references). Saves ~8–10 lines.

---

## Finding 7 — Design-brief artifact section (lines 56–79): MINOR VERBOSITY

**Section:** Design-brief artifact (persisted — ADR-017)  
**Line range:** 56–79  
**Rubric:** 4 (VERBOSITY), 2 (CHANGELOG-AS-CONTENT)  
**Severity:** LOW  
**Est. lines saved:** ~3–4

**Finding:** Line 63 reads "**Scope (ADR-017 — partially amends ADR-013's 'visual stays un-persisted').** Persist only the…" — the amendment reference is CHANGELOG-AS-CONTENT (it explains the ADR relationship, not what to do). The reader only needs to know what to persist, not which ADR was amended. Similarly, the "Stays OUT" block (lines 73–75) restates the app-flow boundary already established in § App-flow artifact.

**Action:** CUT the amendment parenthetical; COMPRESS "Stays OUT" to one line with a pointer to app-flow artifact. Saves ~3 lines.

---

## Finding 8 — Sources block (lines 6–21): CHANGELOG-AS-CONTENT

**Section:** Frontmatter sources  
**Line range:** 6–21  
**Rubric:** 2 (CHANGELOG-AS-CONTENT)  
**Severity:** LOW (frontmatter convention — may be intentional)  
**Est. lines saved:** ~8 if trimmed to 3–4 canonical sources

**Finding:** The sources list has grown to 13 entries including internal research paths with dates (`docs/research/design-capability/ (WS-1…4, 2026-06-12)`), GitHub repos with parenthetical names, and ADR paths. This is version-control provenance, not planning-mode context. The skill body never references these by name — they exist solely for SKILL-HISTORY traceability. The `staleness_threshold: 30d` then creates a tension: the skill is at the cap, but the 30-day cadence will add more sources.

**Action:** TRIM to 3–4 canonical external sources (Apple HIG, ADR-013, ADR-017, ADR-020). Move the internal research paths + GitHub repos to SKILL-HISTORY rows. Saves ~8 lines.

---

## Cap Analysis

| Block | Lines | Priority |
|-------|-------|----------|
| Frontmatter sources (F8) | ~8 cuttable | LOW |
| Cheap-mode preview tiers (F1) | ~12 cuttable | HIGH |
| Interactive co-review loop prose (F2) | ~14 cuttable | HIGH |
| AI-era consistency contract (F3) | ~10 cuttable | HIGH |
| Prompt-to-design lanes loop+table (F4) | ~22 cuttable | MED-HIGH |
| AI-slop cadence block (F5) | ~6 cuttable | MEDIUM |
| ADR-020 live-preview verbosity (F6) | ~10 cuttable | MEDIUM |
| Design-brief minor (F7) | ~3 cuttable | LOW |
| **Total est. cuttable** | **~85** | |
| **Post-cut estimate** | **~413 lines** | |

The most impactful single action is splitting the prompt-to-design lane loop + cheap-mode workflow prose to `references/cheap-mockup-workflow.md` and `references/design-lane-workflow.md`. That alone would recover ~35–36 lines and eliminate the most user-documentation-style content from a planning-mode skill.

---

## Recommended split to references/

| New file | Content | Lines moved |
|----------|---------|-------------|
| `references/cheap-mockup-workflow.md` | Interactive co-review loop prose, Chrome multi-tab command, Tier A/B/C table, per-surface commands | ~26 |
| `references/design-lane-workflow.md` | The 6-step lane loop, "division of labour" prose, mature lane detail | ~22 |

Both already have pointers in the skill body. The split gives the skill body the behavioural rule + the pointer, and puts the tutorial prose where it won't inflate loaded context.
