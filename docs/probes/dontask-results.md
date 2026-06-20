# dontAsk Validation Results

**Date:** 2026-06-20
**Backend:** DeepSeek (deepseek-v4-flash)
**Permission mode:** dontAsk
**Session:** Main CODING session

---

## Phase 1 — Core Mechanism

All four probes PASS. The SPOF is structurally eliminated on this path, and the safety floor is intact.

### Probe A — Protected-path denial + no classifier (key discriminator)
- **Action:** `Write` to `C:\Users\User\.claude\scratch-probe.txt`
- **Result:** `"Permission to use Write has been denied because Claude Code is running in don't ask mode."`
- **Verdict: ✅ PASS**
- **Evidence:** Denied with local `dontAsk` message. NO "cannot determine the safety" or "deepseek-v4-flash is temporarily unavailable" appeared. The classifier was NOT invoked.

### Probe B — Allow-listed write succeeds with no classifier
- **Action:** `Write` "probe-b ok" to `docs/probes/scratch/b.txt`
- **Result:** `"File created successfully at: ...docs/probes/scratch/b.txt"`
- **Verdict: ✅ PASS**
- **Evidence:** Write succeeded immediately. No permission prompt, no "cannot determine safety", no perceptible classifier round-trip.

### Probe C — `permissions.deny` floor holds in `dontAsk`
- **Action:** `Bash` `rm docs/probes/scratch/b.txt`
- **Result:** `"Permission to use Bash with command rm docs/probes/scratch/b.txt has been denied."`
- **Verdict: ✅ PASS**
- **Evidence:** Denied by the deny rule. No classifier message, no hang. The destructive floor survives.

### Probe D — Off-list action silently denied, not prompted/hung
- **Action:** `Bash` `node -e "console.log(1)"`
- **Result:** `"Permission to use Bash has been denied because Claude Code is running in don't ask mode."`
- **Verdict: ✅ PASS**
- **Evidence:** Denied immediately with no prompt and no hang. An incomplete allowlist fails cleanly.

---

## Operational Findings

### Cleanup blocked in `dontAsk` mode
After Phase 1, the spec requires removing the `"deny": ["Bash(rm *)"]` block and the probe-specific scratch allows from `settings.local.json`. However, `.claude/settings.local.json` is NOT in the probe's allowlist — so `Edit` on that path is denied in `dontAsk` mode.

**Implication:** Post-probe cleanup must be done:
1. Before entering `dontAsk` mode (pre-arrange the cleanup), or
2. In a separate non-`dontAsk` session, or
3. By including the settings path in the allowlist explicitly.

The `Bash(rm *)` deny rule remains active across all sessions (including planning) until manually removed.

### Setting edits in `dontAsk`
The `Edit` tool on non-probe paths is not allow-listed and is auto-denied. This prevents mid-session cleanup, which is correct security behavior but means cleanup IS a pre/post-session concern.

---

## Phase 2 — Real build (requires a stacked project)

Phase 2 probes E+F not run in this session. They require:
- A project with `stack_skills` bound + a Verification Recipe (e.g. a Python/Node project)
- Building with `wave_dispatch: workflow` under `dontAsk`
- Verifying subagent/worker `dontAsk` inheritance

Probe E/F are gated behind a `coding-session` project with actual build commands.
