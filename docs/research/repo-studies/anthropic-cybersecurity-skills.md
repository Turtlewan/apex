# Repo Study: mukul975/Anthropic-Cybersecurity-Skills

**Date**: 2026-06-05
**Researcher**: Claude Code (absorption pass — re-run with mandatory source-grounding)
**CLONED**: yes — shallow clone at commit `0445030`

---

## 1. Repo Identity (source-grounded)

| Field | Value |
|-------|-------|
| Canonical URL | https://github.com/mukul975/Anthropic-Cybersecurity-Skills |
| Commit SHA (clone HEAD) | `04450304b12645cb2b974ab96d28c0664758a88d` |
| True owner | `mukul975` (Mahipal — personal GitHub account); community project, **NOT affiliated with Anthropic PBC** |
| "Anthropic" in name | Misleading branding. README states: "⚠️ Community Project — This is an independent, community-created project. Not affiliated with Anthropic PBC." No official Anthropic security-skills repo exists. |
| License | Apache 2.0 (confirmed: `LICENSE` file, first line "Apache License / Version 2.0") |
| Measured skill count | **754** (`find /skills -name "SKILL.md" \| wc -l` = 754) |
| Domain directories | **754** (each skill is its own directory; 26 logical domains per README, not filesystem-level grouping) |
| Standard | agentskills.io — YAML frontmatter + Markdown body |
| Framework mappings | MITRE ATT&CK v19.1, NIST CSF 2.0, MITRE ATLAS v5.4, MITRE D3FEND v1.3, NIST AI RMF 1.0 |
| Platforms | Claude Code, GitHub Copilot, Cursor, Gemini CLI, Codex CLI, and 20+ agentskills.io-compatible platforms |

**One-line what-it-is**: Community-built collection of 754 structured cybersecurity analyst workflows (SOC/DFIR/pentesting/threat-intel) packaged as agentskills.io SKILL.md files, usable by any compatible AI agent platform.

### Is this really Anthropic?

No. The README prominently disclaims affiliation. No official Anthropic-published security skills repo exists — the real Anthropic skills output is Claude Code itself (a product, not a skill repo). The "Anthropic" in the title is a naming choice by the community author to signal Claude Code compatibility.

---

## 2. Skill Structure (verified from clone)

```
skills/<skill-name>/
├── SKILL.md           # YAML frontmatter + Markdown body (confirmed by ls)
├── references/        # standards.md + workflows.md
├── scripts/           # Helper automations
└── assets/            # Templates, checklists (where present)
```

**SKILL.md frontmatter fields** (read from multiple sampled skills):
`name`, `description`, `domain`, `subdomain`, `tags`, `version`, `author`, `license`,
`atlas_techniques`, `d3fend_techniques`, `nist_ai_rmf`, `nist_csf`, `mitre_attack`

**Token design**: Frontmatter ~30–50 tokens per skill (per README: "~30 tokens to scan"); body 500–2,000 tokens loaded only on match. Progressive disclosure architecture.

---

## 3. Domain Inventory (26 domains, from README table + verified against clone)

| Domain | Skills (README) | Mission fit |
|--------|----------------|-------------|
| Cloud Security | 60 | Partial APEX overlap |
| Threat Hunting | 55 | Novel to APEX |
| Threat Intelligence | 50 | Novel to APEX |
| Web Application Security | 42 | Partial APEX overlap |
| Network Security | 40 | Novel to APEX |
| Malware Analysis | 39 | Novel — wrong mission |
| Digital Forensics | 37 | Novel — wrong mission |
| Security Operations | 36 | Novel to APEX |
| Identity & Access Management | 35 | Partial APEX overlap |
| SOC Operations | 33 | Novel to APEX |
| Container Security | 30 | Novel to APEX |
| OT/ICS Security | 28 | Novel — wrong mission |
| API Security | 28 | Partial APEX overlap |
| Vulnerability Management | 25 | Novel to APEX |
| Incident Response | 25 | Novel to APEX |
| Red Teaming | 24 | Offensive — reject |
| Penetration Testing | 23 | Offensive — reject |
| Endpoint Security | 17 | Novel to APEX |
| DevSecOps | 17 | Partial APEX overlap |
| Phishing Defense | 16 | Novel — wrong mission |
| Cryptography | 14 | Novel to APEX |
| Zero Trust Architecture | 13 | Partial APEX overlap |
| Mobile Security | 12 | Novel — wrong mission |
| Ransomware Defense | 7 | Novel to APEX |
| Compliance & Governance | 5 | Novel to APEX |
| Deception Technology | 2 | Novel — wrong mission |

---

## 4. Selected Skill Reads (source-grounded candidates)

### `skills/implementing-threat-modeling-with-mitre-attack/SKILL.md`
- subdomain: `soc-operations`; tags: `threat-modeling`, `detection-coverage`, `attack-navigator`
- Focus: aligning SOC detection coverage to ATT&CK TTPs. **Not** STRIDE/data-flow threat modeling at design time.
- Dedup vs APEX: `apex-security` covers design-time threat modeling. This is operational (detection gap analysis post-deployment).

### `skills/performing-threat-modeling-with-owasp-threat-dragon/SKILL.md`
- subdomain: `devsecops`; tags: `threat-modeling`, `stride`, `linddun`, `dfd`
- Focus: OWASP Threat Dragon for DFD creation + STRIDE/LINDDUN methodology + PDF report output.
- Dedup vs APEX: `apex-security` describes threat-model posture; no dedicated STRIDE/Threat-Dragon workflow exists in APEX. Closest match in APEX — partial.

### `skills/implementing-devsecops-security-scanning/SKILL.md`
- subdomain: `application-security`; tags: `SAST`, `DAST`, `SCA`, `semgrep`, `trivy`, `owasp-zap`, `gitleaks`, `shift-left`
- Focus: integrating Semgrep+Trivy+ZAP+Gitleaks into CI/CD pipelines with security gates.
- Dedup vs APEX: `apex-security` mentions pipeline hardening at spec level; no step-by-step tool workflow exists. Novel operationally.

### `skills/implementing-semgrep-for-custom-sast-rules/SKILL.md`
- subdomain: `devsecops`; tags: `semgrep`, `sast`, `custom-rules`, `code-security`
- Focus: writing custom YAML Semgrep rules for application-specific vuln detection.
- Dedup vs APEX: No APEX analog — novel.

### `skills/analyzing-sbom-for-supply-chain-vulnerabilities/SKILL.md`
- subdomain: `supply-chain-security`; tags: `SBOM`, `CycloneDX`, `SPDX`, `NVD`, `CVE`, `syft`, `grype`
- Focus: parsing CycloneDX/SPDX SBOMs, correlating to NVD, building dependency risk graphs, generating compliance reports (EO 14028, EU CRA).
- Dedup vs APEX: `apex-security` covers A03 supply-chain at design/spec level. Operational SBOM scanning (CLI tools, NVD API calls) is absent. Novel operationally.

### `skills/detecting-supply-chain-attacks-in-ci-cd/SKILL.md`
- subdomain: `security-operations`; tags: `supply-chain-security`, `ci-cd-security`, `github-actions`, `dependency-pinning`
- Focus: scanning GitHub Actions workflows for unpinned actions, script injection via expressions, dependency confusion, secrets exposure.
- Dedup vs APEX: No APEX skill covers GitHub Actions workflow security auditing. Novel.

### `skills/detecting-ai-model-prompt-injection-attacks/SKILL.md`
- subdomain: `ai-security`; tags: `prompt-injection`, `LLM-security`, `OWASP-LLM-Top10`, `NLP-classification`
- Focus: multi-layer detection (regex + heuristics + DeBERTa transformer) for prompt injection at the application boundary. Runtime tool, not APEX-style design guidance.
- Dedup vs APEX: CLAUDE.md §6 covers agent self-defense (prompt hygiene, treat external content as data). This is an application-level runtime detector. Different layer — partial dedup.

### `skills/implementing-llm-guardrails-for-security/SKILL.md`
- subdomain: `ai-security`; tags: `LLM-guardrails`, `NeMo-Guardrails`, `input-validation`, `output-filtering`, `AI-safety`
- Focus: NVIDIA NeMo Guardrails Colang definitions + Python validators for PII detection, topic boundaries, hallucination filtering, JSON schema compliance.
- Dedup vs APEX: `apex-ai-systems` and CLAUDE.md §6 cover AI agent safety at design/guidance level. Runtime guardrail implementation (NeMo) is absent. Novel operationally.

### Offensive sample: `skills/exploiting-ms17-010-eternalblue-vulnerability/SKILL.md` (name-only read)
- Teaches exploitation of MS17-010 (EternalBlue) — a real CVE used in WannaCry.
- Mission verdict: REJECT. Offensive exploitation skill with dual-use risk.

---

## 5. APEX Baseline Dedup Assessment

**APEX security coverage today**:
- `apex-security`: Threat-model specs, BLOCK/FLAG gates, OWASP Top 10:2025 (A03 supply-chain, A10), STRIDE guidance — all at design/spec time
- `apex-auth`: Authentication design (sessions/JWT/OAuth2/passkeys/RBAC/multi-tenant)
- `CLAUDE.md §6`: Agent self-defense / prompt injection hygiene (agent-level, not application-level)
- `apex-wave-reviewer` (dispatched): Dual-pass security/auth/data review of completed code
- `security-review` + `code-review`: Co-installed skills

**Core distinction**: APEX defends at design time (spec the right thing to build). This collection defends at operation time (investigate, detect, respond to what already happened). Overlap exists only at the interface layer.

---

## 6. Candidate Table

| Candidate | File paths cited | Lens | Dedup | Token-cost | Verdict |
|-----------|-----------------|------|-------|------------|---------|
| DevSecOps CI/CD scanning (Semgrep, Trivy, ZAP, Gitleaks, pipeline gates) | `skills/implementing-devsecops-security-scanning/SKILL.md`, `skills/implementing-semgrep-for-custom-sast-rules/SKILL.md`, `skills/integrating-sast-into-github-actions-pipeline/SKILL.md` | APEX | Novel | Med | **Absorb** — Operational tool workflows absent from APEX. Could extend `apex-security` with a shift-left toolchain annex, or seed `apex-devsecops-security`. |
| Supply-chain / SBOM scanning | `skills/analyzing-sbom-for-supply-chain-vulnerabilities/SKILL.md`, `skills/detecting-supply-chain-attacks-in-ci-cd/SKILL.md`, `skills/implementing-supply-chain-security-with-in-toto/SKILL.md` | APEX | Partial | Med | **Absorb** — apex-security covers A03 at spec level; operational scanning (syft/grype/in-toto/NVD) is absent. Extend `apex-security`. |
| OWASP Threat Dragon / STRIDE workflow | `skills/performing-threat-modeling-with-owasp-threat-dragon/SKILL.md` | APEX | Partial | Low | **Selective absorb** — APEX has threat-model posture but no structured DFD/STRIDE tooling workflow. Lightweight addition to `apex-security` impl.md. |
| Incident Response playbooks + timeline | Domain: Incident Response (25 skills) | APEX | Novel | Med | **Absorb** — APEX projects get breached. Containment, timeline, ransomware response absent. New `apex-incident-response` skill. |
| LLM guardrails / runtime AI security | `skills/implementing-llm-guardrails-for-security/SKILL.md`, `skills/detecting-ai-model-prompt-injection-attacks/SKILL.md` | APEX | Partial | Med | **Park** — Runtime guardrails (NeMo) are outside APEX's design-time scope but directly relevant to Artemis and any APEX-built AI product. Flag for apex-ai-systems update pass. |
| Detection Engineering (Sigma, SIEM, ATT&CK coverage) | Domain: Security Operations (36 skills) | APEX | Novel | Med | **Park** — High value for APEX projects needing runtime monitoring; low value for APEX core (spec-writing tool). Potential future `apex-detection` skill. |
| Cloud audit workflows (AWS/GCP/Azure/K8s) | Domain: Cloud Security (60 skills) | APEX | Partial | Med | **Selective absorb** — Operational audit CLI steps are novel vs APEX's spec posture. Annex to `apex-security` or `apex-aws`/`apex-gcp`/`apex-azure`. |
| Zero Trust Architecture | `skills/implementing-beyondcorp-zero-trust-access-model/SKILL.md`, `skills/implementing-cisa-zero-trust-maturity-model/SKILL.md` | APEX | Partial | Low | **Park** — Complements apex-auth design. Worth reading when updating apex-auth ZTA guidance. No standalone absorption needed. |
| Threat Intelligence (STIX/TAXII, MISP, actor profiling) | Domain: Threat Intelligence (50 skills) | APEX | Novel | Med–High | **Skip** — High value for security-specialist users; low relevance to APEX's build-securely mission. Too niche, too high context. |
| Malware Analysis (Volatility, Cuckoo, Ghidra) | Domain: Malware Analysis (39 skills) | APEX | Novel | HIGH | **Skip** — APEX doesn't build malware analysis tooling. Highly specialized operational workflows. Wrong mission. |
| Digital Forensics (disk imaging, MFT, browser artifacts) | Domain: Digital Forensics (37 skills) | APEX | Novel | HIGH | **Skip** — Wrong mission. No APEX use case. |
| Red Teaming / Pen Testing (C2, AD attacks, EternalBlue) | `skills/exploiting-ms17-010-eternalblue-vulnerability/` etc. | APEX | Novel | Med | **REJECT** — Offensive/dual-use. `building-c2-infrastructure-with-sliver-framework` and exploit tutorials have no place in APEX's defensive mission. |
| OT/ICS Security | Domain: OT/ICS Security (28 skills) | APEX | Novel | Med | **Skip** — No APEX project targets industrial systems. Wrong mission. |
| Phishing Defense / Mobile Security / Deception Technology | Various domains | APEX | Novel | Low–Med | **Skip** — Specialized operational security for security teams, not product builders. |
| ALL domains | All 26 domains | Artemis | Novel | HIGH | **Skip** — Artemis is a personal assistant + RAG brain. No use case for DFIR, threat-intel, malware analysis, or SOC workflows. |

---

## 7. Quality and Limitations

**Strengths**:
- Measured: 754 SKILL.md files confirmed by direct `find` count (not README badge)
- Production-quality sampled skills: DevSecOps, SBOM, STRIDE, LLM guardrails all have real CLI workflows with specific tool versions
- Framework-mapped: ATT&CK + NIST tags on every skill — systematic
- Token-efficient: frontmatter-first progressive disclosure — well-suited to agent context budgets
- Apache 2.0: clean license for any use

**Limitations**:
- Not Anthropic-official: community project; title is misleading
- Operational posture, not architectural: investigates/responds to breaches, doesn't prevent them at design time — inverse of APEX's mission
- Quality consistency unknown: 754 skills from one maintainer; sampled skills are high quality; tail may vary
- Offensive content present: C2 infrastructure, EternalBlue exploitation, Active Directory attack skills — dual-use risk; must be excluded from any absorption
- Single-maintainer risk: currency depends on Mahipal keeping ATT&CK mappings updated
- Token cost at scale: HIGH token-cost flag for wholesale installation — 754 skills × 30 tokens frontmatter = 22,620 tokens just to scan; selective absorption only

---

## 8. Bottom Line

`mukul975/Anthropic-Cybersecurity-Skills` (commit `04450304`) is a high-quality community collection — **not official Anthropic output**. Owner confirmed as `mukul975` (Mahipal), independent contributor. Skill count verified at **754** by direct clone measurement. 26 logical domains per README.

The collection is overwhelmingly **novel** relative to APEX because APEX operates at design/spec time and this collection operates at analysis/operational time. The domains that partially overlap (Web App, Cloud, IAM, API, DevSecOps) overlap only at the interface — APEX specs what to build; this collection investigates what's already running.

**Recommended absorption (4 targeted actions)**:

1. **Extend `apex-security`** with an operational shift-left toolchain annex drawing from the DevSecOps scanning cluster (Semgrep, Trivy, ZAP, Gitleaks) and the supply-chain/SBOM cluster (syft, grype, in-toto, NVD API).
2. **Extend `apex-security`** with an OWASP Threat Dragon / STRIDE DFD workflow section (lightweight — fills the structured threat-model tooling gap).
3. **New `apex-incident-response` skill** seeded from the Incident Response + SOC Playbook cluster — containment, timeline, ransomware response.
4. **Park LLM guardrails cluster** for a future `apex-ai-systems` update pass (runtime NeMo/Guardrails-AI patterns for APEX-built AI products).

**Skip**: Malware Analysis, Digital Forensics, Threat Intelligence, Threat Hunting, Phishing Defense, OT/ICS, Mobile, Deception Technology, all Artemis candidates.

**Hard reject** (dual-use offensive): All Red Teaming and Penetration Testing skills; C2 infrastructure builders (`building-c2-infrastructure-with-sliver-framework`, `exploiting-ms17-010-eternalblue-vulnerability`, etc.) — outside APEX's defensive mission and carry dual-use risk.
