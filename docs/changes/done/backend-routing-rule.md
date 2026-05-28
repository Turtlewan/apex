# Spec: Backend Routing Rule

## Scope

Formalise the two-backend workflow as a permanent, readable reference:

1. Create `~/apex/BACKEND-ROUTING.md` — the canonical routing table. Covers which
   backend to use for which activity, the detection mechanism, and edge cases.

2. Update `~/apex/CLAUDE.md` — add a compact "Backend routing" section that points to
   BACKEND-ROUTING.md and states the detection rule in one paragraph.

3. Update `docs/status.md` header block — add a one-line `backends:` field so every
   session sees the routing summary at a glance.

The routing rule is already implemented (the harness enforces it via PreToolUse hook),
but it exists only in the global `~/.claude/CLAUDE.md`. This spec makes it visible and
discoverable inside the APEX project itself.

---

## Files to change

| File | Action |
|------|--------|
| `~/apex/BACKEND-ROUTING.md` | Create |
| `~/apex/CLAUDE.md` | Edit: add Backend routing section |
| `~/apex/docs/status.md` | Edit: add `backends:` field to header block |

---

## Exact changes

### 1. Create `~/apex/BACKEND-ROUTING.md`

```markdown
# Backend Routing

This project runs under two AI backends. The active backend is detected from
`ANTHROPIC_BASE_URL` at session start. Each backend has a distinct role.

---

## Detection rule

| `ANTHROPIC_BASE_URL` | Active backend | Mode |
|----------------------|---------------|------|
| unset or `api.anthropic.com` | **Claude (Anthropic)** | Planning |
| contains `deepseek` | **DeepSeek V4 Flash** | Coding |

The harness enforces this automatically via a PreToolUse hook:
- Planning mode blocks Write/Edit on non-`.md` files
- Coding mode has no such restriction

---

## Activity routing

### Claude — Planning mode

Use Claude for activities that require judgment, design, and decision-making:

| Activity | Skill invoked |
|----------|-------------|
| Writing specs | apex-plan |
| Architecture decisions / ADRs | apex-architecture, apex-system-design |
| Research before deciding | apex-research |
| UI/UX design review | apex-ui-ux-design |
| Security threat modelling | apex-security (SKILL.md) |
| Code review (reading + flagging) | apex-reviewer |
| Documentation planning | apex-docs-product (SKILL.md), apex-docs-technical |
| Brainstorming / ideation | — |
| Debugging investigation | apex-debug |
| Any question requiring explanation | — |

### DeepSeek V4 Flash — Coding mode

Use DeepSeek for activities that require file manipulation and execution:

| Activity | Skill invoked |
|----------|-------------|
| Executing a spec | apex-code |
| Implementing features | apex-code + domain impl.md |
| Writing/editing source files | apex-code |
| Running commands (build, lint, test) | apex-code |
| Fixing bugs (with root cause known) | apex-code |
| Writing tests | apex-testing (impl.md) |
| Database migrations | apex-data (impl.md) |
| Scaffolding boilerplate | apex-code |
| Security implementation | apex-security (impl.md) |

### Both backends — no restriction

| Activity | Notes |
|----------|-------|
| Reading files | Both can read any file |
| Searching / grep | Both |
| Answering questions about code | Both |
| Invoking any skill | All skills are backend-agnostic |
| Writing `.md` files | Both (planning writes specs/docs; coding writes handoffs) |

---

## Skill backend mapping

Every skill file has a `backend:` field in its frontmatter:

```yaml
backend: claude    # → SKILL.md files (planning mode)
backend: deepseek  # → impl.md files (coding mode)
```

Both backends can invoke any skill via the `Skill` tool. The `backend:` field is
informational — it signals which mode the skill was designed for. Skills load the same
way regardless of which backend is active.

---

## Known limitations by backend

### DeepSeek V4 Flash limitations (vs Claude)

| Feature | DeepSeek | Claude |
|---------|----------|--------|
| Image content blocks | ❌ Not supported | ✅ |
| Document content blocks | ❌ Not supported | ✅ |
| Prompt caching (cache_control) | ❌ Ignored | ✅ |
| Citations | ❌ Not supported | ✅ |
| MCP tool calls (harness-level) | ✅ Works via harness | ✅ |
| Tool use (function calling) | ✅ Full support | ✅ |
| Thinking mode | ✅ Supported | ✅ |
| Context window | 1M tokens | 200k tokens |

**Practical impact on skills:**
- `apex-figma`: visual comparison step skipped by DeepSeek — flagged for planning-mode review
- All other skills: no functional difference

### Claude planning mode limitations

- Cannot write/edit source files (`.ts`, `.js`, `.py`, etc.) — harness blocks these
- Can only write `.md`, `.markdown`, `.txt` files
- Cannot run build commands

---

## Switching backends

**To switch to coding mode (DeepSeek):**
```powershell
$env:ANTHROPIC_BASE_URL = "https://api.deepseek.com/anthropic"
$env:ANTHROPIC_AUTH_TOKEN = "<your DeepSeek API key>"
$env:ANTHROPIC_MODEL = "deepseek-v4-flash"
```

**To switch to planning mode (Claude):**
```powershell
Remove-Item Env:ANTHROPIC_BASE_URL -ErrorAction SilentlyContinue
$env:ANTHROPIC_AUTH_TOKEN = "<your Anthropic API key>"
```

Then restart Claude Code (`claude`) in the project directory.

---

## The loop

```
Planning session (Claude)
  └── Writes specs → docs/changes/*.md
        │
        ▼
Coding session (DeepSeek)
  └── Executes specs → docs/changes/done/
  └── Writes handoff → docs/handoff/YYYY-MM-DD.md
        │
        ▼
Planning session (Claude)
  └── Reads handoff, plans next specs
```

---

_Last updated: 2026-05-27 | DeepSeek: V4 Flash | Claude: Sonnet 4.6 / Opus 4.7_
```

---

### 2. Edit `~/apex/CLAUDE.md`

Add this section after the `## What this project is` section (before `## Skill file locations`):

```markdown
## Backend routing

Two backends, one harness. Detection is automatic from `ANTHROPIC_BASE_URL`.

| Backend | URL contains | Mode | Can write source files? |
|---------|-------------|------|------------------------|
| **Claude (Anthropic)** | unset / `api.anthropic.com` | Planning | No — `.md` only |
| **DeepSeek V4 Flash** | `deepseek` | Coding | Yes — all files |

Full routing table: see [BACKEND-ROUTING.md](./BACKEND-ROUTING.md).

**All skills are callable from both backends.** Skills have a `backend:` frontmatter field
indicating which mode they were designed for, but this does not restrict invocation.
Exception: `apex-figma` visual comparison steps require image support — DeepSeek skips
these and flags for planning-mode review.
```

---

### 3. Edit `~/apex/docs/status.md`

In the header block (the lines after the project description, before `_Last updated by planning mode:`),
add one line:

```
backends: planning=claude | coding=deepseek-v4-flash
```

So the header block reads:
```markdown
stack: Markdown / Claude Code skills
token_profile: balanced
autonomy_level: L2
specialists_default: []
backends: planning=claude | coding=deepseek-v4-flash
```

---

## Acceptance criteria

- `~/apex/BACKEND-ROUTING.md` exists with: detection table, activity routing tables, skill
  backend mapping, limitations table, switching commands, the loop diagram
- `~/apex/CLAUDE.md` has a "Backend routing" section with the 3-column detection table
  and a link to BACKEND-ROUTING.md
- `~/apex/docs/status.md` header has `backends:` field
- `~/apex/SKILLS.md` — add a pointer line near the top:
  `> **Backend routing:** see [BACKEND-ROUTING.md](./BACKEND-ROUTING.md)`

---

## Commands to run

None — Markdown only.

---

## Risks / open questions

- The `ANTHROPIC_MODEL` env var for DeepSeek V4 Flash: the docs show `deepseek-v4-flash`
  as the model ID. If DeepSeek renames or updates the model ID, the switching commands
  section of BACKEND-ROUTING.md will need updating. Staleness threshold: 30 days.
- DeepSeek V4 Flash maps from `claude-haiku/sonnet` automatically — so setting
  `ANTHROPIC_MODEL=deepseek-v4-flash` explicitly is optional but recommended for clarity.
