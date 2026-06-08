# Repo Study: academic-research-skills

**Study date:** 2026-06-05
**Analyst:** apex-research agent

---

## 1. Repo Identity

| Field | Value |
|-------|-------|
| **Canonical URL** | https://github.com/Imbad0202/academic-research-skills |
| **Owner** | Imbad0202 (Edward Wu; Taiwan-based researcher/educator) |
| **License** | CC BY-NC 4.0 (non-commercial) |
| **Stars / Forks** | 27.6k / 2.3k |
| **Latest release** | v3.11.0 (2026-06-04) |
| **Language** | Pure Markdown (Claude Code skill format — no code, no npm) |
| **Cloned for analysis** | Yes (`--depth 1` to `/tmp/academic-research-skills-clone`) |

The repo is a mature, actively maintained Claude Code skill suite covering the full academic paper lifecycle: research → write → peer-review → revise → finalize. It has strong East-Asian (zh-TW, zh-CN, ja-JP) multilingual support, indicating its primary audience is researchers in Taiwan/China/Japan.

---

## 2. Full Skill Inventory

Four SKILL.md files + one orchestrator; the suite also ships shared protocols, agent definitions, commands, hooks, scripts, and an eval harness.

### Skill 1: deep-research (v2.9.4)

**Purpose:** 13-agent universal research pipeline. Handles research-question formulation, systematic literature search (Semantic Scholar API, Levenshtein ≥ 0.70 title matching), source verification, cross-source synthesis, risk-of-bias assessment, meta-analysis, APA 7.0 report generation, editorial review, ethics review, and devil's advocate challenges.

**7 modes:** `full` | `quick` | `socratic` | `review` | `lit-review` | `fact-check` | `systematic-review`

**Notable mechanisms:**
- Socratic intent detection: activates guided dialogue when user has no clear research question (intent-based, language-agnostic)
- PRISMA-trAIce compliance agent (17-item checklist with Mandatory/HR/R/O tier enforcement; Mandatory failures block pipeline)
- RAISE framework (Responsible AI in Systematic Evidence) reporting
- Optional cross-model devil's advocate (Claude as primary + GPT-5.4 Pro or Gemini 3.1 Pro as verifier; requires explicit user consent before sending manuscript content to external provider)
- Dialogue health monitoring (Socratic mode: tracks convergence across 4 signals)
- Literature monitoring / alert-setting for ongoing topic tracking

**Token cost:** `quick` ~30K in / 15K out (~$0.60). `full` ~60K / 30K (~$1.20). `systematic-review` ~100K / 50K (~$2.00). **HIGH for systematic-review.**

### Skill 2: academic-paper (v3.2.0)

**Purpose:** 12-agent paper writing pipeline. Handles intake configuration, literature strategy, structure architecture (IMRaD, literature review, case study, policy brief, conference, thesis chapter), argument construction, full-text drafting, citation compliance (APA 7 / Chicago / MLA / IEEE / Vancouver), bilingual abstract (zh-TW + EN), simulated peer review, output formatting (Markdown / DOCX via Pandoc / LaTeX / PDF).

**10 modes:** `full` | `plan` | `outline-only` | `revision` | `revision-coach` | `abstract-only` | `lit-review` | `format-convert` | `citation-check` | `disclosure`

**Notable mechanisms:**
- Style Calibration (intake Step 10): learns author's writing voice from 3+ past papers across 6 dimensions (sentence length distribution, transitional vocabulary, hedging intensity, citation integration, paragraph opening patterns, punctuation signature). Applied as soft guide during drafting — explicitly NOT a humanizer.
- Writing Quality Check: runtime checklist catching AI-typical terms, em dash overuse, throat-clearing openers, uniform paragraph lengths, monotonous sentence rhythm.
- Anti-leakage protocol: unsupported claims tagged `[MATERIAL GAP]` rather than silently filled with invented content.
- VLM figure verification: 10-point APA 7.0 checklist on generated figures (max 2 refinements).
- Revision Coach mode: parses unstructured reviewer comments into structured Revision Roadmap — works standalone without a prior pipeline run.
- Visualization agent: generates Python matplotlib / R ggplot2 figure code with colorblind-safe palettes and LaTeX integration.
- Disclosure mode: RAISE + PRISMA-trAIce AI-use disclosure report.

**Token cost:** `plan` ~40K / 20K (~$0.80). `full` ~80K / 50K (~$1.80). **HIGH for full.**

### Skill 3: academic-paper-reviewer (v1.10.0)

**Purpose:** 7-agent multi-perspective peer review simulation. Dynamically configures 5 reviewer personas (EIC + Methodology Reviewer + Domain Reviewer + Perspective Reviewer + Devil's Advocate) from the paper's detected field. Produces structured Editorial Decision Letter and Revision Roadmap with R&R traceability matrix.

**6 modes:** `full` | `re-review` | `quick` | `methodology-focus` | `guided` | `calibration`

**Notable mechanisms:**
- Sprint Contract Hard Gate (v3.6.2): Phase 1 (paper-blind) each reviewer commits scoring plan via Schema 13 sprint_contract.json before seeing the paper; prevents post-hoc rubric editing.
- Concession threshold protocol: Devil's Advocate rebuttal scored < 4/5 triggers frame-lock warning.
- Attack intensity preservation: prevents reviewer from softening critique across revision rounds.
- Calibration mode: user supplies gold set; measures reviewer's own FNR/FPR (acceptance threshold FNR < 0.15, FPR < 0.10) before relying on rubric scores.
- Read-only constraint: reviewer agents cannot modify the manuscript.
- Cross-model DA: opt-in GPT/Gemini verification of devil's advocate critique.

**Token cost:** `quick` ~15K / 8K (~$0.30). `full` ~50K / 30K (~$1.10). `methodology-focus` higher due to Sprint Contract (+30-40% per reviewer × 5). **MED-HIGH.**

### Skill 4: academic-pipeline (v3.11.0)

**Purpose:** Lightweight orchestrator. Dispatches deep-research → academic-paper → academic-paper-reviewer through 10 stages with mandatory user confirmation gates. Manages Material Passport (Schema 9: persistent structured record), integrity verification gates (Stages 2.5 and 4.5 — 7-mode AI failure checklist), and cross-session resumption.

**Notable mechanisms:**
- Material Passport (Schema 9): persistent carry-through record with `literature_corpus[]`, `repro_lock`, `reset_boundary[]` (SHA-256 ledger), `verification_status`, claim audit results. Survives context resets.
- Passport Reset Boundary (opt-in `ARS_PASSPORT_RESET=1`): promotes FULL checkpoints to context-reset boundaries; `resume_from_passport=<hash>` resumes in a fresh session using POSIX `fcntl.flock LOCK_EX`.
- Claim Audit Gate (opt-in `ARS_CLAIM_AUDIT=1`): LLM-as-judge validates each claim against cited source at Stage 4→5; emits 5 HIGH-WARN classes that trigger formatter REFUSE rules.
- Citation determinism (v3.11.0): arXiv resolver + 4-index contamination matrix (Semantic Scholar + OpenAlex + Crossref + arXiv); persistent SQLite verification cache with `/ars-cache-invalidate` command.
- Temporal Verification (v3.9.4): 5-pass verifier (arithmetic, anachronism, comparator logic, causal relationships, deictic reference resolution).
- Collaboration Depth Agent: non-blocking observer at every checkpoint, 6-dimension evaluation of human-AI collaboration quality; explicitly skipped at integrity gates.

**Token cost:** Full pipeline ~200K+ input / 100K+ output (~$4-6 for 15K-word paper). **HIGH — louder notice: this is the most expensive single workflow I have encountered in a Claude Code skill system. Cross-model verification adds another ~$0.60-1.10 per run. Sprint Contract option adds 30-40% per reviewer × 5 reviewers on top.**

### Shared Protocols (not standalone skills)

| File | Purpose |
|------|---------|
| `shared/prisma_trAIce_protocol.md` | PRISMA-trAIce 17-item checklist (snapshot of upstream `cqh4046/PRISMA-trAIce`; CI freshness check) |
| `shared/raise_framework.md` | RAISE (Responsible AI in Systematic Evidence) principles |
| `shared/cross_model_verification.md` | Cross-model verification protocol; explicit consent gate before sending manuscripts to external providers |
| `shared/style_calibration_protocol.md` | 6-dimension voice-learning from past papers |
| `shared/ground_truth_isolation_pattern.md` | Generator–evaluator separation pattern |
| `shared/benchmark_report_pattern.md` | Structured benchmark report pattern |
| `shared/artifact_reproducibility_pattern.md` | Reproducibility artifact pattern |
| `shared/collaboration_depth_rubric.md` | 6-dimension human-AI collaboration evaluation rubric |
| `shared/handoff_schemas.md` | Inter-skill handoff schemas |
| `shared/compliance_checkpoint_protocol.md` | Override-ladder for Mandatory gate failures (3-round friction) |

### Slash Commands

14 slash commands shipping as `commands/ars-*.md`: `ars-full`, `ars-plan`, `ars-outline`, `ars-revision`, `ars-revision-coach`, `ars-abstract`, `ars-lit-review`, `ars-reviewer`, `ars-citation-check`, `ars-format-convert`, `ars-disclosure`, `ars-mark-read`, `ars-unmark-read`, `ars-cache-invalidate`.

---

## 3. Per-Skill Assessment

### deep-research

**APEX dedup:** PARTIAL overlap with `apex-research` (Deep Research Specialist) and `apex-deep-dive` (option-comparison).
- `apex-research` covers systematic research planning and synthesis in planning mode; it does NOT have: Semantic Scholar API verification, PRISMA-trAIce compliance, systematic-review mode with meta-analysis, risk-of-bias assessment, Socratic intent detection, or literature monitoring/alerts.
- `apex-deep-dive` covers 2-3 option trade-off analysis only — orthogonal scope.
- The academic-specific modes (`systematic-review`, `lit-review`, `fact-check`, Socratic dialogue, PRISMA-trAIce) are genuinely novel for APEX.

**Artemis fit:** MED-HIGH. The `lit-review` and `systematic-review` modes produce structured, annotated bibliography outputs and evidence synthesis that map directly onto Artemis's paper-ingestion / second-brain use case. The Socratic mode (guided research question formulation) is a natural UX pattern for a personal assistant helping a user navigate a research domain. The source-verification mechanism (multi-index lookup, hallucination prevention) is directly relevant to Artemis's RAG accuracy.

### academic-paper

**APEX dedup:** NOVEL. APEX has no paper-writing capability. This entire skill is out of scope for a software-building system. The writing-quality mechanisms (Style Calibration, Writing Quality Check, anti-leakage protocol) are interesting patterns but APEX has no use for them — APEX builds software, not papers.

**Artemis fit:** LOW-MED as a direct feature (Artemis is a second-brain/assistant, not a paper-writing tool). However, selective pattern absorption is possible:
- Style Calibration (6-dimension voice learning from past writing) → Artemis could learn user's writing/annotation style for note generation.
- Anti-leakage protocol (tag gaps rather than hallucinate) → directly applicable to Artemis's RAG answer generation.
- Revision Coach (parse unstructured feedback → structured roadmap) → relevant if Artemis gains a feedback/annotation review feature.

### academic-paper-reviewer

**APEX dedup:** NOVEL. APEX has no peer review simulation capability.

**Artemis fit:** LOW as a feature. Artemis users probably don't need journal peer review simulation. However, the calibration mode (measuring reviewer FNR/FPR against user-supplied gold sets) and the Sprint Contract (paper-blind commitment before evaluation) are strong patterns for any Artemis evaluation or quality-gate feature.

### academic-pipeline

**APEX dedup:** NOVEL as a workflow orchestrator for academic use. However, its orchestration patterns overlap with how apex-plan/apex-orchestrate coordinate multi-step work.

**Artemis fit:** MED. The Material Passport (persistent structured carry-through across context resets, SHA-256 resumption ledger) and the claim-audit gate (LLM-as-judge validation of claims against sources) are directly relevant to Artemis's RAG reliability and cross-session continuity. The cross-session resumption pattern via hash is novel and worth studying.

---

## 4. Candidate Table

| Candidate | Lens | Dedup tag | Token cost | Verdict |
|-----------|------|-----------|------------|---------|
| Systematic-review / PRISMA-trAIce mode (from deep-research) | APEX | PARTIAL-novel | HIGH ($2/run) | **Do not adopt as APEX skill** — too narrow, too expensive. Academic only. |
| Source verification pattern (Semantic Scholar + multi-index + arXiv resolver) | Artemis | NOVEL | LOW (sub-component) | **Study as architectural pattern** for Artemis RAG citation validation — not a plug-in skill but a design reference. |
| Socratic intent detection (mode-by-intent, language-agnostic, "prefer guided over full when ambiguous") | APEX (apex-research) | PARTIAL-novel | LOW (routing logic) | **Absorb into apex-research** as a routing heuristic — low-cost enhancement to existing skill. |
| Anti-leakage protocol (`[MATERIAL GAP]` tagging) | Artemis | NOVEL | LOW (inline pattern) | **High value for Artemis RAG** — tag knowledge gaps rather than hallucinate fill. Direct architectural reference. |
| Material Passport / cross-session resumption (SHA-256 boundary ledger) | Artemis | NOVEL | LOW (schema pattern) | **Study for Artemis context management** — relevant to long research sessions spanning multiple conversations. |
| Style Calibration (6-dimension voice learning) | Artemis | NOVEL | MED | **Possible Artemis feature** — note generation in user's voice. Low priority until RAG core is stable. |
| Claim Audit Gate (LLM-as-judge, claim-reference alignment) | Artemis | NOVEL | MED-HIGH | **Architectural reference for Artemis RAG** — validates that retrieved sources actually support generated claims. Key anti-hallucination pattern. |
| Sprint Contract / paper-blind evaluation gate | Artemis | NOVEL | LOW (pattern) | **Low priority** — useful only if Artemis gains structured evaluation features. |
| academic-paper skill (paper writing) | APEX | NOVEL | HIGH | **Reject** — APEX builds software, not papers. Out of scope entirely. |
| academic-paper-reviewer skill (peer review) | APEX | NOVEL | MED-HIGH | **Reject** — no use case in a software-building system. |
| academic-pipeline orchestrator (full pipeline) | APEX | NOVEL | HIGH ($4-6/run) | **Reject as adoption** — domain-specific academic orchestration. But its orchestration patterns (passport, integrity gates, resumption) are worth documenting as references. |
| Collaboration depth rubric (6-dimension human-AI collaboration evaluation) | APEX | PARTIAL | LOW | **Soft reference only** — interesting metacognitive framing but no concrete APEX action. |

---

## 5. Bottom Line

**For APEX:** Only one narrow absorption candidate: adopt the Socratic intent-detection routing heuristic ("prefer guided over full when user intent is ambiguous") into `apex-research`. Everything else is academic-domain-specific and out of scope for a software-building system. Do NOT build academic-paper, academic-paper-reviewer, or academic-pipeline analogs — wrong domain.

**For Artemis:** This repo is a high-value architectural reference library, not a plug-in. Four patterns directly serve Artemis's second-brain RAG core: (1) multi-index source verification with hallucination prevention, (2) anti-leakage gap-tagging instead of hallucinated fill, (3) LLM-as-judge claim-reference alignment audit, (4) Material Passport cross-session resumption. These should be absorbed as design patterns into Artemis's architecture planning — not as copied code, but as vetted prior art for the RAG reliability and context-continuity problems Artemis will face.

**License note:** CC BY-NC 4.0 — non-commercial use permitted with attribution. Artemis is a personal tool (non-commercial), so pattern absorption is fine. If Artemis ever commercializes, relicensing check needed.

---

## 6. Sources

- https://github.com/Imbad0202/academic-research-skills (canonical repo; cloned)
- https://github.com/Imbad0202/academic-research-skills/blob/main/docs/ARCHITECTURE.md
- https://github.com/Imbad0202/academic-research-skills/blob/main/docs/PERFORMANCE.md
- https://skillsllm.com/skill/academic-research-skills
- Zhao et al. (2026-05): arXiv citation hallucination audit, referenced in repo README
- Lu et al. (2026): "The AI Scientist" (Nature 651:914-919), referenced in repo README
