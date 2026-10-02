# APEX Skills Index

Every APEX skill lives at `~/.claude/skills/apex-*/SKILL.md`.

> **Skill history:** [SKILL-HISTORY.md](./SKILL-HISTORY.md) — versions, dates, sources.

## What APEX is (and is not)

APEX carries **workflow, state, and gates**. It does **not** carry domain knowledge.

The 36 domain skills — security, frontend, k8s, auth, python, aws, and the rest — were **deleted on
2026-07-14** ([ADR-036](./docs/technical/adr/ADR-036-remove-knowledge-layer.md)). They were built for
DeepSeek, a weak coder that needed rails. The coder is now Codex `gpt-5.6-sol` (Sonnet 5 on fallback),
which knows all of it cold. Along with them went the keyword registry, which duplicated Claude
Code's own description-matching.

**The test for any new skill:** would a bare frontier agent, with nothing loaded, produce this? If
yes, it does not belong in APEX. Domain expertise is *applied at drafting* and *stress-tested at
review* — never written down.

---

## The 14 skills

### Spine — the session loop

| Skill | Invoke when | Loading |
|-------|-------------|---------|
| **apex-orchestrate** | Session start — orient, route | always, first |
| **apex-init** | No `docs/status.md` — bootstrap a new project | auto via orchestrate |
| **apex-plan** | Planning, designing, speccing | auto via orchestrate |
| **apex-code** | Building — executing a spec | auto via orchestrate |
| **apex-handoff** | The coding↔planning handoff contract (canonical home) | auto via plan/code |
| **apex-governance** | Autonomy L0–L5, approval gates, hard blocks (canonical home) | referenced by orchestrate/code |

### Process

| Skill | Invoke when | Loading |
|-------|-------------|---------|
| **apex-debug** | Bug / root cause / broken / not working | auto via orchestrate |
| **apex-research** | Research before a decision — parallel, source-grounded | explicitly |
| **apex-deep-dive** | 2–3-option analysis when genuinely uncertain; Council mode | explicitly |
| **apex-stack** | Tech-stack selection for a new project | explicitly |

### Meta — APEX maintaining itself

| Skill | Invoke when | Loading |
|-------|-------------|---------|
| **apex-skill-author** | Creating or editing any APEX skill — the Iron Law | explicitly |
| **apex-refresh** | Skill-set currency refresh, staleness audit, stocktake | explicitly |
| **apex-context-budget** | "How much context am I burning?" — leanness review | explicitly |
| **apex-coding-principles** | Baseline code quality (impl.md) | auto-loaded by apex-code |

---

## Agents (6)

| Agent | Spawned by | Job |
|-------|-----------|-----|
| **apex-build-orchestrator** | apex-code (host dispatch, attended builds) | Build-phase wave scheduling, dispatch parameters, exit-code routing, verify adjudication, integration order — reasoning only; close-out and AFK stay host-executed |
| **apex-coder** | apex-code | Dependency analysis, wave grouping, parallel dispatch — **Claude-fallback path only** |
| **code-worker** | apex-coder | One isolated task from a spec |
| **apex-critic** | apex-plan (`mode: spec`), apex-code (`mode: code`) | Advisory review of specs and code; full round 1, fix-check rounds 2–3; Agent tool `model: sonnet` for Low/Medium/doc-only, `model: opus` for High |

Plus two process agents that write docs: `apex-docs-product-agent` (CHANGELOG/README) and
`apex-docs-technical-agent` (handoff + spec archive).

The reviewers are **generic**. Their value is **evaluator-independence** — a fresh adversarial
reader, not a rulebook. Findings must cite evidence (a file:line, a quoted spec clause, a concrete
failing scenario), not a skill rule. Cross-family routing holds: Codex builds → Claude reviews
(ADR-032/034).

---

## Where things live

| Thing | Path |
|-------|------|
| Skills | `~/.claude/skills/apex-*/SKILL.md` |
| Agents | `~/.claude/agents/` |
| Templates | `~/.claude/skills/apex-orchestrate/templates/` |
| Design workflow | `~/.claude/skills/apex-plan/references/design-workflow.md` |
| Verification Recipe | **the project's** `AGENTS.md` — a per-project fact, not a skill |
