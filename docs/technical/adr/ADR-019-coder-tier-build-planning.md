# ADR-019 — Coder-tier build planning (DeepSeek Flash ↔ Pro)

**Status:** Accepted · 2026-06-13 (session 39)
**Context home:** `docs/research/pro-mode-audit/` (audit + worked example + design)

## Context

APEX coding mode runs DeepSeek, and the whole coding surface is tuned for **V4 Flash** (a weak
coder). DeepSeek also offers **V4 Pro** — a stronger coder at ~3.1× the cost (`deepseek-v4-pro`
$0.435/$0.87 per Mtok vs Flash `deepseek-v4-flash` $0.14/$0.28; same base URL). We want to use Pro
for the *important / hard* work without paying 3× for routine work, and without weakening any
guardrail.

Two prior questions shaped this decision:
- A four-workstream **compensation audit** (`docs/research/pro-mode-audit/`) found that ~80% of
  APEX's Flash-compensations are universal good practice (KEEP regardless of tier). Only a handful
  are genuine Flash-specific relaxations, and **none clears more than Medium confidence** because
  almost all available benchmarks are Pro-vs-Opus, not Flash-vs-Pro.
- A **RED baseline probe** (two bare Opus planning agents, no skill) reproduced the *entire*
  feature-splitting judgment cold — difficulty seam, contracts-frozen-first, conformance-tests-
  travel-with-the-contract, tier-grouped build order, stub-for-back-dependencies. The splitting
  *judgment* is model-native.

## Decision

Introduce a **coder-tier dimension** as a planning discipline, not a coder re-tune.

1. **Per-project policy** — `coder_tier_policy: flash | pro | split` in status.md (default `flash`,
   fully backward-compatible). `flash`/`pro` = pure single-tier (no splitting, no toggle); `split` =
   tier-aware planning.
2. **Per-spec tier** — `coder_tier: pro | flash` spec frontmatter flag (only meaningful under
   `split`), alongside the existing `risk:` / `cross_model_review:` flags.
3. **apex-plan** assigns tier and, under `split`, may split a feature across tiers — but **only when
   the hard kernel sits behind a contract that can be frozen and conformance-tested** (Pro commits
   the contract; Flash builds the perimeter against it). Diffuse difficulty / un-freezable interface
   → no split, whole feature on one tier. Planning emits a dependency-ordered, tier-grouped
   `## Build plan` so the orchestrator can tell the user what to run where and when to toggle.
4. **Tier is capability, not authority** (apex-governance) — orthogonal to the autonomy level; the
   stronger coder never relaxes a gate, critical-file confirmation, or hard block.

Because the RED probe proved the splitting judgment is model-native, the skill encodes **only the
policy/flag/build-plan convention** — not the R1–R5 splitting rationale (which lives in the research
doc as the *why*).

## Consequences

- **Zero guardrail relaxation in v1.** Every NEVER/ALWAYS, verify-loop, and review pass runs
  identically; the hard slice just gets a better coder. The Medium-confidence coder relaxations
  (Subset A/B in the audit) are deferred and optional, gated on a Mac eval — not part of this ADR.
- **Cost-routing** is the primary win: a split feature costs ~`kernel_fraction × 3 + remainder` vs
  3× for all-Pro (≈40% cheaper on a 40/60 split) while the hard part still gets Pro.
- **A seam risk exists** (a weak Flash reader meets a frozen contract) — mitigated by contracts-as-
  committed-code + conformance tests travelling with the contract + Opus owning both specs. The
  freezable-interface gate refuses the riskiest features, so the loss risk self-limits.
- **Mechanism (Phase 0)** — the one-command `apex-code` Flash↔Pro toggle + SessionStart tier
  detection — is specced separately in `docs/changes/pro-mode-mechanics.md` and is Mac-gated.
- **Validation deferred (not a gate):** the eval-harness Flash-vs-Pro head-to-head (ADR-016 P1)
  confirms the optional relaxations only; the splitting discipline itself is planning behaviour and
  needs no Mac validation.
