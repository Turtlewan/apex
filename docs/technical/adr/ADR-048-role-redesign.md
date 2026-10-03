# ADR-048: Role redesign — OpenAI authors and builds, Claude hosts and checks

**Date:** 2026-09-30
**Status:** Accepted
**Supersedes:** [ADR-045](./ADR-045-four-role-split.md) in part — the spec-author row (`model: opus`
worker) and the Fable host now; the build-orchestrator row at rollout stage 5.
[ADR-046](./ADR-046-doctrine-audit-resolutions.md) D1 in part, when the Engine lands (stage 5).
**Amends:** [ADR-032](./ADR-032-gpt56-role-split.md) / [ADR-034](./ADR-034-sol-default-coder.md) /
[ADR-042](./ADR-042-critical-file-confirmation-and-achievable-cross-family.md) — the Codex wrapper
gains a `-Model` parameter, the cross-family checker becomes the Critic tiers, and the pre-draft Sol
architecture pass is replaced by the planning gate (stage 6). [ADR-038](./ADR-038-single-session.md)
only insofar as it names the host model (the draft lists it "if hosts are swapped"; stage 1 swaps it).
**Parks:** [ADR-047](./ADR-047-dispatch-receipt-preflight.md)'s `dispatch-receipt-preflight` as a
standalone build; it is folded into the Engine.
**Design record:** [`docs/drafts/role-redesign.md`](../../drafts/role-redesign.md) items 1–41 (the
items win over any summary here). **Evidence:**
[`spend-by-role.md`](../../research/model-refresh-2026-09/spend-by-role.md),
[`slice-cap-calibration.md`](../../research/model-refresh-2026-09/slice-cap-calibration.md).

## Context

The goal is one thing: **cut Anthropic token spend** (item 1). Roles were redesigned from the
functions the system needs, not reassigned one for one (item 4).

Measured spend by role (2026-09-30, from Claude Code transcripts, relative dollars):

| Role | Share |
|---|---:|
| Spec authors (Opus `general-purpose` subagents) | 44.7% |
| Host session (mostly Fable 5.1) | 40.4% |
| Reviewers | 10.5% |
| Other subagents (research, Explore, workers) | 2.4% |
| Build runners + docs agents | 1.9% |
| `apex-build-orchestrator` | 0.1% |

Caveats: the effective window is about 30 days (older transcripts were pruned); Artemis is 99% of
the measured spend; the spec-author bucket is inferred from free-text descriptions; subscription
billing is not per token, so these are prioritisation weights, not invoices; Codex spend is outside
the measurement. About 12.8B of 13.2B tokens are **cache reads**, so cost scales with how long a
context lives and how many turns it runs — long, re-anchored Opus authoring runs and a long-lived
Fable host are the two big levers. The build orchestrator is not worth optimising for cost.

Prerequisites, all resolved 2026-09-30: live probes of `gpt-6-sol`, `gpt-6-luna` and `gpt-6-astra`
passed (Luna and Astra at about 2x and 3.7x Sol's per-call overhead — watch real quota cost); the
ChatGPT plan tier is Pro; spend was measured; the slice cap was calibrated (below).

## Decision

**Direction B** (item 3): OpenAI models author specs and write code; Claude is the thin host and the
cross-family checker. The host stays Claude because only Claude hosts Claude Code (item 2).

### Roster

| Role | Covers | Model · effort |
|---|---|---|
| **Steward** (host) | owner conversation, intake labels, plans (38), bug root-cause (40), odd results, failure and clash diagnosis, handoff, `status.md`, commit gates | Opus 5.5 · medium; high per message for plans and adjudication |
| **Spec author** | every spec, fresh context per spec (17) | `gpt-6-sol` · high (provisional) |
| **Architect check** | one plan cross-check, at most 2 reads (13, 35) | `gpt-6-sol` · xhigh; Astra trial later |
| **Builder** | code | `gpt-6-sol` · medium (low for Trivial); ladder medium → high → xhigh; Sonnet 5 only on owner decision at quota-out (20) |
| **Critic** | spec review and code review, fresh context (15, 19, 25); checks the Scribe's map edits (30) | Sonnet 5 for Low/Medium risk; Opus 5.5 · high for High |
| **Scribe** | CHANGELOG, README, inline docs, map section rewrites | `gpt-6-luna` · low (probe passed); fallback `gpt-6-sol` · low (39) |
| **Engine** | waves, dispatch, worktrees, ledger, verify, retry ladder, cleanup, archival, size guard, receipt preflight | code in the `~/.claude` wrapper, not a model (21) |

Fable has no default seat; it earns one only through a bake-off (item 10). Effort follows
`effort-levels.md`; never default to `max`, raise only on failure (item 12). Retired agent
definitions: `apex-build-orchestrator` → Engine; `apex-coder`, `code-worker` → Builder;
`apex-reviewer`, `apex-spec-reviewer`, `apex-wave-reviewer` → Critic; `apex-docs-product-agent` →
Scribe; `apex-docs-technical-agent` → Steward (handoff) + Engine (archival). Research and Explore
subagents are unchanged.

### Process rules (by item)

- **Intake, two separate labels** (9): **Size** (Trivial / Normal / Big / Bug) sets the path;
  **Risk** (Low / Medium / High, High forced by path rules) sets review depth. The host proposes
  both with evidence; the owner decides. Labels may be raised later, never lowered; a raise
  re-routes the change.
- **System map** (6–7): a one-time sweep per repo writes `docs/system-map.md` — an index of
  components, contracts, seams, `file:line` pointers and a verified SHA per section. Every change
  reads it first (stale sections re-surveyed via `git diff <sha>..HEAD`); git still wins.
- **Trivial change** (8, 16, 33): exempt from the map read and the spec only when it is one file and
  at most 10 lines, touches no contract or seam path, changes no behavior, and is not a High-tier
  path. The Engine compares the real `git diff --stat` with the prediction; an overrun holds the
  commit and returns the change to a map read and normal review.
- **Planning gate** (5, 10, 11, 13, 14, 38): Big changes only. The Steward writes the plan itself at
  high effort (no fresh planner); the Architect check classes findings (design / contract /
  grounding / decision / wording), the host rules on each once in writing, at most 2 reads, then
  pass or park for the owner. The owner approves from a one-screen brief (`y / n / edit`). This gate
  replaces the pre-draft Sol architecture pass in `apex-plan`.
- **Spec authoring** (17, 18): a fresh `gpt-6-sol` writes every spec from the intent brief (Normal)
  or plan slice plus contracts (Big), with map sections and read-only repo access. Big slices are
  specced just in time; a spec needing a contract change is a label raise.
- **Review caps** (15, 19, 25): at most **3 rounds at every risk tier** for specs and code. Round 1
  is a full review; rounds 2–3 are a fresh-context fix check of prior findings and changed text. A
  third strike on one defect class, or round 3 failing, escalates to the owner with the Critic's
  analysis. High-risk code is reviewed after every wave, everything else once at the end. No extra
  Sol cross-family pass: the Claude Critic is already cross-family to a Sol author and builder.
- **Engine as code** (21, 27, 32, 33): fixed rules run in the wrapper — wave planning by file overlap
  and dependencies, dispatch, worktrees, ledger, verify, scope and baseline checks, the retry ladder,
  auto-cleanup of worktrees and branches on success (kept on failure), spec archival by `git mv`,
  and the size guard. The parallel cap stays at 2 until the Engine exists (24).
- **Escalation to the owner** (20, 22, 23, 28, 29): quota exhaustion pauses the build and the owner
  chooses (wait, or Sonnet) — no silent fallback. Odd results the rules can't classify go to the
  Steward, never to Sol, and are absorbed and noted in the handoff. Real failures (ladder exhausted)
  and merge clashes go to the owner with the Steward's diagnosis and recommendation; no model
  resolves them alone.
- **Close-out ownership** (30–32): the Scribe rewrites touched map sections from the diff and bumps
  their SHAs, checked by the code Critic in the same pass; the Steward writes the handoff and owns
  `status.md`; the Engine archives specs; the Scribe owns CHANGELOG, README and inline docs.
- **Commits** (26): each spec keeps its own commit and message, but approval prompts are held until
  session end and shown one per spec. This amends the global `CLAUDE.md` § Git rule.

### Slice caps (item 36, calibrated on 322 built Artemis specs)

A soft plan cap of **6 slices** (7 or more → split first) and a soft per-slice check (split before
the spec if it is predicted to touch more than about 15 files or need more than 6 build tasks). The
slices table carries a predicted file count: files touched is the best predictor of trouble (AUC
0.66; task count 0.55, weak). The worst loops came from unsettled design, not size — handled by the
planning gate and review caps. Confidence low to medium; recalibrate after about 10 Big plans using
the size guard's diff-stat comparison.

### Rollout (items 37, 41; each stage measured before the next)

Spend showed the build orchestrator at 0.1%, so **cheap swaps go first** and the Engine later:

1. Host Fable 5.1 → Opus 5.5 **and** spec author → `gpt-6-sol`
2. Builder A/B (`gpt-6-sol` vs `gpt-5.6-sol`)
3. Scribe (check Luna's real per-task quota cost)
4. Critic consolidation
   - **Status 2026-10-02:** shipped by [critic-consolidation](../../changes/done/critic-consolidation.md) — one `apex-critic` agent (spec/code modes, risk-tiered model, 3-round cap with fix checks, owner escalation) replaced `apex-reviewer`, `apex-spec-reviewer` and `apex-wave-reviewer`; Low/doc-only specs skip both Sol reads. **Rollout-order amendment:** the owner approved building stage 4 before stages 2–3 (2026-10-01, "plan stage 4"); stages 2–3 remain measurement swaps to run later.
5. Engine (absorbs `dispatch-receipt-preflight`; retires `apex-build-orchestrator`)
   - **Stage-5 note 2026-10-02:** the owner decided (2026-10-02) that the spec **execution manifest** — the optional `## Execution manifest` `json apex-manifest` block added by [exec-manifest](../../changes/done/exec-manifest.md), checked by the validator's `EXEC-MANIFEST` check — is the Engine's input contract for tasks, files, operations and dependencies.
   - **Stage-5 wave 1 `engine-core` (2026-10-02):** [engine-core](../../changes/done/engine-core.md) ships Engine v1 — `apex-engine.ps1` plus planner, git-layer and dispatch-adapter modules, each with its own hermetic test — consuming the execution manifest. Owner decisions 2026-10-02: (1) `risk: high` specs are **refused in v1** (pause-after-wave Critic review is the first wave-2 item); (2) proof-gated `-Teardown <runId>` (removes the run's worktrees/branches only after proving master matches the integration tip; `-Discard` for abandoned runs refuses while any recorded coder is live); (3) **four** modules with separate tests, Tasks 1–3 built in parallel before Task 4 (the runner); (4) spec flow author → Opus Critic → Sol plan-check with **no third Sol architecture read**. Explicit `-Teardown` is v1's success cleanup; automatic cleanup and spec archival are **deferred** to later Engine waves (intentional deferral of the item-27 automation). Accepted open review findings: `docs/research/engine-core-open-findings-2026-10-02.md` (wave-2 hardening backlog).
6. System map + planning gate

**Stage 1 in detail** (adjudicated after the Sol architecture check, 2026-09-30):

- **Wave 1, built in order, both `~/.claude`, risk High:**
  - `synced-runtime-exclusion` — add `skills/synced` (the harness skill-sync folder) to the
    runtime-exclusion lists in `tree-pin.ps1` and `codex-scope-check.ps1`, with test cases. A
    read-only architecture check was voided by a pin change under that folder.
  - `wrapper-model-author` — a `-Model` parameter on `codex-dispatch.ps1` (stage 1 set:
    `gpt-5.6-sol | gpt-6-sol`, default `gpt-5.6-sol`, so no behavior change by default; the ledger
    records the model) and an `-AuthorSpec` switch that lets Codex write exactly one
    `docs/drafts/<name>.md` (create mode: path absent and untracked; revise mode: `-ExpectedDigest`
    must match). Refusals use the existing caller-contract exit 74. It skips only the spec-exists,
    baseline and frontmatter preflight steps; the tree pin, critical-file check and post-run scope
    check stay, so a second written file is a scope violation. Rejected: reusing
    `-SkipBaselineCheck` (routine authoring would read as emergency bypass) and a full
    `-Phase author` (touches every phase check for no benefit).
- **Wave 2, `spec-author-routing`** (specced against the shipped switch): doctrine swap to "spec
  author = `gpt-6-sol` via `-AuthorSpec -Model gpt-6-sol -Effort high`; host = Opus 5.5 at medium"
  across `apex-plan`, `apex-orchestrate`, `model-routing.md` and the session-context routing table.
  It adds a **durable spec-author trial log**: at promotion, before the review sidecar is deleted,
  the host appends one row — spec, author model, reviewer-family rounds, Sol rounds, intent drift
  y/n. Until size labels exist, "Normal" means Deep Details or Light specs. The Sol plan-check and
  the coder stay on `gpt-5.6-sol` in stage 1.
- **Measurement:** baseline is `spend-by-role.md`; re-measure after about 7 days of live use. Verify
  Fable's price first and watch a week of sessions for host quality (item 41).
- **Quality guard** (item 17): if the first 5 Normal specs average more than 2 review rounds, or show
  intent drift, trial host-written Normal specs and compare.
- **Rollback:** revert the doctrine lines. The wrapper default is unchanged, so no code rollback is
  needed; a host-quality drop reverts the host model.

## Consequences

**Good**
- Attacks the two lines that are 85% of measured spend: spec authoring leaves the Anthropic pool
  entirely, and the host moves to a cheaper, cache-friendlier seat.
- Review stays cross-family by construction: Sol writes specs and code, Claude critics review them.
- Fixed rules become code (the Engine), so no paid model re-derives wave plans, retries or archival.
- Hard caps on review loops and a single planning gate bound the amendment spirals seen in Artemis.

**Bad / accepted**
- More quota load moves to OpenAI (Pro tier); Luna and Astra carry notable per-call overhead.
- The spend baseline is one project over about 30 days; savings are estimates until re-measured.
- Opus 5.5 as host is untested at Fable's workload; item 34 keeps a Sonnet 5 host trial open if the
  host still dominates spend, despite the known early-return risk.
- Slice caps rest on low-to-medium-confidence evidence and are soft until recalibrated.
- Holding commit approvals to session end leaves finished specs integrated but uncommitted for
  longer.
- Until stage 5, `apex-build-orchestrator` and ADR-046 D1 stay in force; until stage 6, the Sol
  architecture pass stays in `apex-plan`.
