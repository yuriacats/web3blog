# Tasks: Blog Posts List Page

**Input**: Design documents from `/specs/002-posts-list-page/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No explicit test tasks requested in spec.md. Backend repository function will be tested manually during development. Formal Jest tests are optional enhancement.

**Organization**: Tasks are grouped by user story (US1: Browse posts, US2: Empty state) to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Monorepo structure**: `backend/src/`, `front/src/app/` at repository root
- **Backend**: TypeScript files in `backend/src/`
- **Frontend**: Next.js App Router pages in `front/src/app/`

---

## Phase 1: Setup (Verification & Preparation)

**Purpose**: Verify existing infrastructure is ready and prepare for implementation

- [ ] T001 Verify database connection and schema: Run `docker-compose up -d db && docker-compose exec db mysql -u backend -ptoor -e "USE webblog; SHOW TABLES;"`
- [ ] T002 Verify test data exists: Run `docker-compose exec db mysql -u backend -ptoor -e "USE webblog; SELECT COUNT(*) FROM post;"`
- [ ] T003 [P] Verify backend builds: Run `cd backend && pnpm run build`
- [ ] T004 [P] Verify frontend builds: Run `cd front && pnpm run build`
- [ ] T005 Verify tRPC infrastructure: Check `backend/src/index.ts` exports `appRouter` and `frontend` can import types

**Checkpoint**: All infrastructure verified - ready for implementation

---

## Phase 2: Foundational (Type Definitions & Database Access)

**Purpose**: Core type definitions and database utilities that ALL user stories depend on

**⚠️ CRITICAL**: These must be complete before any user story implementation can begin

- [ ] T006 [P] Add Tag type to `backend/src/interface.ts`: Define `TagSchema` and `Tag` type using Zod
- [ ] T007 [P] Add PostListItem type to `backend/src/interface.ts`: Define `PostListItemSchema` and `PostListItem` type with slug, title, tags[], createDate
- [ ] T008 Create database connection helper if not exists: Verify `backend/src/repository.ts` exports `connection()` function (already exists)

**Checkpoint**: Type definitions ready - user stories can now be implemented

---

## Phase 3: User Story 1 - Browse Recent Blog Posts (Priority: P1) 🎯 MVP

**Goal**: Display a list of all public blog posts with titles, clickable links, tags, ordered newest first

**Independent Test**: Navigate to `http://localhost:3000/posts` and verify that posts list displays with titles (clickable), tags, and newest posts appear first. Click a post title and verify it navigates to `/posts/[slug]`.

**Acceptance Criteria** (from spec.md):
- ✅ List of posts with titles and clickable links displayed
- ✅ Tags shown for each post
- ✅ Posts ordered newest first
- ✅ Links navigate to correct detail page

### Implementation for User Story 1

#### Backend: Database Repository

- [ ] T009 [US1] Implement `fetchAllPosts()` in `backend/src/repositories/post.ts`: Create function that executes two-query pattern (posts query + tags query) and returns `PostListItem[]`
- [ ] T010 [US1] Add posts query in `fetchAllPosts()`: SELECT post.id, post.slug, post.create_date, post_revision.title FROM post JOIN (latest public revision subquery) ORDER BY create_date DESC
- [ ] T011 [US1] Add tags query in `fetchAllPosts()`: SELECT tag_post.post_id, tag_name.id, tag_name.name FROM tag_post JOIN tag_name WHERE post_id IN (...)
- [ ] T012 [US1] Implement data merging logic in `fetchAllPosts()`: Combine posts and tags into `PostListItem[]` with proper Zod validation

#### Backend: tRPC Endpoint

- [ ] T013 [US1] Add `postsList` endpoint to `backend/src/index.ts`: Define `t.procedure.query()` that calls `fetchAllPosts()` and returns `Promise<PostListItem[]>`
- [ ] T014 [US1] Verify tRPC endpoint type export: Ensure `AppRouter` type includes `postsList` for frontend type safety

#### Frontend: Posts List Page

- [ ] T015 [US1] Replace 501 stub in `front/src/app/posts/page.tsx`: Create Server Component that calls `trpc.postsList.query()`
- [ ] T016 [US1] Implement posts list rendering: Map over `posts` array and render each post with `<Link href={/posts/${post.slug}}>{post.title}</Link>`
- [ ] T017 [US1] Implement tags rendering: For each post, map over `post.tags` and display tag names (e.g., `<span>{tag.name}</span>`)
- [ ] T018 [US1] Add basic styling: Apply minimal CSS for readability (list formatting, link styling, tag display)

#### Verification

- [ ] T019 [US1] Manual test: Start `docker-compose up`, navigate to `http://localhost:3000/posts`, verify posts display correctly
- [ ] T020 [US1] Test clickable links: Click on a post title, verify navigation to `/posts/[slug]` works
- [ ] T021 [US1] Test tags display: Verify all tags for each post are visible
- [ ] T022 [US1] Test ordering: Verify posts are ordered newest first (check `create_date`)

**Checkpoint**: User Story 1 complete - MVP functional (blog posts browsable)

---

## Phase 4: User Story 2 - Navigate Empty State Gracefully (Priority: P2)

**Goal**: Display a clear message when no posts are available instead of showing an empty or confusing page

**Independent Test**: Temporarily clear the database or set all posts to `public=0`, navigate to `/posts`, and verify a friendly "No posts available" message is displayed.

**Acceptance Criteria** (from spec.md):
- ✅ Empty state message displays when no posts exist
- ✅ Only public posts shown (drafts excluded)

### Implementation for User Story 2

- [ ] T023 [US2] Add empty state check in `front/src/app/posts/page.tsx`: Add conditional `if (posts.length === 0)` before rendering list
- [ ] T024 [US2] Implement empty state UI: Return JSX with message like "No posts available yet. Check back soon!"
- [ ] T025 [US2] Add basic styling for empty state: Apply centered layout and appropriate typography

#### Verification

- [ ] T026 [US2] Test empty state: Run `docker-compose exec db mysql -u backend -ptoor -e "USE webblog; UPDATE post_revision SET public=0;"` then reload `/posts`
- [ ] T027 [US2] Verify empty message displays: Confirm friendly message appears (not blank page or error)
- [ ] T028 [US2] Restore test data: Run `docker-compose exec db mysql -u backend -ptoor webblog < db/10_testData.sql` to restore posts

**Checkpoint**: User Story 2 complete - Graceful empty state handling

---

## Phase 5: Polish & Final Verification

**Purpose**: Final integration testing, code quality, and documentation

- [ ] T029 [P] Run TypeScript compiler on backend: `cd backend && npx tsc --noEmit` (verify zero errors)
- [ ] T030 [P] Run TypeScript compiler on frontend: `cd front && npx tsc --noEmit` (verify zero errors)
- [ ] T031 [P] Run ESLint on backend: `cd backend && pnpm run lint` (verify zero errors)
- [ ] T032 [P] Run ESLint on frontend: `cd front && pnpm run lint` (verify zero errors)
- [ ] T033 Run full integration test: Start `docker-compose up`, verify all services start without errors
- [ ] T034 Manual functional test: Perform complete user journey - view posts list, click links, verify tags, test empty state
- [ ] T035 Verify performance goal: Measure page load time for `/posts` (should be <2 seconds)
- [ ] T036 Check edge cases: Test posts without tags (verify empty array), long titles (verify truncation if needed), database failures (verify error handling)
- [ ] T037 Update documentation if needed: Add any relevant notes to `quickstart.md` or README about new posts list page
- [ ] T038 Commit changes: `git add -A && git commit -m "Implement posts list page (Issue #16)"`

**Checkpoint**: Feature complete and verified

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - Core functionality (MVP)
- **User Story 2 (Phase 4)**: Depends on User Story 1 (uses same component, adds empty state check)
- **Polish (Phase 5)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1 - Browse Posts)**: Independent - can start after Foundational
- **User Story 2 (P2 - Empty State)**: Depends on US1 (modifies same page component)

### Within Each User Story

**US1 (Browse Posts)**:
- Backend tasks (T009-T014): Can run in parallel after Foundational complete
- Frontend tasks (T015-T018): Must wait for backend tRPC endpoint (T013 complete)
- Verification (T019-T022): Sequential after implementation complete

**US2 (Empty State)**:
- Implementation (T023-T025): Must wait for US1 complete (modifies same component)
- Verification (T026-T028): Sequential after T025

### Parallel Opportunities

**Setup (Phase 1)**:
- T003-T004: Backend and frontend builds (parallel)

**Foundational (Phase 2)**:
- T006-T007: Type definitions (parallel - different types)

**US1 Backend**:
- T009-T012: Repository implementation (sequential - T012 depends on T009-T011)
- T013-T014: tRPC endpoint (sequential - T014 depends on T013)

**US1 Frontend**:
- T015-T018: Page implementation (sequential - build on same file)

**Polish (Phase 5)**:
- T029-T032: Linting and type checking (4 parallel tasks)

---

## Implementation Strategy

### MVP First (User Story 1 Only - Browse Posts)

1. **Complete Phase 1: Setup** (T001-T005) - Verify infrastructure
2. **Complete Phase 2: Foundational** (T006-T008) - Type definitions
3. **Complete Phase 3: User Story 1** (T009-T022) - Core posts list functionality
4. **STOP and VALIDATE**:
   - Posts list displays correctly
   - Links work
   - Tags show
   - Performance acceptable
5. **Deploy/Demo if ready** - Blog is browsable (MVP achieved)

### Incremental Delivery

1. **Foundation** (Phases 1-2) → Infrastructure ready
2. **User Story 1** (Phase 3) → Deploy/Demo (MVP - browsable blog)
3. **User Story 2** (Phase 4) → Deploy/Demo (graceful empty state)
4. **Polish** (Phase 5) → Final quality gates passed

---

## Success Criteria Mapping

| Success Criterion | Verified By | Task IDs |
|-------------------|-------------|----------|
| SC-001: Page load <2 seconds | Performance test | T035 |
| SC-002: 100% links navigate correctly | Manual link testing | T020 |
| SC-003: All tags visible | Manual tags inspection | T021 |
| SC-004: Consistent newest-first order | Manual ordering check | T022 |
| SC-005: Handles empty/100+ posts | Edge case testing | T036 |
| SC-006: Zero draft posts displayed | Database query verification | T002, T010 |

---

## Estimated Effort

| Phase | User Story | Task Count | Estimated Time | Cumulative |
|-------|------------|------------|----------------|------------|
| 1: Setup | - | 5 | 10 min | 10 min |
| 2: Foundational | - | 3 | 15 min | 25 min |
| 3: US1 Backend | Browse Posts | 6 | 45 min | 70 min |
| 3: US1 Frontend | Browse Posts | 4 | 30 min | 100 min |
| 3: US1 Verification | Browse Posts | 4 | 15 min | 115 min |
| 4: US2 | Empty State | 6 | 20 min | 135 min |
| 5: Polish | - | 10 | 25 min | 160 min |

**Total**: 38 tasks, ~2.5 hours estimated

**Recommended**: Execute in one session with checkpoint validations between user stories.

---

## Notes

- **Existing Infrastructure**: tRPC, database connection, and routing already configured
- **Minimal Scope**: Straightforward read operation, no complex business logic
- **Manual Testing**: Sufficient for MVP (Jest tests optional enhancement)
- **Type Safety**: tRPC provides full-stack type safety automatically
- **Future Enhancements**: Pagination (#32), search (#17) are separate issues

---

**Status**: Tasks ready for implementation. Start with Phase 1 (Setup).
