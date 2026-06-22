# Skill bloat audit — last week's changes (2026-06-22)

Scope: APEX skill changes committed since 2026-06-14 (versions: apex-code 1.16→1.19, apex-ui-ux-design 1.11→1.23.1, apex-plan 1.22→1.23, apex-governance 1.10→1.11, apex-orchestrate 1.5, apex-research 1.4, apex-ui-testing impl 1.5, + the model-routing surface across CLAUDE.md/hooks/templates).

Method: 5 parallel Sonnet agents (single-pass, bounded returns) — 4 audit legs + 1 external-research leg. Per-leg detail in the sibling files (`apex-code.md`, `apex-ui-ux-design.md`, `model-routing-crosscut.md`, `light-skills-and-budget.md`, `research-best-practice.md`). Report-only — no skills edited.

## Headline

The week's content is **operationally justified — almost nothing is speculative or model-redundant.** The bloat is **form, not substance**: legitimate rules accreted as in-body prose, stacked patches never consolidated, and session/validation history baked into loaded bodies. Three skills are now at/over the 500-line cap.

## Line budget — at/over cap

| Skill | Lines | Status | Recoverable |
|-------|-------|--------|-------------|
| apex-code | 565 | **OVER +65** | ~45–60 (consolidate 3 dontAsk blocks + cut stale launch notes) |
| apex-plan | 528 | **OVER +28** | ~10 recent-add; full trim needs a separate pass (older content) |
| apex-ui-ux-design | 498 | **AT CAP** | ~85 (two `references/` splits) |
| apex-research | 316 | ok | ~7 |
| apex-governance | 263 | ok | ~4 |
| apex-orchestrate | 229 | ok | ~3 |
| apex-ui-testing (impl/SKILL) | 171 / 89 | ok | 0–16 |

## Four recurring themes (ranked by impact)

### 1. Changelog-as-content — the systemic pattern (HIGH, appears in 4 skills)
Session history / validation status / ADR rationale living in the **loaded** skill body, where it costs context every run for zero instructional value. Examples: apex-code "Empirically validated 2026-06-21 Phase-2 probe F1+F2", "this path is unproven", "wants coding-session validation"; apex-ui-ux-design "the layer-stack framing that produced these rules", AI-slop "last refresh + 7d cadence"; apex-plan "DeepSeek executes literally" example; apex-governance deferred-fix roadmap note. **Home = SKILL-HISTORY / ADR / memory, not the skill body.** This is also the worst kind per the research (duplication with existing sources = the measured-harmful class).

### 2. Stacked-patch non-consolidation (HIGH, apex-code)
The 3 dontAsk edits (1.17.0/1.17.1/1.17.2) landed as sequential patches → three overlapping explanations of one policy. This is the mechanism that pushed apex-code 65 over the cap. Fix: consolidate into one block, make the pre-flight reference a pointer (~18 lines).

### 3. In-body prose that should be a `references/` split (HIGH, apex-ui-ux-design)
The cheap-mockup workflow tutorial (incl. a PowerShell Chrome-launch command + step-by-step loop) and the 6-step design-lane workflow + 7-row platform table are bulky how-to that belongs in `references/*.md` with a load condition — not in the always-loaded core (~85 lines → ~410-line core).

### 4. Cross-file duplication (MILD, the model-routing spread)
The ADR-024/025 story is **correctly divided** across files (plan=route · code=dispatch · governance=guard · orchestrate=detect · CLAUDE.md=mode table). Only ~9–13 redundant lines: the **detection-precedence rule** (copied 4×) and the **soft pool guard** (copied 3×) should each keep one canonical copy + pointers. Worst single offender: the **CLAUDE.md §5 third-mode paragraph** (added this session) — re-narrates ADR-025 + repeats precedence + duplicates the guard; shrink to a one-line pointer.

## External evidence (research leg — all internal principles corroborated, no contradictions)
- **Encode-what's-unknown / redundancy hurts:** redundant context duplicating existing sources adds +20–23% cost and 2.45–3.92 wasted steps/task, no accuracy gain (arXiv:2602.11988 AgentMD — already an APEX-cited source). [HIGH]
- **Context rot is universal:** Chroma 18-model study — every model degrades at every length; >30% accuracy drop for mid-position info. So over-cap files have a real quality penalty, not just token cost. [HIGH]
- **Prohibition decay:** negative "don't X" rules less reliably followed than positive framing. [MEDIUM]
- Nuance: instruction files are neutral/helpful when no other doc exists — harm is specifically **duplication**, which is exactly themes 1 & 4.

## Forced top-3 cuts (highest value first)

1. **apex-ui-ux-design → two `references/` splits** (cheap-mockup workflow + design-lane workflow): ~85 lines out, back to a sustainable ~410-line core. Biggest single win; clears the cap.
2. **apex-code → consolidate the 3 dontAsk blocks + cut stale launch/validation notes**: ~45–50 lines; restores under the cap.
3. **Strip changelog-as-content across the week's edits** (validated/unproven/ADR-rationale narrative → SKILL-HISTORY/ADR/memory): ~20–30 lines AND a preventive `apex-skill-author` rule so it stops recurring.

Secondary: pointer-shrink the precedence rule + soft pool guard to one canonical copy each (~10 lines, incl. the CLAUDE.md §5 paragraph); a dedicated apex-plan trim to clear its +28.

## Routing (apex-refresh stocktake Phase 4 — apply only on go-ahead)
All actionable via `apex-skill-author` edits (no `--refresh` needed — content is current, just over-formed). No Retire/Merge. Recommend the preventive rule to stop theme #1 recurring.
