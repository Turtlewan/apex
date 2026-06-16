# Headless / Unattended Claude Code Execution — Research Findings

**Retrieval date:** 2026-06-16  
**Purpose:** Phase-2 research pass for the `remote-autonomous` workspace. Findings only; no verdict.

---

## 1. Non-Interactive / Headless Launch (`-p` / print mode)

[VERIFIED] Source: https://code.claude.com/docs/en/headless

### Core invocation

```bash
claude -p "Find and fix the bug in auth.py" --allowedTools "Read,Edit,Bash"
```

The `-p` / `--print` flag runs Claude non-interactively: sends the prompt, executes the agent loop, prints output, and exits.  All CLI flags work with `-p`.

### Bare mode (recommended for CI)

```bash
claude --bare -p "Summarize this file" --allowedTools "Read"
```

`--bare` skips auto-discovery of hooks, skills, plugins, MCP servers, auto-memory, and CLAUDE.md. Startup is faster and results are reproducible across machines. The docs state: "Note: `--bare` is the recommended mode for scripted and SDK calls, and will become the default for `-p` in a future release."

In bare mode:
- Claude has access to Bash, file-read, and file-edit tools
- OAuth and keychain reads are skipped — auth must come from `ANTHROPIC_API_KEY` or `apiKeyHelper` in a `--settings` JSON
- Any context must be passed explicitly via flags (see table below)

| To load | Flag |
|---------|------|
| System prompt additions | `--append-system-prompt`, `--append-system-prompt-file` |
| Settings | `--settings <file-or-json>` |
| MCP servers | `--mcp-config <file-or-json>` |
| Custom agents | `--agents <json>` |
| Plugin | `--plugin-dir <path>`, `--plugin-url <url>` |

### Key print-mode-only flags

| Flag | Description |
|------|-------------|
| `--output-format text\|json\|stream-json` | Output format; `json` includes `total_cost_usd` and session ID; `stream-json` is newline-delimited for real-time streaming |
| `--max-turns N` | Limit agentic turns; exits with error at limit |
| `--max-budget-usd N` | Stop after spending this much on API calls |
| `--no-session-persistence` | Don't save session to disk |
| `--input-format text\|stream-json` | Format for piped stdin |
| `--json-schema <schema>` | Get validated JSON output matching a JSON Schema (puts result in `structured_output` field) |
| `--include-partial-messages` | Include streaming token events (requires `stream-json`) |
| `--include-hook-events` | Include hook lifecycle events in stream (requires `stream-json`) |
| `--exclude-dynamic-system-prompt-sections` | Move per-machine system-prompt sections into first user message; improves prompt-cache reuse across machines |
| `--init` | Run Setup hooks with `init` matcher before session |
| `--maintenance` | Run Setup hooks with `maintenance` matcher before session |

### Output format example

```bash
# JSON output with cost metadata
claude -p "Summarize this project" --output-format json | jq -r '.result'

# Structured output matching a schema
claude -p "Extract function names from auth.py" \
  --output-format json \
  --json-schema '{"type":"object","properties":{"functions":{"type":"array","items":{"type":"string"}}},"required":["functions"]}'

# Streaming
claude -p "Write a poem" --output-format stream-json --verbose --include-partial-messages
```

### Piping

```bash
cat build-error.txt | claude -p 'explain the root cause' > output.txt
```

Piped stdin is capped at 10 MB (as of v2.1.128). Exceeding the cap exits with an error.

### Continuing / resuming in print mode

```bash
# Capture session ID
session_id=$(claude -p "Start a review" --output-format json | jq -r '.session_id')
# Resume
claude -p "Continue that review" --resume "$session_id"
```

### Background tasks at exit

If Claude starts a background Bash task during a `-p` run (e.g., a dev server), that task is terminated ~5 seconds after Claude returns its final result and stdin closes.

---

## 2. Claude Agent SDK (TypeScript + Python)

[VERIFIED] Source: https://code.claude.com/docs/en/agent-sdk/overview

### Installation

```bash
npm install @anthropic-ai/claude-agent-sdk   # TypeScript; bundles native binary
pip install claude-agent-sdk                  # Python 3.10+
```

Auth: `ANTHROPIC_API_KEY` env var (also supports Bedrock, Vertex AI, Azure Foundry via provider-specific env vars).

### Core pattern

```python
# Python
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions

async def main():
    async for message in query(
        prompt="Find and fix the bug in auth.py",
        options=ClaudeAgentOptions(allowed_tools=["Read", "Edit", "Bash"]),
    ):
        if hasattr(message, "result"):
            print(message.result)

asyncio.run(main())
```

```typescript
// TypeScript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Find and fix the bug in auth.ts",
  options: { allowedTools: ["Read", "Edit", "Bash"] }
})) {
  if ("result" in message) console.log(message.result);
}
```

### Available ClaudeAgentOptions (selected)

| Option (Python / TS) | Description |
|----------------------|-------------|
| `allowed_tools` / `allowedTools` | Pre-approved tools (no permission prompt) |
| `permission_mode` / `permissionMode` | `"default"`, `"acceptEdits"`, `"plan"`, `"auto"`, `"dontAsk"`, `"bypassPermissions"` |
| `can_use_tool` / `canUseTool` | Callback for approval prompts (HITL gate — see §4) |
| `hooks` | SDK-level hooks (PreToolUse, PostToolUse, Stop, SessionStart, SessionEnd, …) |
| `agents` | Custom subagent definitions |
| `mcp_servers` / `mcpServers` | Inline MCP server config |
| `resume` | Resume by session ID |
| `setting_sources` / `settingSources` | Which settings sources to load (`user`, `project`, `local`) |

### Session resume

```python
async for message in query(prompt="...", options=ClaudeAgentOptions()):
    if isinstance(message, SystemMessage) and message.subtype == "init":
        session_id = message.data["session_id"]

async for message in query(
    prompt="Continue...",
    options=ClaudeAgentOptions(resume=session_id)
): ...
```

### SDK vs CLI vs Managed Agents comparison

| | Agent SDK | CLI `-p` | Managed Agents |
|---|---|---|---|
| Runs in | Your process | Your process | Anthropic cloud |
| Interface | Python/TS library | Shell | REST API |
| Filesystem | Local | Local | Managed sandbox |
| Best for | CI/CD, custom apps, production automation | One-off tasks, dev | Long-running, async, no own infra |

---

## 3. Scheduling

[VERIFIED] Source: https://code.claude.com/docs/en/scheduled-tasks  
[VERIFIED] Source: https://code.claude.com/docs/en/routines

### Three scheduling tiers (official comparison table)

| | Cloud Routines | Desktop Scheduled Tasks | `/loop` (in-session) |
|---|---|---|---|
| Runs on | Anthropic cloud | Your machine | Your machine |
| Requires machine on | No | Yes | Yes |
| Requires open session | No | No | Yes |
| Persistent across restarts | Yes | Yes | Restored on `--resume` if < 7 days |
| Access to local files | No (fresh clone) | Yes | Yes |
| MCP servers | Connectors configured per task | Config files + connectors | Inherits from session |
| Permission prompts | No (runs autonomously) | Configurable | Inherits from session |
| Minimum interval | 1 hour | 1 minute | 1 minute |

### A. Cloud Routines

[VERIFIED] https://code.claude.com/docs/en/routines

A Routine is a saved configuration (prompt + repositories + connectors) that runs on Anthropic-managed cloud infrastructure. Three trigger types:

1. **Scheduled** — hourly, daily, weekdays, weekly, or custom cron (minimum 1 hour); or one-off at a future timestamp
2. **API** — HTTP POST to a per-routine endpoint with a bearer token:
   ```bash
   curl -X POST https://api.anthropic.com/v1/claude_code/routines/trig_01.../fire \
     -H "Authorization: Bearer sk-ant-oat01-xxxxx" \
     -H "anthropic-beta: experimental-cc-routine-2026-04-01" \
     -H "anthropic-version: 2023-06-01" \
     -H "Content-Type: application/json" \
     -d '{"text": "Optional run-specific context"}'
   ```
   Returns `{"type":"routine_fire","claude_code_session_id":"...","claude_code_session_url":"..."}`
3. **GitHub event** — pull_request or release events with filters (author, title, labels, is-draft, base/head branch)

**Create from CLI:** `/schedule daily PR review at 9am` (conversational), or via web at claude.ai/code/routines.

**Key behavior:** "Routines execute on Anthropic-managed cloud infrastructure … there is no permission-mode picker and no approval prompts during a run." Repos are cloned fresh on each run; Claude pushes to `claude/`-prefixed branches by default.

**Requires:** claude.ai subscription (Pro/Max/Team/Enterprise); API key auth is NOT supported for Routines.

**Daily run cap:** Routines draw down subscription usage + a per-account daily run allowance. One-off runs are exempt from the cap.

### B. Desktop Scheduled Tasks

[VERIFIED] Reference: https://code.claude.com/docs/en/desktop-scheduled-tasks  
(Full page not fetched in this pass — referenced in the comparison table and scheduling-tasks doc as a separate Desktop-app feature with 1-minute minimum interval and access to local files.)

### C. In-session `/loop` and `CronCreate`

[VERIFIED] https://code.claude.com/docs/en/scheduled-tasks

```
/loop 5m check if the deployment finished
/loop check whether CI passed and address any review comments  # Claude chooses interval
/loop                                                          # Built-in maintenance prompt
remind me at 3pm to push the release branch                    # One-shot natural language
```

Under the hood, Claude uses `CronCreate` / `CronList` / `CronDelete` tools (5-field cron expressions). Up to 50 tasks per session.

**Limitations:**
- Tasks fire only while Claude Code is running and idle
- No catch-up for missed fires
- Recurring tasks expire after 7 days
- Starting a fresh conversation clears tasks (`--resume` restores unexpired ones)

### D. GitHub Actions (schedule trigger)

[VERIFIED] https://code.claude.com/docs/en/github-actions

```yaml
name: Daily Report
on:
  schedule:
    - cron: "0 9 * * *"
jobs:
  report:
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: "Generate a summary of yesterday's commits and open issues"
          claude_args: "--model opus"
```

The `claude_args` parameter passes any Claude Code CLI flags. Common ones: `--max-turns`, `--model`, `--allowedTools`, `--mcp-config`.

---

## 4. Human-in-the-Loop (HITL) in Unattended Runs

### Permission modes

[VERIFIED] Source: https://code.claude.com/docs/en/permission-modes

| Mode | What runs without asking | Best for unattended? |
|------|--------------------------|----------------------|
| `default` | Reads only | No — will pause on writes |
| `acceptEdits` | Reads, file edits, common filesystem cmds (`mkdir`,`touch`,`mv`,`cp`,`sed`) | Partial — non-filesystem Bash still prompts |
| `plan` | Reads only | No |
| `auto` | Everything, with background safety classifier | Yes (with caveats — see below) |
| `dontAsk` | Only pre-approved tools in `permissions.allow` + read-only cmds | Yes for locked-down scripts |
| `bypassPermissions` | Everything | Yes — isolated containers/VMs only |

Set via `--permission-mode <mode>` or `--dangerously-skip-permissions` (equivalent to `bypassPermissions`).

**Auto mode behavior in `-p` runs:** "In non-interactive mode with the `-p` flag, repeated [classifier] blocks abort the session since there is no user to prompt." Auto mode requires Claude Code v2.1.83+, Claude Opus 4.6+ or Sonnet 4.6 on Anthropic API.

**dontAsk:** "auto-denies every tool call that would otherwise prompt. Only actions matching your `permissions.allow` rules and read-only Bash commands can execute." Best for CI with a known tool allowlist.

### `--allowedTools` flag

```bash
claude -p "Run tests and fix failures" \
  --allowedTools "Bash,Read,Edit"

# With pattern matching (trailing space+* = prefix match)
claude -p "Create commit" \
  --allowedTools "Bash(git diff *),Bash(git log *),Bash(git commit *)"
```

### `--permission-prompt-tool` (non-interactive HITL delegation)

[VERIFIED] CLI reference, https://code.claude.com/docs/en/cli-reference

```bash
claude -p --permission-prompt-tool mcp_auth_tool "query"
```

Specify an MCP tool to handle permission prompts in non-interactive mode. The MCP tool receives the prompt and returns allow/deny. This is the supported way to implement external approval workflows (Slack/email approvals, etc.) for unattended runs.

### SDK `canUseTool` callback (programmatic HITL)

[VERIFIED] https://code.claude.com/docs/en/agent-sdk/user-input

```python
async def can_use_tool(tool_name, input_data, context):
    # Route to approval UI, return allow or deny
    if approved:
        return PermissionResultAllow(updated_input=input_data)
    return PermissionResultDeny(message="Denied")

options = ClaudeAgentOptions(can_use_tool=can_use_tool)
```

```typescript
canUseTool: async (toolName, input) => {
  if (approved) return { behavior: "allow", updatedInput: input };
  return { behavior: "deny", message: "Denied" };
}
```

The callback stays pending indefinitely until it returns (or query is cancelled). For long-wait scenarios, return the `defer` hook decision to let the process exit and resume from the persisted session later.

**`AskUserQuestion` tool:** Claude can call this to ask structured multiple-choice questions. Triggered via the same `canUseTool` callback with `toolName === "AskUserQuestion"`. Supports `multiSelect`. Returns `answers` mapping question text to selected label(s).

### Routines: always fully autonomous

[VERIFIED] https://code.claude.com/docs/en/routines

"Routines run autonomously as full Claude Code cloud sessions: there is no permission-mode picker and no approval prompts during a run."

---

## 5. Background / Long-Running Execution

[VERIFIED] Source: https://code.claude.com/docs/en/agent-view  
[VERIFIED] CLI reference: https://code.claude.com/docs/en/cli-reference

### `--bg` flag — background sessions

```bash
claude --bg "investigate the flaky test"
# Returns immediately, prints session ID and management commands
```

A background session keeps running without a terminal attached. A separate supervisor process (`claude daemon`) hosts them. Sessions survive closing the terminal, starting new interactive sessions, and machine sleep (processes resume on wake). Shutdown still stops running sessions.

### Shell management commands

```bash
claude agents              # Open agent view (TUI) for all background sessions
claude agents --json       # Print active sessions as JSON array for scripting
claude agents --json --all # Include completed background sessions
claude logs <id>           # Print recent output from a background session
claude attach <id>         # Attach terminal to a background session
claude stop <id>           # Stop a background session
claude respawn <id>        # Restart a background session with conversation intact
claude rm <id>             # Remove from list (transcript stays on disk)
claude daemon status       # Check supervisor state
claude daemon stop --any   # Stop the supervisor (and sessions it hosts)
```

### Agent view state signals

| State | Means |
|-------|-------|
| Working | Claude actively running tools or generating |
| Needs input | Waiting on a question or permission decision |
| Idle | Ready for next prompt |
| Completed | Task finished successfully |
| Failed | Task ended with error |
| Stopped | Manually stopped |

### `--remote` flag — cloud web sessions

```bash
claude --remote "Fix the login bug"
```

Creates a new cloud session on claude.ai (runs on Anthropic infrastructure, not local machine).

### Remote Control mode

```bash
claude remote-control --name "My Project"   # Server mode: wait for remote connections
claude --remote-control "My Project"         # Interactive session + remote access
```

Connects claude.ai or the Claude mobile app to a local Claude Code session. The local process must keep running. Supports mobile push notifications when Remote Control is active.

### `--exec` + `--bg` — background shell commands

```bash
claude --bg --exec 'pytest -x'
```

Run a shell command as a PTY-backed background job (not a Claude session).

---

## 6. Known Limitations of Headless Runs

[VERIFIED — assembled from the verified sources above]

### Bare mode

- Hooks, skills, plugins, MCP servers, auto-memory, and CLAUDE.md are all skipped
- OAuth/keychain auth is skipped — `ANTHROPIC_API_KEY` required
- Cannot use `claude.ai` subscription login (must use API key)

### Auto mode in `-p`

- Repeated classifier blocks **abort the session** (no user to fall back to)
- Requires Opus 4.6+/Sonnet 4.6 on Anthropic API; only Opus 4.7/4.8 on Bedrock/Vertex/Foundry
- `auto` in `defaultMode` is ignored if set in `.claude/settings.json` or `.claude/settings.local.json` (must be in `~/.claude/settings.json`)

### `/loop` and `CronCreate`

- Session must remain open and idle for tasks to fire
- No catch-up for missed fires
- 7-day expiry on recurring tasks
- Background Bash/Monitor tasks are never restored on session resume

### `--permission-prompt-tool`

- Requires an MCP tool to be configured and reachable
- Only works in non-interactive (`-p`) mode

### Background sessions (`--bg`)

- Supervisor (`claude daemon`) must be running
- Machine shutdown stops running sessions (can be recovered with `claude respawn <id>`)
- Agent view requires an interactive terminal to open (TUI)

### Routines

- Minimum schedule interval: 1 hour (vs 1 minute for local)
- No access to local files (always clones fresh)
- Requires claude.ai subscription login (no API key auth)
- API trigger ships under experimental beta header (`experimental-cc-routine-2026-04-01`) — breaking changes possible
- Per-account daily run cap; excess runs rejected unless usage credits enabled
- GitHub webhook events subject to per-routine and per-account hourly caps during research preview

### Remote Control

- Local process must keep running (not truly serverless)
- Extended network outage (>~10 min) causes session timeout and process exit
- Requires claude.ai subscription (no API key auth)
- One remote session per interactive process (use server mode for multiple)

### Background tasks at exit (in `-p` runs)

- Any background Bash task started during a `-p` run is terminated ~5 seconds after Claude returns its final result

### Stdin cap

- Piped stdin capped at 10 MB in `-p` mode (v2.1.128+)

### Skills / commands in `-p`

- User-invoked skills (`/skill-name`) work in `-p` mode
- Built-in commands that open interactive dialogs (`/config`, `/login`) do NOT work in `-p` mode

---

## Primary Sources Cited

1. https://code.claude.com/docs/en/headless — "Run Claude Code programmatically" (CLI headless/print mode)
2. https://code.claude.com/docs/en/cli-reference — CLI commands and flags reference
3. https://code.claude.com/docs/en/agent-sdk/overview — Agent SDK (TypeScript + Python) overview
4. https://code.claude.com/docs/en/agent-sdk/user-input — Handle approvals and user input (canUseTool, AskUserQuestion)
5. https://code.claude.com/docs/en/permission-modes — Permission modes (default, acceptEdits, plan, auto, dontAsk, bypassPermissions)
6. https://code.claude.com/docs/en/scheduled-tasks — /loop, CronCreate, in-session scheduling
7. https://code.claude.com/docs/en/routines — Cloud Routines (scheduled, API, GitHub triggers)
8. https://code.claude.com/docs/en/github-actions — GitHub Actions integration (schedule trigger)
9. https://code.claude.com/docs/en/agent-view — Background sessions, agent view, daemon/supervisor
10. https://code.claude.com/docs/en/remote-control — Remote Control mode

# primary sources cited: 10
