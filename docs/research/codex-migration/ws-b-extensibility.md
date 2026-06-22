# WS-B — Codex Extensibility (vs Claude Code primitives)

Research date: 2026-06-22. Subject: OpenAI Codex (Codex CLI / IDE / cloud, gpt-5-codex). Feeds APEX migration analysis off Claude Code.

**Headline verdict:** Codex is now a *near-complete* superset of Claude Code's extension surface. The two surfaces APEX most depends on — model-invoked **Skills** and **blocking hooks** — both exist in Codex, with the same conceptual model and (for hooks) literally the same event names and JSON contract. The main gaps are nuances (AGENTS.md merge semantics, custom-prompts deprecation), not missing capabilities.

---

## 1. Instruction files — `AGENTS.md` vs `CLAUDE.md`

Source: [Custom instructions with AGENTS.md](https://developers.openai.com/codex/guides/agents-md)

- **Convention:** Plain Markdown, no required schema/front-matter (AGENTS.md is an open standard, released by OpenAI Aug 2025, now under the Linux Foundation's Agentic AI Foundation). Equivalent role to `CLAUDE.md`.
- **Hierarchy (auto-loaded — YES, nested supported):**
  1. **Global** — `~/.codex/AGENTS.md` (Codex home; `AGENTS.override.md` checked first at this level).
  2. **Project** — Codex walks from the **Git root down to the current working directory**, and at *each directory* checks `AGENTS.override.md` → `AGENTS.md` → fallback filenames. So **nested per-directory AGENTS.md DO auto-load**, like Claude Code's directory-walk.
- **Precedence / merge:** Files are **concatenated root→down, joined by blank lines**; files closer to CWD appear later and therefore **override** earlier guidance. Codex reports them in order (global first, repo root second, nearest override last).
- **Override file:** `AGENTS.override.md` at any level beats the sibling `AGENTS.md` — lets you temporarily override without deleting the base.
- **Stop condition:** Codex "stops searching once it reaches your current directory" — it does NOT descend into sibling/child dirs you aren't working in.
- **Size limit:** `project_doc_max_bytes`, **default 32 KiB** combined. Empty files skipped; once combined size hits the cap, no further files added (silent truncation).
- **Customisable fallback names:** `project_doc_fallback_filenames = ["TEAM_GUIDE.md", ".agents.md"]` etc.

**Compared to Claude Code `CLAUDE.md` chain:** Functionally equivalent — global + project-root + nested, with nearest-wins precedence. Differences:
- Claude Code supports `@import` of other files inside CLAUDE.md; AGENTS.md has no documented import directive (you rely on the directory hierarchy instead).
- Codex's 32 KiB hard combined cap is explicit and silent-truncating. APEX's global `~/.claude/CLAUDE.md` is large — **GAP/RISK:** a faithful port of the full CLAUDE.md chain could exceed 32 KiB and be silently truncated. Mitigation: move bulk into Skills (progressive-disclosure) and keep AGENTS.md thin, or raise `project_doc_max_bytes`.
- Claude Code auto-loads CLAUDE.md unconditionally; Codex's project-layer instructions/hooks load only when the `.codex/` layer is **trusted** (trust prompt on first use). AGENTS.md itself is read-only context so this trust gate mainly bites hooks (see §4), not the AGENTS.md text.

---

## 2. Skills — the make-or-break surface

Sources: [Agent Skills](https://developers.openai.com/codex/skills) · [skills.md](https://developers.openai.com/codex/skills.md) · [Customization](https://developers.openai.com/codex/concepts/customization)

**DECISIVE ANSWER: YES.** Codex has a first-class, **model-invoked, description-matched, progressively-disclosed** Skills system — conceptually identical to Claude Code Skills, and it uses the *same* `SKILL.md` filename and the *same* `name` + `description` front-matter contract.

- **Unit:** a directory containing `SKILL.md` (required) plus optional `scripts/`, `references/`, `assets/`, and `agents/openai.yaml`.
  ```
  my-skill/
  ├── SKILL.md            # required: metadata + instructions
  ├── scripts/            # optional executable code
  ├── references/         # optional docs
  ├── assets/             # optional templates
  └── agents/openai.yaml  # optional appearance/policy/deps
  ```
- **Front-matter (minimum):**
  ```md
  ---
  name: skill-name
  description: Explain exactly when this skill should and should not trigger.
  ---
  Skill instructions for Codex to follow.
  ```
  The `description` is the trigger spec — Codex matches the user's task against it to decide whether to load the skill. Same mechanism APEX relies on in Claude Code.
- **Discovery locations (precedence order):**
  | Scope | Path |
  |-------|------|
  | REPO (module) | `$CWD/.agents/skills` |
  | REPO (root) | `$REPO_ROOT/.agents/skills` |
  | USER | `$HOME/.agents/skills` |
  | ADMIN | `/etc/codex/skills` |
  | SYSTEM | built-in (OpenAI-bundled) |
  Symlinked skill folders supported. **NOTE the path is `.agents/skills`, NOT `~/.codex/skills`** — different convention from Claude Code's `~/.claude/skills/`. APEX's `~/.claude/skills/apex-*/SKILL.md` layout maps to `~/.agents/skills/apex-*/SKILL.md`.
- **Progressive disclosure:** Codex initially loads only each skill's **name + description + file path**. Full `SKILL.md` body (and any `scripts/`/`references/`/`assets/`) load only when the skill is selected. Initial skills list capped at **~2% of context window, or 8,000 chars** when window unknown — beyond that Codex shortens/omits descriptions. (Claude Code analog: progressive disclosure with no documented hard char cap on the index; APEX with ~70 skills should watch this 2%/8k budget — see GAP below.)
- **Invocation:**
  - **Implicit (model-invoked):** "Codex can choose a skill when your task matches the skill `description`." This is the auto-invoke APEX depends on.
  - **Explicit:** `/skills` menu or `$skill-name` mention in the prompt.
  - Per-skill opt-out of implicit: `policy.allow_implicit_invocation: false` in `agents/openai.yaml` (explicit `$skill` still works).
- **Config / disabling:** in `~/.codex/config.toml`:
  ```toml
  [[skills.config]]
  path = "/path/to/skill/SKILL.md"
  enabled = false
  ```
- **Optional UI/metadata** (`agents/openai.yaml`): `interface.display_name`, `short_description`, icons, `brand_color`, `default_prompt`; `policy.allow_implicit_invocation`; `dependencies.tools` (e.g. an MCP server the skill needs).

**GAP / migration notes:**
- **2%/8k index budget.** APEX has ~70 skills; their combined name+description metadata must fit ~8k chars (or 2% of the gpt-5-codex window). APEX descriptions are long/verbose — likely over budget, causing Codex to truncate/omit descriptions and degrade auto-invocation. Mitigation: tighten descriptions, or rely more on explicit `$skill` invocation / AGENTS.md routing. This is the single most material Skills risk in the port. (Claude Code does not advertise an equivalent hard cap, so APEX has not had to economise here.)
- **No `impl.md` dual-file convention.** APEX's planning-vs-coding split (`SKILL.md` + `impl.md`, loaded by backend) has no native Codex analog — Codex loads one `SKILL.md` body. The APEX backend-routing design (different file per mode) would have to be re-expressed (e.g. one SKILL.md with conditional sections, or two separate skills).
- **Custom prompts feed in but are deprecated in favour of skills** (see §3).

---

## 3. Custom prompts / slash commands

Sources: [Custom Prompts](https://developers.openai.com/codex/custom-prompts) · [Slash commands in Codex CLI](https://developers.openai.com/codex/cli/slash-commands)

- **Location:** `~/.codex/prompts/*.md` (Markdown files). Invoked as slash commands in both CLI and IDE extension, e.g. `/prompts:draftpr`.
- **Front-matter:** `description:` (shown in command menu), `argument-hint:` (documents params).
- **Argument placeholders:**
  - Positional `$1`…`$9` (space-separated args); `$ARGUMENTS` = all.
  - Named uppercase placeholders `$FILE`, `$TICKET_ID`, supplied as `KEY=value` (quote values with spaces).
  - `$$` = literal dollar sign.
  - Example invocation: `/prompts:draftpr FILES="src/pages/index.astro" PR_TITLE="Add hero animation"`.
- **Reload:** restart Codex / open new chat after editing.
- **DEPRECATION:** "Custom prompts are deprecated. Use skills for reusable instructions that Codex can invoke explicitly or implicitly." Skills are the recommended successor (they add implicit invocation + sharing, which prompts lack).

**Compared to Claude Code:** Direct analog of Claude Code's `~/.claude/commands/*.md` slash commands incl. `$ARGUMENTS`. Codex's named `KEY=value` placeholders are slightly richer. **Note for APEX:** since custom prompts are deprecated, port APEX slash-command-style entry points to Skills (which double as both auto-invoked and `$`-invoked), rather than to `~/.codex/prompts/`.

---

## 4. Hooks / lifecycle events

Source: [Hooks](https://developers.openai.com/codex/hooks) · [Advanced Configuration](https://developers.openai.com/codex/config-advanced)

**DECISIVE ANSWER: YES — Codex has a full blocking-hook system, and it mirrors Claude Code's almost 1:1** (same event names, same stdin-JSON / stdout-JSON contract, exit-code-2 blocking). This was added through late-2025/early-2026 (UserPromptSubmit PR #14626 Mar 2026; PreToolUse/PostToolUse ~v0.117.0).

- **Lifecycle events:** `SessionStart`, `SubagentStart`, `PreToolUse`, `PermissionRequest`, `PostToolUse`, `PreCompact`, `PostCompact`, `UserPromptSubmit`, `SubagentStop`, `Stop`. (Superset of the Claude Code set APEX uses, plus subagent + compaction events.)
- **Can hooks BLOCK? YES:**
  - `PreToolUse` → return `"permissionDecision": "deny"` (with reason) **or** exit code `2` + stderr → blocks Bash / `apply_patch` / MCP tool calls.
  - `PermissionRequest` → `"behavior": "deny"` rejects the approval (any deny wins if multiple hooks match).
  - `UserPromptSubmit` → `"decision": "block"` prevents prompt submission.
  - `PostToolUse` → `"decision": "block"` replaces the tool result (side effects already happened).
  - `PreCompact`/`PostCompact` → `"continue": false` stops compaction.
  - `Stop`/`SubagentStop` → `{"decision":"block","reason":"…"}` forces another pass.
- **Context injection (matches APEX's SessionStart-banner / UserPromptSubmit patterns):**
  - Plain stdout text → extra developer context (SessionStart, UserPromptSubmit, SubagentStart).
  - `"systemMessage"` → surfaces as a UI warning.
  - `"hookSpecificOutput": { "additionalContext": "…" }` → model-visible guidance.
  - PreToolUse only: `"permissionDecision":"allow"` + `"updatedInput"` → **rewrite the tool command** before it runs.
- **Config — `config.toml` inline (`[[hooks.EVENT]]`):**
  ```toml
  [[hooks.PreToolUse]]
  matcher = "^Bash$"

  [[hooks.PreToolUse.hooks]]
  type = "command"
  command = '/usr/bin/python3 "script.py"'
  timeout = 30
  statusMessage = "Checking Bash command"
  ```
  **Or `hooks.json`:**
  ```json
  { "hooks": { "PreToolUse": [ { "matcher": "^Bash$",
    "hooks": [ { "type": "command", "command": "/usr/bin/python3 script.py",
      "statusMessage": "Checking Bash command", "timeout": 30 } ] } ] } }
  ```
- **Hook stdin JSON:** `session_id`, `transcript_path`, `cwd`, `hook_event_name`, `model`, `permission_mode` (`default|acceptEdits|plan|dontAsk|bypassPermissions`), `turn_id`; PreToolUse adds `tool_name`, `tool_use_id`, `tool_input`.
- **Discovery (precedence):** `~/.codex/hooks.json` or `[hooks]` in `~/.codex/config.toml` → `<repo>/.codex/...` → plugin-bundled → managed `requirements.toml`.
- **Trust/security:** Non-managed command hooks require explicit review+trust (recorded against hook hash; changes force re-review). Project-local hooks load **only when the `.codex/` layer is trusted**; user-level hooks are independent of project trust. `/hooks` CLI to inspect/manage; `--dangerously-bypass-hook-trust` for one-off automation. Managed (MDM/enterprise `requirements.toml`) hooks are policy-trusted and cannot be disabled; `allow_managed_hooks_only = true` locks out all others.
- **Timeout:** default **600 s**, configurable per-hook; runs with session `cwd`.

**Compared to Claude Code hooks (APEX's SessionStart router + PreToolUse write-guard):**
- **Direct equivalents exist** for both APEX hooks: APEX's SessionStart banner/router → Codex `SessionStart` (stdout context); APEX's PreToolUse write-guard that *blocks/approves* `.md`-vs-source edits → Codex `PreToolUse` with `permissionDecision: deny|allow` + matcher on `apply_patch`.
- **Slight gaps:** Claude Code's PreToolUse matcher keys on Claude tool names; Codex matches on its own tool set (`Bash`, `apply_patch`, MCP names) — APEX's path-based write-guard logic (distinguish `.md` from source, exempt `~/.claude/`) must be re-implemented inside the hook script using `tool_input` (the `apply_patch` payload), not via the matcher alone. Workable, but it's a rewrite of the guard's matching logic.
- The **trust gate** means a project-local hook won't silently run on first clone — first session prompts to trust. APEX's self-hosting auto-exempt behaviour would need the hook + trust pre-arranged.

---

## 5. MCP

Sources: [Model Context Protocol](https://developers.openai.com/codex/mcp) · [Configuration Reference](https://developers.openai.com/codex/config-reference) · [App Server](https://developers.openai.com/codex/app-server)

**Both directions confirmed.**

### (a) Codex as MCP CLIENT — YES
Config in `config.toml` (`~/.codex/config.toml` global, or project `.codex/config.toml` in trusted projects). Manage via `codex mcp` CLI (add/login/manage).
- **stdio server:**
  ```toml
  [mcp_servers.example]
  command = "npx"
  args = ["-y", "@package/mcp"]
  env_vars = ["TOKEN_NAME"]
  cwd = "/optional/path"
  ```
  Fields: `command`, `args`, `env`, `env_vars`, `cwd`, `experimental_environment`.
- **Streamable HTTP / remote server:**
  ```toml
  [mcp_servers.example]
  url = "https://example.com/mcp"
  bearer_token_env_var = "AUTH_TOKEN"
  http_headers = { "X-Custom" = "value" }
  ```
  Fields: `url`, `bearer_token_env_var`, `http_headers`, `env_http_headers`.
- **Common options (both):** `startup_timeout_sec`, `tool_timeout_sec`, `enabled`, `required`, `enabled_tools`, `disabled_tools`, `default_tools_approval_mode` (`auto|prompt|approve`), per-tool `tools.<tool>.approval_mode`.
- **Known historical bug:** GitHub issues #3441 / #9676 — MCP servers defined in config.toml occasionally not detected after some updates. Worth verifying on the installed version.

### (b) Codex as MCP SERVER — YES
Codex can run itself as an MCP server over **stdio** so other tools/agents can drive it. Transport is newline-delimited JSON (JSONL); it inherits global config overrides and exits when the downstream client disconnects. Useful for embedding Codex inside another agent. (Exact subcommand is the `codex mcp`-family server mode; confirm the precise flag on the installed CLI version — docs describe the capability rather than pinning one stable command string. There is also an **App Server** interface for richer programmatic embedding.)

**Compared to Claude Code:** Parity. Claude Code is both an MCP client (servers in settings.json) and exposes `claude mcp serve`; Codex matches both roles. Config format differs (TOML `[mcp_servers.*]` vs Claude's JSON), so APEX's MCP server list ports with a syntax translation, not a capability loss.

---

## Migration summary table (Claude Code primitive → Codex)

| Claude Code primitive | Codex equivalent | Status |
|---|---|---|
| `CLAUDE.md` global+project+nested chain | `AGENTS.md` global+project+nested (root→down, nearest-wins) | ✅ parity; ⚠️ 32 KiB combined cap (silent truncation); no `@import` |
| Skills (`SKILL.md`, model-invoked by `description`, progressive disclosure) | Agent Skills (`SKILL.md`, same `name`/`description`, implicit invocation, progressive disclosure) | ✅ strong parity; ⚠️ ~8k-char/2% skills-index budget; path is `.agents/skills`; no `impl.md` dual-file |
| Slash commands `~/.claude/commands/*.md` + `$ARGUMENTS` | `~/.codex/prompts/*.md` + `$1..$9`/`$ARGUMENTS`/`KEY=value` | ✅ parity but **DEPRECATED** — migrate to Skills |
| Hooks (SessionStart, UserPromptSubmit, PreToolUse… blocking + context-inject) | Hooks — same event names + more (subagent/compact), `permissionDecision: deny`, exit-2 block, stdout/`additionalContext` inject | ✅ near-1:1 parity; ⚠️ matcher keys on Codex tool set; project hooks gated by `.codex/` trust |
| MCP client (settings.json) | `[mcp_servers.*]` in config.toml (stdio + HTTP) | ✅ parity (TOML syntax) |
| MCP server (`claude mcp serve`) | Codex-as-MCP-server over stdio (JSONL) + App Server | ✅ parity |

**Bottom line for the migration:** No make-or-break primitive is missing. The real porting work is (1) fitting APEX's verbose skill descriptions into Codex's ~8k skills-index budget, (2) collapsing the SKILL.md/impl.md backend-split into Codex's single-body skills + AGENTS.md, (3) re-expressing the PreToolUse write-guard's path logic against `apply_patch` tool_input, and (4) keeping the AGENTS.md chain under 32 KiB. All are mechanical, not blocking.
