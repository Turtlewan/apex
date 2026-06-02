# Research: ECC ("Everything Claude Code") — EXHAUSTIVE analysis + APEX incorporation report

**Date:** 2026-06-02
**Confidence:** HIGH — full shallow clone read directly (`git clone --depth 1`): all 249 skill frontmatters, all 63 agents, 20 rule packs, the live `hooks.json` + `scripts/hooks/` surface, and the complete text of the meta/agent-engineering skill cluster.
**Re-research after:** 2026-06-16 (AI/LLM tooling, 14-day clock — ECC pushes almost daily; `pushed_at` == research date).
**Source:** `affaan-m/ECC` — 202,768★ / 31,106 forks / MIT / ~3,968 files / `main`.

---

## Summary

ECC is a **maximalist, load-everything agent-harness configuration system** for Claude Code (+ Cursor/Codex/OpenCode/Gemini/Zed/Kiro/Trae/Qwen). It is the philosophical opposite of APEX's lean, context-rot-aware, planning/coding-split design. **~85% of its 249 skills are accretion** — per-language patterns/testing, plus the author's own vertical client work (healthcare, homelab, networking, defi, prediction-markets, supply-chain, scientific) and his startup's business-ops (social, billing, investor, lead-gen). That bulk is noise for us.

The **valuable ~15% is a meta/agent-engineering cluster** — and several pieces are genuine upgrades to specific APEX surfaces, not just confirmations. The standout finds, in priority order:

1. **gateguard** — a *fact-forcing* pre-action gate (DENY → FORCE → ALLOW) with A/B evidence (+2.25/10). Upgrades APEX's Karpathy pre-flight from self-evaluation to forced investigation.
2. **context-budget** — APEX's own context-rot doctrine made measurable. Clean new-skill fit.
3. **continuous-learning-v2 (instincts)** — automatic, hook-deterministic learning loop. Fills APEX's biggest gap (manual handoff+memory).
4. **skill-comply** — prompt-independence compliance testing → strengthens the Iron Law.
5. **santa-method** (dual context-isolated reviewers), **council** (anti-anchoring four-voice), **safety-guard** (enforced scope freeze), **rules-distill**, **skill-stocktake** — each maps to a named APEX skill.

A crucial feasibility note resolves the "APEX is markdown-only" tension: **APEX already runs two Node hooks** (SessionStart routing, PreToolUse write-guard) from `~/.claude/settings.json` — *outside* the repo. So hook-based mechanisms (gateguard, safety-guard, the instinct loop, strategic-compact) are **consistent with APEX's existing pattern**; the "no build step / pure markdown" project rule governs *repo content*, not harness hooks.

---

## 1. What ECC actually is

[VERIFIED — repo metadata + README + clone]

- **Identity:** "The agent harness performance optimization system. Skills, instincts, memory, security, research-first development." Author: Affaan Mustafa. MIT OSS core + **ECC Pro** GitHub App ($19/seat/mo, mines git history → skills) + Sponsors.
- **Real file counts (git tree):** `docs/` 1,343 · `skills/` 404 (**249 skill folders**) · `scripts/` 168 · `tests/` 149 · `rules/` 115 · `commands/` 79 · `agents/` 63 · per-harness mirror dirs (`.cursor/.opencode/.codex/.gemini/.zed/.kiro/.trae/.qwen/.codebuddy/`) ~250 · `ecc2/` 19 (alpha Rust control-plane) · `hooks/` 4 (just `hooks.json` — real logic is in `scripts/hooks/`).
- **Stated philosophy:** research-first, TDD (Red-Green-Improve, 80% coverage), continuous learning, hook-driven enforcement, token optimization (~60–70% claimed cost cut via `model: sonnet`, `MAX_THINKING_TOKENS`, `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE: 50`).
- **Canonical flow:** `planner → tdd-guide (RED/GREEN/IMPROVE) → code-reviewer`, proactive agent routing ("use agents without explicit prompt").
- **Reception** [COMMUNITY]: praised for code-reviewer design (filters confidence >80%, consolidates, security-first) + TDD skill as *reference architecture*; criticized for **over-engineering** ("a 60–200 line CLAUDE.md does most of this"), **incomplete plugin install** (rules copied manually), **star-count inflation** (viral X thread; low Discussions activity).

---

## 2. The actual hook surface (ground truth)

[VERIFIED — `hooks/hooks.json` + `scripts/hooks/`]

ECC wires **PreToolUse / PostToolUse / Stop / SessionStart** to ~28 Node scripts. The APEX-relevant ones:

| Hook script | Event | What it does | APEX analog / gap |
|---|---|---|---|
| `gateguard-fact-force.js` | PreToolUse | Blocks first Edit/Write/Bash; demands facts (importers, schemas, verbatim instruction) | Karpathy pre-flight (currently self-eval, not forced) |
| `observe-runner.js` | Pre/PostToolUse | Records every tool call → instinct extraction (`continuous-learning-v2`) | **No APEX equivalent** (manual memory) |
| `governance-capture.js` | Pre/PostToolUse | Captures governance/audit events | APEX L4+ audit log (governance) — prose only |
| `suggest-compact.js` / `pre-compact.js` | PreToolUse/PreCompact | Suggests `/compact` at phase thresholds | APEX context-rot doctrine — no instrument |
| `config-protection.js` | PreToolUse | Protects `.claude/` config from edits | APEX write-guard (parallel idea) |
| `block-no-verify.js` | PreToolUse | Blocks `git commit --no-verify` | APEX hard-blocks (prose) |
| `quality-gate.js`, `stop-format-typecheck.js` | Stop | Runs format/typecheck/quality gate at stop | APEX verify recipe (recipe-driven, better) |
| `session-start-bootstrap.js` | SessionStart | Loads context at session start | APEX SessionStart routing hook (parallel) |
| `cost-tracker.js`, `ecc-context-monitor.js` | Post/Pre | Token/cost telemetry | APEX token_profile (no telemetry) |

**Takeaway:** ECC's enforcement is *deterministic* (hooks), where several APEX guarantees are *prose in skills* (scope-lock, hard-blocks, pre-flight verification). That is the single biggest portable theme.

---

## 3. Exhaustive skill taxonomy (all 249, bucketed)

Every skill folder, sorted into buckets. **Bold = worth mining for APEX.** Plain = domain accretion (skip).

**A. Meta / agent-engineering / harness (the relevant core):**
**agentic-os**, **agent-harness-construction**, **agent-architecture-audit**, agent-eval, agent-introspection-debugging, agentic-engineering, ai-first-engineering, autonomous-agent-harness, autonomous-loops, continuous-agent-loop, **continuous-learning-v2** (+ continuous-learning v1 deprecated), **council**, enterprise-agent-ops, eval-harness, gan-style-harness, **iterative-retrieval**, **parallel-execution-optimizer**, plan-orchestrate, ralphinho-rfc-pipeline, **recursive-decision-ledger**, **safety-guard**, **santa-method**, team-builder, dmux-workflows, claude-devfleet, nanoclaw-repl, **gateguard**, **agent-sort**.

**B. Context / token / cost:**
**context-budget**, **strategic-compact**, token-budget-advisor, cost-tracking, cost-aware-llm-pipeline.

**C. Skill / rule lifecycle & self-management:**
**skill-comply**, **skill-stocktake**, **rules-distill**, skill-scout, **hookify-rules**, configure-ecc, ecc-guide, ecc-tools-cost-audit, workspace-surface-audit, hermes-imports, plankton-code-quality.

**D. Research / verification / audit:**
deep-research, research-ops, **search-first**, **verification-loop**, **production-audit**, automation-audit-ops, repo-scan, codebase-onboarding, code-tour, benchmark, benchmark-optimization-loop, canary-watch, browser-qa, click-path-audit, exa-search, documentation-lookup.

**E. Memory / knowledge:**
**ck** (context-keeper), knowledge-ops, **architecture-decision-records**, content-hash-cache-pattern.

**F. Decision / product:**
**council**, recursive-decision-ledger, product-capability, product-lens, blueprint, prompt-optimizer, regex-vs-llm-structured-text.

**G. Security (most are app-domain, skip):**
security-review, security-scan, security-bounty-hunter, safety-guard, gateguard, defi-amm-security, llm-trading-agent-security, evm-token-decimals, nodejs-keccak256, healthcare-phi-compliance, hipaa-compliance, perl-security, django-security, laravel-security, quarkus-security, springboot-security.

**H. Language/stack patterns + testing (largest bucket — pure accretion, skip):**
python-patterns/testing, golang-patterns/testing, rust-patterns/testing, kotlin-patterns/testing/coroutines-flows/exposed/ktor, java-coding-standards, cpp-coding-standards/testing, csharp-testing, dotnet-patterns, fsharp-testing, perl-patterns/testing, dart-flutter-patterns, flutter-dart-code-review, swift-actor-persistence/concurrency-6-2/protocol-di-testing, swiftui-patterns, foundation-models-on-device, liquid-glass-design, react-patterns/performance/testing, nextjs-turbopack, nuxt4-patterns, vite-patterns, angular-developer, nestjs-patterns, fastapi-patterns, django-patterns/celery/tdd/verification, laravel-patterns/tdd/verification/plugin-discovery, quarkus-patterns/tdd/verification, springboot-patterns/tdd/verification, jpa-patterns, prisma-patterns, postgres-patterns, mysql-patterns, redis-patterns, clickhouse-io, bun-runtime, error-handling, api-design, backend-patterns, frontend-patterns, hexagonal-architecture, android-clean-architecture, compose-multiplatform-patterns, mcp-server-patterns, database-migrations, docker-patterns, deployment-patterns, coding-standards, **tdd-workflow**, e2e-testing, ai-regression-testing, git-workflow, github-ops, tinystruct-patterns, pytorch-patterns, mle-workflow, recsys-pipeline-architect.

**I. Frontend / design / motion (web accretion, skip — APEX has its own UI cluster):**
design-system, frontend-design-direction, frontend-a11y, accessibility, make-interfaces-feel-better, motion-foundations/patterns/advanced/ui, frontend-slides, ui-demo, ui-to-vue, ios-icon-gen, seo.

**J. Business-ops (author's startup — irrelevant):**
brand-voice, content-engine, crosspost, social-publisher, social-graph-ranker, connections-optimizer, marketing-campaign, market-research, investor-materials, investor-outreach, lead-intelligence, customer-billing-ops, finance-billing-ops, email-ops, messages-ops, unified-notifications-ops, google-workspace-ops, project-flow-ops, jira-integration, article-writing, x-api.

**K. Vertical industry packs (client work — irrelevant):**
healthcare-cdss/emr/eval-harness/phi-compliance, homelab-network-readiness/setup/pihole-dns/vlan/wireguard, cisco-ios-patterns, network-bgp/config-validation/interface-health, netmiko-ssh-automation, ito-basket-compare/data-atlas/market-intelligence/trade-planner, prediction-market-oracle/risk-review, agent-payment-x402, logistics-exception/inventory-demand/returns-reverse/production-scheduling/quality-nonconformance/customs-trade/carrier-relationship/energy-procurement, scientific-db-pubmed/uspto, scientific-pkg-gget, scientific-thinking-literature-review/scholar-evaluation, latency-critical-systems.

**L. Media / docs (irrelevant):**
manim-video, remotion-video-creation, video-editing, videodb, fal-ai-media, nutrient-document-processing, visa-doc-translate, blender-motion-state-inspection, dashboard-builder.

**M. Infra / runtime / env (mostly irrelevant):**
flox-environments, uncloud, data-scraper-agent, data-throughput-accelerator, windows-desktop-e2e, api-connector-builder.

---

## 4. Exhaustive agent taxonomy (all 63, bucketed)

- **General workflow (relevant as design references):** planner, architect, code-architect, code-explorer, **code-reviewer**, **code-simplifier**, **refactor-cleaner**, **silent-failure-hunter**, **comment-analyzer**, **type-design-analyzer**, **tdd-guide**, **security-reviewer**, performance-optimizer, doc-updater, docs-lookup, e2e-runner, pr-test-analyzer, **harness-optimizer**, conversation-analyzer, **loop-operator**, chief-of-staff, marketing-agent, seo-specialist.
- **Per-language reviewers (15) + build-resolvers (12):** {python,typescript,go,rust,java,kotlin,cpp,csharp,fsharp,react,flutter,swift,django,fastapi,database,healthcare,mle,network-config}-reviewer; {build-error,cpp-build,go-build,java-build,kotlin-build,rust-build,react-build,swift-build,dart-build,django-build,pytorch-build,harmonyos-app}-resolver. → pure accretion.
- **GAN harness (3):** gan-planner, gan-generator, gan-evaluator (Generator-Evaluator loop, Anthropic Mar-2026 paper). → concept reference for adversarial build/verify.
- **Open-source pipeline (3):** opensource-forker/sanitizer/packager. → irrelevant.
- **Network/homelab (3):** network-architect, network-troubleshooter, homelab-architect. → irrelevant.
- **a11y:** a11y-architect.

**Verdict:** the agent roster is dominated by per-language reviewer/resolver pairs (APEX deliberately uses *one* generic dispatched reviewer pointed at a domain skill — ADR-007 — which is leaner and is the better design). Only the *generic* analyzers (silent-failure-hunter, type-design-analyzer, comment-analyzer, code-simplifier) are interesting as review *lenses* APEX's reviewer could adopt.

---

## 5. Deep dive — the meta cluster, with APEX verdicts

Each read in full from source.

| ECC mechanism | What it is | APEX verdict |
|---|---|---|
| **gateguard** | PreToolUse gate: DENY first edit → FORCE fact-gathering (list importers, schemas, quote instruction verbatim) → ALLOW retry. A/B: +2.25/10 vs ungated. "Self-eval doesn't work; force investigation." | **ADOPT.** Upgrades apex-code Karpathy pre-flight from self-verification to *forced* investigation. Hook-based (fits existing pattern). |
| **continuous-learning-v2** | Instincts: Pre/PostToolUse hooks → `observations.jsonl` → Haiku observer → atomic instinct files (`~/.claude/homunculus/`, frontmatter `{id,trigger,confidence,domain}`) → confidence 0.3–0.9 (auto-apply ≥0.7) → `/evolve` clusters ≥3 → skill/command/agent; global after 2+ projects. | **ADOPT (adapt).** APEX's #1 gap. Map onto existing memory system (user/feedback/project/reference) + promotion via apex-skill-author. Needs a deep-dive first. |
| **context-budget** | Inventories agents/skills/rules/MCP/CLAUDE.md, estimates tokens (`words×1.3`, `chars/4`), classifies Always/Sometimes/Rarely, ranked "top-3 savings". MCP≈500 tok/tool; agent descriptions always loaded. | **ADOPT.** New planning-mode analysis skill `apex-context-budget`. Pure reasoning, no code. Directly serves leanness. |
| **skill-comply** | Auto-generates behavioral spec from any `.md`, runs `claude -p` at 3 strictness levels (supportive→neutral→competing), classifies tool traces, reports compliance %. "Prompt independence." | **ADOPT (fold in).** Add a "competing-prompt" strictness level to apex-skill-author's Iron Law baseline. |
| **santa-method** | Dual independent reviewers, context-isolated, identical rubric; **both must pass** or fix-loop. Breaks single-reviewer shared-bias. | **ADOPT (selective).** For critical/high-risk specs, run apex-wave-reviewer/apex-reviewer as *two* isolated passes. |
| **council** | Four voices for ambiguous decisions: in-context Architect + fresh Skeptic/Pragmatist/Critic subagents (only the question, no convo history = anti-anchoring). | **ADOPT.** Anti-anchoring upgrade to apex-deep-dive / apex-plan for go/no-go calls. |
| **safety-guard** | PreToolUse: Careful (block destructive cmds) / Freeze (lock writes to a dir) / Guard (both). | **ADOPT (partial).** Freeze mode = APEX surgical scope-lock made *enforced*. Careful = APEX hard-blocks made *deterministic*. |
| **rules-distill** | Scan skills → extract principles appearing in 2+ skills → promote to rule files. "Deterministic collection + LLM judgment." | **ADOPT (maintenance).** Keep apex-coding-principles / impl.md cores in sync as the skill set grows. |
| **skill-stocktake** | Audit all skills/commands vs quality checklist; Quick Scan (changed only, `results.json` cache) vs Full; subagent batch eval. | **ADOPT (maintenance).** Automates APEX's manual SP5-style sweeps; fits apex-refresh / apex-skill-author audit mode. |
| **strategic-compact** | Suggest `/compact` at phase boundaries + decision table + "what survives compaction" table. | **ADOPT (guidance).** Fold tables into apex-orchestrate/governance; hook optional. |
| **agent-harness-construction** | Action-space/observation/recovery/context-budget model. Observation contract: every response `{status,summary,next_actions,artifacts}`. | **Reference.** APEX agent outputs already structured (BLOCK/FLAG/CLEAN); adopt the observation contract for consistency. |
| **agentic-os** | "Claude Code as OS": kernel CLAUDE.md router + markdown agent registry + file memory + no DB. | **Confirms APEX.** APEX already *is* this, more rigorously (two-backend split). No action. |
| **verification-loop** | Hardcoded npm/pnpm build→type→lint→test→security→diff phases. | **APEX ahead.** APEX's stack-agnostic Verification Recipe (ADR-005/006) is superior. No action. |
| **ck (context-keeper)** | `/ck:save` analyzes convo → `{summary,leftOff,nextSteps,decisions,blockers}` JSON via deterministic Node. | **Confirms APEX.** ≈ APEX handoff + status In-Flight; automation is the gap (= instinct loop). |
| **governance-capture** (hook) | Auto-captures governance/audit events. | **Consider.** Could implement APEX's L4+ audit-log requirement deterministically. |
| **iterative-retrieval** | Subagent context problem: DISPATCH→EVALUATE→REFINE→LOOP (max 3). | **Reference.** Useful if APEX subagent dispatch hits context-completeness issues. |
| **parallel-execution-optimizer** | Lane matrix + write-surface-collision check before parallelizing. | **Reference.** Sharpens apex-code wave grouping (collision lens). |
| **gan-style-harness** | Generator↔Evaluator loop until rubric pass (Anthropic paper). | **Reference.** Pairs with santa-method for autonomous build/verify. |
| **recursive-decision-ledger** | Marked rollouts; "recursive confidence ≠ approval; default dry-run." | **Confirms APEX** hard-blocks/autonomy. Park. |

---

## 6. APEX vs ECC — philosophical contrast

| Axis | ECC | APEX |
|------|-----|------|
| Posture | Load-everything (249 skills) | Lean; load matched specialist; subagents for fresh context |
| Context | Optimize a heavy baseline after the fact | Prevent rot up front |
| Modes | One agent, proactive routing | Two backends (plan/code) + hard write-guard |
| Spec | Skills + TDD inline | Spec = execution script (no-why, files-per-task), plan→code |
| **Enforcement** | **Deterministic (hooks)** | **Prose in skills** (scope-lock, hard-blocks, pre-flight) ← the gap |
| **Learning** | **Automatic (instincts)** | **Manual (handoff + memory)** ← the gap |
| Reviewers | Per-language roster (63 agents) | One generic dispatched reviewer (ADR-007) ← leaner |
| Verification | Hardcoded npm/pnpm | Stack-agnostic recipe ← ahead |
| Tooling | Node + Rust + Python + tests | Pure markdown repo; 2 harness hooks in settings.json |

**Lesson:** don't import ECC's architecture — import the ~8 instruments that fix APEX's two real weaknesses (**prose-only enforcement** and **manual learning**), re-expressed APEX-native.

---

## 7. Incorporation plan — ranked (each = candidate spec, not yet written)

### Tier 1 — high value, clean fit
1. **gateguard → apex-code pre-flight.** Add a fact-forcing gate (DENY→FORCE→ALLOW) to the Karpathy pre-flight: before first Edit/Write per file, the agent must list importers (Grep), affected public surface, and quote the spec task verbatim. Coding-mode (DeepSeek) is exactly where forced investigation pays off. *Touches:* `apex-code` impl.md + a `~/.claude/settings.json` PreToolUse hook (mirrors existing write-guard).
2. **`apex-context-budget` (new skill).** Port context-budget as a planning-mode analysis skill (reasons over skill/registry/MCP/CLAUDE.md files, no code). Keep the heuristics verbatim. *Touches:* new skill + registry/index/history triple-write via apex-skill-author.
3. **skill-comply → Iron Law.** Add a "competing-prompt" strictness level to apex-skill-author's baseline protocol (does the skill fire when the prompt doesn't spoon-feed it?). *Touches:* `apex-skill-author` SKILL.md. Low effort, high leverage.

### Tier 2 — strong, needs a little judgment
4. **Instinct/continuous-learning loop.** Adapt the hook-deterministic capture + confidence + `/evolve` promotion onto APEX's existing memory system. **Highest capability gain, most invasive — run an `apex-deep-dive` first** (build-here vs defer given the Mac-Mini/DeepSeek split; storage format; promotion → apex-skill-author).
5. **santa-method → critical-spec review.** For specs flagged high-risk, run two context-isolated reviewer passes; both must pass. *Touches:* `apex-reviewer` / `apex-wave-reviewer` + apex-plan readiness gate.
6. **council → ambiguous decisions.** Anti-anchoring four-voice for go/no-go. *Touches:* `apex-deep-dive` (primary), optionally apex-plan.
7. **safety-guard freeze + careful → apex-governance.** Make surgical scope-lock and destructive-command hard-blocks *deterministic* via PreToolUse, not just prose. *Touches:* `apex-governance` + settings.json hook.
8. **rules-distill + skill-stocktake → maintenance.** Periodic: distill cross-cutting principles into apex-coding-principles/impl.md cores; audit skill quality (Quick Scan of changed skills). *Touches:* `apex-skill-author` / `apex-refresh`.
9. **prompt-defense baseline → CLAUDE.md.** Add ~6 lines of agent-self-defense (untrusted-content handling, secret non-disclosure, injection resistance). *Touches:* global `~/.claude/CLAUDE.md` and/or apex/CLAUDE.md.
10. **strategic-compact guidance → apex-orchestrate.** Adopt the phase-boundary compaction + "what survives" tables.

### Tier 3 — concept / park
- governance-capture hook → deterministic L4+ audit log.
- agent-harness-construction observation contract `{status,summary,next_actions,artifacts}` → standardize APEX agent returns.
- iterative-retrieval / parallel-execution lane-matrix / gan-style harness → references for subagent dispatch + wave grouping if needed.
- AgentShield adversarial (attacker/defender/auditor) → concept for apex-security multi-pass.
- mine-git-history → skills → future apex-init "learn conventions from existing repo" (ECC's paid product).

### Reject outright
249-skill / 63-agent breadth and full-load · per-language reviewer roster (ADR-007 generic reviewer is better) · cross-harness mirror dirs · `ecc2/` Rust · Tkinter dashboard · Node test suite · tiered installer/plugin packaging · all domain/vertical/business-ops packs (buckets H–M).

---

## 8. Recommended next steps
1. **Quick wins:** spec **#3 (skill-comply level)** + **#9 (prompt-defense baseline)** — small, markdown-only, immediate.
2. **#2 (`apex-context-budget`)** — self-contained new skill, serves the finalisation leanness goal.
3. **#1 (gateguard pre-flight)** + **#7 (safety-guard)** — pair them as the "deterministic enforcement" spec (one settings.json hook addition + impl.md/governance edits).
4. **`apex-deep-dive` on #4 (instinct loop)** before any spec.
5. Park #5–#6, #8, #10, Tier 3 as Future Discussions in `status.md`.

---

## 9. Clone / sweep status
Done: shallow clone at `C:\Users\User\ecc-tmp` (gitignored location, outside the APEX repo). Read every skill frontmatter, every agent, rule packs, `hooks.json` + `scripts/hooks/` listing, and the full meta cluster. **Remaining depth only if a port is green-lit:** read `scripts/hooks/gateguard-fact-force.js`, `observe-runner.js`, `suggest-compact.js` for exact mechanism. The clone can be deleted now (`rm -rf C:\Users\User\ecc-tmp`) or kept for the hook-internals read.

## 10. Design cluster — deep look (what APEX can actually add)

[VERIFIED — read `make-interfaces-feel-better`, `frontend-design-direction`, `design-system`, `motion-foundations`, `motion-patterns`, `design-quality-check.js`; gap-checked against APEX `apex-ui-ux-design`, `apex-design-system`, `apex-animation`, `apex-accessibility`, `apex-frontend`.]

ECC's design skills are React/Tailwind/`motion-react`-specific (APEX's are stack-neutral with a web default), so the *value is the concrete detail*, not the structure. Gap-grep across APEX's five design skills confirms what's genuinely missing (0 = absent today):

| ECC detail | APEX coverage | Verdict |
|---|---|---|
| Concentric radius (`outer = inner + padding`) | 0 | **ADD** |
| Optical alignment (geometric ≠ visual centering; icon offsets) | 0 | **ADD** |
| `tabular-nums` for counters/prices/timers | 0 | **ADD** |
| `text-wrap: balance` (headings) / `pretty` (body) | balance ×1, pretty 0 | **ADD pretty + codify** |
| Font-smoothing (`-webkit-font-smoothing: antialiased`) | 0 | **ADD** |
| Image inset outline (`outline-offset: -1px`) | 0 | **ADD** |
| **AI-slop detection list** (purple gradients, purposeless glassmorphism, `grid-cols-3/4`, centered hero over gradient, "Get Started"/"Learn more", default font stacks) | slop 0, gradient 0, grid-cols 0 | **ADD** (high value — the anti-generic-AI checklist) |
| **Scored visual-audit rubric** (10 dims × 0–10, fix at file:line) | 0 | **ADD** (APEX has no scored UI audit; GSD's `gsd-ui-review` is a separate plugin) |
| Motion: SSR/hydration-safe `initial` (matches server output) | hydration 0, SSR ×1 | **ADD** to apex-animation web refs |
| Motion: `layoutId` / `layout` shared-element patterns | 0 | **ADD** |
| Motion: stagger interval 0.05–0.10s, `mode="wait"` rule | partial | **codify** |
| `design-quality-check.js` PostToolUse anti-slop hook | n/a | **CONSIDER** (deterministic frontend-edit guard) |
| reduced-motion, `AnimatePresence`, empty/loading states, touch targets, glass | ✓ (2–4 files each) | already covered — skip |

**Design recommendations (each = additive skill edit, stack-neutral principle + web example per SP5/SP6):**
- **D1 — Micro-polish pack → `apex-ui-ux-design`** (or `apex-design-system` references/web): concentric radius, optical alignment, tabular-nums, text-wrap balance/pretty, font-smoothing, image inset outline. Highest-value, lowest-risk design add.
- **D2 — AI-slop checklist + scored visual-audit rubric → `apex-ui-ux-design`** review section. Gives APEX a concrete "is this generic AI output?" gate and a 10-dimension scored audit mode.
- **D3 — Motion gaps → `apex-animation` references/web.md**: SSR/hydration-safe initial states, `layoutId`/`layout` patterns, stagger + `mode="wait"` rules.
- **D4 — `design-quality-check` PostToolUse hook** (coding mode): flags generic UI signals on frontend edits. Part of the deterministic-enforcement cluster (with gateguard/safety-guard).

## 11. Execution plan for all recommendations

**Process facts that shape the plan:** (a) skill `.md` edits are done **directly in planning mode** (memory `skill-authoring-workflow`); (b) every skill change is gated by `apex-skill-author` (Iron Law baseline + registry/index/`SKILL-HISTORY` triple-write); (c) Iron Law depth is **lightweight** for convention/structural edits, **full RED/GREEN** for a new domain skill (memory `iron-law-application-depth`); (d) hooks are `.js` in `~/.claude/` (write-guard-exempt) but wiring `settings.json` changes harness behaviour → **needs explicit user approval**; (e) coding/app-style work routes to a DeepSeek spec, but these are APEX-system edits, so most are planning-mode.

### Phase 0 — Register + decide (do first)
- **0a.** Add an "ECC absorption" track to `docs/status.md` Pending with the items below. *(planning, 5 min)*
- **0b.** `apex-deep-dive` on the **instinct loop** (#4) — build-here-vs-defer given Windows-plan / Mac-DeepSeek split, storage format, promotion→apex-skill-author. **Gates Phase 6 only.** *(planning research; output = ADR or research doc)*

### Phase 1 — Quick markdown wins (planning mode, low risk, parallel)
| # | Edit | File(s) | Iron Law |
|---|---|---|---|
| P1.1 | skill-comply "competing-prompt" strictness level | `apex-skill-author` SKILL.md | lightweight |
| P1.2 | Prompt-defense baseline (~6 lines) | `~/.claude/CLAUDE.md` (+ note in `apex/CLAUDE.md`) | n/a (not a skill) |
| P1.3 | **D1** micro-polish pack | `apex-ui-ux-design` (refs) | lightweight |
| P1.4 | **D2** AI-slop checklist + audit rubric | `apex-ui-ux-design` SKILL.md | lightweight |
| P1.5 | **D3** motion gaps | `apex-animation` references/web.md | lightweight |
| P1.6 | strategic-compact guidance tables | `apex-orchestrate` or `apex-governance` | lightweight |
*Each skill edit → SKILL-HISTORY row + registry/index touch as needed.*

### Phase 2 — New analysis skill (planning + apex-skill-author)
- **P2.1 — `apex-context-budget`** new skill (SKILL.md only, planning-mode analysis, no code). Full triple-write + baseline. Registry domain `context-budget`. *(0.5–1 session)*

### Phase 3 — Deterministic-enforcement hooks (needs user approval for `settings.json`)
Bundle as one initiative (mirrors existing write-guard hook pattern):
- **P3.1 — gateguard** fact-forcing PreToolUse → referenced from `apex-code` pre-flight (impl.md).
- **P3.2 — safety-guard** freeze + careful PreToolUse → `apex-governance` (scope-lock + hard-blocks made deterministic).
- **P3.3 — design-quality-check** PostToolUse (frontend anti-slop, **D4**).
*Each = small `.js` in `~/.claude/scripts/hooks/` + `settings.json` wiring + a one-line skill reference. Author in planning under the `~/.claude` exemption OR spec for a coding session — user's call. **Approve each hook before wiring.***

### Phase 4 — Review-architecture upgrades (planning skill edits; may need ADR)
- **P4.1 — santa-method** dual context-isolated reviewers for high-risk specs → `apex-reviewer`/`apex-wave-reviewer` + `apex-plan` readiness gate. *(ADR likely — changes review contract)*
- **P4.2 — council** anti-anchoring four-voice → `apex-deep-dive` (+ optional apex-plan).

### Phase 5 — Maintenance tooling (planning skills)
- **P5.1 — rules-distill** mode → `apex-skill-author` (promote cross-cutting principles to `apex-coding-principles`/impl cores).
- **P5.2 — skill-stocktake** quality-audit (Quick Scan of changed skills) → `apex-refresh` or apex-skill-author audit mode.

### Phase 6 — Instinct loop (after Phase 0b)
- **P6.1** Implement the chosen design from 0b: capture hook (`observe`) + confidence-scored memory entries + `/evolve`-style promotion via apex-skill-author. Largest item; own spec/build. *(may route to DeepSeek)*

### Dependency / ordering summary
```
0a ─┬─ Phase 1 (parallel) ─┐
    ├─ Phase 2 ────────────┤
    ├─ Phase 3 (gated: user approves hooks)
    ├─ Phase 4 (P4.1 → ADR first)
    ├─ Phase 5
    └─ 0b ── Phase 6
```
**Recommended actual order:** Phase 1 (immediate, I can start now) → Phase 2 → Phase 4 → Phase 5 → 0b deep-dive → Phase 3 (hooks, on approval) → Phase 6. Phase 3 is sequenced late only because it needs your sign-off; the design + skill content lands first.

**Per-item verification** (acceptance, APEX-style): each skill edit → baseline test passes at its Iron Law depth + SKILL-HISTORY row added; `apex-context-budget` → produces a token report on the live `~/.claude/skills` set; hooks → fire on a probe edit/command and block/warn as specified; santa-method → two isolated verdicts both required on a sample spec; instinct loop → a probe correction produces a confidence-scored entry.

## Sources
- `affaan-m/ECC` `main` (shallow clone) — README, CLAUDE.md, AGENTS.md, `hooks/hooks.json`, `scripts/hooks/`, `rules/common/`, and skills: continuous-learning-v2, context-budget, skill-comply, strategic-compact, hookify-rules, recursive-decision-ledger, agentic-os, agent-harness-construction, verification-loop, santa-method, council, gateguard, parallel-execution-optimizer, plan-orchestrate, safety-guard, rules-distill, skill-scout, skill-stocktake, ck, token-budget-advisor, iterative-retrieval. [VERIFIED]
- ecc.tools / ECC-Tools org (GitHub App). Augment Code + Medium ("dividing the developer community") write-ups. [COMMUNITY]
