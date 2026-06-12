# Research synthesis: APEX coding capability — skill conflicts on the DeepSeek backend

**Date:** 2026-06-12
**Confidence:** HIGH (WS-1 internal audit read the actual files; WS-3 is primary-source; cross-workstream convergence on the core mechanism)
**Re-research after:** 2026-06-26 (AI/LLM tooling, 14-day clock — applies to WS-3 evidence only)
**Source files:** `ws-1-conflict-matrix.md` · `ws-2-load-vectors.md` · `ws-3-weak-coder-evidence.md` (3 parallel gather agents, 2026-06-12)
**Protocol:** absorption-pass — report first; NO skill edits/removals until bundles are user-approved.
**Standing decision driving this pass:** APEX is the **sole** coding workflow on this machine — absorb good ideas from rivals into APEX, then remove the rivals (memory `apex-sole-coding-workflow`).

---

## Summary

This is the design-capability pass replayed on the coding surface, and the verdict is the same but
**safety-critical rather than aesthetic**. A weak, literal coding model (DeepSeek V4 Flash) loads
the APEX cluster, but several **competing coding workflows sit in its reach with nothing gating them
out** — and the harness actively *forces* their consideration: the `superpowers` plugin injects
`using-superpowers` on **every session, both backends**, with "if there's even a 1% chance a skill
applies you ABSOLUTELY MUST invoke it / YOU DO NOT HAVE A CHOICE." `apex-code` carries no
counter-directive. WS-3 confirms with primary 2025–26 sources that this measurably harms a
DeepSeek-class coder: joint compliance at conflict points collapses to ~35% (weakest model 10.8%),
constraint-stacking costs ~30 points on coding benchmarks, and small models decay *exponentially*,
not gracefully. The unique danger here vs the design pass: **two of the conflicting skills execute
permanently-forbidden git operations** (`finishing-a-development-branch` runs `git merge` +
`git branch -d`). The APEX cluster itself audited clean — as in the design pass, the damage is the
third-party pile, not APEX. Because **prohibition rules decay fastest** (WS-3), the fix is structural
**removal**, not adding a "don't follow other skills" rule. The cleanest cut: superpowers is a
*plugin* — one settings line disables the injection vector + all 6 conflicting SP skills at once.

## Cross-workstream convergences (highest confidence — found independently by 2+ agents)

| Mechanism | Converged in | Evidence |
|-----------|--------------|----------|
| The `using-superpowers` "1% → MUST invoke" directive is a live hijack of apex-code's selective loading | WS-1 #2 · WS-2 (hijack verdict: YES) | Quoted both sides; fires on both backends, no gate |
| Competing execution loops read the wrong artifact path (`docs/superpowers/plans/`, `.planning/`) vs apex-code's `docs/changes/` | WS-1 #3, #6, #8 · WS-2 load table | Read directly from skill files |
| Conflicting/overlapping rules degrade a weak coder by large, measured margins | WS-3 (5 primary sources) · WS-1 (severity ranking) | arXiv 2605.27784 / 2605.06445 / 2507.11538 |
| Removal beats suppression — prohibition-type rules decay fastest (60–73%→10–20%/session) | WS-3 #4 · WS-2 (no robust gate exists) | arXiv:2604.20911 (χ²=147, p<10⁻³³) |
| APEX cluster is internally clean; damage is the third-party pile | WS-1 (APEX baseline) · matches design pass WS-3 | Session-32 stocktake already probed APEX-internal |

## Install-shape — this determines *how* each rival is removed

| Rival | Install shape | Removal mechanism |
|-------|---------------|-------------------|
| **superpowers** (TDD, executing-plans, SDD, writing-plans, brainstorming, finishing-a-branch, using-superpowers, verification, code-review ×2, worktrees) | **Plugin** `superpowers@claude-plugins-official` (`settings.json` → `enabledPlugins`) | **One line → `false`.** Disables the SessionStart injection vector AND all ~12 SP skills at once. |
| **gsd-*** (~90 skills) | **Standalone skill folders** `skills/gsd-*` | Delete/move folders. ⚠️ APEX **reuses `gsd-map-codebase`** (brownfield gate) — harvest/keep that one first. |
| **controlled-yolo** | Standalone folder; opt-in only (fires on "yolo mode") | Fold internet-exposure-defer idea into apex-governance, delete folder. Low urgency (explicit-activation). |
| **full-output-enforcement**, **write-feature-spec** | Standalone folders | Delete. |
| playwright, context7 | Plugins (MCP tool providers) | **Keep** — tools, not workflow competitors. |

## Conflict matrix (condensed — full version + citations in `ws-1-conflict-matrix.md`)

| Rival skill | Class | Contradicts | Severity |
|-------------|-------|-------------|----------|
| `superpowers:finishing-a-development-branch` | **CONFLICT** | apex-governance hard block — runs `git merge` + `git branch -d` (auto-fires at end of SP chains) | **CRITICAL** (forbidden ops) |
| `superpowers:using-superpowers` | **CONFLICT** | apex-code selective loading — "MUST invoke any 1%-relevant skill", claims to override system prompt | **CRITICAL** (hijack vector) |
| `superpowers:executing-plans` + `subagent-driven-development` | **CONFLICT** | apex-code wave-parallel loop; reads wrong plan path; SDD bans parallel dispatch | **HIGH** |
| `superpowers:test-driven-development` | **CONFLICT** | apex-testing (test-first-or-immediately-after) + apex-code AFK silence ("ask your human" exceptions blocked) | **HIGH** |
| `controlled-yolo` | **CONFLICT** | apex-code GRAY/BIG fork escalation — "make every decision yourself", treats schema/arch changes as autonomous | **HIGH** |
| `superpowers:writing-plans` + `brainstorming` | **CONFLICT** | apex-plan — wrong artifact path, missing APEX section headers, brainstorming HARD-GATE blocks code | **HIGH** (planning side) |
| `full-output-enforcement` | **CONFLICT** | apex-coding-principles surgical scope — "optimize for completeness not brevity", "deliver the full file" | **MEDIUM** |
| `gsd-*` cluster (`gsd-autonomous` etc.) | **CONFLICT** | apex-code — parallel dev system, splits session state across two state machines | **MEDIUM** |
| `superpowers:receiving-code-review` | **DUPLICATE** | already absorbed verbatim into apex-governance | token waste |
| `superpowers:requesting-code-review` | **DUPLICATE** | apex-reviewer covers post-build review | token waste |
| `superpowers:verification-before-completion` | **DUPLICATE** | apex-code verify loop | token waste |
| `superpowers:using-git-worktrees` | **DUPLICATE/INERT** | donor-analysis already rejected worktrees | token waste |

## Harvest list — what to absorb BEFORE removal (small; APEX already absorbed most over prior passes)

| From | Idea worth keeping | Absorb into | Status |
|------|--------------------|-------------|--------|
| `gsd-map-codebase` | Brownfield repo-mapping — **APEX already references it** (brownfield gate) | keep as the single retained gsd skill, OR port into apex-plan | **must resolve before gsd removal** |
| `controlled-yolo` | "Defer internet-exposure questions to end of session" autonomy nuance | apex-governance / apex-code AFK contract | check if already present |
| `superpowers:verification-before-completion` | Any verify-checklist nuance not in apex-code's loop | apex-code | low value — likely already covered |
| `superpowers:receiving-code-review` | (none — already absorbed verbatim) | — | done |

**Honest finding:** after ECC, donor (×8), Odysseus, and DOX absorption passes, APEX has already
harvested what these rivals offered. The remaining genuine harvest is essentially **`gsd-map-codebase`**.
The rest is conflict + duplication to remove.

## Ranked bundles (select before any edit — report-first)

### Bundle 1 — Disable the superpowers plugin (highest ROI, single action, negative cost)
Set `superpowers@claude-plugins-official` → `false` in `settings.json` `enabledPlugins`. Removes the
`using-superpowers` injection hijack vector **and** all CRITICAL/HIGH SP conflicts (finishing-a-branch
git-hard-block violation, executing-plans/SDD competing loops, TDD, writing-plans/brainstorming) **and**
the 4 SP duplicates **in one line**. Nothing to harvest first (receiving-code-review already absorbed).
**~5,400 tokens/session freed + removes the only forbidden-git-op vector.** Reversible (flip back to `true`).

> **⚠️ Correction (session 35, 2026-06-12).** The `enabledPlugins → false` mechanism was **insufficient**:
> a plugin ships its own bundled `SessionStart` hook (`cache/.../superpowers/5.1.0/hooks/hooks.json` →
> `run-hook.cmd session-start`, which injects `using-superpowers/SKILL.md`) **and** its skills, and the
> flag gates neither. Verified live — the injection + all `superpowers:*` skills survived the flag (today's
> `.in_use` PID markers confirm the hook kept firing). **Real fix = full uninstall:**
> `claude plugin uninstall superpowers@claude-plugins-official -y` (removes it from `installed_plugins.json`
> and strips the `enabledPlugins` entry; reversible via reinstall). Validates [[removal-over-prohibition]]:
> a flag-disable is prohibition-by-config; only removing the source works. **USER restart-verify pending.**

### Bundle 2 — Retire the gsd cluster (after harvesting `gsd-map-codebase`)
(a) Decide the fate of `gsd-map-codebase` — keep the single folder, or port its repo-map step into
apex-plan's brownfield gate; update the apex-plan/apex-code reference accordingly. (b) Then delete/move
the remaining ~89 `gsd-*` folders. Removes the competing `.planning/` state machine. Bigger surface →
do after Bundle 1. **Open call:** full delete vs move to an inactive `skills-archived/` (APEX already uses
that pattern per status.md) in case you want gsd available for non-APEX projects.

### Bundle 3 — Remove the standalone coding-conflict skills
Delete `full-output-enforcement` (opposes surgical scope) and `write-feature-spec` (apex-plan covers).
Fold controlled-yolo's internet-exposure-defer line into apex-governance if not already there, then
delete `controlled-yolo` (or keep it — it's opt-in-only and low-risk; **your call**).

### Bundle 4 — Add a positive primacy line to apex-code (structural, not a prohibition rule)
Once rivals are gone, add ONE positive directive to `apex-code/SKILL.md`: "APEX is the sole coding
workflow; in coding mode follow apex-code only." Kept positive (commission, not prohibition) because
WS-3 shows prohibition rules decay fastest — this is a backstop, the *removal* is the real fix.
Optionally update global CLAUDE.md §5 to note competing dev-systems are intentionally disabled.

## Token-cost watchlist
- Superpowers plugin: **−~5,400/session** if disabled (Bundle 1), incl. ~1,450 always-on `using-superpowers` injection.
- Always-on coding baseline today ≈ **15.5k tokens** before the first file touch (WS-2).
- gsd folders: not loaded unless triggered, but each is a live trigger surface for the 1% rule while superpowers is enabled (Bundle 1 neutralises the *trigger*; Bundle 2 removes the *surface*).

## Gaps / unverified
- No DeepSeek-specific controlled study — its vulnerability is inferred from the general small-model pattern (WS-3 `[ASSUMED]`). Direct measurement of APEX's live rule-count vs IFScale thresholds would close it.
- Token figures are line-count estimates, not measured loads.
- ~~Whether disabling the superpowers plugin also removes its SessionStart hook injection cleanly (vs leaving an orphaned hook entry) is **unverified on Windows** — confirm on the live env.~~ **RESOLVED (session 35): it does NOT.** The flag leaves the plugin's bundled SessionStart hook + skills live; only `claude plugin uninstall` removes them (see Bundle 1 correction). USER restart-verify pending.
- gsd-map-codebase reuse depth not fully traced — confirm exactly where apex-plan/apex-code reference it before removing the cluster.
