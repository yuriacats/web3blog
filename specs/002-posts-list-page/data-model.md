# Data Model: Blog Posts List Page

**Feature**: 002-posts-list-page
**Date**: 2026-02-10
**Purpose**: Define data structures and validation rules

## Entities

### PostListItem

Represents a blog post in the list view.

**Purpose**: Provide essential information for displaying a post in the list (title, link, tags).

**Fields**:
| Field | Type | Description | Validation Rules |
|-------|------|-------------|------------------|
| `slug` | string | Unique identifier for the post (20 chars) | Required, exactly 20 characters |
| `title` | string | Post title | Required, min 1 character, max 256 characters |
| `tags` | Tag[] | Array of tags associated with the post | Optional, can be empty array |
| `createDate` | Date | Post creation timestamp | Required, valid Date object |

**Relationships**:
- PostListItem has many Tags (many-to-many via tag_post table)

**State Transitions**: N/A (read-only entity)

**Validation Schema (Zod)**:
```typescript
const PostListItemSchema = z.object({
  slug: z.string().length(20),
  title: z.string().min(1).max(256),
  tags: z.array(TagSchema),
  createDate: z.coerce.date(),
});
```

---

### Tag

Represents a categorization label for posts.

**Purpose**: Allow users to understand post topics at a glance.

**Fields**:
| Field | Type | Description | Validation Rules |
|-------|------|-------------|------------------|
| `id` | number | Unique tag identifier | Required, positive integer |
| `name` | string | Tag display name | Required, min 1 character, max 20 characters |

**Relationships**:
- Tag belongs to many PostListItem (many-to-many via tag_post table)

**State Transitions**: N/A (read-only for this feature)

**Validation Schema (Zod)**:
```typescript
const TagSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(20),
});
```

---

## Database Queries

### Query 1: Fetch All Public Posts

```sql
SELECT
  post.id,
  post.slug,
  post.create_date,
  post_revision.title
FROM post
JOIN (
  SELECT post_id, MAX(id) as max_rev_id
  FROM post_revision
  WHERE public = 1
  GROUP BY post_id
) AS latest
ON post.id = latest.post_id
JOIN post_revision
ON post_revision.id = latest.max_rev_id
ORDER BY post.create_date DESC;
```

**Returns**: Array of `{ id, slug, create_date, title }`

**Validation**: Parse with Zod schema for database results

---

### Query 2: Fetch Tags for Posts

```sql
SELECT
  tag_post.post_id,
  tag_name.id,
  tag_name.name
FROM tag_post
JOIN tag_name ON tag_post.tag_id = tag_name.id
WHERE tag_post.post_id IN (?, ?, ...);
```

**Returns**: Array of `{ post_id, id, name }`

**Validation**: Parse with Zod schema, then group by post_id

---

## Data Flow

```
Database (MySQL)
    ↓
[Query 1: Posts] → Zod Validation → Post[]
[Query 2: Tags]  → Zod Validation → { post_id → Tag[] }
    ↓
Application Layer (Backend Repository)
    ↓
Merge posts with tags → PostListItem[]
    ↓
tRPC Endpoint
    ↓
SuperJSON Serialization (handles Date objects)
    ↓
Frontend (Next.js Server Component)
    ↓
Render UI
```

---

## Type Definitions

### Backend Interface (interface.ts)

```typescript
import { z } from "zod";

export const TagSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(20),
});
export type Tag = z.infer<typeof TagSchema>;

export const PostListItemSchema = z.object({
  slug: z.string().length(20),
  title: z.string().min(1).max(256),
  tags: z.array(TagSchema),
  createDate: z.coerce.date(),
});
export type PostListItem = z.infer<typeof PostListItemSchema>;
```

---

## Database Schema Reference

**Existing Tables** (no modifications):

```sql
CREATE TABLE post(
    id int AUTO_INCREMENT PRIMARY KEY,
    slug varchar(20) UNIQUE NOT NULL,
    create_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE post_revision(
    id int UNIQUE AUTO_INCREMENT PRIMARY KEY,
    create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    title varchar(256) NOT NULL,
    author_id int NOT NULL,
    post_id int NOT NULL,
    public int NOT NULL,  -- 0 = draft, 1 = public
    post_data MEDIUMTEXT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES post(id)
);

CREATE TABLE tag_name(
    id int AUTO_INCREMENT PRIMARY KEY,
    name varchar(20) UNIQUE NOT NULL
);

CREATE TABLE tag_post(
    tag_id int NOT NULL,
    post_id int NOT NULL,
    FOREIGN KEY (tag_id) REFERENCES tag_name(id),
    FOREIGN KEY (post_id) REFERENCES post(id)
);
```

---

## Edge Cases

1. **Post with no tags**: `tags` array will be empty `[]`
2. **Multiple revisions**: Only latest public revision is fetched
3. **All posts are drafts**: Empty array returned (handled by empty state in UI)
4. **Very long titles**: Database enforces 256 char limit, Zod validates

---

**Status**: Data model defined. Ready for API contracts and quickstart guide.
