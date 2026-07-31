# ADR-032 — GPT-5.6 role split: Sol plan-check + cross-model deliberation, Sonnet build host, cross-family review routing, Sol escalation rung

**Status:** Accepted — 2026-07-10 (session 65). **Partly superseded by [ADR-034](./ADR-034-sol-default-coder.md)
(2026-07-13):** Sol is now the *default coder*, so the **Sol escalation rung is gone** (the ladder ends at the
`ultra` effort rung, then Opus) and the **AFK end-of-run adversarial pass moved from Sol to Opus** (evaluator-
independence — the coder must not review its own run). The Sol *plan-check* gate and the cross-family review
routing in this ADR are unchanged. **Build-host framing superseded by [ADR-038](./ADR-038-single-session.md)
(2026-07-14):** the "Sonnet build host" is no longer a separate coding *session* — it is an in-session
`model: sonnet` build-orchestrator worker (see [ADR-045](./ADR-045-four-role-split.md)); the earlier "the
Sonnet build host … unchanged" claim is itself now dated.
**Extends:** ADR-010 (multi-pass review / council), ADR-015 (bounded dispatch), ADR-027 (Codex-primary), ADR-030 (effort dial), ADR-031 (context propagation); honours apex-governance § Evaluator independence
**Evidence:** `docs/research/gpt56-apex-integration/README.md` §2 (verdict + Amendments 1–2), user decisions 2026-07-10

> **Fallback coder amended by [ADR-045](./ADR-045-four-role-split.md) (2026-07-19, A1 session-79b):** the Claude fallback coder is **Sonnet 5** (a fresh `model: sonnet` worker), **not Opus**. Opus holds the spec-author, build-orchestrator (owner amendment 2026-07-29), and high-risk-reviewer roles — not the coder role. Every "Opus fallback" / "Opus builds inline" statement below is historical. Sweep recorded in [ADR-046](./ADR-046-doctrine-audit-resolutions.md).

> **Amended 2026-07-30 (owner decision; Artemis-retro P4(b)):** every **Deep Details** spec also gets a **pre-draft architecture pass** — a cold Sol read of the HOST'S PLAN, dispatched BEFORE the spec author (§1b below). It is ADDITIONAL to the §1 post-readiness cold read, which is unchanged — still cold, still governed by §1's own rule. Procedure: `apex-plan/references/sol-plan-check.md` § Pre-draft architecture pass.

## Context

The user's target split — **Opus plans · Sol double-checks plans · Sonnet orchestrates builds ·
Terra codes** — was scored against the session-64 evidence and adopted with two amendments.
Drivers: (1) cross-family review evidence is strong (93.4% of findings unique to one tool;
OpenAI ships a Codex↔Claude cross-review plugin); (2) pool economics — Opus and Sonnet draw
separate Anthropic weekly caps, and Sol/Terra draw the ChatGPT quota, so the split moves build
hosting off the scarce Opus/planning pool entirely; (3) Sonnet 5 beats Opus 4.8 on
Terminal-Bench 2.1 (80.4 vs 74.6); (4) the 2026-07-10 Sol deep-dive reversed the "Sol can't
code" read — AA's standardized Codex-harness index has Sol(max) at 80, leading Opus 4.8 at
~10% lower per-task cost; (5) Fable bundled access reportedly ends ~2026-07-12, making the
"no Fable" planning premise literal — the Sol gate is the designed mitigation for the ceiling drop.

## Decision

### 1. Sol plan-check gate (apex-plan, after the readiness gate)

After a Deep Details spec passes the readiness gate and **before** it moves to `docs/changes/`,
dispatch a cold Sol review:

```
codex exec -c approval_policy="never" --sandbox read-only -m gpt-5.6-sol \
  -c model_reasoning_effort=max --output-schema <codex-review-schema> -o <out.json>
```

- Input: the spec + repo evidence only. **Never Opus's self-review notes or reviewer findings —
  the cold first read is sacred** (evaluator independence).
- Output: schema-constrained BLOCK / FLAG / CLEAN findings (reuses the proven
  `codex-review-schema.json` shape).
- Disposition: **advisory by default; blocking for `risk: high`** (a high-risk spec does not
  move to ready with an unresolved Sol BLOCK).
- **Sol never edits the spec** (METR gaming flag → capability caution): findings route through
  the planning host + human gate; planning applies accepted amendments itself.
- Skip for Light / Bug Fix modes and for trivial single-domain specs (same economy rule as
  dispatched domain review).

### 1b. Pre-draft architecture pass (amendment, 2026-07-30)

For every **Deep Details** spec, before the `model: opus` spec author is dispatched (ADR-045),
dispatch a cold Sol read of the plan itself — there is no spec yet, and that is the point.

- **Mandatory for every Deep Details spec — no economy exemption** (owner decision, 2026-07-30).
  The asymmetry with §1 is deliberate and stands: §1's post-readiness read KEEPS its existing
  economy rule ("skip Light / Bug Fix modes and trivial single-domain specs") unchanged, and this
  pass does not inherit it.
- **Input = the plan brief ONLY:** a required **`risk:` field, assigned by the host at plan time**
  (the approval gate below keys off it), the problem statement, the proposed structure, and the file
  map (path + operation + one-line role), plus whatever repo evidence Sol reads for itself. Never
  the host's self-review notes, never prior reviewer findings.
- **Digest-bound, like every plan-check-family dispatch.** The prompt's FIRST line is
  `SPEC-DIGEST: <value>` — the literal `— (pre-draft)` sentinel on an initial pass; on a re-plan
  against a live draft, the real `git hash-object` of that draft, **and that draft is attached to
  the prompt after the brief**, because the hash must bind what the reviewer actually reads.
- **Output = schema'd BLOCK / FLAG / CLEAN findings scoped to ARCHITECTURE:** wrong decomposition,
  a structure that cannot produce the stated outcome, a missing or misplaced boundary, a file map
  that fights the repo's existing seams, a simpler structure that meets the same goal. Spec wording,
  criteria phrasing and task mechanics belong to the §1 read, not this one.
- **Effort `xhigh`.**
- **Disposition: advisory for routine specs, blocking for `risk: high`** — read from the brief's
  required `risk:` field. The blocking path is an **approval gate**, not an advisory review: on an
  unresolved arch-pass BLOCK for a `risk: high` plan the host prints the **apex-governance § Approval gate** banner and requires the explicit
  `Approve? [y / n / edit]` answer **BEFORE any spec-author dispatch**. No author is dispatched on
  that plan until the gate is answered. The host adjudicates every finding into the PLAN before
  drafting. **Sol never writes the plan and never edits the spec** (the §1 no-auto-amend rule,
  unchanged).
- **Independent of the §1 cold read; neither replaces the other.** The pre-draft pass is mandatory
  for every Deep Details spec; the post-readiness read runs per §1's existing rule (mandatory except
  its trivial-single-domain economy skip). They are separate dispatches. The §1 read **never receives this pass's findings, the
  host's answers to them, or any note that it ran** — the post-readiness first read stays cold
  (apex-governance § Evaluator independence). That extends to DISCOVERY, not just delivery: the §1
  cold-read prompt carries an explicit instruction **not to open `docs/drafts/*.review.log`**,
  because the sidecar carries prior findings — including this pass's.
- **Round record — ALWAYS.** This pass is plan-check FAMILY and every run leaves a row. When it
  dispatches, the host creates — or appends to — `docs/drafts/<short-name>.review.log` (the
  short-name is fixed at plan time, before any draft exists) with a normal row on apex-plan
  § Convergence control's terms: EXEMPT from the 3-round reviewer-family cap, bounded by the
  announced pass-or-park rule. The `Spec digest` cell carries the literal `— (pre-draft)` when no
  draft exists yet, or the real `git hash-object` digest when re-planning against a live draft.
  That is a VALUE CONVENTION inside the existing row schema — not a schema change — and it moves
  no counting rule. **While the cell holds the `— (pre-draft)` sentinel the digest-mismatch/VOID
  check is a DEFINED NO-OP:** there is no file to re-hash, so the check is inapplicable, not
  failed — and it reactivates the moment a real hash is recorded (a re-plan against a live draft).
- **A sidecar with no matching draft is NORMAL, never "abandoned".** Between this pass and the
  author's first draft, a sidecar without a `.md` sibling is the expected state; nothing
  auto-classifies it as abandoned and nothing sweeps it. A later plan reusing the same short-name
  APPENDS to the existing sidecar — lifetime records stay conservatively intact. Cleanup happens
  only at promotion to `docs/changes/` (the deletion step in apex-plan § Closing the session) or by
  explicit owner action.

### 2. Cross-model deliberation (two tiers, never auto-run)

**Tier 1 — finding-level deliberation (high-risk specs only).** Trigger: the **user asks for
it, or the host suggests it and asks — every time** (mirrors the Council offer-only rule;
ADR-010). Protocol:
- After the cold read, Opus answers each Sol finding — **amend** (accept, change the spec) or
  **rebut with evidence** — into the *same* Sol conversation (`codex exec resume <session>`).
- **≤2 rounds** (ADR-015 bounded-dispatch cap).
- Termination is **NOT consensus**. Each finding resolves to exactly one of:
  `accepted` (spec amended) · `withdrawn` (Sol retracts on evidence) ·
  `DISPUTED` (both positions stated → **the user arbitrates**).
- The resolution table lands in the spec's `## Intent` block (invariants the build must honour).
- **Anti-collusion valve:** disputes surface, they are never negotiated away — a "let's split
  the difference" resolution is forbidden; if neither side moves on evidence, it is DISPUTED
  and goes to the user (Odysseus lesson; apex-governance § Evaluator independence).

**Tier 2 — blind dual-draft (user-invoked ONLY; rarest, biggest decisions).** Both models draft
from the same problem brief independently (neither sees the other's draft) → exchange → ≤2
rounds of critique → a **merge doc** listing agreements + disputes, delivered to the user for
the final call. Never suggested proactively by the host.

### 3. Sonnet build host (default), Opus escalation

The `APEX_MODE=coding` host runs **Sonnet 5 by default** (`/model sonnet` or
`ANTHROPIC_MODEL`); it orchestrates dispatch, verify loops, pulses, and integration. **The host
runs the verify loop — never the coder subprocess judging itself** (evaluator independence at
the task level). Opus remains: per-spec escalation (`coder_model: opus` / operator choice),
high-risk supervision (`risk: high` builds may run an Opus host deliberately), GRAY-fork
judgment, and the fallback coder at Codex quota-out — under a Sonnet host the Opus fallback runs
as a **fresh `model: opus` code-worker dispatch** (or the operator switches the session via
`/model opus` for a fallback-heavy build); "inline" was an Opus-host-era mechanic. The soft pool
guard (apex-governance) stays scoped to Opus draws; Sonnet hosting draws its own separate weekly bucket.
**Proving run required:** the first real Sonnet-hosted build validates the flip; until then the
default is wired but unproven.

### 4. Cross-family review routing (Amendment 1) + Sol escalation rung (Amendment 2)

- **Terra-built code → Claude reviews:** routine waves/post-build → the host family default
  (Sonnet); the high-risk dual-pass set (auth/security/data, `risk: high`) → **Opus** reviewers.
- **Opus-fallback-built code → Codex reviews** (Sol or Terra, headless read-only, as today).
- **Plans → Sol reviews** (§1). Reviewer family ≠ builder family always holds.
- **Escalation ladder gains a Sol rung:** Codex verify-fail recovery = Terra effort-bump
  (`…→xhigh→max`) → **re-dispatch the task on Sol** (same subprocess mechanics, same ChatGPT
  quota, frontier-class agentic coding in exactly this harness) → **Opus** (fresh `model: opus`
  worker / `/model opus`, per §3) only at quota-out. A GRAY fork is NOT an escalation trigger —
  it routes to the user per apex-code § Forks. Keeps escalations off the Anthropic
  pool one rung longer.

## Rejected

- **Auto-run deliberation** — an always-on debate gate re-adds ceremony to every spec and
  invites collusion dynamics; offer-only, high-risk-only (ADR-010 discipline).
- **Consensus termination** — forcing agreement converts disagreement into negotiation
  (reward-hacking surface); disputes go to the user instead.
- **Sol auto-amending specs** — METR gaming flag; review stays advisory, planning holds the pen.
- **Sonnet-host flip without a proving run** — no long-horizon full-session eval exists for
  Sonnet 5 as build host; first real build is the gate.
- **Dropping the Opus fallback in favour of Sol-only escalation** — quota-out on the OpenAI
  side must land somewhere; Opus stays the terminal rung (fresh-worker mechanics per §3).

## Consequences

- Phase C specs: `gpt56-c1-sol-plan-check` (gate + deliberation in apex-plan),
  `gpt56-c2-sonnet-host` (governance + session-start hook), `gpt56-c3-review-routing`
  (apex-code routing + Sol rung).
- Proving runs: first Sol gate live-fire (may run on these very specs), first Sonnet-hosted
  build, first Sol-rung escalation in a real build.
- Watch: Sol plan-check spend lands on the same ChatGPT quota as Terra builds — if gate usage
  ever crowds build quota, revisit effort (`max` → `xhigh`) before dropping the gate.
- Up to two Sol dispatches per Deep Details spec (the second subject to §1's economy rule): the
  pre-draft architecture pass always, the post-readiness cold read per §1. Both draw the ChatGPT
  quota; the plan-check effort drop `max` → `xhigh` (retro P7(a)) offsets part of the added spend.
  Same watch item as §1: revisit effort before dropping a gate.
