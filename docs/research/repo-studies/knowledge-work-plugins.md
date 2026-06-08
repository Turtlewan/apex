# Repo Study: anthropics/knowledge-work-plugins

_Research date: 2026-06-05_

---

## Repo Identity

| Field | Value |
|-------|-------|
| URL | https://github.com/anthropics/knowledge-work-plugins |
| Owner | Anthropic (official) |
| License | Apache-2.0 |
| Stars | ~19.3k |
| Commits | 93 |
| Primary audience | Claude Cowork users; also works in Claude Code |
| Format | Pure Markdown + JSON (no code, no build step) — same format as APEX |

### What it is

A collection of plugins designed to make Claude a domain specialist for knowledge-worker roles. Each plugin bundles: SKILL.md files (domain expertise), optional commands (slash commands), optional .mcp.json connectors (MCP server wiring), and a plugin.json manifest. Plugins install via `claude plugin install <name>@knowledge-work-plugins`.

The plugin format itself is the same structure as APEX skills (SKILL.md + references/ subdirectories + YAML frontmatter), just bundled differently (plugin.json manifest + .mcp.json).

---

## Full Plugin Inventory

### Official plugins (11)

| Plugin | Skills | Purpose |
|--------|--------|---------|
| **productivity** | memory-management, task-management, start, update | Persistent task tracking (TASKS.md), two-tier memory system (CLAUDE.md hot cache + memory/ dir), daily workflow |
| **sales** | account-research, call-prep, call-summary, competitive-intelligence, create-an-asset, daily-briefing, draft-outreach, forecast, pipeline-review | End-to-end sales workflow: prospect research, call prep/debrief, outreach drafting, pipeline management |
| **customer-support** | ticket-triage, draft-response, customer-research, customer-escalation, kb-article | Ticket lifecycle: triage → research → draft response → escalate → publish knowledge base article |
| **product-management** | write-spec, synthesize-research, roadmap-update, sprint-planning, competitive-brief, metrics-review, stakeholder-update, product-brainstorming | Full PM workflow: spec writing, research synthesis (interviews/surveys/analytics), roadmap, stakeholder comms |
| **marketing** | draft-content, content-creation, campaign-plan, brand-review, competitive-brief, email-sequence, seo-audit, performance-report | Content creation, campaign planning, brand enforcement, SEO, performance reporting |
| **legal** | review-contract, triage-nda, compliance-check, legal-risk-assessment, brief, meeting-briefing, signature-request, vendor-check, legal-response | Contract/NDA review, compliance, risk assessment, legal correspondence |
| **finance** | journal-entry, journal-entry-prep, reconciliation, financial-statements, variance-analysis, close-management, audit-support, sox-testing | Accounting workflows: journal entries, reconciliation, statements, month-end close, SOX compliance |
| **data** | analyze, explore-data, sql-queries, write-query, statistical-analysis, data-visualization, create-viz, build-dashboard, validate-data, data-context-extractor | Data analysis lifecycle: explore → query → analyze → visualize → validate → dashboard |
| **enterprise-search** | search, digest, search-strategy, knowledge-synthesis, source-management | Cross-tool search and synthesis: parallel multi-source queries, daily/weekly digests, deduplication, confidence scoring, source management |
| **bio-research** | instrument-data-to-allotrope, nextflow-development, scientific-problem-selection, scvi-tools, single-cell-rna-qc, start | Life sciences R&D: bioinformatics pipelines (Nextflow), single-cell RNA analysis, lab instrument data standardization |
| **cowork-plugin-management** | create-cowork-plugin, cowork-plugin-customizer | Meta-skill: guide users through building a new plugin from scratch, including manifest, skills, MCP wiring, packaging |

### Additional plugins (not in official 11 but present in repo)

| Plugin | Skills | Purpose |
|--------|--------|---------|
| **design** | accessibility-review, design-critique, design-handoff, design-system, research-synthesis, user-research, ux-copy | Design workflow: UX research, accessibility, handoff, copy |
| **engineering** | architecture, code-review, debug, deploy-checklist, documentation, incident-response, standup, system-design, tech-debt, testing-strategy | Software engineering: ADRs, code review, debugging, system design, incident response |
| **human-resources** | comp-analysis, draft-offer, interview-prep, onboarding, org-planning, people-report, performance-review, policy-lookup, recruiting-pipeline | HR workflows: recruiting, offers, onboarding, performance, comp |
| **operations** | capacity-plan, change-request, compliance-tracking, process-doc, process-optimization, risk-assessment, runbook, status-report, vendor-review | Ops workflows: runbooks, change management, compliance, vendor review |
| **small-business** | 31 skills: business-pulse, smb-router, cash-flow-snapshot, contract-review, crm-cleanup, content-strategy, canva-creator, and more | SMB-specific: covers finance, sales, marketing, legal, HR, and ops condensed for a solo-operator context |
| **pdf-viewer** | view-pdf | Interactive PDF annotation, form-filling, and visual signature placement via local MCP server |

### Partner-built plugins (in partner-built/)

| Plugin | Skills | Purpose |
|--------|--------|---------|
| **apollo** | enrich-lead, prospect, sequence-load | Lead enrichment and sequencing via Apollo.io |
| **brand-voice** | brand-voice-enforcement, discover-brand, guideline-generation | Extract brand voice guidelines and enforce them in content |
| **common-room** | account-research, call-prep, compose-outreach, contact-research, prospect, weekly-prep-brief | Sales intelligence via Common Room |
| **slack** | slack-messaging, slack-search | Slack-optimized search and messaging patterns |
| **zoom-plugin** | 30+ skills covering: build-zoom-bot, meeting-sdk (per platform), video-sdk (per platform), contact-center, oauth, webhooks, websockets, virtual-agent, rtms, scribe, etc. | Comprehensive Zoom developer SDK reference plugin |

---

## Per-Notable-Plugin Assessment

### 1. enterprise-search plugin

The highest-value plugin for Artemis. Contains four tightly integrated skills:

- **search**: Multi-source parallel query decomposition. Parses user query into intent + entities + constraints, generates source-specific sub-queries (~~chat, ~~email, ~~cloud storage, ~~project tracker, ~~CRM, ~~knowledge base), executes in parallel, ranks and deduplicates.
- **knowledge-synthesis**: "Last mile" synthesis layer. Takes raw multi-source results and produces a narrative answer with confidence scoring (freshness × authority × agreement), deduplication rules, and citation formatting. Handles small/medium/large result sets differently.
- **search-strategy**: Query decomposition intelligence. Classifies query type (decision / status / document / person / factual / temporal / exploratory), maps each to source priority order, generates multiple query variants per source, handles ambiguity with one clarifying question.
- **digest**: Daily/weekly digest from all connected sources. Groups activity by topic (not source), extracts action items, decisions, mentions, document updates. Handles source failures gracefully.
- **source-management**: MCP source detection, connection guidance, rate-limit handling, source health tracking.

These five skills together constitute a complete **RAG orchestration pattern** at the prompt-engineering level. The search → strategy → synthesis pipeline and the confidence/authority scoring model are directly applicable to Artemis's second-brain knowledge subsystem.

### 2. productivity/memory-management

Two-tier memory architecture:
- **Hot cache** (CLAUDE.md): ~30 people, ~30 acronyms, active projects, preferences — covers 90% of daily decoding. Target ≤100 lines.
- **Deep store** (memory/ dir): glossary.md (full decoder ring), people/{name}.md, projects/{name}.md, context/company.md — grows without bound.

Lookup is always hot cache first, then deep store, then ask user. Progressive promotion/demotion rules keep CLAUDE.md fresh.

For Artemis, this is a concrete implementation of a lightweight personal knowledge base (the "second brain" lite). The tiered lookup pattern (fast cache vs. full index) is directly relevant for Artemis's memory/retrieval subsystem design.

### 3. product-management/synthesize-research

Exceptionally thorough research synthesis skill: thematic analysis, affinity mapping, triangulation, qual-quant integration, persona development from research, opportunity sizing matrix. Full methodology, not just a prompt.

For Artemis Lens B: the research synthesis capability (interviews, surveys, feedback → structured insights + persona + roadmap recommendations) is a natural Artemis "second brain" feature — could be an Artemis action mode, not just a workflow skill.

### 4. pdf-viewer/view-pdf

Interactive PDF via local MCP server: annotation (highlight, underline, strikethrough, note, stamp, freetext, rectangle, circle, line), form-filling (handles cryptic field names via screenshot-based matching), image-based signature placement. Explicitly NOT for summarization (use Read for that).

For Artemis: relevant as a document-interaction modality. The pattern of having a local MCP server for document rendering and annotation is worth copying for Artemis's document-handling architecture.

### 5. cowork-plugin-management/create-cowork-plugin

Encodes the full plugin architecture (plugin.json, SKILL.md, .mcp.json, agents, hooks) and a five-phase guided creation workflow (discovery → component planning → design → implementation → review/package). Notably: "~~" placeholders for generic connector names (CONNECTORS.md pattern).

For APEX: the `~~` placeholder convention for tool-agnostic connectors is a direct technique APEX could adopt in any skill that references external tools, instead of hardcoding tool names (Jira vs. Linear vs. Asana). The plugin.json manifest format documents the official Claude Code plugin contract.

### 6. engineering plugin

Nine skills covering architecture (ADR format), code-review, debug, system-design, incident-response, tech-debt, deploy-checklist, documentation, testing-strategy, standup.

APEX overlap: Very high. APEX already has apex-architecture, apex-backend, apex-debug, apex-devops, apex-testing, apex-docs-technical, apex-docs-product, apex-observability. The ADR format in the engineering/architecture skill is similar to what APEX already produces. The engineering plugin adds little net new over APEX's existing stack skills.

---

## Token-Cost Assessment

| Plugin | Auto-load behavior | Token cost when used |
|--------|-------------------|---------------------|
| enterprise-search | Skills fire automatically; all 5 skills load when search-related queries appear | **HIGH** — 5 large skills, each ~150-250 lines; source-management loads alongside search always |
| productivity | memory-management loads on every request (it's a hot-cache decoder) | **HIGH** — memory-management is always-on; CLAUDE.md grows per user |
| product-management | synthesize-research is user-invocable only | **Med** — on-demand |
| pdf-viewer | User-invocable (explicit open/view commands) | **Low** — only fires when user says "open/show PDF" |
| cowork-plugin-management | User-invocable (explicit plugin creation) | **Low** — on-demand |
| engineering | Most skills are user-invocable slash commands | **Low-Med** — per-command |
| bio-research | Domain-specific, fires only on bio research queries | **Low** — niche trigger |
| small-business | smb-router skill activates and routes to sub-skills | **Med** — router always loads, sub-skills on demand |

---

## Candidate Table

| Candidate | Lens | Dedup vs APEX | Token-cost | Verdict |
|-----------|------|--------------|------------|---------|
| enterprise-search: search + knowledge-synthesis + search-strategy | **Artemis-B** | Novel — APEX has apex-research (web-focused), not multi-source structured retrieval | **HIGH** | Absorb patterns into Artemis architecture spec. The three-skill pipeline (decompose → search → synthesize) + confidence scoring model are the architectural blueprint for Artemis's RAG orchestration. Do NOT add to APEX as skills; use as Artemis design input. |
| enterprise-search: digest | **Artemis-B** | Novel | Med | Artemis feature candidate: daily/weekly digest across connected sources is a core Jarvis-like feature. Absorb the digest format and topic-grouping pattern. |
| enterprise-search: source-management | **Artemis-B** | Novel | Low | Artemis infrastructure pattern: MCP source health tracking, rate-limit handling, graceful partial-failure. Worth copying as an Artemis subsystem design. |
| productivity: memory-management (two-tier pattern) | **Artemis-B** | Partial — APEX uses status.md + memory files, not a tiered personal knowledge base | Med-High (always-on) | Absorb the tiered hot-cache/deep-store architecture for Artemis's personal memory subsystem. The CLAUDE.md hot-cache + memory/ dir pattern is the simplest viable personal knowledge graph. Flag HIGH cost: always-on memory loader is expensive per session. |
| product-management: synthesize-research | **Artemis-B** | Partial — APEX has apex-research (web research), not interview/survey synthesis | Med | Artemis feature: research synthesis (qual + quant, affinity mapping, personas) is a natural "second brain" action. The methodology section (thematic analysis, triangulation, opportunity sizing) is high-quality reference material. Consider as an Artemis skill. |
| pdf-viewer: view-pdf | **Artemis-B** | Novel — APEX has no document-viewing/annotation skill | Low | Artemis feature: interactive PDF annotation + form-filling via local MCP server. The MCP server pattern for document rendering is directly reusable. Recommend as an Artemis capability. |
| cowork-plugin-management: create-cowork-plugin | **APEX-A** | Partial — apex-skill-author covers APEX skill authoring; this covers the broader plugin format | Low | Partial absorb for APEX: the `~~` placeholder convention for tool-agnostic connectors and the plugin.json manifest structure are worth documenting in apex-skill-author or a new apex-plugin-author skill. Not urgent. |
| engineering plugin (all skills) | **APEX-A** | Already-have — significant overlap with apex-architecture, apex-backend, apex-debug, apex-devops, apex-testing | Low | Skip. APEX's domain-specific skills (with impl.md coding patterns) are deeper than these generic workflow prompts. |
| design plugin | **APEX-A** | Partial — APEX has apex-ui-ux-design, apex-design-system, apex-accessibility, apex-figma | Low | Skip for now. APEX coverage is adequate. Artemis relevance: minimal (design is a build-tool concern, not an assistant feature). |
| bio-research plugin | Either | Novel but niche | Low | Skip. Not relevant to APEX (software building system) or Artemis (personal assistant). Highly specialized. |
| small-business plugin | Either | Novel | Med | Skip. SMB workflow skills are irrelevant to APEX. Artemis could eventually serve personal/business finance use cases, but this is premature. |

---

## Bottom Line

**Primary value is Artemis Lens B, not APEX Lens A.**

The engineering, design, and operations plugins heavily overlap with APEX's existing skills. The genuinely novel material is in:

1. **enterprise-search** — The most directly Artemis-relevant: a complete RAG orchestration architecture in prompt form (multi-source parallel search, query decomposition, confidence-scored synthesis, digests). This is the architectural blueprint for Artemis's second-brain knowledge retrieval layer. Absorb as design patterns, not APEX skills.

2. **productivity/memory-management** — The two-tier hot-cache/deep-store personal memory pattern is the simplest production-ready personal knowledge graph architecture. Token cost is non-trivial (always-on loader). Absorb for Artemis memory subsystem design.

3. **pdf-viewer** — Practical Artemis capability: local MCP server for interactive PDF viewing, annotation, and form-filling. Low token cost, high user value.

4. **product-management/synthesize-research** — Research synthesis methodology (thematic analysis, affinity mapping, qual-quant, personas) is high-quality reference material for an Artemis "second brain" analysis mode.

**APEX-specific takeaway**: The `~~` placeholder convention (from cowork-plugin-management) is worth adding to the apex-skill-author authoring guide — it is an elegant pattern for making skills tool-agnostic without losing specificity.

**Token cost warning**: enterprise-search and productivity/memory-management are **HIGH** token-cost patterns when auto-loading. Artemis must implement them with explicit invocation gates or lazy-loading, not always-on. Flag for Artemis architecture spec.
