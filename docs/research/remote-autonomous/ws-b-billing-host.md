# Billing & Hosting Reality for Autonomous / Headless Claude Code (2026)

_Phase-2 retrieval — cited findings only. No verdict._

---

## 1. Billing Split: Subscription vs API Credits

### The crux [VERIFIED]

**Source:** https://code.claude.com/docs/en/costs

> "Claude Code charges by API token consumption. For subscription plan pricing (Pro, Max, Team, Enterprise), see claude.com/pricing."

> "The Session block in `/usage` shows API token usage and is **intended for API users**. Claude Max and Pro **subscribers have usage included in their subscription**, so the session cost figure isn't relevant for billing purposes."

**Key distinction — two pools exist:**

| Mode | Auth method | Billing pool |
|------|-------------|--------------|
| Interactive Claude Code (Pro/Max/Team/Enterprise subscriber, signed in via claude.ai OAuth) | OAuth / claude.ai login | Subscription — draws down plan limits, not pay-per-token |
| Agent SDK / headless / `ANTHROPIC_API_KEY` | API key from Console | API credits — pay-as-you-go per token |
| GitHub Actions (direct API path) | `ANTHROPIC_API_KEY` secret | API credits — pay-as-you-go per token |
| Routines (cloud, subscription user) | claude.ai subscription login | Subscription limits + optional metered overage |
| Routines (overage) | Same as above, credits enabled | Metered overage on top of subscription if daily cap hit |

**Agent SDK explicit note [VERIFIED]:**

> "Unless previously approved, Anthropic does not allow third party developers to offer claude.ai login or rate limits for their products, including agents built on the Claude Agent SDK. Please use the API key authentication methods described in this document instead."

Source: https://code.claude.com/docs/en/agent-sdk/overview

This is the hard wall: **the Agent SDK requires an API key and bills against API credits**, not against a subscription. There is no mechanism to route SDK usage through the subscription pool for third-party products.

**Routines (Anthropic's own hosted scheduler) do use the subscription pool [VERIFIED]:**

> "Routines draw down subscription usage the same way interactive sessions do."
> "When a routine hits the daily cap or your subscription usage limit, organizations with **usage credits turned on can keep running routines on metered overage**."

Source: https://code.claude.com/docs/en/routines

So: Routines = subscription-first, metered overage if credits enabled. Agent SDK = API credits only.

**Console workspace note [VERIFIED]:**

> "When you first authenticate Claude Code with your Claude Console account, a workspace called 'Claude Code' is automatically created for you. This workspace provides centralized cost tracking … You **cannot create API keys for this workspace**; it is exclusively for Claude Code authentication and usage."

This means the Console "Claude Code" workspace is for interactive/subscription-authenticated Claude Code only — API key usage for the Agent SDK comes from a separate Console workspace.

---

## 2. Cost Shape of Autonomous Runs

### Benchmark figures [VERIFIED]

Source: https://code.claude.com/docs/en/costs

> "Across enterprise deployments, the average cost is around **$13 per developer per active day** and **$150–250 per developer per month**, with costs remaining below **$30 per active day for 90% of users**."

These figures are for interactive subscription use. For autonomous/API-key runs the same token economics apply but billed at published API rates (claude.com/platform/api — not fetched due to permission denial; rate is [ASSUMED] ~$3–15/MTok for Sonnet-class models as of mid-2026).

### Agent teams multiplier [VERIFIED]

Source: https://code.claude.com/docs/en/costs

> "Agent teams use approximately **7x more tokens** than standard sessions when teammates run in plan mode, because each teammate maintains its own context window."

### What makes recurring autonomous runs expensive [VERIFIED]

Source: https://code.claude.com/docs/en/costs

1. **Context reload on every run** — each session starts cold; CLAUDE.md, skills, and repo context reload from scratch. No cross-run context persistence by default.
2. **Background token usage** — even idle, Claude Code consumes tokens for conversation summarization and command processing ("typically under $0.04 per session").
3. **Extended thinking default** — enabled by default; thinking tokens billed as output tokens, "tens of thousands of tokens per request."
4. **Subagent spawning** — each subagent runs its own full context window.
5. **Runaway loops** — no human to stop; `/loop` and routines have minimum 1-hour intervals as a guardrail. Agent SDK has no built-in loop cap; `--max-turns` must be set explicitly.

### Cost reduction levers [VERIFIED]

Source: https://code.claude.com/docs/en/costs

- Use Sonnet over Opus for subagent/routine tasks.
- Lower extended thinking budget: `MAX_THINKING_TOKENS=8000` or `/effort low`.
- Hooks to preprocess data (e.g., grep logs before Claude reads them).
- Skills to avoid re-exploration of codebase structure each run.
- Set `--max-turns` to cap runaway sessions.
- Workspace spend limits via Console (API path) or `/usage-credits` command (subscription path).

---

## 3. Hosting Options: Running Claude Code Off-Laptop

### Option A: Anthropic Routines (cloud-hosted, subscription) [VERIFIED]

Source: https://code.claude.com/docs/en/routines

- **Infrastructure:** Anthropic-managed cloud. Runs even when laptop is closed.
- **Auth:** claude.ai subscription login (OAuth). No API key needed; uses subscription pool.
- **Billing:** Subscription-first; daily run cap per account; metered overage available.
- **Triggers:** Schedule (min 1 hour), API webhook, GitHub events.
- **File access:** Fresh git clone per run; no access to local laptop files.
- **Setup burden:** Low — create via web UI or `/schedule` CLI command.
- **Availability:** Pro, Max, Team, Enterprise plans. Research preview as of Jun 2026.
- **~/.claude dir:** Cloud environment inherits CLAUDE.md and skills from the cloned repo (`.claude/` committed to git). Local `~/.claude/` on your laptop does **not** transfer to the cloud session.

### Option B: Desktop App Scheduled Tasks (local, subscription) [VERIFIED]

Source: https://code.claude.com/docs/en/desktop-scheduled-tasks

- **Infrastructure:** Runs on your own machine via the Desktop app.
- **Auth:** claude.ai subscription login (same as interactive).
- **Billing:** Subscription pool.
- **Triggers:** Schedule (min 1 minute), manual.
- **File access:** Direct access to local files and tools — no git clone needed.
- **Setup burden:** Low — GUI in Desktop app.
- **Limitation:** Only fires while Desktop app is open and machine is awake. No cloud persistence.

### Option C: GitHub Actions (API credits) [VERIFIED]

Source: https://code.claude.com/docs/en/github-actions

- **Infrastructure:** GitHub-hosted runners (Ubuntu by default). Ephemeral per run.
- **Auth:** `ANTHROPIC_API_KEY` stored as GitHub Secret. API credits, not subscription.
- **Billing:** Pay-per-token API credits + GitHub Actions minutes.
- **Triggers:** Any GitHub event (PR, schedule cron, issue, push).
- **File access:** Repo checkout per run; no persistent local state.
- **Setup burden:** Medium — install Claude GitHub App, add secret, copy workflow YAML.
- **~/.claude dir:** Not present; relies on `.claude/` committed to repo.

### Option D: Agent SDK on a VPS / Cloud VM (API credits) [VERIFIED]

Source: https://code.claude.com/docs/en/agent-sdk/overview

- **Infrastructure:** Any machine you control: VPS (DigitalOcean, Linode, EC2), home server, Mac Mini.
- **Auth:** `ANTHROPIC_API_KEY` environment variable. API credits only — no subscription routing.
- **Billing:** Pay-per-token API credits (Console workspace).
- **File access:** Full access to whatever is on the machine.
- **Setup burden:** High — provision machine, install Node/Python, install `@anthropic-ai/claude-agent-sdk` or `claude-agent-sdk`, manage secrets (dotenv / secrets manager), set up process supervisor (systemd, PM2), handle network, keep `~/.claude/` populated.
- **~/.claude dir:** Must be present on the remote machine. Skills, CLAUDE.md, settings.json must be deployed there manually or via CI.
- **Persistent session:** SDK supports `resume: sessionId` across calls; JSONL session log on local filesystem.

### Option E: Mac Mini as Dev + Prod Target [ASSUMED from memory note]

The project memory (`project-deployment.md`) records: "Mac Mini = dev+prod target." This is Option D but on owned hardware. Same auth model (API key or, if running Desktop app, subscription OAuth). Key difference: local filesystem available, `~/.claude/` native, no cloud provisioning cost.

### Option F: Anthropic Managed Agents (API, Anthropic-hosted sandbox) [VERIFIED]

Source: https://code.claude.com/docs/en/agent-sdk/overview (comparison tab)

> "Managed Agents is a hosted REST API: Anthropic runs the agent and the sandbox … Agent SDK runs the agent loop inside your own process."

- **Infrastructure:** Anthropic-managed sandbox per session.
- **Auth:** REST API with API key.
- **Billing:** API credits (pay-as-you-go).
- **Use case:** Production agents without operating sandbox infrastructure; long-running async sessions.
- **Setup burden:** Low infrastructure burden; REST API integration effort.
- **Status as of Jun 2026:** Documented as an available option; research preview maturity unclear. [COMMUNITY note: this appears to be the evolution of "computer use" hosted environments.]

---

## 4. Auth on a Headless Host

### API key (primary headless path) [VERIFIED]

Source: https://code.claude.com/docs/en/settings

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

Or via `apiKeyHelper` in `settings.json` for dynamic key generation:

```json
{ "apiKeyHelper": "/bin/generate_temp_api_key.sh" }
```

Refresh interval: `CLAUDE_CODE_API_KEY_HELPER_TTL_MS`.

### OAuth / subscription login (NOT suitable for unattended headless) [VERIFIED]

Source: https://code.claude.com/docs/en/settings

OAuth session data stored in `~/.claude.json`. Requires interactive browser login on first auth. Can be forced to Console login: `"forceLoginMethod": "console"`. No documented mechanism for fully non-interactive OAuth flow on a remote box.

**Gotcha [VERIFIED]:** `/schedule` (Routines) requires claude.ai subscription login. If `ANTHROPIC_API_KEY` or `ANTHROPIC_AUTH_TOKEN` is set in the shell, it takes precedence over the claude.ai login and `/schedule` becomes unavailable.

> "You are authenticated with a Console API key or a cloud provider … `/schedule` requires a claude.ai subscription login. If `ANTHROPIC_API_KEY` or `ANTHROPIC_AUTH_TOKEN` is set in your shell … remove it first, since these take precedence over a claude.ai login."

Source: https://code.claude.com/docs/en/routines

So: **API key and subscription login are mutually exclusive in the same shell session.** On a headless server using an API key, Routines and subscription-pool billing are not available.

### Non-interactive flags [VERIFIED]

Source: https://code.claude.com/docs/en/settings

- `-p` flag: non-interactive / print mode (headless).
- `--no-session-persistence` or `persistSession: false` in SDK.
- `CLAUDE_CODE_SKIP_PROMPT_HISTORY`: disable transcript writes.
- `claude doctor`: validate configuration before deployment.

### Third-party providers (enterprise alternative) [VERIFIED]

Source: https://code.claude.com/docs/en/agent-sdk/overview

Amazon Bedrock, Google Vertex AI, Microsoft Azure (Foundry) — all support non-interactive auth via cloud provider credentials (OIDC for GitHub Actions, IAM roles, service accounts). These avoid Anthropic API key management entirely; cost billed through cloud provider.

---

## 5. Summary Table: Host Options Ranked by Setup Burden

| Option | Where runs | Billing pool | Auth | Local files | Setup |
|--------|-----------|--------------|------|-------------|-------|
| Anthropic Routines | Anthropic cloud | Subscription (+overage) | claude.ai OAuth | No (git clone) | Low |
| Desktop Scheduled Tasks | Your machine | Subscription | claude.ai OAuth | Yes | Low |
| GitHub Actions | GitHub runners | API credits | API key | No (checkout) | Medium |
| Managed Agents (Anthropic) | Anthropic sandbox | API credits | API key (REST) | No | Medium |
| Agent SDK on VPS/Mac Mini | Your infra | API credits | API key | Yes | High |

---

## Sources

1. https://code.claude.com/docs/en/costs — token costs, enterprise benchmarks, cost controls [VERIFIED]
2. https://code.claude.com/docs/en/routines — cloud routines billing, triggers, limits [VERIFIED]
3. https://code.claude.com/docs/en/settings — auth methods, headless flags, server deployment [VERIFIED]
4. https://code.claude.com/docs/en/agent-sdk/overview — Agent SDK auth, billing (API credits only), managed agents comparison [VERIFIED]
5. https://code.claude.com/docs/en/github-actions — CI/CD usage, API key auth, cost notes [VERIFIED]
6. https://code.claude.com/docs/en/desktop-scheduled-tasks — local scheduled tasks, subscription billing [VERIFIED]
7. https://code.claude.com/docs/en/overview — surface overview, subscription requirement [VERIFIED]
