# Spec: skill-impl-fixes

## Scope

Two impl.md correctness fixes: (1) `apex-search/impl.md` uses `JSON.stringify(embedding)` in its ingest example which contradicts its own NEVER rule — fix to a pgvector literal with an explicit `::vector` cast. (2) `apex-storage/impl.md` derives a file extension from the client-supplied `contentType` in the presigned PUT example without noting that post-upload server-side MIME validation is required to close the gap.

---

## Files to change

| File | Operation |
|------|-----------|
| `~/.claude/skills/apex-search/impl.md` | Modify — fix embedding insert in `ingestDocument`, bump to 1.1.0 |
| `~/.claude/skills/apex-storage/impl.md` | Modify — add post-upload validation note to ALWAYS + code comment + checklist, bump to 1.1.0 |
| `~/apex/SKILL-HISTORY.md` | Modify — prepend 2 rows |

---

## Exact changes

### 1. apex-search/impl.md — fix embedding insert

**Frontmatter:** bump `version` to `1.1.0`.

**In the `ingestDocument` code example**, replace the `db.query` call (the INSERT/ON CONFLICT block):

Before:
```typescript
    await db.query(
      `INSERT INTO chunks (document_id, content, chunk_index, content_hash, embedding)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (document_id, chunk_index) DO UPDATE
       SET content = $2, content_hash = $4, embedding = $5`,
      [docId, chunks[i], i, hash, JSON.stringify(embedding)]
    )
```

After:
```typescript
    await db.query(
      `INSERT INTO chunks (document_id, content, chunk_index, content_hash, embedding)
       VALUES ($1, $2, $3, $4, $5::vector)
       ON CONFLICT (document_id, chunk_index) DO UPDATE
       SET content = $2, content_hash = $4, embedding = $5::vector`,
      [docId, chunks[i], i, hash, `[${embedding.join(',')}]`]
    )
```

Two changes: `$5` → `$5::vector` (in both INSERT and UPDATE SET), and `JSON.stringify(embedding)` → `` `[${embedding.join(',')}]` ``.

---

### 2. apex-storage/impl.md — presigned PUT post-upload validation

**Frontmatter:** bump `version` to `1.1.0`.

**In the `## ALWAYS do` section**, append one item at the end of the list:

```
- For presigned PUT uploads, trigger server-side MIME validation from file bytes after the client upload completes — before marking the file record active in DB
```

**In the `createUploadUrl` function**, add a single-line comment above the `ext` derivation line:

Before:
```typescript
  const ext = contentType.split('/')[1] ?? 'bin'
```

After:
```typescript
  // ext is for the storage key only — MIME must be validated from bytes post-upload
  const ext = contentType.split('/')[1] ?? 'bin'
```

**In the `## Verification checklist`**, append one item at the end:

```
- [ ] Presigned PUT: after client upload, server validates MIME from bytes before DB record is marked active
```

---

### ~/apex/SKILL-HISTORY.md

Prepend these 2 rows before the existing rows:

```
| 2026-05-28 | apex-storage | impl | 1.1.0 | updated (impl) | Added post-upload MIME validation requirement for presigned PUT uploads | — |
| 2026-05-28 | apex-search | impl | 1.1.0 | updated (impl) | Fixed embedding insert: JSON.stringify → pgvector array literal with ::vector cast | pgvector docs |
```

---

## Acceptance criteria

- `apex-search/impl.md`: `ingestDocument` contains `` `[${embedding.join(',')}]` `` and `$5::vector` — `JSON.stringify` does not appear in the embedding insert
- `apex-storage/impl.md`: ALWAYS section contains "post-upload", `createUploadUrl` has the comment, verification checklist has the new item
- Both impl.md files have `version: 1.1.0` in frontmatter
- SKILL-HISTORY.md has 2 new rows at the top for today's date

## Commands to run

```
grep -n 'JSON.stringify' ~/.claude/skills/apex-search/impl.md
grep -n 'post-upload' ~/.claude/skills/apex-storage/impl.md
grep -n 'version' ~/.claude/skills/apex-search/impl.md ~/.claude/skills/apex-storage/impl.md
head -5 ~/apex/SKILL-HISTORY.md
```
