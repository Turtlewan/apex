# How the coding experience changes — APEX/Claude Code+DeepSeek → Codex

_Session 60, 2026-06-22. Companion to README.md. Focus: the lived day-to-day of doing a build,
not the infra parity (that's the README + ws files)._

## The one framing that explains everything

**Almost every distinctive thing about APEX's coding mode exists to compensate for DeepSeek being a
*weak, image-blind* executor.** The spec-literalness rules, the surgical-scope lock, the Karpathy
pre-flight, wave review, dual/cross-model review, the recipe-driven verify loop, even the
planning↔coding split itself — these are scaffolding around a junior who can't infer intent and can't
see a screen. Swap in `gpt-5.5` (a strong, vision-capable coder) and the texture flips from
**"carefully choreograph a junior"** to **"collaborate with a capable peer."** Most of the
compensations become *optional*, not mandatory. That is the headline change.

The cost of that flip: you lose DeepSeek's rock-bottom price, you lose (initially) the deterministic
wave orchestration, and you trade a stable workflow for one on a fast-moving platform.

## Before → after, by moment in a build

### 1. Starting a coding session
- **Today:** planning (Opus) writes the spec → you **swap `ANTHROPIC_BASE_URL` to DeepSeek + restart**
  the session → the SessionStart hook detects the backend and flips to CODING mode. Two distinct
  sessions, a hard context boundary, a manual env dance.
- **Codex:** `codex --profile coding` (or just one model for both). No restart, no env swap — a
  profile is a config file, not a process boundary. **Planning and coding can even be the same
  session** since one model is competent at both. The whole 3-mode engine (ADR-024/025) stops being
  something you operate.

### 2. The coder's competence — the biggest felt difference
- **Today:** specs must be *execution scripts* — every file named, no inference, "state the mechanism
  not the outcome," because DeepSeek can't fill gaps and will drift if asked to explore. You front-load
  all judgment into planning precisely because the coder can't supply any.
- **Codex:** `gpt-5.5` can hold a looser spec, infer intent, explore a codebase, and self-correct. You
  *can* still write tight specs (and should, for AFK runs), but a missing detail isn't fatal. Builds
  feel less like "did I choreograph this perfectly?" and more like "here's the goal, go." Expect fewer
  mid-build forks hitting the fork-routing safety net.

### 3. Letting it run (permissions/approval)
- **Today:** `dontAsk` mode + `permissions.allow`/`deny` lists, with the classifier-SPOF history
  (sessions 54–57) — you had to prove the allowlist was complete or writes silently denied.
- **Codex:** set `sandbox_mode = "workspace-write"` + `approval_policy = "on-request"` (or `never` for
  AFK) and it runs inside an **OS-level sandbox** — stronger isolation than prompt-based gating. Feels
  more like "fence the blast radius, then trust it" than "enumerate every allowed command." Coarser
  (no per-`Bash(...)` patterns), but less brittle.

### 4. Seeing the screen — UI work transforms
- **Today:** the coder is **image-blind**. The whole cheap-mockup loop, figma skill caveats, and the
  ADR-020 "planning approves a view-layer UI fix because the coder can't see the divergence" exist
  because DeepSeek can't look at pixels. UI iteration bounces between you, planning, and the coder.
- **Codex:** **native vision** (`--image`, macOS Appshots, cloud renders the UI back). The coder can
  look at a mockup or a screenshot of its own output and iterate. The image-gate special-case
  **disappears** — UI builds become a normal in-loop activity instead of a choreographed handoff.

### 5. Parallel builds — the one regression (initially)
- **Today:** `apex-build-wave.js` + the Workflow tool fan out code-workers in deterministic waves with
  managed isolation; planning emits a `## Wave plan` the coder executes verbatim.
- **Codex:** native subagents exist (parallel, `max_threads=6`, `max_depth=1`) but there's **no
  deterministic Workflow-tool equivalent** — you'd drive parallelism prompt-style, or rebuild the
  fan-out on the Agents SDK / shell-over-`codex exec`, and **manage worktree isolation yourself**.
  Until that rebuild, parallel multi-wave builds feel clunkier than today. Single-threaded builds are
  unaffected (and faster per-task).

### 6. The verify loop
- **Largely unchanged in shape.** Today: read the stack's Verification Recipe, run it per task, recover
  on failure. Codex runs the same commands via its shell tool — plus `--output-schema` gives
  schema-enforced structured output (a verification win). Wave review / dual review become *optional
  quality boosts* rather than necessary weak-coder backstops.

### 7. AFK / autonomous builds — gets much easier
- **Today:** headless `claude -p` for autonomous coding was effectively **Mac-Mini-gated** (ADR-021 #4),
  and interactive Claude coding starves the planning subscription pool.
- **Codex:** `codex exec` headless with exit codes, **cloud delegation** (hours unattended in an
  isolated env), `@codex` on GitHub, and an official **GitHub Action**. Autonomous/scheduled builds go
  from "blocked on host" to "first-class." This is a genuine capability *gain*, not just parity.

### 8. Cost & scarcity — the feel shifts
- **Today:** coding is dirt-cheap (DeepSeek), but **Opus planning is the scarce resource** (weekly cap).
  You ration planning, spend freely on coding.
- **Codex (ChatGPT plan):** rolling **5-hour message windows** — scarcity becomes "how many turns in
  this window," felt more during bursty interactive work. Or **API-key + budget caps** for predictable
  dollar control on headless runs. Coding is no longer near-free (`gpt-5.4-mini` ≈ 2–4× DeepSeek), but
  planning is no longer rationed (`gpt-5.5` ≈ ⅓ of Opus). Net feel: **smoother, less lopsided.**

### 9. Speed
- DeepSeek runs at max thinking effort by default (slow, deliberate). Codex's **effort dial**
  (none→xhigh) lets you run cheap tasks at low effort (snappy) and reserve high effort for hard ones —
  more responsive control over the latency/quality trade than today's fixed ceiling.

## What stays exactly the same
- The **planning→spec→build→handoff discipline** (it's a workflow, not a backend fact).
- The **docs tree** (status/changes/handoff/ADR) — agent-agnostic.
- The **verify-before-done** habit and surgical-scope *intent* (you'll still want the rule; the coder
  just needs less reminding).
- Your **role**: planning judgment, spec authoring, review sign-off, commit discipline.

## Net read
The coding experience becomes **less ceremonial and more conversational** — a capable, sighted peer you
fence and point at a goal, instead of a blind junior you script every step for. You trade
near-free-but-weak for capable-but-metered, and you give up (until rebuilt) the deterministic parallel
wave engine. For most single-threaded and UI-heavy builds it's a clear quality-of-life upgrade; for
high-fan-out parallel builds it's a temporary step back until the orchestration is rebuilt.
