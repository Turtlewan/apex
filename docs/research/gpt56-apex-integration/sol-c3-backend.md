## Cluster verdict

This cluster contains useful domain invariants, but its Codex-facing layer is too broad, repetitive, and absolute. GPT-5.6 already performs routine hygiene such as boundary validation, correct HTTP statuses, pagination, and non-silent error handling; repeating these across dispatches consumes attention without improving output. Keep only task-relevant hazards, repo-bound decisions, and executable acceptance checks. Opus should retain the decision tables, Sol should challenge unsupported absolutes and contradictions, Sonnet should bind decisions to repository facts, and Terra should receive a compact implementation contract.

## Per-skill findings

### apex-backend

- [CUT] Remove generic hygiene such as correct 4xx/5xx statuses, validation, service separation, and “never swallow errors” from Codex dispatches; GPT-5.6 handles these by default. Keep them as planning review criteria only. (`impl.md` § NEVER do, § ALWAYS do)
- [RESHAPE] “No raw SQL,” “every multi-table operation uses a transaction,” and “never return a whole model” are overbroad and conflict with search/reporting or deliberate isolation choices. Replace them with task-specific query, transaction-boundary, and response-schema requirements. (`SKILL.md` § Review checklist; `impl.md` § NEVER do, § Acceptance checks)
- [MISSING] Dispatch needs the exact route contract, existing error envelope, auth middleware, transaction/isolation expectations, idempotency semantics, downstream timeout policy, and runnable route/integration-test commands.

### apex-data

- [KEEP] Preserve expand/contract sequencing, immutable committed migrations, compatibility across mixed-version deployments, and explicit rollback/backfill behavior; these materially change implementation. (`SKILL.md` § Migration safety rules; `impl.md` § NEVER do)
- [RESHAPE] Do not require indexes for every foreign key or every filtered/sorted column. Require indexes justified by named query patterns and verified plans; specify column order, selectivity, table size, and write-cost trade-offs. (`impl.md` § ALWAYS do)
- [CLAUDE-IDIOM] References to a universal `docs/technical/architecture/data-model.md` and “the bound stack skill’s Verification Recipe” assume host context Terra does not possess. Sonnet must resolve these to real repository paths and commands before dispatch. (`SKILL.md` § Questions to ask; `impl.md` introduction)

### apex-auth

- [KEEP] Retain authorization-source rules, generic credential-recovery responses, secure token storage, token rotation/reuse handling when applicable, and explicit 401/403 tests. These are consequential and easy to miss in a local change. (`impl.md` § NEVER do, § Acceptance checks)
- [RESHAPE] “Tenant ID from session only” should become “derive authorized tenant scope from trusted server state and verify membership.” Routes may legitimately identify a tenant in the URL; the vulnerability is trusting it without authorization. (`SKILL.md` § Cross-tenant prevention; `impl.md` § ALWAYS do)
- [RESHAPE] Strictly rejecting every non-increasing WebAuthn counter is unsafe guidance for multi-device credentials whose counters may remain zero. Delegate verification semantics to the selected WebAuthn library/spec and define the project’s risk response. Also reconcile conflicting refresh-token limits across auth and security files. (`SKILL.md` § Counter verification, § Session vs JWT decision table; `impl.md` § ALWAYS do)
- [MISSING] Specs must state the existing auth library and version, session/JWT topology, cookie domain and CSRF model, tenant-resolution rule, provider callbacks, trusted-proxy setup, and concrete attack-path tests.

### apex-security

- [CUT] Remove repeated generic secure-coding reminders from every Terra prompt: parameterized queries, no hardcoded secrets, server-side validation, CSPRNGs, and generic 5xx responses are native GPT-5.6 behavior. (`impl.md` § NEVER do, § ALWAYS do)
- [RESHAPE] Fixed bcrypt cost, token lifetimes, rate limits, mandatory headers, and “all new routes have auth” are policy defaults, not invariants. Opus must decide them from threat model and deployment context; Terra should receive only the selected values and public-route exceptions. (`SKILL.md` § Review checklist; `impl.md` § Acceptance checks)
- [KEEP] Include only risk-specific constraints triggered by the task: object-level authorization, fail-closed behavior, unsafe deserialization, constant-time secret comparison, workflow injection, or dependency provenance. (`SKILL.md` § Beyond-OWASP patterns, § AI/LLM-specific security)
- [CLAUDE-IDIOM] The prescribed Claude security-review action and named MCP/tool workflow are ecosystem preferences, not Codex instructions. Keep them in orchestration/CI policy unless those tools are actually available. (`SKILL.md` § Automated security review)

### apex-jobs

- [KEEP] Idempotency, observable terminal failure, graceful lease/shutdown handling, and duplicate-delivery acceptance tests are valuable Codex constraints. (`impl.md` § ALWAYS do, § Acceptance checks)
- [RESHAPE] Separate processes, durable queues, retries, exponential backoff, stable IDs, and DLQs are not universal. Serverless schedulers, transactional outboxes, in-process noncritical tasks, and non-retryable failures require different designs. Make the selected delivery and retry policy explicit in the spec. (`SKILL.md` § Hard blocks; `impl.md` § NEVER do)
- [MISSING] Supply delivery guarantees, idempotency key/effect boundary, retryable-error taxonomy, attempts/backoff/jitter, timeout, concurrency, lease/visibility duration, retention, shutdown deadline, and a deterministic worker test command.

### apex-realtime

- [RESHAPE] Do not encode SSE as a dated universal default or require `user:{userId}` rooms and named events for every system. The plan should choose transport and subscription scope from direction, browser/API constraints, fan-out, ordering, and deployment topology. (`SKILL.md` § Protocol decision table, § Room/channel architecture; `impl.md` § ALWAYS do)
- [KEEP] Retain authenticated connection establishment, server-verified authorization of subscriptions, scoped fan-out, clean cancellation, and reconnect/resume verification. (`impl.md` § NEVER do, § Acceptance checks)
- [RESHAPE] Replace “send missed events on reconnect” with a specified recovery model: snapshot refetch, cursor/resume token, bounded replay, or explicitly lossy updates. Also remove “never polling”; polling can be the correct reliability/cost choice. (`SKILL.md` § Reconnection and resilience, § Hard blocks)
- [MISSING] Define event schema/versioning, ordering and deduplication, backpressure, heartbeat/idle timeout, proxy buffering, cancellation propagation, authorization per channel, and multi-instance test topology.

### apex-storage

- [KEEP] Preserve authorization before access, opaque server-generated identifiers, resolved-path containment for local files, bounded streaming, and compensating cleanup for partial failures. (`SKILL.md` § Hard blocks; `impl.md` § NEVER do)
- [RESHAPE] Magic-byte detection is evidence, not complete safety; `Content-Length` is untrusted, and presigned direct uploads bypass inline application validation. Require streamed byte limits, allowlists, checksum verification, quarantine/scanning when warranted, and post-upload validation before publication. (`SKILL.md` § File validation rules, § Upload strategy decision table)
- [RESHAPE] Store-first, mandatory DB metadata, soft-delete-first, async deletion, and presigned access are architecture choices rather than invariants. Opus should choose consistency and access models; Terra should receive the selected state machine and failure compensation. (`SKILL.md` § File metadata, § Deletion pattern; `impl.md` § ALWAYS do)
- [MISSING] State ownership/authz, maximum sizes, accepted types, checksum policy, malware posture, retention/legal deletion semantics, orphan reconciliation, and upload/download failure fixtures.

### apex-search

- [KEEP] Preserve embedding-dimension/model coupling, ingest idempotency, source attribution, and an executable retrieval-quality check. (`impl.md` § ALWAYS do, § Acceptance checks)
- [RESHAPE] Hybrid RRF, fixed overlap, chunk-before-embed, native vectors, and ANN indexes are not universal. Short documents may need no chunking; lexical-only search may win; exact search may be correct; overlap and fusion must be evaluated. (`SKILL.md` § Chunking strategies, § Hard blocks; `impl.md` § NEVER do)
- [CUT] Remove the dataset-free “84% vs 62% precision” claim and fixed product/version recommendations from coding prompts. They encourage cargo-cult implementation and belong, if retained, in time-stamped planning research. (`SKILL.md` § Research findings, § Search type decision table)
- [MISSING] Require an evaluation corpus, relevance metric/target, tokenizer and normalization rules, embedding model/version/dimensions, re-embedding migration strategy, filters/tenant isolation, latency budget, and exact ingest/query verification commands. Do not require an index scan when the planner reasonably chooses a sequential scan on small fixtures.

### apex-performance

- [CUT] “Measure first,” avoid N+1, paginate large collections, and do not invent Web Vitals are already native GPT-5.6 behavior. Keep metric honesty in review policy, not every dispatch. (`SKILL.md` § Metric-Honesty Rule; `impl.md` § NEVER do)
- [RESHAPE] Index-every-column, cache-expensive-data, never-query-in-a-loop, and import-only-subsets are heuristics, not invariants. Require evidence from a named workload and allow the database, ORM, or bundler to justify alternatives. (`impl.md` § NEVER do, § ALWAYS do)
- [RESHAPE] Split frontend Web Vitals recipes from backend performance. Loading scheduling/font/image guidance for a database or API task dilutes Terra’s attention. (`impl.md` § Frontend sections)
- [MISSING] Provide the baseline command, representative dataset/load profile, environment, warmup and repetition method, percentile target, allowable regression, profiler/query-plan artifact, and before/after comparison contract.

### apex-observability

- [RESHAPE] Requiring `requestId` and `userId` in every entry, logging all external calls at INFO, and manually spanning operations over 100 ms will create noise and cardinality/privacy problems. Specify correlation fields by execution context, sampling, and event value. (`impl.md` § ALWAYS do)
- [RESHAPE] Automatic Sentry capture followed by rethrow can double-report when framework middleware also captures. Bind the task to the repository’s existing error boundary and define one ownership point. (`impl.md` § Sentry error capture)
- [KEEP] Retain explicit redaction, structured event names, trace propagation across external calls, and verification that unexpected failures remain observable. (`SKILL.md` § Review checklist; `impl.md` § Verification checklist)
- [MISSING] State the existing telemetry SDK/exporter, event and attribute schema, PII classification, metric-cardinality limits, sampling, retention, SLO/alert ownership, test exporter, and commands for verifying logs, metrics, and traces. MCP investigation guidance belongs outside a coding skill. (`SKILL.md` § MCP-powered observability tools)

## Codex-native recommendations

Create a small `.agents/skills/backend-domains/` tree with triggerable, stack-bound cards rather than copying these files. Each card should contain only:

- Preconditions and repository facts to inspect.
- Five to ten domain hazards that genuinely affect implementation.
- Required output/state transitions.
- Concrete verification commands and observable acceptance cases.
- A short “escalate instead of deciding” list.
- Optional stack-specific references loaded only when the repository actually uses that stack.

Keep provider comparisons, dated ecosystem research, product recommendations, architecture decision tables, and policy defaults in Opus planning material. Sol’s plan check should detect contradictions, unsupported universals, missing rollout/rollback paths, absent negative tests, and requirements that cannot be verified in the named environment.

Sonnet’s dispatch pack should resolve all abstractions before invoking Terra: exact files, existing conventions, chosen stack/library versions, selected policy values, forbidden scope, acceptance behavior, and commands to run. Do not send phrases such as “adapt to the bound stack,” “use the stack skill’s verifier,” or tool-specific Claude/MCP instructions.

For Terra, inject only the relevant card fragments plus the task contract. A strong dispatch ends with an output contract such as: implement within listed files, preserve unrelated changes, run named checks, report changed files and command results, and explicitly identify any acceptance criterion that could not be verified.