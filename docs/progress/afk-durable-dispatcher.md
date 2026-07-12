Task 1 note (not a blocker, resolved same session): Codex's own self-verification of
`codex-dispatch.ps1` reported `status: blocked` on the "real fast Codex acceptance run" criterion
— a nested Codex-launching-Codex invocation (the wrapper, run from within Codex's own sandboxed
`apex-coder` subprocess, tries to launch ANOTHER `codex exec`) hit an HTTP 401 "missing bearer
authentication" error. This is a Codex-sandbox-specific auth-propagation artifact, not a wrapper
bug — the wrapper's real caller (the apex-code host, running unsandboxed) does not hit this.
Host-verified directly: ran `codex-dispatch.ps1` from the host against a real trivial codex
command — exit code 0, ledger row `wrapper-host-verify` → `done` in 7 seconds, log shows Codex
reading the prompt from stdin cleanly and returning a schema-valid completion. All 4 Task 1
acceptance criteria confirmed (ledger, stdin-close, watchdog via Codex's own fake-stall tests,
`-Adopt` via Codex's own test). Worth remembering for future wrapper-testing tasks: verify
subprocess-launching wrappers from the host directly, not by asking a sandboxed Codex subprocess
to nest-test itself — the same class of artifact bit the afk-permission-mode build's Task 6 too
(a nested `claude -p` session hit an EPERM from Codex's own `workspace-write` sandbox scope).
