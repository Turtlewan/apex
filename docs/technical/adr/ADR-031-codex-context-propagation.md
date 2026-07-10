# ADR-031 — Codex context propagation: three-layer file system (AGENTS.md · `.agents/skills` projection · dispatch pack)

**Status:** Accepted — 2026-07-10 (session 65)
**Extends:** ADR-026 (Codex third model family), ADR-027 (Codex-primary), ADR-030 (effort dial)
**Evidence:** `docs/research/gpt56-apex-integration/README.md` §3–§3b (6 Sol cluster reviews over the full skill set, 3 Claude-side reviews, 3 web research passes, live CLI probes incl. the PROVEN headless `.agents/skills` pickup)

## Context

APEX's enforcement layer never reaches the coder that does the work. apex-code has the *host*
load `apex-coding-principles/impl.md` + the bound stack impl cores "before writing any code" —
but the default build path dispatches every task to a Codex subprocess whose prompt carries only
task text + files + acceptance criterion + autonomy clause. The generated `AGENTS.md
§ Conventions` / `§ Project layout` are left as stubs. Net: the host burns context on rules
that never shape the code (the **propagation gap** — every review workstream independently
converged on it as the headline structural finding).

Two model-specific facts constrain the fix (Sol, consistent across all 6 clusters):
1. **Generic hygiene degrades GPT-5.6 output.** Validation, HTTP codes, naming, DRY,
   no-silent-errors are native; injecting them causes instruction competition.
2. **GPT-5 is contradiction-sensitive and deviates from negative constraints more than
   Claude** — the Codex-facing layer must be internally consistent and positively phrased
   ([[removal-over-prohibition]] applies double).

## Decision

Propagate context to Codex through **three layers**, each with a distinct cadence and owner:

| Layer | Cadence | Content | Owner |
|---|---|---|---|
| **`AGENTS.md`** (repo root, thin, ≤ ~200 lines) | Stable per repo — prompt-prefix cacheable | Repo layout, conventions tooling can't enforce, setup + verification commands, hard rules (never commit / never branch — the host owns integration). Repo-relative paths (worktree-safe). Overflow → nested per-directory AGENTS.md, never a fatter root. | apex-init seeds (ADR-026); **apex-plan populates at first spec-ready** and re-checks at the readiness gate |
| **`.agents/skills/`** (repo-local, selective, generated) | Per stack/domain binding | NOT a mirror of ~50 skills. Small cards: bound-stack, debug/testing, domain hazard, plan-review. Each card: activation description, "inspect repo first", 5–10 conditional invariants, verification discovery, references on demand. Shared ~8k-char description-index budget. Headless pickup PROVEN (scratch-repo probe, 2026-07-10). | Projected from APEX skills per **apex-skill-author convention** — generated, never hand-maintained twice |
| **Dispatch pack** (per task, host-assembled) | Per dispatch | Goal → Context → Constraints → Done-when (OpenAI's recommended shape): task + spec `## Intent` block (intent/invariants/non-goals), authorized files, resolved decisions (versions, policy values — never "adapt to the bound stack"), 3–7 *task-relevant* hazards selected from the loaded impl cores, exact verify commands, autonomy clause, JSON completion contract via `--output-schema`. | apex-code |

**Content calibration (all three layers):** spend lines only on repo-specific conventions,
version-bound hazards, resolved policy values, security invariants (auth-source, tenant scoping,
secret handling), and runnable verification. Never native hygiene. Positively phrased,
internally consistent (check new lines against existing layer text before adding).

**Completion contract:** Codex's final message is schema-constrained
(`status {done | done_with_concerns | blocked} + changed_files + commands_run/results +
deviations + unresolved + blocker`). `blocked` = a *spec* defect → routes to Forks, never to the
Opus fallback (a spec defect survives a model swap). Process-level death (non-zero exit,
rate-limit signature) = *paused/retryable* → park + checkpoint + operator choice (wait for quota
vs Opus fallback). This replaces the unconstrained final message and fixes the
paused-vs-failed conflation.

**Projection gates (`.agents/skills` cards):**
- **Iron Law extended to the Codex consumer** — each card is RED-tested against a *bare Terra*
  baseline; a card earns its place only if bare Terra fails the task (apex-skill-author).
- **Trigger-eval CSV gate** — should_trigger / should-not-trigger prompts incl. negative
  controls, run via `codex exec --json`; the dominant community failure mode is over-eager firing.
- **Validation checklist** — frontmatter parses, description budget fits, no AGENTS.md
  conflicts, `allow_implicit_invocation` set deliberately per card (false for
  dispatch-prompt-only cards).

**Spec `## Intent` block:** the spec template gains a compact intent / invariants / non-goals
block (≤10 lines) — the one sanctioned home for load-bearing intent, because stripping ALL
rationale makes coder-side mismatch resolution worse (Sol). ADR-essay rationale stays cut; the
execution-script discipline is otherwise unchanged.

## Rejected

- **Mirroring all ~50 skills into `.agents/skills/`** — most content is planning judgment or
  native hygiene; unselective projection is noise (all 6 Sol clusters).
- **Injecting impl.md wholesale into dispatch prompts** — token cost + instruction competition;
  the pack carries *selected* task-relevant hazards instead.
- **`codex mcp-server` MCP-registration dispatch** — subprocess dispatch wins for APEX:
  background-able, worktree-isolatable, per-task profile/effort control, tailable logs.
- **Blanket relaxation of spec discipline** — Sol wants resolved decisions, not freedom; the
  change is adding intent/invariants, not reopening judgment mid-build.

## Consequences

- Phase B specs implement the three layers: `gpt56-b1-planning-surface` (AGENTS.md population +
  Intent block), `gpt56-b2-dispatch-pack` (pack + completion schema),
  `gpt56-b3-skills-projection` (projection convention + gates).
- First Codex build after landing = the proving run for the pack + schema.
- Watch-items stay Phase D: Codex Memories reconciliation, Codex-side hooks for surgical scope,
  system-card over-agency note (sandbox + file-list framed as safety controls).
