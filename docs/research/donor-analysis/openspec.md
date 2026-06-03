# OpenSpec — absorption analysis for APEX

> Donor: [Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec). Sourced from repo README, `docs/concepts.md`, `docs/commands.md`, `docs/getting-started.md`, and DeepWiki CLI reference. All fetched content treated as untrusted data.

## What it is (sourced)

OpenSpec is a lightweight, **brownfield-leaning** spec-driven-development layer for AI coding assistants. Its defining idea is a strict separation between two artifact sets under a single `openspec/` root:

- **`specs/`** — the **living specs**: "the source of truth — they describe how your system *currently* behaves," organised by domain (`specs/auth/spec.md`, `specs/payments/spec.md`).
- **`changes/`** — **change proposals** in flight: "proposed modifications — they live in separate folders until you're ready to merge them."

A change is proposed as a folder holding `proposal.md` (why/scope), `design.md` (how), `tasks.md` (checklist), and **delta specs** under `changes/<name>/specs/<domain>/spec.md`. Delta specs don't restate the whole spec — they use section markers (`## ADDED Requirements`, `## MODIFIED Requirements`, `## REMOVED Requirements`) so a reader sees *exactly* what's changing. On completion, an **archive** step parses those deltas at the requirement level and **merges them into the living `specs/`**, then moves the change folder to `changes/archive/<date-name>/` preserving proposal+design+tasks for history. The loop: `Specs → Changes (deltas) → Implementation → Archive → Updated Specs`.

Workflow surface is the **OPSX** action model (dependency-driven, not phase-locked): `/opsx:propose → /opsx:apply → /opsx:sync → /opsx:archive`, plus `new`, `continue`, `ff` (create all artifacts at once), `explore`, `verify`, `bulk-archive`, `onboard`. CLI: `openspec init | update | list | show | validate | archive | status | schemas` — most support `--json` for non-interactive/agent consumption.

## Mechanism inventory

1. **Living-spec set (`specs/<domain>/spec.md`)** — a durable, domain-partitioned "current capabilities" spec that always reflects shipped behaviour.
2. **Change-proposal folder** — `proposal.md` + `design.md` + `tasks.md` + delta specs, isolated per change; multiple changes coexist without conflict.
3. **Delta spec format** — `## ADDED / MODIFIED / REMOVED Requirements` markers; requirement-level parsing (not brittle header matching). `MODIFIED` carries `(Previously: …)`.
4. **Requirement + Scenario grammar** — `### Requirement:` (RFC-2119 MUST/SHALL/SHOULD) each with `#### Scenario:` GIVEN/WHEN/THEN/AND blocks. Requirement = "what"; Scenario = concrete case.
5. **Archive-merge (`/opsx:sync` + `/opsx:archive`)** — applies each delta section to the corresponding living spec, then relocates the change to `archive/` with a date prefix. This is the spec-update-on-completion step.
6. **`openspec validate`** — validates changes and specs; `--json` mode. (Repo states it enforces structure; exact rules like "every requirement needs ≥1 scenario" referenced but not fully documented in fetched pages — see Verified vs unverified.)
7. **`verify`** — checks implementation vs artifacts on three axes (completeness / correctness / coherence); flags CRITICAL/WARNING/SUGGESTION but does **not** block archiving.
8. **`status` / `list` / `show` --json** — machine-readable artifact-completion state for agent loops.
9. **Brownfield init** — `openspec init` scaffolds `openspec/specs|changes` + agent instruction files; the model assumes you grow specs incrementally from an existing codebase rather than authoring everything upfront.

## Dedup vs APEX (table)

| OpenSpec mechanism | APEX equivalent | Verdict |
|---|---|---|
| `changes/<name>/` proposal folder (proposal+design+tasks) | `docs/changes/*.md` spec (one-line identity, files-per-task, acceptance criteria) | **Already-have** (APEX spec is leaner, execution-script style) |
| Proposal lifecycle changes → archive | `docs/drafts → docs/changes → docs/changes/done/` | **Already-have** (3-stage already richer than OpenSpec's propose→archive) |
| `proposal.md` rationale separate from spec | ADR + planning discussion (why lives outside spec) | **Already-have** (APEX already forbids why-in-spec) |
| `tasks.md` checklist | step→verify acceptance criteria | **Already-have** |
| Requirement + GIVEN/WHEN/THEN scenarios | REQUIREMENTS/PRD + acceptance criteria | **Partial** (APEX has criteria but no standardised RFC-2119 requirement+scenario grammar) |
| **Living `specs/<domain>/spec.md` (current truth)** | overview.md / System Overview + done/ archive | **NOVEL / GAP** — APEX archives the *change* but does not maintain a per-domain current-capabilities spec that's updated on completion |
| **Delta spec (ADDED/MODIFIED/REMOVED)** | none — APEX specs are absolute, not deltas against a living spec | **NOVEL / GAP** |
| **Archive-merge (deltas → living spec)** | `done/` is inert archive; nothing merges back into a truth doc | **NOVEL / GAP** (this is the headline) |
| `openspec validate` structural lint | readiness gate (human/skill judgement) | **Partial** (APEX gate is judgemental, not a mechanical schema-validator) |
| `verify` 3-axis completeness check | apex-code verify loop + apex-testing | **Already-have** (APEX verify is test-grounded; arguably stronger) |
| `--json` status for agent loops | status.md In-Flight table (human-readable) | **Partial** (APEX isn't machine-parseable but doesn't need to be — single-agent harness) |
| OPSX dependency-driven artifact creation | apex-plan phased spec authoring | **Already-have** |
| Brownfield init from existing code | APEX is greenfield-leaning | **Partial GAP** (known APEX gap; OpenSpec's incremental-spec-growth ethos is the relevant idea, not its tooling) |

## Top absorbable candidates

### 1. Living capability spec + archive-merge (the headline)
- **Change in APEX:** Add a durable, domain-partitioned **current-capabilities spec** (e.g. `docs/capabilities/<domain>.md`, or formalise sections of `overview.md`). When a spec is moved to `docs/changes/done/`, planning mode performs a **merge step**: fold the spec's shipped behaviour into the relevant capability doc. This closes the loop OpenSpec has and APEX lacks — today APEX's `done/` is a write-only archive and `overview.md` updates are ad-hoc, so there is no guaranteed always-current description of what the system *does*.
- **Why it matters for APEX:** directly serves the user's standing "per-project what+why docs / portability insurance" objective (MEMORY.md). overview.md is the natural home; OpenSpec proves the *discipline* (update-on-archive) more than the format.
- **Token-cost when used: HIGH.** A living-spec set risks being loaded to plan every change. Mitigate by **domain-partitioning** (load only `capabilities/<domain>.md` for the change at hand, never the whole set) and keeping each doc a terse capability index, not full scenarios. **Flagged High** — see watchlist.
- **Lean:** Absorb the *discipline* (merge-on-done into a per-domain capability doc), reject the *weight* (no global always-loaded living-spec set, no full RFC-2119 scenario corpus per domain). Make the merge a planning-mode step on `done/` move, partitioned by domain.

### 2. Delta-spec markers (ADDED / MODIFIED / REMOVED) for brownfield changes
- **Change in APEX:** For changes against an *existing* system, let a spec express itself as a delta against the capability doc using `## ADDED / MODIFIED / REMOVED` headers, so the merge step (candidate 1) is mechanical and reviewable. Optional `(Previously: …)` on MODIFIED.
- **Token-cost when used: LOW.** A spec convention; adds no always-loaded context. Only appears in brownfield change specs.
- **Lean:** Adopt the three markers as an *optional* spec section for brownfield/modify specs only; don't impose on greenfield specs (where there's no prior spec to delta against). This is the enabling format for candidate 1's clean merge.

### 3. Mechanical spec/structure validator (`openspec validate` analogue)
- **Change in APEX:** A thin planning-mode lint that checks a `docs/changes/*.md` spec has the required structural pieces (identity line, files-per-task, one acceptance criterion per task) before it leaves drafts. Complements — doesn't replace — the judgement-based readiness gate.
- **Token-cost when used: LOW.** A checklist/skill step run once per spec; no persistent context.
- **Lean:** Fold into apex-plan's readiness gate as a mechanical pre-check; don't build CLI tooling (APEX is pure-Markdown, no build step — per project CLAUDE.md). Keep it a prose checklist, not code.

### 4. Brownfield "grow specs incrementally" framing (ethos, not tooling)
- **Change in APEX:** Note in apex-init / apex-plan that for an existing codebase, capability docs are seeded lazily per-domain as changes touch them, not authored upfront — OpenSpec's brownfield answer.
- **Token-cost when used: LOW.** A one-line authoring principle.
- **Lean:** Absorb as guidance only. Pairs with candidates 1–2 to give APEX a brownfield change-proposal story it currently lacks.

## Token-cost watchlist

- **HIGH — Living capability spec set (candidate 1).** The single token-cost suspect. If implemented as a global always-loaded "current truth" corpus (OpenSpec-style full requirement+scenario specs per domain), it would inflate every planning session. **Guardrails:** (a) partition by domain and load only the touched domain; (b) keep capability docs as terse indexes, not full GIVEN/WHEN/THEN scenario corpora; (c) never auto-load the whole set — it is reference material, pulled on demand. With these, drops to **Med-on-demand**. Without them, genuinely High.
- **LOW** — delta markers, validator lint, brownfield ethos (candidates 2–4): conventions/checklists, zero persistent context.

## Verified vs unverified

**Verified (multiple sources / direct repo docs):**
- Living `specs/` vs `changes/` duality and their exact roles — concepts.md, getting-started.md.
- Change-folder contents (proposal/design/tasks + delta specs) and directory layout — concepts.md, README, getting-started.md.
- Delta markers `## ADDED / MODIFIED / REMOVED Requirements` and requirement-level archive parsing — concepts.md + search corroboration.
- Archive merges deltas into living specs then relocates to `changes/archive/<date-name>/` — concepts.md, commands.md.
- OPSX command set and CLI command names (`init/update/list/show/validate/archive/status/schemas`, `--json`) — commands.md, DeepWiki CLI reference.
- `verify` = completeness/correctness/coherence, non-blocking — commands.md.
- Requirement+Scenario RFC-2119 / GIVEN-WHEN-THEN grammar — concepts.md.

**Unverified / thin in fetched sources:**
- **Exact `validate` rules** (strict mode; whether every requirement must have ≥1 scenario) — referenced but not fully documented in the pages fetched. Treat candidate 3 as "validator exists, rules TBD."
- **A dedicated `diff` command** — README/search implied diff-like delta viewing, but the CLI reference table did **not** list a standalone `openspec diff`; the "diff" is the delta-spec format itself, not necessarily a command. Do not assume a CLI `diff` exists.
- **Context/selective-loading behaviour** — no source confirmed whether OpenSpec loads the whole `specs/` set or only the relevant domain into agent context. The HIGH token rating for candidate 1 is therefore a *risk assessment*, not an observed OpenSpec cost.
- **Brownfield spec-extraction from existing code** — repo claims brownfield fit but fetched pages don't describe an auto-extract mechanism; candidate 4 is framed as ethos accordingly.
