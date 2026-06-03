# Superpowers — absorption analysis for APEX

_Donor: obra/superpowers v5.1.0 (40.9k★), read directly from disk at
`~/.claude/plugins/cache/claude-plugins-official/superpowers/5.1.0/`. 14 SKILL.md files +
references/process dirs read._

## What it is

A mature, process-discipline skill library for AI-assisted dev: a small set of rigid
"discipline-enforcing" skills (TDD, systematic-debugging, verification-before-completion)
plus a brainstorm → write-plan → execute-plan → finish-branch pipeline, all glued by
fresh-context subagents and git-worktree isolation. Its signature move is **TDD-for-process-
documentation**: every skill is baseline-tested against a subagent under pressure before it's
written (RED/GREEN/REFACTOR on rationalizations). APEX already cites Superpowers and absorbed
its prompt-independence idea (Iron Law) and verification discipline in the ECC pass, so overlap
is high — the value here is precise dedup plus a few sharp specific techniques.

## Per-skill dedup vs APEX

| Superpowers skill | APEX equivalent | Verdict | Note |
|---|---|---|---|
| brainstorming | apex-plan (intent elicitation, widen-options, readiness gate) | **partial** | APEX has divergence + readiness gate. Novel specifics: HARD-GATE "no impl until design approved" applied to *every* project incl. trivial; one-question-at-a-time, multiple-choice-preferred; explicit decompose-if-multi-subsystem step; spec self-review checklist (placeholder/consistency/scope/ambiguity scan). |
| writing-plans | apex-plan spec authoring (docs/changes/*.md as execution scripts) | **have-equal / APEX-ahead** | Both demand exact paths, full code, no placeholders, per-task files. APEX is *ahead* on spec-as-execution-script discipline (no-why-inline, conventions in impl.md not spec, 3-file/2-phase split rule). Superpowers adds a concrete **bite-sized step granularity** ("write test→run→see fail→implement→run→commit", 2-5 min each) and a **plan self-review checklist** (spec-coverage / placeholder / type-consistency) worth borrowing. |
| executing-plans | apex-code (spec runner) | **have-equal** | Both: load plan, review critically first, execute task-by-task, stop-don't-guess on blocker. APEX's recipe-driven verify loop is richer. Minor novel: "never start on main/master without consent". |
| subagent-driven-development | apex-code wave-parallel + dual-pass wave review + dispatched reviewers (ADR-010) | **partial — novel handoff format** | APEX has the parallelism. Novel detail worth importing: the **4-status implementer contract (DONE / DONE_WITH_CONCERNS / BLOCKED / NEEDS_CONTEXT)** + explicit controller handling per status; the **two-stage per-task review ordered spec-compliance-THEN-code-quality** (wrong order is a named red flag); per-task model-tier selection (cheap for mechanical, capable for judgment). |
| dispatching-parallel-agents | apex-code wave dispatch, council (ADR-010) | **have-equal** | Same core (one agent per independent domain, isolated context, specific scope/constraints/output). APEX waves are more structured. Nothing novel. |
| requesting-code-review | apex-reviewer / two-stage review | **partial** | Concept matched. The **code-reviewer.md prompt template** is a sharp, reusable artifact: Strengths→Critical/Important/Minor→Recommendations→Assessment(Ready to merge: Yes/No/With fixes) with file:line + WHY-it-matters mandated. Good calibration text ("not everything is Critical"). |
| receiving-code-review | (no direct APEX skill) | **novel-gap** | APEX has no "how to *receive* review feedback" discipline. Sharp content: verify-before-implementing, no performative agreement ("You're absolutely right!" banned), YAGNI-grep on "implement properly" suggestions, clarify-ALL-unclear-items-before-implementing-any, push-back-with-technical-reasoning. Mostly agent-behaviour, low cost. |
| systematic-debugging | apex-debug (reproduce-before-fixing, one-hypothesis, regression test) | **have-equal / APEX-ahead** | Strong overlap. Superpowers adds two sharp specifics APEX may lack: **multi-component boundary instrumentation** (log data in/out at each layer to localise WHICH component fails before fixing) and the **3-fixes-failed → STOP-and-question-architecture rule** (3+ failed fixes = wrong architecture, not failed hypothesis). Plus supporting files: root-cause-tracing (trace backward to source), condition-based-waiting (replace arbitrary sleeps), defense-in-depth. |
| test-driven-development | apex-testing (TDD, pyramid, DAMP, regression) | **have-equal** | Iron Law ("no production code without a failing test first") + watch-it-fail-for-the-right-reason. APEX covers this. Novel-ish: the **red-green regression verification** (write→pass→revert fix→MUST FAIL→restore→pass) as proof a regression test actually guards; rich rationalization table. |
| verification-before-completion | per-stack Verification Recipe + verification concept | **have-equal** | APEX has the recipe loop (stronger — stack-specific commands). Superpowers' Gate Function (identify→run→read→verify→THEN claim) and "claim requires fresh evidence in THIS message" framing is crisp; the claim→requires→not-sufficient table is a good checklist. |
| writing-skills | apex-skill-author (Iron Law, triple-write, 500-line cap) | **have-equal / APEX-ahead** | Same root (this is where APEX's Iron Law came from). APEX adds triple-write (registry+index+history) and per-backend gate. Superpowers adds **CSO / description-discipline** detail APEX should confirm it has: "description = WHEN-to-use ONLY, never summarise workflow" (because Claude follows the description-summary instead of reading the body) — empirically grounded, high-value authoring rule. |
| using-git-worktrees | (none in core loop) | **novel-gap (token-flagged)** | APEX does NOT use worktree isolation. Detailed workflow: detect-existing-isolation-first (GIT_DIR≠GIT_COMMON, submodule guard), prefer native worktree tool over `git worktree add`, .gitignore-verify, baseline-test-on-entry. **But: low fit for APEX's actual deployment** (single Mac Mini, DeepSeek builds serially) and adds ceremony. Catalogue, don't adopt by default. |
| finishing-a-development-branch | (partial — APEX commit discipline in CLAUDE.md) | **partial** | APEX has per-spec/session commit discipline. Novel: the **structured 4-option finish menu** (merge-local / push-PR / keep / discard) with verify-tests-first gate, typed "discard" confirmation, and provenance-based worktree cleanup (only clean worktrees you created). The discard-confirmation + verify-before-offer pattern is worth a line in apex-code. |
| using-superpowers | apex-orchestrate session-start routing | **have-equal** | Both establish "invoke the skill before responding". APEX's orchestrator + registry is equivalent. The 1%-chance-invoke + rationalization red-flag table is a stylistic asset, not a capability gap. |

## Top absorbable candidates

1. **Spec/plan self-review checklist** (from writing-plans + brainstorming) → add a 4-point
   fresh-eyes pass to apex-plan's readiness gate: spec-coverage (every requirement maps to a
   task), placeholder scan, type/signature consistency across tasks, ambiguity scan. **Token: Low** —
   a checklist run once at spec-finalisation, no extra loads. Lean: very high; APEX's split/no-why
   rules cover scope but not the coverage+consistency self-check.

2. **3-fixes-failed → question-the-architecture rule** (systematic-debugging) → add to apex-debug:
   after 3 failed fixes, STOP and treat it as a wrong-architecture signal, not another hypothesis.
   **Token: Low** — one rule + a red-flag line. Lean: high; cheap insurance against thrash loops.

3. **Multi-component boundary instrumentation** (systematic-debugging) → add to apex-debug for
   multi-layer bugs: log data in/out at each component boundary to localise WHICH layer fails
   before hypothesising. **Token: Low** — technique paragraph, loaded only in debug. Lean: high.

4. **Implementer 4-status contract** DONE / DONE_WITH_CONCERNS / BLOCKED / NEEDS_CONTEXT
   (subagent-driven-development) → adopt as the return format for apex-code dispatched build/
   review subagents, with controller handling per status (more-context / more-capable-model /
   split / escalate). **Token: Low** — formalises existing dispatch, no new always-on context.
   Lean: high; sharper than APEX's current free-form subagent returns.

5. **receiving-code-review discipline** → small new section (or skill) covering: verify before
   implementing review feedback, no performative agreement, YAGNI-grep "implement properly"
   suggestions, clarify all unclear items before implementing any. **Token: Low** — agent-behaviour
   rules. Lean: medium-high; genuine gap, but partly covered by APEX's existing pushback culture.

6. **CSO description rule** ("description = WHEN only, never summarise workflow") → confirm/append
   to apex-skill-author. **Token: Low**. Lean: high — empirically grounded, prevents Claude
   shortcutting the skill body via its own description.

7. **Code-reviewer prompt template** (Strengths → Critical/Important/Minor → Assessment with
   file:line + WHY) → optional template asset for apex-reviewer. **Token: Low** (loaded only when
   reviewing). Lean: medium — APEX's two-stage review likely already structured; adopt only the
   severity-calibration + file:line-mandate wording if missing.

## Token-cost watchlist

- **using-git-worktrees / worktree-per-agent: HIGH-ceremony, NOT recommended.** Worktree
  isolation means N checkouts + N dependency installs + cleanup bookkeeping. Justified for
  parallel humans on a shared repo; poor fit for APEX's single-host serial-DeepSeek model.
  Catalogue only.
- **subagent-driven-development fan-out: Med-High when used.** Per task it spawns implementer +
  spec-reviewer + code-quality-reviewer (3 subagents) plus re-review loops. APEX already pays
  this in waves; importing only the *status contract* (candidate 4) is Low-cost; importing the
  full 3-subagent-per-task loop is the High part — don't make it default.
- Everything else (candidates 1,2,3,5,6,7) is **Low**: checklists, single rules, or templates
  loaded only inside the relevant skill, no always-on context added.

## Verified notes

- Read directly from disk (not from memory): all 14 SKILL.md + the 4 subagent/review prompt
  templates + 2 debugging supporting files (root-cause-tracing, condition-based-waiting).
- APEX is equal-or-ahead on: writing-plans (spec-as-script), test-driven-development,
  verification (recipe loop), writing-skills (triple-write), dispatching-parallel-agents,
  using-superpowers/orchestration.
- Genuine gaps: **receiving-code-review** (no APEX equivalent) and **git-worktrees** (deliberately
  absent — flag, don't adopt).
- Sharpest importable specifics regardless of skill-level overlap: the self-review checklists,
  the 3-fixes architectural-stop, boundary instrumentation, the 4-status subagent contract, and
  the CSO description rule.
