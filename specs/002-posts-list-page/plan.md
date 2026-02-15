# Implementation Plan: Blog Posts List Page

**Branch**: `002-posts-list-page` | **Date**: 2026-02-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-posts-list-page/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Create a blog posts list page at `/posts` that displays all public blog posts with their titles (as clickable links to detail pages), associated tags, ordered by creation date (newest first). The page fetches data from the existing database schema via a new tRPC endpoint and handles empty states gracefully.

## Technical Context

**Language/Version**: TypeScript 5.9.3, Node.js 22.x
**Primary Dependencies**:
- **Frontend**: Next.js 15.5.12 (App Router), React 19.2.4, tRPC Client 11.9.0, @tanstack/react-query 5.90.20
- **Backend**: Express 5.2.1, tRPC Server 11.9.0, promise-mysql 5.2.0, Zod 4.3.6

**Storage**: MySQL 8.0 (existing schema: post, post_revision, tag_name, tag_post tables)
**Testing**: Jest 30.2.0 (backend), manual testing (frontend), integration tests (optional)
**Target Platform**: Web application (Docker containers, AWS deployment)
**Project Type**: Monorepo web application (separate frontend and backend)
**Performance Goals**: Page load <2 seconds, support 100+ posts without pagination initially
**Constraints**:
- Must use existing database schema (no schema modifications)
- Must preserve type safety (tRPC contract)
- Must filter public posts only (post_revision.public = 1)
- Must handle posts with no tags

**Scale/Scope**: Single page component, 1 new tRPC endpoint, minimal UI styling

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Type Safety First
- **Status**: PASS
- **Rationale**: tRPC endpoint will provide full-stack type safety. Zod schemas will validate database results. TypeScript strict mode enforced.

### ✅ Monorepo Architecture
- **Status**: PASS
- **Rationale**: Feature follows monorepo structure - frontend in `front/`, backend in `backend/`. Changes are isolated to these two apps. No modifications to `integration/` or `db/` required.

### ✅ Structured Development with spec-kit
- **Status**: PASS
- **Rationale**: Following spec-kit workflow: spec.md → plan.md → tasks.md → implement. This plan documents design before implementation.

### ✅ Testing Strategy
- **Status**: PASS
- **Rationale**: Backend endpoint will have Jest unit tests. Frontend can be manually tested. Type safety provided by TypeScript. Integration tests optional (existing integration/ project can be extended if needed).

### ✅ Developer Experience
- **Status**: PASS
- **Rationale**: Existing Docker Compose setup will work unchanged. Hot reload available for both frontend and backend. ESLint + Prettier configurations already in place.

### Quality Standards Gates

#### Code Quality
- **Status**: PASS
- **Gate**: TypeScript errors must be zero, ESLint errors must be zero
- **Verification**: `pnpm run build` (both frontend and backend), `pnpm run lint`

#### Security
- **Status**: PASS
- **Gate**: Input validation (Zod), SQL injection prevention (parameterized queries already in use), XSS prevention (React auto-escaping)
- **Verification**: Zod schema validation for all inputs, existing `promise-mysql` uses parameterized queries

#### Performance
- **Status**: PASS (initial implementation)
- **Gate**: Page load <2 seconds
- **Note**: Pagination (Issue #32) will be added later for improved performance with large datasets

### 🔄 Re-evaluation After Phase 1

**Re-check Complete**: All constitution principles remain satisfied after design phase.

✅ **Type Safety First**: tRPC endpoint defined with full type safety (PostListItem[], Tag types). Zod schemas validate all data.

✅ **Monorepo Architecture**: No changes to monorepo structure. Changes isolated to `backend/src/repositories/post.ts`, `backend/src/interface.ts`, `backend/src/index.ts`, and `front/src/app/posts/page.tsx`.

✅ **Structured Development**: Completed spec.md → plan.md → research.md → data-model.md → contracts/ → quickstart.md. Following spec-kit workflow.

✅ **Testing Strategy**: Backend tests planned (Jest for `fetchAllPosts()`). Frontend manual testing sufficient for MVP.

✅ **Developer Experience**: No changes to Docker Compose, dev containers, or tooling. Existing hot reload and linting continue to work.

**Conclusion**: No constitution violations. Design is compliant and ready for implementation.

## Project Structure

### Documentation (this feature)

```text
specs/002-posts-list-page/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── repositories/
│   │   └── post.ts           # [MODIFY] Add fetchAllPosts() function
│   ├── interface.ts           # [MODIFY] Add PostListItem type
│   ├── index.ts               # [MODIFY] Add postsList endpoint to appRouter
│   └── utils/
│       └── slug.ts            # [EXISTING] No changes needed
└── test/
    └── repositories/
        └── post.test.ts       # [NEW] Tests for fetchAllPosts()

frontend/
├── src/
│   └── app/
│       └── posts/
│           └── page.tsx       # [MODIFY] Replace 501 stub with actual implementation
└── (no new test files - manual testing)

db/
└── (no changes - existing schema used)

integration/
└── (no changes - optional integration tests can be added later)
```

**Structure Decision**: This is a web application (frontend + backend). Following the existing monorepo structure with separate `front/` and `backend/` directories. No new directories needed - all changes are additions/modifications to existing files.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No violations. All constitution principles are satisfied.*

---

## Phase 0: Research & Technical Decisions

**Purpose**: Resolve technical unknowns and establish implementation patterns

### Research Topics

1. **Database Query Pattern**: How to efficiently fetch posts with tags (LEFT JOIN vs separate queries)
2. **tRPC Endpoint Design**: Best practices for list endpoints in tRPC 11
3. **Empty State Handling**: React patterns for graceful empty state display

---

## Phase 1: Design Artifacts

### Data Model (`data-model.md`)

Will define:
- **PostListItem**: Type for list view (title, slug, tags[], createDate)
- **Tag**: Tag information included in posts
- Database query result schema (Zod validation)

### API Contracts (`contracts/`)

Will generate:
- tRPC procedure signature for `postsList` endpoint
- Input schema (none - no parameters)
- Output schema (array of PostListItem)

### Quick Start (`quickstart.md`)

Will document:
- How to run the feature locally
- How to test the posts list endpoint
- How to verify database connectivity

---

## Phase 2: Implementation Tasks (Generated by `/speckit.tasks`)

Tasks will be generated in the next command.

---

## Notes

- **Existing Infrastructure**: tRPC setup, database connection, and basic routing already in place
- **Minimal Scope**: This is a straightforward CRUD read operation with no complex business logic
- **Future Enhancements**: Pagination (#32), search (#17) are separate issues and out of scope
- **Testing**: Backend unit tests required, frontend manual testing sufficient for MVP
