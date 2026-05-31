# Research: Python Stack (FastAPI + typed-Python tooling) for `apex-python`

**Date:** 2026-05-31
**Confidence:** MEDIUM-HIGH — FastAPI from Tier-1 docs; tooling landscape from strong, unanimous 2026 community consensus + local toolchain ground-truth.
**Re-research after:** 2026-07-31 (Astral tooling — `uv`/`ty` — moves fast; 60-day clock).

## Summary
For an AI-built Python RAG engine + local FastAPI hub, the 2026 default stack is the **Astral
toolchain** (`uv` + `ruff`) with **`mypy --strict`** as the type-check gate (Astral's `ty` is faster
but still beta — not yet a trustworthy verification gate). FastAPI (async-first) + pydantic v2 +
SQLAlchemy 2.0 async. The `mypy --strict` gate is the load-bearing piece: it buys back dynamic
Python's weak self-correction signal, which is the whole reason verifiability is weighted heavily for
an AI-reliant build (ADR-006).

## Key findings

- **`uv` (Astral)** is the dominant env / dependency / Python-version manager — Rust, single binary,
  10–100× faster than Poetry, `pyproject.toml` as single source of truth. `[COMMUNITY — unanimous across 2026 setup guides]`
- **`ruff` (Astral)** is the all-in-one linter **and** formatter (replaces black/isort/flake8). Local
  ground-truth: `ruff 0.15.12` installed. `[VERIFIED locally] [COMMUNITY]`
- **Type checker — use `mypy --strict` now.** Astral's `ty` is "blazingly fast" but **beta (~v0.0.15
  late 2025, stable expected 2026)**; community explicitly warns it's "too unstable to have in a
  template" for production. Decision: recipe uses `mypy --strict`; note `ty` as the emerging
  fast alternative to revisit at the next re-research. `[COMMUNITY — consistent]`
- **FastAPI** latest `0.128.0` (context7). Async-first; sync routes run in a threadpool; **never call
  blocking I/O inside an `async def` route** (blocks the single-thread event loop — the #1 FastAPI
  footgun). `[VERIFIED — /fastapi/fastapi, /websites/fastapi_tiangolo]`
- **pydantic v2** — ~50× faster validation than v1; typed config via `pydantic-settings`
  `BaseSettings` (catches misconfig at startup). Keep Pydantic *schemas* separate from SQLAlchemy
  *models*. `[VERIFIED + COMMUNITY]`
- **Python 3.14 GA** (3.14.4 local). `[VERIFIED locally]`
- **pytest** is the test runner; `pytest 9.0.3` installed locally. `[VERIFIED locally]`

## Recommended Verification Recipe (candidate — to be RED/GREEN-validated)

Layered, language-level (FastAPI adds no separate build step — it's interpreted; the import/startup
check substitutes for "build"):

```bash
uv sync                         # resolve + install into the locked venv
ruff format --check .           # format gate
ruff check .                    # lint gate
mypy --strict .                 # type gate — the verifiability buy-back
pytest -q                       # test gate
```

- **Composition (ADR-006):** capability skills layered on top (`apex-ai-systems`, `apex-search`) add
  their own checks; coding mode unions them with this language recipe. A future `apex-fastapi` would
  add framework-level checks (e.g. an app-startup/import smoke check) above this language layer.

## Stack opinions worth enforcing (gotchas the base model gets wrong)

- **No blocking I/O in `async def`.** Use async clients (`httpx`, async SQLAlchemy) or offload to a
  threadpool; otherwise the event loop stalls under load.
- **`mypy --strict` from day one**, not bolted on later — retrofitting strict typing onto an untyped
  codebase is far costlier than starting strict.
- **Pydantic schema ≠ ORM model** — keep request/response schemas separate from persistence models.
- **Typed settings** via `pydantic-settings`, not bare `os.environ` reads.
- **`uv` not pip/poetry/conda** for new projects — single lockfile, reproducible, fast CI.

## Assumptions / gaps
- The `apex-swift` ↔ `apex-python` hub/sidecar IPC boundary (FastAPI local server contract) is an
  app-design detail, not a stack-skill concern — out of scope here.
- `ty` maturity should be re-checked at the 60-day mark; if stable, it may replace/augment `mypy`.
- Vector-store / RAG specifics (sqlite-vec vs LanceDB vs Qdrant) belong to `apex-search` /
  `apex-ai-systems`, resolved in SP2 composition — deliberately excluded.

## Sources
- FastAPI — `/fastapi/fastapi`, `/websites/fastapi_tiangolo` (Context7, Tier 1)
- KDnuggets — *Python Project Setup 2026: uv + Ruff + Ty + Polars*
- pydevtools handbook — *Set up a complete Python project with uv, Ruff, ty, pytest, pre-commit*
- zhanymkanov/fastapi-best-practices (GitHub)
- Local toolchain ground-truth: `ruff 0.15.12`, `pytest 9.0.3`, Python 3.12.10 / 3.14.4
