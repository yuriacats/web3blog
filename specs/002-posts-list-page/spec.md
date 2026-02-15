# Feature Specification: Blog Posts List Page

**Feature Branch**: `002-posts-list-page`
**Created**: 2026-02-10
**Status**: Draft
**Input**: User description: "Issue #16: Create posts/page.tsx to display a list of blog posts with links, titles, and tags"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse Recent Blog Posts (Priority: P1)

Visitors want to see a list of available blog posts so they can discover and navigate to content that interests them.

**Why this priority**: This is the core functionality of a blog - without a browsable list of posts, visitors cannot discover content. This is the minimum viable feature that delivers immediate user value.

**Independent Test**: Can be fully tested by visiting `/posts` and verifying that a list of posts with titles, links, and tags is displayed. Delivers immediate value by enabling content discovery.

**Acceptance Scenarios**:

1. **Given** the blog has published posts, **When** a visitor navigates to `/posts`, **Then** they see a list of post titles with clickable links
2. **Given** posts have associated tags, **When** the posts list is displayed, **Then** each post shows its associated tags
3. **Given** multiple posts exist, **When** the visitor views the list, **Then** posts are displayed in reverse chronological order (newest first)
4. **Given** a visitor clicks on a post title, **When** the link is followed, **Then** they are taken to the individual post page (`/posts/[slug]`)

---

### User Story 2 - Navigate Empty State Gracefully (Priority: P2)

When no posts are available, visitors should see a clear message rather than a confusing empty page.

**Why this priority**: Edge case handling improves user experience but is not critical for MVP. The blog will have at least one test post in most scenarios.

**Independent Test**: Can be tested by viewing `/posts` with an empty database and verifying a friendly "no posts" message is displayed.

**Acceptance Scenarios**:

1. **Given** no blog posts exist, **When** a visitor navigates to `/posts`, **Then** they see a message indicating no posts are available
2. **Given** all posts are drafts (not public), **When** a visitor views `/posts`, **Then** only public posts are shown (or empty state if none are public)

---

### Edge Cases

- What happens when a post has no tags assigned?
- How does the system handle posts with very long titles (>256 characters)?
- What happens if the database connection fails while fetching the posts list?
- How are draft posts (public=0 in post_revision) excluded from the public list?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a list of all public blog posts on the `/posts` route
- **FR-002**: System MUST show the post title for each entry in the list
- **FR-003**: System MUST provide a clickable link to each post's detail page (`/posts/[slug]`)
- **FR-004**: System MUST display all tags associated with each post
- **FR-005**: System MUST order posts by creation date, with newest posts first
- **FR-006**: System MUST only display posts marked as public (exclude drafts)
- **FR-007**: System MUST show an appropriate message when no posts are available
- **FR-008**: System MUST fetch posts from the existing database schema (post, post_revision, tag_name, tag_post tables)
- **FR-009**: System MUST handle posts without tags gracefully (display post without tag list)

### Key Entities *(include if feature involves data)*

- **Post**: Represents a blog article with title, slug (unique identifier), creation date, and publication status
- **Tag**: Categorization label associated with posts, allowing content organization
- **Post Revision**: Versioned content for a post, including title, content, and public/draft status
- **Post-Tag Relationship**: Many-to-many association between posts and tags

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Visitors can view the posts list page and see all public posts within 2 seconds of page load
- **SC-002**: 100% of clickable post links navigate to the correct individual post page
- **SC-003**: All tags associated with each post are visible in the list view
- **SC-004**: Posts are consistently ordered by creation date (newest first) across all page views
- **SC-005**: Page displays gracefully with no posts (empty state) or with 100+ posts (performance maintained)
- **SC-006**: Zero public draft posts are accidentally displayed in the list

## Scope

### In Scope

- Displaying a basic list of blog posts with title, link, and tags
- Fetching data from existing database schema
- Ordering posts by creation date (newest first)
- Filtering out draft/unpublished posts
- Handling empty state (no posts available)
- Basic styling consistent with existing application design

### Out of Scope

- Pagination or infinite scroll (covered in Issue #32)
- Search functionality (covered in Issue #17)
- Tag filtering or tag-based navigation (covered in Issue #17)
- Sorting options (e.g., by popularity, alphabetical)
- Post previews or excerpts (not required in Issue #16)
- Author information display (not mentioned in requirements)
- Date display for posts (not mentioned in requirements)

## Assumptions

- The existing database schema (post, post_revision, tag_name, tag_post) is correct and contains the necessary data
- At least one public post exists for testing (from `db/10_testData.sql`)
- The individual post detail page (`/posts/[slug]`) already exists or is being implemented in parallel (Issue #15)
- Tags are optional for posts (a post can exist without tags)
- "Public" posts are determined by `post_revision.public = 1`
- The most recent post_revision for a post determines its current state
- Performance is acceptable without pagination for the initial implementation (pagination is a separate issue #32)

## Dependencies & Constraints

### Dependencies

- Existing database schema must be available and populated
- Database connection from backend to MySQL must be functional
- tRPC infrastructure must be set up for frontend-backend communication (already exists in codebase)

### Constraints

- Must use existing monorepo structure (frontend in `front/`, backend in `backend/`)
- Must use existing tRPC setup for type-safe API calls
- Must follow Next.js 15 App Router conventions (already in use)
- Must integrate with existing design system (minimal styling consistency required)
- Must not modify database schema (work with existing tables)

## Open Questions

*None at this time. All requirements are sufficiently defined based on Issue #16 description and existing codebase structure.*
