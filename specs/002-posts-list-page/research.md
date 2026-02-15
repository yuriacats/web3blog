# Research: Blog Posts List Page

**Feature**: 002-posts-list-page
**Date**: 2026-02-10
**Purpose**: Resolve technical unknowns and establish implementation patterns

## Research Topics

### 1. Database Query Pattern for Posts with Tags

**Question**: How should we efficiently fetch posts with their associated tags from the database?

**Options Evaluated**:

1. **LEFT JOIN with GROUP_CONCAT**
   - Single query joining post, post_revision, tag_post, and tag_name
   - Use GROUP_CONCAT to aggregate tags into a single row per post
   - Parse comma-separated tags in application code

2. **Separate Queries** (N+1 pattern)
   - Query 1: Fetch all posts
   - Query 2-N: For each post, fetch its tags
   - Simple but inefficient for many posts

3. **Two-Query Pattern**
   - Query 1: Fetch all posts
   - Query 2: Fetch all tags for those posts (IN clause)
   - Join in application code
   - Balance between efficiency and simplicity

**Decision**: **Two-Query Pattern**

**Rationale**:
- Avoids N+1 query problem
- Simpler application code than GROUP_CONCAT parsing
- Better type safety with Zod validation
- Easier to test and maintain
- Performance acceptable for <1000 posts (pagination will be added later)

**Implementation**:
```sql
-- Query 1: Fetch all public posts
SELECT
  post.id, post.slug, post.create_date,
  post_revision.title
FROM post
JOIN post_revision ON post.id = post_revision.post_id
WHERE post_revision.public = 1
ORDER BY post.create_date DESC;

-- Query 2: Fetch all tags for those posts
SELECT
  tag_post.post_id,
  tag_name.id,
  tag_name.name
FROM tag_post
JOIN tag_name ON tag_post.tag_id = tag_name.id
WHERE tag_post.post_id IN (?, ?, ...);
```

**Alternatives Considered**:
- LEFT JOIN with GROUP_CONCAT: Rejected because GROUP_CONCAT parsing is fragile and MySQL-specific
- N+1 separate queries: Rejected due to performance concerns

---

### 2. tRPC Endpoint Design for List Operations

**Question**: What are best practices for list endpoints in tRPC 11?

**Research Findings**:

**tRPC 11 Best Practices**:
1. Use `.query()` for read operations (not `.mutation()`)
2. Return arrays directly for simple lists
3. Use Zod schemas for output validation
4. Consider pagination parameters (optional for MVP, required for #32)
5. Use superjson transformer for Date serialization (already configured)

**Decision**: **Simple query procedure returning typed array**

**Endpoint Signature**:
```typescript
postsList: t.procedure
  .query(async (): Promise<PostListItem[]> => {
    return await fetchAllPosts();
  })
```

**Rationale**:
- Follows tRPC conventions for list operations
- No input needed for simple "get all" operation
- Type safety maintained through TypeScript and Zod
- Easy to extend with pagination parameters later

**Alternatives Considered**:
- Mutation-based endpoint: Rejected (mutations are for write operations)
- Object wrapper (e.g., `{ posts: PostListItem[] }`): Deferred until pagination is added

---

### 3. React Empty State Handling Patterns

**Question**: What's the best pattern for handling empty state in Next.js 15 App Router?

**Research Findings**:

**Next.js 15 + React 19 Patterns**:
1. Conditional rendering in Server/Client Components
2. Early return for empty state
3. Graceful error boundaries for loading failures

**Decision**: **Conditional rendering with early return**

**Pattern**:
```typescript
export default async function PostsPage() {
  const posts = await trpc.postsList.query();

  if (posts.length === 0) {
    return (
      <main>
        <h1>Posts</h1>
        <p>No posts available yet.</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Posts</h1>
      <ul>
        {posts.map(post => (
          <li key={post.slug}>
            <Link href={`/posts/${post.slug}`}>{post.title}</Link>
            {/* tags rendering */}
          </li>
        ))}
      </ul>
    </main>
  );
}
```

**Rationale**:
- Simple and readable
- Server Component can fetch data directly (no client-side loading state needed)
- Aligns with Next.js 15 App Router conventions
- Easy to style and maintain

**Alternatives Considered**:
- Client Component with loading state: Unnecessary complexity for static list
- Separate Empty component: Over-engineering for simple message

---

## Additional Research

### 4. Handling Posts with Multiple Revisions

**Context**: Database has `post_revision` table (multiple revisions per post)

**Decision**: **Fetch only the latest public revision per post**

**Implementation Strategy**:
- Join with subquery to get latest revision per post
- Or use `MAX(post_revision.id)` grouped by `post_id`
- Filter `public = 1` to exclude drafts

**Query Refinement**:
```sql
-- Get latest public revision per post
SELECT
  post.id, post.slug, post.create_date,
  latest_rev.title
FROM post
JOIN (
  SELECT post_id, MAX(id) as max_rev_id
  FROM post_revision
  WHERE public = 1
  GROUP BY post_id
) AS latest
ON post.id = latest.post_id
JOIN post_revision AS latest_rev
ON latest_rev.id = latest.max_rev_id
ORDER BY post.create_date DESC;
```

---

## Technology Choices Summary

| Technology | Choice | Justification |
|------------|--------|---------------|
| Query Pattern | Two-query (posts + tags) | Balance of performance and simplicity |
| tRPC Endpoint | Simple `.query()` returning array | Follows tRPC conventions, easy to extend |
| Empty State | Conditional rendering with early return | Simple, Server Component compatible |
| Revision Handling | Subquery for latest public revision | Ensures correct data, filters drafts |
| Testing | Jest for backend, manual for frontend | Adequate coverage for MVP |

---

## Open Issues Resolved

1. ✅ **How to join tags efficiently**: Two-query pattern
2. ✅ **tRPC best practices**: Use `.query()`, return typed array
3. ✅ **Empty state pattern**: Conditional rendering
4. ✅ **Multiple revisions**: Fetch latest public revision only

---

**Status**: All research topics resolved. Ready for Phase 1 (Design Artifacts).
