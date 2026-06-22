# WS-C — Codex Multi-Agent Orchestration & Automation

_Research date: 2026-06-22. Subject: OpenAI Codex (Codex CLI / cloud / app / IDE, powered by gpt-5-codex / GPT-5.5-class). Migration context: user moving a build system off Claude Code onto Codex._

**Bottom line:** Codex now has a **native subagent / parallel-dispatch mechanism** (added 2025–2026), including **custom agent types** with their own system prompts, model, sandbox, and MCP/tool config — much closer to Claude Code's Task/subagent model than was true a year ago. Where Codex is materially weaker is **deterministic scripted orchestration** (no first-class equivalent of Claude Code's "Workflow" JS fan-out tool — you assemble it yourself via the Agents SDK + `codex mcp-server`, or shell scripts driving `codex exec`). It is roughly at parity or ahead on **headless/programmatic**, **cloud delegation**, and **native scheduling/cron**.

---

## 1. Subagents / parallel agents

**Codex HAS native subagents.** (`developers.openai.com/codex/subagents`)

- **Invocation:** Spawned explicitly via prompt ("spawn one agent per point") — Codex only spawns subagents when explicitly asked. The `/agent` CLI command switches between active threads / inspects ongoing work.
- **Custom agent types:** YES. Defined in TOML under `~/.codex/agents/` (personal) or `.codex/agents/` (project-scoped). Required fields: `name`, `description`, `developer_instructions`. Optional: `nickname_candidates`, `model`, `model_reasoning_effort`, `sandbox_mode`, `mcp_servers`, `skills.config`. Example verbatim:
  ```toml
  name = "reviewer"
  description = "PR reviewer focused on correctness, security, and missing tests."
  developer_instructions = """Review code like an owner. Prioritize correctness, security, behavior regressions, and missing test coverage."""
  ```
  This maps closely to Claude Code custom agent types (own system prompt + tool/MCP allowlist + model).
- **Parallelism:** Codex waits until all requested subagent results are available, then returns a consolidated response. Concurrency capped by `agents.max_threads` (**default 6**). Config schema verbatim:
  ```toml
  [agents]
  max_threads = 6
  max_depth = 1
  job_max_runtime_seconds = 1800
  ```
- **Can a Codex run spawn child Codex agents?** YES — that's exactly the subagent model. BUT **`max_depth` defaults to 1**, preventing deeper nesting. So orchestrator → workers is supported; workers spawning sub-workers is gated/off by default.
- **Orchestration handling:** Codex handles spawning, routing follow-up instructions, waiting for results, and closing agent threads.
- **Surfaces:** App + CLI today. IDE Extension visibility "coming soon."
- **Constraints / GAPs:**
  - Subagents inherit parent sandbox policies.
  - Token consumption exceeds single-agent runs (same caveat as Claude Code).
  - Approval requests can surface from inactive threads.
  - `spawn_agents_on_csv` (batch fan-out over CSV rows) is **experimental**.

**Comparison to Claude Code:** Near-parity on the core capability. Claude Code's Task tool + custom agent definitions (`.claude/agents/*.md` with frontmatter tool allowlists) ↔ Codex `.codex/agents/*.toml`. Both run many in parallel and consolidate. **GAP (minor):** Codex defaults to no nesting (`max_depth = 1`) where Claude Code subagents themselves generally don't spawn further agents either, so this is roughly even. **GAP:** Codex subagents are prompt-triggered conversationally; there is no in-CLI programmatic `spawn` primitive separate from the model deciding to (deterministic spawning requires the SDK route — see §2).
Sources: `developers.openai.com/codex/subagents`; GitHub issue #2604 (Subagent Support); GitHub discussion #3898.

## 2. Deterministic orchestration (vs Claude Code "Workflow" JS tool)

Claude Code's Workflow tool = a JS script that deterministically fans out subagents in waves/pipelines, with no model-in-the-loop deciding whether/when to spawn.

**Codex has NO drop-in equivalent single tool.** The substitute is one of:

**(a) OpenAI Agents SDK + Codex as MCP server** (the OpenAI-recommended deterministic path). (`developers.openai.com/codex/guides/agents-sdk`)
- Launch Codex as a persistent MCP server: `codex mcp-server`. Exposes two tools:
  - `codex` — run a Codex session (accepts params matching the Codex `Config` struct).
  - `codex-reply` — continue a session via `threadId`.
- Drive programmatically from Python:
  ```python
  from agents import Agent, Runner
  from agents.mcp import MCPServerStdio

  async with MCPServerStdio(
      name="Codex CLI",
      params={"command": "codex", "args": ["mcp-server"]},
      client_session_timeout_seconds=360000,
  ) as codex_mcp_server:
      agent = Agent(name="Developer", mcp_servers=[codex_mcp_server])
  ```
  Install: `pip install --upgrade openai openai-agents`.
- Deterministic workflows via **handoffs** and a "Project Manager" gating pattern (verify required files exist before advancing to parallel fan-outs). **Traces capture every prompt, tool call, and handoff for full auditability** — this is the closest analog to a reviewable Workflow run.

**(b) Shell scripts driving `codex exec --json`** (the queue/worker pattern — maintainer-endorsed in discussion #3898):
- Build the queue **externally**; run Codex as a stateless worker with `codex exec --json` (machine-readable JSONL, exits cleanly). Keep Codex out of being the queue manager.
- Maintainer guidance (load-bearing): *"do not let multiple workers edit the same working tree at the same time."* Isolate via **separate git worktrees per task**, branches/sandboxes, or output dirs of patches a supervisor applies sequentially. Use transactional state (SQLite/Redis/RabbitMQ) with leases-with-expiry, not model-edited JSON. MCP is an integration boundary (expose `claim_task`/`finish_task`), **not** an orchestrator — "MCP alone" can't provide locking/retries/conflict resolution.

**GAP:** No native scripted-orchestration primitive that fans out subagents deterministically from inside one CLI invocation. Claude Code's Workflow tool gives deterministic wave/pipeline fan-out as a built-in; Codex makes you build it with the Agents SDK (Python/TS) or external shell+`codex exec`. The Agents SDK route is genuinely powerful (handoffs, tracing, gating) but is **a separate framework + extra deps**, not a one-tool CLI feature. **GAP:** the worktree-isolation / write-conflict management that Claude Code handles internally is the integrator's responsibility in the Codex queue/worker pattern.
Sources: `developers.openai.com/codex/guides/agents-sdk`; GitHub discussion #3898.

## 3. Headless / programmatic — `codex exec`

**Strong, at or above parity.** (`developers.openai.com/codex/noninteractive`; `github.com/openai/codex/blob/main/docs/exec.md`)

- `codex exec "task"` — headless one-shot; streams progress to stderr, prints final answer to stdout, exits. Ideal for CI/cron/scripts (returns an exit code).
- Key flags:
  | Flag | Purpose |
  |------|---------|
  | `--json` | JSONL event stream to stdout |
  | `--output-last-message <path>` / `-o <path>` | write final message to file |
  | `--output-schema <path>` | enforce structured JSON conforming to schema |
  | `--ephemeral` | don't persist session rollout files |
  | `--sandbox <mode>` | `workspace-write` or `danger-full-access` |
  | `--ignore-user-config` | skip `$CODEX_HOME/config.toml` |
  | `--ignore-rules` | bypass user/project execpolicy rules |
  | `--skip-git-repo-check` | override Git-repo requirement |
- JSONL event types: `thread.started`; `turn.started/.completed/.failed`; `item.started/.completed`; `error`. Item types: agent messages, reasoning, command executions, file changes, MCP tool calls, web searches, plan updates.
- Resume: `codex exec resume --last "continue with next steps"`.
- Piping:
  ```bash
  codex exec --json "triage this repository" | jq
  codex exec --output-schema ./schema.json -o ./output.json "Extract metadata"
  npm test 2>&1 | codex exec "summarize failures and suggest fixes"
  cat prompt.txt | codex exec -
  ```
- **SDK:** Yes — the **OpenAI Agents SDK** (Python `openai-agents`, plus a TS/JS counterpart) is the programmatic agent-control layer, used with `codex mcp-server` (see §2). There is also the Codex CLI itself driven via MCP. (Note: this is provider tooling — for Claude-side equivalents you'd consult claude-api/Agent SDK; out of scope here.)

**Comparison to Claude Code:** Codex `exec` ≈ Claude Code headless (`-p`/print mode, `--output-format json/stream-json`, `--resume`). Roughly even; Codex's `--output-schema` (schema-enforced structured output) is a clean win for scripted pipelines. **No GAP here** — this is a strength.
Sources: `developers.openai.com/codex/noninteractive`; CLI reference `developers.openai.com/codex/cli/reference`.

## 4. Codex cloud & delegation

**Strong — a genuine async-delegation product.** (`developers.openai.com/codex/cloud`; `developers.openai.com/codex/integrations/github`)

- **Cloud tasks:** Codex works on tasks in the background, **including in parallel**, in its own isolated cloud environment. Described as an async agent you delegate to: works in an isolated env, **can run for hours unattended**, returns completed code.
- **Delegation methods:**
  - GitHub: tag `@codex` on issues/PRs.
  - IDE extension: kick off a cloud task from the editor, monitor progress, apply resulting diffs locally.
  - Web: submit tasks at chatgpt.com/codex.
- **GitHub code-review bot:**
  - `@codex review` in a PR comment → posts a review like a teammate; in GitHub it flags only **P0/P1** issues to stay focused.
  - `@codex <anything-else>` → starts a cloud task using the PR as context; can push a fix to the branch when permitted.
  - `@codex fix it` → new cloud task that fixes and updates the PR.
  - Honors `AGENTS.md` review guidelines in the repo.
- **Environment config:** users specify repos, setup steps, available tools; internet access controllable per environment.
- **Cross-tool:** `openai/codex-plugin-cc` lets you invoke Codex **from Claude Code** to review/delegate — relevant for a phased migration (run both side by side).

**Comparison to Claude Code:** Codex cloud delegation (async, hours-long, parallel, GitHub-native) is a **strength** — broadly comparable to / arguably ahead of Claude Code's cloud/GitHub agent offerings for fire-and-forget background tasks. **No major GAP**; if anything an advantage for autonomous PR work.
Sources: `developers.openai.com/codex/cloud`; `developers.openai.com/codex/integrations/github`; `developers.openai.com/codex/use-cases/github-code-reviews`; `github.com/openai/codex-plugin-cc`.

## 5. CI & scheduling

**Native GitHub Action + native cron automations both exist.**

**GitHub Action** (`github.com/openai/codex-action`, `openai/codex-action@v1`):
- Installs Codex CLI, configures a secure proxy to the Responses API.
- Key inputs: `prompt` / `prompt-file`; `sandbox` (`workspace-write` default, `read-only`, `danger-full-access`); `safety-strategy` (`drop-sudo`, `unprivileged-user`, `read-only`, `unsafe`); `output-file`; `working-directory`; `model`; `effort`; `allow-users`; `allow-bots`. Output: `final-message`.
- Example verbatim:
  ```yaml
  - name: Run Codex
    id: run_codex
    uses: openai/codex-action@v1
    with:
      openai-api-key: ${{ secrets.OPENAI_API_KEY }}
      prompt: |
        Review the PR changes for bugs or improvements.
  ```
- Constraint: Windows requires `safety-strategy: unsafe`; `drop-sudo` disables later sudo in the job.
- **GAP (minor):** docs only show event-driven triggers (`pull_request`). Cron isn't documented for the Action itself — but standard GitHub Actions `on: schedule:` cron works since you control the workflow file (community pattern; SmartScope guide covers GitHub Actions + cron + CI patterns). So scheduled CI runs are achievable, just not an Action-specific feature.

**Native scheduling — Codex Automations** (`developers.openai.com/codex/app/automations`):
- The Codex Desktop app (macOS 2026-02-02, Windows 2026-03-04) has an **Automations** tab: preset schedules (daily/weekly) **or custom cron syntax**.
- Types: **Standalone** (fresh independent runs across one+ projects, results to "Triage" inbox), **Thread** (heartbeat wake-ups attached to a thread, preserving context), **Project** (run in local project or a dedicated background worktree).
- `codex exec` is the CLI counterpart for single-shot scriptable invocation suitable for cron jobs / GitHub Actions / anything needing an exit code.
- **GAP / limitation:** App automations are **local cron jobs** — the machine must be powered on, Codex running, project on disk. **Not 24/7** unless you keep the app running or use a cloud-hosted alternative. There is an open feature request (issue #25466) for in-session scheduling tools (Cron + ScheduleWakeup) and a `/loop` command, and a `/goal` command exists for multi-hour autonomous runs — but pure CLI/headless cron still relies on OS cron + `codex exec`.

**Comparison to Claude Code:** Comparable. Codex has a first-class GitHub Action and a GUI cron Automations panel; Claude Code has its own scheduling/loop primitives. Roughly even. **Minor GAP:** Codex's *native* scheduler is app-bound (local, machine-on); robust headless scheduling is OS-cron + `codex exec` (same DIY level as Claude Code headless).
Sources: `developers.openai.com/codex/app/automations`; `github.com/openai/codex-action`; GitHub issues #25466, #8317, #26588; SmartScope automation patterns guide.

---

## Migration takeaways (for the build-system port)

1. **Subagents/custom agent types migrate cleanly** — rebuild your `code-worker`/`reviewer` agent definitions as `.codex/agents/*.toml` (own `developer_instructions`, `model`, `sandbox_mode`, `mcp_servers`). Default `max_threads = 6`; raise if your waves are wider.
2. **The deterministic Workflow-style fan-out is the main rebuild.** There is no one-tool equivalent. Choose: (a) OpenAI Agents SDK + `codex mcp-server` for traced, gated, deterministic pipelines (Python/TS, extra deps), or (b) shell scripts over `codex exec --json` with external queue + git-worktree isolation + lease-based state. **This is the biggest gap and the most engineering.**
3. **Headless is a strength** — `codex exec --json` + `--output-schema` + `resume` is solid; `--output-schema` beats free-text parsing.
4. **Cloud delegation + GitHub bot are strengths** — `@codex review/fix it`, async hours-long cloud tasks, parallel.
5. **Scheduling:** GitHub Action + OS cron for headless; app Automations (cron) for GUI, but app-bound (machine must be on) — not a 24/7 server scheduler.

**Net:** Most Claude Code orchestration features have a Codex counterpart. The one feature with a real gap is **deterministic, scripted, model-out-of-the-loop wave orchestration** (Workflow tool) — replaceable but only by adopting the Agents SDK or building an external queue/worker harness yourself.
