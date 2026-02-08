# Tasks: Dependency and Runtime Version Upgrades (pnpm)

**Input**: Design documents from `/specs/001-dependency-upgrades/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Package Manager**: pnpm (faster, more disk-efficient than npm)
**Tests**: No explicit test tasks - validation occurs through existing test suite execution after each phase
**Focus**: Security-driven upgrade - eliminate vulnerabilities, verify functionality

**Organization**: Tasks are grouped by user story (security → features → performance) to enable independent implementation and testing of each upgrade phase.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1=Security, US2=Features, US3=Performance)
- Include exact file paths in descriptions

## Path Conventions

- **Monorepo structure**: `front/`, `backend/` at repository root
- Infrastructure configs: `front/Dockerfile`, `backend/Dockerfile`, `docker-compose.yml`, `.github/workflows/`
- Dependency manifests: `front/package.json`, `backend/package.json`
- Lockfiles: `front/pnpm-lock.yaml`, `backend/pnpm-lock.yaml`

---

## Phase 1: Setup (Prerequisites & Baseline)

**Purpose**: Verify current application works before starting upgrade

- [ ] T001 Verify current application works: Run `docker-compose up` and manually test that frontend and backend start successfully
- [ ] T002 [P] Capture frontend security audit baseline: `cd front && pnpm audit --json > ../specs/001-dependency-upgrades/pre-upgrade-frontend-audit.json`
- [ ] T003 [P] Capture backend security audit baseline: `cd backend && pnpm audit --json > ../specs/001-dependency-upgrades/pre-upgrade-backend-audit.json`
- [ ] T004 Commit baseline with tag: `git add specs/001-dependency-upgrades/pre-upgrade-*-audit.json && git commit -m "Capture security audit baseline" && git tag upgrade-baseline`

**Checkpoint**: Baseline captured - upgrade can begin

---

## Phase 2: Foundational (Runtime + pnpm Enablement) 🔧

**Purpose**: Upgrade Node.js runtime and enable pnpm - BLOCKS all dependency upgrades

**⚠️ CRITICAL**: All user story dependency upgrades require Node.js 22 runtime and pnpm

**Maps to**: Infrastructure requirement FR-001, FR-011, FR-012 from spec.md

- [ ] T005 [P] Update frontend Dockerfile for Node 22 and pnpm: Replace `FROM node:20-alpine` with `FROM node:22-alpine` and add `RUN corepack enable pnpm` in `front/Dockerfile`
- [ ] T006 [P] Update frontend Dockerfile package commands: Change `COPY package*.json` to `COPY package.json pnpm-lock.yaml*`, `RUN npm install` to `RUN pnpm install --frozen-lockfile`, and `CMD ["npm", "start"]` to `CMD ["pnpm", "start"]` in `front/Dockerfile`
- [ ] T007 [P] Update backend Dockerfile for Node 22 and pnpm: Replace `FROM node:20-alpine` with `FROM node:22-alpine` and add `RUN corepack enable pnpm` in `backend/Dockerfile`
- [ ] T008 [P] Update backend Dockerfile package commands: Change `COPY package*.json` to `COPY package.json pnpm-lock.yaml*`, `RUN npm install` to `RUN pnpm install --frozen-lockfile`, and `CMD ["npm", "start"]` to `CMD ["pnpm", "start"]` in `backend/Dockerfile`
- [ ] T009 Update docker-compose.yml if needed: Update base images to node:22-alpine if explicitly specified in `docker-compose.yml`
- [ ] T010 [P] Update frontend package.json engine: Set `"engines": { "node": ">=22.0.0 <23.0.0" }` in `front/package.json`
- [ ] T011 [P] Update backend package.json engine: Set `"engines": { "node": ">=22.0.0 <23.0.0" }` in `backend/package.json`
- [ ] T012 Update CI/CD workflows for Node 22: Find all `.github/workflows/*.yml` files and update `node-version` to `'22'`
- [ ] T013 Update dev container config if exists: Update Node version to 22 in `.devcontainer/devcontainer.json`
- [ ] T014 Rebuild Docker images: Run `docker-compose build --no-cache` to verify builds succeed with Node 22 and pnpm
- [ ] T015 Verify Node and pnpm in containers: Run `docker-compose up -d && docker-compose exec frontend sh -c "node --version && pnpm --version" && docker-compose exec backend sh -c "node --version && pnpm --version"` (should show v22.x.x and pnpm version)
- [ ] T016 Test application starts with new runtime: Run `docker-compose up` and verify frontend and backend start without errors
- [ ] T017 Commit Phase A (Runtime + pnpm): `git add -A && git commit -m "Phase A: Upgrade Node.js to 22.x and enable pnpm" && git tag upgrade-phase-a`

**Checkpoint**: Node.js 22 + pnpm enabled - dependency upgrades can now begin in parallel

---

## Phase 3: User Story 1 - Security Vulnerability Remediation (Priority: P1) 🎯 MVP

**Goal**: Eliminate all high and critical security vulnerabilities by upgrading dependencies to latest secure versions

**Independent Test**: Run `pnpm audit --audit-level=high` in both frontend and backend - should exit 0 with zero high/critical vulnerabilities

**Acceptance Criteria** (from spec.md):
- All high and critical severity vulnerabilities are eliminated
- Security audit shows zero high/critical issues
- Production deployment passes security scanning

### Implementation for User Story 1

#### Phase B: Shared Dependencies (Security-Critical)

- [ ] T018 [P] [US1] Upgrade frontend tRPC packages: Run `cd front && pnpm add @trpc/client@latest @trpc/next@latest @trpc/react-query@latest @trpc/server@latest`
- [ ] T019 [P] [US1] Upgrade backend tRPC server: Run `cd backend && pnpm add @trpc/server@latest` (must match frontend version)
- [ ] T020 [P] [US1] Upgrade frontend Zod: Run `cd front && pnpm add zod@latest`
- [ ] T021 [P] [US1] Upgrade backend Zod: Run `cd backend && pnpm add zod@latest` (must match frontend)
- [ ] T022 [P] [US1] Upgrade frontend SuperJSON: Run `cd front && pnpm add superjson@latest`
- [ ] T023 [P] [US1] Upgrade backend SuperJSON: Run `cd backend && pnpm add superjson@latest` (must match frontend)
- [ ] T024 [US1] Verify tRPC version alignment: Run `cd front && pnpm list @trpc/client @trpc/server --depth=0 && cd ../backend && pnpm list @trpc/server --depth=0` and confirm versions match exactly
- [ ] T025 [US1] Fix tRPC 10→11 breaking changes if applicable: Update context creation and middleware in `backend/src/` per migration guide (https://trpc.io/docs/migrate-from-v10-to-v11)
- [ ] T026 [US1] Verify frontend type checking: Run `cd front && npx tsc --noEmit`
- [ ] T027 [US1] Verify backend type checking: Run `cd backend && npx tsc --noEmit`
- [ ] T028 [US1] Run backend tests: Run `cd backend && pnpm test`
- [ ] T029 [US1] Commit Phase B: `git add -A && git commit -m "Phase B (US1): Upgrade shared dependencies for security" && git tag upgrade-phase-b`

#### Phase C: Backend Framework Security Updates

- [ ] T030 [P] [US1] Upgrade Express: Run `cd backend && pnpm add express@latest`
- [ ] T031 [P] [US1] Upgrade backend TypeScript: Run `cd backend && pnpm add -D typescript@latest`
- [ ] T032 [P] [US1] Upgrade Jest: Run `cd backend && pnpm add -D jest@latest @types/jest@latest`
- [ ] T033 [P] [US1] Upgrade ts-node: Run `cd backend && pnpm add -D ts-node@latest`
- [ ] T034 [P] [US1] Upgrade @babel packages: Run `cd backend && pnpm add -D @babel/preset-env@latest @babel/preset-typescript@latest`
- [ ] T035 [US1] Fix Jest 29→30 breaking changes if applicable: Update `backend/jest.config.js` per migration guide (https://jestjs.io/docs/upgrading-to-jest30)
- [ ] T036 [US1] Regenerate Jest snapshots if needed: Run `cd backend && pnpm test -- -u`
- [ ] T037 [US1] Verify backend builds: Run `cd backend && pnpm run build`
- [ ] T038 [US1] Verify backend tests: Run `cd backend && pnpm test`
- [ ] T039 [US1] Commit Phase C: `git add -A && git commit -m "Phase C (US1): Upgrade backend framework for security" && git tag upgrade-phase-c`

#### Phase D: Frontend Framework Security Updates

- [ ] T040 [US1] Upgrade React and ReactDOM: Run `cd front && pnpm add react@latest react-dom@latest` (must upgrade before Next.js)
- [ ] T041 [US1] Upgrade Next.js: Run `cd front && pnpm add next@latest`
- [ ] T042 [US1] Upgrade React Query: Run `cd front && pnpm add @tanstack/react-query@latest`
- [ ] T043 [US1] Upgrade frontend TypeScript: Run `cd front && pnpm add -D typescript@latest` (align with backend)
- [ ] T044 [US1] Fix Next.js 13→15 breaking changes: Review and update `next/image` imports and middleware in `front/src/` per upgrade guide (https://nextjs.org/docs/app/building-your-application/upgrading/version-15)
- [ ] T045 [US1] Fix React 18→19 breaking changes: Update JSX transform in `front/tsconfig.json` and review state updates per migration guide (https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
- [ ] T046 [US1] Verify frontend type checking: Run `cd front && npx tsc --noEmit`
- [ ] T047 [US1] Verify frontend builds: Run `cd front && pnpm run build`
- [ ] T048 [US1] Test dev server starts: Run `cd front && pnpm run dev` and verify http://localhost:4000 loads
- [ ] T049 [US1] Commit Phase D: `git add -A && git commit -m "Phase D (US1): Upgrade frontend framework for security" && git tag upgrade-phase-d`

#### Security Verification

- [ ] T050 [P] [US1] Run frontend security audit: `cd front && pnpm audit --audit-level=high` (should exit 0)
- [ ] T051 [P] [US1] Run backend security audit: `cd backend && pnpm audit --audit-level=high` (should exit 0)
- [ ] T052 [US1] Compare to baseline: Verify zero high/critical vulnerabilities vs baseline audit files
- [ ] T053 [US1] Test application functionality: Run `docker-compose up` and manually verify pages load, tRPC calls work, no console errors

**Checkpoint**: User Story 1 complete - Security vulnerabilities eliminated, application functional

---

## Phase 4: User Story 2 - Developer Access to Latest Features (Priority: P2)

**Goal**: Enable developers to use latest stable features and improvements in frameworks and libraries

**Independent Test**: Verify all core frameworks are at latest stable versions via `pnpm list`

**Acceptance Criteria** (from spec.md):
- All core frameworks at latest stable releases
- Modern framework APIs available for development
- Builds succeed

### Implementation for User Story 2

#### Phase E: Development Tools & Latest Features

- [ ] T054 [P] [US2] Upgrade Storybook packages: Run `cd front && pnpm add -D @storybook/addon-essentials@latest @storybook/addon-interactions@latest @storybook/addon-links@latest @storybook/blocks@latest @storybook/nextjs@latest @storybook/react@latest storybook@latest`
- [ ] T055 [US2] Run Storybook upgrade if available: `cd front && npx storybook@latest upgrade`
- [ ] T056 [US2] Fix Storybook 7→8 breaking changes: Update `.storybook/` config per migration guide (https://storybook.js.org/docs/migration-guide)
- [ ] T057 [P] [US2] Upgrade frontend ESLint: Run `cd front && pnpm add -D eslint@latest eslint-config-next@latest eslint-config-prettier@latest`
- [ ] T058 [P] [US2] Upgrade backend ESLint: Run `cd backend && pnpm add -D eslint@latest @typescript-eslint/eslint-plugin@latest eslint-config-prettier@latest`
- [ ] T059 [P] [US2] Upgrade frontend Prettier: Run `cd front && pnpm add -D prettier@latest`
- [ ] T060 [P] [US2] Upgrade backend Prettier: Run `cd backend && pnpm add -D prettier@latest`
- [ ] T061 [US2] Fix ESLint 8→9 flat config if applicable: Update ESLint config to new format per migration guide (https://eslint.org/docs/latest/use/configure/migration-guide)
- [ ] T062 [P] [US2] Upgrade frontend type definitions: Run `cd front && pnpm add -D @types/node@latest @types/react@latest @types/react-dom@latest`
- [ ] T063 [P] [US2] Upgrade backend type definitions: Run `cd backend && pnpm add -D @types/node@latest @types/express@latest`
- [ ] T064 [P] [US2] Upgrade frontend tsconfig packages: Run `cd front && pnpm add -D @tsconfig/next@latest @tsconfig/strictest@latest`
- [ ] T065 [P] [US2] Upgrade backend tsconfig packages: Run `cd backend && pnpm add -D @tsconfig/strictest@latest`
- [ ] T066 [US2] Verify frontend linting: Run `cd front && pnpm run lint`
- [ ] T067 [US2] Verify backend linting: Run `cd backend && pnpm run lint`
- [ ] T068 [US2] Build Storybook: Run `cd front && pnpm run build-storybook`
- [ ] T069 [US2] Test Storybook dev server: Run `cd front && pnpm run storybook` and verify components display
- [ ] T070 [US2] Verify latest versions: Check `front/package.json` and `backend/package.json` show Next.js ^15, React ^19, TypeScript ^5.7
- [ ] T071 [US2] Commit Phase E: `git add -A && git commit -m "Phase E (US2): Upgrade dev tools for latest features" && git tag upgrade-phase-e`

**Checkpoint**: User Story 2 complete - Latest framework features accessible

---

## Phase 5: User Story 3 - Performance and Stability Improvements (Priority: P3)

**Goal**: Verify application remains stable and functional after upgrades

**Independent Test**: Application works correctly with no regressions

**Acceptance Criteria** (from spec.md):
- Application functions correctly
- All tests pass
- Builds succeed

### Implementation for User Story 3

#### Functional Verification

- [ ] T072 [US3] Run full backend test suite: `cd backend && pnpm test` (verify 100% pass rate)
- [ ] T073 [US3] Verify frontend builds successfully: `cd front && pnpm run build`
- [ ] T074 [US3] Verify Storybook builds: `cd front && pnpm run build-storybook`
- [ ] T075 [US3] Test hot reload: Start `pnpm run dev` in both packages, make code changes, verify hot reload works
- [ ] T076 [US3] Test Docker Compose stack: Run `docker-compose up --build` and verify all services start correctly
- [ ] T077 [US3] Verify no deprecation warnings: Run `cd front && pnpm run build 2>&1 | grep -i "deprecated"` (should return no matches)
- [ ] T078 [US3] Manual functional testing: Interact with application to verify core features work (navigation, API calls, rendering)

**Checkpoint**: User Story 3 complete - Application stable and functional

---

## Phase 6: Polish & Documentation

**Purpose**: Finalize upgrade with documentation and cleanup

- [ ] T079 [P] Update README Node requirement: Change Node.js prerequisite to "Node.js 22.x LTS" in `README.md`
- [ ] T080 [P] Update README package manager: Add "pnpm (enabled via corepack)" to prerequisites in `README.md`
- [ ] T081 Create upgrade summary: Document version changes in `specs/001-dependency-upgrades/UPGRADE_SUMMARY.md`
- [ ] T082 Verify no peer dependency warnings: Run `pnpm list` in both packages and check for UNMET errors
- [ ] T083 [P] Final frontend security audit: Run `cd front && pnpm audit` (all levels, should show zero vulnerabilities)
- [ ] T084 [P] Final backend security audit: Run `cd backend && pnpm audit` (all levels, should show zero vulnerabilities)
- [ ] T085 Final commit: `git add -A && git commit -m "Complete dependency upgrades: Node 22 + pnpm + latest stable versions" && git tag upgrade-complete`
- [ ] T086 Update ISSUE_PRIORITIES.md: Mark dependency upgrade complete in `ISSUE_PRIORITIES.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - Security-critical, highest priority
- **User Story 2 (Phase 4)**: Depends on Foundational and US1 - Feature access
- **User Story 3 (Phase 5)**: Depends on US1 and US2 - Final verification
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1 - Security)**: Can start after Foundational - Independent
- **User Story 2 (P2 - Features)**: Requires US1 complete (dev tools depend on framework versions)
- **User Story 3 (P3 - Verification)**: Requires US1 and US2 complete

### Within Each User Story

**US1 (Security)**:
1. Phase B: Shared dependencies → Phase C & D can run in parallel after Phase B
2. Phase C: Backend frameworks
3. Phase D: Frontend frameworks
4. Security verification

**US2 (Features)**:
1. Phase E: Development tools (single phase)

**US3 (Verification)**:
1. Functional tests (all can run in parallel except manual testing)

### Parallel Opportunities

**Setup (Phase 1)**:
- T002-T003: Security audits (different directories)

**Foundational (Phase 2)**:
- T005-T008: Dockerfile updates (4 different files)
- T010-T011: package.json engine updates (different files)

**US1 Phase B**:
- T018-T023: All pnpm add commands (6 parallel upgrades)

**US1 Phase C**:
- T030-T034: Backend package upgrades (5 parallel)

**US2 Phase E**:
- T054, T057-T065: Most dev dependency upgrades (parallel)
- T066-T067: Linting (different directories)

**US3**:
- T072-T074: Builds and tests (different scopes)

**Polish**:
- T079-T080, T083-T084: Documentation and audits (different files)

---

## Implementation Strategy

### MVP First (User Story 1 Only - Security Focus)

1. **Complete Phase 1: Setup** (T001-T004) - Baseline
2. **Complete Phase 2: Foundational** (T005-T017) - Node 22 + pnpm
3. **Complete Phase 3: User Story 1** (T018-T053) - Security upgrades
4. **STOP and VALIDATE**:
   - `pnpm audit` shows zero high/critical
   - All tests pass
   - Application works
5. **Deploy if ready** - Secure system achieved

### Incremental Delivery

1. **Foundation** (Phases 1-2) → Node 22 + pnpm ready
2. **Security** (Phase 3) → Deploy/Demo (MVP - SC-002 satisfied)
3. **Features** (Phase 4) → Deploy/Demo (SC-001, SC-008 satisfied)
4. **Verification** (Phase 5) → Deploy/Demo (SC-003, SC-004, SC-005 satisfied)
5. **Polish** (Phase 6) → Final documentation

---

## Success Criteria Mapping

| Success Criterion | Verified By | Task IDs |
|-------------------|-------------|----------|
| SC-001: Dependencies <6mo old | Version checks | T070 |
| SC-002: Zero high/critical vulns | Security audits | T050-T052, T083-T084 |
| SC-003: 100% test pass rate | Test execution | T028, T038, T072 |
| SC-004: Build succeeds | Build verification | T037, T047, T073-T074 |
| SC-005: No feature regressions | Manual testing | T053, T078 |
| SC-006: Dev environment works | Docker test | T016, T076 |
| SC-007: Application functional | Manual verification | T001, T053, T078 |
| SC-008: No deprecation warnings | Build output check | T077 |

---

## Estimated Effort

| Phase | User Story | Task Count | Estimated Time | Cumulative |
|-------|------------|------------|----------------|------------|
| 1: Setup | - | 4 | 10 min | 10 min |
| 2: Foundational | - | 13 | 40 min | 50 min |
| 3: US1 Phase B | Security | 12 | 30 min | 80 min |
| 3: US1 Phase C | Security | 10 | 30 min | 110 min |
| 3: US1 Phase D | Security | 10 | 45 min | 155 min |
| 3: US1 Verification | Security | 4 | 15 min | 170 min |
| 4: US2 Phase E | Features | 18 | 40 min | 210 min |
| 5: US3 Verification | Stability | 7 | 25 min | 235 min |
| 6: Polish | - | 8 | 20 min | 255 min |

**Total**: 86 tasks, ~4 hours estimated (reduced from 5.5 hours due to simplified setup and pnpm speed)

**Recommended**: Execute over 2 sessions with validation between user stories.

---

## Notes

- **pnpm benefits**: Faster installs, strict dependency isolation, disk space efficiency
- **[P] tasks**: Different files/directories, can run in parallel
- **[Story] label**: Maps task to user story for traceability
- **Security focus**: Primary goal is eliminating vulnerabilities (US1)
- **Commit after each phase** for rollback capability
- **Type safety critical**: tRPC versions MUST match exactly
- **Dockerfile changes**: Must enable pnpm via corepack
- **No baseline measurements**: Focus on functional verification only
