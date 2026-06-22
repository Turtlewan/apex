# Skill Bloat Audit — Light Skills & Line-Budget Sweep
**Date:** 2026-06-22
**Scope:** apex-research v1.4.0 (+39 lines), apex-ui-testing/impl.md v1.5.0 (+23 lines), apex-plan v1.22.0 sufficiency-audit addition, apex-governance v1.9.0–1.11.0 (ADR-020 UI-escalation + worktree/ultra + coding model routing additions). Model-routing sections in apex-plan/apex-code/apex-orchestrate NOT deep-dived here (owned by another agent); included in line-count table only.

---

## Line-Count Table

| Skill | Lines | Cap (500) | Status |
|-------|-------|-----------|--------|
| apex-code/SKILL.md | 565 | 500 | **OVER (+65)** |
| apex-plan/SKILL.md | 528 | 500 | **OVER (+28)** |
| apex-ui-ux-design/SKILL.md | 498 | 500 | AT CAP (2 under) |
| apex-research/SKILL.md | 316 | 500 | OK |
| apex-governance/SKILL.md | 263 | 500 | OK |
| apex-orchestrate/SKILL.md | 229 | 500 | OK |
| apex-ui-testing/impl.md | 171 | 500 | OK |
| apex-ui-testing/SKILL.md | 89 | 500 | OK |

**Cap risk:** apex-code is 65 lines over; apex-plan is 28 over; apex-ui-ux-design is at the threshold. Both over-cap skills are owned by another agent's deep dive — flagged here for completeness.

---

## Per-Target Bloat Findings

### apex-research/SKILL.md — § Web access under dispatch (+39 lines)

**Commit:** `cc677a5` — 2026-06-21

The addition is substantively correct and operationally necessary. However:

#### Finding R1 — DUPLICATION (Hard Blocks + Review Checklist triple-restatement)
The core rule "background agents can't approve novel WebFetch domains, pre-authorise first" is stated in three places within the same file:
1. **§ Web access under dispatch** (the full procedure block, lines 77–99) — authoritative home.
2. **§ Hard blocks**, item 2 (lines 294–296) — restates the mechanism in full.
3. **§ Review checklist**, item 3 (line 308) — restates again with a long parenthetical explanation.

The Hard Blocks item and the checklist item are meant to be terse reminders pointing back to the authoritative section. Instead both carry the full mechanism text, adding ~7 lines of pure duplication. The Hard Blocks item should be: `- Never rely on a dispatched Phase-2 agent to approve a novel WebFetch domain (§ Web access under dispatch).` The checklist item should drop the parenthetical entirely: `[ ] Source domains pre-authorised before dispatch (§ Web access under dispatch)`.

**Est. saving:** ~7 lines. **Severity:** Low — correctness intact; pure duplication.

#### Finding R2 — VERBOSITY (§ Web access under dispatch)
The section heading + three-step procedure is well-structured but the closing summary sentence ("The cheap tier still performs every WebFetch; the planning model only clears domains and synthesises. 'Opus/Fable plan, Sonnet/Haiku fetch' stays intact.") repeats the model contract already stated in the phase table immediately above. The sentence exists because the section is long enough that the reader might forget — but that's an argument for trimming the section, not adding a reminder. Cut the closing summary.

**Est. saving:** 2 lines. **Severity:** Low.

#### Finding R3 — CHANGELOG-AS-CONTENT (sources frontmatter)
`Observed env finding 2026-06-21 — background-agent web-deny (non-interactive approval)` was added to the `sources:` frontmatter. Sources should name the *referenced system* (APEX docs, official tool docs), not a session discovery that reads like a change-log entry. The finding belongs in SKILL-HISTORY.md. Source should be removed or replaced with `APEX memory/background-agents-no-interactive-approval` (if a canonical name is preferred).

**Est. saving:** 1 line. **Severity:** Low.

#### Finding R4 — Phase-table cell bloat
The Phase 1 "Does" cell was expanded from a clean one-liner to include a parenthetical forward-reference: `**pre-authorise the source domains** the agents will fetch (§ Web access under dispatch)`. The "Never does" cell also had `Mechanical retrieval (fetch/extract)` added (previously blank). The "Never does" addition is fine — it was a gap. But the "Does" parenthetical is redundant with the section immediately below; a shorter form like `pre-authorise source domains before dispatch` without the cross-reference is sufficient (the section follows directly).

**Est. saving:** ~1 line in the table. **Severity:** Very low.

---

### apex-ui-testing/impl.md — § Deterministic design-lint (+23 lines)

**Commit:** `e0b43c7` — 2026-06-17

#### Finding U1 — SPECULATIVE/UNUSED ("Validate against the first real web-UI build")
The closing sentence `Validate against the first real web-UI build` signals this is a provisional/untested reference. Per the rubric, content for an unproven/not-yet-used feature should not land in the loaded skill body; it should be in an ADR or a parked note. The 23-line section is otherwise lean, but the "validate" caveat undermines the instruction — if it needs validation, it should not be prescriptive yet. Either the section is stable enough to trust (drop the caveat and assert it) or it isn't ready to be in the skill (move to ADR-022 + a one-liner "when proven" placeholder).

**Est. saving:** If removed: 16 lines (section body) + 1 checklist line. If caveat only removed: 0 net lines but improves authority. **Severity:** Medium — the caveat makes the section self-undermining.

#### Finding U2 — DUPLICATION (forbidden-pattern gate overlap)
The section describes `impeccable` as "the maintained version of the hand-written forbidden-pattern gate above." This is accurate but means the section is justified by partially replacing an existing section. The hand-written forbidden-pattern gate is still listed separately in the checklist. If `impeccable` supersedes the hand-written gate for web-UI projects that wire it, the two checklist items should be mutually exclusive with clearer scoping. Currently both appear, which could cause a coder to run both on the same project. Minor structural ambiguity.

**Est. saving:** 0 lines (clarification only). **Severity:** Low.

#### Finding U3 — VERBOSITY (Node version + license inline)
`Requires Node ≥24. Source: github.com/pbakaus/impeccable (Apache-2.0, ADR-022).` — the Node version requirement belongs in the project's own tooling notes or the spec, not the skill. The license is trivia. Trim to: `Source: github.com/pbakaus/impeccable (ADR-022).`

**Est. saving:** ~1 line. **Severity:** Very low.

---

### apex-plan/SKILL.md — Sufficiency audit addition (v1.22.0)

**Commit:** `682c2a3` — 2026-06-19

#### Finding P1 — DUPLICATION (mechanism rule in body + readiness gate)
The rule `Tasks state the mechanism, not just the outcome` was added in two places:
1. **§ As you build the spec** (lines 207–211) — inline rule with full explanation.
2. **Readiness gate → Sufficiency audit** (line 362) — the backstop check.

The inline rule (5 lines) explicitly ends with `(The readiness gate's Sufficiency audit is the backstop for this.)` — so it knows it's duplicated. The inline rule is useful as a draft-time nudge; the gate is the enforcement point. Both are load-bearing at different stages, so this is a justified cross-reference, not pure bloat. However the inline explanation is verbose — it says "DeepSeek executes the literal instruction: 'reuse primitive X' yields X's existing behaviour, not the new one." This example is explanatory rationale that belongs in an ADR or MEMORY, not the spec-authoring body. The rule itself (`name the concrete producing step`) is one sentence; the example can be cut.

**Est. saving:** ~2 lines (the DeepSeek-executes-literally example). **Severity:** Low.

#### Finding P2 — CHANGELOG-AS-CONTENT (inline parenthetical)
The parenthetical `(The readiness gate's Sufficiency audit is the backstop for this.)` inside the inline rule is a forward-reference/rationale. Remove it — the gate exists regardless of whether the rule announces it.

**Est. saving:** 1 line. **Severity:** Very low.

---

### apex-governance/SKILL.md — Additions v1.9.0–1.11.0

**Commits:** `17d4daa` (ADR-020 UI escalation), `cb20a4d` (worktree + ultra), `2abd554` (coding model routing + soft pool guard)

#### Finding G1 — DUPLICATION (soft pool guard restated in apex-orchestrate)
`apex-orchestrate/SKILL.md` lines 93–97 already carry a brief statement of the soft pool guard rule ("`soft pool guard` — it draws the same Max subscription pool as planning, so keep the coder on Sonnet by default and reach Opus only when complexity warrants (apex-governance owns the guard)"). The governance section (lines 77–84) is the authoritative home and is more detailed — that's correct. But the orchestrate summary is longer than a pointer needs to be; it restates the mechanism rather than just pointing. The governance section itself is not the problem here — the orchestrate duplication is. Flagged as a cross-skill candidate for consolidation (§ Duplication candidates below).

**Severity:** Low (gov owns it correctly; orchestrate is the over-talker).

#### Finding G2 — VERBOSITY (soft pool guard — deferred durable fix)
`The durable fix (isolated, budget-capped) is the headless claude -p path (deferred).` — this is roadmap/deferred-ADR content, not a governance rule. It documents what's *not* been done. Cut it (the MEMORY and ADR carry it).

**Est. saving:** 1 line. **Severity:** Low.

#### Finding G3 — VERBOSITY (UI escalation "Not a general licence" paragraph)
The final paragraph of § Capability-routed UI escalation (lines 112–114) says "Not a general planning-mode coding licence: outside this visual-divergence trigger, code edits still default to a DeepSeek coding session." This restates the constraint stated in "Allowed only when all hold" above it. The "The loop itself is homed in apex-ui-ux-design" pointer is useful; the restatement is not. Trim to pointer-only: `Not a general coding licence. The loop: apex-ui-ux-design § Live preview + Claude visual escalation.`

**Est. saving:** 2 lines. **Severity:** Low.

#### Finding G4 — WORKTREE NOTE: "One coding-session validation pending"
`One coding-session validation pending.` (governance § Worktree isolation) is a status note — changelog content. Remove it; it's not a rule and it decays. If validation is still pending, SKILL-HISTORY is the right home.

**Est. saving:** ~0.5 line (inline). **Severity:** Very low.

#### Finding G5 — CHANGELOG-AS-CONTENT (model routing section header comment)
The section `## Coding model routing & the soft pool guard (ADR-024/025)` carries the ADR reference in the header, which is fine. But the body repeats the detection precedence (`deepseek` URL → DeepSeek; `APEX_MODE=coding` → Claude; else planning) already stated in apex-orchestrate § Step 3 and in apex-code. Three places carry the full precedence chain. Governance should state the capability-not-authority rule for the router (which it does well) but defer the precedence order to apex-orchestrate. One sentence cross-reference would suffice.

**Est. saving:** ~3 lines. **Severity:** Low-Medium (the three-way restatement of detection precedence is the real bloat here).

---

## Cross-Skill Duplication Candidates

These rules are restated in 2+ recently-changed skills and should be examined for consolidation:

| Rule | Files | Recommendation |
|------|-------|----------------|
| Backend detection precedence (deepseek URL → DS coding; APEX_MODE=coding → Claude coding; else planning) | apex-orchestrate/SKILL.md (authoritative), apex-governance/SKILL.md, apex-code/SKILL.md | Consolidate to apex-orchestrate; others point. Est. ~6 lines cut across governance + code. |
| Soft pool guard mechanism | apex-governance/SKILL.md (authoritative), apex-orchestrate/SKILL.md | Orchestrate should collapse to one-sentence pointer to governance. Est. ~3 lines. |
| `capability, not authority` framing | apex-governance/SKILL.md (stated twice: coder-tier § and UI-escalation §), apex-ui-ux-design/SKILL.md | Governance states it correctly twice for two distinct contexts; apex-ui-ux-design cross-references it. This is a pointer, not duplication — no action. |
| Pre-authorise background WebFetch domains | apex-research/SKILL.md (three times within the file — see R1) | Consolidate within the file: keep the procedure section, compress Hard Blocks + checklist items to pointers. Est. ~7 lines. |
| Tasks state the mechanism not the outcome | apex-plan/SKILL.md §spec-authoring + readiness gate (justified dual-location — draft-time nudge vs gate) | No action: the two locations serve different stages. Trim the example prose in the body (Finding P1). |

---

## Summary Verdict

The four target additions are all operationally justified — no speculative or model-redundant content. The main bloat patterns are: (1) within-file triple-restatement of the web-dispatch pre-authorise rule in apex-research (~7 lines recoverable); (2) the "validate against first real build" caveat in ui-testing that makes the impeccable section self-undermining (remove caveat or defer section); (3) the soft-pool-guard and backend detection-precedence stated in full across governance + orchestrate + code instead of one authoritative home + pointers (~6–9 lines cross-skill); (4) minor deferred-roadmap and status notes embedded in skill bodies (G2, G4). Total recoverable: approximately 20–25 lines across the four files, with no loss of instruction.
