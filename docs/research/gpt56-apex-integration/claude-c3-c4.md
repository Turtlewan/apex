# Claude-side review — C3 (backend/data) + C4 (architecture/infra)

Reviewer: Claude (host perspective). Scope: 20 skills, SKILL.md + impl.md (where present).
Companion review: GPT-5.6 Sol is reviewing the same files from the coder's perspective — not
duplicated here.

## Framing used throughout

Today: Claude host reads SKILL.md (planning) and impl.md (coding-mode rules), then **distills**
constraints into a `codex exec -m gpt-5.6-terra` dispatch prompt — Codex never reads the skill
files directly. So "coder-facing" below means "candidate content for a Codex dispatch pack /
future Codex-native skill file", not "currently reaches Codex verbatim" (nothing currently does).

---

## Cluster verdict — C3 (backend/data)

apex-backend, apex-data, apex-auth, apex-security, apex-jobs, apex-realtime, apex-storage,
apex-search, apex-performance, apex-observability.

**Overall: in good shape.** All ten already went through a "stack-neutral core + per-stack swap
table + deferred worked-example reference" refactor (labelled `SP5 de-coupling` in sources — a
historical codename, not a live process). None of the ten impl.md files contain hand-holding
pseudocode-only content, "the coder cannot judge X" language, or lockstep lead-the-coder-by-hand
scaffolding. Content quality is already close to what a frontier-coder dispatch pack would want:
NEVER/ALWAYS + stack-neutral acceptance checks + load-on-demand worked examples. The main findings
are about **who should hold this content next** (host vs. Codex-facing artifact), not about
rewriting it.

## Cluster verdict — C4 (architecture/infra)

apex-architecture (planning-only, no impl.md — correct, it's Claude-only per its own header),
apex-system-design, apex-aws, apex-iac, apex-k8s, apex-devops, apex-devcontainer, apex-homelab,
apex-github, apex-google.

**Overall: also in good shape, with more "operator judgment" content than C3** (orchestration
trade-off tables, scale-gates, cost traps) that is legitimately host/planning-side and should
NOT move to a Codex pack. The impl.md files carry a higher proportion of dated, fast-moving
platform facts (Kubernetes 1.35/1.36 removals, ESPHome 2026.1 API changes, OpenTofu vs Terraform
licensing) that are exactly the kind of content a frontier coder's training data may miss or get
stale on — these are the highest-value candidates for a Codex dispatch pack.

---

## Top 8–12 highest-impact findings

1. **[DEEPSEEK-RESIDUE, systemic]** Every impl.md in both clusters (18 files; apex-architecture
   has none) carries `backend: deepseek` in frontmatter. This is a stale label under ADR-027 —
   these files are read by the **Claude host**, not executed by a DeepSeek session. Cosmetically
   harmless (content itself is not deepseek-calibrated) but semantically wrong and worth a
   frontmatter sweep — e.g. rename to `backend: coding-mode` or drop the field, since "coder
   identity" is now a runtime dispatch choice (Codex primary / Opus fallback), not a skill-file
   axis.

2. **[MOVE-TO-CODER, high value]** The dated/fast-moving domain gotchas are the best Codex-pack
   candidates precisely because a frontier coder's training data can be stale on them:
   `apex-k8s` impl.md (ingress-nginx retired Mar 2026, ESO `v1beta1` removed ≥0.17, IPVS
   kube-proxy removed 1.36, cgroup v1 refused by kubelet 1.35), `apex-homelab` impl.md (ESPHome
   `api: password:` removed 2026.1, OTA SHA256 auth since 2026.5), `apex-iac` SKILL.md (Terraform
   BSL relicense → OpenTofu as OSS default). These should go into a Codex dispatch pack verbatim,
   not be re-derived by Claude each time.

3. **[MOVE-TO-CODER]** Every "Acceptance checks (stack-neutral)" / "Verification checklist"
   section with literal, mechanically-runnable commands is coder-facing today and Codex-facing
   tomorrow: `apex-devops` impl.md's grep-based checks (`grep -rnE 'uses:.*@v[0-9]'`, `docker
   inspect` health check), `apex-github` impl.md's `gh api .../protection` check, `apex-k8s`
   impl.md's "Common errors → fix" table. These require zero host judgment — hand them to Codex
   directly as the task's done-criteria rather than having Sonnet re-verify by hand.

4. **[SONNET-RISK]** Only **one** skill in both clusters codifies an explicit mid-build escalation
   list: `apex-security` impl.md's "Flag for planning-mode review" (new auth flow, permission-model
   change, new third-party auth/dependency, undocumented data storage). No equivalent codified
   trigger exists in `apex-aws`, `apex-iac`, or `apex-k8s` impl.md for "Codex's output here needs a
   human/planning bounce" (e.g. a new IAM trust policy, a `prevent_destroy` removal, a secrets-in-state
   output). Sonnet-as-orchestrator has clear NEVER/ALWAYS rules to check mechanically but no
   explicit escalation-severity table outside security — worth adding a lightweight BLOCK/FLAG
   convention to these impl.md files (mirroring apex-security's) so Sonnet doesn't have to invent
   judgment calls case-by-case.

5. **[DEAD-WEIGHT / bug]** `apex-system-design` impl.md's "NEVER do" list includes: *"Return a
   different error for 'user not found' vs 'wrong password' (user enumeration)"* — this is an
   `apex-auth` rule, misplaced/copy-pasted into the distributed-systems-pattern skill where it has
   no connection to idempotency/DLQ/circuit-breaker content around it. Low-cost fix: delete the
   line from apex-system-design (already correctly present in apex-auth).

6. **[OK, notable]** The "Worked examples (load on demand)" pattern (`apex-auth`, `apex-jobs`,
   `apex-realtime`, `apex-storage`, `apex-search`, `apex-google`, `apex-homelab`, `apex-k8s` all
   defer full code listings to `references/*.md`, loaded "only when the bound stack is X") is
   already a well-designed load-cost control, not residue — keep this pattern as the model for any
   new Codex-dispatch-pack split (host loads the invariants always; loads the worked example only
   when the stack matches).

7. **[MOVE-TO-CODER, borderline]** A handful of impl.md files still embed **complete, literal
   boilerplate** rather than a pointer: `apex-devcontainer` impl.md's full `devcontainer.json`
   (~80 lines), `apex-iac` impl.md's full GitHub Actions plan/apply workflow (~90 lines), `apex-github`
   impl.md's full CI + release workflow YAML. For a weak coder this was load-bearing (copy-paste
   correctness); for Codex (frontier) this is over-specification — the *invariants* (SHA-pin
   actions, OIDC, least-privilege permissions, named-volume for deps) are the coder-facing part,
   the full YAML is dead weight that could shrink to a diagram + the 4–5 non-obvious lines (e.g.
   the OIDC trust-policy `sub` condition, the `waitFor: postCreateCommand`). Not urgent, but a
   good trim target when building the Codex pack.

8. **[SONNET-RISK]** `apex-k8s` SKILL.md's "Orchestration options" table (weigh VM vs managed
   platform vs Kubernetes, "state the recommendation... let the user decide") is explicitly a
   **planning-time** judgment call, correctly placed in SKILL.md not impl.md. But under the
   proposed split (Sonnet orchestrates the build session), if a spec already commits to Kubernetes
   and Codex's output silently introduces a Deployment where a CronJob was scoped, Sonnet has no
   codified check to catch a workload-type drift mid-build — the "Workload type selection" table
   is descriptive, not a build-time gate. Consider promoting a subset of the workload-type table
   into impl.md's acceptance checks.

9. **[DEEPSEEK-RESIDUE, minor]** `sources:` fields across many impl.md files cite "SP5 de-coupling
   (stack-neutral core; illustration)" as a source — this is an internal refactor codename with no
   external meaning, functioning as a footprint of the DeepSeek-era rewrite rather than a real
   citation. Harmless but slightly odd to keep listing an internal process as a "source" alongside
   real docs (BullMQ Docs, OWASP, etc.) — candidate for cleanup whenever these files are next
   touched, not urgent on its own.

10. **[OK]** `apex-architecture` correctly has **no** impl.md (explicitly "Planning Mode
    (Claude only)" in its own H1) — not dead weight, this is by design since architecture-shape
    decisions (monolith vs microservices, ADR triggers) are pure planning judgment with nothing to
    enforce mid-build. Confirmed correct, no action needed.

11. **[MOVE-TO-CODER]** Domain gotcha tables that read almost like an API-changelog are ideal
    Codex-pack fodder because they're exactly the class of fact a model's training cutoff makes
    unreliable: `apex-jobs` (`maxRetriesPerRequest: null` mandatory for BullMQ Worker, QueueScheduler
    removed in v2+), `apex-search` (pgvector HNSW > IVFFlat below ~1M rows, sqlite-vec loads
    per-connection not per-DB), `apex-storage` (R2 needs `checksumCalculation: WHEN_REQUIRED` in
    newer SDK v3, MinIO `forcePathStyle` requirement). None of this needs host judgment — it's
    pure fact-injection into the dispatch prompt.

12. **[SONNET-RISK, low]** Across C3, the "Flag for planning-mode review (do not decide yourself)"
    pattern only appears in `apex-security` impl.md. Given the proposed split hands Sonnet
    responsibility for judgment calls previously implicit in "coding mode," it would be worth
    auditing whether Sonnet — not Codex — is meant to be the one enforcing that escalation list
    (today it's ambiguous which agent in the pipeline reads it, since Codex doesn't load skill
    files and it's not yet clear this list reaches Sonnet's dispatch-review step either).

---

## Per-skill notes (tagged)

### apex-backend
- [OK] impl.md is a clean stack-neutral NEVER/ALWAYS + acceptance-checks file; no residue found.
- [MOVE-TO-CODER] The Fastify+Prisma+Zod code block (lines 59–76) is a compact, single-purpose
  illustration — fine to keep verbatim in a Codex pack as "one stack's form."

### apex-data
- [OK] Same shape as apex-backend; migration-safety invariants (expand/contract, FK index) are
  cleanly separated from the Prisma-illustration schema block.
- [MOVE-TO-CODER] "Acceptance checks (stack-neutral)" section (4 bullets) — directly usable as
  Codex done-criteria.

### apex-auth
- [OK] SKILL.md's research-findings table (Better Auth v1.6.11, Lucia deprecated, Auth.js absorbed)
  is planning-side currency-checking — correctly not duplicated in impl.md.
  Load cost: SKILL.md is 320 lines (largest in C3) but almost all of it is planning-time decision
  tables (session-vs-JWT, multi-tenant schema, RBAC) — appropriately host-side, not dead weight.
- [MOVE-TO-CODER] impl.md's Hard-blocks-style NEVER list (argon2id, no localStorage tokens, no
  user-enumeration, WebAuthn counter check) is the clean coder-facing distillation already.
- [DEAD-WEIGHT, minor] impl.md § Stack assumptions repeats a swap table nearly identical to
  SKILL.md's — acceptable duplication (different altitude: SKILL.md picks the library, impl.md
  states the enforcement rule) but worth noting as the one place C3 duplicates most.

### apex-security
- [OK] The only skill in either cluster with an explicit "Flag for planning-mode review" escalation
  list (impl.md, bottom) — this is the template other C3/C4 skills lack (see finding #4/#12).
- [MOVE-TO-CODER] "AI/LLM-specific security" section in SKILL.md (prompt injection, tool poisoning,
  eval injection, RCE via deserialization) reads as coder-relevant NEVER-rules that currently live
  only in the planning-mode file — consider mirroring into impl.md's NEVER list since these are
  mechanically checkable (no `eval()`/`pickle.loads()`/`yaml.load()`).
- [OK] OWASP Top 10:2025 delta callout (A02 up to #2, A03 new supply-chain, A10 new exceptional-
  conditions, SSRF merged into A01) is current and useful; no staleness flag.

### apex-jobs
- [OK] Clean stack-neutral core; BullMQ specifics correctly deferred to `references/bullmq-typescript.md`.
- [MOVE-TO-CODER] Gotchas list (`maxRetriesPerRequest: null` mandatory, QueueScheduler removed,
  duplicate repeatable jobs on restart without stable jobId) — pure fact-injection candidates.

### apex-realtime
- [OK] The transport-selection-by-direction logic (SSE for server→client, WebSocket for
  bidirectional, WebRTC for voice) is planning-side judgment, correctly in SKILL.md.
- [MOVE-TO-CODER] Voice-pipeline latency budget (~600–900ms user-stops→first-audio breakdown) is a
  good fact to inject directly rather than have Codex estimate.
- [DEAD-WEIGHT, tiny] SKILL.md explicitly flags its own gap: "Per-stack wiring (LiveKit/Pipecat
  code) is a deferred references/voice-pipeline.md follow-up (not yet written)" — the reference
  doesn't exist yet; if voice work is ever dispatched, there's nothing to load. Not harmful, just
  worth remembering it's an open TODO, not a broken link to fix now.

### apex-storage
- [OK] The local-filesystem-vs-object-store inversion (private files served through the app,
  path-traversal containment) is called out clearly and consistently between SKILL.md and impl.md.
- [MOVE-TO-CODER] R2/MinIO/S3 SDK gotchas (forcePathStyle, R2 checksum flags, EU endpoint) are dated
  facts, good Codex-pack material.

### apex-search
- [OK] Hybrid RRF math (`1/(60+rank)`) and dimension-locking rule are the load-bearing invariants;
  well separated from the Postgres/pgvector illustration.
- [MOVE-TO-CODER] "Acceptance checks" section includes a literal `EXPLAIN ANALYZE` verification
  step — directly usable as a Codex-run check, not just a description.

### apex-performance
- [OK] "Metric-Honesty Rule" (never fabricate LCP/INP/CLS numbers without tool data) is a good
  guardrail against a known LLM failure mode — keep, and this is exactly the kind of rule Codex
  itself needs since it's the one who would otherwise assert a metric it can't have measured.
- [MOVE-TO-CODER] The INP scheduling-API code block (`scheduler.yield()`, `isInputPending()`,
  `scheduler.postTask()`) and the CLS font-fix CSS are 2025-current, dated API surface — good
  Codex-pack candidates since these are exactly the kind of "recent browser API" facts a coder
  model might not have internalized precisely.

### apex-observability
- [OK] Three-pillars framing (logs/metrics/traces) and no-PII rule are stable, low-residue content.
- [MOVE-TO-CODER] "MCP-powered observability tools" section (Sentry MCP, Grafana MCP, OpenTelemetry
  MCP) is really a Sonnet/host-side investigation aid (used when debugging live prod issues, not
  during a build task) — arguably belongs in a debugging/on-call context rather than the
  coding-mode impl.md; low priority to move.

### apex-architecture
- [OK] No impl.md — correct by design (see finding #10).

### apex-system-design
- [DEAD-WEIGHT / bug] See finding #5 — the misplaced user-enumeration NEVER-rule copied from
  apex-auth.
- [MOVE-TO-CODER] Idempotency-key SQL pattern, circuit-breaker (`opossum`) config, and DLQ
  batch-failure pattern are all clean, mechanical, and stack-illustrated — solid Codex-pack material.
- [OK] SKILL.md's "Scale assumptions — gate before applying" (don't reach for sharding/distributed
  locks without measured load) is a planning-time judgment call, correctly not in impl.md.

### apex-aws
- [MOVE-TO-CODER] impl.md's IAM/S3/DynamoDB/ECS Terraform+CDK patterns and the OIDC trust-policy
  JSON are exactly the kind of boilerplate-with-invariants that should anchor a Codex pack.
- [SONNET-RISK] No codified escalation list (see finding #4) — e.g. nothing tells Sonnet
  "if Codex's IAM policy uses a wildcard resource, that's a BLOCK, not a FLAG-and-continue."
  SKILL.md's review checklist is thorough but written for a human/planning reviewer, not phrased
  as build-time severity.
- [OK] Cost-trap gotchas (NAT Gateway silent bill-inflator, VPC endpoints for S3/DynamoDB) are
  good host-side judgment content, correctly in SKILL.md not impl.md.

### apex-iac
- [MOVE-TO-CODER] impl.md's `prevent_destroy`/`for_each`-over-`count`/remote-state-backend patterns
  and the full plan-on-PR/apply-on-merge GitHub Actions workflow are strong Codex-pack material
  (see finding #7 for the "trim the full YAML" nuance).
- [OK] SKILL.md's Terraform→OpenTofu licensing explainer (BSL 1.1 non-OSI, OpenTofu MPL-2.0 fork)
  is current and correctly host-side (a one-time tool-selection decision, not a per-task rule).
- [SONNET-RISK] "Secrets in state — the most underestimated IaC risk" section states the rule
  clearly (never output secrets) but there's no codified build-time check for Sonnet to run
  against Codex's Terraform output (e.g. grep for `output` blocks referencing sensitive resources)
  — the NEVER list says it, but nothing operationalizes catching a violation post-hoc.

### apex-k8s
- [MOVE-TO-CODER, high value] The 2026-dated platform facts (ingress-nginx retired, ESO v1beta1
  removed, IPVS kube-proxy removed 1.36, cgroup v1 refused 1.35, native sidecar GA 1.33, in-place
  resize GA 1.35, DRA GA 1.34) are the single richest set of "frontier-coder-training-cutoff-risk"
  facts found in either cluster — prioritize these for the Codex pack.
- [OK] "Orchestration options — weigh before choosing Kubernetes" table is correctly host-side
  planning judgment (see finding #8 for the mid-build drift-detection gap).
- [MOVE-TO-CODER] impl.md's "Common errors → fix" table (CrashLoopBackOff, OOMKilled, Pending,
  ImagePullBackOff, ESO sync failure) is a ready-made Codex debugging aid.

### apex-devops
- [MOVE-TO-CODER] impl.md's verification checklist already writes each check as a literal shell
  command with an explicit pass/fail condition (e.g. `grep -rnE 'uses:.*@v[0-9]' .github/workflows/`
  → any match = fail) — this is the most "Codex-pack-ready" checklist format found in the whole
  review; use it as the template for other skills' verification sections.
- [OK] Stack-assumption note ("CI build/test steps come from the bound stack's Verification
  Recipe... never default to npm for a non-JS stack") correctly defers to apex-code's stack-binding
  mechanism rather than hardcoding.

### apex-devcontainer
- [MOVE-TO-CODER, trim candidate] Full `devcontainer.json` + Dockerfile + Compose listing (impl.md)
  — see finding #7. The invariants (non-root `vscode` user, `secrets:` property not `containerEnv`,
  named volume for deps, `updateRemoteUserUID`) are the coder-facing core; the ~130-line JSON
  listing is convenience boilerplate, less essential for a frontier coder.
- [OK] The `~/.claude` copy-on-start pattern (mount read-only as `-host`, `postCreateCommand` copies
  to writable) is a genuinely non-obvious project-specific gotcha, correctly kept verbatim.

### apex-homelab
- [MOVE-TO-CODER, high value] ESPHome/HA dated facts (API password auth removed 2026.1, OTA SHA256
  since 2026.5, ESP-IDF default since 2026.1, HA 2025.12+ plural `triggers:`/`conditions:`/`actions:`
  syntax) — second-richest set of training-cutoff-risk facts after apex-k8s.
- [OK] Host-strategy-by-scale table (bare-metal → Compose → Proxmox → cluster) is well-reasoned
  planning-side judgment, correctly not in impl.md.
- [DEAD-WEIGHT, tiny] SKILL.md references `references/homelab-infra.md` for "worked infra snippets"
  — not verified to exist in this review (not read); if missing, same open-TODO note as apex-realtime's
  voice-pipeline reference.

### apex-github
- [MOVE-TO-CODER] impl.md's SHA-pinned Actions workflow + verification checklist (with literal
  `gh api` / `grep` checks) is Codex-pack-ready, mirroring apex-devops's quality.
- [OK] The bug-routing decision (fixed-with-test → no issue; known-unfixed → GitHub Issue; security
  bugs → private advisory only, gated on `gh repo view --json visibility`) is a well-specified,
  non-obvious workflow rule — correctly detailed, not residue.
- [MOVE-TO-CODER, borderline] Full CI + Release workflow YAML (impl.md) — same trim candidate as
  apex-iac/apex-devcontainer (finding #7).

### apex-google
- [OK] Clean split: OAuth/scopes/token-storage rules (stack-neutral, SKILL.md) vs. client-library
  swap (impl.md § Stack assumptions) — no residue.
- [MOVE-TO-CODER] The `sub`-not-`email` primary-key rule, `invalid_grant` handling, and the
  three OAuth architecture patterns (user-delegated / service-account / domain-wide-delegation)
  are exactly the shape of coder-facing invariant + code pattern that transfers cleanly.
- [OK] Google-verification-timeline warning (4–8 weeks for sensitive/restricted scopes) is planning
  judgment, correctly host-side only.

---

## Summary of what to do next (if this review is acted on)

- Sweep `backend: deepseek` frontmatter across the 18 impl.md files reviewed (finding #1) —
  mechanical, low-risk, does not touch content.
- When building the Codex dispatch-pack format, prioritize the dated/fast-moving fact tables
  (apex-k8s, apex-homelab, apex-iac licensing, apex-search/apex-storage SDK gotchas) over the
  boilerplate code blocks — the facts are irreplaceable, the boilerplate a frontier coder can
  likely reproduce correctly on its own.
- Fix the apex-system-design/apex-auth misplaced rule (finding #5) — a 1-line edit.
- Decide whether Sonnet-as-orchestrator gets a codified BLOCK/FLAG escalation convention modeled
  on apex-security's, extended to apex-aws/apex-iac/apex-k8s (findings #4, #8, #12) — this is the
  one open design question this review surfaces rather than a mechanical fix.
