# Spec: Validate the `dontAsk` classifier-SPOF mitigation (coding-mode probes)

**Identity:** Empirically validate that running the DeepSeek build path in `dontAsk` (apex-code 1.17.x) eliminates the permission-classifier ↔ DeepSeek SPOF, preserves the safety floor, and behaves as documented. Run on the **DeepSeek backend** so the result is representative (the SPOF only bites when the classifier is on DeepSeek). Background: `docs/changes/done/classifier-spof-dontask-mode.md`, [[classifier-gates-protected-path-edits]].

**Key insight:** validating "`dontAsk` makes no classifier call" *is* validating the SPOF fix — no classifier round-trip means nothing for a DeepSeek blip to break. You do **not** need to catch a live DeepSeek outage. The discriminating observable is the **error class**: a `dontAsk` denial is local ("not permitted" / "protected path"), and it will **never** say *"deepseek-v4-flash … cannot determine the safety"* (the auto-mode classifier message). That phrase appearing = classifier was invoked = FAIL.

---

## How to launch (Windows)

```powershell
coding-mode --permission-mode dontAsk
```

`coding-mode` sets the Flash DeepSeek env block and forwards `--permission-mode dontAsk` to `claude`
(verified: `& claude @ClaudeArgs`). `dontAsk` is **not** in the Shift+Tab cycle — it must be set at
launch like this; you cannot switch into it mid-session. (Pro tier: `apex-code --permission-mode dontAsk`.)

Then, in that session, tell the agent: **"run docs/changes/validate-dontask-spof.md"**.

## Pre-requisite — add the probe rules BEFORE launching

The probes need a scratch allowlist + one deny rule. **You must add these by hand before launch** —
`.claude/settings.local.json` is a protected path, so the `dontAsk` session itself cannot write it.
Add to `C:\users\user\apex\.claude\settings.local.json` (merge into existing `permissions`):

```json
{
  "permissions": {
    "allow": [
      "Write(C:\\users\\user\\apex\\docs\\probes\\**)",
      "Edit(C:\\users\\user\\apex\\docs\\probes\\**)",
      "Bash(echo:*)"
    ],
    "deny": [
      "Bash(rm:*)"
    ]
  }
}
```

Remove the `"Bash(rm:*)"` deny + scratch allows after the run if you don't want them permanent.

---

## Phase 1 — core mechanism (runnable in the APEX repo now)

Record every result in `docs/probes/dontask-results.md` (create it; it's allow-listed). For each probe
write: the action, the exact tool result/error text, and PASS/FAIL.

### Probe A — protected-path denial + no-classifier (the key discriminator)
1. Attempt: `Write` to `C:\Users\User\.claude\scratch-probe.txt` (a protected path), even though `Write(*)`
   may be broadly allowed.
2. **Expected (PASS):** denied outright; the message is a local permission/protected-path denial.
3. **FAIL signal:** the message contains *"cannot determine the safety"* or *"deepseek-v4-flash is
   temporarily unavailable"* — that means the classifier was invoked (SPOF still present).
→ Proves: `dontAsk` does not call the classifier (claim 1) + protected-path denial (claim 5).

### Probe B — allow-listed write succeeds with no classifier
1. Attempt: `Write` "probe-b ok" to `docs/probes/scratch/b.txt`.
2. **Expected (PASS):** write succeeds immediately, no permission prompt, no "cannot determine safety",
   no perceptible classifier round-trip.
→ Proves: allow-listed actions run without the classifier (claim 1, positive case).

### Probe C — `permissions.deny` floor holds in `dontAsk`
1. Attempt: `Bash` `rm docs/probes/scratch/b.txt` (matches the `Bash(rm:*)` deny rule).
2. **Expected (PASS):** denied (deny rules apply in every mode, `dontAsk` included).
→ Proves: the destructive floor survives (claim 6).

### Probe D — off-list action is silently denied, not prompted/hung
1. Attempt: `Bash` `node -e "console.log(1)"` (NOT in `permissions.allow`, not read-only).
2. **Expected (PASS):** denied immediately with no prompt and no hang (in `dontAsk`, anything off-list
   is auto-denied).
→ Proves: an incomplete allowlist fails *cleanly* (claim 3) — surfaces as a worker failure, never a
   silent hang or a classifier stall.

**Phase 1 gate:** all four PASS ⇒ the SPOF is structurally eliminated on this path and the safety floor
is intact. (Probe A is the single most important result.)

---

## Phase 2 — real build (needs a stacked project; APEX itself is markdown-only)

Run these in a project that has `stack_skills` bound + a Verification Recipe (e.g. a small Python/Node
project). Pick any tiny ready spec, or scaffold a one-file one.

### Probe E — allowlist completeness vs the stack recipe (the real operational risk)
1. Take the bound stack's Verification Recipe commands (check / typecheck / lint / test / build) and add
   them to `permissions.allow` as `Bash(<command>:*)` rules (note the `:*` to admit arguments).
2. Run the recipe in the `dontAsk` session.
3. **Watch for:** a recipe command that is **denied** because its real invocation (variable args, e.g.
   `pytest tests/x.py`, `tsc -p .`) doesn't match the allow rule.
→ Tells you whether exact-string rules suffice or you need **prefix/pattern** rules (`Bash(pytest:*)`),
   and how to author the build's allowlist. **Log any command that needed a pattern rule.**

### Probe F — the end-to-end proving run (`wave_dispatch: workflow`)
1. Build a small ready spec with `wave_dispatch: workflow`, launched via `coding-mode --permission-mode dontAsk`,
   allowlist = spec `## Permissions` ∪ the stack recipe rules from Probe E.
2. **Confirm:** (a) workers write project files + run verification with zero prompts and zero "cannot
   determine safety"; (b) the build completes; (c) **subagent/worker `dontAsk` inheritance** — workers
   are NOT silently elevated to a classifier-gated mode (the open unknown; the docs note auto-mode ignores
   a subagent's frontmatter `permissionMode`, so confirm `dontAsk` actually propagates).
→ Proves: a normal build works end-to-end under `dontAsk` (claim 2) + the subagent path is safe.

---

## Acceptance criteria

| # | Check | Pass condition |
|---|-------|----------------|
| 1 | Probe A | Protected-path write denied; **no** "cannot determine the safety" text |
| 2 | Probe B | Allow-listed write succeeds, no prompt/classifier |
| 3 | Probe C | `rm` denied by the deny rule |
| 4 | Probe D | Off-list `node -e` denied immediately, no hang |
| 5 | Probe E | Every recipe command either runs or is logged with the pattern rule it needed |
| 6 | Probe F | Workflow build completes, workers honor `dontAsk`, no classifier message anywhere |

## Commands to run (inside the `dontAsk` session)

```bash
# confirm the backend + mode the session is actually in
echo "$ANTHROPIC_BASE_URL"          # expect https://api.deepseek.com/anthropic
# probes are tool-call attempts (Write/Bash) per the tasks above, not shell one-liners
```

## Notes
- Phase 1 needs no stacked project — run it in the APEX repo immediately. Phase 2 is the `coding-session`-gated real build.
- After the run: move this spec to `done/`, and fold any Probe E/F findings (pattern-rule requirement, subagent inheritance result) back into `apex-code` step 1a if they change the guidance.
- If Probe A ever shows "cannot determine the safety", STOP — the mitigation isn't holding and the launch mode/flag needs re-checking before relying on `dontAsk` for real builds.
