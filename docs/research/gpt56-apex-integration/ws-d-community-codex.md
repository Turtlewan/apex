# WS-D: Community Codex Research — Skills, AGENTS.md, Plugins, Headless Config, Cross-Tool Orchestration

Retrieval date: 2026-07-10. Method: WebSearch + WebFetch (developers.openai.com, github.com, community.openai.com, and community blogs/gists). Tags: VERIFIED (primary source: OpenAI docs/repos/forum), REPORTED (blog/gist/secondary), UNKNOWN (couldn't confirm).

---

## 1. Skills in practice (`.agents/skills/`)

### Directory structure & format — VERIFIED (developers.openai.com/codex/skills, redirects to learn.chatgpt.com/docs/build-skills)

```
my-skill/
├── SKILL.md          (required — YAML frontmatter: name, description + freeform markdown body)
├── scripts/           (optional)
├── references/         (optional, long-form docs loaded only on demand)
├── assets/            (optional)
└── agents/openai.yaml  (optional — UI metadata + invocation policy)
```

Codex scans `.agents/skills` at multiple scopes, nearest-wins-ish but additive: REPO folder-level (`$CWD/.agents/skills`), REPO parent, REPO root, USER (`$HOME/.agents/skills`), ADMIN (`/etc/codex/skills`), SYSTEM (built-in). It walks from cwd up to repo root.

Progressive disclosure (VERIFIED): at startup Codex loads only `name` + `description` (+ path) for every discoverable skill — official docs say this costs "at most ~2% of context window (~8,000 characters)" across all skills. Full `SKILL.md` body loads only once a skill is selected. This is architecturally identical to Claude Code's SKILL.md model — the same discipline (short description, heavy body) applies directly to our `.agents/skills` layer.

`agents/openai.yaml` optional metadata (VERIFIED):
```yaml
interface:
  display_name: "..."
  short_description: "..."
  icon_small: "./assets/small-logo.svg"
policy:
  allow_implicit_invocation: false   # forces explicit $skill-name only
dependencies:
  tools:
    - type: "mcp"
      value: "serverName"
```
`allow_implicit_invocation: false` is the mechanism for team-shared skills that must never auto-fire on an ambiguous prompt — direct analogue to a Claude skill you'd want gated behind explicit invocation only.

### Headless (`codex exec`) vs interactive — UNKNOWN/REPORTED, resolved by inference

Official docs do **not** explicitly state whether skill discovery/matching in `codex exec` is identical to the TUI. However: (a) multiple community sources describe TUI and `codex exec` as "different interaction models sharing the same underlying core engine and protocol" (REPORTED, codex.danielvaughan.com + developertoolkit.ai), and (b) OpenAI's own skill-eval guide (`developers.openai.com/blog/eval-skills`, VERIFIED) uses `codex exec --json` as the standard harness for testing whether a skill's description triggers correctly — which only makes sense if skill matching is live and inspectable in exec mode. Practical conclusion: skills load and can implicitly trigger under `codex exec`, but there is no official guarantee/doc callout distinguishing exec-mode matching behavior from TUI — worth an empirical check against `gpt-5.6-terra` in our own profile rather than assuming parity.

### Authoring descriptions for reliable implicit matching — VERIFIED + REPORTED (converges across sources)

- Description is the *only* signal used pre-selection — "front-load the key use case and trigger words" so matching survives even if descriptions get truncated/summarized.
- Use the literal words developers say, not abstract categories ("codex matches on these directly").
- One skill = one job; 2-3 concrete use cases; explicit inputs/outputs.
- **Systematic testing methodology (VERIFIED, developers.openai.com/blog/eval-skills)**: build a CSV of 10-20 test prompts, each tagged `should_trigger=true/false`. Negative controls (`should_trigger=false`) are explicitly called out as catching the most common failure mode: **the skill fires too eagerly** (e.g., scaffolds a new project when the user wanted an incremental edit to an existing one). Iterate the description against this CSV before shipping. Use `codex exec --json` to capture the JSONL trace and deterministically check "did the right skill actually get used" via item events, plus `--output-schema` for rubric-graded qualitative checks.
- This is a concrete, reusable pattern we should port: before finalizing any `.agents/skills/*/SKILL.md`, write a small trigger/no-trigger prompt set and run it through `codex exec --json` to verify matching, rather than eyeballing the description.

### Real-world skill categories people build — VERIFIED/REPORTED (github.com/ComposioHQ/awesome-codex-skills, 14.5k★; github.com/openai/skills, 23.4k★/1.6k forks)

Official `openai/skills` catalog structure (now pointing users to `openai/plugins` as the maintained successor):
- `.system/` — auto-installed with latest Codex
- `.curated/` — installable by name via `$skill-installer`
- `.experimental/` — install by folder path or GitHub URL

Community category breakdown (ComposioHQ list, representative of what people actually build):
1. **Development & code tools** — linting, large-codebase migrations/multi-file refactors run in reviewable batches with CI verification, codebase-recon (mines git history for hotspots/bug-magnets/bus-factor before reading code), MCP-server scaffolding.
2. **Productivity/collaboration** — issue triage, meeting-notes-and-actions (transcript → decisions + owner-tagged action items), Notion research synthesis.
3. **Communication/writing** — email drafting, changelog generation, resume tailoring.
4. **Data/analysis** — spreadsheet formulas, competitive/market research, log filtering.
5. **Meta/utilities** — branding/design, skill templates, a `connect` skill wiring Codex to 1000+ apps via Composio.

Notably **absent from the community's top-of-mind categories**: "stack rules" / "verification recipe" skills in the APEX sense (i.e., persistent architectural conventions + a runnable verify loop) are rare in the wild — most public skills are task/workflow automations (do X given Y inputs), not standing convention-enforcement layers. This is a gap our `.agents/skills` layer would be filling relative to the community norm, not replicating it.

### Reported wins/failures — REPORTED

- Ben Burtenshaw (Hugging Face) reported "+6 on HumanEval" combining Codex skills with model fine-tuning (community.openai.com thread) — single anecdote, not a controlled benchmark, tag REPORTED/weak.
- EricGT's workflow observation on the official forum thread: **"Plan (uses Skills) → Execute → Miss → New Skill → Better Next Plan"** — i.e. skills and Plan mode form a feedback loop where execution gaps directly justify new skill creation. This mirrors our own spec→build→handoff loop and is worth explicitly wiring: APEX handoff docs that surface a recurring gap should trigger "should this become a `.agents/skills` entry" as a checklist item.
- Author guidance (openai/skills README + Codex KB blog, converging REPORTED): keep skill folders lean — no README/changelog inside the skill folder itself (that's context bloat); put long-form reference material in `references/` so it's loaded only when actually needed; prefer instructions over bundled scripts unless the task needs deterministic/repeatable execution.

---

## 2. AGENTS.md culture

### Adoption — VERIFIED/REPORTED

AGENTS.md was formalized in August 2025 by OpenAI, Google, Cursor, Factory, and Sourcegraph as a cross-tool standard; by 2026 it's read natively by Claude Code, Codex CLI, Cursor, Aider, Devin, GitHub Copilot, Gemini CLI, Windsurf, Amazon Q. Community figures cited: 60,000+ repos, now stewarded by the Agentic AI Foundation under the Linux Foundation (REPORTED, multiple 2026 blog posts converge on this figure — treat as directionally right, not exact).

### What helps vs. what gets ignored — REPORTED, strong convergence across independent sources

- **Size ceiling**: multiple independent write-ups (aihackers.net, augmentcode.com, betterclaw.io, blakecrosley.com) converge on the same finding — files over ~150-200 lines see diminishing returns; one analysis claims 150+ lines can increase inference cost 20-23% with no performance gain. Agents deprioritize/ignore instructions near the bottom of long files (recency/position bias). **Recommended real-world size: 6-10 rules + 3-5 exact command references, starting at 10-15 lines and growing only in response to observed agent mistakes** — not written speculatively.
- **Command-first > prose**: exact shell invocations beat descriptive paragraphs; "done" criteria should be agent-verifiable (matches our own step→verify spec convention already).
- **Anti-pattern called out directly**: pasting an entire team style guide (naming conventions, review checklists, deployment procedures) into one 200-line AGENTS.md and having the agent ignore most of it — the diagnosed root cause was that it was *documentation*, not *operations* (i.e., not phrased as directives the agent executes/checks).
- **Nesting for monorepos**: nearest AGENTS.md in the directory tree wins; OpenAI's own repo uses 88 AGENTS.md files across subcomponents (VERIFIED-adjacent, cited from OpenAI's own practice per community write-ups).
- **Context/quota interaction (REPORTED, official ChatGPT docs via search snippet)**: OpenAI's own guidance for stretching Codex usage limits explicitly names AGENTS.md size as a lever — "control how much context you inject through AGENTS.md files by nesting them within your repository" and "limit the number of MCP servers... every MCP adds more context to your messages and uses more of your limit."

### Shared vs. separate CLAUDE.md/AGENTS.md — REPORTED, active community practice with real tooling

Because Claude Code reads `CLAUDE.md`/`.claude/skills/` and most everything else (Codex, Cursor, Copilot, OpenCode) reads `AGENTS.md`/`.agents/skills/`, drift is a known pain point. Two converging patterns:
1. **Symlink, single source of truth**: `ln -sf AGENTS.md CLAUDE.md` (or centralize in one `.agents/` folder and symlink tool-specific paths to it) — "no duplication, consistent behavior," edits reflect everywhere instantly.
2. **Dedicated sync tools exist**: `agentlink` (github.com/snapsynapse/agentlink — "pick a source, symlink the rest, no codegen"), `claude-md-symlinker`. A referenced gist (yurukusa) specifically debunks the claim that "Claude Code reads AGENTS.md as a fallback" — it does not; only explicit symlink/import patterns work.
3. Some teams instead keep genuinely separate files and manually keep them in sync ("keep this file synced with an AGENTS.md file to maintain compatibility" — HN #45787397), but this is described as more error-prone than symlinking.

**Relevance to our design**: since APEX already maintains a two-file culture (project `CLAUDE.md` for Claude planning/coding, and we're now adding a Codex-facing `AGENTS.md` + `.agents/skills`), the community's dominant answer is *don't hand-duplicate content* — either symlink where the content is truly identical, or keep them deliberately different or point one at the other with an explicit "see AGENTS.md for coder-facing rules" pointer. Given APEX's CLAUDE.md is planning-mode-oriented (backend routing, autonomy model, spec authoring rules) and the Codex-facing layer is coding-execution-oriented (dispatch prompts, verification), a **full symlink is probably wrong for us** — content differs by audience — but a thin **cross-reference stub** ("Codex agents: see AGENTS.md § dispatch contract") in CLAUDE.md, and vice versa, follows the community's "single source of truth per fact" norm without conflating the two audiences.

---

## 3. Plugins & marketplaces (Codex 0.143+)

### Official marketplace — VERIFIED (developers.openai.com/codex/plugins → learn.chatgpt.com/docs/plugins)

A plugin bundles: **skills** (reusable instructions), **apps** (MCP-backed connections — GitHub, Slack, Gmail, Drive), **MCP servers**, browser extensions, **hooks** (lifecycle commands), and scheduled-task templates. The plugin directory has tabs for OpenAI-built, workspace-provided, and personal marketplace entries. Example official plugins: Codex Security (code scanning), Gmail/Drive/Slack.

Execution surfaces confirmed: ChatGPT web, ChatGPT desktop app, Codex CLI, IDE extension; CLI supports `/plugins` for browse/install. **The docs do not confirm plugin execution inside headless `codex exec`** — everything described (browsing, `/plugins` slash command) is TUI/interactive-surface language. Treat plugins as **UI/interactive-first, unconfirmed for headless** — UNKNOWN whether a plugin's hooks/skills still apply when dispatched via `codex exec` rather than the CLI's interactive shell.

### Community marketplaces — VERIFIED/REPORTED

- `github.com/hashgraph-online/awesome-codex-plugins` — self-styled "#1 Codex Marketplace," live registry at hol.org/registry/plugins.
- `codex-marketplace.com` — independent community marketplace site with its own docs.
- Self-serve publishing to the *official* OpenAI plugin directory was still "coming soon" as of ~May 2026 per OpenAI's own docs (REPORTED via community.openai.com thread) — third-party plugins currently distribute via their own GitHub repos, indexed (not hosted) by marketplaces; authors keep control of code/releases.
- `github.com/openai/codex/discussions/16329` ("Awesome Codex CLI") catalogs 150+ ecosystem tools across ~20 categories: 136+ subagent collections, 38+ skill packs, plugin directories/frameworks, MCP servers (Codex-as-client and Codex-as-server), cross-agent bridges (Codex ↔ Claude Code ↔ Gemini CLI), IDE integrations, model-provider adapters (LiteLLM/Ollama/LM Studio/OpenRouter), CI/CD `codex exec` recipes, GUI apps, session management/monitoring, Docker, auth tooling. Notable named tools: `tailtest` (8-language testing via Codex Stop hooks), `vara-skills` (21-skill pack for Rust smart contracts), `agent-manual` (cross-references hooks/configs across 17 agent tools).

### The Claude-Code↔Codex cross-review plugin — REPORTED (mindstudio.ai writeup)

An official OpenAI-released MCP server (`@openai/codex-mcp-server`) that plugs into Claude Code so Claude can **hand code to Codex for independent review** without leaving the Claude Code session — explicitly framed as countering single-model self-review sycophancy (a model tends to validate output resembling its own reasoning patterns; cross-provider review catches what same-provider review misses because "biases don't overlap"). Setup: npm install, export an OpenAI API key, register under `mcpServers` in `~/.claude/config.json`. Requires paid access to both Anthropic and OpenAI APIs; costs scale with token usage. **The writeup does not address headless/non-interactive Codex execution** — it's framed entirely around terminal-native, human-in-the-loop Claude Code sessions, i.e., this is the *reverse* of our shape (Codex reviews Claude's writing) rather than our shape (Claude orchestrates, Codex writes).

---

## 4. Headless (`codex exec`) performance tips

### Confirmed flags/behavior — VERIFIED (developers.openai.com/codex/cli/reference, /codex/noninteractive → learn.chatgpt.com/docs/non-interactive-mode)

- `codex exec` **defaults to `sandbox_mode = "read-only"` and `approval_policy = "never"`** — it does not pause for approval, ever; if you need writes you must explicitly set `--sandbox workspace-write` (or `danger-full-access`).
- `--json` → newline-delimited JSONL event stream (`thread.started`, `turn.started`, `turn.completed`, `turn.failed`, `item.*`, `error`; item types include agent messages, reasoning, command execution, file changes, MCP calls, web search, plan updates) — this is the standard way to parse Codex output programmatically from an orchestrator.
- `--output-schema <path>` forces structured JSON output conforming to a schema — useful for our dispatch layer to get machine-parseable task results back from Codex rather than parsing prose.
- `-o/--output-last-message <path>` writes just the final message to a file.
- Session continuation: `codex exec resume <SESSION_ID>` or `codex exec resume --last` (add `--all` to search sessions from any directory) — for a two-stage pipeline pattern: `codex exec "review for race conditions"` then `codex exec resume --last "fix the race conditions you found"`.
- `--ephemeral` avoids persisting rollout files to disk (useful for throwaway dispatch calls that shouldn't accumulate session state).
- `--ignore-user-config` / `--ignore-rules` / `--skip-git-repo-check` for controlled/sandboxed invocation.
- **Breaking auth change (VERIFIED, multiple sources including thedeepfeed.ai)**: as of v0.36.0, plain `OPENAI_API_KEY` is **no longer** implicitly picked up by `codex exec` — you must set `CODEX_API_KEY` explicitly. This is a known gotcha that broke CI pipelines; worth checking our own dispatch subprocess sets `CODEX_API_KEY` not `OPENAI_API_KEY`.

### config.toml keys people actually set for headless/CI — REPORTED, converges across sources

```toml
approval_policy = "never"          # already codex exec's default, but explicit is safer
sandbox_mode = "workspace-write"   # read-only is the exec default; must opt into writes
model_reasoning_effort = "low"     # for mechanical/plumbing subtasks
# model_reasoning_effort = "high"/"xhigh" for planning/architecture/debugging tasks

[sandbox_workspace_write]
network_access = true              # off by default even under workspace-write; opt in per task
```
Community-reported effort-tuning heuristic (converges across sources): **low/minimal for subagents given clearly-specified tasks** (the orchestrator already did the hard thinking), **medium as interactive default**, **high for planning/architecture/debugging**. Named anti-pattern: `approval_policy = "never"` + `sandbox_mode = "read-only"` together silently prevents any edits from landing — a config combo that "looks headless-ready" but actually blocks all writes.

Profiles: named config layers, invoked with `--profile <name>`; Codex loads `~/.codex/config.toml` then overlays `~/.codex/<profile>.config.toml` — this is exactly the `-p <profile>` mechanism our own dispatch (`codex exec -p <profile> -m gpt-5.6-terra`) already uses, confirming it's the standard community pattern for per-task-type config (not something we invented in isolation).

### Subagents (native Codex feature, distinct from our external orchestration) — VERIFIED (learn.chatgpt.com/docs/agent-configuration/subagents)

Codex has its own **native** subagent system (parent Codex session spawns child Codex threads, `agents.max_threads` default 6, `agents.max_depth` default 1, configs in `~/.codex/agents/*.toml` with `name`/`description`/`developer_instructions`/optional `model`/`model_reasoning_effort`/`sandbox_mode` overrides). The docs explicitly contrast this with **external orchestration** (naming Claude Code dispatching separate processes as the example): native subagents share a session and inherit the parent's sandbox/approval automatically, whereas external dispatch (our shape) requires the orchestrator to instantiate each `codex exec` call and collect results itself — there's no shared session state across separate `codex exec` invocations.

**Directly relevant finding**: the official model-recommendation table for subagent roles names **`gpt-5.6-terra` as the recommended model for the "Exploration" role at `medium` reasoning effort** ("fast, cost-efficient for read-heavy tasks"), with `gpt-5.4` (high) for review/security, `gpt-5.3-codex-spark` (medium) for speed-optimized implementation, and `gpt-5.6` (ultra/max) for deep multi-step reasoning. This is the same model we're already dispatching (`gpt-5.6-terra`) — official guidance frames it as an exploration/read-heavy-task model rather than a deep-reasoning one, which is a useful signal for how we should be splitting task types across effort levels rather than defaulting every dispatch to one effort tier.

### Quota-stretching on ChatGPT-account auth — REPORTED (official ChatGPT pricing/docs snippets)

- Additional credits purchasable without plan upgrade.
- Switch to a smaller/cheaper model variant to make usage limits last longer.
- Trim prompt size — precise instructions, strip unneeded context.
- Shrink AGENTS.md / nest it so less gets injected per call (directly ties to § 2 size guidance).
- Disable/limit MCP servers not needed for the current task — every configured MCP server adds fixed context overhead per message regardless of use.

### Prompt patterns that measurably help (VERIFIED, developers.openai.com/cookbook — Codex Prompting Guide)

- **Batch tool calls**: instruct the model to decide *all* files/resources it will need up front, then issue reads/calls together rather than one-by-one — reduces round-trips substantially for read-heavy exploration tasks.
- **Use the canonical `apply_patch` diff format** for edits — the model is specifically trained on this format and performs measurably better with it than freeform diffs.
- **Semantically precise tool names/args** ("semantic_search" beats generic "search") — reduces tool-selection confusion.
- **Explicit error-handling instructions**: mandate propagate/surface-explicitly over broad catch-alls — stated as a specific failure mode to guard against in generated code.
- **Preamble/phase tracking** (`gpt-5.3-codex`-family specific): structured "commentary" vs "final_answer" phases for long-running task monitoring; when reconstructing multi-turn history, preserving `phase` on prior assistant items is required to avoid quality degradation — relevant if our dispatch layer ever replays/reconstructs prior turns rather than starting fresh each call.

---

## 5. Cross-tool orchestration (Claude-as-orchestrator + Codex-as-coder, our exact shape)

REPORTED across several independent writeups/gists — no single canonical reference, but the pattern is well-established and documented from multiple angles:

- **MCP-based wiring is the dominant mechanism**: Claude Code registers Codex as an MCP tool server (`claude mcp add codex-writer -s user -- codex mcp-server`), letting Claude's orchestration loop call into Codex as a tool rather than shelling out to `codex exec` directly. A parallel pattern registers Gemini CLI similarly as an "auditor" MCP tool. This is a **different mechanism than our `codex exec -p <profile> -m ...` subprocess dispatch** — MCP wiring keeps Codex "inside" Claude's tool-call loop with structured request/response, while subprocess dispatch is closer to fire-and-parse via `--json`/`--output-schema`. Worth noting as an alternative we're deliberately not using, not a gap.
- **Role-separation is the consistent lesson across all these writeups**: one example config mandates "all writing tasks route through Codex-as-writer exclusively, Claude retains direct control over code/CLI/debugging"; another describes Claude Opus for planning, Sonnet for execution, Haiku for admin/log-triage — the shared principle is **strict role boundaries stated as hard rules in the orchestrator's instruction file** (their CLAUDE.md — not a config.toml), not soft preferences. Directly reinforces that our AGENTS.md/dispatch-prompt layer should state Codex's role boundaries as explicit imperative rules, not just describe them.
- **Reported gotchas**: both Codex and Gemini require active subscription-tier auth (not just API credits) in the MCP-wiring pattern; failed review/audit loops need an explicit revision mechanism (`codex-reply` → re-audit) rather than assuming one pass suffices; authentication (`codex --login` etc.) must be completed once, out-of-band, before MCP registration will work.
- **The reverse shape** (Codex/OpenAI reviewing Claude's code via the official cross-review MCP plugin, § 3) is documented mainly as a human-in-the-loop terminal workflow, not proven for headless dispatch — so for our shape (Claude headlessly dispatching `codex exec` as the coder), there isn't a single authoritative "this is exactly your setup, here's what breaks" writeup; the closest analogues are the MCP-wiring gists, which use a different call mechanism than ours.
- Community writeups consistently frame the productivity claim as: **each agent gets its own context window and file scope; the human/orchestrator coordinates from above rather than doing any single agent's job** — validates our existing dispatch-per-task design rather than suggesting a different shape.

---

## Sources

- https://learn.chatgpt.com/docs/build-skills (official Codex skills docs)
- https://learn.chatgpt.com/docs/plugins (official Codex plugins docs)
- https://learn.chatgpt.com/docs/non-interactive-mode (official codex exec docs)
- https://learn.chatgpt.com/docs/agent-configuration/subagents (official Codex subagents docs)
- https://developers.openai.com/codex/cli/reference
- https://developers.openai.com/blog/eval-skills (skill description testing methodology)
- https://developers.openai.com/cookbook/examples/gpt-5/codex_prompting_guide
- https://github.com/openai/skills (official, now points to openai/plugins)
- https://github.com/ComposioHQ/awesome-codex-skills
- https://github.com/hashgraph-online/awesome-codex-plugins
- https://github.com/openai/codex/discussions/16329 (Awesome Codex CLI ecosystem catalog)
- https://community.openai.com/t/skills-for-codex-experimental-support-starting-today/1369367
- https://www.mindstudio.ai/blog/openai-codex-plugin-claude-code-cross-provider-review
- https://gist.github.com/bjornmage/ddd6dc7f4d5e074af1db44964d377427 (Claude+Codex+Gemini orchestrator gist)
- https://www.thedeepfeed.ai/posts/2026-06-10-stop-fighting-codex-cli-approval-prompts/
- https://gist.github.com/yurukusa/d36197848911f025add142abefcde685 (CLAUDE.md/AGENTS.md sync patterns)
- https://github.com/snapsynapse/agentlink
- https://danluu.com/ai-coding/
- Multiple 2026 AGENTS.md best-practice blogs (aihackers.net, augmentcode.com, betterclaw.io, blakecrosley.com, morphllm.com, buildbetter.ai, ssojet.com) — converging, cross-checked findings on size/anti-patterns
