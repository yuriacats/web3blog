# Version Requirements Contract

**Feature**: 001-dependency-upgrades
**Date**: 2026-02-08
**Purpose**: Define version constraints and compatibility requirements for all dependencies

## Runtime Version Contract

### Node.js Version

```yaml
required_version: "22.x"
minimum_version: "22.0.0"
maximum_version: "22.999.999"
lts_status: true
security_support_until: "2027-04-30"
```

**Enforcement Points**:
- `front/package.json`: `"engines": { "node": ">=22.0.0 <23.0.0" }`
- `backend/package.json`: `"engines": { "node": ">=22.0.0 <23.0.0" }`
- `front/Dockerfile`: `FROM node:22-alpine`
- `backend/Dockerfile`: `FROM node:22-alpine`
- `.github/workflows/*.yml`: `node-version: '22'`
- `.devcontainer/devcontainer.json`: `"version": "22"`

**Verification**:
```bash
node --version  # Must output v22.x.x
```

---

## Frontend Dependency Contract

### Core Framework Versions

```yaml
next:
  current: "13.4.4"
  target: "^15.0.0"
  breaking_changes: true
  migration_guide: "https://nextjs.org/docs/app/building-your-application/upgrading/version-15"

react:
  current: "18.2.0"
  target: "^19.0.0"
  breaking_changes: true
  migration_guide: "https://react.dev/blog/2024/04/25/react-19-upgrade-guide"

react-dom:
  current: "18.2.0"
  target: "^19.0.0"
  constraint: "Must match react version exactly"
```

### Type Safety Stack

```yaml
typescript:
  current: "5.1.6"
  target: "^5.7.0"
  constraint: "Must match backend TypeScript version for monorepo consistency"

"@trpc/client":
  current: "10.29.0"
  target: "^11.0.0"
  constraint: "Must match @trpc/server version exactly"

"@trpc/react-query":
  current: "10.29.0"
  target: "^11.0.0"
  constraint: "Must match @trpc/client version exactly"

"@tanstack/react-query":
  current: "4.29.12"
  target: "^5.0.0"
  breaking_changes: true
```

### Development Tools

```yaml
storybook:
  current: "7.0.18"
  target: "^8.0.0"
  breaking_changes: true
  migration_guide: "https://storybook.js.org/docs/migration-guide"

eslint:
  current: "8.41.0"
  target: "^9.0.0"
  breaking_changes: true
  note: "Flat config is default in v9"

prettier:
  current: "2.8.8"
  target: "^3.0.0"
  breaking_changes: false
```

---

## Backend Dependency Contract

### Core Framework Versions

```yaml
express:
  current: "4.18.2"
  target: "^4.21.0"
  breaking_changes: false
  note: "Staying on v4, v5 is still in beta"

"@trpc/server":
  current: "10.29.0"
  target: "^11.0.0"
  constraint: "Must match @trpc/client version exactly"
  breaking_changes: true
  migration_guide: "https://trpc.io/docs/migrate-from-v10-to-v11"
```

### Type Safety Stack

```yaml
typescript:
  current: "5.0.4"
  target: "^5.7.0"
  constraint: "Must match frontend TypeScript version"

zod:
  current: "3.21.4"
  target: "^3.24.0"
  breaking_changes: false
```

### Testing Framework

```yaml
jest:
  current: "29.6.1"
  target: "^30.0.0"
  breaking_changes: true
  migration_guide: "https://jestjs.io/docs/upgrading-to-jest30"

"@types/jest":
  current: "29.5.3"
  target: "^30.0.0"
  constraint: "Must match jest major version"
```

---

## Shared Dependency Contract

These dependencies appear in both frontend and backend and must have aligned versions.

```yaml
superjson:
  frontend: "1.12.3"
  backend: "1.12.3"
  target: "^2.0.0"
  constraint: "Versions must match exactly between frontend and backend"

zod:
  frontend: "3.22.0-canary.20230522T011705"  # Frontend uses canary
  backend: "3.21.4"
  target: "^3.24.0"
  action: "Align both to same stable version"
  constraint: "Versions should match for schema consistency"
```

---

## Peer Dependency Compatibility Matrix

```yaml
compatibility_rules:
  - package: "@trpc/react-query"
    peer_dependencies:
      "@trpc/client": "^11.0.0"
      "@tanstack/react-query": "^5.0.0"
      react: "^18.0.0 || ^19.0.0"

  - package: "next"
    peer_dependencies:
      react: "^19.0.0"
      react-dom: "^19.0.0"

  - package: "@trpc/server"
    peer_dependencies:
      zod: "^3.0.0"  # Optional but recommended

  - package: "@storybook/nextjs"
    peer_dependencies:
      next: "^14.0.0 || ^15.0.0"
      react: "^18.0.0 || ^19.0.0"
```

---

## Version Verification Contract

### Pre-Upgrade Verification

```bash
# Verify current application works
docker-compose up
# Manually test application functionality

# Capture current security audit
pnpm audit --json > pre-upgrade-audit.json
```

### Post-Upgrade Verification

```bash
# Verify Node version
node --version | grep "v22"

# Verify pnpm is available
pnpm --version

# Verify no TypeScript errors
npx tsc --noEmit

# Verify no ESLint errors
pnpm run lint

# Verify all tests pass
pnpm test

# Verify builds succeed
pnpm run build

# Verify no high/critical security vulnerabilities
pnpm audit --audit-level=high

# Verify peer dependencies satisfied
pnpm list 2>&1 | grep -i "UNMET" && exit 1 || exit 0

# Verify application works
docker-compose up
# Manually test application functionality
```

---

## Rollback Contract

### Rollback Trigger Conditions

Rollback to previous phase if any of the following occur:

```yaml
automatic_rollback:
  - condition: "TypeScript compilation fails"
    command: "pnpm run build fails with type errors"

  - condition: "Tests fail"
    command: "pnpm test exits with non-zero code"

  - condition: "Security vulnerabilities introduced"
    command: "pnpm audit shows new high/critical vulnerabilities"

  - condition: "Build fails"
    command: "pnpm run build exits with non-zero code"

  - condition: "Peer dependency conflicts"
    command: "pnpm install shows peer dependency errors"

manual_rollback:
  - condition: "Runtime errors in dev environment"
    verification: "docker-compose up fails or shows errors"

  - condition: "Breaking changes cannot be resolved"
    verification: "Migration guide steps don't apply to codebase"
```

### Rollback Procedure

```bash
# 1. Identify last successful phase tag
git tag --list 'upgrade-phase-*'

# 2. Reset to last successful phase
git reset --hard upgrade-phase-[X]

# 3. Restore lockfiles
pnpm install  # In both front/ and backend/

# 4. Rebuild Docker images
docker-compose build --no-cache

# 5. Verify rollback success
pnpm test && pnpm run build
```

---

## Breaking Change Resolution Contract

### Known Breaking Changes

```yaml
next_13_to_15:
  - change: "Image component optimization changes"
    resolution: "Update next/image imports and usage"
    affected_files: "front/src/components/**/*.tsx"

  - change: "App Router middleware changes"
    resolution: "Update middleware.ts if exists"
    affected_files: "front/src/middleware.ts"

react_18_to_19:
  - change: "Automatic batching behavior"
    resolution: "Review state updates in event handlers"
    affected_files: "front/src/components/**/*.tsx"

  - change: "New JSX transform"
    resolution: "Update tsconfig.json jsx setting"
    affected_files: "front/tsconfig.json"

trpc_10_to_11:
  - change: "Middleware API changes"
    resolution: "Update tRPC middleware definitions"
    affected_files: "backend/src/**/*.ts"

  - change: "Context creation changes"
    resolution: "Update createContext function"
    affected_files: "backend/src/trpc.ts"

jest_29_to_30:
  - change: "Configuration format changes"
    resolution: "Update jest.config.js"
    affected_files: "backend/jest.config.js"

  - change: "Snapshot format changes"
    resolution: "Re-generate snapshots with -u flag"
    affected_files: "backend/test/**/*.test.ts"
```

---

## Success Criteria Contract

This contract defines the acceptance criteria from spec.md as enforceable checks.

```yaml
SC-001_package_recency:
  criterion: "All package dependencies updated to versions released within last 6 months"
  verification: |
    pnpm outdated
    # Should show all packages are up-to-date

SC-002_security:
  criterion: "Zero high or critical vulnerabilities"
  verification: |
    pnpm audit --audit-level=high
    # Should exit 0

SC-003_tests:
  criterion: "100% test success rate"
  verification: |
    pnpm test
    # Should exit 0 with all tests passing

SC-004_build_success:
  criterion: "Build completes successfully"
  verification: |
    pnpm run build
    # Should exit 0

SC-005_no_regressions:
  criterion: "All existing features function identically"
  verification: |
    docker-compose up
    # Manually verify application works

SC-006_dev_environment:
  criterion: "Development environment starts successfully"
  verification: |
    docker-compose up
    # Should start without errors

SC-007_application_works:
  criterion: "Application functions correctly after upgrade"
  verification: "Manual functional testing"

SC-008_no_deprecations:
  criterion: "No deprecated dependency warnings"
  verification: |
    pnpm run build 2>&1 | grep -i "deprecated"
    # Should return no matches
```

---

## Summary

This contract defines:
1. **Version Constraints**: Exact target versions for all dependencies
2. **Compatibility Rules**: Peer dependency requirements and version alignment
3. **Verification Procedures**: Commands to validate upgrade success
4. **Rollback Conditions**: When and how to revert changes
5. **Breaking Change Resolutions**: Known issues and their fixes
6. **Success Criteria**: Enforceable checks matching spec.md

All tasks in tasks.md must satisfy these contracts.
