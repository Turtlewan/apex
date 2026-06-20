# Spec: Cap wave fan-out + compact at wave boundaries

**Identity:** Add a default parallel-worker fan-out cap (3–4) and a deliberate wave-boundary `/compact` to `apex-code`, addressing the launch-overhead half of main-context exhaustion on parallel builds. (status.md In-Flight "Context-exhaustion on parallel builds"; fix option **B**; complements `coding-return-contract-enforcement.md`.)

coder_tier: flash

## Files to Change

- `~/.claude/skills/apex-code/SKILL.md` — modify (frontmatter version + § Wave Analysis dispatch rule + a wave-boundary compaction note)
- `~/apex/SKILL-HISTORY.md` — modify (prepend one row)

## Assumptions

- `apex-code` SKILL § Wave Analysis owns the dispatch rule and currently has no fan-out cap. Verify: `grep -n "Dispatch rule:" ~/.claude/skills/apex-code/SKILL.md`. Impact if wrong: Stop.
- The spec frontmatter `worker_cap` field is the existing override knob (`apex-coder` already honours a passed `worker_cap`). Impact if wrong: Low (default still applies).
- Current version is `1.14.0`. Verify: `grep -n "^version:" ~/.claude/skills/apex-code/SKILL.md`. Impact if wrong: Caution (bump from whatever is current).

## Exact Changes

### Task 1 — `~/.claude/skills/apex-code/SKILL.md`: fan-out cap in the dispatch rule

**done when:** the dispatch rule caps parallel workers per wave at 3–4 by default (overridable by `worker_cap`) and splits over-cap waves into sequential sub-waves.

In **§ AFK Build Mode → Wave Analysis**, replace the `Dispatch rule:` block with:

```
   Dispatch rule:
   - **Fan-out cap (default 3–4):** dispatch at most 4 parallel workers per wave. If a wave has
     more independent tasks than the cap, split it into sub-waves of ≤4 and run the sub-waves
     sequentially (wait for each sub-wave before the next). The spec frontmatter `worker_cap`
     overrides the default (`worker_cap: null` = unlimited; a number = that cap). This bounds the
     launch overhead each parallel dispatch writes into the main context.
   - Wave with **2+ independent tasks** → spawn one code-worker agent per task up to the cap; dispatch the sub-wave in parallel; wait for all to complete before the next (sub-)wave
   - Wave with **1 task** → execute that task directly (no agent spawn)
   - All tasks sequential (every wave has exactly 1 task) → execute directly in order; no agents needed
   - **Multi-spec dispatch:** if the main session dispatches whole-spec `apex-coder` orchestrators in parallel, the same cap applies to those — at most 4 concurrent, remaining specs in the next batch.
```

### Task 2 — `~/.claude/skills/apex-code/SKILL.md`: wave-boundary compaction note

**done when:** the SKILL instructs a deliberate `/compact` at wave boundaries when main-context usage is high.

In **§ AFK Build Mode → During execution**, immediately after the line
`- After each wave completes: run the wave domain review (see § Wave domain review) before starting the next wave`
add:

```
- **Wave-boundary compaction:** after a wave's domain review completes and before the next wave,
  if main-context usage is high (≳70%), run a deliberate `/compact`. Durable state survives —
  spec ## Progress checkboxes, git, and docs/progress/{spec}.md — so the next wave reloads what
  it needs. Compact at this boundary, never mid-wave.
```

### Task 3 — `~/.claude/skills/apex-code/SKILL.md`: frontmatter bump

**done when:** version is `1.15.0` and `last_updated` is `2026-06-19`.

- Change `version: 1.14.0` → `version: 1.15.0`
- Change `last_updated: 2026-06-13` → `last_updated: 2026-06-19`

### Task 4 — `~/apex/SKILL-HISTORY.md`: log the change

**done when:** a new top row records this change.

Prepend one row under the header (newest-first):

```
| 2026-06-19 | apex-code | skills/apex-code/SKILL.md | 1.15.0 | updated (SKILL) | Default fan-out cap (3–4 parallel workers/wave, worker_cap override) + wave-boundary /compact — bounds launch-overhead context cost on parallel builds | — |
```

## Acceptance Criteria

1. Fan-out cap present → verify: `grep -q "Fan-out cap (default 3.4)" ~/.claude/skills/apex-code/SKILL.md`
2. worker_cap override documented → verify: `grep -q "worker_cap.*overrides the default" ~/.claude/skills/apex-code/SKILL.md`
3. Wave-boundary compaction present → verify: `grep -q "Wave-boundary compaction" ~/.claude/skills/apex-code/SKILL.md`
4. Version bumped → verify: `grep -q "^version: 1.15.0" ~/.claude/skills/apex-code/SKILL.md`
5. History row present → verify: `grep -q "Default fan-out cap" ~/apex/SKILL-HISTORY.md`

## Commands to Run

No build step. Run the five grep checks above; each must exit 0.
