# Donor-system absorption report — synthesis

_Compare-and-absorb pass over 8 external/co-installed dev systems, ECC-style. 8 parallel
research agents (2026-06-03), each dedup-aware against APEX's current state and tagging every
candidate's token-cost. Per-system detail: `kiro.md`, `bmad.md`, `spec-kit.md`, `gsd.md`,
`superpowers.md`, `aider.md`, `cline.md`, `openspec.md`. **Report only — no skill changes made.**_

Systems: **Tier 1** Kiro · BMAD-METHOD · GitHub Spec-Kit · GSD (co-installed) · **Tier 2**
Superpowers (co-installed) · Aider · Cline/Roo · OpenSpec.

---

## 1. The headline: convergent gaps (multiple donors independently surface them)

Convergence = highest-confidence signal. Three clusters where ≥2 systems agree APEX is missing
something:

| Convergent candidate | Donors agreeing | APEX today | Token-cost | Verdict |
|----------------------|-----------------|------------|-----------|---------|
| **Persisted app-flow / UI-SPEC doc** | Kiro (`design.md` app-flow), BMAD (UX/EXPERIENCE artifact), GSD (UI-SPEC contract) | **Gap** — UI/UX is unwritten judgment; this is the open **SP0 Appflow question** | **Low** (on-demand; loaded only by UI specs/reviews) | **ADOPT** — strongest convergent signal; closes a known open question |
| **Living capability spec (merge-on-archive)** | OpenSpec (headline), GSD (milestone audit), relates to APEX System Overview (a stub) | **Partial gap** — `done/` is a write-only archive; overview.md exists but is a stub, no guaranteed current-truth doc | **HIGH if naive** (a living-spec set risks always-loaded). Guardrail: domain-partition + terse index + on-demand load | **ADOPT w/ guardrails** — also serves the portability-insurance goal; biggest token risk |
| **Brownfield codebase-mapping** | Kiro (steering-from-code), BMAD (brownfield), GSD (`gsd-map-codebase`, already on disk) | **Gap** — APEX is greenfield-oriented | **HIGH when used** (whole-repo scan, parallel agents) | **NOTE — gate to brownfield onboarding**; reuse co-installed `gsd-map-codebase`, don't rebuild |

---

## 2. Lean process wins (all Low token-cost, high confidence)

Cheap, high-leverage, mostly convergent — the safe bundle:

| Candidate | Donor(s) | What it changes in APEX | Cost |
|-----------|----------|-------------------------|------|
| **Requirement↔task coverage audit** | Spec-Kit (`/analyze`) | Readiness-gate pass: every acceptance criterion maps to ≥1 task; flag orphan tasks / zero-task criteria | Low |
| **Unresolved-marker clarify gate** | Spec-Kit (`[NEEDS CLARIFICATION]`), GSD (decision-carryover), Superpowers (one-Q-at-a-time) | Greppable marker in drafts; a spec cannot reach `docs/changes/` with any unresolved | Low |
| **Spec/plan self-review checklist** | Superpowers, GSD (ambiguity gate) | Coverage / placeholder / consistency / ambiguity checklist folded into the readiness gate | Low |
| **Edit-format reliability binding for DeepSeek** | Aider (DeepSeek-V3.2 = 98.2% diff-format) | impl note: prefer exact search/replace edits; failed apply = a verify failure | Low — hardens AFK builds |
| **4-status subagent contract** | Superpowers (DONE / DONE_WITH_CONCERNS / BLOCKED / NEEDS_CONTEXT) | apex-code wave workers return a structured status, not prose | Low |
| **receiving-code-review discipline** | Superpowers (genuine gap) | no-performative-agreement, verify-before-implementing, YAGNI — small new section | Low |
| **Conditional / glob-gated context loading** | Kiro (steering inclusion modes), BMAD (index-guided shard load) | Front-matter load modes (always / fileMatch / manual) so rules/docs load only when relevant — cuts baseline | Low / **net-saving** |
| **Context-utilization tripwire** | GSD (`health --context` ~70%), Cline (focus-chain re-inject) | Recommend `/compact` at ~70% live context; keep In-Flight task list re-injected | Low / net-saving |
| **Workspace snapshot/rewind (git-stash)** | Cline (shadow-git checkpoints) | apex-code stashes uncommitted bytes before a risky task; APEX checkpoints *position* but never file bytes | Low |
| **Scale-adaptive collapse lane** | BMAD (skip-PRD for trivial) | apex-plan routing: collapse ceremony for L0/L1 trivial work (inverse of split-if->3-files) | Low / net-saving |

---

## 3. Token-cost watchlist (the user's explicit ask — HIGH items)

**Absorb the behaviour, never the spine.** Every High below is either rejected or gated:

- **BMAD 12–19-agent persona pipeline — REJECT.** ~31.7k tokens/run, third-party figures cite
  $800–2,000+/dev/mo and a task 27× slower than OpenSpec. APEX's planning/coding split + fresh-context
  reviewers already deliver the upside *without* the bill. Porting the pipeline imports the exact cost
  APEX is built to avoid.
- **GSD phase-numbering spine + `gsd-sdk` Node toolchain + graphify + auto-learning — REJECT.** Many
  phases × passes, 250–780-line workflow files loaded per command; conflicts with APEX's pure-Markdown
  charter and no-auto-learning stance (ADR-011). Cherry-pick individual behaviours only.
- **Aider repo-map injected into the coder every turn — REJECT that shape.** HIGH waste and
  contradicts the no-exploration spec model. Absorb the map *only* as a one-shot planning-side file
  discovery instrument (Med, and likely net-saves vs manual grepping); never as coder context.
- **Roo Boomerang/orchestrator subtask delegation — REJECT.** Multiplies agent spawns; duplicates
  APEX wave-dispatch (isolated subtask + summary return) which already does this.
- **Living capability spec (§1) — HIGH, ADOPT ONLY WITH GUARDRAILS.** Domain-partition, terse
  capability index (not a GIVEN/WHEN/THEN corpus), never auto-load the whole set.
- **Brownfield mapping (§1) — HIGH when used.** Gate behind an explicit `--brownfield` onboarding;
  reuse `gsd-map-codebase`.
- **Cline context-condensing — Med (spend-to-save).** One summarisation call per trigger; net-positive
  on long builds but bad threshold tuning wastes — codify APEX's existing ad-hoc compaction instead.

---

## 4. Dedup — already-have (do NOT re-absorb)

Confirmed equivalents APEX already holds equal-or-ahead:

- **Spec-Kit "constitution"** = APEX `CLAUDE.md` + `apex-governance` (don't port; APEX's is richer).
  Constitution *versioning* duplicates the ADR log.
- **Cline Plan/Act mode** = APEX's cross-backend planning/coding split (APEX's is stronger — true model
  separation, not an intra-session toggle).
- **Aider auto-commit** = APEX gated commit discipline (APEX stricter); **auto-lint/test loop** =
  Verification Recipe; **architect/editor split** = backend split.
- **Superpowers** executing-plans / dispatching-parallel-agents / TDD / verification / writing-skills =
  apex-code / waves / apex-testing / Verification Recipe / apex-skill-author (APEX equal-or-ahead;
  APEX already absorbed its Iron Law + prompt-independence via the ECC pass).
- **BMAD persona pipeline upside** = APEX dispatched fresh-context specialist reviewers.
- **OpenSpec** proposal/design/tasks + draft→ready→done lifecycle = APEX spec lifecycle (APEX leaner).
- **30+-agent portability packaging** (Spec-Kit) — against APEX's deliberate 2-backend design.
- **Git worktrees** (Superpowers) — deliberate non-fit for serial single-host DeepSeek.

---

## 5. Recommended absorption set (ranked)

- **Bundle A — Lean wins (Low cost, adopt now):** all of §2 + the app-flow/UI-SPEC doc (§1 row 1).
  ~10 small skill edits, mostly into `apex-plan` (readiness gate), `apex-code` (worker contract,
  workspace stash), `apex-ui-ux-design` (UI-SPEC artifact), `apex-context-budget` (conditional
  loading + tripwire), one small `receiving-code-review` addition.
- **Bundle B — Architectural (design first, then adopt w/ guardrails):** living capability spec /
  merge-on-archive (§1 row 2). The one HIGH-token item worth doing; needs a design decision
  (likely an ADR) on domain-partition + load discipline before any edit.
- **Bundle C — Gated/future:** brownfield mapping (reuse `gsd-map-codebase`, gate to onboarding);
  Kiro-style agent hooks (manual / spec-task-complete triggers only); planning-side repo-map
  discovery (optional). All Mac-env-or-later, none urgent.
- **Reject pile (documented §3/§4):** BMAD pipeline, GSD spine/toolchain/graphify/auto-learning,
  Aider repo-map-in-coder, Roo orchestrator, constitution versioning, worktrees.

**Convergence verdict:** the single highest-value, lowest-risk add across all 8 systems is the
**persisted app-flow / UI-SPEC doc** (3 donors + an already-open APEX question). The highest-value
*architectural* add is the **living capability spec**, but it's also the only real token risk and
needs guardrails. Everything else is a cheap process sharpening or a rejected token trap.
