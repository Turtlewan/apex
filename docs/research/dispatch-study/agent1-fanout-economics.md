# Fan-Out Economics: When Parallel Multi-Agent Pays vs Single Agent

**Research date:** 2026-06-08
**Researcher:** agent1 (source-grounded research pass)
**Question:** When does parallel multi-agent fan-out actually pay off (in tokens/cost/quality) versus a single agent — and what is the published rule of thumb?

---

## Summary

Anthropic publishes a clear 15x token multiplier for multi-agent systems versus chat, and 4x for single-agent versus chat. The payoff is real (90.2% quality gain over single-agent on their research eval) but only for tasks that decompose into genuinely independent parallel threads of exploration. The "simplest thing that works" is Anthropic's stated default; multi-agent is an upgrade path, not a starting point. No minimum task count is published — the guidance is qualitative: independence, no shared state, and task value high enough to justify the token cost. An independent academic study (April 2026) challenges multi-agent gains under equal compute budgets, suggesting the advantage largely comes from spending more tokens, not from the architecture itself.

---

## Key Findings

### 1. Published Token Multiplier

**15x tokens vs chat** for multi-agent systems; **4x tokens vs chat** for single-agent interactions.

[VERIFIED — source: https://www.anthropic.com/engineering/built-multi-agent-research-system]

Anthropic states: "Token usage alone explains 80% of performance variance in their evaluations."

[VERIFIED — source: https://www.anthropic.com/engineering/built-multi-agent-research-system]

A community analysis (quoting the same Anthropic blog) adds: *"Multi-agent systems work mainly because they help spend enough tokens to solve the problem."*

[COMMUNITY — source: https://theaiengineer.substack.com/p/how-anthropic-built-multi-agent-deep]

The arxiv paper "Single-Agent LLMs Outperform Multi-Agent Systems on Multi-Hop Reasoning Under Equal Thinking Token Budgets" (April 2026) found that under **equal** token budgets, single-agent systems consistently match or outperform multi-agent systems. It argues many reported MAS advantages reflect unequal compute comparisons, not architectural benefits.

[VERIFIED — source: https://arxiv.org/abs/2604.02460]

**Practical cost scale (CloudZero, 2026):** Running 10 parallel agents uses quota 10x faster — no discount. With an Opus orchestrator + Sonnet workers, choosing Sonnet workers over all-Opus saves ~40%. Long-running agents accumulate stale context; clearing between tasks cuts per-message token cost 30–50%.

[COMMUNITY — source: https://www.cloudzero.com/blog/claude-code-agents/]

---

### 2. When Parallel Sub-Agents Pay (Anthropic's Stated Criteria)

Anthropic's criteria for multi-agent being worth the cost:

**Go multi-agent when:**
- The task decomposes into **independent parallel threads** with minimal coordination needs
- Information required exceeds a **single context window**
- The task is **high-value enough** to justify 15x token spend ("tasks where the value of the task is high enough to pay for the increased performance")
- Breadth-first exploration is the bottleneck (e.g., research across 65 companies, board members, etc.)

[VERIFIED — source: https://www.anthropic.com/engineering/built-multi-agent-research-system]

**Stay single-agent when:**
- Tasks require **shared context** across all agents or have many inter-dependencies
- Coding/debugging: "Most coding tasks involve fewer truly parallelizable tasks than research"
- The simpler single-call solution has not yet demonstrably failed
- Sequential steps dominate the workflow

[VERIFIED — source: https://www.anthropic.com/engineering/built-multi-agent-research-system]
[VERIFIED — source: https://www.anthropic.com/engineering/building-effective-agents]

The Building Effective Agents doc adds the orchestrator-workers pattern is appropriate when "subtasks aren't pre-defined, but determined by the orchestrator based on the specific input" — not when you can hardcode the execution path.

[VERIFIED — source: https://www.anthropic.com/engineering/building-effective-agents]

---

### 3. Minimum Task Count / Independence Threshold

**No numeric minimum task count is published by Anthropic.**

The guidance is qualitative:
- Independence of subtasks (no shared context, no data dependencies between worker threads)
- Task value sufficient to absorb the 15x token overhead
- Complexity that cannot be solved by single-LLM call optimization first

[VERIFIED — source: https://www.anthropic.com/engineering/building-effective-agents]
[VERIFIED — source: https://www.anthropic.com/engineering/built-multi-agent-research-system]

The subagent task-description contract from Anthropic's own system: "a self-contained task description, an output format, a tool list, and a clear boundary on when it's done." Implied threshold: if you cannot write a self-contained task description, the task is not ready to be a subagent.

[COMMUNITY — source: https://theaiengineer.substack.com/p/how-anthropic-built-multi-agent-deep]

---

### 4. "Keep It Simple / Don't Add Agents Unless Needed" — Verbatim Guidance

From Building Effective Agents:

> "Start with simple prompts, optimize them with comprehensive evaluation, and add multi-step agentic systems only when simpler solutions fall short."

> "you should consider adding complexity only when it demonstrably improves outcomes."

> "For most applications, optimizing single LLM calls with retrieval and in-context examples is usually enough."

[VERIFIED — source: https://www.anthropic.com/engineering/building-effective-agents]

---

### 5. Orchestrator-Worker Architecture Details

Anthropic's production system (from the research blog):
- **LeadResearcher** (Opus 4): plans strategy, spawns 3–5 subagents, synthesizes
- **Subagents** (Sonnet 4): execute parallel searches independently, separate context windows
- **CitationAgent**: separate verification pass

Parallel tool calling in this system "cut research time by up to 90% for complex queries."

[VERIFIED — source: https://www.anthropic.com/engineering/built-multi-agent-research-system]

---

### 6. Counter-Evidence (Independent Research)

The arxiv paper (April 2026, models: Qwen3, DeepSeek-R1-Distill-Llama, Gemini 2.5) found:
- Under equal reasoning-token budgets, single-agent systems match or outperform multi-agent
- MAS advantages "better explained by unaccounted computation and context effects"
- Significant benchmark artifacts inflate reported MAS gains

**Implication for APEX:** The 90.2% gain Anthropic reports likely reflects ~15x more tokens spent, not a free architectural lunch. If token budget is constrained, parallelizing may deliver equivalent or worse quality than giving a single agent the same budget.

[VERIFIED — source: https://arxiv.org/abs/2604.02460]

---

## Recommended Takeaway for APEX

### Does APEX's "2+ independent tasks" threshold align?

**Yes — and it is conservative in the right direction.**

Anthropic's guidance provides no lower bound on task count, only the independence criterion. APEX's policy of running a 1-task wave inline (no fan-out) and only parallelizing at 2+ independent tasks is consistent with the "simplest thing that works" principle. It avoids the 15x token overhead for single-task waves.

**What the research adds:**
1. The independence criterion is the load-bearing criterion, not the count. Two highly dependent tasks should NOT fan out even though they meet the "2+" count. APEX should verify independence, not just count.
2. The 15x multiplier is the right mental model for cost estimates when sizing waves.
3. For APEX's coding-mode use cases (specs with 2–5 independent file changes), the arxiv finding is a mild caution: the gain may come primarily from token volume, not the architecture. If a single agent with the same token budget could do the work, fan-out adds coordination overhead for no quality gain.
4. The "self-contained task description with a clear boundary" test is a practical pre-flight check before spawning: if you can't write a self-contained description, the task shouldn't be a subagent.

**Suggested APEX refinement:** Supplement the "2+ tasks" count gate with an explicit independence check — tasks that share context or where output of task A feeds input of task B should not be fanned out regardless of count.

---

## Sources

| Tier | Source | URL |
|------|--------|-----|
| Tier 1 | Anthropic: "How we built our multi-agent research system" | https://www.anthropic.com/engineering/built-multi-agent-research-system |
| Tier 1 | Anthropic: "Building effective agents" | https://www.anthropic.com/engineering/building-effective-agents |
| Tier 1 | arxiv: "Single-Agent LLMs Outperform Multi-Agent Systems..." (Apr 2026) | https://arxiv.org/abs/2604.02460 |
| Community | The AI Engineer: Anthropic's Multi-Agent Research Architecture | https://theaiengineer.substack.com/p/how-anthropic-built-multi-agent-deep |
| Community | CloudZero: Claude Code Agents In 2026 | https://www.cloudzero.com/blog/claude-code-agents/ |
| Community | ByteByteGo: How Anthropic Built a Multi-Agent Research System | https://blog.bytebytego.com/p/how-anthropic-built-a-multi-agent |
