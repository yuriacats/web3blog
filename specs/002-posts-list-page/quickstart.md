# Quick Start: Blog Posts List Page

**Feature**: 002-posts-list-page
**Purpose**: How to run and test the posts list feature locally

## Prerequisites

- Docker and Docker Compose installed
- Node.js 22.x and pnpm installed (for local development)
- Project dependencies installed (`pnpm install` in both `front/` and `backend/`)

## Running the Feature

### 1. Start the Full Stack

```bash
# From project root
docker-compose up
```

**Services Started**:
- `db`: MySQL database (port 3306)
- `backend`: Express + tRPC API (port 8000)
- `frontend`: Next.js application (port 3000)

### 2. Verify Database is Ready

```bash
# Check database has test data
docker-compose exec db mysql -u backend -ptoor -e "USE webblog; SELECT COUNT(*) FROM post;"
```

**Expected Output**: Should show at least 1 post

### 3. Access the Posts List Page

Open in browser: http://localhost:3000/posts

**Expected Behavior**:
- See a list of blog posts
- Each post shows: title (clickable link), tags
- Posts ordered newest first
- If no posts: "No posts available yet" message

---

## Testing the tRPC Endpoint Directly

### Backend API Test

```bash
# Test the postsList endpoint
curl -X GET http://localhost:8000/trpc/postsList \
  -H "Content-Type: application/json"
```

**Expected Response**:
```json
{
  "result": {
    "data": [
      {
        "slug": "ABC123XYZ456DEFGH789",
        "title": "Sample Blog Post",
        "tags": [
          { "id": 1, "name": "tech" },
          { "id": 2, "name": "tutorial" }
        ],
        "createDate": "2023-06-01T12:00:00.000Z"
      }
    ]
  }
}
```

---

## Development Workflow

### Backend Development

```bash
# Terminal 1: Run backend in dev mode
cd backend
pnpm run dev
```

**Backend runs on**: http://localhost:8000
**Hot Reload**: Enabled via ts-node

### Frontend Development

```bash
# Terminal 2: Run frontend in dev mode
cd front
pnpm run dev
```

**Frontend runs on**: http://localhost:4000 (dev mode)
**Hot Reload**: Enabled via Next.js

---

## Running Tests

### Backend Unit Tests

```bash
cd backend
pnpm test
```

**Tests for this feature**:
- `test/repositories/post.test.ts`: Tests for `fetchAllPosts()` function

### Frontend Manual Testing

1. Navigate to http://localhost:3000/posts
2. Verify posts list displays
3. Click on a post title → should navigate to `/posts/[slug]`
4. Verify tags are displayed
5. Check empty state (temporarily clear database)

---

## Verifying Database Connectivity

### Check MySQL Connection

```bash
# Connect to database
docker-compose exec db mysql -u backend -ptoor webblog
```

```sql
-- Verify posts table
SELECT * FROM post;

-- Verify post_revision table (check public column)
SELECT * FROM post_revision;

-- Verify tags
SELECT * FROM tag_name;

-- Verify post-tag relationships
SELECT * FROM tag_post;
```

### Check Backend Database Connection

```bash
# Check backend logs for database connection
docker-compose logs backend | grep -i mysql
```

**Expected**: No connection errors

---

## Common Issues & Solutions

### Issue: "No posts available"

**Cause**: Database might be empty or all posts are drafts

**Solution**:
```bash
# Check if posts exist
docker-compose exec db mysql -u backend -ptoor -e "USE webblog; SELECT * FROM post;"

# Check if revisions are public
docker-compose exec db mysql -u backend -ptoor -e "USE webblog; SELECT post_id, public FROM post_revision;"

# Insert test data if needed
docker-compose exec db mysql -u backend -ptoor webblog < db/10_testData.sql
```

### Issue: "Cannot connect to database"

**Cause**: Database container not running or wrong credentials

**Solution**:
```bash
# Restart database
docker-compose restart db

# Check database logs
docker-compose logs db

# Verify environment variables in backend
docker-compose exec backend env | grep SQL
```

### Issue: TypeScript errors

**Cause**: Type definitions not matching

**Solution**:
```bash
# Rebuild backend
cd backend
pnpm run build

# Rebuild frontend
cd front
pnpm run build
```

---

## Feature Verification Checklist

- [ ] Docker Compose starts all services without errors
- [ ] Database contains at least one public post
- [ ] Backend responds to `http://localhost:8000/trpc/postsList`
- [ ] Frontend displays posts at `http://localhost:3000/posts`
- [ ] Post titles are clickable links
- [ ] Tags are displayed for each post
- [ ] Posts are ordered newest first
- [ ] Empty state works (when no posts)
- [ ] TypeScript compiles without errors
- [ ] Backend tests pass

---

## Next Steps

After verification:
1. Run `/speckit.tasks` to generate implementation tasks
2. Follow tasks to implement the feature
3. Run tests after each major change
4. Commit changes incrementally

---

**Last Updated**: 2026-02-10
