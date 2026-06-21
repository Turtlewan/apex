# ADR-023: Pre-authorise before dispatch — non-interactive agents silently deny off-allowlist actions
**Date:** 2026-06-21
**Status:** Accepted

## Context
This session surfaced **three independent instances of one root cause**:

1. **dontAsk workflow builds** (`docs/probes/phase2-results.md`). A `wave_dispatch: workflow` build under
   `--permission-mode dontAsk` denied the orchestration tools (`Workflow`/`Skill`) until they were added
   to `permissions.allow`; recipe commands (`uv`/`ruff`/`mypy`/`pytest`) and file writes likewise. The
   denials were **local** ("…running in don't ask mode"), not classifier round-trips. Workers spawned via
   the workflow **inherit** the parent's `dontAsk` and get the same local denials.
2. **Background research agents** (`apex-research` 1.4.0). Dispatched Phase-2 Sonnet/Haiku retrieval agents
   run non-interactively, so a `WebFetch` to a domain absent from `permissions.allow` **auto-denies** — no
   prompt for them to answer — and open research silently loses sources.
3. **Protected-path edits** (prior, [[classifier-gates-protected-path-edits]]) — a related but distinct
   gate (the auto-mode classifier), the original SPOF that drove the `dontAsk` migration.

The shared mechanism (instances 1–2): a **non-interactive execution context** — a headless / `dontAsk`
build, a dispatched/background subagent, a workflow worker — has **no human present to answer a permission
prompt**. Claude Code's response to "this action would need approval" in such a context is to **deny,
silently** — not to block-and-wait. So anything not already in `permissions.allow` fails with **no signal
to the operator**, and the work *silently degrades* (a source vanishes, a worker can't self-verify, a
dispatch never happens) rather than erroring loudly. The behaviour was being **re-discovered from scratch**
each time it bit, and the fix re-derived per-skill.

This is distinct from two things it is easy to conflate:
- **`permissions.deny`** (the destructive floor) — applies in every mode and *should* block; unaffected here.
- **The auto-mode safety classifier** — a separate gate that routes through `ANTHROPIC_BASE_URL` (the SPOF
  the `dontAsk` migration removed, apex-code 1.17.0). This ADR governs only the **allow side under
  non-interactivity**, not the classifier.

## Options considered
| Option | Score | Reasoning |
|--------|-------|-----------|
| **Name the principle once in an ADR + keep the per-skill enforcement, cross-linked** | **3 (chosen)** | Single "why" home; future dispatch sites inherit the rule without re-discovery; per-skill mechanics stay where they execute. |
| Leave it distributed across skills + memories (status quo) | 1 | Already re-discovered 3× this session; will recur at the next new dispatch site. |
| Add a runtime hook that pre-flights allowlist completeness | 1 | Fragile (must parse intent/spec at runtime); premature — the deferred safety-guard Freeze territory, gated on a live Mac. |
| Bake a blanket-wide `permissions.allow` | 0 | Violates least-privilege and undercuts the destructive-floor reasoning; over-authorises real projects. |

## Decision
**Any work dispatched into a non-interactive context must have every tool, command, and domain it needs
pre-authorised in `permissions.allow` *before* dispatch. Off-allowlist = silent deny, never a prompt.**

Three corollaries:
1. **Completeness is the upstream operator's job.** The interactive planning/main context authorises; the
   dispatched context **cannot author its own allowlist** ([[dontask-probe-cleanup-paradox]]). For a
   `dontAsk` build the allowlist must cover file writes + the bound recipe commands + the orchestration
   tools a `wave_dispatch: workflow` path uses (`Workflow`/`Agent`/`Task`/`Skill`).
2. **Fail loud, not silent.** Where a missing authorisation is possible, the dispatched agent returns an
   **explicit signal** rather than an empty/degraded result — `NEEDS-DOMAIN: <host>` (apex-research),
   a `BLOCKED`/`NEEDS_CONTEXT` worker status (apex-code), or a logged blocked-action — so the operator can
   authorise and re-dispatch.
3. **Pre-authorising is a control action, not the gated work itself.** It legitimately stays with the
   interactive/planning context and does **not** violate role contracts — e.g. apex-research's "the
   planning model never fetches" holds, because authorising a domain ≠ fetching it.

`permissions.deny` is unaffected: the destructive floor *should* block in every mode. This ADR is the
allow-side invariant only.

**Where it is enforced (this ADR is the shared "why"):** apex-code step 1a (`dontAsk` build allowlist +
worker inheritance), apex-research § Web access under dispatch (domain pre-auth + `NEEDS-DOMAIN`),
apex-governance § Build Mode (AFK). Memories: [[background-agents-no-interactive-approval]],
[[dontask-probe-cleanup-paradox]], [[classifier-gates-protected-path-edits]].

## Consequences
- **Positive.** One named invariant; any future skill/spec that dispatches agents or runs headless inherits
  it. Converts a silent-degradation failure mode into a pre-flight checklist + a loud-fail signal.
  Complements **ADR-015** (dispatch *return*-contract — children return small) with a dispatch *entry*
  condition (children must be pre-authorised).
- **Negative / accepted.** The operator must enumerate the allowlist upfront (friction). For open research
  the domains can't all be known in advance — the discovery-first `WebSearch` → authorise → re-dispatch
  loop + `NEEDS-DOMAIN` covers the residue. Over-authorising a throwaway probe is fine; real projects keep
  least-privilege.
- **Not a new hook.** The safety-guard Freeze (runtime allowlist pre-flight) stays deferred — this is a
  convention enforced in skills, not machinery.
- **Validation.** The `dontAsk` path is empirically validated (Phase-2 probes E/F1/F2 all PASS,
  2026-06-21). The web pre-auth path wants one real research-run validation (coding-session / real-research
  gated, not Mac-gated).

## Sources
- `docs/probes/phase2-results.md` — dontAsk Phase-2 (E/F1/F2 PASS): allowlist completeness + worker inheritance
- `apex-research` 1.4.0 § Web access under dispatch; `apex-code` 1.17.2/1.18.0 step 1a
- Memories: background-agents-no-interactive-approval, dontask-probe-cleanup-paradox, classifier-gates-protected-path-edits
- CC permission docs (/permission-modes, /auto-mode-config); GitHub issue #69002 (classifier-model pinning, unshipped)
