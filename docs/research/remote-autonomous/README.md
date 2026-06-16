# Research synthesis — scheduled/headless autonomous builds (#4) + access-anywhere (#8)

**Date:** 2026-06-16 (planning session 46)
**Confidence:** HIGH on mechanics/billing (official docs, 7–10 primary sources each); MEDIUM on
feature stability (several pieces are research-preview, fast-moving)
**Re-research after:** 2026-06-30 (AI/LLM tooling, 14-day clock)
**Feeds:** audit gaps #4 + #8 (`agentic-os-video-audit.md`)
**Inputs:** WS-A headless exec · WS-B billing+host · WS-C access layer

## Headline
Both gaps resolve the same way: **the enabling tech now exists natively — neither needs a bespoke
VPS or dashboard build. Both are gated on an always-on host (the Mac Mini), not on writing infra.**
And the DeepSeek backend changes the #4 cost story: a headless *coding* build is billed to DeepSeek
(cheap, separate pool), NOT the Anthropic credit pool — so the billing-split worry applies to
headless *Claude/planning* runs, not to autonomous *coding*.

## Gap #8 — access anywhere: **largely SOLVED by native features**
The video's "Anthropic channels/Telegram" claim is **real** [VERIFIED — code.claude.com/docs/channels,
research preview ~Mar 2026]. The full native roster (WS-C):
- **Remote Control** (`claude remote-control`) — full two-way drive of your *local* session from the
  Claude iOS/Android app + **native push notifications** on completion / when a decision is needed.
- **Channels** — drive a local session from Telegram / Discord / iMessage.
- **Dispatch** — start a task from phone, local Desktop executes.
- **Claude Code on Web** (claude.ai/code + iOS) — cloud-run, no local files.
- **Slack** (@Claude) — start + notify.

**For APEX:** since APEX lives in local git repos (Cursor co-edit), the fit is **Remote
Control / Channels over a local always-on host** — no VPS. This **downgrades #8** from the
deployment-memory assumption ("build a VPS/AWS access layer") to "enable a native feature."
**Available-now quick win:** Remote Control / Channels work on the *current Windows box* today
(v2.1.80+) — phone access to interactive sessions needs no Mac Mini and no build.

## Gap #4 — scheduled/headless autonomous builds: **path exists, host-gated**
**Launch mechanics (WS-A) [VERIFIED]:** `claude -p` (print/headless), `--bare` for CI, the Agent SDK
(`query()`), and `claude --bg` (local supervisor daemon). Guards: `--max-turns`, `--max-budget-usd`.
HITL unattended: `--permission-mode dontAsk` + an explicit `permissions.allow` list is the safe
envelope; **`-p` auto mode aborts the session on a classifier block (no human fallback)** — so
allow-list, not auto, for unattended.

**Native scheduling (WS-A/B):** three tiers —
1. **Cloud Routines** — Anthropic-managed, survives shutdown, subscription-billed, cron (≥1h) / HTTP /
   GitHub triggers. **But: fresh git clone per run (no local state), Claude-only.**
2. **Desktop Scheduled Tasks** — local files, subscription, ≥1min — *but only while the machine is on
   and the Desktop app open.*
3. **`/loop` + CronCreate** — in-session only (session must stay open).

**The decisive constraint (WS-B):** subscription and API-credit pools are **mutually exclusive**; a
truly headless host needs API-key auth (subscription OAuth needs interactive login). **Cloud Routines
cannot run APEX coding** — they're Claude-only on Anthropic infra and won't honour APEX's
`ANTHROPIC_BASE_URL`→DeepSeek swap, and they clone fresh (no local repo state).

**So the real #4 path = headless-local on the Mac Mini:** `claude -p` (or `--bg`) with the DeepSeek
base URL + a *ready spec* + `dontAsk` + allow-list + `--max-budget`, billed to **DeepSeek (cheap,
separate pool)**, surviving because the host is always-on. Borderline approvals + completion alerts
route to the phone via **Remote Control / Channels**. That combination *is* the "go away from the
laptop" build — assembled from native pieces, no VPS, no custom dashboard.

## Recommendation
- **#8:** Adopt native **Remote Control / Channels**. Enable on Windows now for phone access (quick
  win); it becomes the approval/notify channel for #4 later. No build, no VPS. ✅ ready.
- **#4:** **Host-gated, not infra-gated.** Defer the autonomous-coding build until the Mac Mini host is
  live; then a *small* spec wires the headless-local recipe + safety envelope (allow-list, budget cap,
  destructive-command guard already exists, HITL-over-Channels). Cost is a non-issue (DeepSeek pool).
  Do **not** pursue Cloud Routines for coding (Claude-only, no local state, no DeepSeek).
- **Dashboard/observability (video #2):** the button-launcher is solo-discounted; the usable kernel is
  **usage observability** — low priority, bundle with the Mac Mini host work.

## Trade-offs / gaps
- Several features are research-preview (Channels, Routines API trigger under experimental beta) — stable
  enough to plan on, re-verify before building.
- The headless-coding safety envelope is unproven for APEX specifically; first Mac Mini run is its baseline.
- Unattended runs start cold (full context reload each run) — fine for occasional scheduled builds, not
  for high-frequency loops.

## Sources
WS-A `ws-a-headless-exec.md` (10 primary) · WS-B `ws-b-billing-host.md` (7) · WS-C `ws-c-access-layer.md` (7).
Cross-ref: memory `claude-agent-sdk-billing-split`, `project-deployment`.
