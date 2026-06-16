# Backend Routing

This project runs under two AI backends. The active backend is detected from
`ANTHROPIC_BASE_URL` at session start. Each backend has a distinct role.

---

## Detection rule

| `ANTHROPIC_BASE_URL` | `ANTHROPIC_MODEL` | Active backend | Mode |
|----------------------|-------------------|----------------|------|
| unset or `api.anthropic.com` | — | **Claude (Anthropic)** | Planning |
| contains `deepseek` | `deepseek-v4-flash` (or unset) | **DeepSeek V4 Flash** | Coding |
| contains `deepseek` | `deepseek-v4-pro` | **DeepSeek V4 Pro** | Coding |

The coding tier (Flash vs Pro) is selected by the `apex-code` shell toggle (see [Switching backends](#switching-backends)) and persisted in `~/.apex-coding-model`. Pro is ~3.1× the cost of Flash. The SessionStart hook reads `ANTHROPIC_MODEL` and injects a `coder_tier` value (`flash`|`pro`); apex-orchestrate surfaces it in the Step-6 status line as `Tier: {flash|pro}`.

The harness enforces this automatically via a PreToolUse hook:
- Planning mode gates Write/Edit on non-`.md` files behind an approval prompt (default
  guidance: do code edits in a DeepSeek coding session). The APEX project itself and any file
  under `~/.claude/` (APEX system files) are exempt and pass silently — APEX is self-hosting.
- Coding mode has no such restriction

A SessionStart hook also injects the active backend/mode and directs the session to invoke
`apex-orchestrate` first; each session opens with a `[APEX] Using APEX system -- {MODE} mode`
banner confirming the orchestrator ran. (See [ADR-009](./docs/technical/adr/ADR-009-harden-session-start-and-write-guard.md).)

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
| Bounded UI visual fix (ADR-020) | apex-ui-ux-design + apex-governance |
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
informational — it signals which mode the skill was designed for. Skills load the
same way regardless of which backend is active.

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
| Thinking mode | ✅ Enabled by default — auto-`max` for Claude Code¹ | ✅ |
| Context window | 1M tokens | 200k tokens |

¹ DeepSeek V4 runs coding mode at **maximum reasoning effort** automatically: thinking is enabled by
default, there is no "non-think" exposed via the effort param (only `high`/`max`), and DeepSeek
force-sets effort to `max` for Claude Code / OpenCode requests. APEX sets only `ANTHROPIC_MODEL` —
it does **not** (and currently cannot) request a lower tier; `budget_tokens` is ignored over the
Anthropic endpoint. So coding mode = **Flash-Max** (Pro toggle = **Pro-Max**), set by DeepSeek, not
by APEX config. [api-docs.deepseek.com — thinking_mode + anthropic_api; confirm on Mac via wire.]
See `docs/findings/deepseek-v4-paper-vs-apex-coding-assumptions.md`.

**Practical impact on skills:**
- `apex-figma`: visual comparison step skipped by DeepSeek — flagged for planning-mode review
- All other skills: no functional difference

### Claude planning mode limitations

- Write/Edit on non-`.md` source files (`.ts`, `.js`, `.py`, etc.) is gated behind an approval
  prompt (`permissionDecision: 'ask'` — **not** a hard block) — default guidance is to do code work
  in a DeepSeek coding session
  - Exception: the APEX project itself and `~/.claude/` system files pass without prompting,
    since APEX is self-hosting (planning mode maintains its own skills and hooks)
  - **Capability-routed UI escalation (ADR-020):** Claude may approve the prompt and make a
    *bounded* UI code edit — view-layer only, to fix an inherently-visual divergence the image-blind
    coder can't resolve from prose. Authority rule: apex-governance § Capability-routed UI escalation.
- Writes `.md`, `.markdown`, `.txt` files freely
- Cannot run build commands

---

## Switching backends

**To switch to coding mode (DeepSeek) — use the `apex-code` toggle:**

```sh
apex-code          # flip between Flash and Pro (alternates from last choice)
apex-code flash    # force Flash tier (deepseek-v4-flash)
apex-code pro      # force Pro tier (deepseek-v4-pro, ~3.1× Flash cost)
```

The function sets `ANTHROPIC_BASE_URL`, `ANTHROPIC_AUTH_TOKEN` (from `$DEEPSEEK_API_KEY` / `$env:DEEPSEEK_API_KEY`), and `ANTHROPIC_MODEL`, persists the tier to `~/.apex-coding-model`, then launches `claude`. Defined in `~/.zshrc` (Mac, primary) and `$PROFILE` (Windows).

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

_Last updated: 2026-06-16 | DeepSeek: V4 Flash / V4 Pro | Claude: Sonnet 4.6 / Opus 4.8_
