# Project: APEX — Coding/Development System
_A system of AI-assisted development skills for Claude Code: orchestration, planning, coding, debugging, and specialist domain tools._

stack: Markdown / Claude Code skills
token_profile: balanced
autonomy_level: L2
specialists_default: []
backends: planning=opus | coding=codex (gpt-5.6-sol, primary — ADR-034) / host=sonnet-5 (ADR-032, `apex-build`) / escalation=effort dial → `ultra` → opus (fallback, fresh worker) | afk end-gate=opus (cross-family, ADR-034) | deepseek=archived (ADR-027)

_Last updated by planning mode:_ 2026-07-13 (session 69 — **Sol replaces Terra as the default coder → ADR-034.** User call, taken from real use rather than the parked A3 bakeoff (session 66's Opus×Sol deliberation had confirmed "Terra default, stays until measured" — A3 is now **closed by decision, not measurement**). Probed first: Sol proven live as a *coder* under the `apex-coder` profile (codex-cli 0.144.1, workspace-write — wrote source + tests, pytest green, exit 0); it had only ever been proven as a reviewer/plan-checker. The swap forced two structural consequences, both resolved in ADR-034 rather than left to drift: (1) **the verify-fail ladder lost its Sol model rung** (nothing above the coder to escalate *to*) → `ultra` promoted to the final automatic rung (`…→max→ultra`→Opus), the only place `ultra` ever fires automatically — accepted debt: `ultra` is still un-evaled vs `max`, promoted on structural grounds, and is the first rung to cut if the eval disappoints; (2) **the AFK end-of-run adversarial pass moved Sol → Opus** — with Sol coding, a Sol end-gate is self-review, violating evaluator-independence on the one review that runs with no human present; moving it to Opus also brings the end-gate under ADR-032's existing cross-family rule (Codex builds → Claude reviews), which was applied everywhere *except* there. End-gate recipe rewritten from a `codex exec` subprocess to a host-dispatched read-only `model: opus` subagent (`references/afk-endgate.md`, renamed from `afk-sol-endgate.md`). Sol plan-check gate **unchanged** (plans are Opus-authored — no self-review). ~24 files: 10 skills version-bumped, ADR-034 + supersession notes on ADR-027/032/033, hooks, both CLAUDE.mds, BACKEND-ROUTING, status-template, `~/.codex` profile, PS-profile launcher. Caps held (apex-code + apex-plan both exactly 500/500). **Cost note: Sol is the top GPT-5.6 tier — builds burn Codex/ChatGPT quota faster, but the scarce Anthropic Max pool is untouched, so config-A pool economics are intact.**). 2026-07-13 (session 68 continued — **Artemis reconciliation: ADR-033's first real cross-project test.** User ran an AFK build on Artemis overnight; investigation found it used Artemis's own independently-evolved AFK pipeline (opus/fable host + Sol plan-check + ad-hoc Sol cross-check pass), NOT any ADR-033 mechanism — none of afk-gate.js/codex-dispatch.ps1/afk-sol-endgate/silent-regression-lenses were exercised. Reconciliation found Artemis had already converged on 3 of 4 ADR-033 pieces through practice (Sol cross-check ≈ A1, per-spec `Freshness: FULL/LIGHT` ≈ A3), with A4 (durable dispatcher) the one **proven, twice-hit gap** — a 2026-07-11 session crash required manually recovering an orphaned Codex process, and the 2026-07-12-night2 handoff named the missing durable dispatcher explicitly before it existed. Wrote **ADR-058 in Artemis** adopting the durable dispatcher + formalizing the standing Sol end-gate + folding in the silent-regression checklist; explicitly declined `afk-gate.js` adoption (Artemis's existing broad-allowlist has run incident-free). **Found + fixed a real bug in `codex-dispatch.ps1` during first cross-project use**: the ledger/log directory resolved relative to the script's own install location (`~/.claude`), not the target `-Worktree` — any repo other than `~/.claude` itself would have had its Codex logs silently misfiled. Fixed (ledger stays global by design for `-Adopt`; logs now resolve per-`-Worktree`) and live-verified against the real Artemis repo. ✅ committed: ~/.claude `d7e8f37` (dispatcher fix) · artemis `e322b53` (ADR-058 + 2 runbooks) · apex SKILL-HISTORY (this commit). **ADR-033's mechanisms remain otherwise unproven in a real multi-hour unattended run** — that proving run still hasn't happened.). 2026-07-12 (session 67 — **Safe unattended builds (ADR-033) — AFK gate + Artemis-retro cadence hardening, planned + specced.** User goal: kick off overnight builds that don't halt on a decision. Root-caused against real Artemis runs: the recurring stall is the harness permission **classifier denying the brain serve-kill** — and `dontAsk` *denies* (not asks) classifier-uncertain commands, so the deploy goes "half-done." Fix = an `afk-gate` PreToolUse hook that returns `allow` (overrides the classifier-deny) while an AFK flag is armed. Paired with the safety half from the **Artemis run-retro cadence gaps** (`docs/findings/artemis-run-retro-cadence-gaps-2026-07-12.md`, left in this backlog): A1 standing end-of-run Sol adversarial pass · A2 silent-regression lenses · A3 invariant-freshness · A4 durable dispatcher. **ADR-033 + 4 specs authored** (afk-permission-mode · afk-durable-dispatcher · afk-sol-endgate · cadence-regression-lenses → `docs/changes/`). **afk-permission-mode went through 2 apex-security review rounds** — round 1 (BLOCK×4: fail-open expiry, injection arming, no exfil check, untested multi-hook) → fixed; round 2 (BLOCK×2: Bash-mediated self-arm, pipe-to-shell RCE) → resolved **structurally by flipping the armed Bash grant from a leaky denylist to a fail-closed allowlist**. Decisions: **A1 standing-on** (owner-ratified codex spend), **AFK autonomy L4**, **arm via `!afk`** (terminal/injection-safe — chat-phrase arming rejected). Gate-caught + fixed: apex-code/SKILL.md at 500/500 cap (A1/A3 edits made net-neutral) and apex-code has no impl.md (A2 → references file). Sol plan-check timed out at `max` (not re-run). 🟡 uncommitted: ADR-033 + 4 specs + status. **Next session = the coding build** (Sonnet host, Terra coder) of the 4-spec chain; first `▸codex` build validates the dispatch pack too.). 2026-07-11 (session 66 — **GPT-5.6 (Sol/Terra/Luna) vs Claude model-usage review + swarm design.** User-triggered Opus×Sol Tier-1 deliberation (ADR-032). 3 Sonnet web-retrieval agents → `docs/research/gpt56-vs-claude-model-usage/` (README synthesis + opus-position + 3 evidence files); live Sol cold read (`gpt-5.6-sol` effort max) over a neutral evidence bundle (Sol self-reports **June-2024 cutoff** → reasons-over-evidence, can't recall these benchmarks — which *neutralised* the self-eval conflict). **High consensus, zero disputes.** Sol confirmed *against its own family twice*: planning/architecture stays **Opus 4.8** (open-ended multi-path judgment = Sol's weakest axis; Fable — the only clear Opus-beater — leaves subscriptions 07-12, verified live), and **Ultra rejected** as the swarm mechanism (record-high METR gaming flag, opaque, 2–3× tokens, Sol-only). Research pipeline unchanged (Haiku beats Luna at retrieval; Opus synthesis). **4 amendments surfaced but PARKED unapplied** (A1 Sonnet-as-coding-fallback · A2 concurrency 3→2 + budget guardrails · A3 coder bakeoff · A4 cheap-worker tier needs ADR+eval — see In-Flight). Headline: APEX's ADR-028/029 wave dispatch **already is** the recommended swarm; accelerate via cheaper-tiered workers + hard budget caps, not bigger fleets or Ultra. User parks for ~1–2 weeks pending more GPT-5.6 data. 🟡 uncommitted: report dir + status row.). 2026-07-10 (session 65 — **Phase B specs authored + ADR-031.** Resumed the GPT-5.6×APEX queue: wrote **ADR-031 (Codex context propagation — thin AGENTS.md · selective generated `.agents/skills/` cards · per-task dispatch pack + JSON completion contract)**, authored the 3 Phase B specs as a chained file-disjoint set (shared SKILL-HISTORY serialized via `## Prerequisites`, ADR-029): **B1** planning surface (apex-plan 1.31.0: doc-coverage items 4-6 merged + AGENTS.md-stub flag + readiness-gate AGENTS.md-currency item + Intent-litmus exception; new `references/agents-md-population.md`; AGENTS-template never-branch + ~200-line root ceiling; spec-template `## Intent` block) · **B2** dispatch pack (apex-code 1.28.0: four-slot pack + `--output-schema` completion contract, `blocked`=spec-defect→Forks never-model-fallback, quota-death=paused-not-failed; new `references/dispatch-pack.md` + `codex-completion-schema.json`; observability recipe synced; Luna flag-composition probe task) · **B3** projection convention (apex-skill-author 1.8.0: selective cards, generated-not-duplicated, gates = Terra RED baseline + trigger-eval CSV + validation checklist; new reference). 3 parallel apex-spec-reviewer passes (vs apex-skill-author) caught 2 real line-cap BLOCKs (`sources:` +1 uncounted on files at exactly 500/500) + a wrong-file pointer — all fixed; Iron Law at the lightweight tier per standing convention, deviation explicitly accepted in each spec. Gate passed → specs in docs/changes/, then **EXECUTED directly in planning on user approval** ("apply directly" — cross-repo ~/.claude+~/apex writes ruled out a single Codex dispatch): apex-plan **1.31.0** · apex-code **1.28.0** · apex-skill-author **1.8.0** · AGENTS-template + spec-template · 3 new references + `codex-completion-schema.json`; all acceptance criteria verified green incl. the live **Luna probe — `--output-schema`+`--json`+`-o` compose, exit 0, schema-valid `.final`**; specs → done/, SKILL-HISTORY ×4 rows. **Also fixed stale overview.md** (coding-mode line still said DeepSeek Flash; +ADR-027/031/032 shaping rows). **PART 2 — Phase C same-day (user: finish everything before Fable access ends ~07-12): ADR-032 (role split: Sol plan-check + offer-only ≤2-round deliberation [accepted/withdrawn-with-cited-evidence/DISPUTED→user] · Sonnet 5 default build host · cross-family review routing · Sol escalation rung) + 3 specs authored → 4 fresh-context reviews (2 BLOCKs fixed: governance adjacent-contradiction, Iron-Law surfacing) → applied C1 → LIVE-FIRED the new Sol gate on C2/C3 (proving run, `gpt-5.6-sol` effort max, schema-constrained): both returned BLOCK with substantive catches — the launcher (`apex-opus` pins ANTHROPIC_MODEL=opus) meant the spec was prose-only (missing producing mechanism!), ExecutionPolicy Bypass needed, always-on reviewer + wave-reviewer had no Opus pin, 5 'inline' residue sites, GRAY-fork wording could bypass the L2 user gate — ALL resolved into the specs, then applied: ✅ committed ~/.claude `bc9815e` · ~/apex `c201313`: apex-plan 1.32.1 + references/sol-plan-check.md · apex-governance 1.15.0 (Sonnet host canonical, verify-loop owner, fresh-worker Opus fallback) · apex-orchestrate 1.7.0 + hook (coding-branch host text; planning residue purged incl. retired-ADR-020 sentence) + global/project CLAUDE.md + BACKEND-ROUTING + status-template + NEW `apex-build` launcher (Sonnet) / `apex-opus` = deliberate Opus host · apex-code 1.29.0 (Sol rung on verify-fail from current effort, rung logging, GRAY→user never silent-Opus, cross-family review routing w/ wave-reviewer model:opus pin, fresh-worker fallback everywhere) + 3 reference syncs incl. B2's own dispatch-pack table. Hook smoke-tested green both branches. Iron Law ran at the lightweight tier throughout (standing convention `iron-law-application-depth`) — deviation surfaced, not baked. Caps held: apex-plan + apex-code both exactly 500/500. 🟡 uncommitted: see In-Flight row.) 2026-07-10 (session 64 — **PART 2: GPT-5.6×APEX deep research + full-set Sol review + Phase A executed.** 12 parallel workers (6 `codex exec -m gpt-5.6-sol` cluster reviews over all ~50 skills · 3 Sonnet web researchers · 3 Sonnet host-side reviewers) → **report `docs/research/gpt56-apex-integration/README.md`**. Verdict on user's target split (Opus plan / Sol plan-check / Sonnet orchestrate / Terra code): **adopt with 2 amendments** — reviews stay cross-family (Claude reviews Terra code; Sol reviews plans + Opus-fallback code) and the escalation ladder gains a Sol rung (Terra effort-bump → Sol → Opus; REVERSED the report's initial Sol-can't-code read after a user-challenged deep-dive: SWE-bench-Pro gap is contested/harness-dominated, AA's Codex-harness index has Sol(max)=80 leading Opus 4.8 at lower per-task cost). **Headline structural finding: the propagation gap** — impl.md enforcement never reaches Codex (dispatch prompt omits it, AGENTS.md § Conventions is a stub) → three-layer fix = thin AGENTS.md + selective generated `.agents/skills/` + structured dispatch pack (Phase B). **Probes:** Sol/Luna resolve; effort `max` AND `ultra` accepted on ChatGPT auth (`-ultra` model ids API-key-only); headless repo-local `.agents/skills` pickup **PROVEN** (scratch-repo skill discovered + applied). **Phase A EXECUTED** (3 agents): frontmatter enum `planning|coding`, vision-residue rewrites (apex-ui-testing 1.6.0 actively-wrong blindness claims; apex-figma 1.2.0 full ADR-027 pass + agent desc), effort ladder `…|max|ultra` + retry `…→max`, apex-ai-systems landscape restamp, apex-system-design copy-paste bug removed. 🟡 uncommitted (~40 ~/.claude files + apex research dir/SKILL-HISTORY/status + 1 Artemis BACKLOG line). **Queued: Phase B specs** (AGENTS.md population · dispatch-pack contract+output-schema · spec-template intent block · .agents/skills projection convention w/ trigger-eval gate) · **Phase C** (Sol plan-check gate **+ cross-model deliberation mode** — high-risk specs only, user-triggered/host-suggests-and-asks every time, ≤2 rounds, disputes→user not consensus; Tier-2 blind dual-draft user-invoked only · Sonnet-host hardening+flip · review routing) · watch-items (Fable bundled-access end ~07-12 · Codex memories vs status.md · Figma-MCP-in-dispatch auth probe · MCP schema-tax measurement · Terra-as-explorer tension · ultra vs max eval). MCP decisions: casual consults = Terra via deferred `codex mcp-server` registration, formal gate = Sol subprocess (independence); dispatch profiles stay MCP-lean; MCP-in-hosted-agents parked → Artemis BACKLOG.) **Coder model swapped `gpt-5.5` → `gpt-5.6-terra` (draft Stage-2 default-tier move; access gate LIFTED).** Probe: `codex exec -m gpt-5.6-terra` on codex-cli 0.142.5 → server recognised the id but demanded a newer CLI; upgraded `@openai/codex` → **0.144.1** → Terra resolves + answers; effort dial (`-c model_reasoning_effort`) confirmed working against it. Swapped every live `gpt-5.5` pin: apex-code SKILL + 3 refs (observability/parallel-codex/codex-review) · apex-plan SKILL + model-routing ref · governance/orchestrate/skill-author/ui-ux-design SKILLs · status-template · global+project CLAUDE.md · BACKEND-ROUTING · backend-session-start.ps1 · `~/.codex/apex-coder.config.toml` + canonical setup toml · PS-profile `codex-code` launcher. REVIEW-ENSEMBLE-DESIGN historical run-record line kept at 5.5. Terra ≈ gpt-5.5 quality at ~½ cost ($2.50/$15 vs $5/$30). **Draft stays open for Stage 1 (`max` effort enum — now unblocked, trivial) + Stage 3 (`ultra` eval) + Sol/Luna tier menu.** ✅ committed incl. session-63 carryover: ~/.claude `a9def62` · ~/apex `f792b92`.). 2026-07-09 (session 63 — **Fable-emulation absorption pass (Fable-5 system-prompt leak + "How I Make Opus Think Like Fable" video) → `docs/research/fable-emulation-analysis.md`.** Finding: the leak is consumer-chat plumbing (the intelligence isn't in the prompt) and the video's five moves dedup near-totally to shipped APEX mechanisms — his Fable-orchestrator/Sonnet-worker ≈ Fable/Fable A/B result is **external validation of config A** (Opus-plan/Codex-build/Opus-verify pool economics) and of the ADR-027 collapse (one frontier coder + ADR-030 effort dial beats a routing tree). Adopted the single survivor: **apex-plan 1.30.0** — deliverable post-mortem trigger in the handoff-drain learning loop (one-shot extraction while in context; ADR-011 rail unchanged; net-zero lines, 500 cap held). Declined: "Fable mode" skill (dup + RED-class prose + rival-workflow seed), leak micro-rules (all dedup), taste-scored model table (revives ADR-027-killed complexity). **Watch-item:** `coder_effort` means nothing to the Opus inline fallback — map only if a real fallback build over/under-thinks. ✅ committed with session 64: ~/.claude `a9def62` · ~/apex `f792b92`.). 2026-06-27 (session 62 — **Codex reasoning-effort dial + chat progress pulses (ADR-030) + GPT-5.6 watch.** (1) **Effort dial wired** as a per-spec lever: spec `coder_effort` frontmatter `{low|medium|high|xhigh}` → `-c model_reasoning_effort` on every `codex exec` (default `medium`, no regression); verify-fail retries bump effort one notch before the Opus model-fallback; `gpt-5.5` stays the single model, `gpt-5.4-mini` cheap tier **deferred** (re-adds the per-task routing ADR-027 collapsed). (2) **Progress pulses DEFAULT ON** — the host posts a one-line chat pulse per check-in from the backgrounded Codex log (tail-in/one-line-out), fixing session 61's file-only "I still can't see anything" gap (zero-token self-serve tail wasn't visibility). apex-code **1.27.0** · apex-plan **1.29.0** · spec-template · ADR-030. All committed: ~/.claude `35f6343` · ~/apex `c5294d7`. (3) **GPT-5.6 "Sol" (preview, 2026-06-26) → access-gated DRAFT** `docs/drafts/gpt-5.6-family-adoption.md` (committed ~/apex `5b1907a`). Family tiers **Sol/Terra/Luna** + new **`max`** effort + **`ultra`** (in-model subagents) — NOT a ready spec: limited preview (~20 partners), unverifiable on our auth. Staged surface: S1 `max` effort (trivial enum extend), S2 tier menu (revives the deferred model-tier — Terra ≈5.5 at ½ cost as possible default?), S3 `ultra` EVALUATE-not-bake (overlaps ADR-028/029 wave parallelism). Promote when `codex exec -m <gpt-5.6 id>` resolves on our auth.). 2026-06-25 (session 61 — **Codex coder-side hardening + one-shot-build planning.** (1) **Build-arrangement confirmed (x5 plan):** Opus-plan / **Codex-build** / Opus-verify (config A) is correct — the heavy build phase runs on Codex's separate pool, the scarce Opus pool reserved for plan + verify + fix iterations; Opus-build/Codex-verify (config B) inverts the pool economics → never the standing default (full-Opus is a deliberate per-spec escalation, not config B). (2) **apex-plan 1.28.0 — batch-joinable spec design default** (lever #1 of the one-shot-long-build initiative → memory `one-shot-long-build-initiative`): split-rule nudge + readiness-gate checkbox make planning author every spec file-disjoint + `## Prerequisites`-ordered so a queue drains as ADR-028/029 parallel waves; shared-substrate gotcha (types/barrel re-export/schema/route-registry) homed in spec-template (RED probe: obvious disjointness is model-native — only the *default* + the *substrate class* earn lines). (3) **apex-code 1.26.0 — Codex live observability:** every `▸codex` dispatch backgrounded with `--json`→tailable `docs/progress/codex-<task>.log` + `-o` final-message-only (fixes "Codex builds and I'm blind" at ~zero host tokens; log doubles as a Codex token meter); corrected the false ADR-029 supervision-gate "watchability" rationale → it's about *intervention*, the log gives visibility either way; proven live on codex-cli 0.141.0; new `references/codex-observability.md`. (4) **Docs:** Codex writes none by design — Claude docs-agents handle post-build (~15-35k tok/build, minor); inline-docs-to-Codex move **designed but DEFERRED** (user: not worth it at current build volume). All committed: ~/.claude `8669ee3`+`c6e64f9` · ~/apex `a5a4381`. **Remaining one-shot-build levers (candidates, unscheduled):** autonomy+permissions preset · context-discipline pass · headless-autonomous (Mac-gated).). 2026-06-22 (session 60 — **EXPLORATION: migrate APEX + all projects off Claude Code → OpenAI Codex.** Research-only, no decision. 4 parallel agents → `docs/research/codex-migration/` (README synthesis + `apex-surface` internal inventory + ws-a cli-core · ws-b extensibility · ws-c orchestration · ws-d models-pricing). **Verdict: technically very feasible, no make-or-break blocker** — the two primitives expected to kill it both have near-1:1 Codex equivalents: model-invoked **Skills** (same SKILL.md/description-match/progressive-disclosure, in `.agents/skills/`) + **blocking hooks** (SessionStart/PreToolUse-deny/PostToolUse/UserPromptSubmit, same JSON contract). Subagents (TOML agent types, parallel, max_depth=1), MCP, headless (`codex exec --json --output-schema`), memory all port. **2 reds:** Workflow fan-out = rebuild (Agents SDK / shell-over-exec + worktree isolation); the `ANTHROPIC_BASE_URL` dual-backend **does NOT port** (Codex = Responses-API-only since Feb 2026 → no Anthropic, DeepSeek=404 without a LiteLLM/OpenRouter gateway) — **but it mostly *collapses*, not ports:** one frontier model (`gpt-5.5`, ~⅓ Opus cost) + reasoning-effort dial + cheap `gpt-5.4-mini` replaces the whole ADR-019/024/025 router; **native vision deletes the image-gate special-case (ADR-020).** Real work = compress ~70 skill descriptions under Codex's ~8k-char skills-index budget (biggest practical risk), collapse 35 impl.md into SKILL.md, rewrite 2 core hooks, slim CLAUDE.md under AGENTS.md's 32KiB cap. **KEY FIND: Codex CLI already installed + ChatGPT-authed here, already trusted for `orion-assistant`.** **Recommendation: pilot ONE project, port the minimum loop, run a real build, compare — then decide full-vs-hybrid; do NOT big-bang 53 skills.** User framing = exploration / decide-from-research / analysis-only. settings.json got 6 OpenAI/Codex WebFetch domains pre-authorised (🟡 uncommitted).). 2026-06-21 (session 58 — **NEW INITIATIVE: complexity-routed multi-model coding → ADR-024.** Researched (4 parallel Sonnet retrieval agents → `docs/research/model-routing/` ws-a–d + README synthesis) + designed + ADR'd a **per-task coding model-router** across {Opus 4.8, Sonnet 4.6, DeepSeek V4 Flash, V4 Pro}; planning stays Opus. **Key research:** (1) `ANTHROPIC_BASE_URL` is session-level — no per-subagent backend, so within-backend `model:` switch is free but Anthropic↔DeepSeek crossing needs restart/headless/gateway; (2) DeepSeek text-only → **image = hard Claude gate**; (3) interactive Claude coding **shares + starves the planning subscription pool** (Opus weekly cap = scarcest resource), headless `claude -p` = isolated+budget-cappable; (4) route-first beats pure cascade (WS-C). **Design:** 2-step select (eligibility filter → cheapest-eligible-that-clears-the-complexity-bar), collapsed tree {text → Flash/Pro · image → Sonnet/Opus}, **Sonnet = image-only tier** (Pro strictly dominates it on text), **Pro = proactive text ceiling** (Opus for text only via gated escalation on a real Pro verify-fail). **Decisions:** F1 interactive+manual backend-swap (v1; no budget-cap, accepted) · F2 complexity-gated Opus · F3 auto-escalate-within-backend / approval-gate-before-Claude-cross · per-task unit · Verification-Recipe = quality floor. Extends `coder_tier`/ADR-019. Cost basis = hybrid (marginal cash + rate-limit budget). **Implementation Phases 1–2 landed** (templates `coder_models` menu + `apex-plan` 1.23.0 `§ Model-routing build planning`); **+ADR-025 Claude coding mode** (3rd operating mode — `APEX_MODE=coding` on Anthropic backend → Sonnet/Opus coder, write-guard relaxed, soft pool guard). Remaining: P3a safety-critical hooks + orchestrate/governance · P3b apex-code dispatch + apex-build-wave.js · P4 triple-write (see In-Flight). User's Fable-5 second pass gated on export-control lift (blocked 2026-06-12). **PAUSED for the night.** Uncommitted: ADR-024, `docs/research/model-routing/`, `~/.claude/settings.json` (8 research domains pre-authorised).). 2026-06-21 (session 57 — drained the Phase-2 dontAsk re-run: **E/F1/F2 all PASS** → classifier-SPOF Open Question **FULLY RESOLVED**. Workflow-dispatch builds run end-to-end under `dontAsk` (orchestration tools allow-listed, gated by `permissions.allow` not the classifier); workers **inherit** `dontAsk` (local denials). Folded into apex-code 1.17.2 step 1a; spec → `done/`. Minor non-blocking follow-up logged: Worker-2 intermittent Bash denial under `dontAsk`. Throwaway torn down. Evidence `docs/probes/phase2-results.md`. **Then closed the CC-workflows absorption pass:** landed both absorbs as direct skill edits — worktree isolation (apex-code 1.18.0 dispatch-rule + `isolate` arg through `apex-build-wave.js`; apex-governance 1.10.0 AFK default) + `/code-review ultra` recommended high-risk gate (apex-code report line + apex-governance § Ultra review gate); Edit-Mode plan-mode DECLINED; autonomous gap #4 KEPT DEFERRED. Both absorbs want 1 `coding-session` validation. Also flipped the now-discharged "Option C end-to-end unproven" caveats → PROVEN by the Phase-2 build. **Resolved the parked loop/entropy guardrail (evidence-grepped, no skill edit):** both angles of the retry-loop critique are already enforced — reliability-decay by bounded-retry+backoff+jitter+capped-attempts (apex-jobs/apex-system-design/apex-coding-principles) + circuit breakers (apex-system-design) + the ADR-015 one-retry cap on the agent's own loop (apex-code); state-contamination by idempotent handlers (×3 skills) + idempotency keys + DLQ (apex-jobs/apex-system-design) + the failed-edit-apply→STOP-don't-continue rule (apex-coding-principles) + reproduce-first/one-hypothesis (apex-debug). A new abstract "state-contamination anti-pattern" would be redundant content (fails the Iron Law RED bar; removal-over-prohibition). Closed — no named guardrail added. Also cleaned up: deleted the stale apex-nextjs pre-drafts (skill already shipped v1.0.0/validated 2026-05-31). **+apex-research 1.4.0** (§ Web access under dispatch — background Phase-2 agents can't approve novel `WebFetch` domains → planning pre-authorises domains before dispatch + `NEEDS-DOMAIN` flag; model contract intact, cheap tier still does every fetch; +memory [[background-agents-no-interactive-approval]]). **+ADR-023** (pre-authorise-before-dispatch invariant — consolidates the 3 non-interactive-deny findings this session: dontAsk allowlist completeness, worker inheritance, background-agent web-deny; off-allowlist = silent deny, fail-loud corollary).). 2026-06-20 (session 56 — drained the Phase-2 coding probe (`docs/probes/phase2-results.md`, copied into the APEX repo): **E PASS** (`Bash(<cmd>:*)` prefix rules admit real recipe invocations); **F1/F2 INCONCLUSIVE** — the seed allowlist never included the orchestration tools, so `Workflow`/`Skill` were denied and no worker spawned. Key read: both denials were the **local** "don't ask mode" form, NOT "cannot determine the safety" → these tools are gated by `permissions.allow`, not the classifier → allowlisting unblocks; SPOF stays eliminated. F2 (worker `dontAsk` inheritance) remains the one open unknown. Re-run prep queued in the spec's new §D — expand throwaway allowlist (`Workflow/Agent/Task/Skill`), reset the 4 hand-made files, relaunch `dontAsk`. **PAUSED for the night.**). 2026-06-20 (session 55 — drained the coding handoff: dontAsk SPOF Phase-1 empirically validated (4/4 probes PASS, classifier never invoked); cleaned probe artifacts from `settings.local.json` (`rm`-deny + `docs/probes/**` allows); moved `validate-dontask-spof.md` → `done/`; Phase 2 E/F folded into the first-workflow-build open question; +memory `dontask-probe-cleanup-paradox`). 2026-06-20 (session 54 — cleared Pending table after session-53 build; UI-workflow absorption pass (6 agents → `docs/research/ui-workflow-absorption/`): GSAP/Stitch/taste/impeccable already-have, hyperframes+remotion=video out-of-scope → only a Stitch factual correction landed (apex-ui-ux-design 1.23.1), useGSAP rejected by RED probe; classifier-SPOF Open Question RESOLVED → spec `classifier-spof-dontask-mode.md`; 6th agentic-OS memory video → REJECT for APEX (ADR-021/011), 1 Artemis backlog line). 2026-06-20 (session 53 — logged Open Question: permission-classifier ↔ coding-backend SPOF; both ride `deepseek-v4-flash`, so a DeepSeek blip gates workflow/subagent writes. Surfaced building express-waves-as-workflow; live-probe confirmed transient blip not outage). 2026-06-20 (session 52 — Workflow tool DECISIVE TEST PASSED on DeepSeek; Option C confirmed native; user decision C-supersedes-A: retired spec A, kept B + retire-dead-pipeline, moved verify probe → done/. Next: author the Option-C workflow-script spec). 2026-06-19 (session 50 — homed the P6-maths context-exhaustion backlog into In-Flight: ADR-015 return-contract violation in `apex-coder.md` Step 5 + launch overhead; scope A/A+B/A+B+C parked. Was mis-logged to the stale `~/.claude/docs/status.md` fossil). 2026-06-17 (session 49 — Pro coder tier EMPIRICALLY VALIDATED: a real DeepSeek V4 Pro build ran end-to-end on Windows; status corrected — Pro tier proven live + eval head-to-head re-tagged `coding-session`-gated not Mac-gated. Session 48 — Impeccable absorption pass CLOSED: prose four RED-probe-rejected; 44-rule deterministic detector ADOPTED as opt-in web-UI advisory reference → ADR-022)
_Last updated by coding mode:_ 2026-06-16 (session 43 — built pro-mode-mechanics: PowerShell toggle, hook tier detection, SKILL.md status line, BACKEND-ROUTING docs)

<!-- CODING:START -->
## In-Flight
| What | Mode | State | File | Stopped at | Uncommitted |
|------|------|-------|------|------------|-------------|
| **GPT-5.6 × APEX integration (Phases B–D)** | planning | 📋 Phase A ✅ · **Phase B ✅ + Phase C ✅ EXECUTED (session 65, applied directly)** — ADR-031/032; apex-plan 1.32.1, apex-code 1.29.0, apex-skill-author 1.8.0, apex-governance 1.15.0, apex-orchestrate 1.7.0 + hook + launchers + mode docs; Luna schema probe PASSED; **Sol plan-check gate live-fired on C2/C3 (proving run: 2 real BLOCK verdicts, launcher-mechanism + ExecutionPolicy + routing-gap catches — all resolved before apply)**; hook smoke-tested green; 6 specs → done/ | `docs/research/gpt56-apex-integration/README.md` §4 · ADR-031 · ADR-032 | **Next: Phase D watch-items + remaining proving runs** — first real Sonnet-hosted build (`apex-build`) validates the host flip; first `▸codex` build = dispatch pack + completion contract; first spec-ready in a real project = AGENTS.md population; first card projection (Artemis bound-stack) = projection gates; first Sol-rung escalation. Watch: **Fable bundled-access end ~07-12 (verify live, then update planning-model line)** · ultra-vs-max eval · Codex memories vs status.md · Figma-MCP auth probe · MCP schema-tax. **Open Question (Sol FLAG, accepted debt):** apex-code/apex-plan likely exceed the 5k-token half of the SKILL.md cap while at exactly 500 lines — future trim pass. | ✅ ~/.claude `bc9815e` (18 files) · ~/apex `c201313` (13 files); PS profile host-local (uncommittable by design); status.md committed pre-SHA-update (this row's ✅ rides the next commit) |
| **GPT-5.6 vs Claude model-usage review + swarm design (session 66)** | planning · research | 📋 **parked — user revisits in ~1–2 weeks (≈2026-07-25) when more GPT-5.6 capability data lands.** No specs authored, nothing applied. | `docs/research/gpt56-vs-claude-model-usage/README.md` (+ `opus-position.md` + 3 `evidence-*.md`) | **Opus×Sol Tier-1 deliberation done (ADR-032), high consensus, NO disputes → user.** Sol agreed against its own family twice (planning stays Opus; Ultra rejected). **4 amendments pending, unapplied:** **A1** make Sonnet 5 the Claude coding fallback (Opus→GRAY/judgment-only rung) [MED-HIGH] · **A2** wave concurrency default 3→2 + token/$ guardrails (warn70/stop100, no nested spawn, one retry, approval >~3× serial) [HIGH] · **A3** Terra-vs-Luna-vs-Sol(low) coder bakeoff (verified-completions-per-$; Terra stays until measured) [needs eval] · **A4** cheap-worker tier (Luna/Haiku, *test-rich+file-disjoint+fixed-interface only*, role-tier not routing-tree) — needs its own ADR+eval before baking [promising/unproven]. **Confirmed unchanged:** Opus plans+architects, Sonnet/Haiku retrieval + Opus synthesis, Terra default coder, Sol plan-check, cross-family review, worktree isolation, Ultra NOT the swarm mechanism. **Swarm answer:** APEX's wave dispatch already IS the recommended swarm; accelerate via A4+A2, not Ultra/bigger fleets. | ✅ apex `635099d` (report dir + status row; this SHA-update line rides the next commit) |
| **Cross-spec parallel build (ADR-029)** | planning · skill build | ✅ committed (apex `dac1447` · ~/.claude `cd9c3a3`) | `docs/technical/adr/ADR-029-cross-spec-parallel-build.md` | DONE + applied. Extends ADR-028 from within-spec to batch **"build specs"**: wave membership = dependency-independent (transitive `## Prerequisites`) **AND** file-disjoint (`## Files to Change` don't intersect). **Invariant found by a dry-run against Artemis's real specs:** dependency-independence ≠ file-disjointness (`SENS-carry-M3b`/`SENS-carry-M4c1` share no prereq edge yet both modify `ports/types.py` → checkout-integrate clobbers). One shared `max_parallel_codex` cap (not per-spec); conservative subtree handling for dir/fuzzy paths; per-spec integrate→verify→commit in dep order; **supervision gate** (high-risk specs `risk: high`/auth/security/data stay sequential+foreground even when disjoint — parallel backgrounds the subprocess + loses the live watch; opt-out so routine specs still parallelize); **no new spec tag**. **+ apex-code 1.25.0 wave-review `data` over-fire fix** (operation-tiered pass count: additive-DDL `schema.py` → single-pass, migration signals → dual; auth/security stay dual; `risk: high` forces dual — cuts Artemis Opus review tokens ~half on schema work). apex-code **1.25.0** (tight pointer, 499/500 cap) + `references/parallel-codex.md` cross-spec section; spec-template `## Prerequisites` comment (both fields build-load-bearing; apex-plan SKILL.md left untouched — already at its 500-line cap). **Open:** untested in a live multi-spec build (first such build = its proving run); **Artemis benefit gated on its mechanic-A migration** (existing `~/artemis/BACKLOG.md` item — a standalone per-spec runbook can't consume a spec DAG). | ADR-029 · apex-code SKILL + references/parallel-codex · apex-plan SKILL · SKILL-HISTORY |
| **Parallel Codex dispatch (ADR-028)** | planning · skill build | ✅ committed (apex `27295f9` · ~/.claude `c138bbf`) | `docs/changes/done/parallel-codex-dispatch.md` | **DONE:** ADR-028 + spec written + applied. apex-code **1.23.0** — `#### Parallel Codex dispatch` (fan out 2+ independent `▸codex` tasks as concurrent `codex exec` bg subprocesses, cap `max_parallel_codex`=3 auto-sized, worktree-per-task, `git checkout`-integrate not merge, integrated re-verify, quota-out→Opus fallback); mechanics → `references/parallel-codex.md`; templates gain `max_parallel_codex`; SKILL-HISTORY row. **Cap trim done** — extracted Permissions+audit detail → `references/permissions.md`; SKILL.md 508→495 (under the 500 cap). **mechanic-A-PROVEN recorded** in ADR-027 status line. **Open:** untested in a live multi-`▸codex` build (first such build = its proving run). **4 deferred Plan-A follow-ups — DONE ✅ committed (apex `c1386d7` · ~/.claude `f5add90` · artemis `d93bdef`):** (1) apex-plan **1.27.0** + spec-template + global CLAUDE.md — "DeepSeek can't fill gaps" rationale → separation-of-concerns/context-efficiency (disciplines kept); (2) ADR-020 **retired/moot** — coder is sighted (apex-governance **1.14.0** + apex-ui-ux-design **1.25.0** + ADR-020 header); (3) apex-skill-author **1.7.0** — "Flash floor" → Codex/Opus floor; (4) Artemis runbook→mechanic-A logged to `~/artemis/BACKLOG.md` (project-boundary respected — Artemis planning session drains it). | ADR-028 · spec · apex-code + references · templates · SKILL-HISTORY · ADR-027 · ADR-020 · apex-plan/governance/skill-author/ui-ux-design · CLAUDE.md · ~/artemis BACKLOG |
| **Plan A — Codex-primary/Opus-fallback/DeepSeek-archived (ADR-027)** | planning · skill build | ✅ committed (~/.claude `8213ec9`+`10ad3cb` · apex `b55b12b`) | ADR-027 + ~20 files | DONE + committed. Mechanic A proven live today (codex dispatched per task). PS profile (host-local, uncommittable) parked DeepSeek launchers + added `apex-opus`; reload with `. $PROFILE`. | — |
| SP2 agent-wiring — coding-side | wave domain review | Done | `apex-wave-reviewer.md`, `apex-code/SKILL.md` | — | ✅ 427da16 |
| Step-4 prompt-to-design walkthrough | planning · discussion | parked | `apex-ui-ux-design` § Prompt-to-design lanes | **Clarified session 42 (verified never-started, no progress lost):** the 6-step lane splits — steps 1,2,4 (screen brief → author Bitrig generation prompt → fold into design-brief) are **Windows-runnable now**; only step 3 (run Bitrig) + step 6 (Xcode-Preview visual gate) are Mac-gated. **Next:** do the planning half as a dry-run — author a real Bitrig generation prompt for a chosen SwiftUI screen. **Open Q:** target a real Artemis screen or a throwaway sample? | — |
| Design-capability build (6 bundles) | planning · skill edits | ✅ committed (apex `252ebeb` · ~/.claude `fc61075`) | `docs/research/design-capability/README.md` | All 6 bundles landed + committed (session 35 corrected a stale "uncommitted" mark). Remaining = USER actions only, non-blocking: disconnect Canva connector (Claude app → Connectors), set up free Google Stitch account. | — |
| headroom+ponytail absorb pass | planning · research | ✅ closed · 0 skill edits | `docs/research/headroom-ponytail/` | Flash probe judged (2026-06-15): Task 3 structural trap 0/3 over-built → ladder model-redundant on the real coder, NOT absorbed. headroom dropped; ponytail comment-convention declined; ladder declined. Pass closed permanently. | — |
| pro-mode-mechanics (Phase 0) | coding · implement | ✅ complete | `docs/changes/done/pro-mode-mechanics.md` | All 8 changes implemented — 4 files touched | ✅ 0c415a7 |
| **UI cheap-mockup workflow editing** | planning · skill edits | ✅ committed (~/.claude `de02dfb`,`a730b23` · apex `4bebd88`) | `apex-ui-ux-design` v1.22.0 | Done — UI design workflow built out: ask-first research gate, TASTE step-0, Cursor in-editor mockup preview (Chrome only for multi-variant side-by-side), design→build **archetype-not-page** handoff rule, +3 reference galleries (Awwwards / layers.to / 21st.dev) on Path A. Per-edit detail → git + SKILL-HISTORY. **Optional follow-on only:** comparison `index.html` for true side-by-side variant view. | — |
| **UI design "layer stack" model** | planning · discussion | ✅ residue codified · taxonomy declined (✅ ~/.claude `2411044` · apex `0bec533`) | `apex-ui-ux-design` SKILL 1.23.0 · `docs/research/app-design-ai-era/` | **Researched (3 Sonnet agents) + codified the small residue.** Finding: the L0–L5 layer stack ≈ design tokens + Atomic Design — **canonical/model-redundant → NOT codified** (taxonomy RED-excluded). AI era changes *enforcement + sequencing*, not structure. **Codified into the design→build handoff block:** (1) promote-early/rule-of-one (AI inverts human rule-of-three; drift = component-multiplication); (2) in-repo+inspectable contract (agents ignore imported deps); (3) consistency = 3 gates that only work together (prose-rich brief → commit lint/ADR-022 → visual gate). Rule-of-two debate **resolved** (inverts under blind builder; real lever = enforcement not threshold). **Open Q (unresolved):** does *register* (brand vs product) gate which layers matter? **Optional:** still battle-test on Amazo for further corrections. | apex-ui-ux-design/SKILL.md · SKILL-HISTORY · status · docs/research/app-design-ai-era/ |
| **Impeccable absorption pass** | planning · research/absorb | ✅ done · ADR-022 (✅ ~/.claude `e0b43c7` · apex `027d428`) | `apex-ui-testing` impl 1.5.0 · `apex-ui-ux-design` SKILL 1.22.1 · ADR-022 | **CLOSED.** Report `docs/research/impeccable/` (extraction @1268f10 + absorption-report). **Prose four** (reflex test, colour-commitment axis, cream OKLCH, reveal-gated-on-class bug) → **REJECT**, all reproduced cold by 2 bare-agent RED probes (model-redundant for a planning skill). **26-command arch / extension / scripts** → REJECT (HIGH cost / rival workflow / out-of-scope). **Detector** (44 deterministic LLM-free rules, zero-dep CLI+hook) → **ADOPTED as opt-in, web-UI-scoped, advisory external reference** in apex-ui-testing/impl.md + planning pointer; ADR-022 (refines ADR-012 P3.3 — image-blind-coder framing). **Validation gate:** unproven until first real web-UI coding build (no web-UI project in the APEX repo itself; `coding-session` gate, not Mac-gated). | apex-ui-testing/impl.md · apex-ui-ux-design/SKILL.md · ADR-022 · SKILL-HISTORY · status |
| **Context-exhaustion on parallel builds** | coding · all 3 specs | ✅ all committed | — | All 3 specs built & committed: C (workflow dispatch) + B (fan-out cap) + retire pipeline. C's end-to-end behaviour **PROVEN** by the Phase-2 `wave_dispatch: workflow` build (session 57, 2026-06-21 — workflow dispatched → parallel workers → green verify). | ~/.claude `42c86ae` · apex `c380767` |
| **CC-workflows absorption pass** | planning · research/absorb | ✅ closed · both absorbs landed (session 57) | `docs/research/cc-workflows-absorption.md` | **CLOSED.** Decisions: (1) landed the 2 absorbs as **direct .md edits** — worktree isolation → apex-code 1.18.0 (dispatch-rule + `isolate` arg through `apex-build-wave.js`) + apex-governance 1.10.0 (AFK default); `/code-review ultra` recommended high-risk/pre-PR gate → apex-code 1.18.0 report line + apex-governance 1.10.0 § Ultra review gate (recommend-only, reject `--fix`). (2) Edit-Mode plan-mode → **DECLINED** (spec-split + readiness gate already cover it). (3) Autonomous/scheduled gap #4 → **KEEP DEFERRED** (Mac-Mini-gated; worktree = its down-payment). §4 dynamic-workflows/Option-C already discharged (native on DeepSeek + Phase-2 proven). **Both absorbs want 1 `coding-session` validation** (build-artifact collision is real-world) — not a build gate. | apex-code/SKILL.md · apex-governance/SKILL.md · apex-build-wave.js · SKILL-HISTORY |
| **Multi-model coding router (ADR-024/025)** | planning · skill build | ✅ Phases 1–4 DONE | `ADR-024`, `ADR-025`, `docs/research/model-routing/`, `apex-plan/SKILL.md` | **DONE:** P1 config surface (`coder_models` menu + per-task `▸model` tag; default `[flash]`); P2 `apex-plan` **1.23.0** (`§ Model-routing build planning`). **P3a (session 59, 2026-06-22):** safety-critical hooks + **3-mode truth-table tested green (12/12 PASS)** — `backend-pretool-write.ps1` relaxes write-guard **only** when `APEX_MODE=coding` (planning byte-identical); `backend-session-start.ps1` 3rd branch (Claude coding + Sonnet-default + soft pool guard); precedence `deepseek`>`APEX_MODE=coding`>planning; `~/.claude/CLAUDE.md` mode table + §5; `apex-orchestrate` **1.5.0** (§ Step 3.5); `apex-governance` **1.11.0** (§ Coding model routing & soft pool guard). **P3b (session 59):** `apex-code` **1.19.0** (§ Model-routing dispatch — tag→backend+model table, per-worker override, backend-wall one-swap prompt, + model-escalation-on-verify-fail: within-backend auto / cross-backend gated, one-retry cap) + `apex-build-wave.js` per-worker `model`. **P4:** SKILL-HISTORY triple-write done; committed. **Open validation (`coding-session`, not a build gate):** the per-worker DeepSeek `flash`↔`pro` override is unproven on the live proxy → apex-code 1.19.0 falls back to session-default + logs if a worker rejects it; the full router (route→batch→swap→escalate) wants one real multi-model build. **Decisions:** per-task · Sonnet=image-only · Pro=text-ceiling · F1 interactive · F2 complexity-gated-Opus · F3 auto-within/gate-cross · soft pool guard · APEX_MODE=coding signal. | ✅ committed: ~/.claude `2abd554` · apex `<this commit>` |

<!-- CODING:END -->

<!-- PLANNING:START -->
## Pending Specs
| Spec | Summary |
|------|---------|
| _none_ | — |

_ADR-033 "safe unattended builds" initiative — COMPLETE. All 4 specs (afk-permission-mode, afk-durable-dispatcher, afk-sol-endgate, cadence-regression-lenses) built and archived to done/ in one continuous coding session (session 68, 2026-07-12) — the user stepped away partway through and the build drained the full remaining queue unattended._
_Session 68 (2026-07-12) → `done/`: `afk-permission-mode.md` — built (Sonnet host, Terra coder), all 7 tasks + Task 6 integration test + required cross-model (Opus) security review (3 post-review BLOCK fixes), all live-verified. `afk-durable-dispatcher.md` — built (Sonnet host, Terra coder), durable codex-dispatch wrapper (stdin-closed launch + run ledger + no-output watchdog + `-Adopt`), apex-code wired at exactly 500/500 lines, all criteria live-verified. `afk-sol-endgate.md` — built (Sonnet host, Terra coder for Tasks 1+3, host-direct for Task 2's net-neutral apex-code edit), standing end-of-run `gpt-5.6-sol` adversarial pass (A1) wired before the handoff step, all criteria live-verified (caps held: 499/160/263 lines). `cadence-regression-lenses.md` — built (Sonnet host, Terra coder for Task 1, host-direct for Task 2's net-neutral apex-code edit), silent-regression review lenses (A2, `references/silent-regression-lenses.md` + `codex-review.md` pointer) + invariant-freshness pre-flight check (A3, § Karpathy Pre-Flight step e), all criteria live-verified (`apex-code/SKILL.md` exactly 500/500). See `docs/handoff/2026-07-12.md` (4 addenda)._

_Session 65 (2026-07-10) → `done/`: `gpt56-b1-planning-surface.md` · `gpt56-b2-dispatch-pack.md` · `gpt56-b3-skills-projection.md` · `gpt56-c1-sol-plan-check.md` · `gpt56-c2-sonnet-host.md` · `gpt56-c3-review-routing.md` — **Phases B + C EXECUTED directly in planning** (user: "apply directly" + "assume everything will be done today"). All acceptance criteria verified green incl. the Luna schema probe, the hook smoke test (both branches), and the **Sol plan-check live-fire on C2/C3** — its own proving run, which returned 2 substantive BLOCK verdicts (launcher-pins-the-model mechanism gap, ExecutionPolicy, always-on-reviewer routing gap, 4 "inline" residue sites) that were resolved before apply. 🟡 uncommitted._

_Draft (NOT ready — access-gated): `docs/drafts/gpt-5.6-family-adoption.md` — GPT-5.6 family (Sol/Terra/Luna) + `max` effort + `ultra` mode; promote to `docs/changes/` (or direct skill edits) when GPT-5.6 resolves on our Codex auth. See Open Questions._

_Session 60 (2026-06-22) → `done/`: `codex-reviewer.md` + `codex-ceiling-coder.md` — **Codex integration (ADR-026 P2) BUILT directly in planning.** 🟡 uncommitted. Codex reviewer + GPT-5.5 ceiling coder + family-aware review wired across apex-code/apex-plan/apex-governance + templates + apex-build-wave.js comment + ADR-024/025 supersession + triple-write. **Pilot PASSED (2026-06-22, evidence `docs/probes/codex-pilot-results.md`):** both halves proven on Windows — coder built files + pytest passed; reviewer returned schema-valid BLOCK on a planted bug. Fixed 2 pilot-caught bugs (stdin-pipe required; schema strict-mode). **Remaining: commit.**_

_Applied 2026-06-05 → `done/`: `taste-rules-distill.md` · `research-dispatch-recipe.md`. ✅ committed._
_Applied 2026-06-15 → `done/`: `coding-destructive-command-guard.md`. ✅ 4ffd85a._
_Applied 2026-06-16 → `done/`: `pro-mode-mechanics.md`. ✅ 0c415a7._
_Session 52 (2026-06-20) → `done/`: `verify-workflow-tool-deepseek.md` (PASSED). Retired (`git rm`): `coding-return-contract-enforcement.md` (Option C supersedes A)._
_Session 54 (2026-06-20) → `done/`: `classifier-spof-dontask-mode.md` — applied directly in planning (apex-code 1.17.0: `dontAsk` build-mode policy)._
_Session 55 (2026-06-20) → `done/`: `validate-dontask-spof.md` — Phase 1 (Probes A–D) all PASS on DeepSeek/`dontAsk`; classifier never invoked (SPOF structurally eliminated, safety floor intact). Evidence: `docs/probes/dontask-results.md`. Phase 2 (E/F: allowlist-completeness + subagent `dontAsk` inheritance) folds into the first `wave_dispatch: workflow` build — see Open Questions._
_Session 57 (2026-06-21) → `done/`: `validate-dontask-spof-phase2.md` — re-run after §D allowlist expansion: **E/F1/F2 all PASS**. Workflow-dispatch builds run end-to-end under `dontAsk` (orchestration tools must be allow-listed; gated by `permissions.allow`, not the classifier); workers **inherit** `dontAsk` (local denials, no classifier) → SPOF fully eliminated incl. the worker path. Folded into apex-code 1.17.2 step 1a. Evidence: `docs/probes/phase2-results.md`. Throwaway teardown pending._
_Session 53 (2026-06-20) → `done/`: `apex-code-fanout-cap.md` (B) · `express-waves-as-workflow.md` (C) · `retire-dead-coding-pipeline.md`. Built & committed (~/.claude `42c86ae` · apex `c380767`). C's first `wave_dispatch: workflow` build end-to-end proving run is **DONE** — the Phase-2 probe (session 57) ran it green._

## Agentic-OS video audit + memory-recall decision (session 46, 2026-06-16) — COMPLETE, ADR-021
Audited APEX against a YouTube "agentic OS" 9-pillar model → `docs/research/agentic-os-video-audit.md`:
**6 LEAD · 2 GAP · 1 DEFERRED.** APEX already leads/rejects-by-design on 7 (skills, tiered planning,
multi-client, output consolidation, portability, static context, self-learning=ADR-011). Only two
coding-relevant gaps: **#2 memory/semantic-recall** and **#4 scheduled/headless autonomous builds**.
- **#2 resolved → ADR-021 (keep flat, no semantic layer, trigger-gated).** Research (`docs/research/memory-recall/`,
  3 Sonnet agents, 6 primary sources) + Council deep-dive (`docs/findings/memory-recall-deep-dive.md`,
  3 blind voices, unanimous no-go). APEX's memory surface (~2–5K tok) is ~10× under the ~50K semantic-payoff
  onset; benchmarks show semantic memory loses to simple RAG at this scale; infra can hurt (+>20% cost,
  −3% success, ETH arXiv:2602.11988). Council corrected the framing: false binary — escalation = cheap
  markdown-native **Option C** (tag/alias frontmatter + tiered load + hybrid keyword over handoffs/ADRs),
  NOT claude-mem. Trigger: ~80–100 MEMORY.md entries / ~25K-tok load / a *named* recurring grep-vocab miss.
- **#4 + #8 researched → `docs/research/remote-autonomous/` (3 agents, 24 primary sources).** Verdict:
  both resolve via **native features, host-gated not infra-gated** — no VPS/dashboard build.
  - **#8 access-anywhere = largely SOLVED natively.** Channels (Telegram/Discord/iMessage) + Remote
    Control (full two-way + push notifs) + Dispatch + Web + Slack all real (VERIFIED, some research-preview).
    Downgrades #8 from the old "build a VPS layer" assumption. **Quick win available NOW on Windows**
    (v2.1.80+): phone access to interactive sessions, no host needed.
  - **#4 autonomous coding = path exists, Mac-Mini-gated.** Cloud Routines CANNOT run APEX coding
    (Claude-only, fresh-clone, won't honour the DeepSeek base-URL swap). Real path = **headless-local**
    (`claude -p`/`--bg` + DeepSeek base URL + ready spec + `dontAsk`+allow-list + `--max-budget`) on the
    always-on Mac Mini, with HITL/alerts over Channels. **Cost non-issue** — billed to DeepSeek's pool,
    NOT the Anthropic credit pool (billing-split applies to headless *Claude*, not *coding*). Defer build
    until host live; then one small spec wires the recipe + safety envelope.
  - **Video #2 (Chase AI) digested** → audit addendum: corroborates ADR-021 (flat markdown memory);
    dashboard/button idea solo-discounted; usable kernel = usage observability (low priority, bundle w/ host).

## agent-skills absorption + apex-research model contract (session 38, 2026-06-13) — APPLIED
Two pieces. (1) **apex-research 1.3.0** — hard **three-phase model contract**: Plan + Synthesise on
Opus/Fable (in-context), Retrieve on dispatched **Sonnet/Haiku**; the expensive model never does
mechanical retrieval (ADR-015 token rationale — bulky raw content stays in the cheap context).
(2) Compare-and-absorb over **addyosmani/agent-skills** (MIT, `d187883`; mostly peer-quality
already-have). A full **Iron-Law dogfood** ran on every absorbed addition (`docs/research/agent-skills-baseline/`)
— the rigor prior passes had been deferring as "flagged for rigor."
- **Kept (baseline-confirmed — model failed cold):** metric-honesty (apex-performance), source-grounding
  (apex-coding-principles), AI-slop patterns (apex-ui-ux-design). **Cheap keeps:** untrusted-data NEVER
  rules (apex-debug + apex-ui-testing), CONFUSION block (apex-code).
- **Cut as model-redundant** (bare agent produced cold): elicitation (apex-plan — also freed the
  500-line cap), deprecation section (apex-architecture), AI-perf anti-patterns (apex-performance SKILL).
- Reports: `docs/research/agent-skills-analysis.md` · `agent-skills-rejected-salvage.md` ·
  `agent-skills-baseline/SUMMARY.md`. Memory: [[absorption-red-probe-before-content]].
- **⚠️ Verify on Mac:** the apex-performance **impl** block (CWV tree / INP APIs / font-CLS / image) —
  haiku knew it cold, but DeepSeek Flash is the real executor (untestable on Windows). RED-probe Flash;
  cut ~90 lines/perf-build if Flash also produces it cold.

## Pro-mode initiative — Flash↔Pro coder tier (session 39, 2026-06-13) — Phase 0+1 done, gated on approval
Building a "Pro mode" so coding can run **DeepSeek V4 Pro** (stronger coder, ~3.1× cost —
`deepseek-v4-pro` $0.435/$0.87 per Mtok vs Flash `deepseek-v4-flash` $0.14/$0.28; same base URL;
confirmed live from api-docs.deepseek.com). Mirrors how Flash was built: reasoned + benchmark-grounded
on Windows, empirical eval deferred to Mac (not a gate). Full audit: **`docs/research/pro-mode-audit/`**
(README synthesis + ws-a evidence · ws-b apex-code · ws-c principles/impl · ws-d plan/governance).
- **Reshaping finding (WS-A):** almost all benchmarks are **Pro-vs-Opus, not Flash-vs-Pro** — only
  direct datapoint is ADR-016's ~11pp agentic gap. **No relaxation exceeds Medium confidence.** Some
  context-hygiene compensations get *worse* under Pro (3.1× cost, 384K output). Thinking-tier tension:
  "relax because capable" assumes a thinking mode whose `think-max` cost exceeds the 3.1× sticker.
  SlopCodeBench: scope/quality discipline erodes *more* in capable long-horizon agents → surgical
  scope matters as-much/more for Pro. Pro = linear-decay **middle tier** (above Flash floor, below Opus).
- **Audit result:** KEEP ~57 · RELAX-UNDER-PRO 8 · PRO-UNLOCK 3 (~80% KEEP = intended). Relaxes confined
  to spec-literalness + review-redundancy, each gated behind an existing escape hatch (`risk`, task
  independence, file-ambiguity). All correctness/security/safety/authority rules KEEP. WS-B+WS-D both
  note **autonomy level (L0–L5) is the cleaner lever for "more Pro autonomy" than rewriting safety rules.**
- **Design + reframe:** single `coder_tier` (flash|pro), no `if-pro` bloat. **RED probe (2 bare Opus
  agents) reproduced the full feature-splitting judgment cold** (seam, frozen contracts, conformance-
  tests-travel, tier-grouped order) → the discipline is **model-native**, so the skill encodes only the
  *plumbing* (policy/flag/build-plan convention), NOT R1–R5. v1 = **tier-aware splitting discipline with
  ZERO guardrail relaxation**; the Medium-confidence coder relaxations (audit Subset A/B) are deferred +
  optional, Mac-gated. Worked example + R1–R5 rationale: `docs/research/pro-mode-audit/spec-splitting-design.md`.
- **Per-project switch (user-requested):** `coder_tier_policy: flash | pro | split` in status.md —
  `flash`/`pro` = pure single-tier (no splitting/toggle); `split` = tier-aware. Default `flash` (backward-compatible).
- **✅ EMPIRICALLY VALIDATED (session 49, 2026-06-17):** a real Pro build ran **end-to-end on DeepSeek
  V4 Pro on Windows and produced working code** — the tier is now proven live, not just benchmark-reasoned.
  Supersedes the prior "empirical eval deferred to Mac" framing for the *tier itself*. Confirms the Pro
  toggle mechanics (PowerShell switch + hook tier-detection + SKILL.md status line, built session 43, `0c415a7`) work.
- **Phase status:** P0 mechanics **BUILT + committed** (`docs/changes/done/pro-mode-mechanics.md`, `0c415a7`); P1 audit done;
  **P4 splitting discipline LANDED** — ADR-019 + apex-plan 1.21.0 (§Coder-tier build planning) + apex-governance
  1.8.0 (tier=capability-not-authority) + spec-template `coder_tier` flag + status-template `coder_tier_policy`.
  ✅ committed (~/.claude 82523b3 · apex 9a8489f · artemis split-enable 5d16a1c).
  **Deferred:** orchestrate "switch-now" routing nudge (bundle with Phase-0 orchestrate edit); Subset A/B coder
  relaxations + eval-harness Flash-vs-Pro head-to-head (ADR-016 P1) — **`coding-session`-gated, not Mac-gated**
  (a DeepSeek Pro coding session runs on Windows, now proven); not a build gate.

## DeepSeek-V4 paper read — coding reasoning-effort resolved (session 40, 2026-06-13) — APPLIED (doc corrections)
Read the previously-uncited **58-page DeepSeek-V4 technical report** (HuggingFace) + DeepSeek live
API docs against APEX's Flash/Pro coding assumptions. Full analysis:
**`docs/findings/deepseek-v4-paper-vs-apex-coding-assumptions.md`**.
- **Key resolution:** APEX coding runs at **Flash-Max** (Pro toggle = **Pro-Max**) — DeepSeek enables
  thinking by default and **auto-sets effort to `max` for Claude Code**; APEX sets only the model
  string and cannot currently request a lower tier (`budget_tokens` ignored over the Anthropic
  endpoint). So the weak-coder compensations are calibrated against Flash's *ceiling*, not a weak
  default → **keep them; 0 skill edits.** The first-draft "enable Think-High" idea is withdrawn.
- **Corrections landed** (.md, 🟡 uncommitted): `model-specific-skill-authoring` (re-research
  discharged), `pro-mode-audit` ws-a + README (the "no Flash↔Pro comparand" caveat is **FALSE** —
  report Table 7 is the head-to-head; re-score ceilings vs Flash-Max→Pro-Max), `model-comparison`
  README (think-max = default state, not hypothetical; comparand is Opus 4.5/4.6 not 4.8),
  `BACKEND-ROUTING` (thinking-mode line).
- **Mac-gated follow-ups:** (a) confirm on the wire that coding responses carry `<think>` at max
  effort; (b) **effort-down cost lever** — expose `output_config.effort: high`/non-think for
  simple/low-risk specs (Pro-Max is the 3.1×++ corner + feeds the survey-named "over-thinking");
  APEX cannot express it today. Would touch pro-mode-mechanics toggle + spec-template (likely reuse
  `risk: low`) + apex-plan + governance.

## Coding-capability conflict pass (session 34, 2026-06-12) — APPLIED, ADR-018
Ran the design-capability play on the CODING surface: do installed coding skills overlap/conflict,
since **DeepSeek** consumes them. 3 parallel agents → `docs/research/coding-capability/` (README +
ws-1 conflict-matrix · ws-2 load-vectors · ws-3 weak-coder-evidence). **Decision: APEX is the sole
coding workflow** — absorb good ideas, remove rivals (memory `apex-sole-coding-workflow`, ADR-018).
- **Findings:** the `superpowers` *plugin* injects `using-superpowers` on every session, both backends
  ("1% → MUST invoke") with no apex-code counter — a **live hijack** of the apex-code loop (WS-2). Two
  rivals run **forbidden git ops** (`finishing-a-development-branch` → `git merge`). WS-3 (5 primary
  2025–26 sources) confirms large, coding-specific degradation on weak models (joint compliance ~35%,
  weakest 10.8%; ~30pt constraint-stacking drop; prohibition rules decay fastest → **remove, don't
  add "don't" rules**). APEX cluster itself audited clean.
- **Applied (all reversible):** superpowers plugin `→ false` in settings.json (kills injection + ~12 SP
  skills, ~5.4k tok/session); 65 `gsd-*` → `skills-archived/` (kept `gsd-map-codebase` — apex-plan's
  optional brownfield reuse); `controlled-yolo`/`full-output-enforcement`/`write-feature-spec` →
  `skills-archived/`; apex-code 1.13.0 positive primacy line; apex-governance 1.7.0 absorbed
  controlled-yolo's internet-exposure-defer. Deliberately **skipped** a CLAUDE.md §5 note (always-on
  bloat; memory + ADR + apex-code line already cover it).
- **⚠️ Verify next session (Mac/restart):** that disabling the plugin actually drops the
  `using-superpowers` SessionStart injection (WS-2 unverified on Windows). Watch-item: a leftover
  `gsd-statusline.js` statusline hook in settings.json (harmless, not a skill-trigger).

## Fable-5 stocktake + batch update (session 32, 2026-06-10) — APPLIED
Full `--stocktake` under the new planning model (Fable 5) with the DeepSeek-executor lens +
end-to-end pipeline trace. 4 audit agents → report → user approved "update all" → 3 fix agents +
inline spine edits. **30 skills updated** (all 🟡 uncommitted in `~/.claude`; repo-side SKILLS.md /
SKILL-HISTORY.md / status.md 🟡 uncommitted). Highlights:
- **Pipeline defects fixed:** phantom `apex-review` route; apex-init JS-stack reflex → routes to
  apex-stack (greenfield now always binds `stack_skills`); Light-mode decomposition no longer
  delegated to DeepSeek; orchestrate/apex-code impl-loading contradiction; governance L2/L3 vs
  CLAUDE.md commit-discipline reconciled; `docs/progress/` capture-at-halt now drained by apex-plan.
- **Model-asymmetry hardening:** apex-code simplicity sweep → flag-don't-act; wave inference
  removed (apex-plan emits `## Wave plan`); testing DAMP contradiction; non-runnable verification
  commands fixed (accessibility axe, mobile, iac broken CI example, search EXPLAIN, github/devops greps).
- **apex-coding-principles 1.3.0:** user-requested §Surgical scope + §Scalability sections + 7
  promoted cross-skill rules (identity-from-token, no-silent-catch, timeouts, async-UI states,
  version pinning, one-hypothesis debug, TS strict).
- **Fable-5 trims** (~500+ lines): system-design, iac, auth, mobile, plan, frontend, backend, aws, orchestrate.
- **Housekeeping:** SKILLS.md +5 missing entries; registry spine-scope note; SKILL-HISTORY single-source
  rule in apex-refresh; descriptions backfilled (handoff, ai-systems impl, stack impl, aws).
- **Retired apex-azure + apex-gcp** (user-confirmed; recoverable from ~/.claude git history).
- **Deferred (flagged by fix agents):** apex-system-design deeper cut (consistency/idempotency/locking
  sections); apex-docs-product eslint flat-config variant; apex-stack research-findings refresh due.

## Finalisation initiative — gearing APEX for the Artemis platform
Goal: ready APEX before building the user's largest app — **Artemis**, a personal assistant that
integrates with everything (a "Jarvis-like" assistant in spirit), with a RAG-heavy **second brain**
as its knowledge subsystem. A
multi-subsystem platform (assistant/orchestration + integrations + knowledge core + interface(s)).
Roadmap + full detail: **`docs/research/apex-finalisation-plan.md`**.

> **Artemis itself now lives in its own APEX project at `~/artemis`** (own git repo, PROJECT/
> REQUIREMENTS/ROADMAP/BACKLOG + docs/status.md). Requirements-gathering, decomposition, and the
> stack-confirm that SP0 used to hold are tracked there — not here. APEX's job is only to be ready for it.

- **SP1 ✅ Stack skills** — `apex-python` (RED/GREEN validated, recipe **run**) + `apex-swift`
  (v0.1.0, recipe **PENDING Mac validation**). Both triple-written + committed.
- **SP2 ✅ / SP3 ✅ / SP4 ✅ decided** (plan §6): SP2 = Method C (no capability binding — capability
  skills are stack-coupled, so de-couple them via SP5 + a `## Stack assumptions` header; stack recipe
  is the single verifier; research in `sp2-capability-composition.md`); SP3 = let it emerge; SP4 =
  app autonomy **L3** + lean profile at bootstrap. **SP6 ✅ convention landed** (`apex-skill-author`
  v1.3.0 + `apex-code` v1.6.0): impl.md two-tier core/references split by section identity, `apex-code`
  loads the core (hard-rules + recipe) not the whole file, and SP2's `## Stack assumptions` is now a
  named core section. _Ongoing-track audit remains (spec drift + apply split during SP5 sweeps)._
- **SP2 agent-wiring ✅ PLANNING SLICE LANDED** (ADR-007 + `apex-plan` v1.8.0 + `apex-orchestrate`
  v1.1.5 + new `apex-spec-reviewer` agent + registry Agent column repointed). The *review* role is
  now **dispatched**: a single generic `apex-spec-reviewer` pointed at `apex-<domain>/SKILL.md`,
  auto-fired for the heavy set (security/auth/data/testing/a11y), judgment-fired otherwise, skipped
  for trivial single-domain specs; findings → readiness-gate BLOCK/FLAG before a spec moves to
  `docs/changes/`. Per-domain `apex-*-agent` roster retired (registry no longer routes to it). Backed
  by an Iron-Law baseline — dispatched review beat inline self-review on gate-ready severity output
  and caught a non-salient gap (reversible migration) inline missed. The 14 now-unreferenced
  `apex-*-agent` stubs were deleted + `registry/agents.md` updated (session 19). Coding-side
  verify-dispatch **now landed** (coding session 16, `427da16`) — **SP2 agent-wiring fully complete**.
- **SP5 ✅ COMPLETE** — Opus-4.8 skill sweep = **de-couple + real-world refresh** (per
  [[sweep-includes-refresh]]). Every de-couple-target skill now has a `## Stack assumptions` swap-table
  (where multi-stack), generalised NEVER/ALWAYS, stack-specific code → `references/*.md` (SP6
  convention), a `description` backfill, and a research pass on fast-moving facts. Swept across
  sessions 16–18: **Batch 1 (13)**, **Batch 2 (12, UI cluster + ai-systems/observability/devops/
  system-design/docs-product/mobile/iac)**, **Tail (8, session 18):** k8s ⭐ + homelab ⭐ (heavy) ·
  figma · ui-testing · architecture · deep-dive · governance · docs-technical (verified, no edit).
  **Deliberately excluded** (base-knowledge, not de-couple targets): apex-aws/azure/gcp/stack,
  apex-refresh. Full per-skill detail in `SKILL-HISTORY.md`.

_Prior buildability layer (clusters 1–5, ADR-005/006) is complete — see git history + `SKILL-HISTORY.md`._

## ECC absorption initiative — selectively porting "Everything Claude Code"
Source analysis: **`docs/research/ecc-analysis.md`** (exhaustive sweep of affaan-m/ECC — 249 skills,
63 agents, hook surface). Goal: import the ~8 meta-mechanisms + design details that fix APEX's two
real gaps (**prose-only enforcement**, **manual learning**) — reject the bloat. Full ranked plan +
phases in the report's §7/§10/§11. Execution started session 24 (2026-06-02).

- **Phase 1 — design slice ✅ DONE** (session 24): `apex-ui-ux-design` v1.2.0 (AI-slop detection +
  scored visual-audit rubric in SKILL; concentric-radius/optical-alignment/tabular-nums/text-wrap/
  font-smoothing/image-outline micro-polish in impl) + `apex-animation` v1.2.0 (SSR-safe initial,
  `layoutId`, stagger 0.05–0.10s, `mode="wait"` in impl). ✅ committed (`~/.claude` 5efa3c2 · repo 5ee8446).
- **Phase 1 — remaining ✅ DONE** (session 24): `apex-skill-author` v1.4.0 (prompt-independence /
  competing-prompt strictness in the Iron Law); prompt-defense baseline added to global
  `~/.claude/CLAUDE.md` §6 (agent self-defense); strategic-compact guidance → `apex-orchestrate`
  v1.2.0 (§ Strategic compaction). ✅ committed (`~/.claude` 5efa3c2 · repo 5ee8446).
- **Phase 2 ✅ DONE** (session 25): new `apex-context-budget` v1.0.0 — planning-mode token/context-rot
  audit (single SKILL.md, no impl). RED→GREEN dogfooded (baseline over-counted impl.md flat + tried to
  delete co-installed gsd; skill closes both via the SP6 core-load model + scope discipline).
  Triple-written; registry domain `context-budget`; Opus-native. ✅ committed (`~/.claude` 855f9aa · repo b3f4144).
  **ECC absorption initiative COMPLETE** (session 26) — all phases resolved; see closeout below.
- **0b — instinct-loop deep-dive ✅ DONE** (session 26): Council mode (ADR-010) — three fresh voices
  converged **no-go** on porting ECC's automatic instinct engine. Decision **ADR-011**: no engine
  (no hook/confidence/`/evolve`); make learning an explicit convention on the existing rail —
  `apex-plan` v1.13.0 handoff-drain folds lessons into `feedback` memories, cross-handoff recurrence
  → human-gated promotion via `--stocktake`/`apex-skill-author` (Iron Law preserved). Analysis:
  `docs/findings/instinct-loop-deep-dive.md`. 🟡 uncommitted (~/.claude apex-plan; repo ADR-011 + findings + history + status).
- **Phase 3 ✅ RESOLVED — mostly rejected** (session 26, ADR-012): read ECC's actual
  `gateguard-fact-force.js` and reconsidered. **gateguard fact-forcing dropped** (it's a voluntary
  speed-bump not a gate, no-ops in subagents where APEX edits happen, and the investigation it forces is
  already done upstream by the planning/coding split + downstream Verification Recipe / dual review).
  **design-quality-check dropped** (judgment home is planning — shipped Phase 1). **Freeze deferred**
  (spec-parsing fragility; needs live Mac). **Kept one piece:** a deterministic destructive-command
  **hard-block** for coding mode (true `deny`, reuses gateguard's parser) — the only real gap-filler;
  spec `coding-destructive-command-guard.md` queued, **gated on a live Mac**.
- **Phase 4 ✅ DONE** (session 26): **ADR-010** — santa-method dual-pass wave review + council
  anti-anchoring. `apex-code` v1.8.0 dispatches **two** isolated `apex-wave-reviewer` passes per
  critical-subset domain (auth/security/data — already the only wave-reviewed set), worst-of-two
  union, one-retry re-dispatches both passes, `risk: low` spec flag downgrades to single-pass
  (wave-review surface only; `apex-wave-reviewer.md` unchanged — stateless/isolated already).
  Council four-voice → `apex-deep-dive` v1.3.0 (in-context Architect + 3 fresh `general-purpose`
  voices given only the question; no new agent files) + `apex-plan` v1.12.0 offers council at
  **judgment** forks (offer-only, never auto-runs; facts-uncertainty stays with research).
  ✅ committed (~/.claude 89a28ea · repo 3308c48).
- **Phase 5 ✅ DONE** (session 26): skill-stocktake + rules-distill **folded into one mode** —
  `apex-refresh` v1.2.0 `--stocktake` (quality audit of the skill set against the authoring
  contract + rules-distill cross-read for 2+-skill principle promotions; Quick Scan via git diff +
  `.stocktake-state` SHA marker, no results.json; dispatched chunked `general-purpose` subagents;
  report-only routing to existing fix paths). Decided as one mode (not the report's two) after a
  **live duplication probe** across 37 impl.md cores: only 2 genuine promotions surfaced
  (no-PII-in-logs ×3, retry/backoff+idempotent ×5) — confirms rules-distill earns *inclusion* but
  not its own command. Those 2 landed into `apex-coding-principles` v1.1.0 (NEVER/ALWAYS + Security).
  No new skill/agent/script; no ADR (additive). ✅ committed (~/.claude f55727f · repo f01efbd).
- **Phase 6 ✅ CLOSED — no engine** (session 26, ADR-011): the 0b Council converged against porting
  ECC's automatic instinct engine. Redefined to a one-line convention on `apex-plan`'s handoff-drain
  (landed in v1.13.0) — no hook, no confidence scoring, no `/evolve`, no DeepSeek build. The "manual
  learning gap" is a *feature* here: the human gate keeps the weak coding model from poisoning skills.

**Closeout (session 26).** Of ECC's ~8 candidate mechanisms, APEX **adopted** those that filled real
gaps as markdown/skill upgrades — context-budget (Phase 2), council + santa-method (Phase 4),
stocktake + rules-distill (Phase 5), skill-comply→Iron Law + prompt-defense + strategic-compact +
design details (Phase 1) — and **rejected both hook-heavy mechanisms after deep reads**: the instinct
engine (ADR-011) and gateguard (ADR-012), because APEX's planning/coding split + Verification Recipe +
dual review already serve what they were for. One small deferred item remains: the coding-side
destructive-command hard-block (spec queued, gated on a live Mac). **Imported the judgment, rejected the
bloat — initiative complete.**

## Odysseus comparison (one-shot, session 27) — COMPLETE
Ran the ECC-style "compare + selectively absorb" play against PewDiePie's **Odysseus** (MIT
self-hosted AI workspace). Finding: the viral council/64-model-swarm are **not in the repo** (a
YouTube experiment); the shipped app is a thinner APEX-mechanism donor than ECC, and APEX already
has safer equivalents (ADR-010 council; parallel dispatch). Full analysis: **`docs/research/odysseus-analysis.md`**.
- **Landed (Lens A, A1):** `apex-governance` v1.3.0 + `apex-deep-dive` v1.4.0 — **evaluator-independence
  (anti-collusion) invariant** distilled from the council collusion. Everything else Lens-A was a
  note/reject (see analysis §2). ✅ ~/.claude e4c0773 · repo 2288156.
- **Lens B (Artemis prior-art):** user is capturing this separately — not tracked here.

## Donor-system absorption pass (session 27) — Batch A+B landed
ECC-style compare-and-absorb over **8** dev systems (Tier 1: Kiro, BMAD, Spec-Kit, GSD · Tier 2:
Superpowers, Aider, Cline/Roo, OpenSpec). 8 parallel dedup-aware + token-flagged agents. Full report:
**`docs/research/donor-analysis/`** (README synthesis + 8 per-system files).
- **Two new ADRs:** **ADR-013** app-flow artifact (resolves the Appflow gap) · **ADR-014** System Overview
  as living capability index (merge-on-archive; token-guardrailed terse index).
- **Skills wired (✅ ~/.claude 5f3f799 · repo 2a076f4):** apex-docs-technical 1.2.0 · apex-init 1.4.0 · apex-ui-ux-design
  1.3.0 · apex-plan 1.14.0 · apex-code 1.9.0 · apex-coding-principles 1.2.0 · apex-context-budget 1.1.0
  · apex-governance 1.4.0. Landed: app-flow doc, living-capability overview + merge-on-archive,
  readiness-gate hardening (coverage audit + clarify markers + self-review), 4-status worker contract,
  edit-format reliability + git-stash checkpoint, conditional loading + ~70% tripwire, receiving-review
  discipline, scale-adaptive mode, brownfield gate (reuse gsd-map-codebase).
- **Rejected as token traps / dedup** (report §3/§4): BMAD 12-agent pipeline, GSD phase-spine + Node
  toolchain + graphify + auto-learning, Aider repo-map-in-coder, Roo orchestrator, Spec-Kit
  constitution-versioning, git worktrees.
- **Parked (Bundle C extras, not in §1/§2):** Kiro agent-hooks, planning-side repo-map discovery.

## Dispatch-contracts pass (session 28) — ADR-015
Scoped research on subagent dispatch vs **first-party** Anthropic orchestration guidance (first time
measured against primary sources, not donor systems). Core validated; one invariant codified.
Research: **`docs/research/subagent-dispatch-improvements.md`** (+ `dispatch-study/`).
- **ADR-015:** dispatch **return-contract** invariant (children return small — deep/exploratory write
  full output to disk + return ≤1–2k summary/pointer; verdict/status children return their fixed
  shape) **+** evaluator-optimizer kept **capped at one rule-evaluated retry** (rejected multi-round:
  98%→57% trivial-task degradation, ADR-011 drift-guard).
- **Skills:** apex-orchestrate 1.3.0 · apex-skill-author 1.5.0. ✅ committed (~/.claude 95093f0 sweep).
- **Cross-model review — WIRED as opt-in (session 32, 2026-06-10):** spec flag `cross_model_review: true`
  → apex-code post-build dispatches an independent 2nd review on the other model family (apex-governance
  1.6.0 contract + apex-code 1.11.0 + apex-plan 1.16.0 + spec-template flag). **Executable path still
  Mac-gated** (needs Claude+DeepSeek co-located); single-backend hosts record a flag, never silent-skip.
  First real Mac run = its Iron-Law baseline. (Was ADR-015 parked.)
  honest tension that multi-agent is a weak fit for *coding* fan-out (payoff = throughput, not answer
  quality) — don't over-invest coding-side parallelism.
- ⚠️ Lightweight Iron Law (convention edit codifying existing practice) — flagged for retroactive rigor.

## DOX comparison (one-shot, session 30) — COMPLETE, rejected
Compare-and-absorb over **agent0ai/DOX** (pure-Markdown hierarchical `AGENTS.md` framework). Finding:
near-total **dup** of APEX's existing disciplines (CLAUDE.md chain, System Overview index ADR-014,
read-before-edit loop, status.md "current-state-only" / delete-stale), and its one novel mechanism —
auto-generating a per-directory context-file tree — is the **evidence-backed failure mode** from
`agentmd-context-files-study.md` (arXiv:2602.11988: auto-gen files −success, ~20% cost tax). **Rejected
as a system; nothing absorbed** (R1 "child can't weaken parent" declined — APEX hard-block floor already
covers it). Value = validating signal that APEX's style contract is right. Report: **`docs/research/dox-analysis.md`** (✅ committed f688c51). Reaffirms the two parked AgentMD watch-items.

## Notes
_status.md holds current state only — session history lives in git + handoff docs._
- **Residual DeepSeek-archived scrub (discovered 2026-06-23, follow-up 2).** ADR-027 archived DeepSeek
  but ~50 `impl.md` files + `apex-figma` (a "DeepSeek-only" skill needing a full ADR-027 pass) +
  `apex-ui-testing` still reference DeepSeek / an image-blind coder as the live executor. The ADR-020
  follow-up fixed the *named* image-gate surface (governance + apex-ui-ux-design); the rest is a separate
  system-wide recalibration pass — update the coder reference to Codex/Opus (sighted) and preserve each
  skill's underlying discipline (e.g. apex-ui-testing's numerical-verification). Not yet scheduled.
- **Two gates, never conflate (corrected 2026-06-15):** `coding-session` = needs a DeepSeek coding
  session, **runnable on Windows** (DeepSeek cloud API is wired here — `DEEPSEEK_API_KEY` set; switch
  `ANTHROPIC_BASE_URL` to `…/deepseek/anthropic` + restart). `mac-gated` = needs macOS tooling
  (Xcode/Swift/Bitrig), truly not Windows-runnable. The old blanket "Mac-gated" tag wrongly merged
  these. Genuinely `mac-gated`: apex-swift recipe, Step-4 Bitrig walkthrough. Everything else
  previously tagged Mac-gated is `coding-session`.
- **Pipeline artifact model is implemented** (clusters A–E, 2026-05-30): thin handoff +
  triage-drain (`apex-handoff`, global CLAUDE.md, orchestrate template); apex-plan session-start
  drain + upfront elicitation; spec = execution-script (one-line identity, no-why, files-per-task);
  apex-code three-zone fork routing + capture-at-halt; bug records homed in git/test/comment +
  unfixed→GitHub Issues (gated). Design doc: `docs/research/pipeline-artifact-model.md`.
- **Conceptual data-model artifact** (ADR-008): ground-up data-bearing projects seed
  `docs/technical/architecture/data-model.md` (entities/relationships/invariants — *conceptual only*);
  apex-init seeds it (scope-gated), apex-plan captures it early + coverage-checks the stub, apex-data
  reconciles each phase's physical schema against it. Physical schema stays per-phase (SP3 intact).
- **Opus 4.8 first-pass tracker** lives at the top of `SKILL-HISTORY.md` (Done/Pending list).
- Skill `.md` work is done **directly in planning mode** (Claude); per-edit backend gate. See memory `skill-authoring-workflow`.

## Open Questions
_SP2-composition + agent-wiring (planning **and** coding slices), SP3, SP4 resolved (see plan §6 + ADR-007). Remaining:_

- **Cadence gaps from the Artemis 2026-07-11→12 run retro (BACKLOG — handle separately).** An Opus×Sol
  retro found the per-spec coding cadence has no adversarial step: 3 P1 safety bugs reached commit and
  were caught only by an ad-hoc end-of-run Sol pass; a 07-10 unshielded-await fix regressed in new code.
  Four items in `docs/findings/artemis-run-retro-cadence-gaps-2026-07-12.md`: **A1** standing end-of-run
  Sol gate (owner-gated — standing codex spend) · **A2** codex diff-review checklist for silent-regression
  classes (await-before-yield, unshielded await, dropped safety metadata, late optimistic guard) · **A3**
  invariant-freshness in pre-build re-verify · **A4** one durable codex dispatcher (stdin-closed + run
  ledger + watchdog + adopt). A1 needs owner ratify; A2–A4 are host-authorable.

- **13-7 issues: `docs/status.md` is an unowned shared-write file during AFK builds (BACKLOG — owner will
  harden).** Artemis's 2026-07-13 AFK run hit a three-way collision on status.md, all three items
  APEX-cadence, not product: **B1** codex wrote status.md outside its scope-lock (the lock is advisory — no
  mechanism blocks an out-of-scope write) · **B2** the orchestrator's mitigation (blanket-revert status.md per
  stage) wiped the planning host's concurrent edits and then reported the host's real ADRs as codex
  "fabrications" — a revert must be scoped to the codex diff, never the whole file · **B3** status.md shipped an
  "these files are UNCOMMITTED, commit them" instruction in the same commit that committed them, sending the next
  session chasing a phantom. Root cause is common: status.md has multiple writers and no declared owner. Detail:
  `docs\findings\artemis-13-7-issues.md`.

- **Codex integration (session 60) — HYBRID path BUILT, pilot pending.** Chose the incremental hybrid
  (Codex bolted into the existing APEX-on-Claude-Code pipeline) over a full migration. **ADR-026 + P2
  built directly in planning** (🟡 uncommitted): Codex = `gpt-5.5` via `codex exec` subprocess as (a) the
  **ceiling coder** (`coder_models` → `{flash,pro,codex}`; Sonnet/Opus retired as coders; image + hard-text
  ceiling; `pro`→`codex` escalation) and (b) the **family-aware reviewer** (DeepSeek-built→Codex review;
  Codex-built→Opus review). Soft-pool guard (ADR-025) discharged for coding. Codex CLI installed live
  (`codex-cli 0.141.0`, ChatGPT-authed, `gpt-5.5` smoke-tested OK); `codex-code` launcher added to the PS
  profile (standalone, not APEX). **Resolved:** keep DeepSeek (no Responses-API gateway needed — Codex is a
  sibling subprocess, not a Claude-Code backend); NO Workflow rebuild (Codex sequential, parallel-Codex out
  of scope). **Pilot PASSED (evidence `docs/probes/codex-pilot-results.md`)** — both halves proven on
  Windows (coder built + pytest passed; reviewer schema-valid BLOCK); 2 pilot-caught bugs fixed
  (**stdin-pipe required** — bare-arg `codex exec` hangs; **schema strict-mode** — all props `required`).
  **Still open:** (1) **commit** the uncommitted pile; (2) the *full* APEX→Codex migration remains a
  separate, larger, un-decided question (research README).
- **apex-swift recipe** — unproven until the first Mac/Xcode build runs it (v0.1.0 → 1.0.0).
- **Permission-classifier ↔ coding-backend SPOF — ✅ RESOLVED (session 54) + Phase-1 EMPIRICALLY VALIDATED (session 55, 2026-06-20).**
  Researched against primary CC docs (`/permission-modes`, `/auto-mode-config`, GitHub issue #69002).
  **Confirmed:** the auto-mode safety classifier routes through `ANTHROPIC_BASE_URL`, so on a coding
  session it runs on DeepSeek — a blip blocks **protected-path writes** (`.claude/`, `.git/`, … route
  to the classifier *even when allow-listed* in auto mode) + non-allowlisted Bash. The original
  failure was exactly this: the `Write` of `~/.claude/workflows/apex-build-wave.js` (a protected path)
  in auto mode. **Independent classifier-model pinning is NOT shipped** (issue #69002 open — proposes a
  future `CLAUDE_CODE_AUTO_MODE_MODEL`). **Fix (no infra):** run the DeepSeek build path in **`dontAsk`**
  mode (not `auto`) — `dontAsk` never invokes the classifier, executes only `permissions.allow` + read-only
  Bash, and `permissions.deny` keeps the destructive floor (deny applies in every mode). Trade-off:
  the allowlist must be complete (off-list = silent deny, not prompt). First validation = a real
  `wave_dispatch: workflow` build launched with `--permission-mode dontAsk`.
  **Phase 1 VALIDATED (session 55):** probes A–D all PASS on DeepSeek under `dontAsk` — protected-path
  write denied *locally* (Probe A, the key discriminator: no "cannot determine the safety" text → classifier
  never invoked), allow-listed write succeeded with no round-trip, the `rm` deny floor held, off-list `node -e`
  denied cleanly (no hang). The SPOF is structurally eliminated on this path; evidence `docs/probes/dontask-results.md`.
  **Phase 2 COMPLETE (session 57, 2026-06-21) — E/F1/F2 all PASS → SPOF FULLY RESOLVED.** After the §D
  allowlist expansion (`Workflow/Agent/Task/Skill`) + file reset done in planning: Probe **E PASS**
  (`Bash(<cmd>:*)` prefix rules admit the arg-bearing recipe commands — `uv`/`ruff`/`mypy`/`pytest` clean, no
  classifier); Probe **F1 PASS** (a real `wave_dispatch: workflow` build runs end-to-end under `dontAsk` —
  orchestration tools are gated by `permissions.allow`, **not** the classifier, so allowlisting unblocked the
  path exactly as the session-56 read predicted); Probe **F2 PASS** — the last open unknown — dispatched workers
  **inherit** the parent's `dontAsk`, returning a *local* off-list denial verbatim-identical to the main-session
  baseline (no `"cannot determine the safety"`). The SPOF is eliminated through the **worker path**, not just the
  main session. Folded into **apex-code 1.17.2** step 1a (workflow-dispatch allowlist must include the
  orchestration tools; workers inherit `dontAsk`). Evidence: `docs/probes/phase2-results.md`.
  **One minor non-blocking follow-up** — Worker 2 was denied Bash for its allow-listed `uv run pytest` while
  Worker 1 (dispatched identically) succeeded; intermittent subagent Bash-availability inconsistency under
  `dontAsk`, did NOT affect the build (main-session verification covered it) and is NOT a classifier/SPOF
  regression (local denial). See "Minor open follow-up" below. **Probe-design lesson retained:** a `dontAsk`
  session can't author its own allowlist/scaffolding ([[dontask-probe-cleanup-paradox]]) — the §D allowlist
  expand + file reset had to be done in planning first. **Throwaway torn down (session 57)** — evidence
  retained in `docs/probes/phase2-results.md`.

- **Minor open follow-up (non-blocking) — subagent Bash inconsistency under `dontAsk`.** In the Phase-2 F1
  build, two identically-dispatched `wave_dispatch: workflow` workers diverged: Worker 1 ran its allow-listed
  `uv run pytest` fine, Worker 2 was denied Bash (and PowerShell) for the same kind of command. Local denial,
  not a classifier round-trip — so not a SPOF regression. Hypothesis: tool-use ordering or model-specific tool
  routing inside the worker. Impact is low because main-session verification already covers the build; the risk
  is a real build silently losing *per-worker* self-verification. **Action:** watch for recurrence in the first
  real `wave_dispatch: workflow` project build; spec a focused sub-probe only if it repeats (the throwaway
  scaffold is gone — a sub-probe would rebuild it). Until then, per-worker Bash self-verification under
  `dontAsk` is not guaranteed (apex-code 1.17.2 step 1a caveat).

- **GPT-5.6 family adoption — access-gated (session 62, 2026-06-27).** Draft plan at
  `docs/drafts/gpt-5.6-family-adoption.md`. GPT-5.6 (Sol/Terra/Luna tiers + new `max` effort + `ultra`
  in-model-subagent mode) is **limited preview (~20 partners, no self-service enrollment)** → unverifiable
  on our `codex-cli 0.141.0` auth, so it is a **draft, not a ready spec** (extends ADR-030). **Promote-trigger:**
  `codex exec -m <gpt-5.6 id>` resolves on our auth (re-verify all preview facts against GA docs then).
  Sub-questions: (a) does **Terra** (≈gpt-5.5 quality at ½ cost) become the default coder, with Sol for
  hard/risky and Luna for trivial — reopening the per-spec *model* route ADR-027 collapsed? (b) is **`ultra`**
  (in-model subagents) redundant with or complementary to APEX's own ADR-028/029 wave parallelism — needs a
  real head-to-head eval before adoption, not a faith-bake.

- **Codex Remote on Windows reframes backlog #4/#8 (session 62, 2026-06-27).** Codex Remote GA + Windows
  remote control / SSH (2026-06-25) likely **retires the "autonomous/headless builds = Mac-Mini-gated"
  assumption** in ADR-021 §#4/#8: that gate was the DeepSeek base-URL swap Cloud Routines couldn't honor,
  but the coder is now **Codex** (Windows-native, headless `codex exec`). Re-scope #4/#8 as Windows-runnable.
  **Caveat to verify first:** Codex Remote watches the **Codex app's** sessions, a different surface than
  APEX's `codex exec` CLI subprocess — confirm what's actually observable/approvable before building a
  remote autonomous loop.

- **Multi-model architecture — BANKED for stronger-model revisit (2026-06-28).** Full design + the
  stress-tested reasoning captured in `docs/research/multi-model-architecture/README.md`. Provisional
  decisions (gpt-5.5 = default coder · **Opus = judgment/gate layer, NOT a coding tier** · split-ceiling
  escalation rationing the scarce Opus weekly cap · planning OpenAI cross-check/takeover toggle with skills
  always gating Claude-side · retrieval stays Claude) are a **prior, NOT built**. Also banks the per-spec
  `coder_model` control + model-visibility knob (the "more control" ask). **Revisit trigger:** newer OpenAI
  models reach our Codex auth (GPT-5.6 GA) **AND** the ADR-016 eval harness exists. **Empirical linchpin:**
  does OpenAI's ceiling (Sol/`ultra`) actually clear our hard tasks? — if not, the ladder re-centers on Opus.
  Economic spine = two subscription quotas, ration only Opus. **Retrieval sub-question ✅ RESOLVED (2026-06-28)
  — "retrieval stays Claude" upgraded provisional→settled.** Dive `docs/research/openai-subscription-retrieval-path.md`
  (apex-research 3-phase, all VERIFIED): the ChatGPT/Codex subscription and the OpenAI API are separate billing
  products (subscription = 0 API credits); **no subscription path does capable + non-interactive full-page
  retrieval** (`codex exec --search` = snippets only; ChatGPT browsing / Codex browser-use / Chrome extension all
  interactive-only — headless computer-use explicitly declined by OpenAI); the only capable + programmatic path is
  the **metered** Responses-API `web_search` tool (~$0.01/call + tokens, on the API product the subscription doesn't
  fund). APEX retrieval already runs capable full-page on the Anthropic subscription (dispatched Sonnet/Haiku +
  WebFetch/WebSearch) — switching to OpenAI either loses capability or adds a metered bill for no quality gain.
  Metered `web_search` kept only as a narrow fallback if a future OpenAI-native agent must cite its own search.

## APEX-fully-local research (session 33, 2026-06-12) — COMPLETE, ADR-016
Ran the local-inference brief: 6 parallel gather agents (WS-A…F) → `docs/research/local-inference/`
+ synthesis `docs/research/local-inference-migration.md` + **ADR-016** (re-research 2026-06-26).
**Verdict: full-local migration DEFERRED behind an eval gate — prepare-and-gate plan adopted.**
The gating risk materialised: V4-Pro can't run at home (1.6T; datacenter-only); home-viable
V4-Flash is **11 pp behind Pro on agentic planning** (Terminal-Bench) before the Q3/Q4 quant tax;
Mac serving of Flash is single-stream experimental (MLX unsupported); coding-only localisation
saves $5–20/mo. Hybrid (Claude planning + DeepSeek coding) = sanctioned interim state.
- **Phases:** P1 eval harness (promptfoo + lm-eval + 20-task corpus; doubles as model-swap gate) ·
  P2 RAG-currency index (reuses Artemis second brain) · P3 hardware on Artemis' justification
  (M3 Ultra 256 GB $5,999 — **user timing call vs M5 Ultra rumour H2 2026**) · P4 shadow-run local
  Flash · P5 migrate only on 4-condition gate-pass (then backend-routing rewire: LiteLLM +
  `APEX_MODE`/URL-prefix mode detection).
- **Downstream specs flagged (not written):** eval-harness · RAG-currency index · backend-routing
  rewire (post-gate only).
- **Fact corrections landed:** V4-Flash max output = **131K** (384K is V4-Pro's); Flash Q4_K_M ≈
  160–180 GB (not 96 GB); WS-A's contrary figure overruled in synthesis.
- **Hosted-model comparison (session 37, 2026-06-13) → `docs/research/model-comparison/`.** Exploratory
  landscape (no ADR). Opus 4.8 leads every independently-verified APEX benchmark (SWE-bench 88.6 vs 80.6,
  Terminal-Bench 74.6 vs 67.9, AA Intelligence Index 61 vs 52); V4 Pro ~near-tied on *pure* coding at
  ~29× cheaper output. Coding cost **Flash → Pro ≈ 3× sticker** ($0.14/$0.28 → $0.435/$0.87 per Mtok;
  ~$10–40/mo added over Flash's ~$5–20/mo), more if think/think-max. Verdict: keep Claude for planning;
  the live (un-opened) question is **Flash→Pro for coding** — a re-tune + eval gate (reuse ADR-016 P1
  harness), NOT a model-string swap, because apex-code is optimised around Flash's weak-coder failure modes.
  Re-research after 2026-06-27.

### Deferred to next session (paused 2026-06-09 — coding-mode context window)
- **Verify coding-mode (DeepSeek) actual context window — Mac-gated.** Open question: is coding mode
  getting the context window we assume? `/context` in *planning* shows Opus 4.8 at 1M (29% used) — but
  that says nothing about DeepSeek. The 1M window is a Claude-model property, not an Anthropic-wide
  switch; DeepSeek V4 Flash has its own ceiling, and Claude Code's `/context` denominator is **not
  authoritative** against a custom `ANTHROPIC_BASE_URL` (it shows CC's *assumed* window, not the
  endpoint's true one). **How to check (on the Mac):** (1) read `$env:ANTHROPIC_BASE_URL` /
  `ANTHROPIC_MODEL` + the settings.json `env` block; (2) `curl $BASE/v1/models` (OpenAI-compatible) —
  but if it's a DeepSeek→Anthropic proxy, query the proxy and note the proxy's pass-through cap may be
  lower than native; (3) DeepSeek's published spec = ground truth for the native window; (4) empirical
  probe — **discriminating, not confirmatory.** Send ONE request sized *in the gap* between the
  competing windows (~700–900K tokens — above the small-window candidates ≤384K, below the claimed
  1M): a **success (200)** proves the usable window is ≥ that size and separates 1M-class from a
  proxy-capped small window; a context-exceeded **400** proves it is below. (An oversized ~2M probe
  is **non-discriminating** — every hypothesis fails it, so it proves nothing beyond "cap < 2M.") To
  pin the exact cap, binary-search the boundary upward to the first failure.
  - **✅ Published native window resolved (session 31, corrected session 33):** DeepSeek V4 Flash =
    **1M-token context / 131K max output** (the 384K figure is V4-Pro's — corrected by WS-A,
    `docs/research/local-inference/ws-a-lineup.md`). 1M ctx is the expected number to check the Mac
    against. **Still Mac-gated:** whether APEX's `deepseek` base-URL *proxy* passes the full 1M
    through to coding mode (proxy cap may be < native) — needs the empirical `curl`/oversized-input
    probe. Source: api-docs.deepseek.com + llm-stats.com.

### Deferred to next session (paused 2026-06-08 — social-media RAG/voice filter)
- **apex-realtime 1.2.0 landed** — live-voice / WebRTC transport tier (triple-write ✅ committed).
- **AgentMD context-files study verified** (arXiv:2602.11988) — real but OVERSTATED; reinforces lean-context discipline (auto-generated files hurt, human-written +4%; ~20% cost tax on both). Report ✅ `docs/research/agentmd-context-files-study.md`.
- **Follow-up — `references/voice-pipeline.md`** (apex-realtime per-stack LiveKit/Pipecat wiring): deferred, not written.
- **Parked (AgentMD watch-items):** (a) add an "is this inferable from the repo?" deletion criterion to `apex-context-budget`/`apex-refresh`; (b) never add an auto-generate-CLAUDE.md feature. (Declined this session — option #2.)

### Deferred to next session (paused 2026-06-05 — repo-studies pass)
- **Retroactive lightweight Iron-Law baseline** on the new taste/animation rules — applied without a bare-agent baseline (defensible per [[iron-law-application-depth]]; flagged for rigor).
- **Security-ops expansion question** — whether APEX adds `apex-detection`/`apex-incident-response` or just an SBOM annex to apex-security (from the cybersecurity repo). Leaning: no SOC, SBOM annex only.
- **Clone Lens-B source repos into `artemis/.research/`** (odysseus pattern) — optional; brief + verified URLs already captured.

## Future Discussions (parked)
- **Vercel `agent-browser` for agentic UI verification** (gated on a live Mac coding env) — trial
  `vercel-labs/agent-browser` (Rust CLI, accessibility refs `@e1` over stdout, ships as a CC skill via
  `npx skills add`) as the *in-the-loop* verification driver in place of the Playwright MCP. Fit for this
  stack: text-over-Bash suits image-less DeepSeek + leaner context. Keep `@playwright/test` for the
  authored regression suite (unchanged). If adopted: swap the `browser_snapshot` command in
  `apex-ui-testing/impl.md` (v1.2.0) → `agent-browser snapshot` — the snapshot-first/no-pixels-to-a-
  text-model *principle* is unchanged, only the command. Caveats: launched 2026-01-13 (young vs mature
  Playwright); the "93% less context vs Playwright MCP" figure is third-party, not in the repo. Can't be
  validated on the Windows planning box.
- **Richer stack binding manifest** — pinned versions + a `docs/technical/stack.md` beyond the
  `stack_skills` list (the selection/binding facet itself is decided — ADR-005/006).
- **Opus 4.8 content sweep** → now **SP5** of the finalisation plan (~36 skills pending;
  `description` backfill folds into each sweep). Tracker at the top of `SKILL-HISTORY.md`.
- **Potential new skill domains** — `apex-payments`, `apex-email` — not prioritised.
- **Cheap-model tiered dispatch** (Odysseus-analysis A6, Mac-gated) — a cheap local-model tier for
  wide/low-stakes fan-out (breadth scans, first-pass triage), reserving strong agents for synthesis.
  No-op today (APEX runs Claude/DeepSeek, no local small-model tier); revisit when the Mac-mini host
  can serve a small local model. Detail in `docs/research/odysseus-analysis.md` §2.
- **safety-guard Freeze (enforced scope-lock)** — deferred from ECC Phase 3 (ADR-012). A PreToolUse hook
  that locks coding-mode writes to the active spec's `Files to Change`. Real value but fragile (must
  parse spec/status at runtime); revisit once the Mac coding env is live and the destructive-command
  guard has proven the hook pattern there.
_(Large-scale app dev → now SP3; stack↔capability composition + agent wiring → now SP2; both moved
out of "parked" into the active finalisation plan.)_
<!-- PLANNING:END -->
