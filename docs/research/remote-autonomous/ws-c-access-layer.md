# ws-c: Remote-Access / Messaging Layer for Claude Code

**Topic:** How to drive a Claude Code instance from anywhere — phone, tablet, or third-party chat app — without sitting at the terminal.
**Research date:** 2026-06-16
**Sources:** Fetched directly from `code.claude.com/docs` (official Claude Code documentation) and corroborated by web search.

---

## 1. The "Channels / Telegram" Claim — VERIFIED [VERIFIED]

**Verdict: REAL. The feature exists officially. It is called "Channels."**

Anthropic launched Claude Code **Channels** on approximately March 19–20, 2026 (research preview). It is documented at `code.claude.com/docs/en/channels`.

**What it is:** Channels is a **plugin system** (MCP-server-based) that pushes events into a *running, local* Claude Code session from an external messaging platform. It is two-way: Claude reads the inbound message and replies back through the same channel. Your Claude Code session stays on your machine with full access to your filesystem, MCP tools, git, and project config. The messaging app is just a pipe.

**Supported platforms (as of research preview):**
- **Telegram** — via `@BotFather`-created bot + `/plugin install telegram@claude-plugins-official`
- **Discord** — via Discord Developer Portal bot + `/plugin install discord@claude-plugins-official`
- **iMessage** — macOS only, reads `~/Library/Messages/chat.db` directly via AppleScript, no external token needed

**How it works mechanically:**
1. Install the channel plugin inside a running Claude Code session with `/plugin install <name>@claude-plugins-official`
2. Restart Claude Code with `claude --channels plugin:<name>@claude-plugins-official`
3. Pair your account (send any message to the bot → bot returns a pairing code → `/telegram:access pair <code>` → `/telegram:access policy allowlist`)
4. Claude polls outward — no inbound ports opened on your machine

**Security model:**
- Sender allowlist: only your paired account can push messages
- Plugin allowlist: only Anthropic-approved plugins during research preview
- No inbound connections — the plugin polls outward over HTTPS

**Status:** Research preview as of April 25, 2026. Requires Claude Code v2.1.80+. Requires `claude.ai` or Console API key auth. **Not available on Bedrock, Vertex, or Microsoft Foundry.** Team/Enterprise orgs must enable via admin toggle.

**Source:** `https://code.claude.com/docs/en/channels` [VERIFIED]

---

## 2. Official Remote Surfaces — What Lets You Drive/Check from a Phone

### 2a. Remote Control [VERIFIED]

**URL:** `code.claude.com/docs/en/remote-control`

Connects `claude.ai/code` or the **Claude mobile app (iOS + Android)** to a Claude Code session running on your local machine. The session executes locally — nothing moves to the cloud.

**How to start:**
- `claude remote-control` — server mode, stays running and waits for connections, shows a QR code (press spacebar) for quick phone access
- `claude --remote-control` or `/remote-control` inside a session — interactive mode, local + remote simultaneously
- VS Code: type `/remote-control` in the prompt box

**From a phone:** Open `claude.ai/code` in a mobile browser, or open the Claude iOS/Android app → tap **Code** → find the session by name. Green dot = online.

**What you can do remotely (full drive):** Send messages, use tools, run tasks — full two-way interactive control. File-path `@`-autocomplete works from mobile against your local project. Conversation syncs across all connected devices in real time.

**Push notifications (requires Remote Control active):**
- Claude sends a push to your phone when a long task finishes or when it needs a decision
- You can request a push explicitly: `notify me when the tests finish`
- Setup: install Claude mobile app → same account → allow OS notifications → `/config` → enable "Push when Claude decides" and/or "Push when actions required"
- Requires Claude Code v2.1.110+

**Key limitations:**
- Local process must stay running — closing the terminal ends the session
- One remote session per interactive process (use server mode for concurrent sessions)
- Network outage > ~10 minutes causes session timeout
- Requires `claude.ai` OAuth — API keys not supported
- Team/Enterprise: off by default until admin enables it

**Source:** `https://code.claude.com/docs/en/remote-control` [VERIFIED]

---

### 2b. Claude Code on the Web (claude.ai/code) [VERIFIED]

**URL:** `code.claude.com/docs/en/claude-code-on-the-web`

Runs Claude Code in **Anthropic-managed cloud infrastructure** — not on your local machine. Sessions persist even if you close the browser and can be monitored from the Claude mobile app.

**Phone capability:** You can start a web session from a phone browser at `claude.ai/code`, or from the Claude iOS app. You can kick off a task and check back on it later. The session keeps running in the cloud even if you close the app.

**Difference from Remote Control:** Web sessions run in a cloud sandbox (no local files unless cloned via GitHub). Remote Control runs on your machine.

**Teleport flow:** Start a task on web or iOS app, then pull it into your local terminal with `claude --teleport`. Works in reverse too: start locally, push to web with `--remote`.

**Source:** `https://code.claude.com/docs/en/overview` and `https://code.claude.com/docs/en/claude-code-on-the-web` [VERIFIED]

---

### 2c. Dispatch (Desktop app feature) [VERIFIED]

**URL:** `code.claude.com/docs/en/desktop`

Launched ~March 17, 2026. Dispatch lets you **message a task from your phone** and it spawns a Desktop session on your local machine to handle it. The Claude mobile app sends the task; the Desktop app executes it locally.

**Setup:** Pair the mobile app with the Desktop app via QR code. The Desktop app must be running. Sessions are persistent — Claude retains context across tasks in a thread.

**Phone capability:** Start a task from your phone while your Desktop app is running at home/at your desk. Continuation: start on phone, pick up on desktop, continue in same conversation thread.

**Source:** `https://code.claude.com/docs/en/desktop` [VERIFIED via web search confirming official docs URL]

---

### 2d. Claude Code in Slack [VERIFIED]

**URL:** `code.claude.com/docs/en/slack`

Mention `@Claude` in a Slack channel → Claude detects coding intent → spawns a **Claude Code on the web** session → posts progress updates to the thread → when done, @mentions you with a summary + "View Session" / "Create PR" buttons.

**Phone capability:** You can trigger a run from Slack on your phone. The session runs in the cloud. You get notified in Slack when done. Full session visible in browser.

**Limitation:** Requires GitHub connected. Cloud session only (not your local files). Currently GitHub-only.

**Source:** `https://code.claude.com/docs/en/slack` [VERIFIED]

---

### 2e. Routines (Scheduled Cloud Agents) [VERIFIED]

**URL:** `code.claude.com/docs/en/routines`

Saved Claude Code configurations that run on Anthropic-managed cloud infrastructure on a schedule, via API webhook, or in response to GitHub events.

**Phone capability (indirect):** Not a direct "drive from phone" surface. You can trigger a routine via HTTP POST from anywhere (including a phone automation like iOS Shortcuts), view run results at `claude.ai/code`, and manage routines from the web. Runs keep going when your laptop is closed.

**Source:** `https://code.claude.com/docs/en/routines` [VERIFIED]

---

## 3. Self-Built Access Layer — Community Patterns

### 3a. Channels with your own custom channel [COMMUNITY + VERIFIED partial]

The official Channels system includes a **channels-reference** page describing how to build your own channel plugin — e.g., a webhook receiver for CI, error trackers, or deploy pipelines. During research preview, custom channels require `--dangerously-load-development-channels` to bypass the allowlist. This is an official path, not just a hack.

**Source:** `https://code.claude.com/docs/en/channels#how-channels-compare` and `https://code.claude.com/docs/en/channels-reference` [VERIFIED — documented officially]

### 3b. SSH from mobile [COMMUNITY]

Standard pattern: run Claude Code in a persistent terminal multiplexer (`tmux`/`screen`) on the host machine, SSH in from a mobile SSH client (e.g., Blink Shell on iOS, Termius on Android). No additional setup beyond SSH server access.

No official docs mention this, but it is a widely used community approach. Works with `claude --channels` too.

**Source:** [COMMUNITY — inferred from standard SSH+tmux patterns, not an official Anthropic source]

### 3c. Thin web UI bridge [COMMUNITY]

Projects like OpenClaw (mentioned in web search results as a comparison target for Channels) provide a self-hosted web UI that bridges a Claude Code session. Anthropic's Channels feature largely replaces the need for these since it is now official and built-in.

**Source:** [COMMUNITY — mentioned in community blog posts, e.g., shareuhack.com]

### 3d. ntfy / push notifications on completion [COMMUNITY]

Pattern: add a hook in `~/.claude/settings.json` that fires an `ntfy`-compatible or `pushover` HTTP request when Claude Code's `PostToolUse` or session-end hook fires. The APEX project's own harness has a completion notification hook system for this.

**Source:** [COMMUNITY — inferred from Claude Code hooks system, not a specific official ntfy doc]

---

## 4. Native Push Notification Support [VERIFIED]

Claude Code's **Remote Control** feature includes native mobile push notifications (requires v2.1.110+):

- Claude decides when to push (task complete, decision needed)
- You can request a push explicitly in any prompt
- Works via the Claude iOS and Android apps
- Toggle in `/config`: "Push when Claude decides" and "Push when actions required"
- No per-event configuration beyond these two toggles

This is the **only native push mechanism** documented officially. The APEX schedule skill (`/schedule`) creates Routines but their completion surfaces in the `claude.ai/code` session list — there is no separate push for routine completion documented as of this research date.

**Source:** `https://code.claude.com/docs/en/remote-control#mobile-push-notifications` [VERIFIED]

---

## Feature Comparison Table

| Feature | Trigger from phone? | Claude runs | Full drive or notify? | Requires local process? |
|---------|--------------------|-----------|-----------------------|------------------------|
| **Channels (Telegram/Discord/iMessage)** | Yes — message your bot | Your local machine | Full two-way | Yes (Claude must be running) |
| **Remote Control** | Yes — claude.ai/code or mobile app | Your local machine | Full two-way + push notify | Yes |
| **Dispatch** | Yes — Claude mobile app | Your local Desktop | Full two-way | Yes (Desktop app must be open) |
| **Claude Code on Web** | Yes — claude.ai/code or iOS app | Anthropic cloud | Full two-way | No |
| **Slack (@Claude)** | Yes — Slack mobile | Anthropic cloud | Start task + notify in thread | No |
| **Routines** | Indirect (API trigger via Shortcuts etc.) | Anthropic cloud | Start + check results | No |
| **SSH + tmux** | Yes — any SSH client | Your machine | Full drive | Yes (SSH server) |

---

## Sources

1. `https://code.claude.com/docs/en/channels` — Channels official docs [VERIFIED]
2. `https://code.claude.com/docs/en/remote-control` — Remote Control official docs [VERIFIED]
3. `https://code.claude.com/docs/en/overview` — Claude Code overview with feature table [VERIFIED]
4. `https://code.claude.com/docs/en/claude-code-on-the-web` — Web sessions official docs [VERIFIED]
5. `https://code.claude.com/docs/en/routines` — Routines official docs [VERIFIED]
6. `https://code.claude.com/docs/en/slack` — Slack integration official docs [VERIFIED]
7. `https://code.claude.com/docs/en/desktop` — Desktop app + Dispatch docs [VERIFIED]
8. `https://pub.towardsai.net/claude-code-channels-message-your-ai-coding-agent-from-telegram-and-discord-2026-5f263ccc4b9c` — Third-party article confirming Channels [COMMUNITY, corroborates official]
9. `https://venturebeat.com/orchestration/anthropic-just-shipped-an-openclaw-killer-called-claude-code-channels` — VentureBeat on Channels launch [COMMUNITY, corroborates official]
10. `https://www.builder.io/blog/claude-code-updates` — March 2026 Claude Code update roundup [COMMUNITY]

# primary sources cited: 7 (from code.claude.com official docs)
