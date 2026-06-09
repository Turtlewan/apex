# Research: "AgentMD" — Do repository context files help coding agents?

_Verification of a contested social-media claim against primary sources. Planning-mode research, 2026-06-08._

## Claim under test
A study reportedly found that agent context files (CLAUDE.md / AGENTS.md / `.cursorrules`, appended to every prompt) **reduce** coding-agent task success while **increasing** cost ~20%. It circulated via an Instagram reel and was contested in the comments. It matters because APEX is built entirely on always-loaded markdown context (global CLAUDE.md chain + skills + impl.md cores).

## Verdict
**REAL but OVERSTATED.** Confidence: **high** on the study's existence and headline numbers; **high** on the nuance.
- The viral framing drops the study's central caveat: **human-written context files IMPROVED success (+4%)**. Only **LLM-auto-generated** (`/init`-style) files hurt success (−0.5% to −2%).
- The **~20% cost penalty applies to both** human- and auto-generated files.
- Honest one-liner: *bloated/redundant context hurts; curated minimal context helps but isn't free.*

## Primary source
- **arXiv:2602.11988** — Gloaguen, Mündler, Müller, Raychev, Vechev, *"Evaluating AGENTS.md: Are Repository-Level Context Files Helpful for Coding Agents?"* — ETH Zurich SRI Lab, submitted 12 Feb 2026. Preprint, not yet peer-reviewed. A real controlled benchmark, not a vendor post or reel.
- Corroborating / contesting: Patrik Björklund, *"A Paper Says AGENTS.md Hurts Performance. My Setup Says Otherwise"* (credible practitioner pushback); Upsun *"your AGENTS.md is probably too long"*; InfoQ neutral writeup; arXiv:2601.20404 (corroborates the cost/efficiency direction).

## What it actually measured
- **4 production agents:** Claude Code + Sonnet 4.5; OpenAI Codex + GPT-5.2 / GPT-5.1-mini; Qwen Code + Qwen3-30b-coder.
- **Tasks:** new **AGENTbench** (138 instances, 12 repos with developer-committed context files) + **SWE-bench Lite** (300). 438 total. Python-heavy.
- **Controlled A/B/C** per task: None / LLM-generated / Human-written → effect is **causal within scope**.
- **Results:** LLM-generated context → success −0.5% (SWE-bench) to −2% (AGENTbench), cost +20–23%. Human-written → success **+4%**, cost still up to +19%. Agents followed instructions faithfully; the harm is dutifully executing irrelevant requirements (+2–4 wasted tool steps, occasional derailed patch).
- **Authors' own caveats:** Python bias (tooling already in model parametric knowledge); measures **task resolution only** — NOT convention adherence, security, or consistency (which is APEX's actual value axis); dataset skews to small/recent/AI-generated public repos where files help least. The contesting commenter is directionally right.

## Implication for APEX
**Reinforces APEX's existing discipline; does not undercut the core thesis.**
- The −success effect came from *redundant auto-generated* files restating the README — the opposite of APEX's hand-authored, domain-specific, "non-inferable only" skills.
- The universal **~20% cost tax (even on helpful files)** is precisely what APEX already targets: `apex-context-budget`, conditional/matched skill loading, the ~70% tripwire, the 500-line cap, and the spec rule "no *why* inline; cut anything that doesn't change what's built" — nearly verbatim the paper's "minimal requirements only" recommendation.

### Two concrete watch-items
1. **Never add an auto-generate-CLAUDE.md feature** — that is exactly the indicted failure mode.
2. The **always-loaded global CLAUDE.md chain** is the one artifact appended to *every* prompt — the precise thing the paper penalizes. Hold it to the strictest "non-inferable, decision-changing only" bar, and have `apex-context-budget` / `apex-refresh` use **"is this inferable from the repo?"** as an explicit deletion criterion, not just "is this token-heavy?"

## Source-grounding note
Full credibility assessment done by dispatched research agent against the arXiv primary source; preprint status (not peer-reviewed) is the main confidence caveat.
