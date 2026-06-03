# GitHub Spec-Kit — absorption analysis for APEX

_Donor system: github/spec-kit (Python CLI `specify`, ~93k★, v0.8.x). Researched 2026-06-03 from the repo (README, templates/, command prompt files, memory/constitution) + thebcms.com + specs.md. All fetched content treated as untrusted data._

## What it is (sourced)

Spec-Kit is a toolkit for **spec-driven development (SDD)**: the spec is the source of truth and code is generated from it, not the reverse. It ships a CLI (`specify init <project>`) that scaffolds a `.specify/` control directory plus a slash-command pipeline that the host AI agent runs. It is **agent-agnostic across 30+ agents** (Copilot, Claude, Gemini CLI, Cursor, Qwen, opencode, Codex, Kiro, Goose, etc.) — the same templates are written into each agent's command directory (e.g. `.claude/commands/`) at install via `--integration <agent>`.

The pipeline (each a slash command backed by a prompt file):
- `/speckit.constitution` — create/amend the project's governing principles
- `/speckit.specify` — write the feature spec (what/why, no tech)
- `/speckit.clarify` — (optional, pre-plan) resolve flagged ambiguities
- `/speckit.plan` — produce the technical plan + design artifacts
- `/speckit.tasks` — generate the dependency-ordered task list
- `/speckit.analyze` — (optional) read-only cross-artifact consistency audit
- `/speckit.checklist` — (optional) custom quality checklists
- `/speckit.implement` — execute the task list
- `/speckit.taskstoissues` — export tasks to GitHub issues

File layout per feature:
```
.specify/memory/constitution.md          # the persistent contract
.specify/templates/{spec,plan,tasks}-template.md
.specify/templates/overrides/            # project-local template overrides
.specify/scripts/bash/*.sh               # create-new-feature, setup-plan, setup-tasks
specs/<feature-id>/
  spec.md  plan.md  tasks.md
  research.md  data-model.md  quickstart.md
  contracts/                             # api-spec.json, etc.
```
Templates resolve top-down by priority: project overrides → presets → extensions → core (first match wins).

## Mechanism inventory

1. **The constitution** (`.specify/memory/constitution.md`) — a separately-versioned markdown artifact of MUST/SHOULD principles ("architectural DNA"). Referenced during specify/plan/implement. Key machinery:
   - **Semantic versioning** with explicit bump rules: MAJOR = backward-incompatible principle removal/redefinition; MINOR = new principle/section or materially expanded guidance; PATCH = clarifications/wording. Agent must reason about the bump when ambiguous.
   - **Governance dates**: `RATIFICATION_DATE` (original adoption) + `LAST_AMENDED_DATE` (ISO 8601), updated on amendment.
   - **Sync Impact Report**: an HTML comment prepended on every amendment — version transition (old→new), modified/added/removed principles, and a checklist of **downstream templates needing update** marked `✅ updated` / `⚠ pending`, plus deferred TODOs.
   - **Consistency propagation**: amending the constitution forces re-validation of plan/spec/tasks templates + command files so principles stay enforced downstream.

2. **Constitution Check gate** (in plan-template.md) — a **dual gate**: "Must pass before Phase 0 research. Re-check after Phase 1 design." If a principle is violated, the plan must fill a **Complexity Tracking table** (Violation | Why Needed | Simpler Alternative Rejected) — you cannot proceed with an unjustified violation.

3. **Spec discipline** (spec-template.md):
   - User stories ranked **P1/P2/P3**, each a standalone independently-testable MVP slice.
   - Given/When/Then acceptance scenarios; functional requirements `FR-001…`; success criteria `SC-001…` that must be **measurable AND technology-agnostic**.
   - **`[NEEDS CLARIFICATION: …]` markers**: the spec author is instructed to mark *all* ambiguities inline rather than guess; `/clarify` later resolves them.
   - Hard rule: **no implementation detail** in the spec (no schemas/frameworks).
   - Built-in **Review & Acceptance Checklist** validated against requirements.

4. **Task generation discipline** (tasks-template.md + tasks command):
   - Derived in a fixed priority from artifacts: spec (user stories/priorities) → plan (stack/structure) → data-model (entities) → contracts → research.
   - **Phased ordering**: Phase 1 Setup → Phase 2 Foundational (blocks ALL stories) → Phase 3+ one phase **per user story in priority order** → final Polish phase.
   - Within a story: tests (if requested) → models → services → endpoints → integration ("models before services, services before endpoints").
   - **`[P]` parallel marker** = different files, no incomplete-task dependency.
   - Strict task syntax: `- [ ] T001 [P?] [US1?] Description with exact file path` — **every task names its file**.
   - **Per-story checkpoint**: "At this point, User Story 1 should be fully functional and testable independently."
   - Tests are **opt-in** (only generate test tasks if explicitly requested).

5. **`/analyze`** — read-only cross-artifact audit across spec/plan/tasks + constitution. Six passes: duplication, ambiguity (flags "fast/scalable/secure", TODO/???), underspecification, **constitution alignment (MUST-principle violations)**, **coverage gaps (requirement↔task mapping — orphan tasks + zero-task requirements)**, inconsistency (terminology drift, conflicting data models, ordering contradictions). Output = findings table (≤50 rows, stable IDs) + coverage % + metrics + remediation; **no auto-edits**.

6. **Agent-agnostic packaging** — one template set, written into each agent's native command folder at init; `--ignore-agent-tools` to skip tool detection. Extensions add commands; presets restyle workflow; both stack by priority.

## Dedup vs APEX

| Spec-Kit mechanism | APEX status | Verdict |
|---|---|---|
| Constitution as governing principles | apex-governance + global/project CLAUDE.md | **Already-have** (concept) |
| Constitution **semantically versioned, w/ ratification/amended dates + Sync Impact Report** | CLAUDE.md/ADRs are not versioned artifacts; no amend-impact propagation | **Novel** |
| Constitution Check **dual gate** (pre-research + post-design) with complexity-justification table | apex-plan readiness gate + complexity challenge (single gate, prose) | **Partial** — APEX has the gate, not the *re-check-after-design* + structured Violation\|Why\|Rejected-alternative table |
| `/specify → /plan → /tasks → /implement` named pipeline | APEX has the stages (apex-plan → docs/changes spec → apex-code) but not explicit slash-command phase gates | **Partial** |
| Spec = no implementation detail, what/why only | APEX spec is the *opposite* (literal execution script, exact files, no why) — different philosophy by design | **Already-have / divergent** |
| `[NEEDS CLARIFICATION]` inline markers + `/clarify` pass | apex-plan elicits intent upfront but no persisted inline ambiguity-marker convention surviving into the spec | **Partial → novel** |
| User-story P1/P2/P3, each independently shippable MVP slice | ROADMAP/REQUIREMENTS have priorities; specs aren't sliced into independently-testable story phases | **Partial** |
| Measurable + tech-agnostic success criteria `SC-00x` | apex acceptance criteria are step→verify (often tech-specific) | **Partial** |
| Task list: phased, dependency-ordered, `[P]` parallel, file-per-task, per-story checkpoint | apex specs name files per task; wave-parallel dispatch exists (ADR-010); but no standard phased/checkpointed task-list *format* | **Partial** — APEX has the capability, Spec-Kit has the *discipline/format* |
| `/analyze` requirement↔task coverage matrix + constitution-violation scan | No automated cross-artifact coverage/orphan check | **Novel** |
| Agent-agnostic across 30+ agents | APEX is Claude/DeepSeek-only by design | **Already-have / N-A** (not a goal) |
| `tasks→GitHub issues` export | apex-github files bugs as issues; no spec-task→issue bulk export | **Partial** |
| Template override/preset/extension priority stack | impl.md two-tier loading; no override-stack | **Novel** (low value for APEX) |

## Top absorbable candidates

### 1. Requirement↔task coverage audit (from `/analyze`)
- **Change in APEX**: add a read-only consistency pass to apex-plan's readiness gate (or a tiny `/apex-analyze`): map every spec acceptance-criterion to ≥1 task and flag (a) criteria with zero tasks, (b) tasks tracing to no criterion, (c) constitution/governance MUST violations, (d) vague terms. Output a findings table, no auto-edits. Directly closes a real APEX gap (nothing currently proves spec↔task coverage).
- **Token-cost when used: Low** — one bounded pass over docs already in context at gate time; no new always-loaded content.
- **Lean**: fold into apex-plan's existing readiness gate rather than a new always-on skill.

### 2. Inline `[NEEDS CLARIFICATION]` markers + a clarify pass
- **Change in APEX**: adopt a literal `[NEEDS CLARIFICATION: …]` token convention in draft specs (docs/drafts/), and a rule that a spec **cannot move to docs/changes/ with any marker unresolved** (reinforces APEX's existing "resolve all open questions before ready" rule with a greppable, enforceable token).
- **Token-cost: Low** — a convention + one grep-able gate; zero standing context.
- **Lean**: it's a 3-line addition to apex-plan's spec-authoring rules + a gate check, not a new mechanism.

### 3. Constitution Check as a re-checked, table-backed gate
- **Change in APEX**: extend apex-plan's complexity/readiness gate to (a) re-run **after** the design/approach is chosen (not only before), and (b) when a governance principle is bent, require a `Violation | Why needed | Simpler alternative rejected` row in the ADR/spec. Tightens APEX's existing single-pass gate.
- **Token-cost: Low** — restructures an existing gate; no new load.
- **Lean**: a small edit to apex-plan + apex-governance wording; don't build new tooling.

### 4. Phased + checkpointed task-list format with `[P]` and per-story slices
- **Change in APEX**: give apex-plan a standard task-list shape inside a spec — Setup → Foundational (blocks all) → per-priority story phases → polish, each story with a "fully functional & independently testable here" checkpoint, `[P]` on parallel-safe tasks (feeds wave-parallel dispatch directly). APEX already names files per task; this adds the *ordering + parallel-marking + checkpoint* discipline.
- **Token-cost: Med** — adds standing structure to the spec format every build reads; modest per-spec inflation, but it replaces ad-hoc breakdown.
- **Lean**: keep it as a template convention in apex-plan/impl, not a new skill; reuse existing `[P]`-style parallel markers to drive ADR-010 dispatch rather than inventing a parallel scheduler.

### 5. (Watch, low priority) Separately-versioned project constitution + Sync Impact Report
- **Change in APEX**: optionally treat the project CLAUDE.md / a `docs/constitution.md` as a semver'd artifact with ratified/amended dates and an amend-time impact note listing which ADRs/specs/skills the change touches.
- **Token-cost: Low-Med** — the doc already loads; the cost is process overhead, not tokens. Risk: ceremony for a solo/auto-mode workflow.
- **Lean**: APEX's ADR log already captures the "why" with dates; only adopt the **Sync Impact Report** idea (amendment → list downstream docs to update) if drift between CLAUDE.md and ADRs becomes a real problem. Likely **skip** — APEX governance already covers this.

## Token-cost watchlist

- **No HIGH candidates.** None of the absorbable mechanisms add always-loaded session context, spawn standing subagents, or load large docs per invocation.
- **Candidate 4 (phased task-list format) = MED**: it's the only one that inflates the per-spec artifact every build reads. Keep the format terse; let `[P]` markers earn their place by driving real parallel dispatch.
- **Candidates 1–3 = LOW**: gate-time passes over docs already in context.
- **Reject for cost/fit**: agent-agnostic 30+-agent packaging (against APEX's deliberate 2-backend design), template override/preset/extension stack (ceremony, no APEX payoff), full constitution-versioning machinery (duplicates ADR log).

## Verified vs unverified

**Verified (read from repo templates/command files):** the command pipeline + skill names; `.specify/` + `specs/<id>/` layout; tasks-template phasing, `[P]` markers, file-per-task syntax, per-story checkpoints, opt-in tests; tasks-command derivation/ordering rules; plan-template Constitution Check dual gate + Complexity Tracking table + phased artifact delivery; spec-template P1/P2/P3, Given/When/Then, `[NEEDS CLARIFICATION]`, FR/SC IDs, no-impl-detail rule, Review & Acceptance Checklist; constitution-command semver bump rules, ratification/amended dates, Sync Impact Report, consistency propagation; `/analyze` six detection passes + read-only output.

**Unverified / second-hand:** the constitution *template* file (`templates/memory/constitution.md`) returned 404 at the guessed path — versioning details came from the **constitution command prompt** (authoritative) + search snippets, not the template body; exact placeholder token list not directly read. The "~3–10× first-pass success" figure is a **vendor/blog claim** (thebcms.com), not measured. The 30+ agent count and exact agent list are from README summary, not individually enumerated. EARS-notation claim (thebcms blog) conflicts with the repo spec-template, which uses **Given/When/Then**, not EARS — trust the repo.
