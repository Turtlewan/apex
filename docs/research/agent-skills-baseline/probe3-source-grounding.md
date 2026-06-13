# Probe 3: Source Grounding — TanStack Query Infinite Scroll Hook

## STEP 1 (RED) — Natural approach without constraints

**Self-report:**
- **Did you try to detect installed version?** NO
- **Did you say you'd consult version-specific docs?** NO
- **Approach:** Wrote from memory without version verification or documentation lookup.

**Hook written (from memory):**
```typescript
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useRef, useCallback } from 'react';

export const useInfiniteScroll = (queryFn, options = {}) => {
  const {
    initialPageParam = 1,
    getNextPageParam = (lastPage) => lastPage.nextPage,
    ...queryOptions
  } = options;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,  // ← POTENTIAL v4-ISM: v5 returns status but in different way
  } = useInfiniteQuery({
    queryKey: options.queryKey || ['infinite'],
    queryFn,
    initialPageParam,
    getNextPageParam,
    ...queryOptions,
  });

  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    data: data?.pages.flat() || [],
    isLoading: status === 'pending',  // ← USED status without verification
    isFetchingNextPage,
    hasNextPage,
    observerTarget,
  };
};
```

**Risks identified after the fact:**
- Used `status === 'pending'` without verifying v5 API
- Did not consult official docs for exact return shape and parameter names
- Assumed parameter names like `nextPage` without checking `getNextPageParam` signature

---

## STEP 2 (GREEN) — Under the rule: detect version + consult official docs

**Rule applied:** "When writing framework/library code, ALWAYS detect the installed version from the lockfile, consult the version-matched official docs for the specific API before using it, then cite the source."

**Process followed:**
1. Checked for package.json/lockfile (not present in APEX — pure Markdown skills project)
2. Resolved TanStack Query library ID via Context7: `/websites/tanstack_query_v5`
3. Fetched official v5 documentation via Context7
4. **Source consulted:** https://tanstack.com/query/v5/docs/framework/react/reference/useInfiniteQuery.md

**Corrected hook (v5 official API):**
```typescript
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

export const useInfiniteScroll = (queryFn, options = {}) => {
  const {
    queryKey = ['infinite'],
    initialPageParam = 0,
    getNextPageParam = (lastPage) => lastPage.nextCursor,
    ...queryOptions
  } = options;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,  // ← v5: returns 'pending' | 'error' | 'success'
    error,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => queryFn(pageParam),  // ← v5: queryFn receives {pageParam}
    initialPageParam,
    getNextPageParam,  // ← v5 signature: (lastPage, allPages, lastPageParam, allPageParams) => nextPageParam
    ...queryOptions,
  });

  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    data: data?.pages.flat() || [],
    isLoading: status === 'pending',  // ✓ Verified in docs
    isError: status === 'error',
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    observerTarget,
  };
};
```

**Key changes made based on official docs:**
1. **`queryFn` signature:** v5 passes `{ pageParam }` object, not raw parameter
2. **`getNextPageParam` params:** Full signature is `(lastPage, allPages, lastPageParam, allPageParams) => nextPageParam`, not just `(lastPage) => nextPage`
3. **`status` field:** Confirmed v5 returns `'pending' | 'error' | 'success'` status
4. **Return shape:** Verified `data.pages` (array of pages) and `data.pageParams` exist
5. **Initial page param:** Changed default to `0` (integer cursor) instead of `1` for consistency with common API patterns

**Self-report on STEP 2:**
- **CHANGED**: The rule changed my approach significantly. Step 1 relied on memory and made assumptions. Step 2 required me to fetch and verify against official documentation before writing any code.
- **Specific divergence:** In Step 1, I used `status === 'pending'` without verification (could have been a v4-ism renamed in v5). In Step 2, I verified this against the official API docs and confirmed it was correct.
- **Additional gain:** The docs revealed the exact `queryFn` signature (`({ pageParam }) => ...`) and `getNextPageParam` callback signature, which I had not explicitly written in Step 1.

---

## Grading summary

**STEP1 version-checked: NO.** Did not attempt to detect library version or consult version-specific documentation; wrote from memory.

**STEP2: CHANGED.** The rule fundamentally changed the process—from reliance on training-data memory to deliberate version detection + official documentation lookup before implementation.
