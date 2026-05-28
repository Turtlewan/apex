# Requirements

## In scope
- The full set of `~/.claude/skills/apex-*` skill files (SKILL.md + impl.md pairs)
- Supporting files: `~/.claude/registry/`, `~/.claude/skills/apex-orchestrate/templates/`
- Coordination between skills (orchestrator routing, specialist loading)
- The planning ↔ coding backend-gated workflow
- Session persistence via `docs/status.md`, `docs/handoff/`, `docs/changes/`
- The SKILLS.md tiered index at `~/apex/SKILLS.md`

### Skills in scope (as of 2026-05-27)

**Orchestration:**
apex-orchestrate, apex-init, apex-plan, apex-code, apex-debug, apex-handoff,
apex-deep-dive, apex-refresh, apex-governance

**Infrastructure & DevOps:**
apex-devops, apex-iac, apex-k8s, apex-devcontainer

**Cloud:**
apex-aws, apex-azure, apex-gcp

**Application development:**
apex-backend, apex-frontend, apex-mobile, apex-ai-systems, apex-data

**Architecture & Design:**
apex-architecture, apex-system-design, apex-ui-ux-design, apex-design-system

**Quality & Operations:**
apex-security, apex-observability, apex-performance, apex-accessibility, apex-testing

**Specialised:**
apex-github, apex-homelab, apex-research, apex-animation, apex-figma,
apex-docs-product, apex-docs-technical, apex-ui-testing

## Out of scope
- Non-APEX skills (`gsd-*`, `superpowers:*`, design skills, etc.) — separate systems
- Claude Code itself (the CLI) — upstream, not ours to change
- `CLAUDE.md` behavioural guidelines — governed separately

## Open questions
- Should `apex-docs-product` get a SKILL.md to match all other specialists?
- Registry at `~/.claude/registry/domains.md` — does it need updating for the 11 new skills?
- Additional specialists to build: apex-payments, apex-auth, apex-email, apex-websockets?
