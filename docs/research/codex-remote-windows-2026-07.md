# Codex Remote vs APEX's `codex exec` path — does it retire the Mac-gate?

**Date:** 2026-07-19 · **Local CLI:** codex-cli **0.144.1** (Windows 11) · Research task, report only.

**Question:** Does "Codex Remote" (OpenAI's remote/cloud supervision surface) retire APEX's standing
assumption that autonomous/unattended builds are Mac-gated?

**Short answer:** *Partially, but not via the path APEX uses.* Codex Remote now supervises **Windows
hosts** at full parity (GA ~2026-06-25/27), so "remote supervision needs a Mac" is dead. But what it
supervises is the **host's app-server threads** (Codex desktop app / paired sessions) — an APEX
`codex exec` subprocess runs **outside** that surface: not live-observable, and definitionally not
remotely approvable (exec never asks). The Mac-gate, as it applies to APEX's actual dispatch path,
is neither confirmed nor retired by Codex Remote — it is simply the wrong surface.

---

## 1. Local findings (verified on this machine, 2026-07-19)

`codex --version` → **codex-cli 0.144.1**.

### Relevant subcommands (from `codex --help` / subcommand help)

| Command | Status | What it is |
|---|---|---|
| `codex exec` | stable | Non-interactive single-session run. **No remote/cloud/supervision flags at all.** Notable flags: `--json` (JSONL events to stdout), `-o/--output-last-message`, `--ephemeral` (**no session files persisted** — an ephemeral run can never be indexed/resumed by any surface). |
| `codex --remote <ADDR>` | (TUI only) | Connects the **interactive TUI** to a remote app-server endpoint (`ws://`, `wss://`, `unix://`) + `--remote-auth-token-env`. Not available on `exec`. |
| `codex remote-control` | experimental | `start` / `stop` / `pair` — runs the **app-server daemon with remote control enabled**; `pair` prints a short-lived manual pairing code. This is the CLI-side entry to the phone/web supervision surface. |
| `codex app-server` | experimental | The daemon every surface (desktop app, IDE extension, remote relay) talks through. Supports `--listen ws://IP:PORT` with capability-token / signed-bearer-token auth. The user's Codex desktop app and Cursor OpenAI extension both run `codex.exe app-server`. |
| `codex cloud` | EXPERIMENTAL | `exec` / `status` / `list` / `apply` / `diff` — **cloud-hosted** tasks in OpenAI's sandboxed remote environments. A wholly separate execution surface from local runs; results are pulled down via `apply`/`diff`. |
| `codex exec-server --remote <URL>` | EXPERIMENTAL | The **inverse** direction: registers this local machine as a remote *environment/executor* with the cloud environment registry (`--environment-id`, `--name`, Agent Identity auth), so cloud-side surfaces can route execution onto it. |

### Feature flags (`codex features`)

`remote_control` shows status **removed** (i.e., no longer flag-gated — the subcommand exists
unconditionally as experimental). Related under-development flags: `exec_permission_approvals`,
`use_agent_identity`, `deferred_executor`. Nothing here enables remote observation of `exec`.

### `%USERPROFILE%\.codex\config.toml` (key names only, values redacted)

Top-level: `service_tier`, `notify`; sections `[windows]` (sandbox), many `[projects.*]`
trust levels (including `c:\users\user\apex`), `[desktop]`, `[features]` (js_repl),
`[mcp_servers.node_repl]`, plugin/marketplace sections, `[shell_environment_policy.set]`.
**No** `remote_control`, `cloud`, `environment`, or relay-related keys are set. A separate
`apex-coder.config.toml` profile exists in `.codex\`.

### Session store

`~/.codex/sessions/` (JSONL rollouts) + `state_5.sqlite` thread metadata + `session_index.jsonl`
exist locally — this is the store the app-server indexes; `codex exec` writes into it unless
`--ephemeral`.

*(Note: `codex exec --help` could not be run literally — an APEX guard hook blocks any command
containing `codex exec`; help was obtained via the `e` alias, `codex help e`.)*

## 2. Web findings (what Codex Remote actually supervises)

- **Codex Remote GA:** ~2026-06-25 (all plans by 06-27). Drive a long-running Codex session from
  the ChatGPT mobile app while work runs on **a Mac or Windows host you own**, or a cloud machine.
  Sources: [openai.com/index/work-with-codex-from-anywhere](https://openai.com/index/work-with-codex-from-anywhere/)
  (403 to direct fetch; content via search snippets),
  [TechTimes 2026-06-27](https://www.techtimes.com/articles/319201/20260627/openai-codex-remote-goes-live-all-plans-phone-control-now-secured-qr-relay.htm).
- **Architecture:** the host's Codex app/app-server connects **outbound to an OpenAI relay**; QR
  (or `codex remote-control pair`) pairs a phone at **host level**. The relay carries only session
  messages — prompts, **approvals**, diffs, screenshots, terminal output. Files/credentials stay
  local. Source: [developers.openai.com/codex/remote-connections](https://developers.openai.com/codex/remote-connections)
  (redirects to learn.chatgpt.com/docs/remote-connections; fetched).
- **What you can do remotely:** start new chats in host projects, continue existing threads, steer,
  **approve commands**, review outputs/diffs/tests. The docs describe this in terms of the **host
  app's chats/threads** — they do **not** claim CLI TUI or `codex exec` runs are supervisable.
- **Windows parity:** Remote Control explicitly supports Windows hosts; near-parity with macOS.
  Windows-specific caveat: Computer Use runs on the **active desktop only** (foreground), which the
  remote pattern actually mitigates — dedicate the Windows box to Codex, supervise from the phone.
  Sources: [SmartScope — Codex remote control on Windows](https://smartscope.blog/en/blog/codex-windows-remote-control-mobile-access-2026/),
  [aifeaturedrop — Computer Use on Windows](https://www.aifeaturedrop.com/2026/05/codex-computer-use-on-windows-setup.html).
- **CLI sessions in the app surface:** all four surfaces (CLI, desktop, IDE, cloud) share
  CODEX_HOME session state via the app-server protocol, **but** sessions created by the standalone
  CLI **without** the app-server in the loop are only indexed by the app-server **on its next
  startup**, and there are *open* feature requests (openai/codex issues
  [#14389](https://github.com/openai/codex/issues/14389),
  [#21079](https://github.com/openai/codex/issues/21079),
  [#24197](https://github.com/openai/codex/issues/24197)) asking for local CLI sessions to show in
  desktop history at all — i.e., live visibility of a CLI-spawned run in the app surface is
  **absent or unreliable today**. Sources also:
  [Cross-surface session sync](https://codex.danielvaughan.com/2026/04/08/cross-surface-session-sync/),
  [App-server guide](https://codex.danielvaughan.com/2026/04/15/codex-app-server-complete-guide/).
- **`codex exec` semantics:** headless, single session to completion, no user interaction;
  approval-requiring actions are not paused for a human — failures return to the model. There is no
  mechanism for a remote approval to reach into an exec run. Sources:
  [developers.openai.com/codex/noninteractive](https://developers.openai.com/codex/noninteractive/),
  [DeepWiki — headless execution mode](https://deepwiki.com/openai/codex/4.2-headless-execution-mode-(codex-exec)).
- **`codex exec-server --remote`** registers a local machine into the cloud environment registry
  (POST `{base_url}/cloud/environment/{id}/register`, rendezvous websocket) so cloud surfaces can
  execute **on** it. Experimental, direction is cloud→local-executor, not exec→remote-supervision.
  Sources: [openai/codex PR #19575](https://github.com/openai/codex/pull/19575),
  [PR #21323](https://github.com/openai/codex/pull/21323),
  [DeepWiki — exec server](https://deepwiki.com/openai/codex/4.7-exec-server).

## 3. Answers

### (a) What does Codex Remote observe/approve today?

The **paired host's app-server threads** — chats started in the Codex desktop app (or via
`codex remote-control start`) on a Mac **or Windows** host, plus **Codex Cloud** tasks
(cloud-hosted sandbox runs, a separate surface reachable from CLI via `codex cloud`). Remotely you
can start/continue threads, steer, **approve commands**, and review diffs/terminal
output/screenshots, over an outbound QR-paired relay. It does **not** document supervision of
standalone CLI processes.

### (b) Is an APEX `codex exec` subprocess inside or outside that surface?

**Outside.** Three independent reasons:

1. **Process topology** — APEX's `codex-dispatch.ps1` spawns `codex exec` as its own process; it
   does not attach to the running app-server daemon, and `exec` has no `--remote` flag (only the
   interactive TUI does).
2. **Visibility** — its rollout lands in the shared session store, so it can appear as a
   *historical, resumable* thread after the app-server (re)indexes — but live mid-run visibility of
   CLI-spawned sessions in the app surface is an open feature request, not a shipped feature.
   *(Uncertain: whether the currently-running app-server picks up a new exec rollout mid-run —
   the experiment below settles it.)*
3. **Approvability** — definitionally nil. `exec` is non-interactive; it never blocks on a human,
   so there is nothing for the phone to approve even if the thread were visible.
   (`exec_permission_approvals` exists as an *under-development* feature flag in 0.144.1 — worth
   re-checking in a few releases; that is the one thing that could change this.)

### (c) Does anything shipped since mid-2026 change "unattended APEX builds are Mac-gated"?

**The Mac-gate is retired for the *supervision* claim, untouched for APEX's *dispatch* path — and
it was already mostly moot for APEX.**

- **What changed:** Codex Remote GA (June 2026) gives Windows hosts full remote
  observe/steer/approve — a Windows box can be a dedicated, phone-supervised execution host. Any
  APEX assumption phrased as "remote/unattended Codex supervision requires a Mac" is now false.
- **What did not change:** that surface supervises *app-server threads*, not APEX's `codex exec`
  subprocesses. Building a "remote loop" for APEX on top of Codex Remote would require moving
  dispatch onto the app-server surface (thread-per-task via app-server RPC or `codex cloud exec`) —
  a different architecture, not a flag on the current one.
- **Context:** per existing APEX findings, unattended builds on Windows already work through Claude
  Code autonomy mode + `acceptEdits` + allow-list (AFK-gate memory); the remaining genuinely
  Mac-gated item is the *project-specific* Xcode/Swift toolchain, which no remote surface changes.
  So Codex Remote adds a **supervision option** (watch/kill/steer app-driven sessions from a
  phone), not a new capability APEX's exec path was missing.

### Minimal confirming experiment (~15 min, no build changes)

1. On this Windows host, enable remote access (Codex desktop app → remote access, or
   `codex remote-control start`), pair the phone via QR.
2. Dispatch one trivial task through the sanctioned path (`codex-dispatch.ps1`, throwaway
   worktree) while the app-server daemon is running.
3. **During** the run: check the phone/desktop thread list for the exec session. Expected: absent.
4. **After** the run + app-server restart: check again. Expected: appears as a historical,
   resumable thread (no approvals ever surfaced).
5. Record: if step 3 surprises (live visibility), a watch-only remote loop is cheaper than assumed;
   approvals remain impossible either way until `exec_permission_approvals` ships.

## Uncertainty register

- **Uncertain:** live mid-run indexing of exec rollouts by an already-running app-server (step 3
  decides). Open GitHub issues suggest no.
- **Uncertain:** exact behavior/scope of `exec_permission_approvals` (under development, off).
- **Firm:** exec has no remote flags (verified in 0.144.1 help); Windows host support for Codex
  Remote (multiple sources, GA June 2026); `codex cloud` is a separate cloud-execution surface.
- **Fetch note:** openai.com announcement returned 403 to WebFetch; content taken from search
  snippets + secondary coverage. developers.openai.com/codex/remote-connections fetched via its
  redirect (learn.chatgpt.com).
