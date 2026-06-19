# Project: APEX — Coding/Development System
_A system of AI-assisted development skills for Claude Code: orchestration, planning, coding, debugging, and specialist domain tools._

stack: Markdown / Claude Code skills
token_profile: balanced
autonomy_level: L2
specialists_default: []
backends: planning=claude | coding=deepseek-v4-flash

_Last updated by planning mode:_ 2026-06-19 (session 50 — homed the P6-maths context-exhaustion backlog into In-Flight: ADR-015 return-contract violation in `apex-coder.md` Step 5 + launch overhead; scope A/A+B/A+B+C parked. Was mis-logged to the stale `~/.claude/docs/status.md` fossil). 2026-06-17 (session 49 — Pro coder tier EMPIRICALLY VALIDATED: a real DeepSeek V4 Pro build ran end-to-end on Windows; status corrected — Pro tier proven live + eval head-to-head re-tagged `coding-session`-gated not Mac-gated. Session 48 — Impeccable absorption pass CLOSED: prose four RED-probe-rejected; 44-rule deterministic detector ADOPTED as opt-in web-UI advisory reference → ADR-022)
_Last updated by coding mode:_ 2026-06-16 (session 43 — built pro-mode-mechanics: PowerShell toggle, hook tier detection, SKILL.md status line, BACKEND-ROUTING docs)

<!-- CODING:START -->
## In-Flight
| What | Mode | State | File | Stopped at | Uncommitted |
|------|------|-------|------|------------|-------------|
| SP2 agent-wiring — coding-side | wave domain review | Done | `apex-wave-reviewer.md`, `apex-code/SKILL.md` | — | ✅ 427da16 |
| Step-4 prompt-to-design walkthrough | planning · discussion | parked | `apex-ui-ux-design` § Prompt-to-design lanes | **Clarified session 42 (verified never-started, no progress lost):** the 6-step lane splits — steps 1,2,4 (screen brief → author Bitrig generation prompt → fold into design-brief) are **Windows-runnable now**; only step 3 (run Bitrig) + step 6 (Xcode-Preview visual gate) are Mac-gated. **Next:** do the planning half as a dry-run — author a real Bitrig generation prompt for a chosen SwiftUI screen. **Open Q:** target a real Artemis screen or a throwaway sample? | — |
| Design-capability build (6 bundles) | planning · skill edits | ✅ committed (apex `252ebeb` · ~/.claude `fc61075`) | `docs/research/design-capability/README.md` | All 6 bundles landed + committed (session 35 corrected a stale "uncommitted" mark). Remaining = USER actions only, non-blocking: disconnect Canva connector (Claude app → Connectors), set up free Google Stitch account. | — |
| headroom+ponytail absorb pass | planning · research | ✅ closed · 0 skill edits | `docs/research/headroom-ponytail/` | Flash probe judged (2026-06-15): Task 3 structural trap 0/3 over-built → ladder model-redundant on the real coder, NOT absorbed. headroom dropped; ponytail comment-convention declined; ladder declined. Pass closed permanently. | — |
| pro-mode-mechanics (Phase 0) | coding · implement | ✅ complete | `docs/changes/done/pro-mode-mechanics.md` | All 8 changes implemented — 4 files touched | ✅ 0c415a7 |
| **UI cheap-mockup workflow editing** | planning · skill edits | ✅ committed (~/.claude `de02dfb`,`a730b23` · apex `4bebd88`) | `apex-ui-ux-design` v1.22.0 | Done — UI design workflow built out: ask-first research gate, TASTE step-0, Cursor in-editor mockup preview (Chrome only for multi-variant side-by-side), design→build **archetype-not-page** handoff rule, +3 reference galleries (Awwwards / layers.to / 21st.dev) on Path A. Per-edit detail → git + SKILL-HISTORY. **Optional follow-on only:** comparison `index.html` for true side-by-side variant view. | — |
| **UI design "layer stack" model** | planning · discussion | ✅ residue codified · taxonomy declined (✅ ~/.claude `2411044` · apex `0bec533`) | `apex-ui-ux-design` SKILL 1.23.0 · `docs/research/app-design-ai-era/` | **Researched (3 Sonnet agents) + codified the small residue.** Finding: the L0–L5 layer stack ≈ design tokens + Atomic Design — **canonical/model-redundant → NOT codified** (taxonomy RED-excluded). AI era changes *enforcement + sequencing*, not structure. **Codified into the design→build handoff block:** (1) promote-early/rule-of-one (AI inverts human rule-of-three; drift = component-multiplication); (2) in-repo+inspectable contract (agents ignore imported deps); (3) consistency = 3 gates that only work together (prose-rich brief → commit lint/ADR-022 → visual gate). Rule-of-two debate **resolved** (inverts under blind builder; real lever = enforcement not threshold). **Open Q (unresolved):** does *register* (brand vs product) gate which layers matter? **Optional:** still battle-test on Amazo for further corrections. | apex-ui-ux-design/SKILL.md · SKILL-HISTORY · status · docs/research/app-design-ai-era/ |
| **Impeccable absorption pass** | planning · research/absorb | ✅ done · ADR-022 (✅ ~/.claude `e0b43c7` · apex `027d428`) | `apex-ui-testing` impl 1.5.0 · `apex-ui-ux-design` SKILL 1.22.1 · ADR-022 | **CLOSED.** Report `docs/research/impeccable/` (extraction @1268f10 + absorption-report). **Prose four** (reflex test, colour-commitment axis, cream OKLCH, reveal-gated-on-class bug) → **REJECT**, all reproduced cold by 2 bare-agent RED probes (model-redundant for a planning skill). **26-command arch / extension / scripts** → REJECT (HIGH cost / rival workflow / out-of-scope). **Detector** (44 deterministic LLM-free rules, zero-dep CLI+hook) → **ADOPTED as opt-in, web-UI-scoped, advisory external reference** in apex-ui-testing/impl.md + planning pointer; ADR-022 (refines ADR-012 P3.3 — image-blind-coder framing). **Validation gate:** unproven until first real web-UI coding build (no web-UI project in the APEX repo itself; `coding-session` gate, not Mac-gated). | apex-ui-testing/impl.md · apex-ui-ux-design/SKILL.md · ADR-022 · SKILL-HISTORY · status |
| loop/entropy guardrail (parked) | planning · discussion | ⏸ parked | apex-jobs / apex-system-design / apex-coding-principles | User raised an enterprise systems-engineering critique (geometric reliability decay + cascading state contamination from unbounded retry loops). Mid-diagnosis: APEX **already** defends — ADR-015 one-retry cap, apex-jobs DLQ/backoff/idempotent, apex-system-design circuit-breakers/sagas, coding-principles bounded-retry rule. **Open:** decide whether the *state-contamination* angle needs an explicit named anti-pattern/guardrail or is already covered. | — |
| **Context-exhaustion on parallel builds** | planning · specs ready | 📋 3 specs ready (scope A+B + retire) | `docs/changes/coding-return-contract-enforcement.md` · `apex-code-fanout-cap.md` · `retire-dead-coding-pipeline.md` | Diagnosed from the **P6-maths** build (specs 55–64): main coding session hit 88–100% context dispatching ~8 parallel `apex-coder` agents. **Two root causes:** (1) launch overhead ~12%/agent; (2) **ADR-015 return-contract violation** — agents return growing structured JSON into the parent instead of writing to disk + returning a pointer. **Topology corrected during spec authoring (session 50):** the leak is on **3** return-points, not 2 — `apex-coder.md` Step 5 (the main-context killer, ×8), `code-worker.md` Step 5 (fat JSON that *contradicts* the lean status contract apex-code SKILL already declares, lines 119–122), and the **dead** `code-writer.md`. Registry confirms the canonical pipeline = `apex-coder`→`code-worker`; `coding-pipeline`/`code-writer`/`code-reviewer`/`code-documenter`/`doc-writer` are **unregistered orphans** (pre-APEX GSD generation). **User decided (session 50):** scope **A+B**; **delete** the 5 dead agents (not patch); deliver as **DeepSeek specs**. → 3 specs written: A=`coding-return-contract-enforcement` (apex-coder + code-worker write to `docs/progress/`, return bounded pointer); B=`apex-code-fanout-cap` (default cap 3–4 + wave-boundary `/compact`); `retire-dead-coding-pipeline` (`git rm` the 5 orphans, no registry edit needed). **Resume = run the 3 specs in a DeepSeek coding session.** **Option C update (session 50):** "ultracode"/**dynamic workflows is a REAL native CC feature** (v2.1.183 here, enabled — earlier "made-up name" claim was wrong; verify-env-claims-live miss) and it **IS option C** — a local runtime runs orchestration in an isolated context and returns only the final answer, the exact fix for main-context bloat. Runtime is **local/session-bound** (unlike Cloud Routines → not auto-Claude-only) so it likely inherits the DeepSeek base URL, but **UNVERIFIED on the DeepSeek backend**. Decisive test queued: `docs/changes/verify-workflows-deepseek-compat.md` (interactive, run in a DeepSeek session). **If it PASSes on DeepSeek → A+B reduces to B-only (drop A); if FAIL → keep A+B.** Do not delete the A spec until tested. **Stopgap until then:** batch 3–4 agents + `/compact` between waves. | docs/changes/×4 |
| **CC-workflows absorption pass** | planning · research/absorb | ⏸ report delivered, awaiting decision | `docs/research/cc-workflows-absorption.md` | Map-and-report DONE over 3 native CC capability areas (user-scoped). **Verdicts:** worktree `isolation` for build-recipe-concurrent waves + AFK → **ABSORB** (~0 tok; donor-pass worktree rejection reopened — first-party managed removes the complexity objection); `/code-review ultra` as a *recommended* high-risk/pre-PR gate (billed/can't self-launch → recommend only) → **ABSORB**; native memory → **already adopted** (ADR-021); native plan mode (core) → **REJECT** (two-backend spec split is stronger); plan-mode in Edit Mode → optional consider (likely decline); background Task/remote isolation → **defer to gap #4**. **Resume = answer the Open decision** in the report: (1) land 2 absorbs as direct .md edits vs draft as specs for a coding session; (2) decide Edit-Mode plan-mode; (3) whether to pull autonomous/scheduled gap #4 into scope (worktree is its first building block). Worktree absorb wants 1 `coding-session` validation (concurrent-build collision is real-world). | — |

<!-- CODING:END -->

<!-- PLANNING:START -->
## Pending Specs
| Spec | Summary |
|------|---------|
| `apex-code-fanout-cap.md` | (B) Default fan-out cap 3–4 + wave-boundary `/compact` in apex-code SKILL — bounds launch-overhead context cost. |
| `coding-return-contract-enforcement.md` | (A) apex-coder + code-worker write full output to `docs/progress/`, return a bounded pointer/status line (ADR-015). |
| `retire-dead-coding-pipeline.md` | `git rm` the 5 orphaned pre-APEX agents (coding-pipeline/code-writer/code-reviewer/code-documenter/doc-writer); no registry edit needed. |
| `verify-workflows-deepseek-compat.md` | Interactive probe: do native dynamic workflows / `ultracode` run on the DeepSeek backend? Decides whether Issue-1 option C is solved natively (PASS → drop A, keep B). |

_Applied 2026-06-05 → `done/`: `taste-rules-distill.md` · `research-dispatch-recipe.md`. ✅ committed._
_Applied 2026-06-15 → `done/`: `coding-destructive-command-guard.md`. ✅ 4ffd85a._
_Applied 2026-06-16 → `done/`: `pro-mode-mechanics.md`. ✅ 0c415a7._

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

- **apex-swift recipe** — unproven until the first Mac/Xcode build runs it (v0.1.0 → 1.0.0).

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
