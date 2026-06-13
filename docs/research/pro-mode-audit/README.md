# Pro-mode audit — synthesis

_Session 39 · 2026-06-13 · planning-mode analysis (Windows-authored, parallel fan-out)._

**Question:** APEX's coding surface is tuned for DeepSeek **V4 Flash** (weak coder). What changes
to support a **V4 Pro** "Pro mode" (stronger coder, ~3.1× cost — `deepseek-v4-pro`,
$0.435/$0.87 per Mtok vs Flash $0.14/$0.28)?

Four parallel audit agents (WS-A evidence · WS-B apex-code · WS-C principles/impl · WS-D
plan/governance) inventoried every Flash-compensation and tagged each **KEEP / RELAX-UNDER-PRO /
PRO-UNLOCK**. Per-workstream detail: `ws-a-evidence-map.md`, `ws-b-apex-code.md`,
`ws-c-principles-impl.md`, `ws-d-plan-governance.md`.

---

## The finding that reshapes everything (WS-A)

**We have almost no Flash↔Pro evidence.** Nearly every benchmark in the corpus is **Pro vs Opus**,
not the comparison we actually need. The only near-direct Flash↔Pro datapoint is ADR-016's
**~11 pp agentic-planning gap** (Terminal-Bench). There is **no DeepSeek-specific weak-coder study**
at all. Consequences:

- **No relaxation earns more than Medium confidence.** The gap evidence is a proxy; every "Pro can
  handle this" is an inference, not an observation. This is exactly the Flash playbook (reasoned +
  benchmark-grounded, Mac-validation deferred) — but we carry the uncertainty explicitly.
- **Some compensations get _worse_ under Pro**, not better — the context-hygiene / redundancy ones,
  because Pro costs 3.1× and emits up to 384K output. Trimming them *saves more* at Pro prices.
- **Thinking-tier tension.** Every "relax because Pro is capable" silently assumes Pro runs in a
  *thinking* mode (reasoning capacity is what buys conflict-resolution). But `think-max` inflates
  cost **above** the 3.1× sticker. The relax case and the cost case pull in opposite directions —
  any relaxation must name the thinking tier it assumes.
- **SlopCodeBench counter-evidence (WS-C):** code-quality and scope discipline *erode more* in
  capable long-horizon agents. So surgical-scope, per-task verify, and YAGNI matter **as much or
  more** for Pro — do not read "stronger coder" as "needs less discipline."

**Calibration (WS-D):** the benchmarks place Pro as a **linear-decay middle tier** — above Flash's
exponential-decay floor, below Opus's frontier threshold. That is why every relaxation below is
conservative and confined to **spec-literalness and review-redundancy**, never correctness or safety.

---

## Consolidated tags

Totals across the four workstreams: **KEEP ~57 · RELAX-UNDER-PRO 8 · PRO-UNLOCK 3.** The ~80% KEEP
majority is the intended result: most compensations are universal senior-engineer discipline a
stronger model *executes better*, not *outgrows*.

### RELAX-UNDER-PRO (all Medium confidence, all gated behind an existing escape hatch)

| # | Compensation | Skill | Conservative Pro behaviour |
|---|--------------|-------|----------------------------|
| 1 | Simplicity "flag-don't-act" | apex-code | Widen the apply+log exception to **local, behaviour-preserving, recipe-verified** simplifications inside one task's files; approach changes still flag. |
| 2 | Micro-ambiguity "prefer not modifying a file" | apex-code | Soften when the spec clearly intends the edit and only style is ambiguous; **"never delete" stays absolute.** |
| 3 | Santa-method dual-pass wave review | apex-code (owner) / governance | Single reviewer pass when the reviewer runs on Pro **AND** `risk` ≠ `high`; `risk: high` always keeps two passes. _(WS-B + WS-D converge.)_ |
| 4 | Two-tier impl.md core/references split | principles | Stays the authoring default; Pro **may pull** referenced detail on demand without it being a fault. "Pro may reach for more," not "load more by default." |
| 5 | CLAUDE.md ↔ skill rule redundancy | principles | Trim exact restatements to one-line pointers; **never remove a rule from its enforcement home.** |
| 6 | Spec-as-execution-script (files-per-task) | apex-plan | Allow **bounded** exploration ("locate + modify the handler for X in `dir/`") only when the exact file is genuinely ambiguous and the search space ≤ one named dir. |
| 7 | Split rule (>3 files / >2 phases) | apex-plan + CLAUDE.md | Loosen to **>5 files / >3 phases**. |
| 8 | Wave-plan emission | apex-plan | May omit the explicit plan for small specs (≤4 tasks) and derive waves from *stated* dependencies; mandatory for ≥5-task / architectural specs. |

### PRO-UNLOCK (capabilities Flash can't do well)

| # | Capability | Skill | Note |
|---|-----------|-------|------|
| 1 | Wave dispatch granularity | apex-code | Pro may run **2–3 tightly-related independent tasks per worker** (exploits near-frontier coding + 384K output); re-decomposition and parallel-wave width stay locked. |
| 2 | Cross-model reviewer role | apex-code / plan / governance | **Claude stays the strong reviewer** (Opus leads every verified benchmark). Unlock is narrow: when *Claude* is the builder, Pro is a more credible independent second voice than Flash. Mechanism unchanged, still opt-in. |
| 3 | Instruction-density headroom | principles | Pro's threshold-decay curve carries the full principles core + heavier task context without Flash's exponential penalty. **Spend the headroom on richer task _context_, not more standing rules.** |

### KEEP (unchanged at any tier) — the load-bearing list

All correctness / security / validation / error-handling / naming rules · all hard blocks
(push-to-main, merge, DROP, secrets, `docs/audit/`) · critical-file confirmation · permissions
pre-authorisation · autonomy levels L0–L5 + approval gates · evaluator-independence · fork routing
SMALL/BIG/GRAY · CONFUSION block · one-hypothesis recovery · one-retry BLOCK cap · surgical scope ·
positive-over-prohibition phrasing (architectural, scale-crossing — *not* a small-model artefact) ·
design-brief / doc-coverage check (targets a vision/modality gap Pro **still shares**) · dispatched
spec review (runs in **planning = Claude**, so coder strength is irrelevant).

**WS-B + WS-D both flag a cleaner lever:** for "let Pro do more autonomously," raise the **autonomy
level (L0–L5)** — don't rewrite safety rules. Capability and authority are different axes.

---

## Design recommendation

A single **`coder_tier`** parameter (`flash` | `pro`), **defaulting to flash-equivalent behaviour.**
Pro mode relaxes only the 8 RELAX items + enables the 3 UNLOCK items — each behind its **existing**
escape hatch (`risk` level, task independence, file-ambiguity), so a wrong Pro inference has a small
blast radius. **No `if pro:/if flash:` conditional bloat** — the dial scales a *named small set*,
several of them reusing flags that already exist (`risk:`, autonomy level). Most of the "Pro" win is
**cost-routing** (which specs run on Pro) + a few unlocks, **not** a wholesale re-tune — matching the
expectation set at proposal time.

**Confidence & validation:** every relaxation is Medium, inferred from Pro-vs-Opus benchmarks. The
aggressive ones (spec exploration, wave granularity) should be **Mac-validated** via the ADR-016 P1
eval harness (Flash vs Pro head-to-head) before being trusted — recorded as a deferred validation
flag, exactly like the `apex-swift` recipe, **not** a build gate.

## Phase status

- **Phase 0 (mechanics)** — spec drafted: `docs/changes/pro-mode-mechanics.md` (toggle + tier
  detection + BACKEND-ROUTING). Buildable now; toggle checks Mac-gated.
- **Phase 1 (this audit)** — done.
- **Phase 2 (implement the `coder_tier` dial)** — design above; **awaiting approval before any skill
  edit** (per the report-before-edit protocol).
- **Phase 3 (cost routing)** — heuristic for when planning stamps `coder_tier: pro`. Authorable.
- **Phase 4 (validate + ADR)** — Iron-Law baseline + new ADR (introduces the coder-tier dimension).
- **Deferred (Mac):** eval-harness head-to-head to confirm the Medium-confidence relaxations.
