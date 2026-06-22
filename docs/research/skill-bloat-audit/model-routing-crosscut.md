# Model-Routing Cross-Cut Bloat Audit

**Scope:** ADR-024/025 multi-model coding router story spread across 5 files, added 2026-06-21/22.  
**Commits:** `0c7075a` (P1-P2: apex-plan router) · `2abd554` (P3: Claude coding mode + dispatch).  
**Date:** 2026-06-22  
**Status:** Report-only — no edits made.

---

## Line count summary

| File | Total lines | Routing-story lines added | Approximate section span |
|------|------------|--------------------------|--------------------------|
| apex-plan/SKILL.md | 528 | 35 | Lines 409–443 (`## Model-routing build planning`) |
| apex-code/SKILL.md | 565 | 50 | Lines 193–220 (`#### Model-routing dispatch`) + 293–305 (escalation) |
| apex-governance/SKILL.md | 263 | 23 | Lines 69–91 (`## Coding model routing & the soft pool guard`) |
| apex-orchestrate/SKILL.md | 229 | 17 | Lines 84–100 (`## Step 3.5: Confirm operating mode`) |
| CLAUDE.md | 269 | 8 | Lines 121–127 (mode table) + 149 (third-mode paragraph) |
| **Total** | **1854** | **~133** | — |

Rough redundant lines (facts appearing in 2+ files): **~45–55** (detail below).

---

## Duplication matrix

For each fact, which files carry it, which is the canonical home, and what non-home files should do.

### Fact 1: Detection-precedence rule (deepseek URL → DS coding; else APEX_MODE=coding → CC; else planning)

| File | Carries it? | Form | Lines |
|------|-------------|------|-------|
| CLAUDE.md | YES — canonical | 3-bullet ordered list in §Session-Start step 3 | 3 |
| apex-orchestrate | YES — full re-statement | numbered list in Step 3.5 | 3 |
| apex-governance | YES — inline prose in section header | `Detection precedence: deepseek URL → DeepSeek coding; else APEX_MODE=coding → Claude coding; else planning.` | 1 |
| CLAUDE.md §5 | YES — again in third-mode paragraph | `Detection precedence: deepseek URL → …; else APEX_MODE=coding → …; else planning.` | 1 |

**Canonical home:** CLAUDE.md §Session-Start step 3 (the authoritative user-facing hook summary).  
**Recommended action:** apex-orchestrate Step 3.5 → replace numbered list with one pointer: "Detection precedence is in CLAUDE.md §3 — deepseek URL beats APEX_MODE=coding beats planning." (~−2 lines). apex-governance → drop the inline sentence, keep a link: "Detection: see CLAUDE.md §3." (~−1 line). CLAUDE.md §5 third-mode paragraph → drop the repeated sentence (~−1 line).  
**Est. lines saved: ~4**

---

### Fact 2: Soft pool guard (Claude coding draws the Max planning pool; warn on entry; default Sonnet; Opus only when warranted; no hard cap)

| File | Carries it? | Form | Lines |
|------|-------------|------|-------|
| apex-governance | YES — canonical | Full `## Coding model routing & the soft pool guard` section with 4-bullet guard protocol | 10 |
| apex-orchestrate Step 3.5 | YES — partial re-statement | "soft pool guard — draws the same Max subscription pool as planning, so keep the coder on Sonnet by default and reach Opus only when complexity warrants (apex-governance owns the guard)" | 2 |
| CLAUDE.md §5 third-mode ¶ | YES — partial re-statement | "it carries a soft guard (warn, default Sonnet, Opus only when warranted, track via /status), not a hard cap. See apex-governance + ADR-025." | 1 |

**Canonical home:** apex-governance (explicitly the governance invariant owner).  
**Recommended action:** apex-orchestrate → keep the 1-line pointer "soft pool guard applies — see apex-governance" and drop the inline explanation (~−2 lines). CLAUDE.md §5 → the existing "See `apex-governance` + ADR-025" pointer is fine; drop the inline guard summary that precedes it, keeping only "write-guard relaxed; draws planning pool — soft guard applies, see apex-governance" (~−0.5 lines effective).  
**Est. lines saved: ~3**

---

### Fact 3: Cross-backend escalation rule (within-backend auto; crossing into Claude pool is approval-gated; one retry cap)

| File | Carries it? | Form | Lines |
|------|-------------|------|-------|
| apex-code | YES — canonical | Full `**Model escalation on verify-fail**` block with 3 sub-bullets | 13 |
| apex-governance | YES — full re-statement | `**Cross-backend escalation is approval-gated (ADR-024 F3).**` paragraph (3 lines) covering within-backend auto, cross-backend gated, one-retry cap | 3 |

**Canonical home:** apex-code (the executor skill — the *what-to-do* belongs there).  
**Recommended action:** apex-governance → replace the 3-line paragraph with one pointer: "Cross-backend escalation (approval-gated, one retry): see apex-code § Model escalation on verify-fail." (~−2 lines).  
**Est. lines saved: ~2**

---

### Fact 4: Cost order / model tier sequence (flash < pro < sonnet < opus) and model ceilings

| File | Carries it? | Form | Lines |
|------|-------------|------|-------|
| apex-plan | YES — canonical | `Cost order: flash < pro < sonnet < opus` in eligibility Step 2 + model ceilings rubric (5 lines) | 6 |
| apex-code dispatch section | PARTIAL | Tag table implicitly encodes the ordering (flash→DeepSeek, pro→DeepSeek, sonnet→Claude, opus→Claude) without spelling out the cost ranking | — |
| apex-governance | NO | Uses "Flash/Pro" and "Sonnet/Opus" but doesn't state cost order | — |

**Verdict:** No material duplication — apex-plan owns the explicit rubric; apex-code's tag table is the dispatch mechanic, not a cost-order re-statement.  
**Est. lines saved: 0**

---

### Fact 5: Tag-to-backend mapping table (▸flash→DS flash; ▸pro→DS pro; ▸sonnet→CC sonnet; ▸opus→CC opus)

| File | Carries it? | Form | Lines |
|------|-------------|------|-------|
| apex-code | YES — canonical | 4-row Markdown table with override channel column | 6 |
| apex-plan | IMPLICIT | Describes emitting `▸<model>` tags and lists the 4 model names without a mapping table | — |
| apex-governance | NO | Mentions Flash/Pro and Sonnet/Opus as backend groupings only | — |

**Verdict:** Table lives only in apex-code. apex-plan describes the tag-emitting mechanic, not the dispatch mapping — these are different slices. No material duplication.  
**Est. lines saved: 0**

---

### Fact 6: "Claude coding mode is a real build session, not a planning detour" + write-guard relaxation mechanics

| File | Carries it? | Form | Lines |
|------|-------------|------|-------|
| CLAUDE.md §5 third-mode ¶ | YES — detailed | Full paragraph: when to use, write-guard relaxation, pool risk, ADR pointer | 3 (long paragraph) |
| apex-orchestrate Step 3.5 | PARTIAL | "a real build session, not a planning detour — treat it like a DeepSeek coding session" | 1 |
| apex-governance | NO | — | — |

**Canonical home:** CLAUDE.md §5 (it's a user-facing workflow boundary note). apex-orchestrate's one-liner is reinforcing actionable instruction ("no spec-authoring"), not duplicating narrative.  
**Verdict:** Borderline — orchestrate's framing is actionable, CLAUDE.md's is explanatory. Not a clean duplicate; the orchestrate line earns its place.  
**Est. lines saved: 0 (judgment call)**

---

### Fact 7: "One backend per session / ≤1 crossing per build" constraint (backend wall)

| File | Carries it? | Form | Lines |
|------|-------------|------|-------|
| apex-code | YES — canonical | `**Backend wall (C1) — one session = one backend; ≤1 crossing/build.**` with step-by-step swap instructions | 5 |
| apex-plan | PARTIAL | "apex-code dispatches each backend batch with the per-task model override, prompting for the one manual backend swap before the Claude batch." | 1 |

**Verdict:** No duplication — apex-plan describes the *output format* requirement; apex-code describes *how to execute the swap*. Different slices.  
**Est. lines saved: 0**

---

## Duplication rubric summary

| Finding | Rubric tag | Files | Canonical home | Est. lines saved |
|---------|-----------|-------|---------------|-----------------|
| Detection-precedence rule appears 4× | DUPLICATION | CLAUDE.md §3 (canonical), CLAUDE.md §5, apex-orchestrate, apex-governance | CLAUDE.md §3 | ~4 |
| Soft pool guard re-stated in orchestrate + CLAUDE.md | DUPLICATION | apex-governance (canonical), apex-orchestrate, CLAUDE.md §5 | apex-governance | ~3 |
| Cross-backend escalation rule in governance repeats apex-code | DUPLICATION | apex-code (canonical), apex-governance | apex-code | ~2 |
| CLAUDE.md §5 third-mode paragraph re-tells ADR-025 rationale narrative inline | CHANGELOG-AS-CONTENT | CLAUDE.md §5 | ADR-025 | ~2 (trim to pointer) |
| apex-orchestrate Step 3.5 explains soft pool guard instead of citing apex-governance | VERBOSITY | apex-orchestrate | apex-governance | ~2 |

**Total conservative estimate: ~9–13 lines saved** across the non-canonical copies if each shrinks to a one-line pointer.

---

## Appropriately-divided slices (not flagged)

- apex-plan §Model-routing build planning: eligibility filter, complexity rubric, cost order, model ceilings, split-only-on-freezable-boundary, wave-plan emit format — **all planning-mode execution logic**. No overlap with apex-code's dispatch table.
- apex-code §Model-routing dispatch: tag→backend table, per-worker override mechanic, backend-wall swap procedure, validation gate, within-backend free switch — **all coding-mode dispatch logic**.
- apex-code §Model escalation on verify-fail: full escalation protocol with sub-cases — **coding-mode execution**.
- apex-orchestrate Step 3.5: mode confirm + route — **orchestration**. One-liner soft-pool-guard mention is a useful in-context reminder for the routing skill; borderline but earns its place.
- CLAUDE.md §Session-Start step 3: 3-bullet precedence table — correct home for the user-visible mode detection summary.

---

## MODEL-REDUNDANT note

The original RED probe (referenced in memory) found difficulty/effort-gating is model-native. That applies to the *complexity rubric* in apex-plan — a capable model can score task complexity without a detailed rubric. However, the rubric in apex-plan is a **constraint enumeration** (what factors to weigh, what the hard ceiling is for `flash` vs `pro`), not a general intelligence task. It is not model-redundant in the same way; it encodes architectural decisions (e.g., "pro is the proactive text ceiling, never route text to opus proactively") that the model won't derive correctly without instruction.

---

## Verdict

The spread is **mildly bloated** — the routing story's core slices are correctly distributed (plan=route, code=dispatch, governance=guard, orchestrate=detect), but the **detection-precedence rule**, **soft pool guard protocol**, and **cross-backend escalation summary** each appear in 2–3 non-canonical homes. Total redundant prose is modest (~9–13 trimmable lines), but CLAUDE.md §5's third-mode paragraph is the most egregious case: it re-narrates ADR-025 rationale inline, repeats the precedence rule verbatim, and duplicates the pool-guard summary — a 3-sentence paragraph that should be ≤1 pointer sentence.
