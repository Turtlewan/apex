## Intent

apex-realtime guides real-time server-to-client push implementation for apps on persistent
servers (Mac Mini, AWS ECS). Primary pattern: external event arrives at server (finance feed,
Home Assistant webhook, Telegram update, AI token stream) → server pushes to all connected
clients belonging to that user. Covers Socket.io + Redis adapter for multi-instance scaling,
user-scoped rooms, SSE for pure streaming (AI responses), authentication of socket connections,
and reconnection handling. Distinct from apex-backend (HTTP request/response) and apex-jobs
(background processing) — this skill answers: "how do I push live updates to connected clients?"

## Research tasks (DeepSeek executes FIRST before writing any skill content)

Before writing SKILL.md or impl.md, research and verify the following. Tag findings
[VERIFIED], [ASSUMED], or [COMMUNITY]. Update API examples and version references based
on findings.

1. **Socket.io current version and breaking changes** — verify current major version,
   whether the API (io.on, socket.join, io.to().emit) is stable, and any recent changes
   to the Redis adapter. Check socket.io/docs and npm.

2. **Socket.io Redis adapter current setup** — verify current package name
   (`@socket.io/redis-adapter` vs older `socket.io-redis`), setup pattern, and whether
   it works with ioredis v4+. Check github.com/socketio/socket.io-redis-adapter.

3. **Socket.io authentication patterns** — verify current best practice for authenticating
   socket connections (middleware with JWT/session cookie, handshake auth). Check
   socket.io/how-to/use-with-jwt.

4. **Server-Sent Events in Node.js / Next.js** — verify current SSE implementation
   pattern in Express/Fastify and Next.js App Router (Route Handlers). Check for any
   edge runtime limitations.

5. **Socket.io with Next.js App Router** — verify whether custom server is still required
   or if there is a supported pattern for App Router + Socket.io. Check socket.io/how-to/use-with-nextjs.

6. **Socket.io vs native WebSockets in Node.js 22+** — Node.js 22 has native WebSocket
   client support. Is there a case for raw `ws` library over Socket.io for this use case?
   Verify community consensus on Socket.io vs ws for 2025 projects.

Write a ## Research findings section at the top of the output SKILL.md summarising each
item in one line. Use findings to correct any outdated patterns in impl.md.

## Key decisions

### SKILL.md content

**When to activate — trigger phrases:**
- "real-time" / "live updates" / "push to client"
- "WebSocket" / "Socket.io" / "SSE" / "Server-Sent Events"
- "live dashboard" / "live feed" / "streaming data"
- "presence" / "online status" / "who is connected"
- "AI streaming" / "stream LLM response"
- "push notification to UI" / "instant update"
- "Home Assistant live" / "Telegram live" / "finance ticker"

**5 questions to ask before designing:**
1. Direction of data flow? (server→client only / bidirectional)
2. Single user on multiple devices, or multiple distinct users?
3. How many concurrent connections expected? (affects Redis adapter decision)
4. Any pure streaming use case? (AI token streaming → SSE may be simpler)
5. Running multiple server instances? (yes → Redis adapter required)

**Protocol decision table:**

| Use case | Protocol | Why |
|----------|----------|-----|
| Live dashboard, notifications, presence | Socket.io | Rooms, reconnection, multi-instance via Redis adapter |
| AI token streaming (one-way) | SSE | Simpler, HTTP-native, no persistent connection overhead |
| Raw bidirectional, full control | `ws` library | Lighter than Socket.io, manual room management |
| Managed, no infra | Ably / Pusher | Hosted, pay-per-message, no Redis needed |

**Primary recommendation: Socket.io + Redis adapter**
Covers all user use cases (finance, Home Assistant, Telegram, AI brain) through named events
and user-scoped rooms. Redis adapter ensures multi-instance correctness when scaling to AWS.

**Room / channel architecture for this project's use cases:**

Use user-scoped rooms so all of a user's devices receive the same updates:

```
room: `user:{userId}`           — all events for this user
room: `user:{userId}:finance`   — finance updates only
room: `user:{userId}:home`      — Home Assistant sensor events
room: `user:{userId}:telegram`  — Telegram incoming messages
room: `user:{userId}:ai`        — AI brain streaming events
```

On connect: server joins socket to `user:{userId}` (and sub-rooms if client subscribes).
External webhook/feed handler: publishes to Redis → Redis adapter → all sockets in room receive it.

**Authentication of socket connections:**
- Socket.io middleware runs before connection is accepted
- Verify JWT or session cookie in handshake `auth` or `headers`
- Reject unauthenticated connections with `next(new Error('Unauthorized'))`
- Store `userId` on `socket.data` after verification — use it for room join

**External event → broadcast flow:**
```
External source (Home Assistant webhook, finance API poll, Telegram webhook)
  → HTTP endpoint on server receives event
  → Server publishes to Redis pub/sub channel
  → Redis adapter broadcasts to all Socket.io instances
  → All sockets in `user:{userId}:home` room receive the event
```

**SSE pattern (for AI streaming):**
- Use SSE when the client only needs to receive (AI token stream, progress updates)
- SSE is a standard HTTP response with `Content-Type: text/event-stream`
- Simpler than Socket.io for this specific case — no persistent connection library needed
- Each AI request opens one SSE connection, closes when stream ends

**Reconnection and resilience:**
- Socket.io handles reconnection automatically (exponential backoff by default)
- On reconnect, client must re-subscribe to rooms (server re-joins on `connection` event)
- Missed events during disconnect: use a "catch-up" REST endpoint for critical data
  (finance: fetch last N prices; home: fetch current sensor states)
- Do not replay all missed events via socket — use HTTP for state, socket for deltas

**Hard blocks:**
- Never trust `userId` from the client — always derive from verified session/JWT on server
- Never broadcast to all connected clients globally — always scope to user room
- Never skip the Redis adapter when running multiple server instances
- Never store sensitive data in socket.data that persists across reconnections without re-verification
- Never use polling as a substitute for WebSockets/SSE in production

**Review checklist:**
- [ ] Socket connections authenticated before `connection` event fires
- [ ] `userId` derived from server-side session/JWT, never from client payload
- [ ] All emits scoped to `user:{userId}` room, not global broadcast
- [ ] Redis adapter configured when `NODE_ENV=production` or multiple instances
- [ ] Client reconnection tested: disconnect → reconnect → events resume
- [ ] SSE connections closed by server when stream ends (no dangling connections)
- [ ] External webhook handlers publish to Redis channel, not directly to socket

**Frontmatter for SKILL.md (update from research):**
```yaml
skill: apex-realtime
backend: claude
version: 1.0.0
last_updated: 2026-05-28
sources:
  - Socket.io Docs — socket.io/docs
  - Socket.io Redis Adapter — github.com/socketio/socket.io-redis-adapter
  - MDN SSE — developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
staleness_threshold: 30d
```

---

### impl.md content

**NEVER do:**
- Accept `userId` or room names from the client payload — derive from verified token only
- Emit to `io.emit()` (all clients) instead of `io.to(room).emit()` (scoped room)
- Skip the Redis adapter in multi-instance deployments
- Leave SSE connections open after the stream ends (memory leak)
- Store unverified client data in `socket.data`

**ALWAYS do:**
- Verify auth in Socket.io middleware before connection is accepted
- Join socket to `user:{userId}` room immediately after connection
- Use named events (`finance:update`, `home:sensor`, `ai:token`) not a generic `message`
- Close SSE response with `res.end()` when stream completes
- Publish to Redis pub/sub from external event handlers — never call `io` directly from webhooks

**Code example — Socket.io server setup with auth middleware:**
```typescript
import { Server } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { createClient } from 'redis'

const pubClient = createClient({ url: process.env.REDIS_URL })
const subClient = pubClient.duplicate()
await Promise.all([pubClient.connect(), subClient.connect()])

const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL, credentials: true },
})

io.adapter(createAdapter(pubClient, subClient))

// Auth middleware — runs before connection accepted
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token
  const session = await verifyToken(token) // your auth verification
  if (!session) return next(new Error('Unauthorized'))
  socket.data.userId = session.userId
  next()
})

io.on('connection', (socket) => {
  const { userId } = socket.data
  socket.join(`user:${userId}`) // always join user room on connect
})
```

**Code example — external event → broadcast (webhook handler):**
```typescript
// In your webhook/feed handler — publish to Redis, not directly to io
async function onFinanceUpdate(userId: string, data: PriceUpdate) {
  await pubClient.publish(
    `user:${userId}:finance`,
    JSON.stringify({ event: 'finance:update', data })
  )
}

// Socket.io Redis adapter picks this up and delivers to all sockets in the room
// You can also emit directly if in the same process:
io.to(`user:${userId}`).emit('finance:update', data)
```

**Code example — SSE for AI token streaming:**
```typescript
// Express route handler
app.get('/api/ai/stream', requireAuth, async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  const stream = await aiClient.stream(req.query.prompt as string)

  for await (const chunk of stream) {
    res.write(`data: ${JSON.stringify({ token: chunk })}\n\n`)
  }

  res.write('data: [DONE]\n\n')
  res.end()
})
```

**Code example — client-side Socket.io connection:**
```typescript
import { io } from 'socket.io-client'

const socket = io(process.env.NEXT_PUBLIC_API_URL, {
  auth: { token: getAuthToken() },
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
})

socket.on('finance:update', (data) => updatePrices(data))
socket.on('home:sensor', (data) => updateSensorState(data))
socket.on('telegram:message', (data) => showNotification(data))
socket.on('connect_error', (err) => console.error('Socket auth failed:', err.message))
```

**Verification checklist:**
- [ ] `npm run build` — 0 TypeScript errors
- [ ] Connect without auth token → connection rejected with error
- [ ] Connect with valid token → socket joins `user:{userId}` room
- [ ] Emit event from server to room → client receives it
- [ ] Open two browser tabs → both receive the same broadcast
- [ ] Disconnect one tab → other continues receiving events
- [ ] SSE endpoint: open in browser → tokens stream, connection closes on completion
- [ ] Kill and restart server → client reconnects automatically

**Frontmatter for impl.md (update from research):**
```yaml
skill: apex-realtime
backend: deepseek
version: 1.0.0
last_updated: 2026-05-28
sources:
  - Socket.io Docs — socket.io/docs
  - Socket.io Redis Adapter — github.com/socketio/socket.io-redis-adapter
  - MDN SSE — developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
staleness_threshold: 30d
```

---

### Registry row to add in `~/.claude/registry/domains.md`

```
| realtime | apex-realtime/SKILL.md | apex-realtime/impl.md | — | real-time, WebSocket, Socket.io, SSE, Server-Sent Events, live updates, push, streaming, presence, live dashboard, finance ticker, AI streaming |
```

### SKILLS.md additions in `~/apex/SKILLS.md`

Quick reference table row:
```
| **apex-realtime** | Real-time push — Socket.io, SSE, user-scoped rooms, Redis adapter, AI streaming | topic keyword |
```

New entry under the **Application development** section (after apex-jobs):
```
**apex-realtime** — Real-time server-to-client push. Primary: Socket.io + Redis adapter
(multi-instance safe). Covers user-scoped rooms, socket auth middleware, external event
→ broadcast flow (finance feeds, Home Assistant webhooks, Telegram), SSE for AI token
streaming, reconnection handling, and catch-up REST pattern for missed events.
```

### SKILL-HISTORY.md row to prepend in `~/apex/SKILL-HISTORY.md`

```
| 2026-05-28 | apex-realtime | SKILL + impl | 1.0.0 | created | Real-time push — Socket.io+Redis adapter, user-scoped rooms, SSE for AI streaming, external event broadcast flow | Socket.io Docs, Redis Adapter, MDN SSE |
```

## Gotchas / edge cases

- **Socket.io + Next.js App Router**: Next.js App Router does not support Socket.io natively
  in Route Handlers. A custom server (`server.ts`) or a separate API process is required.
  Research task #5 must confirm current supported pattern — this is a common source of
  confusion and the skill must address it explicitly.

- **Redis adapter package rename**: The old package `socket.io-redis` is deprecated. Current
  package is `@socket.io/redis-adapter`. Research task #2 must confirm exact package name
  and setup — many tutorials still show the old package.

- **Missed events on reconnect**: Socket.io reconnects automatically but does not replay
  missed events. The skill must recommend a REST catch-up endpoint for critical state
  (current sensor values, last N prices). Do not attempt event replay through socket.

- **SSE and reverse proxies**: SSE requires the reverse proxy (nginx, AWS ALB) to disable
  response buffering (`X-Accel-Buffering: no` for nginx). Without this, tokens appear in
  batches not as a stream. Add this to the SSE gotchas section.

- **userId in socket.data persists across reconnects**: When a client reconnects, the
  `connection` event fires again and middleware re-runs. Do not cache socket.data.userId
  between reconnects without re-verifying — always re-derive from the token.

- **Global io.emit is a security risk**: Broadcasting to all clients leaks one user's
  finance/home data to another user. The hard block must be prominent.

- **SKILL-HISTORY.md prepend**: coding mode must prepend, not append. File is newest-first.

## Files to touch

- `~/.claude/skills/apex-realtime/SKILL.md` — create (new skill, planning-mode guidance)
- `~/.claude/skills/apex-realtime/impl.md` — create (new skill, coding-mode patterns)
- `~/.claude/registry/domains.md` — add `realtime` row (see exact row above)
- `~/apex/SKILLS.md` — add quick-ref table row + Application development entry
- `~/apex/SKILL-HISTORY.md` — prepend creation row (see exact row above)
