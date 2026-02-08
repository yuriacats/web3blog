# Implementation Plan: Dependency and Runtime Version Upgrades

**Branch**: `001-dependency-upgrades` | **Date**: 2026-02-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-dependency-upgrades/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Upgrade all runtime and package dependencies to their latest stable versions to eliminate security vulnerabilities, enable access to latest framework features, and benefit from performance improvements. This includes upgrading Node.js to the latest LTS, updating all frontend (Next.js, React, tRPC client) and backend (Express, tRPC server, Jest) dependencies, resolving breaking changes, and updating all environment configurations (dev containers, CI/CD pipelines).

## Technical Context

**Current Runtime**: Node.js 20.x
**Target Runtime**: Node.js 22.x LTS (latest as of 2026-02-08)
**Package Manager**: pnpm (high performance, disk-efficient package manager)
**Project Type**: Monorepo (web application with separate frontend and backend)
**Primary Dependencies (Frontend)**:
  - Next.js 13.4.4 → latest stable
  - React 18.2.0 → latest stable
  - tRPC 10.29.0 → latest stable
  - React Query 4.29.12 → latest stable
  - Storybook 7.0.18 → latest stable
  - TypeScript 5.1.6 → latest stable

**Primary Dependencies (Backend)**:
  - Express 4.18.2 → latest stable
  - tRPC Server 10.29.0 → latest stable
  - Jest 29.6.1 → latest stable
  - TypeScript 5.0.4 → latest stable
  - promise-mysql 5.2.0 → latest stable

**Storage**: MySQL (no schema changes required)
**Testing**: Jest (backend), Storybook (frontend components)
**Target Platform**: Docker containers, AWS deployment
**Performance Goals**: Maintain or improve current build times (<5 min), maintain runtime performance within 10% of baseline
**Constraints**:
  - Zero downtime for development workflow
  - Must preserve full type safety between frontend/backend (tRPC contract integrity)
  - All existing tests must pass
  - No user-facing feature regressions
**Scale/Scope**: Monorepo with 2 main packages (frontend + backend), ~60 total npm dependencies

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Type Safety First
- **Status**: PASS
- **Rationale**: This upgrade explicitly preserves type safety by maintaining tRPC version compatibility between frontend and backend. All TypeScript strict mode settings will be preserved. Breaking changes will be resolved through code modifications that maintain type safety.

### ✅ Monorepo Architecture
- **Status**: PASS
- **Rationale**: Upgrade respects monorepo structure by coordinating frontend and backend dependency updates. tRPC versions will be aligned to preserve shared type definitions. Each package (front/, backend/) will be upgraded independently but with version compatibility ensured.

### ✅ Structured Development with spec-kit
- **Status**: PASS
- **Rationale**: This upgrade is being executed through the spec-kit workflow (spec.md → plan.md → tasks.md → implement). All changes will be documented and tracked.

### ✅ Testing Strategy
- **Status**: PASS
- **Rationale**: Upgrade includes running all existing tests (Jest backend tests, frontend builds) as acceptance criteria. Test infrastructure itself (Jest, Storybook) will be upgraded while ensuring all tests continue to pass.

### ✅ Developer Experience
- **Status**: PASS
- **Rationale**: Dev container, Docker Compose, and development scripts will be updated for the new Node.js version. ESLint and Prettier configurations will be verified for compatibility. Hot reload functionality will be preserved.

### Quality Standards Gates

#### Code Quality
- **Status**: PASS
- **Gate**: TypeScript errors must remain zero, ESLint errors must remain zero
- **Verification**: CI/CD builds will validate this before merge

#### Security
- **Status**: PASS - PRIMARY DRIVER
- **Gate**: Security audit must show zero high/critical vulnerabilities
- **Verification**: npm audit output is a success criterion (SC-002)

#### Performance
- **Status**: PASS
- **Gate**: Build time must remain under 5 minutes, startup time within 10% of baseline
- **Verification**: Measured before and after upgrade (SC-004, SC-007)

### 🔄 Re-evaluation After Phase 1
Will re-check after design phase to ensure no constitution violations introduced during planning.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# Monorepo structure (web application)
front/
├── src/
│   ├── app/           # Next.js App Router pages
│   ├── component/     # React components
│   └── lib/           # Utilities
├── public/            # Static assets
├── .storybook/        # Storybook config
├── package.json       # Frontend dependencies (UPGRADE TARGET)
└── package-lock.json  # Frontend lockfile (REGENERATE)

backend/
├── src/
│   ├── repositories/  # Data access
│   └── utils/         # Utilities
├── test/              # Jest tests
├── package.json       # Backend dependencies (UPGRADE TARGET)
└── package-lock.json  # Backend lockfile (REGENERATE)

db/                    # MySQL setup (no changes)
integration/           # Integration tests (out of scope)

# Configuration files to update
.devcontainer/         # Dev container config (Node version)
docker-compose.yml     # Docker Compose (Node base images)
Dockerfile             # Both front/ and backend/ (Node base images)
.github/workflows/     # CI/CD configs (Node version)
```

**Structure Decision**: This is a monorepo with separate frontend and backend packages. Dependency upgrades must be coordinated across both packages to maintain tRPC type safety. Each package has its own package.json and will be upgraded independently, but tRPC versions must align. Infrastructure configurations (Docker, CI/CD) that specify Node.js version must all be updated consistently.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations detected. All gates pass.
