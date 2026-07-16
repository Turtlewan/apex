# APEX v2 joint audit — Fable × Sol, agreed report

_2026-07-15. Method: two independent audits (Claude Fable 5 as planning host; Codex `gpt-5.6-sol`
dispatched read-only through the wrapper, review schema, tree-pinned at `38376d6`), then one
reconciliation round. Every finding below was verified against the files by at least one auditor
and accepted by both. Where the auditors initially disagreed, the resolution is recorded at the
bottom — no finding was averaged into vagueness._

**Joint verdict: BLOCK — 10 agreed BLOCK findings, 6 agreed FLAG clusters.**
The system's architecture is sound and its self-diagnosis is accurate; the risk is concentrated in
the gap between "named in status.md" and "mechanised", plus a handful of enforcement holes the
proving run did not reach.

---

## BLOCK — will bite a real build or session

### 1. The destructive-command guard does not cover the PowerShell tool
`settings.json:68` wires `destructive-command-guard.js` with matcher `Bash` only (the dispatch
guard next to it matches `Bash|PowerShell`), and the guard's own code rejects non-Bash tool names.
This is a Windows/PowerShell-primary system: the main command surface bypasses the hard-block hook
entirely. Same class as the ADR-038 "deleting a mode disarms everything conditioned on it" bug.
**Fix:** matcher → `Bash|PowerShell`; extend detection for PowerShell cmdlets and command carriers
(`Start-Process`, `Invoke-Command`, `iex`); test with real PreToolUse payloads for both tools.
_Found independently by both auditors._

### 2. apex-wave-reviewer runs with ALL tools
`~/.claude/agents/apex-wave-reviewer.md` has no `tools:` frontmatter → defaults to every tool,
including Edit/Write/Bash. Every other reviewer is `Read, Glob, Grep`, and the wrapper hard-forces
Codex reviewers to `read-only` for exactly this invariant ("a reviewer must not edit the tree it
judges"). **Fix:** one line — `tools: Read, Glob, Grep`; keep the prose no-edit rule as depth.

### 3. Critical-file confirmation is prose; the mechanism implements the weaker rule
Governance says critical files (migrations, auth, CI, lockfiles, hooks, permission settings,
secrets) always need confirmation and "an authorising spec does not settle it" — but apex-code
treats everything in a spec's `## Permissions` as pre-authorised, and the wrapper accepts any
`-Authorized` path into a non-interactive workspace-write dispatch. The stronger rule has no
mechanism. **Fix:** wrapper pre-flight pattern-matches `-Authorized` against the governance
critical list; match + AFK/dontAsk → refuse and park; match + attended → interactive confirmation
that spec text cannot satisfy.

### 4. The readiness gate is the next prose control to fail — build the validator
Ten model-self-checked checkboxes, structurally identical to "always dispatch through the wrapper"
(which failed 3× until the hook). Files-to-Change completeness alone has bitten 3×+ and later
surfaces as an expensive exit-65. **Fix:** deterministic validator (M3 as the core, extended):
every path named by tasks/criteria/permissions ∈ `## Files to Change`; no unresolved markers;
task↔criterion coverage; run at draft→changes **and again immediately before dispatch**.
Judgment items stay prose.

### 5. M2b (pre-dispatch baseline gate) unbuilt — and the built half is not portable
The wrapper never calls `apex-baseline-check.ps1`; a coder can still burn quota against a red base
it is forbidden to fix (recurred 2× per side). And the M2a check runs every recipe line through
`cmd.exe /c` (`apex-baseline-check.ps1:92`) while recipes are routinely bash (APEX's own AGENTS.md
uses `wc`, `grep`, `~` paths) — false-red on the system's own repo. Missing AGENTS.md or heading
returns **green** (`:40–57`): deleting/renaming AGENTS.md after hook install silently disarms the
gate. **Fix:** build M2b fail-closed (exit 72, evidence recorded); parse a declared code-fence
shell and execute with that shell; distinct `NO_RECIPE` result that hook, installer, and M2b treat
as fail-closed, with any bootstrap escape explicit; installer refuses a recipe-less repo.

### 6. The scope lock is optional by default, and part of it is dead wiring
`-Authorized` defaults empty → warning only, on the path already proven to fail as prose. And the
wrapper's snapshot call omits `-Authorized`, so the scope check's pre-authorized-dirty hazard
detection never arms. **Fix:** fail closed — require non-empty `-Authorized` for every
workspace-write build dispatch (read-only phases exempt); explicit `-ScopeUnlocked` escape,
mutually exclusive with `-Authorized`, reason recorded in the ledger; pass `-Authorized` into the
snapshot call now regardless.

### 7. Cross-family review structurally breaks exactly when the fallback fires
Codex quota exhaustion is what makes Opus build — and Codex is then also the unavailable reviewer,
while the always-on `apex-reviewer` is pinned `model: sonnet` (same family as the builder). The
global "cross-family, always" promise is unachievable on the fallback path. **Fix (agreed, no
third model family):** ledger records builder + reviewer family; refuse completion when they match
unless an attended human review of the pinned diff is recorded; AFK → park the task; reword
"always" to the achievable policy. Same-family automated review may remain advisory but cannot
satisfy the gate.

### 8. context-cap-guard is advisory while the docs call the caps "hook-enforced"
It is PostToolUse, fires after the oversized write landed, and always exits 0 — a stated guarantee
with no mechanism, the exact pattern this system spent session 71 unlearning. **Fix:** move the
deterministic projection (line counts / byte size) to a blocking PreToolUse gate; correct any
remaining "hook-enforced" claims to match what actually enforces.

### 9. The tree-pin covers one root; APEX changes span two trees
`tree-pin.ps1` fingerprints a single `-Worktree`; AGENTS.md itself says a change to APEX usually
touches both `~/apex` and `~/.claude`. A cross-tree review gate can return CLEAN while the
unpinned half moves — the stale-verdict bug the pin exists to prevent. **Fix:** multi-root pinning
(`-PinAlso` or a roots array) for cross-tree gates.

### 10. Round 8 never ran
The round-7 harness fixes (-Adopt rework, run-id-keyed gate evidence, contradiction handling, exit
normalisation, hook carriers) are new and unreviewed, in a codebase whose author-tested green has
been wrong seven rounds running. **Fix:** a bounded cross-family review of the round-7 diff —
including positive clean-build cases, PowerShell hook payloads, crash/adopt paths, and concurrent
worktrees — before the next build leans on `-Adopt` or the gates.

---

## FLAG — worthwhile, mostly cheap

### 11. One integrity sweep instead of many small rots (highest-leverage FLAG)
One read-only script, run at session start: resolve every cross-file pointer to a real target;
diff duplicated load-bearing constants (exit codes, model pins, caps, cross-family rule) against
their canonical homes; frontmatter `last_updated` vs `staleness_threshold`, cross-checked against
SKILL-HISTORY (to catch stale *metadata* separately from stale *content*). Block on safety/runtime
drift, warn on doc drift. This one mechanism closes status.md's P2 and today's crop:
`BACKEND-ROUTING.md` dangling from SKILLS.md; SKILLS.md claiming a `~/.claude/registry/` that
doesn't exist while CLAUDE.md says there is no registry; `apex-auth` pointers in apex-stack;
"detect mode" (ADR-038 residue) and the status.md-as-Verification-Recipe contradiction in
SKILLS.md; four skills over their staleness thresholds (deep-dive +12d, stack +5d, handoff +5d
metadata-only, debug +2d); DeepSeek allow-list leftovers and the removed write-guard still
referenced in settings.local.json; impl.md citing "37 domain impl.md cores".

### 12. Finish the ADR-036 purge — half the skill set never got the v2 pass
RED-probe (Iron Law, sandboxed) and cut to measured delta: **apex-debug** (largely model-native
methodology + a Sentry walkthrough), **apex-coding-principles/impl.md** (a 165-line universal
rulebook — the knowledge layer by another name, with some contextually-unsafe absolutes),
**apex-stack** (gut the dated domain catalogue to workflow-only: elicitation, AI-buildability
weighting, decision recording, writing the verify recipe; retrieve tech facts at decision time),
**apex-deep-dive** (instructs Firecrawl/Repomix — neither installed), **apex-handoff** (content is
current; dedupe the spec-lifecycle/In-Flight sections against apex-plan and the templates, fix the
stale frontmatter).

### 13. Dead hook still wired
`coding-git-status.ps1` gates on `ANTHROPIC_BASE_URL -match "deepseek"` → always no-ops since
ADR-038, yet runs on every UserPromptSubmit. Remove or redesign for the one-session model.

### 14. The latest handoff is re-injected every session with no drained marker
Contradicts apex-handoff's read-once contract and re-spends context indefinitely. Keep the
surfacing but only for the latest **undrained** handoff (consumed marker, or route the read
through apex-plan).

### 15. Legacy vocabulary and undefined template fields
apex-init's banner (`Mode: planning | Profile: balanced`) and the handoff template's `Mode:
coding` predate ADR-038; the spec template reads `coder_models` / auto `max_parallel_codex` from a
status.md whose template defines neither, while apex-code states a different default (3).
Centralise defaults in one place; add legacy-token checks to the §11 sweep.

### 16. Memory reconciliation backlog — corrected counts
Five memories (not six) are wholly retirable — `worktree-integration-git-technique` keeps its
still-prose git-mv/index-trap half. Dedupe the stdin-wedge pair. Move the remaining APEX-GENERIC
memories out of Artemis (the dir has grown 58 → 67 files since the report).

---

## What is genuinely good — keep, don't churn
The exit-code contract and "route on codes, not hunches" · "the harness writes into no tree it
might judge" + `Assert-NotInsideRepo` refusing parameter re-entry · evaluator independence as
three testable conditions · the known-limits doc as a genre (stated limits over false guarantees)
· the ADR-015 return contract · autonomy as "budget for unreviewed distance, not blast radius" ·
the ADR-036 test itself. This audit's own dispatches are evidence the rebuilt harness works: both
runs pinned, schema-constrained, read-only-forced, verdict-routed — and the round-1 dispatch
warning ("no -Authorized — scope lock is prose only") is finding #6 demonstrating itself.

## Where the auditors initially differed — and how it resolved
- **apex-stack:** Fable proposed refreshing the version pins; Sol argued ADR-036 demands gutting
  the catalogue to workflow-only. **Fable conceded** — refresh would preserve the anti-pattern.
- **baseline-check fail-open:** Fable defended exit-0-on-no-recipe as documented bootstrap
  ergonomics; Sol produced the failure scenario (post-install deletion of AGENTS.md silently
  disarms the commit gate, reading green). **Fable conceded** — fail closed, explicit escape.
- **Cross-family fallback remedy:** Sol's round-1 options included a third model family; Fable
  argued it adds a dependency/quota surface for a rare path. **Sol conceded** — human gate +
  ledger family check instead.
- **Corrections landed during reconciliation:** Sol corrected Fable's "apex-handoff 35d stale"
  (metadata rot, not content rot — SKILL-HISTORY shows v1.6.0 on 2026-07-13) and "6 retirable
  memories" (5; one is only partially mechanised). Fable escalated Sol's attention to the agents
  layer (finding 2) and hooks wiring (findings 1, 13), which Sol's round-1 file list didn't cover.
- **Severity moves in round 2:** tree-pin multi-root note → BLOCK (Sol); cap-guard → BLOCK
  (joint); dead hook stayed FLAG (advisory machinery, not a safety control).
- **Process note:** Sol declined to read `docs/status.md` under its dispatch scope lock both
  rounds; the status.md checks in this report are the planning host's direct verification, not
  jointly reproduced.

## Suggested execution order
1. One-line / one-matcher fixes now: #2 (wave-reviewer tools), #1 (matcher), #6's dead-wiring
   half (pass `-Authorized` to snapshot), #13 (unwire dead hook), SKILLS.md pointer repairs (#11 list).
2. The In-Flight work, upgraded by this audit: M2b with #5's shell + NO_RECIPE semantics; M3 as
   #4's validator.
3. #7 (family ledger + human gate) and #3 (critical-path pre-flight) — same wrapper pre-flight,
   build together.
4. #10 round 8, once 2–3 lands (review the current scripts, not a moving target).
5. The FLAG hygiene wave: #11 sweep script, then #12 RED-probe cuts, #14–16.
