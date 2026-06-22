# Migrating APEX (and all projects) from Claude Code → OpenAI Codex

_Research synthesis — session 60, 2026-06-22. Status: **exploration / analysis only** (no decision taken)._

**Inputs:** `apex-surface.md` (internal dependency inventory) + 4 parallel research agents →
`ws-a-cli-core.md`, `ws-b-extensibility.md`, `ws-c-orchestration.md`, `ws-d-models-pricing.md`
(full citations live in those files). Confidence tags carried through from the workstreams.

---

## TL;DR — the verdict

**Technically, the migration is very feasible — there is no make-or-break blocker.** The two
primitives I expected to kill it — model-invoked Skills and blocking hooks — both have near-1:1
equivalents in Codex. Subagents, MCP, headless, and the per-project docs tree all port well.

**The real story isn't porting — it's that Codex makes most of APEX's hardest-won machinery
unnecessary.** APEX's defining architecture is the **dual-backend split** (Anthropic/Opus for
planning + DeepSeek for cheap coding) and the multi-model router (ADR-019/024/025) built on top of
it. That entire apparatus is a *Claude-Code-shaped solution* to two problems Codex solves natively:

- **"Use a cheap model for coding, a strong one for planning"** → Codex gives you one frontier model
  (`gpt-5.5`) + a **reasoning-effort dial** (none→xhigh) + a cheap tier (`gpt-5.4-mini`). The router
  collapses into one model + a dial.
- **"Image work is a hard capability gate"** (DeepSeek is text-only) → **Codex has native vision**.
  The gate disappears entirely.

So the migration's true cost/benefit is **not** "rewrite 53 skills" (mechanical). It's: *are you
willing to delete the dual-backend optimization you spent ~20 sessions building, in exchange for one
simpler model + a dial?* That trade is mostly a **simplification win** — at the price of DeepSeek's
rock-bottom coding cost and (subjectively) Claude's planning quality.

**Recommendation (for exploration): worth a real pilot, not a big-bang.** Port the core workflow
(orchestrate/plan/code + the 2 core hooks + ~5 domain skills) onto **one** project — `orion-assistant`
is already Codex-trusted, or a throwaway repo — run a real build, and compare. Decide full-vs-hybrid
from that. Do **not** convert 53 skills before proving the loop once. (Codex CLI was here Apr–May but
is no longer invocable — a clean reinstall is step zero; see Caveats.)

---

## Parity matrix — every APEX dependency → Codex

| # | Claude Code primitive APEX uses | Codex equivalent | Parity | Migration work |
|---|---|---|---|---|
| 1 | **Skills** (model-invoked, `SKILL.md` `description`-matched, progressive disclosure) | **Agent Skills** — same filename, same `name`+`description` frontmatter, implicit model-invocation, progressive disclosure. Lives in `.agents/skills/` (repo `$CWD/.agents/skills`, `$REPO_ROOT/...`, user `~/.agents/skills`). | 🟢 **Near-1:1** [HIGH] | Move files; **compress descriptions** (see friction #1); collapse `impl.md` (friction #2). |
| 2 | **Hooks** (SessionStart, PreToolUse-deny, PostToolUse, UserPromptSubmit; can block/inject) | **Hooks** — `SessionStart, PreToolUse, PermissionRequest, PostToolUse, PreCompact/PostCompact, UserPromptSubmit, SubagentStart/Stop, Stop`. PreToolUse can `deny` / rewrite input / inject context. Same stdin/stdout-JSON contract. `[[hooks.EVENT]]` in config.toml or `hooks.json`. | 🟢 **Near-1:1** [HIGH] | Rewrite the 2 core hooks' *logic* (mode detection + write-guard); contract is the same. Drop the legacy `gsd-*` hooks. |
| 3 | **settings.json** (permissions, model, hooks, plugins) | `~/.codex/config.toml` (TOML) + **profiles** (`<name>.config.toml`) | 🟡 **Different model** [HIGH] | Re-author config; profiles are *cleaner* than settings layering. |
| 4 | **Subagents** (Agent/Task + 9 custom `apex-*` agent types) | **Subagents** — custom types in TOML (`~/.codex/agents/`, `.codex/agents/`) with `name`/`description`/`developer_instructions` + per-agent `model`/`sandbox`/`mcp_servers`. Parallel fan-out, `max_threads=6`, `max_depth=1`. | 🟢 **Strong** [HIGH] | Translate 9 agent `.md` → TOML. Note depth-1 nesting limit. |
| 5 | **Workflow tool** (`apex-build-wave.js` deterministic wave fan-out) | **No drop-in.** Substitute: OpenAI **Agents SDK** (Py/TS) over `codex mcp-server`, or shell over `codex exec --json`. | 🔴 **Rebuild** [HIGH] | The one genuine rebuild. Worktree isolation becomes *your* job (Codex won't manage write conflicts). |
| 6 | **MCP** (playwright, context7; claude.ai connectors) | MCP client (`[mcp_servers.NAME]`, stdio + HTTP) + Codex-as-MCP-server | 🟢 **Parity** [HIGH] | Re-declare servers in TOML. Cleanest layer. |
| 7 | **Memory** (`memory/*.md` + MEMORY.md auto-injection) | **Memories** (cross-session markdown, beyond AGENTS.md) + AGENTS.md + experimental **Chronicle** | 🟢 **Equivalent+** [HIGH] | Port content. ⚠️ Chronicle/memories are plaintext — privacy FLAG. |
| 8 | **CLAUDE.md chain** (large global + project, auto-merged) | **AGENTS.md** — global `~/.codex/` + project + **nested per-dir auto-load** (nearest-wins), `AGENTS.override.md` | 🟡 **Good, capped** [HIGH] | **32 KiB combined cap** (`project_doc_max_bytes`), silent truncation, no `@import`. Global CLAUDE.md must slim. |
| 9 | **`ANTHROPIC_BASE_URL` dual-backend** (Anthropic planning + DeepSeek coding) | Profiles switch model/provider per session — **but Responses-API-only**; no Anthropic; DeepSeek = 404 without a gateway. | 🔴 **Does not port** [HIGH] | **Architectural rethink** — but mostly *delete*, not port (see below). |
| 10 | **Permission modes** (acceptEdits/dontAsk/plan/bypass) | Sandbox (read-only/workspace-write/danger-full-access) + approval (untrusted/on-failure/on-request/never) | 🟡 **Coarser** [MED] | No `Bash(...)`/path allow-deny lists. **Win:** OS-level sandbox > prompt-based. Remap the dontAsk-build pattern to sandbox+approval. |
| 11 | **Registry** (`domains.md` keyword→skill routing) | n/a — Codex matches on skill `description` directly | 🟢 Portable / partly redundant | Routing is the model's job via descriptions; registry becomes optional. |
| 12 | **Per-project docs tree** (status/changes/handoff/adr/...) | Agent-agnostic Markdown | 🟢 **Fully portable** | Zero work — survives the platform change untouched. |

**Score:** 7 green · 3 yellow · 2 red. The two reds are #5 (Workflow — rebuild) and #9 (dual-backend
— but it *collapses*, see next). No primitive is missing outright.

---

## The three big strategic shifts

### A. The dual-backend architecture collapses — and that's mostly good
APEX's 3-mode engine (planning/DeepSeek-coding/Claude-coding), the `coder_tier` flag, the ADR-024/025
multi-model router, the backend-keyed write-guard — **all of it exists to juggle two providers over the
Anthropic wire.** Codex can't do that (Responses-API-only, no Anthropic, DeepSeek needs a gateway).
But in Codex you **don't need it**: one frontier model + reasoning-effort dial + a cheap mini tier
does the capability/cost routing that the whole apparatus was built for. **Migrating = deleting**
~20 sessions of machinery. Liberating if you want simplicity; painful as sunk cost.

- **What you keep:** the planning↔coding *workflow* split (specs → build → handoff) — that's a
  discipline, not a backend fact. It survives as skills + the docs tree.
- **What you lose:** DeepSeek's price floor (`gpt-5.4-mini` is still ~2–4× DeepSeek V4 [HIGH]) and
  (subjectively) Opus planning quality. Keeping DeepSeek means standing up a LiteLLM/OpenRouter
  Responses gateway — *new* infra APEX doesn't have today.

### B. The image gate disappears
APEX treats "image work" as a hard Claude-only gate (DeepSeek is text-only) — ADR-020, the figma
skill caveats, the cheap-mockup loop. **Codex has native vision** (`--image`, macOS Appshots, cloud
renders UI back). [HIGH] The entire image-routing special-case can be **deleted**, not ported.

### C. Cost model flips from API-metered to plan-windowed
Today: Anthropic Max pool (Opus weekly cap = scarcest resource) + metered DeepSeek API. Codex on a
ChatGPT plan = rolling 5-hour message windows (Plus $20: ~15–80/5h; Pro $100: 5–20×); or API-key at
token rates (`gpt-5.5` $5/$30 in/out ≈ **⅓ of Opus**; `gpt-5.4` ≈ Sonnet; `mini` $0.75/$4.50). [HIGH]
For headless/autonomous builds, **API-key + Platform budget caps give better dollar control** than
plan windows. Net: likely **cheaper than the current Opus-heavy planning**, *more expensive than
DeepSeek coding*.

---

## Migration effort — ranked

**Mechanical / low risk (bulk of the files, little judgment):**
- Port per-project docs trees (#12) — copy, zero change.
- Port MCP server declarations (#6) → TOML.
- Port memory content (#7); CLAUDE.md → AGENTS.md prose (#8, must slim under 32 KiB).
- Translate 9 custom agents (#4) → TOML.

**Real work (judgment + rewrite):**
- **Compress ~70 skill descriptions** under the ~8k-char skills-index budget (friction #1 — *the
  biggest practical risk*; overflow silently degrades auto-invocation). [MED]
- **Collapse 35 `impl.md` into their `SKILL.md`** (Codex has no two-file core/references split). [MED]
- **Rewrite the 2 core hooks** — `backend-session-start.ps1` (mode detection no longer keys off
  `ANTHROPIC_BASE_URL`) + `backend-pretool-write.ps1` (path logic reads Codex's `tool_input`,
  matches `Bash`/`apply_patch`/MCP tools). Logic largely reusable; contract identical. [MED]
- **Re-author config + profiles** (#3) + remap permission modes → sandbox/approval (#10).

**Hard / new infra:**
- **Rebuild the Workflow fan-out** (#5) on the Agents SDK or shell-over-`codex exec`, incl. worktree
  isolation for parallel writers. [HIGH]
- **Only if keeping DeepSeek:** stand up a Responses-API translation gateway (#9). [HIGH]

**Ongoing tax:** Codex's model churn (5.2→5.5 in months, frequent sunsets) — pin model IDs, expect to
chase deprecations. [MED]

---

## Recommended exploration path (not a commitment)

1. **Pilot on one project.** `orion-assistant` (already Codex-trusted) or a throwaway repo. Don't
   touch the 53-skill library yet.
2. **Port the minimum loop:** orchestrate + plan + code skills, the 2 core hooks (rewritten),
   ~5 domain skills, the docs tree. Single model = `gpt-5.5` + effort dial; `mini` for cheap tasks.
3. **Run a real spec end-to-end** (plan → build → handoff) and compare against the current
   DeepSeek/Claude pipeline on: code quality, cost, friction, and how much machinery you got to delete.
4. **Then decide full-vs-hybrid.** Hybrid is genuinely viable — `openai/codex-plugin-cc` lets Claude
   Code invoke Codex, so you could keep Claude for planning/multi-agent and call Codex for coding
   during a transition.

**Open decisions to resolve before any build** (logged to status.md Open Questions): full replacement
vs hybrid; all-in-OpenAI vs keep-DeepSeek-via-gateway; whether the Workflow rebuild is worth it or
parallel coding gets dropped. All are *post-pilot* calls — the pilot informs them.

---

## Caveats on this research
- Codex's surface is moving **fast** (skills, subagents, hooks all added late-2025/early-2026); some
  [MED] facts may shift within weeks — re-verify at build time.
- No hands-on validation yet — this is doc-grounded. The pilot *is* the validation.
- **Install-state correction (verified live, session 60):** Codex CLI was installed and used ~Apr–May
  2026 (`~/.codex/sessions/2026/` has genuine `rollout-*.jsonl`) but is **no longer invocable** — no
  `codex` binary on PATH, npm-global, Program Files, scoop, or winget. Only stale config/auth remain,
  and a *different* tool now actively writes `~/.codex` (`goals_1.sqlite`, `memories/`, 100 MB
  `logs_2.sqlite`, `.personality_migration`). **Real first step = clean (re)install + PATH + auth
  confirm + resolve the dir collision** (or point Codex at a separate `CODEX_HOME`).
