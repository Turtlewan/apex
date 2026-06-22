# Bloat Audit — apex-code SKILL.md (v1.19.0)

**Date:** 2026-06-22
**File:** `~/.claude/skills/apex-code/SKILL.md`
**Total lines:** 565
**Lines added since 2026-06-14 (v1.14→1.19):** ~170 (diff analysis)
**Estimated cuttable lines:** ~90–105

---

## Summary Table (top findings)

| # | Section | Lines | Rubric | Severity | Recommendation | Est. saved |
|---|---------|-------|--------|----------|---------------|-----------|
| 1 | dontAsk pre-flight (step 4) + Permissions §1a stacked+split | 59–66, 487–508 | DUPLICATION, VERBOSITY | HIGH | CONSOLIDATE into one block at §Permissions 1a; cut step 4 to 2-line pointer | ~18 |
| 2 | Model-routing dispatch table + explanation (193–221) | 193–221 | VERBOSITY, CHANGELOG-AS-CONTENT | HIGH | COMPRESS: keep table + 4 bullet rules; cut the inline narrative restating ADR-024/025 rationale | ~12 |
| 3 | Model escalation on verify-fail (293–304) | 293–304 | SPECULATIVE/UNUSED + PROHIBITION DECAY | MEDIUM-HIGH | COMPRESS: 12 lines → 5-line block; cut chain-stack prohibition (model-redundant) | ~7 |
| 4 | Workflow dispatch path validation status notice (184–186) | 184–186 | CHANGELOG-AS-CONTENT | MEDIUM | CUT: "unproven" caveat is a point-in-time launch note, belongs in SKILL-HISTORY not the live skill body | ~3 |
| 5 | Build-artifact isolation worktree caveat (142–143) | 142–143 | CHANGELOG-AS-CONTENT | MEDIUM | CUT: "Wants one coding-session validation" italicised note is a launch-note, not a standing instruction | ~2 |

---

## Detailed Findings

---

### Finding 1 — dontAsk policy split across two sections (HIGH)

**Rubric:** DUPLICATION + VERBOSITY

**Affected lines:**
- Pre-flight step 4, lines 59–66 (8 lines): introduces dontAsk, explains the auto-vs-dontAsk choice, tells how to launch
- Permissions §1a, lines 487–508 (22 lines): how to mirror permissions.allow for dontAsk, protected-path exception, workflow-tools allowlist, worker inheritance, intermittent Bash caveat

The content forms a **single logical policy** that was written in two commits (1.17.0 and 1.17.2) and ended up in two separate sections 420 lines apart. A model executing the build must hold both to understand dontAsk correctly. The split also caused partial duplication: the "off-list = denied silently" consequence is stated both in step 4 ("blocks protected-path writes") and in §1a ("DENIED silently in dontAsk (no prompt)").

Additionally, within §1a itself, the three sub-edits (1.17.0, 1.17.1, 1.17.2) stacked three paragraphs without merging them into a coherent block. The result is prose that re-explains the same dontAsk premise three times in slightly different words before reaching each of the three new rules.

**Recommended action: CONSOLIDATE**

Merge into a single `### dontAsk build-mode policy` block under §Permissions (where it belongs — pre-auth is a permissions concern). Reduce pre-flight step 4 to: "Set permission mode: see § Permissions pre-authorisation." Keep all three rules (mirror allow-list, protected-path exception, workflow-tool allowlist + worker inheritance) but write them as a single cohesive numbered list, not three stacked paragraphs with re-stated preamble.

The "Empirically validated 2026-06-21, Phase-2 probe F1+F2" parenthetical is CHANGELOG-AS-CONTENT — cut it.

**Estimated lines saved:** 16–20

---

### Finding 2 — Model-routing dispatch section (HIGH)

**Rubric:** VERBOSITY + CHANGELOG-AS-CONTENT

**Affected lines:** 193–221 (29 lines)

The section begins with an ADR back-reference header (`#### Model-routing dispatch (ADR-024/025) — when the ## Wave plan carries ▸<model> tags`) and then spends 5 lines narrating how apex-plan produces the tagged plan — information the model doesn't need to *execute* the dispatch; it only needs the mapping and the rules.

**Verbose patterns:**
- Lines 195–198: explains what the `coder_models` menu does and how the tagged plan looks. The model executing the build just receives the plan; it doesn't need a description of how it was generated.
- "The plan is already ordered so the DeepSeek tasks (`flash`/`pro`) are contiguous, then the Claude tasks (`sonnet`/`opus`)." (line 210–211) — this is planner-output description, not executor instruction. The executor's rule is simply "run DeepSeek batch first, stop before Claude batch."
- The backend-wall note (C1) re-explains the one-crossing constraint across 4 lines when it could be: "Backend wall: stop before the Claude batch and prompt for the backend swap (`APEX_MODE=coding`)."

**The table (lines 200–205) is exactly right** — dense, scannable, keeps all four mappings. The prose around it bloats the section.

**The "Validation gate" paragraph (lines 217–221)** mixes a launch-caveat ("unproven on the live proxy") with a fallback rule. The fallback rule belongs ("if rejected, run whole batch at session default and log"); the "unproven" framing is a CHANGELOG-AS-CONTENT launch note — cut it, keep the fallback rule.

**Recommended action: COMPRESS**

Keep the table and the four bullet rules. Cut the narrative intro (195–198) entirely. Compress backend-wall to one sentence. Extract the fallback rule from the validation-gate paragraph and drop the "unproven" framing.

**Estimated lines saved:** 10–14

---

### Finding 3 — Model escalation on verify-fail (MEDIUM-HIGH)

**Rubric:** SPECULATIVE/UNUSED + PROHIBITION DECAY + VERBOSITY

**Affected lines:** 293–304 (12 lines)

**Issues:**
1. This feature is conditional on `coder_models` being multi-model — a feature that as of this version still has an "unproven" proxy note (Finding 2). The section carries full prose for all escalation cases even though the DeepSeek within-backend path hasn't been live-validated.
2. The final bullet (lines 303–304) is a prohibition-decay rule: "do not stack an auto within-backend escalation and a gated cross-backend one on the same task." A capable model following the sequential rule ("first escalation = the retry") would not naturally stack them. This is a "don't do X" guard, not a new positive instruction.
3. The eligibility-filter parenthetical in line 296 (`e.g. a >64K-output text task stays off sonnet`) is a specific example from ADR-024 that adds cognitive load without changing execution for common cases.

**Recommended action: COMPRESS**

Reduce to ~5 lines: the gating condition (multi-model only), the two cases (within-backend auto / cross-backend gated), and the one-retry cap as a positive rule ("one escalation per task, then fork"). Cut the stack-prohibition sentence and the eligibility-filter example.

**Estimated lines saved:** 6–7

---

### Finding 4 — Workflow dispatch "validation status" notice (MEDIUM)

**Rubric:** CHANGELOG-AS-CONTENT

**Affected lines:** 184–186 (3 lines):
```
Validation status: this path is unproven end-to-end. The first build run with
`wave_dispatch: workflow` is its proving run; if it misbehaves, unset the flag (or
`enableWorkflows: false`) to fall back to inline dispatch.
```

This is a launch-state note written when the feature shipped in 1.16.0. It describes the current validation status of the feature, not a standing operating rule. Once the path has been exercised, this text is stale misinformation (it will still say "unproven"). The fallback rule ("if it misbehaves, unset the flag") is already implied by the fallback sentence at lines 180–182 above it ("fall back to inline Agent dispatch for that wave and log it in the decisions table").

**Recommended action: CUT**

Remove lines 184–186 entirely. The fallback rule is already covered. Record the "unproven at launch" context in SKILL-HISTORY if needed.

**Estimated lines saved:** 3

---

### Finding 5 — Build-artifact isolation inline caveat (MEDIUM)

**Rubric:** CHANGELOG-AS-CONTENT

**Affected lines:** 142–143:
```
_Wants one `coding-session` validation — build-artifact
collision is real-world, not provable by reasoning._
```

Like Finding 4, this is a launch-state note that was accurate when written (1.18.0) but becomes stale misinformation once the first worktree build runs. It isn't a standing instruction — a model executing a build can't act on it (it can't validate the feature; it can only apply or not apply worktree isolation per the rule above). The rule itself (lines 135–141) is clear and complete without this caveat.

**Recommended action: CUT**

Remove lines 142–143. If validation status is important to track, record it in SKILL-HISTORY.

**Estimated lines saved:** 2

---

### Finding 6 — dontAsk pre-flight step 4: classifier explanation verbosity (MEDIUM)

**Rubric:** VERBOSITY + MODEL-REDUNDANT

**Affected lines:** 60–66 (7 lines within step 4)

The explanation of *why* auto mode uses DeepSeek's classifier and what that causes ("routes through `ANTHROPIC_BASE_URL`, so on a coding session it runs on DeepSeek; a blip then blocks protected-path writes") is rationale, not instruction. A model executing this step only needs: "use dontAsk, not auto; launch with `--permission-mode dontAsk`." The mechanism explanation belongs in the ADR, not the skill body.

This finding partially overlaps with Finding 1 (the whole step 4 should become a pointer to §Permissions). If Finding 1 is actioned, this is resolved automatically.

**Recommended action: CONSOLIDATE (resolved by Finding 1)**

**Estimated lines saved:** 4–5 (part of Finding 1's total)

---

### Finding 7 — "(Empirically validated 2026-06-21, Phase-2 probe F1+F2)" (LOW-MEDIUM)

**Rubric:** CHANGELOG-AS-CONTENT

**Affected line:** 504–505 (within §Permissions 1a)

The parenthetical is session-history narrative — it records which day and which probes validated the rule. This is SKILL-HISTORY content, not a standing instruction. The rule itself ("Dispatched workers inherit the parent's dontAsk") is what matters for execution.

**Recommended action: CUT** (2 lines within the consolidated §Permissions block)

**Estimated lines saved:** 1–2

---

### Finding 8 — Intermittent Bash caveat under dontAsk (LOW-MEDIUM)

**Rubric:** SPECULATIVE/UNUSED + PROHIBITION DECAY

**Affected lines:** 505–508:
```
**Caveat:** a worker may intermittently be denied Bash even for
an allow-listed recipe command (seen once across two identical workers); main-session verification
still covers the build, but don't rely on per-worker Bash self-verification under `dontAsk` until
this is run down.
```

"Seen once across two identical workers" — this is a one-data-point observation that may or may not be a real bug. It generates a prohibition-pattern instruction ("don't rely on per-worker Bash self-verification") based on a sample size of one. If this is a real issue it deserves its own investigation and fix; if it's noise, this instruction is a standing false alarm baked into every build context. Either way, loading a "seen once" caveat into every build session is wasteful.

**Recommended action: MOVE-TO-ADR or CUT**

If there's an open investigation, move the note to the relevant ADR or a tracking issue. Cut from the skill body until resolved — the main-session verification already covers the case.

**Estimated lines saved:** 4

---

## Cap Proximity

At **565 lines**, the file has crossed the 500-line soft cap by 65 lines (13%). The week's edits added ~170 lines against a baseline of ~395. This is the primary structural concern — the cap exists specifically to prevent the build context from being dominated by the skill itself.

Actioning Findings 1–5 (the HIGH and MEDIUM findings) would recover approximately **35–45 lines**, bringing the file back under 530. Full consolidation including LOW findings would recover ~50–60 lines, approaching the 500-line cap.

---

## Not Flagged

The following recently-added content was reviewed and judged non-bloat:

- **Fan-out cap + worker_cap override (lines 130–134):** operationally necessary, not inferable from model defaults. Correct.
- **Wave-boundary compaction (line 234):** one line, clear trigger condition. Correct.
- **Multi-spec dispatch cap (line 147):** one line. Correct.
- **Worktree isolation rule itself (lines 135–141, excluding the caveat):** new behaviour the model needs, correctly specified.
- **Ultra review recommendation in post-build (lines 460–463):** 4 lines, gated by condition, correct recommend-only framing.
- **Backend wall C1 rule (lines 209–214):** operationally needed; the specific STOP+prompt instruction is not model-redundant (cross-backend swap is a manual env change, not automatic). Could be tighter (see Finding 2) but the content itself is valid.
- **Model-routing table (lines 200–205):** exactly right. Keep as-is.
