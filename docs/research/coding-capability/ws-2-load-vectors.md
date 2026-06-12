# WS-2: Coding-Mode Load Vectors & Injection Analysis

**Date:** 2026-06-12  
**Author:** WS-2 research agent  
**Workstream role:** Determine what actually loads / fires for DeepSeek in a coding session; map injection and trigger vectors that could pull it out of the `apex-code` loop.  
**Confidence tagging:** [HIGH] = confirmed by direct file read; [MED] = inferred from evidence; [LOW] = plausible but not directly confirmed.

---

## 1. Session Start Hook Chain

### 1.1 What fires at SessionStart

`settings.json` registers **four** sequential SessionStart hooks (not parallelised — each fires in array order):

| # | Hook command | Injects context? | Backend-branches? |
|---|---|---|---|
| 1 | `backend-session-start.ps1` | YES — structured `hookSpecificOutput.additionalContext` | YES — DeepSeek vs Anthropic get different `$policy` text |
| 2 | `gsd-check-update.js` | Conditional (GSD update check; likely emits banner if update available) | Unknown — not read |
| 3 | `gsd-session-state.sh` | Conditional — **opt-in only** via `.planning/config.json hooks.community: true`; exits silently if not opted in | No branching — reads config.json mode field |
| 4 | `mode-stamp.js` (claude-cockpit) | Unknown — external project file, not analysed | Unknown |

[HIGH] Hook 3 (gsd-session-state.sh) is a no-op for any APEX project that does not have `.planning/config.json` with `hooks.community: true`. APEX projects use `docs/` not `.planning/`, so this hook is silently inactive for the APEX project itself and most APEX-managed projects.

### 1.2 What `backend-session-start.ps1` injects on the DeepSeek backend

[HIGH] The script detects `ANTHROPIC_BASE_URL -like '*deepseek*'` and emits a structured JSON payload with `hookSpecificOutput.additionalContext` containing:

1. **APEX routing banner** — mandatory first-action instruction to invoke `apex-orchestrate` via the Skill tool before doing anything else, including before answering the user. Exact quoted text:
   > "Your FIRST action this session MUST be to invoke the apex-orchestrate skill via the Skill tool -- BEFORE answering the user, asking clarifying questions, or starting any task."

2. **Backend declaration** — `## Active LLM backend: DeepSeek` + `## ANTHROPIC_BASE_URL: <value>`

3. **Coding mode policy** — short `$policy` block:
   > "Mode: CODING (DeepSeek backend)  
   > You MAY: edit source code, run build/test/lint commands, complete implementation tasks.  
   > You SHOULD: look for technical change specs in docs/changes/*.md (or wherever the user keeps them) and execute them."

4. **No handoff doc is injected in coding mode.** The script only fetches `docs/handoff/` and appends it in the `else` branch (planning mode). In coding mode, `$handoffContent` stays `''`. [HIGH]

**Banner token cost estimate:** ~280 tokens (1,122 chars / 4).

### 1.3 UserPromptSubmit hook — per-prompt git status injection

[HIGH] `coding-git-status.ps1` fires on every user prompt submission and:
- Only runs when `ANTHROPIC_BASE_URL -match "deepseek"` (coding mode only).
- Emits `additionalContext` of the form `"[GIT STATUS] N file(s) have uncommitted changes: file1, file2, ..."` when there are uncommitted tracked files.
- Exits silently when the repo is clean or not a git repo.

This is a small, targeted injection with no skill loading or policy override. [HIGH]

---

## 2. Superpowers Plugin — What Actually Loads

### 2.1 Plugin injection mechanism

[HIGH] The superpowers plugin (`superpowers@claude-plugins-official`, enabled in `settings.json`) injects via `experimental.chat.messages.transform` — it prepends content to the **first user message** of each session. This is not a hook (no `hookSpecificOutput` envelope) — it transforms the message array directly.

The injected content is:
```
<EXTREMELY_IMPORTANT>
You have superpowers.

**IMPORTANT: The using-superpowers skill content is included below. It is ALREADY LOADED...**

[full content of using-superpowers/SKILL.md, frontmatter stripped]

[Tool Mapping for OpenCode block]
</EXTREMELY_IMPORTANT>
```

**This fires on every session, both backends, with no backend branching.** [HIGH]

### 2.2 The `using-superpowers` SKILL.md content — key directives

The full text includes:

**The mandatory-invocation directive:**
> "If you think there is even a 1% chance a skill might apply to what you are doing, you ABSOLUTELY MUST invoke the skill."
> "IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT."
> "This is not negotiable. This is not optional. You cannot rationalize your way out of this."

**The `<SUBAGENT-STOP>` guard:**
> "If you were dispatched as a subagent to execute a specific task, skip this skill."
This guard is for *subagents* dispatched within a session — it does not suppress loading for the main model at session start.

**The instruction-priority section:**
> 1. **User's explicit instructions** (CLAUDE.md, GEMINI.md, AGENTS.md, direct requests) — highest priority
> 2. **Superpowers skills** — override default system behavior where they conflict
> 3. **Default system prompt** — lowest priority
>
> "If CLAUDE.md, GEMINI.md, or AGENTS.md says 'don't use TDD' and a skill says 'always use TDD,' follow the user's instructions. The user is in control."

**Skill priority order (when multiple apply):**
1. Process skills first (brainstorming, debugging)
2. Implementation skills second

### 2.3 Token cost of injected superpowers payload

[HIGH] `using-superpowers/SKILL.md` is 83 lines / 5,421 chars. The plugin wraps it in `<EXTREMELY_IMPORTANT>` + tool-mapping block adding ~200 chars.  
**Estimated injection: ~1,400–1,500 tokens.**

---

## 3. apex-orchestrate Step 5 — Coding-Mode Domain Loading Rules

[HIGH] `apex-orchestrate/SKILL.md` Step 5 states:

> "For each matched domain:
> - In planning mode: load domain's SKILL.md into context
> - **In coding mode: do NOT load whole impl.md files here — apex-code owns coding-side loading**"

This is an explicit gate. The orchestrator does not load domain impl.md files in coding mode. It defers entirely to `apex-code`'s two-tier loading (§ Verification). [HIGH]

---

## 4. apex-code/SKILL.md — Session Start and Loading Protocol

[HIGH] `apex-code` defines session start as:

1. `git log --oneline -10` (recent commits, no prose docs)
2. Read `docs/status.md` — stop at the CODING block; **do not read the PLANNING block**
3. List `docs/changes/*.md` (ready specs)
4. Report

**Context discipline:** "When executing a spec, read only that spec and the files it explicitly lists. Never load docs/handoff/, other pending specs, or ambient project documentation."

**impl.md loading (two-tier):**
- Always load: `apex-coding-principles/impl.md` in full before writing any code.
- Stack-skill core: for each `stack_skills` bound skill, load only `## NEVER do` + `## ALWAYS do` + `## Verification Recipe` + `## Common errors → fix` sections. Not the whole impl.md.
- On-demand references: only when a task condition matches.

**Does apex-code assert primacy over other skills?** [MED] No explicit "ignore non-APEX skills" directive exists in the SKILL.md. apex-code constrains its own loading behaviour but does not instruct DeepSeek to reject or ignore skills that other vectors (superpowers, gsd, etc.) might push.

---

## 5. The CLAUDE.md Chain — Always-On Context

Both CLAUDE.md files load every session (all projects, all backends):

| File | Lines | Chars | Estimated tokens |
|---|---|---|---|
| `~/.claude/CLAUDE.md` | 176 | 14,516 | ~3,629 |
| `C:\users\user\apex\CLAUDE.md` | 59 | 3,570 | ~892 |
| **Total CLAUDE.md chain** | **235** | **18,086** | **~4,521** |

The `~/.claude/CLAUDE.md` contains the full APEX routing rules, backend-branching description, spec authoring rules, session-start workflow, coding-mode and planning-mode protocols, and agent self-defense rules.

The `apex/CLAUDE.md` contains project-level rules for the APEX skill system itself (skill locations, naming, authoring workflow, history contract).

---

## 6. Load Vectors Table — Coding Session

| Item | Load category | Backend-branched? | Tokens (est.) | Source |
|---|---|---|---|---|
| `~/.claude/CLAUDE.md` | Always-on (harness) | No | ~3,629 | Harness always loads |
| `apex/CLAUDE.md` | Always-on (project) | No | ~892 | Project CLAUDE.md |
| `using-superpowers/SKILL.md` content | Injected-by-plugin (first user message) | No — fires both backends | ~1,400–1,500 | superpowers plugin `messages.transform` |
| APEX routing banner + coding policy | Injected-by-hook (SessionStart) | YES — DeepSeek-specific `$policy` | ~280 | `backend-session-start.ps1` |
| `apex-orchestrate/SKILL.md` | Self-invoked-via-trigger (mandatory first action per hook) | No — same skill, different routing outcome | ~700 (est.) | Hook banner forces invocation |
| `apex-code/SKILL.md` | Self-invoked-via-trigger (apex-orchestrate routes to it) | YES — only routed in coding mode | ~5,800 | apex-orchestrate Step 4 |
| `apex-coding-principles/impl.md` | Matched-on-demand (apex-code pre-flight) | YES — coding only | ~2,758 | apex-code § Verification |
| Stack-skill impl.md cores (e.g., apex-python, apex-nextjs) | Matched-on-demand (bound stack_skills) | YES — coding only | ~1,000–2,000 per skill | apex-code § Verification |
| Domain impl.md files (auth, security, data) | Matched-on-demand (wave domain review dispatch) | YES — coding only | Load-time, not pre-flight | apex-code § Wave domain review |
| `gsd-session-state.sh` injection | Injected-by-hook (SessionStart) | No — but opt-in only; silently inactive for APEX | 0 (inactive) | `gsd-session-state.sh` |
| `coding-git-status.ps1` injection | Injected-by-hook (UserPromptSubmit, coding-only) | YES — DeepSeek only | ~30–100 per prompt | `coding-git-status.ps1` |
| GSD skill suite (gsd-execute-phase, etc.) | Self-invoked-via-trigger (if superpowers fires + skill name matches) | No — same for both backends | Variable | superpowers "MUST invoke" directive |
| `controlled-yolo/SKILL.md` | Self-invoked-via-trigger (if superpowers fires + matches) | No | Variable | superpowers "MUST invoke" directive |

---

## 7. Hijack Risk Analysis — `using-superpowers` vs `apex-code` Loop

### 7.1 The conflict in detail

`using-superpowers` SKILL.md states:
> "If you think there is even a 1% chance a skill might apply to what you are doing, you ABSOLUTELY MUST invoke the skill."
> "IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT."

`apex-code` SKILL.md contains no directive telling DeepSeek to ignore or bypass this instruction. Its "context discipline" clause constrains *file reads* and *spec loading*, not skill invocations.

### 7.2 Is the conflict reachable?

**YES — the conflict is reachable and live.** [HIGH] Mechanism:

1. The superpowers plugin fires on the first user message of every session with no backend branch — DeepSeek receives the `<EXTREMELY_IMPORTANT>` block.
2. The `SUBAGENT-STOP` guard only suppresses loading for *dispatched subagents*, not for the main session model.
3. A user message like "build the spec" could — under a literal reading of the 1% rule — trigger DeepSeek to invoke `superpowers:test-driven-development`, `superpowers:executing-plans`, `gsd-execute-phase`, or `controlled-yolo` before or alongside invoking `apex-code`.
4. apex-code does not assert exclusivity. It has no "do not invoke other skills" directive.

### 7.3 Does CLAUDE.md rein it in?

**Partially, but not reliably for DeepSeek.** [MED]

The `using-superpowers` priority chain explicitly places "User's explicit instructions (CLAUDE.md)" above superpowers skills. `~/.claude/CLAUDE.md` does describe APEX routing (route to apex-orchestrate → apex-code), but it does not say "never invoke superpowers skills during a coding session." The CLAUDE.md text describes a workflow; the superpowers text is a compliance directive. For a stronger, more literal executor like DeepSeek, the mandatory-MUST language of superpowers may be harder to override by prose workflow descriptions in CLAUDE.md.

The key test is: does CLAUDE.md say "do not use TDD/gsd/controlled-yolo during an apex-code build"? It does not. It says what mode to use and how APEX routing works. The specific anti-override instruction the priority chain refers to ("don't use TDD") does not exist in CLAUDE.md for the coding case.

### 7.4 Concrete hijack scenarios

| Scenario | Risk level | Mechanism |
|---|---|---|
| User says "build the spec" → superpowers fires `executing-plans` before `apex-code` | MEDIUM | "1% rule" + "Invoke relevant skills BEFORE any response" |
| Mid-build task involves debugging → superpowers fires `systematic-debugging` instead of `apex-debug` path | MEDIUM | "Fix this bug → debugging first" from skill priority flowchart |
| `gsd-fast` or `gsd-execute-phase` invoked because "execute" keyword matches | LOW-MEDIUM | Keyword overlap; depends on skill list visibility |
| `controlled-yolo` invoked for a permissions-heavy task | LOW | Requires user to mention or trigger yolo-like phrasing |
| `superpowers:test-driven-development` conflicts with apex-code's recipe-first approach | MEDIUM | Any task that involves writing code could match TDD skill |

### 7.5 Structural gap

[HIGH] The superpowers plugin has no backend-branching code. It fires identically for both Anthropic and DeepSeek sessions. There is no `if isDeepSeek { skip injection }` logic anywhere in `superpowers.js`. This is the root of the issue: the plugin was likely designed for a single-backend environment.

---

## 8. Always-On Token Estimate (Coding Session Baseline)

This is the context cost before any spec is read, before any code is written:

| Component | Tokens (est.) |
|---|---|
| `~/.claude/CLAUDE.md` | 3,629 |
| `apex/CLAUDE.md` | 892 |
| `using-superpowers` plugin injection | 1,450 |
| `backend-session-start.ps1` APEX banner (DeepSeek) | 280 |
| **Subtotal — always-on at first user message** | **~6,251** |
| `apex-orchestrate/SKILL.md` (mandatory invoke) | ~700 |
| `apex-code/SKILL.md` (routed at session start) | ~5,800 |
| `apex-coding-principles/impl.md` (pre-flight) | ~2,758 |
| **Subtotal — loaded by pre-flight (before Wave 1)** | **~9,258** |
| **Total baseline before first file is touched** | **~15,509 tokens** |

This does not include stack-skill impl.md cores (typically 1,000–2,500 tokens each). With one bound stack skill (e.g. `apex-python`), baseline rises to approximately **16,500–18,000 tokens**.

---

## 9. Backend Branching for Planning-Only or Design-Only Skills

### 9.1 What exists

[HIGH] The only explicit backend-branching for skill suppression is:
- `apex-orchestrate` Step 5: explicitly blocks impl.md loading in coding mode (defers to apex-code).
- `backend-session-start.ps1`: provides different `$policy` text per backend (CODING vs PLANNING), but this is orientation text, not a skill suppression gate.
- `backend-pretool-write.ps1`: exits immediately on DeepSeek (`if ($url -like '*deepseek*') { exit 0 }`), removing the write-guard — not skill suppression.

### 9.2 What does not exist

[HIGH] There is no mechanism that:
- Prevents planning-only skills (`apex-plan`, `apex-spec-reviewer`, `apex-skill-author`) from being invoked in coding mode.
- Prevents superpowers skills from firing in coding mode.
- Signals to the superpowers plugin to suppress injection when `ANTHROPIC_BASE_URL` contains "deepseek".
- Prevents gsd skills from self-invoking via keyword match in a coding session.

The `apex-figma` SKILL.md notes that "visual comparison steps require image support — DeepSeek skips these and flags for planning-mode review" but this is a manual instruction inside the skill, not a harness-level gate.

### 9.3 Suppression gap summary

Planning-only skills (`apex-plan`, `apex-spec-reviewer`) are unlikely to be invoked in practice because no user message in a coding session would naturally trigger them. However, design-adjacent skills (`apex-ui-ux-design`, `brandkit`, `design-motion-principles`) could fire if a spec touches UI, and gsd skills overlap heavily with apex-code's execution domain (both handle "build/execute/implement" signals). No harness-level gate prevents any of this.

---

## 10. Key Findings Summary

1. **Hook injection is correctly backend-branched** for the APEX banner and coding policy — DeepSeek gets a lean `$policy` block with no handoff injection. The other SessionStart hooks (gsd-session-state.sh, mode-stamp.js) are either silently inactive for APEX projects or unknown.

2. **Superpowers plugin injection is NOT backend-branched.** The `<EXTREMELY_IMPORTANT>` block with its mandatory-invocation directive lands in every session including DeepSeek coding sessions. This is the primary live injection risk.

3. **The `using-superpowers` "MUST invoke" directive is a live hijack risk** for DeepSeek's apex-code loop. CLAUDE.md's priority claim only partially mitigates it because CLAUDE.md does not explicitly prohibit superpowers skill invocations during apex-code builds, and DeepSeek as a literal executor may treat the absolute-MUST language as higher precedence than workflow prose.

4. **apex-orchestrate Step 5 correctly gates impl.md loading** in coding mode — it explicitly says "do NOT load whole impl.md files here — apex-code owns coding-side loading." This is the one solid firewall.

5. **Always-on baseline is approximately 15,500 tokens** before any spec or stack skill is loaded. This leaves meaningful headroom in a 200k context but represents non-trivial fixed overhead per coding session.

6. **No harness-level suppression** exists for planning-only or design-only skills in coding mode. Suppression relies entirely on model judgment about which skills are "relevant" — which is exactly what the 1% rule undermines.
