# DRAFT (access-gated — NOT ready to build) — GPT-5.6 family adoption

**Identity:** wire the GPT-5.6 coder family (Sol/Terra/Luna) + `max` effort + `ultra` mode into the
APEX coding workflow. Extends ADR-030 (reasoning-effort dial) and ADR-027 (Codex-primary).
**Research:** `docs/research/gpt-5.6-execution/README.md` (2026-06-27, MEDIUM confidence — preview).

> ## ⛔ Access gate — why this is a draft, not a `docs/changes/` spec
> GPT-5.6 is in **limited preview (~20 partners, API + Codex, no self-service enrollment)** as of
> 2026-06-27. Our `codex-cli 0.141.0` auth is almost certainly **not** in it. Until we can select a
> GPT-5.6 model on our own Codex auth, this stays a draft: the model string can't be verified, no
> Verification Recipe can run, and adopting it now would be speculative + unverifiable (CLAUDE.md §2;
> memory `prove-design-against-reality-first`).
>
> **Trigger to promote → `docs/changes/` / direct skill edits:** `codex exec -m <gpt-5.6 id>` resolves
> on our auth (confirm with a trivial probe). Re-verify every fact below against the GA docs at that
> point — preview details (ids, modes, pricing, default tier) routinely shift before GA.

## What GPT-5.6 is (preview facts — re-verify at GA)
- **Family, not one model.** Generation number (`5.6`) + durable capability tier (Sol/Terra/Luna):
  - **Sol** — flagship; coding/bio/cyber SOTA. $5/$30 per Mtok (= gpt-5.5 price).
  - **Terra** — matches gpt-5.5 at ~half cost. $2.50/$15.
  - **Luna** — fast/economical for routine work. $1/$6.
- **New `max` reasoning effort** — beyond `xhigh`; deepest single-chain reasoning.
- **New `ultra` mode** — in-model **subagents** split one task to accelerate it. Sol(ultra) = 91.9% on
  Terminal-Bench 2.1 vs gpt-5.5's 83.4%.
- Exact CLI model ids: **UNKNOWN** — capture from `codex` / the models doc at access time.

## Staged change surface (each gated on access)

### Stage 1 — `max` effort (trivial; do first)
Extend the ADR-030 effort dial enum everywhere it appears:
- `apex-code/SKILL.md` dispatch line + `references/codex-observability.md`: `{low|medium|high|xhigh}` → `{low|medium|high|xhigh|max}`.
- `apex-plan/SKILL.md` + `references/model-routing.md`: add `max` to the `coder_effort` rubric (reserve for the hardest async/eval work, above `xhigh`).
- `templates/spec-template.md`: enum comment.
- Verify-fail escalation ladder: `…→xhigh→max` before Opus fallback.
- **Acceptance:** a spec with `coder_effort: max` dispatches `-c model_reasoning_effort="max"` and the build converges.

### Stage 2 — family tier menu (revives the ADR-030-deferred tier decision)
GPT-5.6's clean cost tiers make the per-spec *model* lever worth what `gpt-5.4-mini` wasn't — one family, predictable cost.
- **Recommendation (from research §5 Fork 1):** **make Terra the default coder** (≈gpt-5.5 quality at ½ cost), with **Sol** for `risk:high`/auth/security/data/hard specs (+ its `max`/`ultra` modes) and **Luna** for trivial. Monotonic within-family ladder = the *clean* tiering ADR-027 lacked when it collapsed cross-family routing → frame as a **scoped refinement of ADR-027**, not a reversal. RED-probe the per-spec tier judgment (likely model-native) before encoding more than the plumbing + default.
- Surface: `status.md` `coder_models` menu; `apex-plan` model-routing rubric; spec `coder_model` frontmatter; `apex-code` dispatch map; family-aware review routing (reviewer family ≠ builder).
- **Acceptance:** a spec pinned to each tier dispatches the right model id; default-tier change is reflected in an untagged wave plan.

### Stage 3 — `ultra` mode (EVALUATE before adopting — do not bake)
`ultra` (model-*internal*, autonomous, opaque subagents within ONE task) is a **different axis** from APEX's wave dispatch (ADR-028/029 — explicit, file-disjoint, observable parallelism across *independent* tasks). Complementary, not rivals — but they **stack multiplicatively** on quota (a wave of N `ultra` tasks = N×subagents; research notes token usage "skyrockets"), and `ultra`'s opacity fights APEX's surgical-scope + visibility discipline.
- **Resolved direction (research §5 Fork 2):** keep APEX waves as the parallelism primitive; treat `ultra` as a **rare per-task escalation rung above `max`**, NOT a parallelism layer. When a task uses `ultra`, **count it heavier against `max_parallel_codex` (or run ultra tasks sequential/foreground)** to avoid blow-up and keep supervision.
- **Required before adoption:** a real eval on access — does `ultra` on one gnarly task beat `max` effort + our waves, at what cost? Apply `apex-sole-coding-workflow` / RED-probe discipline: absorb only if it wins.
- **Open question:** per-task flag vs whole-spec mode; exact `max_parallel_codex` interaction.
- **Acceptance:** an eval doc with a head-to-head verdict; skill edits only if it wins.

## Open questions (carry to the access-time session)
1. Exact GPT-5.6 CLI model ids + whether `-m` or `/model` selects them in `exec`.
2. Default coder tier — stay Sol-equivalent, or shift default to Terra for cost? (Stage 2.)
3. `ultra` vs APEX wave parallelism — complementary or redundant? (Stage 3 eval.)
4. Does `max`/`ultra` change the cross-spec parallel cap math (ADR-029)?
