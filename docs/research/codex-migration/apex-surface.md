# APEX → Codex migration — the Claude Code dependency surface (internal half)

_Research-independent inventory: every Claude Code primitive APEX currently depends on. The README
synthesis maps each row to its Codex equivalent / gap / blocker once external research lands._

Captured 2026-06-22 (session 60, planning). Source: live inspection of `~/.claude/` + project tree.

## Key prior finding — CORRECTED (verified live, session 60)
OpenAI Codex CLI **was installed + used ~Apr–May 2026** (`~/.codex/sessions/2026/` holds genuine
`rollout-*.jsonl`; `auth.json` → `auth_mode: chatgpt`, Google SSO; `config.toml` trusts
`~/Projects/orion-assistant`) — **but the binary is no longer invocable**: no `codex` on PATH,
npm-global, Program Files, scoop, or winget. Only stale config/auth/old-sessions remain. Meanwhile a
**different tool now actively writes `~/.codex`** today (`goals_1.sqlite`, `memories/`, ~100 MB
`logs_2.sqlite`, `.personality_migration`, `state_5.sqlite`). So this is **not** "consolidation onto an
already-present agent" — the real first step is a **clean (re)install + PATH + auth confirm + resolve
the directory collision** (or a separate `CODEX_HOME`).

## Projects under APEX management
- `~/apex` — the skills system itself (this repo; pure Markdown).
- `~/artemis` — Python app (uv/pyproject), full APEX docs tree (PROJECT/REQUIREMENTS/ROADMAP/BACKLOG + docs/).
- `~/Projects/`: `claude-cockpit` (has its own hooks — `mode-stamp.js` is wired into global settings),
  `frontend`, `orion-assistant` (already on Codex), `orion-v2`, + 2 scratch dirs.

## The dependency surface — what must be re-platformed

### 1. Skills (the core abstraction) — HIGHEST COUPLING
- **53 `SKILL.md`** + **35 `impl.md`** + `references/*.md` under `~/.claude/skills/apex-*/`.
- Mechanism: **model-invoked**. Claude reads each skill's `description` frontmatter and auto-loads
  the body when relevant (progressive disclosure). The Skill tool is the invocation primitive.
- APEX leans on this for: the planning/coding/debug workflow skills (apex-orchestrate/plan/code/debug),
  ~40 domain skills, the two-tier core/references split (apex-code loads only the *core* of each impl.md).
- **Migration crux:** does Codex have a model-invoked, description-matched, on-demand instruction
  loader? (→ WS-B). If not, this whole abstraction needs a substitute.

### 2. Hooks (the enforcement + routing engine) — HIGHEST COUPLING
Wired in `settings.json` across 5 lifecycle events (~17 scripts; ps1 + js + sh):
- **SessionStart:** `backend-session-start.ps1` ← **THE mode engine** (detects ANTHROPIC_BASE_URL /
  APEX_MODE → planning vs DeepSeek-coding vs Claude-coding; injects routing banner + policy +
  latest handoff). Plus `gsd-check-update.js`, `gsd-session-state.sh`, `claude-cockpit/mode-stamp.js`.
- **PreToolUse Write|Edit:** `backend-pretool-write.ps1` ← **THE write-guard** (gates non-.md writes
  in planning mode; relaxes when APEX_MODE=coding). Plus `gsd-prompt-guard.js`, `gsd-read-guard.js`,
  `gsd-workflow-guard.js`.
- **PreToolUse Bash:** `gsd-validate-commit.sh`, `destructive-command-guard.js` (**hard block** on
  destructive commands — true `deny`).
- **PostToolUse:** `gsd-context-monitor.js`, `gsd-read-injection-scanner.js` (prompt-injection scan),
  `gsd-phase-boundary.sh`.
- **UserPromptSubmit:** `coding-git-status.ps1`.
- **statusLine:** `gsd-statusline.js`.
- **Migration crux:** does Codex have ANY blocking-hook / lifecycle mechanism? (→ WS-B). The
  planning/coding mode split and the destructive-command floor are *enforced by hooks that can block
  or inject* — if Codex has no blocking hooks, the entire mode model needs a different mechanism.
- **Cleanup note:** many `gsd-*` hooks are legacy cruft from the archived GSD system — migration is a
  chance to drop them, not port them.

### 3. settings.json (config) 
`permissions.allow`/`deny` lists, `defaultMode: acceptEdits`, `additionalDirectories`, `model: opus`,
`hooks`, `statusLine`, `enabledPlugins` (MCP), `enableWorkflows`. → Codex `~/.codex/config.toml`
(different model entirely: providers, sandbox, approval policy, profiles) — WS-A.

### 4. Subagents / Agent dispatch
- Agent/Task tool + **9 custom `apex-*` agent files** (`apex-coder`, `code-worker`, `apex-reviewer`,
  `apex-spec-reviewer`, `apex-wave-reviewer`, `apex-security-agent`, `apex-figma-agent`,
  `apex-docs-product-agent`, `apex-docs-technical-agent`) — each a system prompt + tool allowlist.
  (+33 legacy `gsd-*` agents.)
- Used for: parallel wave builds, dispatched domain review, the ADR-015 bounded-return contract.
- **Migration crux:** native subagents / parallel dispatch in Codex? (→ WS-C).

### 5. Workflow tool — `~/.claude/workflows/apex-build-wave.js`
Deterministic wave/pipeline fan-out of code-workers. Claude-Code-specific. → WS-C (scripted-
orchestration substitute: shell driving `codex exec`? SDK?).

### 6. MCP
- Plugins: `playwright`, `context7` (enabledPlugins). + claude.ai connectors (Figma/Canva/Gmail/
  GCal/GDrive) used by some skills.
- Codex supports MCP (client + server) — likely the **cleanest-porting** layer (→ WS-B confirm).

### 7. Memory
- `~/.claude/projects/<proj>/memory/*.md` + `MEMORY.md` index, **auto-injected** each session
  (the ~20 user/feedback/project/reference memories seen this session).
- **Migration crux:** Codex persistent-memory equivalent beyond AGENTS.md? (→ WS-D).

### 8. CLAUDE.md chain
Global `~/.claude/CLAUDE.md` (large — the APEX operating contract) + per-project `CLAUDE.md`,
auto-loaded + merged. → Codex `AGENTS.md` (hierarchy/precedence/size — WS-B).

### 9. ANTHROPIC_BASE_URL backend swap — the dual-backend mechanism
Planning = Anthropic (Opus); coding = DeepSeek (base-URL swap + restart). The entire 3-mode model
(ADR-024/025) + multi-model coding router {Opus 4.8 / Sonnet 4.6 / DeepSeek Flash / Pro} rides this.
- **Migration crux:** can Codex run a two-backend / multi-provider split (incl. DeepSeek + non-OpenAI)
  via `model_providers`? (→ WS-A, WS-D). If a single strong Codex model removes the *need* for
  multi-model routing, large parts of ADR-019/024/025 collapse — a simplification win.

### 10. Permission modes
`acceptEdits` (default), `dontAsk` (coding builds — SPOF work, sessions 54–57), `plan`,
`bypassPermissions` (disabled). → Codex sandbox modes (read-only/workspace-write/danger-full-access)
+ approval policies (untrusted/on-failure/on-request/never) — WS-A. Different model; remap needed.

### 11. Registry files — `~/.claude/registry/`
`domains.md` (keyword→skill routing table), `agents.md`, `skills.md`, `token-config.md`. APEX-internal
Markdown — portable as-is, but their *function* (routing the Skill tool) depends on #1.

### 12. Per-project docs convention
`docs/status.md`, `changes/` + `done/`, `handoff/`, `drafts/`, `technical/adr/`, `technical/architecture/`,
`research/`. Pure Markdown — **fully portable**; independent of the agent. The pipeline *artifacts*
survive a platform change untouched; only the *mechanisms that read/write them* (skills+hooks) move.

## First-cut coupling verdict (pre-research)
- **Portable as-is (Markdown, agent-agnostic):** per-project docs tree, ADRs, registry content,
  CLAUDE.md→AGENTS.md prose, memory *content*.
- **Hard-coupled, needs a Codex mechanism or a rethink:** Skills auto-loading (#1), hooks/enforcement
  (#2), subagent dispatch (#4), Workflow orchestration (#5), the backend-swap mode engine (#9).
- **Likely clean port:** MCP (#6).
- **Possibly *simplified away*:** multi-model routing (#9) if one Codex model suffices.

The README synthesis fills the Codex column + ranks effort + gives the go/no-go recommendation.
