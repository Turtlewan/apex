## Intent

apex-storage guides file upload and storage implementation starting local-first (MinIO
on Mac Mini / home server via Docker) with a zero-code-change migration path to S3 or
Cloudflare R2. Covers generic file uploads (any type with restrictions), server-side
validation, presigned URLs for direct client uploads and secure downloads, file metadata
in the database, multipart uploads for large files, and access control. Distinct from
apex-backend (HTTP handlers) — this skill answers: "how do I accept, store, and serve
files?"

## Research tasks (DeepSeek executes FIRST before writing any skill content)

Before writing SKILL.md or impl.md, research and verify the following. Tag findings
[VERIFIED], [ASSUMED], or [COMMUNITY]. Update API examples based on findings.

1. **AWS SDK v3 with MinIO** — verify `@aws-sdk/client-s3` works with a custom endpoint
   (MinIO), the exact client config for custom endpoint + path-style addressing, and
   presigned URL generation via `@aws-sdk/s3-request-presigner`. Check docs.aws.amazon.com/sdk-for-javascript/v3.

2. **MinIO Docker setup** — verify current MinIO Docker image name (`minio/minio`),
   recommended docker-compose config, default port (9000 API, 9001 console), and
   environment variables for root credentials. Check min.io/docs.

3. **file-type package** — verify current version, whether it works in Node.js ESM/CJS,
   and the API for detecting MIME type from a Buffer/stream (not from filename).
   Check github.com/sindresorhus/file-type.

4. **Multer vs busboy vs formidable in 2025** — verify which is currently recommended
   for multipart form handling in Express/Fastify. Check maintenance status and current
   API. Note: Multer is unmaintained as of 2023 — verify if this is still the case and
   what the recommended alternative is.

5. **Presigned upload URLs vs server-side upload** — verify current best practice for
   large file uploads: direct presigned PUT to S3/MinIO from browser vs proxying through
   server. Check AWS docs for size thresholds and multipart presigned URL patterns.

6. **Cloudflare R2 compatibility with AWS SDK v3** — verify R2 endpoint format and any
   config differences from standard S3 when using `@aws-sdk/client-s3`. Check
   developers.cloudflare.com/r2/api/s3/sdk.

Write a ## Research findings section at the top of the output SKILL.md summarising each
item in one line. Use findings to correct any outdated patterns in impl.md.

## Key decisions

### SKILL.md content

**When to activate — trigger phrases:**
- "file upload" / "upload files" / "store files"
- "S3" / "R2" / "MinIO" / "object storage"
- "presigned URL" / "signed URL"
- "image upload" / "document upload" / "attachment"
- "file storage" / "serve files" / "download file"
- "multipart upload"

**5 questions to ask before designing:**
1. Local-first or cloud-first? (MinIO for self-hosted, S3/R2 for cloud — same SDK)
2. Who can access uploaded files? (public CDN vs private presigned URLs)
3. Expected file size range? (small <10MB → server-side upload; large >10MB → direct presigned PUT)
4. Any file type restrictions? (images only, documents only, or generic with blocklist)
5. Multi-tenant? (files scoped per user, per tenant, or globally shared)

**Storage provider decision table:**

| Scenario | Provider | Why |
|----------|----------|-----|
| Self-hosted / home server (day 1) | MinIO | Docker, S3-compatible API, free, runs locally |
| Cloud scale, AWS infra | AWS S3 | Native, mature, deep AWS integration |
| Cloud scale, any infra | Cloudflare R2 | Zero egress fees, S3-compatible, global CDN |
| Self-hosted S3-compatible (team) | MinIO or Garage | Open source, full control |

**Key insight — same code for all providers:**
All providers use `@aws-sdk/client-s3`. The only difference is the `endpoint` config:
```
MinIO:   endpoint: 'http://localhost:9000', forcePathStyle: true
S3:      (no endpoint override needed)
R2:      endpoint: 'https://<account>.r2.cloudflarestorage.com'
```
Migration = change environment variables, not code.

**Upload strategy decision table:**

| File size | Strategy | Why |
|-----------|----------|-----|
| < 10 MB | Server receives → streams to MinIO/S3 | Simple, one hop, easy validation |
| 10 MB – 5 GB | Presigned PUT URL → client uploads direct | Server not a bottleneck |
| > 5 GB | Multipart presigned upload | S3 5GB single PUT limit |

**File metadata — always store in DB:**
```sql
files (
  id, key (S3 object key), originalName, mimeType,
  sizeBytes, bucket, uploadedBy (userId),
  isPublic, createdAt, deletedAt
)
```
Never serve files by guessing the S3 key from user input — always look up via DB record.
`key` is an internal identifier, never expose it directly to clients.

**File validation rules (server-side — never trust client):**
1. Validate MIME type from file bytes (`file-type` package) — not from filename or Content-Type header
2. Enforce size limit before reading full file into memory
3. Blocklist dangerous types: `.exe`, `.sh`, `.bat`, `.ps1`, `.php`, any executable
4. Optionally allowlist: only accept specific MIME types for the use case

**Access control patterns:**
- **Public files** (profile images, public assets): store with public ACL, serve via direct URL or CDN
- **Private files** (documents, personal data): generate presigned GET URL with short expiry (15 min)
- Never serve private files by proxying through your server at scale (bandwidth cost)

**File key naming convention:**
```
{userId}/{date}/{uuid}.{ext}
```
Never use original filename as the S3 key — path traversal and collision risk.

**Deletion pattern:**
Soft delete in DB first (`deletedAt`), then async job deletes from S3.
Never delete from S3 synchronously in a request handler — risk of partial failure.

**Hard blocks:**
- Never validate file type from the `Content-Type` header or filename extension alone
- Never use the user-supplied filename as the storage key
- Never store the S3 key in a URL path that users can guess or enumerate
- Never proxy large file downloads through the server — use presigned GET URLs
- Never delete from storage without first marking deleted in the DB

**Review checklist:**
- [ ] File type validated from bytes (not filename or Content-Type header)
- [ ] Size limit enforced before full file is read into memory
- [ ] Storage key uses UUID, not original filename
- [ ] File metadata record created in DB before/after upload
- [ ] Private files served via presigned URL with short expiry (≤ 15 min)
- [ ] Deletion: soft-delete in DB first, async cleanup from storage
- [ ] MinIO/S3 credentials in environment variables, not hardcoded

**Frontmatter for SKILL.md (update from research):**
```yaml
skill: apex-storage
backend: claude
version: 1.0.0
last_updated: 2026-05-28
sources:
  - AWS SDK v3 Docs — docs.aws.amazon.com/sdk-for-javascript/v3
  - MinIO Docs — min.io/docs
  - Cloudflare R2 Docs — developers.cloudflare.com/r2
  - file-type — github.com/sindresorhus/file-type
staleness_threshold: 30d
```

---

### impl.md content

**NEVER do:**
- Trust `Content-Type` header or file extension for MIME validation — use `file-type` on bytes
- Use the original filename as the storage key or part of the storage path
- Store MinIO/S3 credentials in code — environment variables only
- Proxy large file downloads through the server at scale
- Delete from storage inside a request handler (async job only)
- Expose the internal storage key directly in API responses

**ALWAYS do:**
- Generate a UUID-based key: `${userId}/${date}/${randomUUID()}.${ext}`
- Validate MIME type from the first bytes of the file using `file-type`
- Create the DB metadata record and upload to storage atomically (or handle partial failure)
- Return presigned GET URLs for private files with ≤ 15 minute expiry
- Set `forcePathStyle: true` for MinIO (required — MinIO does not support virtual-hosted style)

**Code example — S3 client setup (works for MinIO, S3, and R2):**
```typescript
import { S3Client } from '@aws-sdk/client-s3'

export const s3 = new S3Client({
  region: process.env.STORAGE_REGION ?? 'us-east-1',
  endpoint: process.env.STORAGE_ENDPOINT,       // MinIO: http://localhost:9000, R2: https://...
  forcePathStyle: process.env.STORAGE_FORCE_PATH_STYLE === 'true', // true for MinIO
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY!,
    secretAccessKey: process.env.STORAGE_SECRET_KEY!,
  },
})
```

**Code example — server-side upload (files < 10 MB):**
```typescript
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { fileTypeFromBuffer } from 'file-type'
import { randomUUID } from 'crypto'

async function uploadFile(buffer: Buffer, originalName: string, userId: string) {
  // Validate MIME from bytes, not filename
  const detected = await fileTypeFromBuffer(buffer)
  if (!detected) throw new Error('Unknown file type')

  const blocked = ['application/x-executable', 'application/x-sh']
  if (blocked.includes(detected.mime)) throw new Error('File type not allowed')

  const key = `${userId}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${detected.ext}`

  await s3.send(new PutObjectCommand({
    Bucket: process.env.STORAGE_BUCKET!,
    Key: key,
    Body: buffer,
    ContentType: detected.mime,
  }))

  return { key, mimeType: detected.mime, sizeBytes: buffer.length }
}
```

**Code example — presigned GET URL for private files:**
```typescript
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

async function getPrivateUrl(key: string): Promise<string> {
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: process.env.STORAGE_BUCKET!, Key: key }),
    { expiresIn: 900 } // 15 minutes
  )
}
```

**Code example — MinIO docker-compose (local dev):**
```yaml
services:
  minio:
    image: minio/minio
    ports:
      - '9000:9000'   # API
      - '9001:9001'   # Console UI
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data

volumes:
  minio_data:
```

**Environment variables (.env.example):**
```
STORAGE_ENDPOINT=http://localhost:9000
STORAGE_REGION=us-east-1
STORAGE_FORCE_PATH_STYLE=true
STORAGE_ACCESS_KEY=minioadmin
STORAGE_SECRET_KEY=minioadmin
STORAGE_BUCKET=my-app
```
For S3: remove `STORAGE_ENDPOINT` and set `STORAGE_FORCE_PATH_STYLE=false`.
For R2: set `STORAGE_ENDPOINT=https://<account>.r2.cloudflarestorage.com`.

**Verification checklist:**
- [ ] MinIO console accessible at `http://localhost:9001`
- [ ] Upload a file → object appears in MinIO console under correct bucket/key
- [ ] Upload `.exe` file → rejected with 400 error
- [ ] Upload file with spoofed `Content-Type` header → MIME validated from bytes, not header
- [ ] Fetch presigned URL → file downloads, URL expires after 15 min
- [ ] Swap `STORAGE_ENDPOINT` to point at real S3/R2 → same code works unchanged

**Frontmatter for impl.md (update from research):**
```yaml
skill: apex-storage
backend: deepseek
version: 1.0.0
last_updated: 2026-05-28
sources:
  - AWS SDK v3 Docs — docs.aws.amazon.com/sdk-for-javascript/v3
  - MinIO Docs — min.io/docs
  - Cloudflare R2 Docs — developers.cloudflare.com/r2
  - file-type — github.com/sindresorhus/file-type
staleness_threshold: 30d
```

---

### Registry row to add in `~/.claude/registry/domains.md`

```
| storage | apex-storage/SKILL.md | apex-storage/impl.md | — | file upload, file storage, S3, MinIO, R2, object storage, presigned URL, signed URL, multipart upload, file download, attachment, image upload |
```

### SKILLS.md additions in `~/apex/SKILLS.md`

Quick reference table row:
```
| **apex-storage** | File storage — MinIO (local), S3/R2 (cloud), presigned URLs, MIME validation | topic keyword |
```

New entry under the **Application development** section (after apex-realtime):
```
**apex-storage** — File upload and storage. Local-first with MinIO (Docker, S3-compatible),
zero-code migration to AWS S3 or Cloudflare R2 via env var swap. Covers generic file
uploads, server-side MIME validation (bytes not filename), UUID-based storage keys,
presigned GET URLs for private files, soft-delete pattern, and multipart uploads for
large files.
```

### SKILL-HISTORY.md row to prepend in `~/apex/SKILL-HISTORY.md`

```
| 2026-05-28 | apex-storage | SKILL + impl | 1.0.0 | created | File storage — MinIO local-first, S3/R2 migration path, presigned URLs, MIME validation, soft-delete | AWS SDK v3 Docs, MinIO Docs, R2 Docs, file-type |
```

## Gotchas / edge cases

- **Multer is unmaintained**: Research task #4 should confirm this. If true, the impl.md
  must not use Multer. Likely replacement is `busboy` directly or `@fastify/multipart`
  for Fastify. The spec must not assume Multer is safe to use.

- **forcePathStyle is required for MinIO**: Without it, the SDK constructs URLs like
  `bucket.localhost:9000` (virtual-hosted style) which MinIO does not support. This must
  be in the NEVER section and every client setup example.

- **file-type works on buffers, not streams directly**: The package requires reading at
  least the first few bytes. For large files, read only the first 4100 bytes for detection
  (file-type only needs the magic bytes at the start), then stream the rest to storage.
  Do not buffer the entire large file in memory just for type detection.

- **Partial upload failure**: If the DB insert succeeds but the S3 upload fails (or vice
  versa), you have orphaned records or orphaned files. Handle with: upload to S3 first,
  then insert DB record. If DB fails, enqueue an async cleanup job to delete the S3 object.

- **MinIO bucket creation**: MinIO does not auto-create buckets. A setup script or
  docker-compose `entrypoint` must create the bucket before the app starts. Include this
  in the docker-compose example or as a setup note.

- **R2 zero egress but not zero cost**: R2 charges per operation (PUT, GET). For
  high-read workloads (serving lots of files), still add Cloudflare CDN in front.
  Note this in the R2 row of the provider decision table.

- **SKILL-HISTORY.md prepend**: coding mode must prepend, not append. File is newest-first.

## Files to touch

- `~/.claude/skills/apex-storage/SKILL.md` — create (new skill, planning-mode guidance)
- `~/.claude/skills/apex-storage/impl.md` — create (new skill, coding-mode patterns)
- `~/.claude/registry/domains.md` — add `storage` row (see exact row above)
- `~/apex/SKILLS.md` — add quick-ref table row + Application development entry
- `~/apex/SKILL-HISTORY.md` — prepend creation row (see exact row above)
