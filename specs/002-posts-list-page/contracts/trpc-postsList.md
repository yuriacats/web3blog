# tRPC Contract: postsList

**Endpoint**: `postsList`
**Type**: Query (read operation)
**Purpose**: Fetch all public blog posts with their tags for list display

## Request

**Method**: `query`

**Input**: None

**TypeScript Type**:
```typescript
// No input parameters
void
```

---

## Response

**Output**: Array of PostListItem

**TypeScript Type**:
```typescript
type PostListItem = {
  slug: string;           // 20-character unique identifier
  title: string;          // Post title (1-256 chars)
  tags: Tag[];           // Array of associated tags (can be empty)
  createDate: Date;      // Post creation timestamp
};

type Tag = {
  id: number;            // Unique tag ID
  name: string;          // Tag name (1-20 chars)
};

// Endpoint returns:
PostListItem[]
```

**Zod Schema**:
```typescript
import { z } from "zod";

const TagSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(20),
});

const PostListItemSchema = z.object({
  slug: z.string().length(20),
  title: z.string().min(1).max(256),
  tags: z.array(TagSchema),
  createDate: z.coerce.date(),
});

// Return type validation
const PostsListResponseSchema = z.array(PostListItemSchema);
```

---

## Behavior

**Success Case**:
- Returns array of all public posts (post_revision.public = 1)
- Posts are ordered by creation date (newest first)
- Each post includes its associated tags
- Posts without tags have empty `tags` array

**Empty State**:
- Returns `[]` (empty array) if no public posts exist
- Frontend handles empty state with appropriate message

**Error Cases**:
- Database connection failure: Throws tRPC error
- Query execution error: Throws tRPC error

---

## tRPC Procedure Definition

```typescript
// In backend/src/index.ts (appRouter)

export const appRouter = t.router({
  // ... existing endpoints

  postsList: t.procedure
    .query(async (): Promise<PostListItem[]> => {
      return await fetchAllPosts();
    }),
});
```

---

## Frontend Usage

**Next.js Server Component** (Server-side fetch):
```typescript
// In front/src/app/posts/page.tsx

import { trpc } from '@/utils/trpc'; // tRPC client

export default async function PostsPage() {
  const posts = await trpc.postsList.query();

  if (posts.length === 0) {
    return <div>No posts available</div>;
  }

  return (
    <ul>
      {posts.map(post => (
        <li key={post.slug}>
          <a href={`/posts/${post.slug}`}>{post.title}</a>
          <div>
            {post.tags.map(tag => (
              <span key={tag.id}>{tag.name}</span>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
```

**Alternative: Client Component** (if needed):
```typescript
'use client';

import { trpc } from '@/utils/trpc';

export default function PostsPage() {
  const { data: posts, isLoading, error } = trpc.postsList.useQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading posts</div>;
  if (!posts || posts.length === 0) return <div>No posts available</div>;

  return (
    <ul>
      {posts.map(post => (
        <li key={post.slug}>
          <a href={`/posts/${post.slug}`}>{post.title}</a>
          <div>
            {post.tags.map(tag => (
              <span key={tag.id}>{tag.name}</span>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
```

---

## Type Safety Guarantees

1. **Full-stack type safety**: TypeScript ensures frontend and backend use same types
2. **Runtime validation**: Zod validates database results match expected schema
3. **Date serialization**: SuperJSON transformer (already configured) handles Date objects
4. **Compile-time checks**: TypeScript compiler catches type mismatches

---

## Performance Characteristics

**Expected Latency**: <100ms for <100 posts
**Database Queries**: 2 queries (posts + tags)
**Caching**: None (initial implementation)
**Scalability**: Supports up to ~1000 posts before pagination needed

---

## Future Enhancements (Out of Scope)

- Pagination parameters (`offset`, `limit`)
- Filtering parameters (`tagId`, `authorId`)
- Sorting options (`newest`, `oldest`, `popular`)
- Search query parameter

These will be added in future issues (#32 for pagination, #17 for search).

---

**Status**: Contract defined. Implementation ready.
