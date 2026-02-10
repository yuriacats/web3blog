# Research: Dependency and Runtime Version Upgrades

**Feature**: 001-dependency-upgrades
**Date**: 2026-02-08
**Purpose**: Research best practices, migration strategies, and version compatibility for upgrading dependencies in a TypeScript monorepo

## Research Areas

### 1. Node.js LTS Version Selection

**Decision**: Upgrade from Node.js 20.x to Node.js 22.x LTS

**Rationale**:
- Node.js 22 entered LTS (Long Term Support) status in October 2024
- Security support until April 2027, maintenance until April 2028
- Includes V8 12.x engine with performance improvements
- Native support for ES2024 features
- Better TypeScript compatibility with modern syntax
- Current version (20.x from 2023) is approaching end of Active LTS phase

**Alternatives Considered**:
- Stay on Node.js 20.x: Rejected due to security vulnerabilities and missing latest features
- Upgrade to Node.js 23.x (Current): Rejected as not LTS, less stable for production
- Wait for Node.js 24.x: Rejected as it won't enter LTS until late 2026

**Migration Considerations**:
- Breaking changes minimal between 20→22 for our use case
- Express, Next.js, and tRPC all officially support Node 22
- Docker base images: `node:22-alpine` available and stable

### 2. Package Upgrade Strategy

**Decision**: Use semantic versioning-aware upgrade strategy with staged approach

**Rationale**:
- Minimize risk by upgrading in phases: patch → minor → major versions
- Major version upgrades (e.g., Next.js 13→15, React 18→19) require code changes
- Use `pnpm outdated` to identify all upgradeable packages
- Use `pnpm audit` to prioritize security-critical upgrades
- Test after each category of upgrades (runtime → frameworks → dev tools)

**Alternatives Considered**:
- Upgrade everything at once: Rejected due to high risk of compounding breaking changes
- Upgrade only security-critical packages: Rejected as it doesn't meet "latest stable" requirement
- Use automated tools (pnpm up --latest): Rejected as it bypasses manual review and testing

**Upgrade Sequence**:
1. **Phase A**: Node.js runtime (infrastructure layer)
2. **Phase B**: Shared dependencies (tRPC, Zod, SuperJSON) - ensure version alignment
3. **Phase C**: Backend framework and tools (Express, Jest, TypeScript)
4. **Phase D**: Frontend framework and tools (Next.js, React, Storybook)
5. **Phase E**: Development dependencies (ESLint, Prettier, type definitions)

### 3. Breaking Change Handling

**Decision**: Document and address breaking changes incrementally with rollback capability

**Rationale**:
- Major framework upgrades often have breaking changes
- Next.js 13→15: App Router changes, image optimization updates
- React 18→19: New compiler, automatic batching changes
- Jest 29→30: Configuration format changes
- Create feature branch checkpoints after each phase

**Migration Resources**:
- Next.js upgrade guide: https://nextjs.org/docs/app/building-your-application/upgrading
- React 19 release notes: https://react.dev/blog/2024/04/25/react-19-upgrade-guide
- Jest migration guides: https://jestjs.io/docs/upgrading-to-jest29
- tRPC v11 migration: https://trpc.io/docs/migrate-from-v10-to-v11

**Code Change Strategy**:
- Use TypeScript compiler to identify breaking changes (will fail compilation)
- Run ESLint to identify deprecated API usage
- Update import statements for renamed modules
- Modify configuration files per migration guides
- Update test assertions that rely on framework internals

### 4. Dependency Compatibility Matrix

**Decision**: Maintain peer dependency compatibility, particularly for tRPC ecosystem

**Rationale**:
- tRPC requires matching versions between client and server
- React Query version must be compatible with tRPC React Query adapter
- Next.js has specific React version requirements
- TypeScript version must support all framework features

**Compatibility Requirements**:
| Package | Current | Target | Peer Dependencies |
|---------|---------|--------|-------------------|
| Node.js | 20.2.5 | 22.x (latest LTS) | - |
| TypeScript | 5.1.6 (front), 5.0.4 (back) | 5.7.x (align both) | - |
| tRPC Client | 10.29.0 | 11.x (latest) | tRPC Server 11.x |
| tRPC Server | 10.29.0 | 11.x (latest) | tRPC Client 11.x |
| Next.js | 13.4.4 | 15.x (latest stable) | React 19.x |
| React | 18.2.0 | 19.x (latest) | - |
| React Query | 4.29.12 | 5.x (latest) | React 19.x |
| Express | 4.18.2 | 4.x (latest patch) | - |
| Jest | 29.6.1 | 30.x (latest) | - |

**Version Alignment Strategy**:
1. Upgrade TypeScript in both packages to same version
2. Upgrade tRPC client and server together to same version
3. Upgrade React, then Next.js (Next depends on React)
4. Upgrade React Query to version compatible with React 19
5. Backend upgrades can proceed independently after tRPC alignment

### 5. Testing Strategy for Upgrades

**Decision**: Layered testing approach with automated and manual verification

**Rationale**:
- Automated tests catch most regressions but not all
- Type system catches API changes at compile time
- Runtime behavior changes require functional testing
- Performance regressions require benchmarking

**Test Layers**:
1. **Type Checking**: `tsc --noEmit` in both packages
2. **Linting**: `pnpm run lint` to catch deprecated APIs
3. **Unit Tests**: `pnpm test` (Jest backend tests)
4. **Build Verification**: `pnpm run build` (Next.js production build)
5. **Dev Environment**: `docker-compose up` to verify containerized environment
6. **Manual Smoke Tests**:
   - Frontend loads and renders
   - tRPC calls succeed between frontend and backend
   - Storybook builds and displays components
7. **Functional Verification**: Verify application works (security-focused, no detailed performance comparison needed)

**Rollback Strategy**:
- Git commit after each successful phase
- Tag commits: `upgrade-phase-a`, `upgrade-phase-b`, etc.
- Can revert to any phase if critical issue found
- Keep package-lock.json backups before major changes

### 6. Infrastructure and CI/CD Updates

**Decision**: Update infrastructure configs in parallel with package upgrades

**Rationale**:
- Docker base images must match target Node.js version
- CI/CD pipelines must use same Node version as development
- Dev container must align with production runtime
- Inconsistent versions between environments cause bugs

**Files Requiring Updates**:

**Development Environment**:
- `.devcontainer/devcontainer.json`: Update Node version feature
- `docker-compose.yml`: Update base image to `node:22-alpine`
- `front/Dockerfile`: Update FROM to `node:22-alpine` and enable pnpm via corepack
- `backend/Dockerfile`: Update FROM to `node:22-alpine` and enable pnpm via corepack

**CI/CD Pipelines**:
- `.github/workflows/*.yml`: Update `actions/setup-node@v4` with `node-version: '22'`
- Any custom build scripts that specify Node version

**Documentation**:
- `README.md`: Update prerequisites to specify Node 22.x
- Development setup instructions

**Update Sequence**:
1. Update Dockerfiles and docker-compose.yml first
2. Test local Docker build works with new base images
3. Update CI/CD configs
4. Run CI pipeline to verify
5. Update dev container config last (after verifying all works)

### 7. Deprecated API Identification

**Decision**: Use ESLint and compiler warnings to systematically identify deprecated APIs

**Rationale**:
- Frameworks mark APIs as deprecated before removal
- TypeScript `@deprecated` JSDoc tags trigger compiler warnings
- ESLint rules can catch usage of deprecated patterns
- Addressing deprecations now prevents future breakage

**Identification Tools**:
- ESLint with updated framework plugins (eslint-plugin-react, @typescript-eslint)
- TypeScript compiler warnings (--noEmit mode)
- Framework-specific codemod tools where available (Next.js codemods)
- Manual review of migration guides for deprecated features
- pnpm's built-in deprecation warnings during install

**Common Deprecations to Address**:
- Next.js: Legacy Image component (`next/legacy/image` → `next/image`)
- React: String refs (replace with useRef hooks)
- Jest: `done` callback in async tests (use async/await instead)
- tRPC: Middleware patterns changes in v11

### 8. Lockfile Management

**Decision**: Regenerate pnpm-lock.yaml after all upgrades, commit separately

**Rationale**:
- pnpm-lock.yaml ensures reproducible builds with content-addressable storage
- Old lockfile may have conflicts with new versions
- pnpm uses YAML format (more readable than JSON)
- pnpm's strict lockfile prevents phantom dependencies
- Separate commit makes reviewing actual dependency changes easier

**Lockfile Update Process**:
1. Before starting: Commit current pnpm-lock.yaml as baseline
2. After each phase: Run `pnpm install` to update lockfile
3. Review lockfile diff for unexpected changes (transitive dependencies)
4. Verify no security vulnerabilities in new lockfile: `pnpm audit`
5. Final step: Commit lockfiles with message indicating all upgrades complete

**Lockfile Validation**:
- Ensure no `file:` references broken (backend dependency in frontend)
- Check for peer dependency warnings resolved
- Verify pnpm-lock.yaml integrity with `pnpm install --frozen-lockfile`

### 9. Functional Verification (Security-Focused)

**Decision**: Focus on security and functional correctness, skip detailed performance benchmarking

**Rationale**:
- Primary goal is eliminating security vulnerabilities
- Detailed performance comparison is time-consuming and non-critical
- Functional verification ensures no regressions
- pnpm may have different install performance characteristics than npm

**Verification Focus**:

**Security** (Primary):
- Zero high/critical vulnerabilities: `pnpm audit --audit-level=high`
- All dependencies up-to-date to secure versions

**Functional Correctness**:
- Application builds successfully: `pnpm run build`
- All tests pass: `pnpm test`
- Dev environment starts: `pnpm run dev`
- Docker containers build and run: `docker-compose up`

**Basic Sanity Checks**:
- Frontend renders pages correctly
- Backend API responds to requests
- tRPC type safety preserved
- No console errors or warnings

**Acceptance Criteria**:
- All tests pass (SC-003)
- Builds complete successfully (SC-004: functional aspect only)
- Application works as before (SC-005)

### 10. Risk Mitigation

**Decision**: Staged rollout with checkpoints and documented rollback procedures

**Rationale**:
- Dependency upgrades carry inherent risk
- Staged approach limits blast radius
- Clear rollback procedures reduce downtime
- Comprehensive testing catches issues early

**Risk Mitigation Strategies**:

**Technical Risks**:
- **Breaking Changes**: Mitigated by phase-by-phase approach, commit checkpoints
- **Type Safety Loss**: Mitigated by strict TypeScript checking, tRPC version alignment
- **Performance Regression**: Mitigated by baseline measurements, acceptance thresholds
- **Test Failures**: Mitigated by running tests after each phase, addressing before proceeding

**Process Risks**:
- **Incomplete Migration**: Mitigated by comprehensive checklist in tasks.md
- **Inconsistent Versions**: Mitigated by version alignment matrix (see §4)
- **Lost Work**: Mitigated by git commits after each successful phase

**Rollback Procedures**:
1. Identify which phase introduced the issue
2. `git revert` commits from that phase backward
3. `npm install` to restore previous lockfiles
4. Rebuild Docker images if infrastructure updated
5. Document reason for rollback and investigation plan

**Success Checkpoints**:
After each phase, verify:
- ✅ Code compiles without errors
- ✅ All tests pass
- ✅ Builds complete successfully
- ✅ Dev environment starts without errors
- ✅ No new security vulnerabilities introduced

If any checkpoint fails, stop and fix before proceeding to next phase.

---

## Summary of Research Findings

**Primary Decisions**:
1. Upgrade to Node.js 22.x LTS (latest stable LTS as of 2026-02-08)
2. Use pnpm as package manager (faster, more disk-efficient than npm)
3. Use staged upgrade strategy (runtime → shared → backend → frontend → dev deps)
4. Maintain strict tRPC version alignment between frontend and backend
5. Update all infrastructure configs (Docker with corepack pnpm, CI/CD) in parallel
6. Focus on security verification (pnpm audit) over performance benchmarking
7. Commit after each successful phase for rollback capability

**Critical Path**:
Node.js runtime + pnpm enablement → tRPC alignment → Framework upgrades (Next/React/Express) → Dev tooling → Infrastructure

**Risk Level**: Medium (well-understood process, but large scope)

**Estimated Effort**: 3-4 implementation sessions across all phases

This research provides the foundation for generating specific implementation tasks in tasks.md.
