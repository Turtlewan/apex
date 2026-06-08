# Agent2: Context Passing & State Management in Multi-Agent Systems

**Research question:** What are first-party best practices for passing context to subagents and managing state across long multi-agent runs — and what does APEX's "everything by value through the prompt" rule potentially miss?

**Date:** 2026-06-08
**Researcher:** agent2 (Claude Sonnet 4.6)

---

## Summary

Anthropic's first-party guidance — primarily from the "How we built our multi-agent research system" engineering post and the "Effective context engineering for AI agents" article — is strongly consistent with APEX's by-value approach, but adds two layers APEX does not currently cover: (1) a structured **four-part subagent task contract** for task delegation clarity, and (2) a **file-based artifact/pointer pattern** where subagents write durable outputs to disk and return lightweight references rather than returning full content in the prompt. APEX's by-value approach handles the context-passing direction well but the return/compression direction is underspecified.

---

## Key Findings

### 1. Subagent task prompt structure — the four-part contract

[VERIFIED — source: https://www.anthropic.com/engineering/built-multi-agent-research-system]

Anthropic's research system found that vague directives ("research the semiconductor shortage") caused duplication and gaps. The solution was a four-part contract for every subagent delegation:

- **Objective** — exactly what information to gather
- **Output format** — how results should be structured
- **Tool/source guidance** — which sources and tools to prefer
- **Task boundaries** — what is explicitly out of scope

Early versions without detailed task descriptions caused subagents to "duplicate work, leave gaps, or fail to find necessary information." This is a formal articulation of what APEX does informally — APEX passes acceptance criteria and impl path, which maps to objective + output format, but does not consistently specify tool guidance or explicit out-of-scope boundaries.

[VERIFIED — source: https://fountaincity.tech/resources/blog/anthropic-multi-agent-blueprint-production/]

The "four-part contract" is described as the core orchestrator discipline: objectives, output formats, tool/source guidance, and clear boundaries.

### 2. Lead-agent memory and checkpointing for long runs

[VERIFIED — source: https://www.anthropic.com/engineering/built-multi-agent-research-system]

For runs that risk hitting the 200k context limit, the recommended pattern is:

- **Saving the plan to Memory** — the lead agent writes its research plan to a persistent memory store at the start; if context is truncated, the plan survives and can be retrieved rather than reconstructed.
- **Resumable checkpoints** — the architecture "can resume from where the agent was when the errors occurred" rather than restarting from the beginning.
- **Deterministic safeguards** — retry logic and regular checkpoints are explicitly called out as the mechanism for graceful degradation.

[VERIFIED — source: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents]

Anthropic released a "file-based system" memory tool that enables agents to "build up knowledge bases over time, maintain project state across sessions, and reference previous work." Structured note-taking (maintaining persistent notes outside the context window, retrieved on demand) is the recommended pattern for tracking progress across complex multi-step tasks.

APEX maps this via status.md + handoff docs — persistent files that survive context resets. This is structurally aligned with Anthropic guidance. The gap: APEX does not have a mid-run checkpoint mechanism within a single coding session; if a DeepSeek session hits the context limit mid-spec, there is no plan-save step.

### 3. Subagent output compression — the artifact/pointer pattern

[VERIFIED — source: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents]

The key compaction principle: subagents should explore extensively (tens of thousands of tokens) but return only "1,000–2,000 tokens" of condensed, distilled summaries to the orchestrator. This achieves "clear separation of concerns — the detailed search context remains isolated within sub-agents, while the lead agent focuses on synthesizing and analyzing the results."

[VERIFIED — source: https://fountaincity.tech/resources/blog/anthropic-multi-agent-blueprint-production/]

The "artifact pattern" is described as: subagents write findings to shared storage (filesystem) and return **pointers** (file paths, references) rather than full content. This prevents the orchestrator's context from being filled with raw subagent output.

[VERIFIED — source: https://www.anthropic.com/engineering/built-multi-agent-research-system]

"Artifact systems where specialized agents can create outputs that persist independently" reduce token overhead by preventing "information loss during multi-stage processing."

**APEX gap identified:** APEX currently passes all state to subagents by value going IN (which is correct and confirmed), but does not specify a compression contract for what comes OUT. Subagent results are returned into the orchestrator's context as full text. For APEX skills running deep sub-analyses (e.g., apex-research, apex-deep-dive), there is no explicit instruction to return only a 1k–2k token condensed summary rather than the full exploration. This is the single biggest thing APEX's by-value rule misses — it specifies the input direction well but is silent on the output direction.

### 4. Retry and resumption after subagent failure

[VERIFIED — source: https://www.anthropic.com/engineering/built-multi-agent-research-system]

The recommended pattern: "letting the agent know when a tool is failing and letting it adapt works surprisingly well." The architecture supports resumption from failure point rather than full restart. APEX's current approach — prepending BLOCK findings to the re-run task — is consistent with this: inform the agent of what failed and let it adapt. Anthropic does not prescribe a more sophisticated retry protocol for the agent layer (as distinct from the infra layer).

[VERIFIED — source: https://www.augmentcode.com/guides/anthropic-agent-sdk-what-ships-vs-what-you-build]

The Anthropic Agent SDK does NOT provide built-in checkpointing or retry. These are developer responsibilities. The SDK provides automatic compaction at a configurable `context_token_threshold` (default 100k tokens) and a `PreCompact` hook, but state persistence across compaction is documented as broken/unresolved. Effective usable context during execution is estimated at 60k–80k tokens, not the full 200k window.

### 5. Just-in-time context and what to exclude

[VERIFIED — source: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents]

The just-in-time principle: agents should maintain lightweight identifiers (file paths, queries, links) and dynamically retrieve information at runtime rather than pre-loading everything. The principle maps to "pass references, not content" for large artifacts.

Information to include in subagent context:
- Architectural decisions and strategic context
- Clear behavioral heuristics for tool selection
- Minimal viable examples (diverse, canonical)
- Lightweight identifiers enabling runtime retrieval

Information to exclude:
- Redundant tool outputs once processed
- Exhaustive edge case lists
- Pre-computed data when autonomous exploration works better
- Overly prescriptive logic that creates brittleness

This aligns with APEX's approach of passing changed_files + impl path + acceptance criteria — these are identifiers and decision context, not pre-computed content. The guidance confirms this is correct.

### 6. SDK-native memory scopes

[VERIFIED — source: https://github.com/anthropics/claude-agent-sdk-python (Context7 docs)]

The `AgentDefinition` type includes a `memory` field with three scopes:
- `"user"` — persists across all this user's sessions
- `"project"` — persists within the project scope
- `"local"` — session-scoped only

This is a first-party mechanism for non-by-value state passing that APEX does not currently leverage. APEX treats all durable state as file-based (status.md, handoff, git); the SDK memory scope system is an alternative for cross-session continuity that is native to the agent runtime.

### 7. Practical token economics

[COMMUNITY — source: https://www.indium.tech/blog/7-state-persistence-strategies-ai-agents-2026/]

Multi-agent systems consume approximately 15x more tokens than standard chat. The recommended strategies for orchestrator efficiency: multi-agent memory coordination with isolated memory contexts per agent and atomic operations to prevent work duplication. The article recommends against having a single agent maintain global state across all subagent outputs.

[COMMUNITY — source: https://www.augmentcode.com/guides/anthropic-agent-sdk-what-ships-vs-what-you-build]

The 200k context window is not fully usable: practical effective context during execution is 60k–80k tokens due to tool outputs, system prompts, and compaction overhead.

---

## What APEX's by-value rule does well (confirmed by sources)

- Passing all context by value in the prompt (objective + files + criteria) directly matches Anthropic's four-part contract requirement — the information is complete at dispatch time, eliminating the need for subagents to explore to find their own context.
- Treating durable state as files (status.md, handoff, git) matches the Anthropic file-based memory recommendation.
- Prepending BLOCK findings to retry tasks matches Anthropic's "let the agent know when a tool is failing and let it adapt" guidance.
- Hard fork boundaries (no shared mutable state between agents) prevent the duplication and gap problems Anthropic observed in early versions of their research system.

## What APEX's by-value rule potentially misses

**Primary gap — output compression contract.** APEX specifies the input direction (what to pass in) in detail but does not specify what subagents must return. First-party guidance is explicit: subagents should return 1,000–2,000 token condensed summaries, not full exploration transcripts. Without this contract, orchestrator context fills up with raw subagent output, reducing effective headroom for subsequent tasks.

**Secondary gap — mid-run plan persistence.** For long coding sessions approaching context limits, there is no explicit plan-save step analogous to Anthropic's "save plan to Memory before context truncation" pattern. Status.md covers inter-session persistence but not intra-session checkpoint-within-a-spec.

**Tertiary gap (lower priority) — SDK memory scopes.** APEX does not use the `memory: "project"` scope available in AgentDefinition, which could provide a lighter-weight alternative to file-based state for cross-run continuity. This is a tooling gap, not an architectural flaw.

---

## Recommended takeaways for APEX

1. **Add an output compression contract to dispatch skills.** Any skill that spawns a subagent should specify a return format — either a structured 1k–2k token summary template, or the "artifact + pointer" pattern (write to a file, return the path). This is the highest-priority gap.

2. **Add a four-part task contract template to apex-plan / dispatch guidance.** Objective + output format + tool guidance + explicit out-of-scope boundaries. APEX covers the first two; tool guidance and boundaries are often implicit.

3. **Consider a mid-session plan checkpoint for long specs.** For specs with more than ~5 tasks, add a "save current position to status.md In-Flight" step at the midpoint, not just at session end. This mirrors Anthropic's checkpoint-before-truncation pattern.

---

## Sources

### Tier 1 — Primary (Anthropic first-party)
- https://www.anthropic.com/engineering/built-multi-agent-research-system — "How we built our multi-agent research system"
- https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents — "Effective context engineering for AI agents"
- https://github.com/anthropics/claude-agent-sdk-python — Claude Agent SDK Python (via Context7 /anthropics/claude-agent-sdk-python)

### Tier 2 — Community / practitioner (2025–2026)
- https://fountaincity.tech/resources/blog/anthropic-multi-agent-blueprint-production/ — "Anthropic's Multi-Agent Blueprint: What Production Adds"
- https://www.augmentcode.com/guides/anthropic-agent-sdk-what-ships-vs-what-you-build — "Anthropic Agent SDK: What It Ships vs. What It Leaves to You"
- https://www.indium.tech/blog/7-state-persistence-strategies-ai-agents-2026/ — "7 State Persistence Strategies for Long-Running AI Agents in 2026"

### Not successfully fetched (auth-gated)
- https://docs.anthropic.com/en/docs/build-with-claude/agents-and-tools — redirects to platform.claude.com (requires login)
- https://www.anthropic.com/engineering/effective-context-engineering — 404 (correct URL has full slug above)
