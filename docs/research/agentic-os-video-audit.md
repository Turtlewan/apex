# Audit — APEX vs the "Agentic OS" 9-pillar model

_Source: YouTube "build your own Agentic OS" walkthrough (content/marketing-OS framing). Audited 2026-06-16 (planning session 46)._

## Purpose

Map APEX against the video's 9 pillars to find where a generic agentic-OS model is genuinely
ahead of our coding-specialised system. APEX is itself an agentic OS; this audit asks only:
**which pillars expose a real, coding-relevant gap, and which do we already lead / have consciously
rejected?** Verdict legend: **LEAD** (we're ahead) · **GAP** (real, worth a spec) ·
**REJECTED** (considered + declined, with ADR) · **DEFERRED** (valid but deployment-gated).

## Scorecard

| # | Pillar | Verdict | One-line basis |
|---|--------|---------|----------------|
| 1 | Static context (identity + brand) | **LEAD** | CLAUDE.md chain + memory files + status.md; brand/voice is content-OS, N/A to coding |
| 2 | Improved memory (semantic recall) | **GAP** | Have hook-injection (their L2) + flat file-memory; lack semantic search (their L3) |
| 3 | Repeatable processes (skills) | **LEAD** | Progressive disclosure = SKILL/impl core-split; self-learning declined (ADR-011) |
| 4 | Multi-step workflows on a schedule | **GAP** | Wave-parallel dispatch yes; scheduled/headless autonomous builds no |
| 5 | Tiered planning | **LEAD** | apex-plan / deep-dive / council + scale-adaptive mode + readiness gate |
| 6 | Multi-client architecture | **LEAD** | Per-project repos, CLAUDE.md inheritance, global skills |
| 7 | Output consolidation | **LEAD** | Rigid `docs/` tree = their "predictable place" |
| 8 | Access anywhere (VPS + Telegram) | **DEFERRED** | Mac Mini→AWS path already in memory; video admits they don't do it either |
| 9 | Portability of the architecture | **LEAD** | Pure-markdown, tool-agnostic by construction |

**Net: 6 LEAD · 2 GAP · 1 DEFERRED.** The two GAPs (memory, scheduled autonomy) are the only
coding-relevant improvement threads.

---

## Pillar-by-pillar

### 1. Static context — LEAD
Their model: `claude.md`/`agents.md`/`soul.md` identity files + shared brand-context folder injected
at the right time. APEX equivalent: the CLAUDE.md chain (global + project), the memory files
(`user`, `feedback`, `project`, `reference` types), and `status.md`. The "brand voice / ICP /
positioning" half is a *content-OS* concern — it 3-10×'s knowledge-work output, but APEX builds
software, so it's out of scope. **No action.**

### 2. Improved memory — GAP (the headline finding)
Their L1=CLAUDE.md rules, L2=SessionStart hook (deterministic injection), L3=semantic search
(`claude-mem` / `mem-search`) for meaning-based recall across sessions, L4-6 optional bolt-ons.
They call L1+L2+L3 the 80/20.

APEX has **L1 ✅** (CLAUDE.md) and **L2 ✅** (SessionStart hook injects status.md + handoff + routing).
APEX lacks **L3**. Today's recall model:
- `MEMORY.md` is a **flat index loaded in full every session** — grows linearly, every line taxes
  context every session, permanently.
- "What did we decide about X weeks ago" = manual grep over `docs/handoff/`, ADRs, `SKILL-HISTORY.md`.

The tension: L3 cuts against **apex-context-budget** (lean-context discipline) and our standing rule
*don't add infra the planning/coding split already covers*. Also relevant: the AgentMD study
(`docs/research/agentmd-context-files-study.md`, arXiv:2602.11988) found auto-generated context files
*hurt* success and add ~20% cost tax — a caution flag against naive memory-file proliferation.
**Not a slam-dunk; warrants a real deep-dive, not a reflexive yes.** → Backlog #1.

### 3. Repeatable processes (skills) — LEAD
Their advice: short/modular skills, progressive disclosure (<200 lines), reference brand context,
self-learning via a `learnings.md` feedback loop. APEX: every capability *is* a skill; progressive
disclosure is our two-tier SKILL.md/impl.md core+references split (SP6); skills bind to stack
context via `## Stack assumptions`. Their **self-learning loop we deliberately rejected** — the
ECC instinct-engine deep-dive (ADR-011) converged no-go: auto-promotion lets a weak coding model
poison skills; APEX uses human-gated promotion via `apex-refresh --stocktake`. Considered, not missing.
**No action** (our model is the more defensible one for a weak-coder backend).

### 4. Multi-step workflows on a schedule — GAP
Their model: chain skills into "skill systems," run them as **scheduled tasks** (Claude desktop),
human-in-the-loop steps optional, "go away from the laptop." APEX has rich *interactive*
orchestration (apex-coder waves, parallel agents, dual review) but **no scheduled or headless path** —
everything runs in the Cursor terminal with you present. Building blocks exist (`CronCreate`/`schedule`
tooling; `run_in_background`; the `coding-pipeline` orchestrator agent). Blockers: (a) headless APEX
runs hit the **capped credit pool**, not the subscription (memory `claude-agent-sdk-billing-split`);
(b) most value needs the system off-laptop (pillar 8). Smaller first step: a *triggered* (not timed)
headless build of a ready spec, with HITL approval gate. → Backlog #2.

### 5. Tiered planning — LEAD
Their advice: don't rely on built-in plan mode for complex work; adopt 3-4 planning levels (PRD-style
scoping + GSD phase breakdown). APEX: apex-plan (spec = execution script), apex-deep-dive (researched
option analysis), council mode (ADR-010), scale-adaptive planning, the readiness gate, ADRs. We absorbed
GSD's useful ideas and archived the rest (ADR-018, `apex-sole-coding-workflow`). **No action.**

### 6. Multi-client architecture — LEAD
Their model: parent CLAUDE.md methodology + per-client folders that override, per-client brand/memory,
shared skills at root. APEX: each project is its own repo with its own `docs/` + status.md (Artemis at
`~/artemis`); CLAUDE.md inheritance (global → project); skills global at `~/.claude/skills`. Same shape,
already implemented. **No action.**

### 7. Output consolidation — LEAD
Their pain: outputs scattered in terminal/random files. APEX: the `docs/` contract (`changes/`,
`changes/done/`, `drafts/`, `handoff/`, `research/`, `findings/`, `technical/adr/`) is exactly the
"predictable place per project per type." **No action.**

### 8. Access anywhere — DEFERRED
Their fix: run on a VPS/Claude-cloud + message it via Telegram/Discord (Anthropic channels). They
admit they run off their laptop too. APEX's path is already captured: Mac Mini = dev+prod, AWS for
future scale (memory `project-deployment`). Pairs naturally with pillar 4 (scheduled runs need an
always-on host). **Deferred — deployment-gated, revisit when the Mac Mini host is live.**

### 9. Portability — LEAD
Their closing point: the architecture outlives the tools. APEX is pure markdown + Claude Code
primitives, no code/build step (project CLAUDE.md), so it's maximally portable by construction.
**No action.**

---

## Ranked backlog

1. **Memory / semantic recall** (GAP, not deployment-gated, highest leverage) — `apex-deep-dive`:
   does a semantic-recall layer beat the flat `MEMORY.md` + handoff-grep model at our scale, weighed
   against apex-context-budget and the AgentMD cost-tax evidence? Output: a decision (adopt / adopt-lite /
   flat-model-is-correct), no code.
2. **Scheduled / headless autonomous builds** (GAP, partly deployment-gated) — scope a *triggered*
   headless build of a ready spec with a HITL gate; resolve the credit-pool billing implication first.
   Larger; do after #1.
3. **Access anywhere** (DEFERRED) — fold into the Mac Mini deployment milestone; no standalone work now.

## Addendum — second "agentic OS" video (Chase AI, 3-step) digested 2026-06-16
A second walkthrough framed as Architecture → Memory → Observability. ~80% dedup with the 9-pillar
audit; nets one corroboration + one new low-priority candidate:
- **Architecture (domains→tasks→skills→automations):** APEX already is this (skill set + `registry/domains.md`
  + apex-skill-author). Only live piece = **automations** = gap #4 (in research).
- **Memory (Karpathy raw/wiki/output, "no vector DB needed — markdown is fine"):** independent
  corroboration of **ADR-021**. Nothing to build; strengthens the evidence base.
- **Observability dashboard (skill-buttons + usage panel):** the one net-new idea. **Discounted for us
  by the video's own logic** — author concedes the button-launcher is for non-terminal teams/clients,
  not terminal-adept solo users. Usable kernel = **usage observability** (cost/limit/routine tracking),
  logged as a new low-priority candidate, naturally bundles with #8/host work. Not pursued now.

## Addendum — third video (12x.ai "Architect/Builder method") digested 2026-06-16
Verdict: **REJECTED (APEX is a superset).** No research dispatch — pure dedup, no live factual question.
The method maps 1:1 onto APEX: Architect/Builder = planning/coding split; folder-is-handoff = `docs/`
contract + git-as-changelog; per-sprint architect pack (requirements/blueprint/acceptance/handoff) =
an APEX spec's sections; dry-run-summarize-before-coding = Karpathy pre-flight + worker contract;
one-sprint-one-fresh-chat = wave dispatch + fork boundary; "cleaner context beats more" + anti-junk-
drawer CLAUDE.md = SP6 core/references split + apex-context-budget; decisions/risks/questions/domain/
data-model docs = ADRs + status.md + ADR-008. Third independent practitioner converging on APEX's design
= corroboration, not addition.
- **One marginal candidate (not a gap):** the video makes the **architect-reviews-every-build-summary**
  round-trip mandatory + per-sprint; APEX's planning-reviews-build step is lighter/opt-in by design
  (weak-coder + token cost; `cross_model_review` is the heavy path, Mac-gated). Conscious calibration.
- **Artemis:** the method already applies (Artemis is built via APEX). Two of the video's first-class
  `docs/` artifacts matter MORE for Artemis and should be populated deliberately there (in `~/artemis`,
  not here): **validation/provenance** (RAG answer→source grounding as a correctness property) and
  **permissions** (multi-integration OAuth access as a documented artifact). Capability already exists
  (apex-ai-systems/apex-search/ADR-008/apex-auth) — these are lenses, not new builds.

## Addendum — fourth video ("anti-vibe-coder's guide" hacks) digested 2026-06-16
Verdict: **REJECTED (all system-level hacks covered).** No research dispatch — pure dedup. Plan-mode,
"treat AI like a junior dev with ADHD" (= APEX's weak-coder-gets-literal-specs premise), compound-
engineering via CLAUDE.md/rules, MCP/Context7, Mobbin design-steal-with-colour+font-constraint → all
already LEAD in APEX. **4th straight corroboration**, incl. a 3rd independent warning against the
over-stuffed CLAUDE.md junk-drawer → strong triangulation that apex-context-budget is right.
- **Out of scope (not APEX):** voice-dictate prompts (user ergonomics); pair-programming/learning
  philosophy (human-skill, not build-system).
- **Marginal candidates (logged, not acted):** explicit MCP-server permission-vetting line in
  apex-security (user runs ~8 MCP servers); Mobbin real-app reference screenshots as optional
  design-brief input.
- **Artemis item (real, belongs in `~/artemis`):** the video's WhatsApp→intent→Gmail→reply→confirm demo
  IS an Artemis workflow → genuine build-vs-orchestrate question — self-hosted **n8n** layer (on the Mac
  Mini) vs **coded connectors** (apex-jobs/apex-google/apex-realtime) for Artemis's integration layer.
  A real future Artemis deep-dive, not an APEX change, not now.

## Addendum — fifth video ("800 hours / six Claude Code features") digested 2026-06-16
Verdict: **REJECTED (all covered).** No research dispatch — pure dedup. `#`-quick-memory, custom
slash-commands, MCP/Context7, GIGO + plan-mode-Q&A + fresh-session-review-before-prod → all LEAD.
**5th straight corroboration.** Two especially valuable validations:
- **Subagents = tasks NOT roles** (video found role-personas gave *worse* results) → independently
  confirms APEX's task-scoped agent roster (apex-reviewer/wave-reviewer/code-worker/docs-agent) +
  ADR-015 bounded-return contracts; council Skeptic/Pragmatist/Critic are anti-anchoring stance
  prompts (given only the question), not autonomous roleplay actors.
- **Review recently-touched files in a NEW session before prod** → confirms APEX's dispatched
  fresh-context review (ADR-007/010).
- **Plugins (forward-looking):** "clone others' setups" = **REJECTED** (ADR-018 / sole-coding-workflow —
  reintroduces rival workflows). "Package **APEX itself** as a plugin/marketplace" = **low-pri
  portability candidate** (cleaner than the `~/.claude` blanket-gitignore + `git add -f` distribution;
  ties to `project-deployment` + portability memories). Not now.

## Addendum — sixth video ("perfect memory" 4-pillar build) digested 2026-06-20
Verdict: **REJECTED for APEX (already decided — ADR-021 + ADR-011); ~95% dedup for Artemis.** No
research dispatch — the memory deep-dive was already done (ADR-021 research + Council). This is the
most memory-specific video in the series; it cherry-picks four pillars from named OSS projects:
1. **Cite sources** (GBrain) — answer with exact file/line/date/decider + admit gaps. *APEX:* coding
   memory is hand-curated + fully loaded; provenance is git/handoff/ADR. N/A as a memory feature.
   *Artemis:* already in BACKLOG — "anti-hallucination brain invariants (gap-tagging, multi-index
   citation verify, claim-audit)" + the 12x.ai-addendum validation/provenance lens. Already core.
2. **Frozen-snapshot injection** (Hermes) — capped curated context loaded by a SessionStart hook.
   *APEX:* this is exactly our **L2** (hook injects status.md + MEMORY.md + handoff) — already **LEAD**.
   *Artemis:* M4 auto-inject. Covered.
3. **Semantic + keyword hybrid recall** (Memsearch / PGLite+PGVector) — meaning-based search.
   *APEX:* **explicitly REJECTED — ADR-021** (memory ~2–5K tok, ~10× under the semantic-payoff onset;
   simple-RAG-beats-semantic at this scale; vector daemon breaks git-as-changelog). *Artemis:* IS the
   core RAG engine (M3 hybrid vector+keyword) — corroboration, not addition.
4. **Scoped team access** (GBrain, Postgres row-level security) — multi-user memory isolation.
   *APEX:* out of scope (single-user coding). *Artemis:* **out of scope too** — Artemis is single-owner,
   local-first, privacy-walled (ADR-001/002). Team/agency scoping fits neither; recorded so it isn't
   re-litigated.
- **Two "new" mechanisms are both already-rejected patterns:** (a) the **stop-hook auto-promote**
  ("after every turn, judge if a durable fact → write memory.md, dedup") is the **auto-learning loop
  APEX rejected in ADR-011** (weak-coder poisoning; APEX uses human-gated promotion via
  `apex-refresh --stocktake`); (b) **back-catalog import** (turn old session history into memories on
  day 1) would bloat the flat memory and trips the AgentMD cost-tax caution (arXiv:2602.11988). Both
  REJECT for APEX. For Artemis, "auto-capture durable facts" = the M4 write path + ingest, already scoped.
- **One marginal sharpening for Artemis (logged to BACKLOG, not built):** the video's recall UX returns
  a past decision **plus a temporal-freshness check** ("…and no newer discussion has superseded this
  since {date}"). Artemis's citation items are source-grounding, not supersession-on-recall — a small,
  concrete refinement to the M3/M4 answer layer. Added as a backlog line.
- **Net:** nothing to absorb into APEX; the video is the **6th straight corroboration** of ADR-021's
  flat-memory bet and APEX's hook-injection design. Artemis's existing second-brain backlog already
  spans pillars 1–3; only the temporal-freshness recall nuance is new, and even that is a refinement.

## Decisions captured
- Pillars 1, 3, 5, 6, 7, 9: APEX already leads — **no action**, recorded so we don't re-litigate.
- Self-learning loop (pillar 3): **stays rejected** per ADR-011 (weak-coder poisoning risk).
- Only #1 (memory) is both high-leverage and ungated → recommended next thread.
