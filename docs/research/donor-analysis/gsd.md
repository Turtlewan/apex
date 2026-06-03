# GSD — absorption analysis for APEX

## What it is

GSD ("Get Stuff Done") is a 66-skill spec-driven-development lifecycle system for Claude Code,
the closest structural peer to APEX on this machine. Where APEX splits work by *backend*
(Claude plans / DeepSeek codes), GSD splits work by *lifecycle phase* and drives the whole thing
through a heavy runtime: thin `SKILL.md` command wrappers that `@`-reference large workflow files
(`~/.claude/get-shit-done/workflows/*.md`, 250–780 lines each), a library of shared `references/`
and `templates/`, and a Node CJS toolchain (`gsd-tools.cjs` / `gsd-sdk query …`) that resolves
context, manages state, and runs a knowledge-graph extractor. Project state lives under
`.planning/` (PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md, per-phase folders).

The defining idea: a project is a **ROADMAP of numbered phases**, and each phase walks a fixed
pipeline — `spec → discuss → (research) → plan → execute → verify → validate/secure/eval/ui review
→ extract-learnings` — with milestones aggregating phases and an **audit gate before archiving**.
GSD is *engine-heavy and config-driven* by design; APEX is deliberately *engine-light and
Markdown-only*. That tension governs every absorption call below.

## Mechanism inventory (distinctive skills, grouped)

**Lifecycle spine (the part APEX lacks as a formal structure)**
- `gsd-new-project` / `gsd-new-milestone` — greenfield vs brownfield bootstrap; milestone =
  versioned cycle that re-runs questioning→requirements→roadmap and *archives* the prior one.
- `gsd-roadmap` (in ROADMAP.md) — numbered phases, decimal insertion (`2.1`), per-phase `Mode:` field.
- `gsd-plan-phase` → `gsd-execute-phase` — planner subagent + plan-checker verify loop; execute is
  **wave-based parallel** (dependency analysis → waves → fresh-context subagents; "~15% orchestrator,
  100% fresh per subagent"). Directly parallels APEX wave-parallel coding.
- `gsd-complete-milestone` / `gsd-audit-milestone` / `gsd-milestone-summary` — completion archives
  ROADMAP+REQUIREMENTS to `milestones/`, git-tags, and *gates archival behind an audit*.

**Front-of-phase clarification (strong, distinctive)**
- `gsd-spec-phase` — Socratic interview with **quantitative ambiguity scoring** across 4 weighted
  dimensions; gate = ambiguity ≤ 0.20 before SPEC.md is written. Locks WHAT/WHY.
- `gsd-discuss-phase` — adaptive questioning that **skips gray areas already decided in prior
  phases**, scouts the codebase for reusable assets, writes CONTEXT.md (locked decisions) so
  downstream agents never re-ask. Has an `--assumptions` mode.
- `gsd-ui-phase` — produces a persisted **UI-SPEC.md** design contract (the exact doc APEX flags as
  a known gap).
- `gsd-ai-integration-phase` / `gsd-mvp-phase` (user-story + SPIDR splitting) / `gsd-ultraplan-phase`
  (offload planning to cloud).

**Review / audit / validation passes (many, retroactive)**
- `gsd-verify-work` — conversational UAT, one test at a time, persistent UAT.md, auto-diagnoses
  failures into fix plans routed back to execute.
- `gsd-code-review`, `gsd-ui-review` (6-pillar visual grade 1–4), `gsd-eval-review` (AI eval
  coverage audit), `gsd-secure-phase` (threat-mitigation verification), `gsd-validate-phase`
  (Nyquist validation-coverage audit). All are **retroactive auditors** that reconstruct from
  artifacts if the primary doc is missing.
- `gsd-audit-uat` / `gsd-audit-milestone` / `gsd-audit-fix` — cross-phase sweeps for outstanding
  UAT/verification items and stale docs.

**Brownfield / codebase intelligence (APEX gap)**
- `gsd-map-codebase` — 4 parallel mapper agents write 7 structured docs to `.planning/codebase/`
  (STACK, INTEGRATIONS, ARCHITECTURE, STRUCTURE, CONVENTIONS, TESTING, CONCERNS); orchestrator only
  collects confirmations. Has `--fast` (1 agent) and a `--query` intel mode.
- `gsd-graphify` — AST-based **knowledge graph** of the codebase (nodes/edges, confidence tiers
  EXTRACTED/INFERRED/AMBIGUOUS), config-gated, queryable. Requires the Node toolchain.

**Backlog / capture / continuity**
- `gsd-capture` — one command, 5 destinations (todo / note / backlog 999.x / seed-with-trigger / list).
- `gsd-inbox` — triage open GitHub issues+PRs against templates, optionally label/close.
- `gsd-thread` — persistent cross-session context threads not tied to a phase.
- `gsd-pause-work` / `gsd-resume-work` — `.continue-here.md` handoff + WIP commit.
- `gsd-progress` — unified situational command: progress report + `--next` auto-advance +
  `--do "intent"` freeform dispatcher + `--forensic` integrity audit.
- `gsd-health --context` — **context-utilization tripwire** (≥70% = "fracture point", recommend a
  fresh thread). `gsd-forensics` — post-mortem on stuck/failed workflows from git+artifacts.

**Personalization / learning**
- `gsd-profile-user` — behavioral developer profile from session analysis → CLAUDE.md section +
  preferences artifact (consent-gated).
- `gsd-extract-learnings` — mines completed-phase artifacts into LEARNINGS.md (decisions, lessons,
  patterns, surprises).

## Dedup vs APEX

| Mechanism | have / partial / novel | note |
|---|---|---|
| Backend plan/code split | novel-to-GSD (GSD lacks) | APEX's core; GSD splits by phase instead |
| Spec = literal execution script | have | both treat the plan as the execution artifact |
| Wave-parallel execution | have | APEX wave-parallel coding ≈ gsd-execute-phase waves |
| Fresh-context dispatched reviewers | have | APEX council/dispatched review ≈ GSD subagent verify loops |
| Pause/resume + handoff | have | APEX handoff docs + status.md In-Flight ≈ pause/resume + `.continue-here.md` |
| Bootstrap a new project | have | apex-init ≈ gsd-new-project |
| ADR / overview / data-model docs | have | APEX doc system is richer on the *why* (ADRs, TRD) |
| **Phase/milestone/roadmap lifecycle** | **novel** | APEX has no numbered-phase spine, no milestone archive/tag, no per-phase gate chain |
| **Persisted UI-SPEC design contract** | **novel** | exactly APEX's flagged gap (gsd-ui-phase → UI-SPEC.md) |
| **Front-of-phase ambiguity scoring** | **novel** | spec-phase's quantitative ≤0.20 gate; APEX's complexity gate is qualitative |
| **Decision-carryover ("don't re-ask")** | partial | APEX reuses ADRs/status but has no explicit gray-area-skip questioning pass |
| **Brownfield codebase-mapping** | **novel** | gsd-map-codebase 7-doc output; APEX assumes greenfield/known code |
| **Dependency/knowledge graph** | **novel** | gsd-graphify; needs a runtime APEX doesn't have |
| **Parallel workstreams** | partial | APEX parallelizes *within* a build; GSD parallelizes *milestones* via worktrees/state |
| **UAT / validation phase** | partial | APEX verifies via runnable recipe + review; no conversational human-UAT loop or Nyquist coverage audit |
| **Retroactive eval/ui/secure review passes** | partial | APEX reviews inline at build; GSD adds standalone after-the-fact auditors |
| **Inbox / capture backlog** | **novel** | APEX has no idea/todo/backlog capture surface |
| **Forensics (workflow post-mortem)** | **novel** | APEX debugs *code*, not its own stuck pipeline |
| **User behavioral profiling** | **novel** | APEX has memory but no generated developer profile |
| **Context-utilization tripwire** | partial | apex-context-budget audits the *config*; GSD watches *live* session % |
| **Extract-learnings → LEARNINGS.md** | partial-conflict | APEX learns via handoff→feedback→human-gated promotion; rejected auto-capture engines (ADR-011) |
| **Situational `--next`/`--do` dispatcher** | partial | apex-orchestrate routes by mode; GSD adds intent→command matching |

## Top absorbable candidates

1. **Persisted UI-SPEC design contract** (from `gsd-ui-phase`)
   → APEX change: add a UI-SPEC.md artifact to the doc system + a small planning step (likely fold
   into apex-ui-ux-design / apex-plan) that emits it for frontend specs; coding mode reads it.
   → Token cost: **Low** — one more `.md` produced during planning, read only on UI phases; no
   always-loaded context.
   → **Lean adopt.** Closes APEX's explicitly-known gap; matches APEX's doc-as-artifact philosophy.

2. **Decision-carryover questioning ("skip already-decided gray areas")** (from `gsd-discuss-phase`)
   → APEX change: add a pre-spec step in apex-plan that loads prior ADRs/specs/status and *only*
   surfaces unresolved gray areas, writing locked decisions so DeepSeek never re-asks.
   → Token cost: **Med** — reads prior planning docs each phase; bounded, planning-mode only.
   → **Lean adopt (lightweight).** Reinforces APEX's "no why inline, decisions locked in the spec"
   rule; skip the `.planning/` machinery, keep the *behavior*.

3. **Front-of-spec ambiguity gate** (from `gsd-spec-phase`)
   → APEX change: add a qualitative-or-light-quantitative "is this spec falsifiable / unambiguous
   enough to hand to DeepSeek?" gate to apex-plan's readiness check (APEX already has a complexity
   gate; this adds an *ambiguity* dimension).
   → Token cost: **Low** — a checklist in planning mode, no subagents.
   → **Lean adopt (concept only).** Adopt the *gate idea*, not GSD's weighted 0.20 scoring engine.

4. **Brownfield codebase-mapping** (from `gsd-map-codebase`)
   → APEX change: an apex-map-codebase planning skill that dispatches a few fresh-context mappers to
   write overview.md / data-model.md / a CONVENTIONS doc for an *existing* repo before first spec.
   → Token cost: **High when used** — spawns ~4 parallel agents that each scan the repo and write
   docs; one-off per brownfield onboarding, not per session.
   → **Note (adopt narrowly).** Real gap (APEX assumes greenfield), but gate it to brownfield-onboard
   only and reuse APEX's existing overview/data-model docs as the output rather than 7 new files.

5. **Forensics — pipeline post-mortem** (from `gsd-forensics`)
   → APEX change: a read-only "why did this build stall?" skill over git + status.md In-Flight +
   handoff docs.
   → Token cost: **Med** — reads several artifacts on demand; invoked rarely.
   → **Note.** Useful for AFK/wave builds that wedge; low philosophical conflict (read-only, no engine).

6. **Capture / backlog surface** (from `gsd-capture` + `gsd-thread`)
   → APEX change: a minimal `apex-capture` that appends ideas/todos to a single backlog doc and a
   cross-session thread note; resist GSD's 5-destination routing.
   → Token cost: **Low** — append-only writes.
   → **Note.** Nice-to-have; only if APEX users actually lose ideas between sessions today.

7. **Milestone lifecycle + archive-behind-audit** (from `gsd-new-milestone` / `gsd-complete-milestone`
   / `gsd-audit-milestone`)
   → APEX change: a lightweight "version cycle" convention in status.md — group specs into a
   milestone, run a cross-spec coverage audit before tagging, archive the requirements snapshot.
   → Token cost: **Med–High** — the audit reads all phase summaries/verifications; multiplies passes.
   → **Note (selective).** Adopt the *archive-behind-audit gate* idea; do NOT adopt the full numbered
   phase engine — it conflicts with APEX's spec-folder + status.md model.

8. **Context-utilization tripwire** (from `gsd-health --context`)
   → APEX change: a one-line heuristic in apex-context-budget / orchestrate: at ≥~70% live context,
   recommend compaction or a fresh session.
   → Token cost: **Low** — a threshold check.
   → **Lean adopt (as guidance, not a tool).** Complements APEX's existing context discipline.

### Rejected for APEX

- **`gsd-graphify` (knowledge graph)** — requires the Node `gsd-tools.cjs` runtime + AST extractor;
  APEX is pure-Markdown by charter. **Reject** (would import an engine).
- **`gsd-extract-learnings` → LEARNINGS.md auto-mining** — directly conflicts with ADR-011 (APEX
  *deliberately rejected* automatic learning/capture engines in favor of human-gated promotion).
  **Reject the auto-engine**; keep APEX's handoff→feedback→stocktake loop.
- **`gsd-profile-user`** — behavioral profiling is scope-creep for APEX's mission and overlaps
  existing memory. **Reject.**
- **`gsd-config` / `gsd-sdk` toolchain dependency** — the whole resolve-context-via-CLI pattern is
  antithetical to APEX's Markdown-only, no-build constraint. **Reject the mechanism**, port only
  behaviors that work as plain skill prose.
- **Full retroactive review suite** (eval-review, validate-phase, secure-phase as *separate* passes)
  — APEX already reviews inline (spec-compliance + code-quality, dual-pass on auth/security/data).
  Standalone retroactive auditors **multiply passes/tokens** for marginal gain. **Reject as separate
  skills**; fold any missing *checks* into existing apex-security / apex-testing review steps.

## Token-cost watchlist (HIGH flagged)

- **gsd-map-codebase — HIGH when used.** 4 parallel mapper agents each scanning the repo + writing
  docs. Acceptable *only* as a rare brownfield-onboarding action, never per-session.
- **gsd-execute-phase waves — HIGH when used.** Many fresh-context subagents per phase (this is the
  same cost profile APEX already accepts for wave-parallel coding — parity, not new risk).
- **Milestone audit chain (audit-milestone + audit-uat + complete-milestone) — HIGH.** Reads every
  phase's SUMMARY/VERIFICATION; multiplies passes at milestone boundaries.
- **Full GSD phase pipeline — HIGH structurally.** spec→discuss→research→plan→execute→verify→
  validate/secure/eval/ui-review is *many phases × many passes*; the workflow files alone are
  250–780 lines loaded per command. Porting the *spine* wholesale would blow APEX's token budget —
  absorb individual behaviors, not the pipeline.
- **gsd-graphify build — HIGH + runtime.** 10-minute timeout ceiling, AST extraction, Node deps.
  Rejected.
- Low-cost, safe-to-adopt: UI-SPEC emission, ambiguity gate (concept), context tripwire, capture
  append — all add at most one on-demand `.md` read/write, nothing always-loaded.

## Notes (philosophy conflicts)

- **Engine vs Markdown.** GSD's power comes from a Node SDK (`gsd-sdk query`, `gsd-tools.cjs`) that
  resolves context, manages state, and extracts graphs. APEX's charter (CLAUDE.md) forbids any
  build/tooling. Every GSD mechanism worth taking must be re-expressed as *pure skill prose +
  Markdown artifacts*; anything that needs the CLI to function is a non-starter.
- **No-auto-learning invariant (ADR-011).** GSD leans into automatic capture (extract-learnings,
  profile-user, graphify intel). APEX explicitly chose human-gated promotion. Absorb GSD's
  *artifacts* (LEARNINGS-style decision records) only as outputs a human reviews, never as an engine.
- **Phase-split vs backend-split.** GSD's lifecycle assumes one agent walks all phases; APEX's value
  is the planning/coding handoff. The absorbable units are GSD's *per-phase behaviors* (clarify,
  carry decisions, gate ambiguity, map brownfield, post-mortem) — not its phase-numbering spine,
  which would duplicate APEX's spec-folder + status.md model and add token-heavy ceremony.
- **Review multiplication.** GSD's many retroactive audit passes are a token-cost antipattern for
  APEX, which already folds review into the build. Take missing *checks*, not new *passes*.
