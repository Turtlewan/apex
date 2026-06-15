# Ponytail — Compare-and-Absorb Research

## Identity

- **URL:** https://github.com/DietrichGebert/ponytail
- **Commit SHA:** 1c420ad
- **License:** MIT (LICENSE file root)
- **What it actually is:** A multi-agent-host skill/plugin distribution that installs a "laziest senior dev" persona into AI coding agents, enforcing a 6-rung YAGNI ladder before any code is written to produce 80–94% fewer lines of code than a no-skill agent baseline.
- **CLONED:** yes
- **File count:** 105 files (including .git objects, assets, tests, benchmarks)

---

## Mechanism

Ponytail is a **prompt-injected behavioral ruleset**, not a linter, AST transform, or runtime tool. Its mechanism:

1. **SessionStart hook** (`hooks/ponytail-activate.js`) runs on every Claude Code session start. It reads `skills/ponytail/SKILL.md`, filters it to the active intensity level (lite/full/ultra), and injects the ruleset as hidden context via `process.stdout.write(context)`. Token cost per session: ~100 lines of markdown injected once at startup.

2. **UserPromptSubmit hook** (`hooks/ponytail-mode-tracker.js`) watches for `/ponytail [lite|full|ultra|off]` commands and writes a flag file (`~/.claude/.ponytail-active`) to persist mode across responses.

3. **The ladder** (in `skills/ponytail/SKILL.md`, lines 14–20 post-frontmatter): Before writing any code, stop at the first rung that holds: (1) Does this need to exist at all? (YAGNI) → (2) Stdlib does it? → (3) Native platform feature? → (4) Already-installed dependency? → (5) Can it be one line? → (6) Only then: the minimum that works.

4. **Skills** (`skills/ponytail/SKILL.md`, `skills/ponytail-review/SKILL.md`, `skills/ponytail-audit/SKILL.md`, `skills/ponytail-debt/SKILL.md`): slash-command-triggered review passes. `ponytail-review` outputs `L42: yagni: factory, one product. Inline.`-style findings with a `net: -N lines possible` score. `ponytail-audit` is repo-wide. `ponytail-debt` greps for `ponytail:` comments (the convention for marking deliberate shortcuts) and produces a ledger.

5. **`ponytail:` comment convention** (`skills/ponytail/SKILL.md`, Rules section): Intentional simplifications are marked `// ponytail: this exists` or with ceiling+upgrade-path: `# ponytail: global lock, per-account locks if throughput matters`. `ponytail-debt` harvests these into a ledger via `grep -rnE '(#|//) ?ponytail:'`.

6. **Multi-host portability** (`docs/agent-portability.md`): adapters exist for Claude Code (plugin + hooks), Codex, OpenCode, Cursor, Windsurf, Cline, Copilot, Gemini CLI, Kiro, Antigravity — but the core behavior is always the same `skills/` + `AGENTS.md`.

---

## Benchmarks (from `benchmarks/results/2026-06-12-caveman-vs-ponytail.md`)

5 tasks × 3 models (Haiku, Sonnet, Opus), 10 runs per cell, median reported. Ponytail v3 (compressed SKILL.md, 100 lines) vs caveman vs no-skill baseline:

- Code: 47 lines (ponytail) vs 117 (caveman) vs ~293 (baseline). 2.5× fewer than caveman, ~6× fewer than baseline.
- Tokens: 135.7k (ponytail) vs 138.4k (caveman) vs 161.9k (baseline). −2% vs caveman, −16% vs baseline.
- Wall time: 127s vs 136s vs 479s. −7% vs caveman, ~3.8× faster than baseline.
- Floor tax on trivial tasks: ~3.6k tokens vs baseline for the SKILL.md read; production sessions (hook-injected) don't pay it.

---

## Candidate Analysis

Every candidate is assessed against APEX's existing simplicity/LOC mechanisms:
- **CLAUDE.md §2 "Simplicity First"** — "minimum code that solves the problem; if you write 200 lines and it could be 50, rewrite it; would a senior engineer say this is overcomplicated?"
- **CLAUDE.md §3 "Surgical Changes"** — touch only what you must; remove orphans YOUR change created
- **apex-coding-principles** skill — §Surgical scope + §Scalability + naming/formatting/error-handling standards
- **apex-code Karpathy Pre-Flight** — prefers simpler implementations if AC still met; surgical scope lock
- **/simplify and /code-review slash skills** — review changed code for reuse/simplification/efficiency
- **apex-plan complexity-challenge gate** — runs before finalising any spec

---

### Candidate Table

| # | Candidate | File path | Dedup-vs-APEX | Token-cost | Verdict |
|---|-----------|-----------|---------------|------------|---------|
| 1 | **The 6-rung YAGNI ladder** — explicit ordered decision rungs before writing any code | `skills/ponytail/SKILL.md` lines 14–20 | **Partial.** APEX has "simplicity first" and Karpathy Pre-Flight but neither states a concrete ordered ladder (YAGNI → stdlib → native → installed dep → one-liner → minimum). The ladder is a more concrete, more actionable formulation than APEX's current prose. | Low (injected once at session start) | **ADOPT-with-guardrails** — distill the ladder (6 rungs, ~6 lines) into apex-coding-principles impl.md and apex-code Karpathy Pre-Flight; omit the ponytail-specific persona/framing. |
| 2 | **`ponytail:` comment convention** — marks deliberate shortcuts with ceiling + upgrade path inline | `skills/ponytail/SKILL.md` Rules section; `skills/ponytail-debt/SKILL.md` | **Novel.** APEX has no equivalent. Current APEX simplicity rules say "do less" but provide no mechanism to track *why* a shortcut was taken and *when* to revisit it. The comment convention is zero-overhead (just a comment) and survives git. | Low (zero runtime cost; just a code comment) | **ADOPT** — add `# apex: <ceiling>, <upgrade trigger>` or simply adopt `# ponytail:` verbatim as a convention in apex-coding-principles impl.md. No tooling needed initially. |
| 3 | **`/ponytail-review` skill** — over-engineering review of a diff with structured tags (delete/stdlib/native/yagni/shrink) + `net: -N lines` score | `skills/ponytail-review/SKILL.md` | **Partial.** APEX has `/simplify` and `/code-review` slash skills. But ponytail-review's tag taxonomy (delete/stdlib/native/yagni/shrink) and the `net: -N lines` score are more concrete than APEX's current simplify skill. The "if nothing to cut: Lean already. Ship." ending is a useful forcing function. | Low (on-demand slash command, no always-on cost) | **NOTE** — the tag taxonomy and `net: -N lines` score are worth absorbing into the existing `/simplify` skill description. Full adoption of a separate skill is redundant; the mechanism is the same. |
| 4 | **`/ponytail-debt` skill** — greps `ponytail:` comments into a ledger, flags markers with no upgrade path | `skills/ponytail-debt/SKILL.md` | **Novel.** APEX has no debt-tracking mechanism for deliberate simplifications. Only useful *if* candidate 2 (the comment convention) is adopted. | Low (on-demand; a grep command) | **NOTE** — adopt only if the comment convention (candidate 2) is adopted. The implementation is a single grep: `grep -rnE '(#|//) ?ponytail:' .`. Could be a one-liner in apex-coding-principles rather than a separate skill. |
| 5 | **SessionStart hook that injects the ruleset every session** | `hooks/ponytail-activate.js`; `hooks/hooks.json` | **Already-have.** APEX already has a SessionStart hook (apex-orchestrate). The *mechanism* of hook-injecting rules is already in use. The ponytail version adds Node.js + flag-file machinery for mode-switching that APEX doesn't need (APEX's mode is backend-determined, not command-switched). | Med — adds a Node.js subprocess per session start. **HIGH overhead for APEX** since APEX is a pure-Markdown system with no build step or Node runtime expected. | **REJECT** — the hook mechanism is already-have; the ponytail-specific Node.js machinery is incompatible with APEX's pure-Markdown, no-tooling charter. |
| 6 | **Multi-level intensity modes (lite/full/ultra)** | `skills/ponytail/SKILL.md` Intensity section; `hooks/ponytail-mode-tracker.js` | **Novel** but misfit. APEX routes by backend (planning vs coding), not by user-chosen intensity. Adding a per-session intensity dial would introduce state that conflicts with APEX's backend-gated workflow. | Med — requires mode persistence (flag file + hook). | **REJECT** — complexity not warranted; APEX's planning/coding split already gates intensity by backend. |
| 7 | **`/ponytail-audit` skill** — whole-repo over-engineering audit | `skills/ponytail-audit/SKILL.md` | **Partial.** APEX's `/code-review` can be directed at the whole repo, but ponytail-audit has the clearer "ranked findings, biggest cut first" output format and the explicit tag taxonomy. | Low (on-demand) | **NOTE** — the ranked-by-impact output format and "net: -N lines, -M deps" summary are worth absorbing into the apex-coding-principles impl.md or `/code-review` guidance. Full separate skill is redundant. |

---

## Usability in APEX

**APEX context:** Pure-Markdown skill system. No code, no npm, no build step. Planning mode runs on Windows (Anthropic backend). Coding mode runs on Mac Mini (DeepSeek backend). The harness is Claude Code.

| Mechanism | APEX-compatible? | Notes |
|-----------|-----------------|-------|
| The 6-rung ladder (prompt text) | Yes — fully | Pure Markdown; copy into impl.md and CLAUDE.md |
| `ponytail:` comment convention | Yes — fully | Just a code comment; language-agnostic |
| `ponytail-review`/`ponytail-audit` skill text | Yes — partially | Could inform updates to existing `/simplify` skill |
| Slash command `.toml` files | Yes — Claude Code reads these | But APEX already has the simplify/code-review commands |
| Node.js hooks (`hooks/*.js`) | No | APEX has no Node runtime; pure-Markdown charter |
| Multi-host adapters (Cursor, Windsurf, etc.) | Irrelevant | APEX is Claude Code only |
| Mode-switch flag file | No | Not compatible with APEX's backend-gated mode |

---

## Bottom Line

Ponytail is a well-engineered, well-benchmarked prompt-injection skill for reducing AI-generated code bloat. Most of its *mechanism* (the behavioral text in `SKILLS.md` + `AGENTS.md`) is directly portable to APEX's Markdown skill system.

**What to adopt:**
1. The 6-rung YAGNI ladder (pure text, ~6 lines) into `apex-coding-principles` impl.md as a pre-code checklist — this is more concrete than APEX's current "simplicity first" prose.
2. The `ponytail:` (or `apex:`) comment convention for marking deliberate shortcuts with ceiling + upgrade path — novel, zero-overhead, survives in git.

**What to note (partial absorb into existing skills):**
3. The tag taxonomy (delete/stdlib/native/yagni/shrink) + `net: -N lines` score into the `/simplify` skill description.

**What to reject:**
4. Node.js hooks, multi-level mode switching, and multi-host adapter machinery — all incompatible with APEX's pure-Markdown, no-tooling charter and backend-gated workflow.

Net: 2 ADOPTs (text-only, no tooling), 3 NOTEs (inform existing skill edits), 2 REJECTs (tooling/mode machinery). The ladder and comment convention are the high-value, low-cost extractions.
