# Quickstart: Dependency Upgrade Implementation

**Feature**: 001-dependency-upgrades
**Date**: 2026-02-08
**For**: Developers implementing the dependency upgrade

## Prerequisites

Before starting the upgrade:

```bash
# 1. Ensure you're on the feature branch
git checkout 001-dependency-upgrades

# 2. Ensure clean working directory
git status  # Should show "nothing to commit, working tree clean"

# 3. Verify Node.js 22 is available (for testing target version)
node --version  # Should be v22.x.x

# 4. Verify pnpm will be available via corepack
corepack enable
pnpm --version  # Should show pnpm version

# 5. Verify current application works
docker-compose up
# Manually test that application starts and functions correctly
```

---

## Phase A: Runtime Upgrade

**Goal**: Upgrade Node.js from 20.x to 22.x in all configurations

**Estimated Time**: 30 minutes

### Step 1: Update Infrastructure Configs

```bash
# Update Dockerfiles for Node 22 and pnpm
# front/Dockerfile - manually edit to add pnpm:
# FROM node:22-alpine
# RUN corepack enable pnpm
# WORKDIR /app
# COPY package.json pnpm-lock.yaml* ./
# RUN pnpm install --frozen-lockfile
# COPY . .
# CMD ["pnpm", "start"]

# backend/Dockerfile - same changes as above

# Or use sed for Node version (then manually add pnpm lines):
sed -i '' 's/FROM node:20/FROM node:22/' front/Dockerfile
sed -i '' 's/FROM node:20/FROM node:22/' backend/Dockerfile
# Then manually add "RUN corepack enable pnpm" after FROM line
# And update npm commands to pnpm
```

### Step 2: Update Package Engine Requirements

```bash
# frontend/package.json
cd front
pnpm pkg set engines.node=">=22.0.0 <23.0.0"

# backend/package.json
cd ../backend
pnpm pkg set engines.node=">=22.0.0 <23.0.0"
cd ..
```

### Step 3: Update CI/CD (if .github/workflows exists)

```bash
# Find and update all workflow files
find .github/workflows -name '*.yml' -exec sed -i '' 's/node-version: .20./node-version: '\''22'\''/' {} \;
```

### Step 4: Update Dev Container (if exists)

```bash
# .devcontainer/devcontainer.json
# Manually update Node version references to 22
```

### Step 5: Verify Runtime Upgrade

```bash
# Rebuild Docker images
docker-compose build --no-cache

# Start services
docker-compose up

# Verify Node version in containers
docker-compose exec frontend node --version  # Should show v22
docker-compose exec backend node --version   # Should show v22
```

### Step 6: Commit Phase A

```bash
git add -A
git commit -m "Phase A: Upgrade Node.js runtime to 22.x

- Update Dockerfiles to node:22-alpine
- Update package.json engines.node to >=22.0.0
- Update CI/CD workflows to Node 22
- Update dev container configuration

Verified: Docker builds succeed, containers start with Node 22"

git tag upgrade-phase-a
```

---

## Phase B: Shared Dependencies

**Goal**: Upgrade tRPC, Zod, SuperJSON (must be aligned between frontend/backend)

**Estimated Time**: 45 minutes

### Step 1: Check Current Versions

```bash
cd front && pnpm list @trpc/client @trpc/react-query zod superjson
cd ../backend && pnpm list @trpc/server zod superjson
cd ..
```

### Step 2: Upgrade Frontend Shared Deps

```bash
cd front

# Upgrade tRPC client packages (must match versions)
pnpm add @trpc/client@latest @trpc/next@latest @trpc/react-query@latest @trpc/server@latest

# Upgrade validation and serialization
pnpm add zod@latest superjson@latest

cd ..
```

### Step 3: Upgrade Backend Shared Deps

```bash
cd backend

# Upgrade tRPC server (must match frontend tRPC version)
pnpm add @trpc/server@latest

# Upgrade validation and serialization (must match frontend versions)
pnpm add zod@latest superjson@latest

cd ..
```

### Step 4: Verify Version Alignment

```bash
# Check that tRPC versions match
cd front && pnpm list @trpc/client @trpc/server --depth=0
cd ../backend && pnpm list @trpc/server --depth=0
cd ..

# Versions should be identical for @trpc/*
```

### Step 5: Fix Breaking Changes

```bash
# If tRPC 10→11, consult migration guide:
# https://trpc.io/docs/migrate-from-v10-to-v11

# Common changes:
# - Update context creation
# - Update middleware definitions
# - Update error handling
```

### Step 6: Test Type Safety

```bash
# Frontend
cd front
npx tsc --noEmit  # Should compile without errors
npm run build     # Should build successfully

# Backend
cd ../backend
npx tsc --noEmit  # Should compile without errors
npm run build     # Should compile successfully
npm test          # All tests should pass

cd ..
```

### Step 7: Commit Phase B

```bash
git add -A
git commit -m "Phase B: Upgrade shared dependencies (tRPC, Zod, SuperJSON)

Frontend:
- @trpc/client, @trpc/next, @trpc/react-query: [versions]
- zod: [version]
- superjson: [version]

Backend:
- @trpc/server: [version]
- zod: [version]
- superjson: [version]

Verified: Type checking passes, builds succeed, tests pass"

git tag upgrade-phase-b
```

---

## Phase C: Backend Framework & Tools

**Goal**: Upgrade Express, Jest, TypeScript, backend dev dependencies

**Estimated Time**: 45 minutes

### Step 1: Upgrade Backend Core

```bash
cd backend

# Upgrade framework
pnpm add express@latest

# Upgrade TypeScript (will align with frontend later)
pnpm add -D typescript@latest

# Upgrade testing framework
pnpm add -D jest@latest @types/jest@latest

# Upgrade build tools
pnpm add -D ts-node@latest

cd ..
```

### Step 2: Fix Jest Breaking Changes

```bash
cd backend

# If Jest 29→30, update jest.config.js per migration guide
# https://jestjs.io/docs/upgrading-to-jest30

# Re-generate snapshots if format changed
pnpm test -- -u

cd ..
```

### Step 3: Verify Backend Builds and Tests

```bash
cd backend

# Type check
npx tsc --noEmit

# Lint
pnpm run lint

# Test
pnpm test

# Build
pnpm run build

cd ..
```

### Step 4: Commit Phase C

```bash
git add -A
git commit -m "Phase C: Upgrade backend framework and tools

- express: [version]
- typescript: [version]
- jest: [version]
- ts-node: [version]

Verified: All tests pass, build succeeds, no linting errors"

git tag upgrade-phase-c
```

---

## Phase D: Frontend Framework & Tools

**Goal**: Upgrade Next.js, React, React Query, Storybook

**Estimated Time**: 60 minutes (most complex phase)

### Step 1: Upgrade React First

```bash
cd front

# React must be upgraded before Next.js
pnpm add react@latest react-dom@latest

cd ..
```

### Step 2: Upgrade Next.js

```bash
cd front

# Upgrade Next.js
pnpm add next@latest

# If Next.js 13→15, review breaking changes:
# https://nextjs.org/docs/app/building-your-application/upgrading/version-15

cd ..
```

### Step 3: Upgrade React Query

```bash
cd front

# Upgrade React Query (now depends on React 19)
pnpm add @tanstack/react-query@latest

# If React Query 4→5, review migration guide

cd ..
```

### Step 4: Upgrade Storybook

```bash
cd front

# Upgrade all Storybook packages
pnpm add -D @storybook/addon-essentials@latest \
  @storybook/addon-interactions@latest \
  @storybook/addon-links@latest \
  @storybook/blocks@latest \
  @storybook/nextjs@latest \
  @storybook/react@latest \
  storybook@latest

# If Storybook 7→8, run upgrade script
npx storybook@latest upgrade

cd ..
```

### Step 5: Align TypeScript Version with Backend

```bash
cd front

# Install same TypeScript version as backend
pnpm add -D typescript@latest

cd ..
```

### Step 6: Fix Breaking Changes

```bash
cd front

# Next.js 15 changes (common):
# - Update next/image imports if using legacy
# - Update middleware if exists
# - Review App Router changes

# React 19 changes:
# - Update jsx transform in tsconfig.json
# - Review automatic batching behavior

# Check for deprecation warnings
npm run build 2>&1 | grep -i "deprecated"

cd ..
```

### Step 7: Verify Frontend Builds

```bash
cd front

# Type check
npx tsc --noEmit

# Lint
pnpm run lint

# Build Next.js
pnpm run build

# Build Storybook
pnpm run build-storybook

# Start dev server (manual verification)
pnpm run dev
# Visit http://localhost:4000 and verify pages load

cd ..
```

### Step 8: Commit Phase D

```bash
git add -A
git commit -m "Phase D: Upgrade frontend framework and tools

- react, react-dom: [version]
- next: [version]
- @tanstack/react-query: [version]
- storybook: [version]
- typescript: [version] (aligned with backend)

Verified: Build succeeds, Storybook builds, dev server starts, pages render"

git tag upgrade-phase-d
```

---

## Phase E: Development Dependencies

**Goal**: Upgrade ESLint, Prettier, type definitions, other dev tools

**Estimated Time**: 30 minutes

### Step 1: Upgrade Frontend Dev Deps

```bash
cd front

# Linting and formatting
pnpm add -D eslint@latest prettier@latest \
  eslint-config-prettier@latest \
  eslint-config-next@latest

# Type definitions
pnpm add -D @types/node@latest \
  @types/react@latest \
  @types/react-dom@latest

# TypeScript configs
pnpm add -D @tsconfig/next@latest \
  @tsconfig/node20@latest \  # Update to node22 if available
  @tsconfig/strictest@latest

cd ..
```

### Step 2: Upgrade Backend Dev Deps

```bash
cd backend

# Linting and formatting
pnpm add -D eslint@latest prettier@latest \
  eslint-config-prettier@latest \
  @typescript-eslint/eslint-plugin@latest

# Type definitions
pnpm add -D @types/node@latest \
  @types/express@latest

# TypeScript configs
pnpm add -D @tsconfig/node20@latest \  # Update to node22 if available
  @tsconfig/strictest@latest

cd ..
```

### Step 3: Fix ESLint Config for v9 (if applicable)

```bash
# ESLint 9 uses flat config by default
# If using eslintrc, may need to update format
# See: https://eslint.org/docs/latest/use/configure/migration-guide
```

### Step 4: Verify Linting

```bash
# Frontend
cd front && pnpm run lint && pnpm run format_check && cd ..

# Backend
cd backend && pnpm run lint && pnpm run format_check && cd ..
```

### Step 5: Commit Phase E

```bash
git add -A
git commit -m "Phase E: Upgrade development dependencies

Frontend:
- eslint: [version]
- prettier: [version]
- type definitions updated

Backend:
- eslint: [version]
- prettier: [version]
- type definitions updated

Verified: Linting passes, formatting check passes"

git tag upgrade-phase-e
```

---

## Final Verification

### Run Complete Test Suite

```bash
# Backend tests
cd backend && pnpm test && cd ..

# Frontend build
cd front && pnpm run build && cd ..

# Storybook build
cd front && pnpm run build-storybook && cd ..
```

### Security Audit (PRIMARY GOAL)

```bash
# Frontend
cd front
pnpm audit --audit-level=high
# Should exit 0 (no high/critical vulnerabilities)

# Backend
cd ../backend
pnpm audit --audit-level=high
# Should exit 0

cd ..
```

### Functional Verification

```bash
# Start application
docker-compose up

# Manually verify:
# - Frontend loads at http://localhost:4000
# - Pages render correctly
# - tRPC calls succeed (check browser console)
# - No errors in docker-compose logs
```

### Version Report (Optional)

```bash
# Check latest versions installed
cd front && pnpm list --depth=0
cd ../backend && pnpm list --depth=0
```

---

## Final Commit and Tag

```bash
git add -A
git commit -m "Complete dependency and runtime upgrades

Summary:
- Node.js: 20.x → 22.x
- Frontend: Next.js 13→15, React 18→19, Storybook 7→8
- Backend: Jest 29→30, Express 4.18→4.21
- Shared: tRPC 10→11, Zod 3.21→3.24

Verification:
✅ All tests pass
✅ Builds succeed
✅ No security vulnerabilities
✅ Performance within baseline
✅ Type safety preserved

See ISSUE_PRIORITIES.md for tracking"

git tag upgrade-complete
```

---

## Rollback Procedure

If any phase fails:

```bash
# Identify last successful phase
git tag --list 'upgrade-phase-*'

# Reset to that phase
git reset --hard upgrade-phase-[last-successful]

# Restore dependencies
cd front && npm install && cd ..
cd backend && npm install && cd ..

# Rebuild containers
docker-compose build --no-cache

# Verify rollback
docker-compose up
```

---

## Next Steps

After all upgrades complete:

1. **Test in dev environment**: Run application manually, verify all features work
2. **Update ISSUE_PRIORITIES.md**: Mark upgrade task complete
3. **Create pull request**: For review before merging to master
4. **Monitor CI/CD**: Ensure automated builds pass
5. **Deploy to staging**: Test in production-like environment
6. **Document lessons learned**: Add notes to research.md

---

## Troubleshooting

### Peer dependency conflicts

```bash
# pnpm is stricter about peer dependencies
# Check the error message and install missing peers explicitly
pnpm add <missing-peer-dependency>
```

### "Module not found" errors after upgrade

```bash
# Remove node_modules and pnpm store, reinstall
rm -rf node_modules
pnpm store prune
pnpm install
```

### TypeScript errors after upgrade

```bash
# Clear TypeScript build cache
npx tsc --build --clean

# Rebuild
npx tsc --noEmit
```

### Docker build fails

```bash
# Clear Docker cache
docker system prune -a --volumes

# Rebuild from scratch
docker-compose build --no-cache --pull
```

---

## Time Estimates

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Prerequisites | 10 min | 10 min |
| Phase A (Runtime + pnpm) | 30 min | 40 min |
| Phase B (Shared Deps) | 30 min | 70 min |
| Phase C (Backend) | 30 min | 100 min |
| Phase D (Frontend) | 45 min | 145 min |
| Phase E (Dev Deps) | 25 min | 170 min |
| Final Verification | 20 min | 190 min |

**Total Estimated Time**: ~3-4 hours (including breaks and troubleshooting)

**Note**: Reduced from original estimate due to:
- No baseline performance measurements required
- Focus on security verification only
- pnpm's faster install times

**Recommended Approach**: Execute over 2 sessions with testing between phases.
