# Online-repo study — absorption report (synthesis)

_Compare-and-absorb pass over 8 repos the user flagged online (2026-06-05), ECC/donor-style.
8 parallel fresh-context research agents, each dedup-aware against APEX's current state, token-cost
tagged, and judged on **two lenses** — Lens A (add to **APEX**, the skill system) and Lens B (add to
**Artemis**, the personal-assistant + RAG-second-brain app APEX will build). Per-repo detail:
`understand-anything.md`, `codegraph.md`, `taste-skill.md`, `knowledge-work-plugins.md`,
`anthropic-cybersecurity-skills.md`, `academic-research-skills.md`, `pi.md`, `skills.md`.
**Report only — no skill changes made.**_

> **Verification status (updated 2026-06-05).** First pass: 3 of 8 agents actually cloned
> (academic-research-skills, anthropics/skills, knowledge-work-plugins); the other 5 leaned on
> web/training and confabulated metrics (stars, versions, an arXiv ID). **All 5 were re-run under a
> hardened protocol (mandatory `git clone` → cite-or-drop → URL+SHA identity) and are now
> source-verified:**
>
> | Repo | Verified repo @ SHA | License |
> |------|--------------------|---------|
> | understand-anything | `Lum1104/Understand-Anything` @ `7a3b751` | MIT |
> | codegraph | `colbymchenry/codegraph` @ `bfa84d3` · `codegraph-ai/CodeGraph` @ `5837e84` | MIT · Apache-2.0 |
> | anthropic-cybersecurity-skills | `mukul975/Anthropic-Cybersecurity-Skills` @ `0445030` (754 SKILL.md measured) | Apache-2.0 |
> | pi | `earendil-works/pi` @ `89a92207` (cloned) · `withpi` (SDK/docs-sourced — SaaS, no core repo) | MIT · proprietary |
> | taste-skill | `Leonxlnx/taste-skill` @ `3c7017d` (12/13 byte-identical to local installs) | MIT |
> | academic-research-skills · skills · knowledge-work-plugins | cloned first pass (trusted) | — |
>
> Star counts in per-repo files remain unverified (ignore them). Provenance correction: of the four
> "official-sounding" names, **only `anthropics/knowledge-work-plugins` and `anthropics/skills` are
> actually Anthropic**; "anthropic-cybersecurity-skills" (owner `mukul975`) and
> "academic-research-skills" are **community** repos.

---

## 0. The headline

This batch splits cleanly by lens, and that split *is* the finding:

- **APEX (Lens A) gets little.** APEX is a lean software-building system and most of these repos are
  either already-have (taste, research, design), wrong-mission (SOC tooling, paper-writing), or
  productivity suites. Net APEX pickups are a handful of **Low-cost** sharpenings + one
  mission-question (security expansion).
- **Artemis (Lens B) is where the value is.** Five of the eight repos are effectively a free
  **architecture-reference library for the RAG second brain**: graph-RAG, enterprise-search
  orchestration, anti-hallucination patterns, two-tier memory, document handling. None of this is an
  APEX edit — it's prior-art to capture into the Artemis dump (per SP0's "Lens B = user captures
  separately").

---

## 1. APEX candidates (Lens A) — ranked, all dedup'd

| Candidate | Source repo | Dedup | Token-cost | Verdict |
|-----------|-------------|-------|-----------|---------|
| **withpi eval into apex-ai-systems** — name the encoder-model scorer (deterministic, <100ms, Promptfoo `type: pi`) + score→calibrate→recompile-optimizer loop, 2 bullets in the eval section | pi (withpi) | Partial (concept-level only) | **Low** | **ADOPT** — cheapest, cleanest win |
| **Socratic intent-detection routing into apex-research** — route a research request by detected intent (quick vs full vs systematic vs fact-check) | academic-research-skills | Partial-novel | **Low** | **ADOPT** — small routing heuristic |
| **skill-creator's 3 measurement mechanisms into apex-skill-author** — blind-comparator pattern, eval schema, description-accuracy testing (do NOT replace the Iron Law) + the `~~` tool-agnostic placeholder convention | skills, knowledge-work-plugins | Partial | **Low** | **ADOPT (selective)** — complements governance with measurement |
| **Impact-before-edit graph traversal into apex-code pre-flight** — optional blast-radius check when a code-graph tool is installed | codegraph, understand-anything | Novel | **Low** (gated on tool present) | **ADOPT-with-guardrails** — only fires if graph exists; never a hard dep |
| **webapp-testing vs apex-ui-testing overlap check** | skills | Partial | Low | **NOTE** — verify overlap before any edit; likely already-have |
| **mcp-builder** (live-spec-fetch mechanism) | skills | Novel | Low | **PARK** — only if an MCP-server build arises |
| **Security expansion — `apex-detection` + `apex-incident-response` + apex-security audit/SBOM annex** | anthropic-cybersecurity-skills | Novel | Med | **MISSION QUESTION** — see §3 |

---

## 2. Artemis architecture references (Lens B) — the real haul

Not APEX edits. Capture to the Artemis prior-art dump. Grouped by Artemis subsystem:

**Knowledge core / RAG retrieval**
- **Graph-RAG tier** — AST/entity knowledge-graph + multi-hop traversal alongside vector search;
  keep vector fallback for unstructured docs (codegraph, understand-anything). apex-search has hybrid
  RRF but no graph layer.
- **Incremental fingerprint indexing** + **commit-cached graph artifact** (re-index only changed
  files; teammates skip re-ingestion) (understand-anything). Direct pattern for the second brain's
  ingest pipeline.
- **enterprise-search RAG orchestration blueprint** — decompose query → parallel multi-source search
  → confidence-scored synthesis → digest; + source-health/rate-limit management (knowledge-work
  enterprise-search). **HIGH token-cost when used** — design with budget guardrails.

**Anti-hallucination / trust (academic-research-skills — all Low-cost as *patterns*)**
- Gap-tagging (`[MATERIAL GAP]`) so the model marks missing evidence instead of inventing it.
- Multi-index citation verification before asserting a source.
- Claim-audit gate (LLM-as-judge over generated claims) — Med-High per run, gate selectively.
- Material Passport (SHA-256 resumption ledger) for cross-session context continuity.

**Memory & continuity**
- Two-tier memory: hot-cache (CLAUDE.md-style) + deep-store (`memory/`) (knowledge-work
  productivity). **HIGH if always-on** — partition + on-demand load. Mirrors APEX's own memory model.

**Documents & I/O**
- pdf / docx / pptx / xlsx handling (anthropics/skills) + interactive pdf-viewer
  (knowledge-work) — install as plugins when the Artemis build starts; don't copy-absorb.

**Product / eval**
- withpi for evaluating Artemis's own AI quality; Inflection Pi as assistant prior-art.
- Research-synthesis methodology (thematic / affinity-mapping) for "second-brain" digest actions.

---

## 3. Token-cost watchlist & rejects (the user's explicit ask)

**HIGH-cost — gate or reject:**
- **enterprise-search synthesis pipeline** — multi-agent parallel search + scored synthesis is
  powerful but expensive. Artemis-only, with an explicit budget guardrail.
- **academic paper/reviewer/pipeline skills** — agent reports ~$1.80–6/run, 12–13 agent fan-outs.
  **REJECT for APEX** (wrong domain); for Artemis take the *patterns*, not the pipelines.
- **Two-tier always-on memory** — HIGH if naively always-loaded; partition + on-demand.
- **cybersecurity 754-skill suite** — installing the whole thing is a massive baseline; only ever
  cherry-pick a few skills (§3 below).

**REJECT outright (dedup / mission):**
- **taste-skill — REJECT, 100% already-have.** The canonical repo's 13 skills are already installed
  verbatim in `~/.claude/skills/` (design-taste-frontend, gpt-taste, minimalist-ui,
  industrial-brutalist-ui, high-end-visual-design, redesign-existing-projects, stitch-design-taste,
  brandkit, image-to-code, imagegen-frontend-web/mobile, full-output-enforcement). Two sibling repos
  add ~70%-overlap visual-audit and scope-creep engineering rubrics — also reject.
- **Offensive-security skills** (red team / pen-test / C2 / malware / forensics) — excluded by APEX's
  defensive mission and dual-use stance.
- **Whole engineering/design/operations plugins** from knowledge-work — overlapped by existing APEX
  domain skills.
- **earendil/pi cross-provider mid-session switching** — conflicts with APEX's planning/coding
  backend gate.

**Security expansion — the one genuine open question (§1 last row).** The cybersecurity repo is
overwhelmingly novel vs APEX because it operates at *analysis/investigation* time while apex-security
defends at *design* time. Detection-engineering, incident-response, and operational cloud-audit/SBOM
are real gaps — but **is APEX meant to be a SOC?** APEX is a software-building system. Recommendation:
**do not** add `apex-detection`/`apex-incident-response` now; optionally fold a thin **supply-chain /
SBOM audit annex** into apex-security (aligns with its existing A03 coverage) and revisit the rest only
if a security-operations project actually appears.

---

## 4. Recommended bundles

- **Bundle A — APEX lean wins (Low cost, adopt now):** withpi eval bullets → apex-ai-systems ·
  Socratic routing → apex-research · skill-creator measurement mechanisms + `~~` placeholder →
  apex-skill-author · impact-before-edit (guarded) → apex-code. ~4 small skill edits.
- **Bundle B — verify-first:** webapp-testing vs apex-ui-testing overlap; mcp-builder (park).
- **Bundle C — Artemis prior-art dump (user captures):** all of §2. The graph-RAG + enterprise-search
  + anti-hallucination patterns are the highest-value finds in the whole pass.
- **Reject pile (§3):** taste-skill (already-have), offensive-security, knowledge-work whole-plugin
  installs, academic pipelines, paper-writing.

**Verdict:** the single highest-value outcome of this pass is **Artemis architecture prior-art** (Lens
B), not APEX skills. For APEX itself, only ~4 Low-cost sharpenings clear the dedup+leanness bar; the
biggest APEX *question* (security-ops expansion) is a deliberate scope decision, not an obvious add.
