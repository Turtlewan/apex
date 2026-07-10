## Cluster verdict

The planning layer has useful decision gates, but the implementation cores should not be injected wholesale into Terra prompts: their tutorials, global checklists, and unconditional “ALWAYS” rules create anchoring and unnecessary scope. GPT-5.6 already supplies baseline engineering hygiene; it benefits more from resolved architectural decisions, repository-specific invariants, version constraints, and executable verification commands. Several examples are internally inconsistent, unsafe, or too version-sensitive to serve as canonical coder guidance. Preserve compact domain knowledge for Opus/Sol, while dispatching only task-relevant constraints to Terra.

## Per-skill findings

### apex-architecture

- [CLAUDE-IDIOM] `SKILL.md § Architecture Specialist — Planning Mode (Claude only)` and frontmatter `backend: claude` encode the current host rather than a role. Rename around “architecture decision support”; keep APEX-specific ownership such as `docs/technical/...` and `apex-data` out of Codex artifacts unless those paths exist in the target repo.
- [KEEP] `SKILL.md § Questions to ask`, `§ Monolith vs microservices`, and `§ ADR process` belong in the Opus planning and Sol review layers. Terra should receive only the resulting boundaries, dependency direction, compatibility obligations, and ADR requirement—not the deliberation.
- [MISSING] There is no `impl.md`. Add a small Codex-facing boundary contract: permitted dependency edges, ownership of tables/APIs, migration compatibility, files allowed to change, and the exact architecture/static-analysis tests.

### apex-system-design

- [RESHAPE] `impl.md § NEVER / ALWAYS` and `§ Verification checklist` over-apply controls: not every public endpoint needs identical rate limiting, every synchronous dependency a circuit breaker, or every mutating handler an idempotency-key store. Express each as conditional on retry behavior, exposure, failure budget, and the bound platform.
- [CUT] Remove the generic implementations in `impl.md § Rate limiting`, `§ Circuit breaker`, `§ Distributed lock`, and `§ Retry`. Terra knows these patterns, while the examples anchor defects: the “token bucket” is a non-atomic fixed window, retries classify no errors or deadlines, and “Redlock for single-instance” in `SKILL.md § Distributed locking` is misleading.
- [KEEP] Delivery semantics, idempotency boundary, cache invalidation, lock ownership/TTL, and partial-batch failure behavior genuinely alter implementations. Put their resolved values in the task acceptance criteria.
- [MISSING] Require retryable error classes, attempt/time budget, cancellation behavior, idempotency-key lifecycle and concurrency semantics, queue ordering/deduplication guarantees, and failure-injection verification.

### apex-aws

- [RESHAPE] `SKILL.md § Gotchas` and `impl.md § NEVER / ALWAYS` contain false absolutes. Lambda needs RDS Proxy based on concurrency/connection pressure; some IAM actions legitimately require `Resource: "*"`, not every bucket needs versioning/KMS, and fixed tag keys are organization policy—not AWS correctness.
- [KEEP] Preserve workload roles instead of static keys, GitHub OIDC trust scoping, S3 public-access blocking, private database placement, and DynamoDB access-pattern-first design. Add OIDC audience and environment/ref conditions alongside `sub` (`SKILL.md § Security`, `impl.md § GitHub Actions — OIDC`).
- [RESHAPE] Replace `impl.md § ALWAYS` advice to read secret values “at deploy time”; Terraform data reads can propagate values into state or generated definitions. Prefer runtime secret references and explicitly identify unavoidable state exposure.
- [MISSING] Every dispatch needs account/environment, region, partition, provider/CDK version, existing organizational controls, expected plan summary, cost/blast-radius constraints, and whether apply/deploy is forbidden.

### apex-iac

- [KEEP] `SKILL.md § Secrets in state` and the stable-identity guidance behind `impl.md § for_each over count` are behavior-changing. Also retain saved-plan application and destructive-change protection when the task actually touches critical state.
- [RESHAPE] `impl.md § Remote state backend + providers` must be versioned rather than canonical: backend locking mechanisms evolve, `~>` is a compatibility range rather than a pin, and `sensitive = true` does not remove a value from state. Never copy this block without checking the repository’s current tool/backend.
- [CUT] Keep OpenTofu-versus-Terraform licensing/tool selection in Opus/Sol planning (`SKILL.md § Terraform → OpenTofu`, `§ Tool selection`). The full module tree, daily commands, Pulumi example, and Ansible example add noise to a Terraform-specific Terra task.
- [MISSING] State ownership, bootstrap procedure, import/move plan, provider lockfile policy, expected creates/updates/replacements/destroys, permitted external reads, and exact `fmt`/`validate`/lint/plan commands must be supplied per task.

### apex-k8s

- [RESHAPE] `SKILL.md § Resource requests and limits` and `impl.md § ALWAYS` should not mandate CPU limits, liveness probes, HPA, PDB, native sidecars, or `runAsUser: 1000` universally. These depend on workload behavior, image UID, replica count, disruption policy, and cluster version.
- [KEEP] Retain immutable image references, non-root execution, dedicated service accounts, uncommitted secrets, least-privilege RBAC, and explicit readiness behavior (`impl.md § NEVER / ALWAYS`). Make Gateway API, ESO API, and native-sidecar requirements conditional on installed CRDs/controllers and Kubernetes version.
- [CUT] `impl.md § kubectl — daily commands` is generic and risks encouraging mutation despite the GitOps rule. Dispatch only approved diagnostic commands; never send production apply/sync commands unless execution is explicitly authorized.
- [MISSING] Supply cluster/API versions, installed CRDs, CNI/Gateway implementation, storage classes, namespace policy, and verification such as `helm lint`, `helm template`, schema validation, policy checks, and server-side dry-run where credentials permit.

### apex-devops

- [KEEP] The instruction to source build/test/lint commands from the bound stack (`SKILL.md § Stack assumptions`, `impl.md § Stack assumptions`) is exactly right. SHA-pinned actions, explicit permissions, OIDC, and secret exclusion also meaningfully constrain generated workflows.
- [RESHAPE] `impl.md § NEVER / ALWAYS` should require a non-root final runtime stage, not non-root build stages; multi-stage builds and Dockerfile `HEALTHCHECK` are not universally necessary. Non-secret configuration may be hardcoded deliberately, while reproducible base images require digests—not merely “exact” tags.
- [CUT] The generic Node Dockerfile and CI skeleton are unnecessary unless the repository matches them. Terra should inspect package scripts, lockfiles, existing actions, and deployment conventions instead.
- [MISSING] Specify runner OS/architecture, registry and artifact identity, cache policy, deployment target, migration ordering, environment gates, smoke-test command, rollback trigger, and a safe cleanup recipe for container verification.

### apex-devcontainer

- [CLAUDE-IDIOM] `SKILL.md § The ~/.claude mount challenge` and `impl.md` requirements for `ANTHROPIC_BASE_URL` are Claude-runtime configuration. A Codex variant needs an explicit decision about `~/.codex`, authentication, and repo-local `.agents/skills`; none should be mounted by default.
- [RESHAPE] `impl.md § NEVER / ALWAYS` should not always mount private SSH keys or dependency volumes, assume a `vscode` user, or require `updateRemoteUserUID`. Prefer agent forwarding/credential helpers and select mounts by host OS and threat model.
- [RESHAPE] The “complete” example weakens its own security posture with `SYS_PTRACE` and `seccomp=unconfined` (`impl.md § Complete AI-assisted devcontainer.json`). Remove both unless a debugger requirement explicitly justifies them.
- [MISSING] Define how declared secrets are provisioned, not merely described. Replace `echo $ANTHROPIC_API_KEY` in `impl.md § Verification checklist` with a non-printing presence check, and validate through the Dev Container CLI on the actual host/WSL path.

### apex-homelab

- [RESHAPE] `SKILL.md` combines Home Assistant, ESPHome, radio hardware, Proxmox, storage, networking, and backups. Split routing cards by subdomain so an ESPHome task does not expose Terra to unrelated product recommendations and infrastructure claims.
- [KEEP] Version-bound syntax removals, local-first operation, per-device credentials, persistent serial paths, and raw-port exposure prohibitions can prevent real failures (`SKILL.md § ESPHome`, `§ Security practices`; `impl.md § NEVER`).
- [RESHAPE] `impl.md § ALWAYS` should not universally set `reboot_timeout: 0s`, require long-lived tokens, or prescribe areas/labels. Bind these to device availability requirements, integration type, and existing HA conventions.
- [MISSING] The implementation layer omits the homelab-infrastructure half of the skill. Add separate Compose/backup/proxy validation packs, and require exact HA/ESPHome versions, board model, entity IDs, installed integrations, compile/check commands, and rollback/restore steps.

### apex-github

- [KEEP] The security/visibility gate before issue filing (`SKILL.md § Bug backlog → Issues`) and action-SHA/permissions rules (`impl.md § NEVER / ALWAYS`) are useful non-native policy. They belong in a GitHub-specific skill, not every coding dispatch.
- [RESHAPE] `SKILL.md § Repository setup checklist` and `impl.md § ALWAYS` impose organization choices as universal correctness: every repo does not need CODEOWNERS, a changelog, issue linkage, approval counts, or an issue per PR.
- [CLAUDE-IDIOM] Branch creation, issue filing, PR creation, merging, and release commands imply external authority. Terra must default to local edits only; Sonnet should state each authorized GitHub mutation explicitly.
- [MISSING] Provide repository visibility, default branch, merge policy, required check names, action-update policy, token permissions, and the output contract—local patch, commit, PR, issue, or release.

### apex-google

- [KEEP] Stable `sub` identity, server-side ID-token verification, minimum scopes, protected refresh-token storage, revocation handling, and keyless workload identity materially improve Google integrations (`SKILL.md § Token storage`, `impl.md § NEVER / ALWAYS`).
- [RESHAPE] `impl.md § ALWAYS` should not send `prompt=consent` on every authorization; use it when initially acquiring or deliberately re-acquiring a refresh token. `SKILL.md § Token storage` should not imply that a raw refresh token in an HttpOnly browser cookie is equivalent to server-side storage.
- [CUT] Load `references/nodejs-typescript.md` only for a matching Node task and only the relevant API operation. Generic Gmail/Calendar/Drive examples otherwise anchor unnecessary dependencies and scopes.
- [MISSING] Require client type, redirect URI/origin, issuer/audience/nonce checks, tenant/domain restrictions, exact operations and scopes, token-encryption/key-rotation design, quota/retry behavior, test accounts, and OAuth verification/data-deletion obligations.

## Codex-native recommendations

- Create small repo-local skills such as `.agents/skills/infra-aws`, `infra-iac`, `k8s-workload`, `github-workflow`, and `google-oauth`. Each should contain triggers, 5–10 conditional invariants, required task inputs, and executable verification—not tutorials or broad platform surveys.
- Keep decision matrices, scale gates, product selection, ADR policy, and fast-moving ecosystem comparisons in Opus planning skills. Give Sol a separate plan-audit pack that checks unresolved versions, failure semantics, destructive operations, security boundaries, verification completeness, and contradictions between domains.
- Have Sonnet build a dynamic dispatch capsule containing: resolved decisions; repository conventions; permitted files and external mutations; target platform/tool versions; task-specific hazards; exact acceptance commands; expected diff/plan; and required final report. Do not concatenate `impl.md` cores.
- Put extensive examples and operational command catalogs behind on-demand references. Delete duplicated baseline advice, model/backend labels, universal checklist items, and hardcoded product/version recommendations from Codex-facing artifacts.
- Use Terra `xhigh`/`max` for state migrations, IAM, production Kubernetes, auth, and destructive infrastructure changes; use lower effort for mechanical formatting or isolated manifest edits. Sol plan review should use `max` for cross-domain or high-blast-radius plans.