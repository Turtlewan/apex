# Backend Routing

> **ADR-027 (current).** Coding is **Codex-primary**: `gpt-5.5` via `codex exec` is the default coder,
> dispatched from a **Claude coding host** (`APEX_MODE=coding`); **Opus** is the manual fallback when
> Codex quota runs out. **DeepSeek (Flash/Pro) is archived** — recovery-only, parked launchers. Planning
> stays Claude/Opus. The DeepSeek-centric detail below is retained for recovery context only.

This project detects its mode from `ANTHROPIC_BASE_URL` + `APEX_MODE` at session start.

---

## Detection rule

| `ANTHROPIC_BASE_URL` | `APEX_MODE` | Mode | Coder |
|----------------------|-------------|------|-------|
| unset / `api.anthropic.com` | unset | **Planning** | — |
| unset / `api.anthropic.com` | `coding` | **Claude coding** (build host) | **Codex `gpt-5.5`** primary (`codex exec`); **Opus** inline fallback on Codex quota-out |
| contains `deepseek` | — | **DeepSeek** | _archived (ADR-027) — recovery-only_ |

Launchers: **`codex-code`** = run Codex directly (supervised); **`apex-opus`** = the Claude coding host
(`APEX_MODE=coding`, Opus fallback that dispatches Codex per task). The archived DeepSeek launchers are
`coding-mode-deepseek` / `apex-code-deepseek-pro` (parked, recover by un-renaming).

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

### Coding mode (Codex-primary, Opus fallback) — _DeepSeek archived (ADR-027)_

Coding runs in the Claude coding host (`APEX_MODE=coding`); Codex (`gpt-5.5`) builds each task via
`codex exec`, Opus is the inline fallback. (The DeepSeek references below are the archived form.)

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

**Primary coding — run Codex directly (supervised):**
```sh
codex-code     # launches the Codex CLI (gpt-5.5, workspace-write). Point it at a spec; you supervise + commit.
```

**Opus fallback — the Claude coding host (when Codex quota is out):**
```sh
apex-opus      # APEX_MODE=coding on the Anthropic backend; Opus host dispatches Codex per task and builds
               # inline as Opus on quota-out. Write-guard relaxed.
```

**Archived (DeepSeek, recovery-only — ADR-027):** `coding-mode-deepseek` (Flash) / `apex-code-deepseek-pro`
(Pro). Parked out of the everyday namespace; un-rename in `$PROFILE` to restore.

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
Coding session (Codex via Claude host; Opus fallback)
  └── Executes specs → docs/changes/done/
  └── Writes handoff → docs/handoff/YYYY-MM-DD.md
        │
        ▼
Planning session (Claude)
  └── Reads handoff, plans next specs
```

---

_Last updated: 2026-06-22 (ADR-027) | Coding: Codex `gpt-5.5` primary (`codex-code`) / Opus fallback (`apex-opus`) | DeepSeek: archived | Planning: Opus 4.8_
