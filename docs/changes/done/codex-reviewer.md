---
spec: codex-reviewer
status: ready
token_profile: balanced
autonomy_level: L2
---

# Spec: Codex (GPT-5.5) as an independent post-build reviewer

**Identity:** Wire OpenAI Codex in as a cross-family, advisory post-build code reviewer via headless
`codex exec`, realizing ADR-015's cross-model review on any host. → why: see docs/technical/adr/ADR-026-codex-third-model-family.md

## Assumptions
- ✅ VERIFIED (session 60): Codex CLI **installed** (`codex-cli 0.141.0`, npm-global, on PATH from both PowerShell and Git Bash). **Auth + `gpt-5.5` reachability still pending** (`codex login` + smoke test) → impact: **Stop** until auth confirmed; the review step no-ops without it (see ## Prerequisites).
- ✅ VERIFIED on v0.141.0: `codex exec` supports `-s/--sandbox`, `--json`, `--output-schema <FILE>`, `-m/--model`, `-o/--output-last-message`. Pin to this version line; re-check flags after a Codex upgrade (fast model/CLI churn).
- `codex exec` ignores `ANTHROPIC_BASE_URL` and uses its own `~/.codex` auth → impact: Caution (it's the independence guarantee; confirmed by research, verify on first run).
- Review is **advisory** — findings inform sign-off, never block the pipeline automatically → impact: Low.

Simplicity check: considered just using the GitHub `@codex review` bot instead of a CLI step — no: that only covers PR'd builds and needs the GitHub app; the headless CLI step works for every local build and is the general mechanism. PR-bot is a later optional complement, not this spec.

## Prerequisites
- **Codex CLI installed + on PATH + authed** (the `~/.codex` here has stale config but **no invocable
  binary** — a clean (re)install is required). Confirm: `codex --version`, `codex exec -m gpt-5.5 --sandbox read-only "reply OK"` returns.
- Resolve the `~/.codex` directory collision (a non-Codex tool currently writes goals/memories/logs
  there) — or point Codex at a clean `CODEX_HOME` — so its config/auth are trustworthy.

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| `C:/Users/User/.claude/settings.json` | modify | Add `Bash(codex exec:*)` to `permissions.allow` |
| `C:/Users/User/.claude/skills/apex-code/references/codex-review.md` | create | Review prompt template + output JSON schema + invocation recipe |
| `C:/Users/User/.claude/skills/apex-code/SKILL.md` | modify | Add `§ Codex independent review` dispatch step (gated, advisory) |
| `C:/Users/User/.claude/skills/apex-governance/SKILL.md` | modify | Sanction Codex as independent evaluator; advisory floor; per-spec gate; update `§ Cross-model review` |
| `C:/Users/User/.claude/skills/apex-orchestrate/templates/spec-template.md` | modify | Re-tag the `cross_model_review` comment: Codex-backed, host-agnostic (drop "Mac") |
| `C:/Users/User/apex/SKILLS.md` | modify | Note the new behaviour under apex-code/apex-governance |
| `C:/Users/User/apex/SKILL-HISTORY.md` | modify | Prepend rows (apex-code, apex-governance, template) |

## Tasks
- [ ] Task 1: Add `"Bash(codex exec:*)"` to `permissions.allow` in settings.json — files: `C:/Users/User/.claude/settings.json` — done when: the array contains the entry and the JSON still parses.
- [ ] Task 2: Create the Codex review artifact — files: `C:/Users/User/.claude/skills/apex-code/references/codex-review.md` — done when: the file contains (a) a JSON schema for findings `[{severity: BLOCK|FLAG|CLEAN, file, line, criterion, rationale}]`, (b) a reusable review prompt that takes the spec's acceptance criteria + the git diff, and (c) the exact `codex exec --sandbox read-only --json --output-schema … -m gpt-5.5 "…"` invocation.
- [ ] Task 3: Add `§ Codex independent review` to apex-code — files: `C:/Users/User/.claude/skills/apex-code/SKILL.md` — done when: a step fires when the spec sets `cross_model_review: true`, runs the Task-2 invocation against the post-build diff, parses findings, surfaces BLOCK/FLAG in the build report as advisory, and records a "skipped — codex unavailable" line if `codex --version` fails (no silent skip).
- [ ] Task 4: Sanction Codex in governance — files: `C:/Users/User/.claude/skills/apex-governance/SKILL.md` — done when: `§ Cross-model review` names Codex as a sanctioned independent evaluator family, states the advisory floor (findings never auto-block, no auto-fix), and the per-spec gate (reserve for high-risk).
- [ ] Task 5: Re-tag the spec template — files: `C:/Users/User/.claude/skills/apex-orchestrate/templates/spec-template.md` — done when: the `cross_model_review` comment no longer says "Mac" and states it runs via headless Codex on any host.
- [ ] Task 6: Triple-write index + history — files: `C:/Users/User/apex/SKILLS.md`, `C:/Users/User/apex/SKILL-HISTORY.md` — done when: SKILLS.md reflects the new review behaviour and SKILL-HISTORY.md has prepended `updated` rows for apex-code, apex-governance, and the template.

## Wave plan
Wave 1: [task 1, task 2, task 4, task 5] | Wave 2: [task 3] | Wave 3: [task 6]
<!-- Task 3 references the Task-2 artifact; Task 6 records all prior changes. -->

## Permissions
The following actions will run autonomously during build. Approving this spec approves all of them.

### File Operations
| Action | Paths |
|--------|-------|
| Create | `C:/Users/User/.claude/skills/apex-code/references/codex-review.md` |
| Modify | `C:/Users/User/.claude/settings.json`, `C:/Users/User/.claude/skills/apex-code/SKILL.md`, `C:/Users/User/.claude/skills/apex-governance/SKILL.md`, `C:/Users/User/.claude/skills/apex-orchestrate/templates/spec-template.md`, `C:/Users/User/apex/SKILLS.md`, `C:/Users/User/apex/SKILL-HISTORY.md` |
| Delete | (none) |

### Commands
| Command | Purpose |
|---------|---------|
| `codex --version` | Probe Codex availability (the dispatch step's guard) |
| `codex exec --sandbox read-only --json --output-schema <schema> -m gpt-5.5 "<review prompt>"` | The advisory review pass (runs only at build time on a `cross_model_review` spec, not during this build) |

### Git Operations
| Operation | Scope |
|-----------|-------|
| `git add` | the 7 files above, by name |
| `git commit` | "feat: Codex independent post-build reviewer (ADR-026 P1)" |

### Environment Access
| Variable | Purpose |
|----------|---------|
| (none new) | Codex uses its own `~/.codex` auth, not env |

### Network
| Action | Purpose |
|--------|---------|
| Codex API calls (via `codex exec`) | only at review time on gated specs, not during this build |

## Specialist Context
### Security
- Reviewer runs `--sandbox read-only` → cannot modify the tree. Advisory-only → no third-party model
  can block or mutate the pipeline. `Bash(codex exec:*)` is scoped to the `exec` subcommand (not full
  `codex`). Under `dontAsk` builds the allow-list entry is required (off-list = silent deny — sessions 54–57).
- ⚠️ Recommended gate before build: a dispatched `apex-spec-reviewer` security pass on this spec
  (external-process execution + permission surface).

### Performance
(none)

### Accessibility
(none — no UI)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| ADR | docs/technical/adr/ADR-026-codex-third-model-family.md | Written (this session) |
| Changelog | (n/a — APEX has no CHANGELOG) | — |
| History | SKILL-HISTORY.md | Add rows (Task 6) |

## Acceptance Criteria
- [ ] Allow-list entry present → verify: `grep "codex exec" settings.json` matches and `node -e "JSON.parse(require('fs').readFileSync('settings.json'))"` exits 0.
- [ ] Review artifact complete → verify: `codex-review.md` contains the schema, the prompt, and the exact invocation string.
- [ ] Dispatch step gated + fail-loud → verify: apex-code `§ Codex independent review` states it fires on `cross_model_review: true`, and logs "skipped — codex unavailable" (not silent) when `codex --version` fails.
- [ ] Governance sanction present → verify: apex-governance `§ Cross-model review` names Codex, the advisory floor, and the per-spec gate.
- [ ] Template re-tagged → verify: spec-template `cross_model_review` comment contains "Codex"/"any host" and not "Mac".
- [ ] Triple-write done → verify: SKILL-HISTORY.md top rows reference apex-code + apex-governance + template dated today.
- [ ] Live smoke (pilot, post-build) → verify: on a throwaway spec with `cross_model_review: true`, `codex exec … --json` returns schema-valid findings and apex-code surfaces them as advisory.

## Progress
_(Coding mode writes here — do not edit manually)_
