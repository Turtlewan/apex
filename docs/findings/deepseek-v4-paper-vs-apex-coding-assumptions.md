# Finding — DeepSeek-V4 technical report vs APEX's Flash/Pro coding assumptions

> **Superseded context (2026-07-19).** DeepSeek is archived (ADR-027, recovery-only) and there is
> no coding mode (ADR-038), so the claim that "APEX coding mode runs at Flash-Max / Pro-Max today"
> and the "now"-tagged action rows (targeting `model-specific-skill-authoring.md` and
> `BACKEND-ROUTING.md`, both since deleted) are moot. The coder is now Codex `gpt-5.6-sol`. Kept as
> a dated record.

_Date: 2026-06-13 (session 39). Planning-mode analysis. No code, no spec — proposed changes only._

**Source read in full:** `DeepSeek-V4: Towards Highly Efficient Million-Token Context Intelligence`
(preview tech report, 58 pp, DeepSeek-AI) — `huggingface.co/deepseek-ai/DeepSeek-V4-Pro/blob/main/DeepSeek_V4.pdf`.
Sections most relevant to APEX: §5.1.1 (reasoning efforts, Tables 2–3), §5.1 (tool-call schema
Table 4 + Interleaved Thinking), §5.3.1 (eval setup), Table 6/Table 7 (head-to-head), §5.4.4 +
Table 8 (Code Agent) + developer survey, §5.4.3 (white-collar), §6 (limitations).

---

## 1. The provenance answer (the question that started this)

**We never referred to this report when building the Flash or Pro skills.** Confirmed by tracing
every citation:

- `model-specific-skill-authoring.md` (the doc that sets *how* impl.md is tuned for Flash) cites
  `api-docs.deepseek.com` API guides + a **MindStudio community blog** for the weak-coder profile.
- The weak-coder compensation set (`coding-capability/ws-3`) is built from **generic small-model
  papers** (Qwen/Llama/Mistral, arXiv) **then mapped onto Flash by inference**.
- `pro-mode-audit/ws-a` states its central honesty caveat as: *"almost every benchmark we have is
  Pro-vs-Opus, not Flash-vs-Pro… the only near-direct datapoint is ADR-016's ~11 pp."*
- `model-comparison/ws-deepseek-v4-pro.md` lists *"Exact Hugging Face model-card URL"* under
  **Not verified** — we never opened the repo.

So the entire coding-side discipline rested on inference + one blog, with the primary behavioural
source unread. This report is that source.

---

## 2. What the paper VALIDATES (keep — now first-party-backed, not inferred)

| APEX assumption / rule | Paper evidence |
|---|---|
| **Specs must be exact — no vague prompts, name files, pre-resolve ambiguity** (global CLAUDE.md spec rules; apex-plan) | Developer survey (n=85, daily Pro users): the *named* top weaknesses of even **Pro-Max** are **"misinterpretation of vague prompts"**, "trivial mistakes", "occasional over-thinking" (§5.4.4). First-party confirmation of APEX's #1 spec rule. |
| **Per-task verify loop + surgical scope** (apex-code) | "trivial mistakes" + "over-thinking" are exactly what a tight verify-after-each-task loop and scope lock catch. |
| **Instruction-following can't be assumed even at the top tier** | vs Opus-4.6 on white-collar tasks, Pro-Max "occasionally overlooks specific formatting constraints and slightly trails Opus" on Instruction Following (§5.4.3). |
| **Flash is genuinely weaker than Pro on hard coding** (the premise of Pro-mode) | "DeepSeek-V4-Flash underperforms DeepSeek-V4-Pro on coding tasks, **particularly on Terminal-Bench 2.0**" (§5.3.2); "trails its larger counterpart on more complex, high-difficulty tasks" (intro). |
| **SKILL/impl split + author-to-weakest-reader** | Paper doesn't touch authoring; nothing contradicts it. Unchanged. |

---

## 3. What the paper CORRECTS or OVERTURNS

### 3.1 ⭐ Reasoning-effort: RESOLVED — APEX runs at MAX, automatically, with no control (highest impact)
This was the deep-dive question. Answer, grounded in our actual config + DeepSeek's live docs:

**What APEX configures:** The coding toggle (`pro-mode-mechanics.md` + `BACKEND-ROUTING.md`) sets
**only `ANTHROPIC_MODEL`** (`deepseek-v4-flash` | `deepseek-v4-pro`), `ANTHROPIC_BASE_URL`
(`api.deepseek.com/anthropic` — DeepSeek's *native* Anthropic-compatible endpoint, not a 3rd-party
proxy), and the auth token. **Nothing in APEX sets `reasoning_effort`, `output_config.effort`, or a
thinking budget** — not in settings.json (no `env` block at all), not in the hook, not in any skill.

**What DeepSeek does with that** (api-docs.deepseek.com — thinking_mode + anthropic_api guides):
- Thinking mode **defaults to enabled**; there is effectively **no "non-think" exposed via effort**.
  Documented effort values are only `high` and `max` (`low`/`medium`→`high`, `xhigh`→`max`).
- Default effort is `high` for regular requests — **but "for some complex agent requests (such as
  Claude Code, OpenCode), effort is automatically set to `max`."** DeepSeek detects Claude Code and
  bumps it.
- Over the Anthropic endpoint the `thinking` param is "supported (budget_tokens is **ignored**)" —
  so even if Claude Code sends a thinking budget, DeepSeek overrides it with its own effort logic.

**Therefore APEX coding mode runs at `Flash-Max` today, and `Pro-Max` under the Pro toggle** —
the *maximum* reasoning tier — set automatically by DeepSeek, not chosen by us, and not currently
controllable from APEX's side. This **inverts** my earlier worry (that we might be stuck at a weak
non-think default). Consequences:

1. **The paper's "-Max" columns ARE the APEX-relevant numbers.** Table 7's Max columns and Table 8
   (V4-Pro-Max) describe exactly the config APEX runs. The Pro-mode audit should compare
   **Flash-Max vs Pro-Max**, full stop.
2. **There is no cheap "turn thinking on" win — we're already maxed.** My original recommendation #1
   ("enable Think-High") was built on the wrong assumption. The weak-coder compensations are
   calibrated against Flash at its *strongest* config, so they are **not** over-calibrated for a
   weak default. Keep them.
3. **The real, unexploited lever is the opposite — turning effort DOWN.** `Pro` toggle = `Pro-Max` =
   precisely the expensive corner `model-comparison` flagged ("think-max inflates cost above the
   3.1× sticker"). We land there by default. For *mechanical execution of a precise spec*, max
   reasoning is plausibly wasteful and feeds the survey-named **"over-thinking"** failure. A way to
   request `high` (or non-think) for simple/literal specs is a genuine cost + behaviour win APEX
   cannot currently express.
4. ⚠️ **Confidence:** the "Claude Code → max" auto-bump is from DeepSeek's docs via web fetch, not
   yet observed on our wire. Confirm on the Mac (see #2 in the table) — but it is specific,
   first-party, and consistent with the report's Max-mode framing.

### 3.2 ⭐ A direct Flash↔Pro head-to-head DOES exist (overturns ws-a's central caveat)
**Table 7 is a full direct comparison** of Flash and Pro across Non-think/High/Max on every coding
and agentic benchmark — exactly the comparand `pro-mode-audit/ws-a` said was missing and the reason
almost every relax-confidence row was capped at Low/Med. The audit's defining honesty caveat is now
**factually wrong** and the confidence ceilings it forced should be revisited against real numbers.
Table 8 adds an internal **R&D coding** comparison: Haiku-4.5 **13** · Sonnet-4.5 **47** ·
**V4-Pro-Max 67** · Opus-4.5 **70** · Opus-4.5-Thinking **73** · Opus-4.6-Thinking **80**. Pro-Max
sits between Sonnet-4.5 and Opus-4.5 on real internal coding tasks.

### 3.3 The "struggles in 5+ tool chains / loses state across calls" claim is path-dependent, not absolute
Two pieces of paper evidence cut against the community-sourced compensation:
- DeepSeek's own code-agent eval runs **up to 500 interaction steps** with a bash + file-edit tool,
  512K context (§5.3.1). That is the opposite of "falls apart after 5 tool steps."
- **Interleaved Thinking** (§5.1): in the *tool-calling* path, V4 now **retains the full reasoning
  trace across rounds, including across user-message boundaries** — "a coherent, cumulative chain of
  thought over long-horizon agent tasks." This directly softens the "instruction drift / lost in the
  middle / state-across-calls" rationale **for that path**.

But it is conditional — see 3.4.

### 3.4 The tool-call-path gotcha — probably NOT triggered, but worth confirming
§5.1: *"agent frameworks that simulate tool interactions via user messages (e.g., Terminus) may not
trigger the tool-calling context path and thus may not benefit from enhanced reasoning persistence.
We continue to recommend non-think models for such architectures."*

The fact that DeepSeek **specifically force-maxes Claude Code's reasoning effort** (3.1) strongly
implies DeepSeek's Anthropic adapter treats Claude Code as a *bona-fide* agent on the native
tool-calling path — otherwise it would route it to the non-think recommendation, not max. So the
gotcha is likely *not* triggered for APEX, and interleaved-thinking persistence (3.3) is in force.
Worth a one-line Mac confirmation (does a coding response carry `<think>` content across tool
rounds?) but no longer a blocker.

### 3.5 Minor: version-pin the Claude comparand
The report benchmarks Pro against **Opus 4.5 / 4.6, Sonnet 4.5** — not Opus 4.8 (our planning
model). "Approaches Opus 4.5" understates the gap to 4.8. `model-comparison` framing should note the
comparand is one-to-two Claude generations behind ours.

---

## 4. Proposed changes to the spec-writing / coding-side skills

Ranked by impact. Confidence + Mac-gating marked. **Nothing here is a rule-weakening I'd apply
blind** — the highest-value items are *investigations and assumption corrections*, not relaxations.

| # | Change | Target file(s) | Type | Confidence | Gate |
|---|--------|----------------|------|-----------|------|
| 1 | **Document the resolved reality:** APEX coding runs **Flash-Max / Pro-Max**, set automatically by DeepSeek (Claude Code → effort `max`), uncontrolled by APEX config. Record this as a stated assumption so no future session re-derives it or assumes a weak non-think default. | `model-specific-skill-authoring.md`, `BACKEND-ROUTING.md` (known-limitations table), `pro-mode-mechanics.md` (note) | assumption record | HIGH (docs) / confirm wire on Mac | **now** (desk) |
| 2 | **One-line Mac confirmation** that (a) coding responses actually carry `<think>` reasoning (effort really on) and (b) it's `max` (check billed reasoning-token volume / response). Fold into the existing context-window Mac checklist in status.md — same probe trip. | status.md Mac checklist | verification item | HIGH it'll confirm | Mac |
| 3 | **Fix `model-specific-skill-authoring.md`:** re-tag the MindStudio `[COMMUNITY]` "struggles with nuance / 5+ tool chains" claims as **superseded** (DeepSeek's own code-agent eval runs 500 steps; §5.3.1); add the reasoning-effort reality (Flash is not one fixed capability — APEX gets Flash-Max). Re-research date (2026-06-12) is past — this read discharges it. | `model-specific-skill-authoring.md` | research refresh | HIGH | **now** |
| 4 | **Re-open the Pro-mode audit confidence ceilings.** `pro-mode-audit/ws-a`'s defining caveat ("no Flash↔Pro comparand; only ADR-016's ~11pp") is **false** — Table 7 is a full Flash-vs-Pro-vs-mode head-to-head, and it's specifically the **Max** columns that match APEX. Re-score the RELAX-UNDER-PRO rows against real Flash-Max→Pro-Max deltas. | `pro-mode-audit/ws-a-evidence-map.md`, `README.md` | audit correction | HIGH caveat is wrong; re-score MEDIUM | **now** (desk) |
| 5 | **NEW — effort-down cost lever (the real opportunity).** APEX cannot currently request anything below `max`. Pro-Max is the exact expensive corner `model-comparison` warned about, and max reasoning on a *literal execution spec* feeds "over-thinking." Investigate exposing `output_config.effort: high` (or non-think) for simple/low-risk specs via the toggle or a per-spec flag. **Net cost reducer**, not a capability relaxation. | `pro-mode-mechanics.md` (toggle), spec-template flag, `apex-code` | mechanics (new) | MEDIUM (needs Mac to prove the param lands + measure savings) | Mac |
| 6 | **DON'T relax the weak-coder compensations on capability grounds.** They are calibrated against Flash-**Max** (strongest config), not a weak default, so the "Pro is smarter → relax" case is weaker than the audit assumed. The 500-step / interleaved-thinking findings (3.3) only soften the *defensive over-fragmentation* margin, and only if #2 confirms the native path — minor, Mac-gated. | `apex-code`, `apex-coding-principles` | hold / minor | — | Mac |
| 7 | **Version-pin note** in `model-comparison`: Pro's "approaches Opus" is vs Opus 4.5/4.6 (paper), not Opus 4.8 (our planning model) — the real gap to our baseline is wider. | `model-comparison/README.md`, `ws-deepseek-v4-pro.md` | factual correction | HIGH | **now** |

---

## 5. What I would NOT change

- **The architectural / non-monotonic keeps stand.** The report says nothing that overturns
  prohibition-rule decay (#2), joint-compliance collapse (#6), or priority-hierarchy enforcement
  (#7) from `ws-a`. Those are transformer-instruction-following properties; V4 is the same
  architecture family (DeepSeekMoE + MTP, §2.1). Keep regardless of tier **and** effort mode.
- **The exact-spec / no-vague-prompt discipline** is now *more* justified, not less (§4 above) —
  the developer survey names vague-prompt misinterpretation as a live Pro-Max failure. Do not relax.
- **The SKILL/impl split.** Untouched by the paper; still sound.
- **Surgical scope + per-task verify.** "Over-thinking" + "trivial mistakes" reinforce these.

---

## 6. Bottom line

The deep dive resolved the reasoning-effort question, and the answer is the **inverse** of the
initial worry. APEX never sets a reasoning effort; DeepSeek **auto-detects Claude Code and runs it
at `max`**. So coding mode is **Flash-Max today / Pro-Max under the toggle** — the strongest *and
most expensive* tier — by default and outside APEX's control. That means:

- The weak-coder compensations were never compensating for a switchable-off weak default; they
  reflect Flash at its ceiling. **Keep them.** (corrects my first report's #1)
- The paper's **-Max benchmark columns are exactly APEX's operating point**, and Table 7 is the
  direct Flash↔Pro head-to-head the Pro-mode audit wrongly said didn't exist → re-open those
  confidence ceilings.
- The only genuinely new opportunity is the **opposite lever**: a way to request **less** reasoning
  (`effort: high` / non-think) for simple literal specs — a cost reducer (Pro-Max is the 3.1×++
  corner) and an antidote to the survey-named "over-thinking", which APEX currently cannot express.

**Net: 0 rules to weaken; 3 desk corrections doable now (#3 authoring-doc, #4 audit ceilings,
#7 version-pin) + 1 assumption record (#1); 1 cheap Mac confirmation (#2); 1 new cost-lever
investigation, Mac-gated (#5). The "enable thinking" idea from the first report is withdrawn —
we're already maxed.**
