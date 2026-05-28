# Spec: SKILL-HISTORY.md — Skill Update Tracker

## Scope

Create `~/apex/SKILL-HISTORY.md` — a quick-reference log of every APEX skill creation and
update event. One row per event, newest first. Populated by reading the `last_updated` and
`sources` frontmatter from every existing `SKILL.md` and `impl.md` file, then recording initial
creation as a baseline entry. Future updates should append a new row (not edit the old one).

Also add a pointer to `SKILL-HISTORY.md` in `~/apex/SKILLS.md` near the top.

---

## Files to change

| File | Action |
|------|--------|
| `~/apex/SKILL-HISTORY.md` | Create |
| `~/apex/SKILLS.md` | Edit: add pointer line near top |

---

## Exact changes

### 1. Create `~/apex/SKILL-HISTORY.md`

Structure and initial content. Coding mode should:
1. Read every `~/.claude/skills/apex-*/SKILL.md` and `impl.md` for `last_updated` and `sources` frontmatter
2. For each skill, create one row using the `last_updated` date as the "created" event
3. Sort rows by Date descending (newest first)
4. Where a skill has both SKILL.md and impl.md with different `last_updated` dates, create two rows

**Table columns:**

| Column | Content |
|--------|---------|
| Date | `YYYY-MM-DD` from frontmatter `last_updated` |
| Skill | Skill folder name (e.g. `apex-github`) |
| Files | Which files exist: `SKILL + impl`, `SKILL only`, `impl only` |
| Version | From frontmatter `version` |
| Event | `created`, `updated`, or `updated (impl)` |
| What Changed | For initial baseline: `"Initial creation"`. For updates: short description |
| Sources | Comma-separated list from frontmatter `sources` (short form — just the site name, not full URL) |

**File template:**

```markdown
# APEX Skill History

Quick reference for skill creation and update events. Newest first.
One row per event — append new rows at the top when updating a skill.

| Date | Skill | Files | Version | Event | What Changed | Sources |
|------|-------|-------|---------|-------|-------------|---------|
| 2026-05-27 | apex-research | SKILL + impl | 1.0.0 | created | Initial creation | Context7 MCP, Exa Search, Firecrawl |
| 2026-05-27 | apex-mobile | SKILL + impl | 1.0.0 | created | Initial creation | Expo Docs, EAS Docs, React Native Docs |
| 2026-05-27 | apex-iac | SKILL + impl | 1.0.0 | created | Initial creation | HashiCorp Docs, Pulumi Docs, Ansible Docs |
| 2026-05-27 | apex-k8s | SKILL + impl | 1.0.0 | created | Initial creation | Kubernetes Docs, Helm Docs, ArgoCD Docs |
| 2026-05-27 | apex-homelab | SKILL + impl | 1.0.0 | created | Initial creation | Home Assistant Docs, ESPHome Docs |
| 2026-05-27 | apex-gcp | SKILL + impl | 1.0.0 | created | Initial creation | GCP Architecture Framework, Cloud Run Docs |
| 2026-05-27 | apex-azure | SKILL + impl | 1.0.0 | created | Initial creation | Azure WAF, Azure Docs, Bicep Docs |
| 2026-05-27 | apex-aws | SKILL + impl | 1.0.0 | created | Initial creation | AWS Well-Architected, CDK Docs, IAM Docs |
| 2026-05-27 | apex-github | SKILL + impl | 1.0.0 | created | Initial creation | GitHub Docs, Conventional Commits, Keep a Changelog |
| 2026-05-27 | apex-system-design | SKILL + impl | 1.0.0 | created | Initial creation | Designing Data-Intensive Applications, AWS Docs |
| 2026-05-27 | apex-devcontainer | SKILL + impl | 1.0.0 | created | Initial creation | Dev Container Spec, VS Code Docs |
| — | apex-ui-testing | SKILL + impl | — | created | Initial creation | Playwright Docs, Storybook Docs, axe-core Docs |
| — | apex-figma | SKILL + impl | — | created | Initial creation | Figma Docs, Framelink MCP |
| — | apex-animation | SKILL + impl | — | created | Initial creation | Motion Docs, GSAP Docs |
| — | apex-design-system | SKILL + impl | — | created | Initial creation | shadcn/ui Docs, Tailwind Docs, Storybook Docs |
| — | apex-ui-ux-design | SKILL + impl | — | created | Initial creation | WCAG 2.1, Nielsen Norman Group |
| — | apex-docs-technical | SKILL only | — | created | Initial creation | — |
| 2026-05-24 | apex-docs-product | impl only | 1.0.0 | created | Initial creation | Keep a Changelog |
| — | apex-data | SKILL + impl | — | created | Initial creation | Prisma Docs, PostgreSQL Docs |
| — | apex-ai-systems | SKILL + impl | — | created | Initial creation | Vercel AI SDK Docs, OpenAI Cookbook |
| — | apex-accessibility | SKILL + impl | — | created | Initial creation | WCAG 2.1, ARIA Authoring Practices |
| — | apex-observability | SKILL + impl | — | created | Initial creation | OpenTelemetry Docs, Sentry Docs |
| — | apex-performance | SKILL + impl | — | created | Initial creation | web.dev, Lighthouse Docs |
| — | apex-testing | SKILL + impl | — | created | Initial creation | Vitest Docs, Playwright Docs |
| — | apex-devops | SKILL + impl | — | created | Initial creation | GitHub Actions Docs, Docker Docs |
| — | apex-architecture | SKILL only | — | created | Initial creation | Domain-Driven Design (Evans), Clean Architecture |
| — | apex-backend | SKILL + impl | — | created | Initial creation | Prisma Docs, PostgreSQL Docs, Zod Docs |
| — | apex-frontend | SKILL + impl | — | created | Initial creation | Next.js Docs, React Docs, TanStack Query Docs |
| — | apex-security | SKILL + impl | — | created | Initial creation | OWASP Top 10, OAuth 2.0 RFC |

---

## How to update this file

When creating or significantly updating a skill, prepend a new row:

```markdown
| 2026-XX-XX | apex-<name> | SKILL + impl | 1.1.0 | updated | Brief description of what changed | Source name |
```

Event values: `created` · `updated` · `updated (impl)` · `updated (SKILL)`

## Skills with missing dates

Skills marked `—` in the Date column were created before date tracking was established.
To fill them in: check `git log` or the `last_updated` field in each skill's frontmatter.
```

**Coding mode instructions:**
- Fill in `—` dates and versions by reading the actual `last_updated` and `version` fields from each skill's frontmatter before writing the file
- If a skill's frontmatter is missing `last_updated`, use `—` (do not guess)
- Sort all rows by date descending after filling in real dates; undated rows go at the bottom

---

### 2. Edit `~/apex/SKILLS.md`

After the first two lines (title + description), add:

```markdown
> **Skill history:** see [SKILL-HISTORY.md](./SKILL-HISTORY.md) for creation dates, versions, and sources.
```

---

## Acceptance criteria

- `~/apex/SKILL-HISTORY.md` exists with the table header and at least one row per skill
- All skills present in `~/.claude/skills/apex-*/` have at least one row in the table
- Rows with real frontmatter dates are filled in (not `—`)
- Rows are sorted newest first (real dates above undated rows)
- `SKILLS.md` has a `> Skill history:` callout pointing to `SKILL-HISTORY.md`

---

## Commands to run

None — Markdown only.

---

## Risks / open questions

- Skills created before frontmatter was standardised may have no `last_updated` — leave as `—`, don't guess.
- If a skill directory exists but has no frontmatter at all, read the file mod date as a fallback or leave `—`.
