## Intent

apex-jobs guides background job queue implementation for apps running on persistent
servers (Mac Mini, Railway, AWS ECS/EC2). Covers BullMQ + Redis: queue setup, producers,
workers, retry/backoff strategies, cron/repeatable jobs, job chaining, dead letter queues,
graceful shutdown, monitoring dashboard, and horizontal scaling to AWS ElastiCache.
Distinct from apex-backend (HTTP request handling) — this skill answers: "how do I run
work outside the request/response cycle?"

## Research tasks (DeepSeek executes FIRST before writing any skill content)

Before writing SKILL.md or impl.md, research and verify the following. Tag findings
[VERIFIED], [ASSUMED], or [COMMUNITY]. Update any API examples or version references
in this spec based on findings.

1. **BullMQ current version and breaking changes** — v4/v5 had significant API changes
   from v1/v2 (QueueScheduler removed, Worker API changed). Verify current major version,
   whether QueueScheduler is still needed, and current Worker/Queue constructor signatures.
   Check docs.bullmq.io and npm for latest stable version.

2. **Bull Board current setup** — verify current package names (`@bull-board/api`,
   `@bull-board/express` or `@bull-board/fastify`), setup pattern, and version.
   Check github.com/felixmosh/bull-board.

3. **ioredis connection options for BullMQ** — verify current recommended connection
   pattern (connection object vs URL string), maxRetriesPerRequest: null requirement
   (BullMQ requires this), and cluster mode config for ElastiCache.

4. **BullMQ on AWS ElastiCache** — any known gotchas with ElastiCache Redis (cluster mode
   vs single node), TLS connection config, connection URL format.

5. **pg-boss current version** — as a Redis-free alternative (PostgreSQL-backed jobs).
   Verify current API: queue creation, work(), send(), schedule() patterns.
   Check github.com/timgit/pg-boss.

6. **BullMQ FlowProducer** — verify current API for job chaining/dependencies.
   Check if this is still the recommended pattern for dependent jobs.

Write a ## Research findings section at the top of the output SKILL.md summarising
each item in one line. Use findings to correct any API examples in impl.md.

## Key decisions

### SKILL.md content

**When to activate — trigger phrases:**
- "background job" / "job queue" / "worker"
- "async task" / "run this in the background"
- "cron job" / "scheduled task" / "run every X"
- "email queue" / "process uploads" / "bulk operation"
- "retry failed tasks" / "dead letter queue"
- "BullMQ" / "Bull" / "Redis queue"

**5 questions to ask before designing:**
1. What triggers the job? (user action / API event / cron schedule / another job completing)
2. What happens if the job fails? (retry silently / notify / move to dead letter queue)
3. How long can a job run? (seconds / minutes / unbounded — affects timeout and concurrency config)
4. Any CPU-intensive work that could block the event loop? (needs sandboxed processor)
5. Need a monitoring dashboard to inspect queues and retry failed jobs?

**Library decision table:**

| Scenario | Library | Why |
|----------|---------|-----|
| Persistent server (Mac Mini, Railway, ECS) | BullMQ + Redis | Battle-tested, feature-complete, horizontal scale |
| No Redis, already have PostgreSQL | pg-boss | PostgreSQL-backed, zero new infra |
| Serverless / Vercel | Inngest or Trigger.dev | No persistent worker needed (out of scope here) |

**Primary recommendation: BullMQ**
- Redis: Docker locally → AWS ElastiCache (single node) → ElastiCache Cluster at scale
- Workers run as a separate process (not inside the web server)
- Scale horizontally: more ECS tasks = more workers, all pointing at same Redis

**Core BullMQ concepts (explain each in SKILL.md):**
- **Queue** — named channel for jobs; producers add jobs here
- **Worker** — consumes jobs from a queue; runs in a separate process
- **Job** — unit of work with a name, data payload, and options
- **Repeatable job** — cron-scheduled job managed by BullMQ
- **FlowProducer** — chains jobs with parent/child dependencies
- **Dead letter queue** — failed jobs moved here after max retries exhausted

**Job options decision table:**

| Option | When to use | Example value |
|--------|------------|---------------|
| `attempts` | Any job that can fail transiently | 3–5 |
| `backoff` | Always pair with attempts | `{ type: 'exponential', delay: 2000 }` |
| `delay` | Schedule job for future execution | `5000` (ms) |
| `priority` | Time-sensitive jobs mixed with bulk | `1` (higher = more urgent) |
| `removeOnComplete` | High-volume queues (keep last N) | `{ count: 1000 }` |
| `removeOnFail` | Debugging mode (keep failed jobs) | `false` (default — keep them) |
| `timeout` | Long-running jobs with a time limit | `60000` (ms) |

**Cron / repeatable jobs:**
- Use BullMQ `repeat: { pattern: '0 * * * *' }` for cron expressions
- Use `repeat: { every: 60000 }` for interval-based (every 60 seconds)
- Always name repeatable jobs — use `jobId` to prevent duplicates on restart
- Remove stale repeatable jobs on deploy: call `queue.removeRepeatable()` for old patterns

**Dead letter queue pattern:**
- Create a separate `{queueName}:failed` queue
- In Worker's `failed` event listener: add failed job to the failed queue with full error context
- Allows manual inspection and replay without cluttering the main queue

**Graceful shutdown rule:**
Worker must call `worker.close()` on SIGTERM/SIGINT. Never kill the process mid-job.
BullMQ waits for the current job to finish before closing — configure `closeTimeout` for max wait.

**Hard blocks:**
- Never run workers inside the web server process (separate process only)
- Never use an in-memory queue in production (always Redis-backed)
- Never set unlimited retries without exponential backoff (runaway retry storm)
- Never silently catch job errors — always rethrow or the job won't be marked as failed
- Never add jobs without a `removeOnComplete` policy on high-volume queues (Redis memory bloat)

**Review checklist:**
- [ ] Worker runs in a separate process from the web server
- [ ] All jobs have `attempts` + exponential `backoff` configured
- [ ] Failed jobs are observable (Bull Board or failed queue)
- [ ] Repeatable jobs use named `jobId` to prevent duplicate registration
- [ ] Worker has SIGTERM handler calling `worker.close()`
- [ ] `removeOnComplete: { count: N }` set on high-volume queues
- [ ] Redis connection uses `maxRetriesPerRequest: null` (required by BullMQ)

**Frontmatter for SKILL.md (update from research):**
```yaml
skill: apex-jobs
backend: claude
version: 1.0.0
last_updated: 2026-05-28
sources:
  - BullMQ Docs — docs.bullmq.io
  - Bull Board — github.com/felixmosh/bull-board
  - pg-boss — github.com/timgit/pg-boss
  - AWS ElastiCache Redis — docs.aws.amazon.com
staleness_threshold: 30d
```

---

### impl.md content

**NEVER do:**
- Import Queue or Worker in the same entry file as your Express/Fastify server
- Use `new Redis()` without `maxRetriesPerRequest: null` — BullMQ requires it
- Swallow errors inside a job processor with an empty catch block
- Register repeatable jobs without checking if they already exist (causes duplicates)
- Set `removeOnFail: true` in production — you lose debugging context

**ALWAYS do:**
- Run workers in a dedicated entry file (`worker.ts`) started as a separate process
- Set `maxRetriesPerRequest: null` on the ioredis connection passed to BullMQ
- Rethrow or let errors propagate in job processors — BullMQ needs uncaught errors to mark jobs failed
- Call `worker.close()` on SIGTERM before process exits
- Log job ID, queue name, and attempt number on every failure

**Code example — Redis connection (required config):**
```typescript
import { Queue, Worker } from 'bullmq'
import IORedis from 'ioredis'

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null, // required by BullMQ
})
```

**Code example — producer (adding a job):**
```typescript
const emailQueue = new Queue('email', { connection })

await emailQueue.add(
  'send-welcome',
  { userId, email },
  {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { count: 1000 },
  }
)
```

**Code example — worker (consuming jobs):**
```typescript
// worker.ts — separate process, not imported by server
const worker = new Worker(
  'email',
  async (job) => {
    if (job.name === 'send-welcome') {
      await sendWelcomeEmail(job.data.email)
    }
  },
  { connection, concurrency: 5 }
)

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed on attempt ${job?.attemptsMade}:`, err.message)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  await worker.close()
  process.exit(0)
})
```

**Code example — cron / repeatable job:**
```typescript
// Register once on app start — use jobId to prevent duplicates
await queue.add(
  'daily-report',
  {},
  {
    repeat: { pattern: '0 8 * * *' }, // every day at 08:00
    jobId: 'daily-report-cron',       // stable ID prevents duplicate registration
    removeOnComplete: true,
  }
)
```

**Code example — Bull Board setup (Express):**
```typescript
import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { ExpressAdapter } from '@bull-board/express'

const serverAdapter = new ExpressAdapter()
serverAdapter.setBasePath('/admin/queues')

createBullBoard({
  queues: [new BullMQAdapter(emailQueue)],
  serverAdapter,
})

app.use('/admin/queues', requireAdminAuth, serverAdapter.getRouter())
```

**Verification checklist:**
- [ ] `npm run build` — 0 TypeScript errors
- [ ] Worker process starts independently: `npx ts-node worker.ts`
- [ ] Add a test job → appears in Bull Board as completed
- [ ] Force a job to throw → appears in Bull Board as failed with error message
- [ ] Kill worker mid-job with SIGTERM → job completes before process exits
- [ ] Repeatable job registered → appears in Bull Board Repeatable tab
- [ ] Redis memory: `redis-cli info memory` — no unexpected growth after 100 jobs

**Frontmatter for impl.md (update from research):**
```yaml
skill: apex-jobs
backend: deepseek
version: 1.0.0
last_updated: 2026-05-28
sources:
  - BullMQ Docs — docs.bullmq.io
  - Bull Board — github.com/felixmosh/bull-board
staleness_threshold: 30d
```

---

### Registry row to add in `~/.claude/registry/domains.md`

```
| jobs | apex-jobs/SKILL.md | apex-jobs/impl.md | — | background job, job queue, worker, BullMQ, Bull, Redis queue, cron job, scheduled task, async task, retry, dead letter queue, queue worker |
```

### SKILLS.md additions in `~/apex/SKILLS.md`

Quick reference table row:
```
| **apex-jobs** | Background job queues — BullMQ, workers, cron jobs, retry/backoff, dead letter queues | topic keyword |
```

New entry under the **Application development** section (after apex-auth):
```
**apex-jobs** — Background job queue implementation. Primary: BullMQ + Redis (persistent
server, AWS ElastiCache at scale). Covers queue/worker setup, job options (attempts,
backoff, delay, priority), cron/repeatable jobs, job chaining (FlowProducer), dead letter
queues, graceful shutdown, Bull Board monitoring dashboard. Alternative: pg-boss for
PostgreSQL-backed jobs without Redis.
```

### SKILL-HISTORY.md row to prepend in `~/apex/SKILL-HISTORY.md`

```
| 2026-05-28 | apex-jobs | SKILL + impl | 1.0.0 | created | Background job queues — BullMQ+Redis, workers, cron, retry/backoff, dead letter, Bull Board, AWS ElastiCache scaling | BullMQ Docs, Bull Board, pg-boss |
```

## Gotchas / edge cases

- **maxRetriesPerRequest: null is mandatory**: BullMQ will throw an error if the ioredis
  connection doesn't have this set. It must be in every code example and the NEVER section.

- **QueueScheduler deprecation**: BullMQ v2+ removed the need for a separate QueueScheduler.
  Research task #1 must confirm current version — if any example online uses QueueScheduler,
  it is outdated. Do not include it.

- **Duplicate repeatable jobs on restart**: Without a stable `jobId`, every app restart
  registers a new repeatable job. After 10 restarts you have 10 instances of the same cron.
  The `jobId` pattern is critical and must be in the code example.

- **Empty catch blocks mark jobs as completed**: BullMQ only marks a job as failed if the
  processor throws. A silent `catch` makes failed jobs disappear silently. The NEVER section
  must highlight this.

- **Bull Board must be auth-gated**: The code example includes `requireAdminAuth` middleware.
  An unprotected Bull Board exposes all job data and allows manual retries. The example
  must always show auth middleware in place.

- **AWS ElastiCache cluster mode**: BullMQ works with ElastiCache in single-node mode.
  Cluster mode requires additional config (`enableOfflineQueue`, slot routing). Research
  task #4 must clarify the recommended ElastiCache setup.

- **Concurrency vs CPU**: Setting `concurrency: 5` means 5 jobs run concurrently in the
  same Node.js event loop. For CPU-heavy tasks (image processing, PDF generation), use
  sandboxed processors (separate child process per job) to avoid blocking the loop.

- **SKILL-HISTORY.md prepend**: coding mode must prepend, not append. File is newest-first.

## Files to touch

- `~/.claude/skills/apex-jobs/SKILL.md` — create (new skill, planning-mode guidance)
- `~/.claude/skills/apex-jobs/impl.md` — create (new skill, coding-mode patterns)
- `~/.claude/registry/domains.md` — add `jobs` row (see exact row above)
- `~/apex/SKILLS.md` — add quick-ref table row + Application development entry
- `~/apex/SKILL-HISTORY.md` — prepend creation row (see exact row above)
