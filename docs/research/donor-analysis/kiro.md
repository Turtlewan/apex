# Kiro — absorption analysis for APEX

_Research date: 2026-06-03. All web/repo content treated as untrusted data; claims tagged Verified/Unverified below._

## What it is (sourced)

AWS Kiro is an agentic IDE (VS Code fork, Claude Sonnet 4.5 default) built around **spec-driven development**. Its signature loop: instead of vibe-coding, Kiro turns an idea into three persisted markdown docs — **requirements → design → tasks** — then executes the tasks with code that traces back to the spec. It layers three persistence mechanisms on top of any project:

- **Specs** — per-feature folder `.kiro/specs/{feature-name}/` holding `requirements.md`, `design.md`, `tasks.md` (or `bugfix.md` for fixes).
- **Steering files** — persistent project context/rules in `.kiro/steering/` (and global `~/.kiro/steering/`), with per-file *inclusion modes* controlling when each loads.
- **Agent hooks** — event-triggered automation in `.kiro/hooks/`, authored as natural-language prompts or shell commands.

It also offers a **vibe vs spec** mode split, an **autopilot vs supervised** autonomy split, and an **Auto** model router that mixes frontier models for quality/latency/cost. Sources: kiro.dev/docs (specs, steering, hooks, models, autopilot); martinfowler.com SDD-3-tools; multiple Medium/DEV writeups.

## Mechanism inventory

1. **Three-doc spec model.** `requirements.md` = user stories ("As a…") + acceptance criteria in **EARS notation** (Easy Approach to Requirements Syntax: GIVEN/WHEN/IF/THEN/SHALL structured clauses). `design.md` = component architecture diagrams, **data flow, data models, sequence diagrams, error handling, testing strategy, implementation approach, migration strategy** (consistent section set). `tasks.md` = discrete trackable tasks, each **referencing back to requirement numbers** (e.g. 1.1, 1.2), with a per-task execution UI (run/review-changes/status).
2. **EARS notation** for unambiguous, testable acceptance criteria.
3. **Task→requirement traceability** — every task cites the requirement IDs it satisfies; per-task run + review.
4. **Wave parallelism** — Kiro builds a dependency graph and groups independent tasks into concurrent "waves."
5. **Steering files** with 4 inclusion modes: `always` (default, loaded every interaction), `fileMatch`/`conditional` (glob-gated, e.g. `components/**/*.tsx`), `manual` (`#file-name` reference), `auto` (loads when request matches a `description`). Foundation trio: `product.md`, `tech.md`, `structure.md`. Workspace overrides global. "Generate Steering Docs" bootstraps them from an existing codebase.
6. **Agent hooks** — triggers: file save/create/delete, prompt submit, agent-turn complete, before/after tool use, before/after spec-task execution, manual. Actions: agent prompt ("Ask Kiro") or shell command. Authored via natural language or a form. Examples seen: test-sync, documentation-update, security-scan.
7. **Vibe vs Spec modes** — vibe = fast chat/discovery; spec = structured plan-before-code.
8. **Autopilot vs Supervised** — autopilot = autonomous multi-file edits; supervised = yields for approval after each edit-bearing turn.
9. **Auto model router** — picks among frontier models per task.
10. **Brownfield bootstrap** — "Generate Steering Docs" reverse-engineers product/tech/structure context from existing code.

## Dedup vs APEX

| Mechanism | have / partial / novel | Note |
|---|---|---|
| Plan-before-code, spec is execution script | **have** | APEX two-backend split; spec = literal execution script with exact files. |
| Requirements doc (PRD/user stories) | **have** | APEX PROJECT+REQUIREMENTS. |
| EARS notation for acceptance criteria | **partial** | APEX specs use step→verify acceptance criteria but no formal EARS GIVEN/WHEN/THEN/SHALL grammar. |
| Design doc: architecture + data model | **have** | APEX architecture/overview.md + data-model.md + ADRs. |
| Design doc: **sequence/data-flow + app-flow/UI** | **novel/partial** | APEX has a *known gap*: no persisted app-flow / UI-SPEC doc. Kiro folds flow into design.md. |
| Tasks doc with task→requirement traceability | **partial** | APEX specs name exact files per task but don't back-link to requirement IDs. |
| Wave-parallel task execution via dep graph | **have** | APEX wave-parallel coding. |
| Per-task run + review UI | **partial** | APEX has per-task verify-loop + two-stage review; no IDE UI (CLI). |
| Persistent project rules | **have** | global+project CLAUDE.md + apex-governance. |
| **Steering inclusion modes (always/fileMatch/manual/auto)** | **novel** | APEX skills route by registry keywords; CLAUDE.md is always-on. No glob-gated *conditional* context-loading primitive. |
| **Agent hooks (event-triggered automation)** | **novel** | APEX has PreToolUse/SessionStart harness hooks for routing/gating, but no user-authorable per-project event→action hooks (on-save test-sync, on-task-complete doc-update). |
| Specialist/domain skills | **have** | ~45 apex-* + registry routing. |
| Autonomy levels / approval gates | **have** | apex-governance L0–L5 ≈ Kiro autopilot/supervised. |
| Model router (Auto) | **have (by design)** | APEX's two-backend split is a deliberate manual router; Kiro's auto-router is orthogonal, low value. |
| Brownfield "generate steering from code" | **novel/partial** | APEX likely-gap: brownfield codebase-mapping / repo-map. Kiro's reverse-engineer-context is a concrete pattern. |
| Learning/feedback loop | **have** | handoff→feedback memories→gated promotion. Kiro has none. |

## Top absorbable candidates

1. **Steering inclusion modes → conditional/glob-gated context loading**
   → *What it changes in APEX:* adds a `fileMatch`/`conditional` and `manual`/`auto` loading primitive so a rule/skill loads **only** when relevant files are in scope, instead of always-on CLAUDE.md or keyword-only routing. Directly attacks context-rot. Could be expressed as front-matter `inclusion:` on project rule docs that apex-orchestrate honours.
   → *Token-cost when used:* **Low** — it *reduces* always-loaded context by gating; the gate metadata is tiny.
   → **Lean: adopt (as a small front-matter convention, not a new skill).**

2. **Agent hooks → user-authorable event→action automations**
   → *What it changes in APEX:* a `.apex/hooks` style registry of project-scoped automations (on-save: run tests; on-task-complete: update docs/changelog; on-spec-task: security-scan). APEX already has harness hooks but not *per-project, user-authored, natural-language* ones tied to build events.
   → *Token-cost when used:* **Med** — each fired hook can spawn an agent turn / subagent; on-save hooks on a hot loop could fire often. Cost scales with trigger frequency, not session baseline.
   → **Lean: note — adopt selectively** (manual + spec-task-complete triggers only; avoid file-save hot triggers). Flag frequency as the cost lever.

3. **Design.md app-flow/sequence layer → fills APEX's app-flow/UI-SPEC gap**
   → *What it changes in APEX:* Kiro proves a single persisted `design.md` can carry data flow + sequence diagrams + UI/screen flow + migration strategy alongside the data model. APEX's known gap (no persisted app-flow/UI doc) could be closed by adding an **app-flow section to architecture/overview.md** (or a sibling `app-flow.md`), generated once per feature/milestone.
   → *Token-cost when used:* **Med** — a persisted doc that planning loads when designing flows; modest if scoped per-feature, High if always-loaded for every build.
   → **Lean: adopt (as a doc-section addition, scoped-load only).**

4. **EARS notation for acceptance criteria**
   → *What it changes in APEX:* upgrades spec acceptance criteria from prose step→verify to a constrained GIVEN/WHEN/IF/THEN/SHALL grammar — more testable, less ambiguous for DeepSeek to execute literally.
   → *Token-cost when used:* **Low** — a writing convention in apex-plan, no extra loaded context.
   → **Lean: adopt (convention in apex-plan spec-authoring rules); keep optional to avoid Kiro's "16 acceptance criteria for a typo" over-ceremony.**

5. **Task→requirement back-linking (traceability IDs)**
   → *What it changes in APEX:* each spec task cites the requirement/ADR ID it satisfies — cheap traceability for review + coverage audit.
   → *Token-cost when used:* **Low** — a few ID tokens per task.
   → **Lean: note** — nice-to-have; APEX's exact-files-per-task already gives most of the value. Adopt only if traceability audits become a need.

6. **Brownfield "generate steering from code"**
   → *What it changes in APEX:* a reverse-engineer pass that produces product/tech/structure context (and seeds CLAUDE.md / overview) from an existing repo — addresses APEX's brownfield codebase-mapping gap.
   → *Token-cost when used:* **High** — one-off but reads broadly across the repo (whole-codebase scan) to synthesise context.
   → **Lean: note** — valuable but already partly on APEX's gap radar; treat as a future apex-init `--brownfield` mode, not urgent.

### Explicitly rejected
- **Auto model router** — APEX's two-backend split is a deliberate, role-based manual router; an auto-router conflicts with the planning/coding governance boundary. **Reject.**
- **Vibe vs Spec / Autopilot vs Supervised as new constructs** — already covered by APEX modes + apex-governance L0–L5. **Reject (already-have).**
- **Per-task IDE run/review UI** — IDE-specific; APEX is CLI. **Reject (N/A).**

## Token-cost watchlist (High flagged)

- **Brownfield "generate steering from code" (#6) — HIGH.** Whole-repo scan to synthesise context; one-off but heavy. Gate behind explicit `--brownfield` invocation; never run automatically on session start.
- **Agent hooks (#2) — MED, but HIGH if mis-scoped.** File-save / agent-turn-complete triggers can fire on a hot loop, each spawning an agent turn. If adopted, restrict to manual + spec-task-complete triggers; forbid file-save triggers by default.
- **Design app-flow doc (#3) — MED, HIGH if always-loaded.** Safe only if scoped-loaded (planning, design phase) — must NOT join the always-on CLAUDE.md chain.
- Candidates #1, #4, #5 are **Low** and reduce or barely touch baseline context.

## Verified vs unverified

**Verified (multiple sources / official docs):**
- `.kiro/specs/{feature}/` with requirements.md / design.md / tasks.md; `.kiro/steering/` (+ `~/.kiro/steering/`); `.kiro/hooks/`.
- Steering foundation trio product.md/tech.md/structure.md; four inclusion modes (always/fileMatch/manual/auto) with YAML front-matter; workspace overrides global.
- Hooks triggers (file save/create/delete, prompt submit, turn complete, before/after tool, before/after spec-task, manual) and two action types (agent prompt / shell).
- EARS notation used for acceptance criteria; tasks reference requirement numbers; design.md section set (architecture/data flow/data models/sequence/error/testing/migration).
- Wave/dependency-graph parallel task execution; Sonnet 4.5 default + Auto router; vibe/spec and autopilot/supervised splits.

**Unverified / thin:**
- Exact EARS *example* syntax in Kiro (docs reference it but a concrete WHEN/THEN/SHALL sample wasn't shown on the pages fetched).
- Whether design.md *reliably* includes a UI/screen-flow section vs only backend sequence/data flow (Fowler notes sections "appeared consistent" but uncertain across task types).
- Precise brownfield depth of "Generate Steering Docs" (confirmed it exists; depth/scan breadth inferred, not documented line-by-line).
- Typical steering-file size (docs only say "keep files focused," no number).
