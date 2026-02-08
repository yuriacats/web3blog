# Data Model: Dependency and Runtime Version Upgrades

**Feature**: 001-dependency-upgrades
**Date**: 2026-02-08

## Overview

This feature does not introduce new data entities or database schema changes. Instead, it manages configuration entities that define the runtime environment and package dependencies for the application.

## Configuration Entities

### Package Manifest (package.json)

**Location**: `front/package.json`, `backend/package.json`

**Purpose**: Declares dependencies and their version constraints

**Structure**:
```json
{
  "name": "string",
  "version": "semver",
  "dependencies": {
    "[package-name]": "semver-range"
  },
  "devDependencies": {
    "[package-name]": "semver-range"
  },
  "scripts": {
    "[script-name]": "command"
  },
  "engines": {
    "node": "semver-range"
  }
}
```

**Fields Updated by This Feature**:
- `dependencies.*`: Version ranges for runtime dependencies
- `devDependencies.*`: Version ranges for development tools
- `engines.node`: Required Node.js version

**Validation Rules**:
- All version strings must follow semantic versioning (semver)
- tRPC versions must match between frontend and backend
- Peer dependencies must be satisfied
- No circular dependencies

**State Transitions**:
1. **Before Upgrade**: Contains current (outdated) versions
2. **During Upgrade**: Updated incrementally by phase
3. **After Upgrade**: Contains latest stable versions

---

### Lockfile (pnpm-lock.yaml)

**Location**: `front/pnpm-lock.yaml`, `backend/pnpm-lock.yaml`

**Purpose**: Pins exact versions of all dependencies (direct and transitive) for reproducible builds using content-addressable storage

**Structure**:
```yaml
lockfileVersion: '9.0'
settings:
  autoInstallPeers: true
  excludeLinksFromLockfile: false

importers:
  .:
    dependencies:
      package-name:
        specifier: ^1.0.0
        version: 1.0.5

packages:
  /package-name@1.0.5:
    resolution:
      integrity: sha512-hash
    engines:
      node: '>=18'
```

**Fields Updated by This Feature**:
- `importers.*`: Direct dependencies with specifiers
- `packages.*`: Entire dependency tree with exact versions and integrity hashes
- `lockfileVersion`: pnpm lockfile format version

**Validation Rules**:
- Must be consistent with package.json
- All integrity hashes must be valid (content-addressable)
- No conflicting versions for same package
- Strict dependency isolation (no phantom dependencies)

**State Transitions**:
1. **Before Upgrade**: Lockfile reflects old dependency tree
2. **During Upgrade**: Regenerated via `pnpm install` after each phase
3. **After Upgrade**: Lockfile reflects new dependency tree with updated versions

**Relationships**:
- Derives from: Package Manifest (package.json)
- Used by: pnpm install command
- Enforces: Strict dependency isolation via symlinks

---

### Runtime Configuration (Dockerfile, docker-compose.yml)

**Location**:
- `front/Dockerfile`
- `backend/Dockerfile`
- `docker-compose.yml`

**Purpose**: Specifies runtime environment (Node.js version) for containerized execution

**Structure** (Dockerfile):
```dockerfile
FROM node:22-alpine
RUN corepack enable pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
CMD ["pnpm", "start"]
```

**Fields Updated by This Feature**:
- `FROM` directive: Base image with Node.js version
- `RUN corepack enable pnpm`: Enable pnpm package manager
- `COPY` and `RUN` directives: Use pnpm instead of npm

**Structure** (docker-compose.yml):
```yaml
services:
  frontend:
    build:
      context: ./front
    image: node:22-alpine

  backend:
    build:
      context: ./backend
    image: node:22-alpine
```

**Fields Updated by This Feature**:
- `services.*.image`: Base image references

**Validation Rules**:
- Base image must exist in Docker registry
- Node version must match package.json engines.node

---

### CI/CD Configuration (.github/workflows/*.yml)

**Location**: `.github/workflows/` (if exists)

**Purpose**: Defines automated build and test pipeline with runtime version

**Structure**:
```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm install
      - run: npm test
      - run: npm run build
```

**Fields Updated by This Feature**:
- `jobs.*.steps[].with.node-version`: Node.js version for CI environment

**Validation Rules**:
- Node version must match Dockerfile and package.json
- All environments (dev, CI, production) must use same Node version

---

### Dev Container Configuration (.devcontainer/devcontainer.json)

**Location**: `.devcontainer/devcontainer.json` (if exists)

**Purpose**: Defines development container environment

**Structure**:
```json
{
  "name": "web3blog-dev",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:22",
  "features": {
    "ghcr.io/devcontainers/features/node:1": {
      "version": "22"
    }
  }
}
```

**Fields Updated by This Feature**:
- `image`: Container image with Node.js version
- `features.*.version`: Node version feature specification

**Validation Rules**:
- Node version must be consistent across all configurations

---

## Entity Relationships

```
Package Manifest (package.json)
    ↓ (defines dependencies)
Lockfile (package-lock.json)
    ↓ (used by)
Build Process
    ↓ (runs in)
Runtime Environment
    ├── Dockerfile (Node base image)
    ├── docker-compose.yml (service configs)
    ├── CI/CD Workflows (pipeline Node version)
    └── Dev Container (development Node version)
```

**Consistency Requirements**:
- All runtime configurations must specify the same Node.js version
- Frontend and backend package.json must have compatible dependency versions
- tRPC versions must be identical in frontend and backend

---

## Version Compatibility Matrix

This is a derived entity showing compatibility between package versions.

| Package Group | Frontend Version | Backend Version | Compatibility Rule |
|---------------|------------------|-----------------|-------------------|
| Node.js | 22.x | 22.x | Must match exactly |
| TypeScript | 5.7.x | 5.7.x | Should match for consistency |
| tRPC Client | 11.x | - | Must match tRPC Server |
| tRPC Server | - | 11.x | Must match tRPC Client |
| tRPC React Query | 11.x | - | Must match tRPC Client |
| React | 19.x | - | Frontend only |
| Next.js | 15.x | - | Must be compatible with React |
| Express | - | 4.x | Backend only |
| Jest | - | 30.x | Backend only |
| Storybook | 8.x | - | Frontend only |

**Validation**:
- Before completing upgrade, verify all compatibility rules satisfied
- Use `npm ls` to check actual installed versions
- Use `npm audit` to verify no security vulnerabilities

---

## State Tracking

**Upgrade Phases** (tracked via git commits):

| Phase | Scope | State Marker |
|-------|-------|--------------|
| Baseline | Current state | Initial commit before upgrade |
| Phase A | Node.js runtime | Tag: `upgrade-phase-a` |
| Phase B | Shared dependencies (tRPC, Zod) | Tag: `upgrade-phase-b` |
| Phase C | Backend frameworks | Tag: `upgrade-phase-c` |
| Phase D | Frontend frameworks | Tag: `upgrade-phase-d` |
| Phase E | Dev dependencies | Tag: `upgrade-phase-e` |
| Complete | All upgrades | Tag: `upgrade-complete` |

**Rollback Procedure**:
- Identify failed phase
- `git reset --hard upgrade-phase-[previous]`
- `pnpm install` to restore lockfiles
- Rebuild Docker images with `docker-compose build --no-cache`

---

## No Database Changes

**Important**: This feature does NOT modify:
- Database schema
- Database migrations
- Stored data
- Database configuration (connection strings, credentials)

The MySQL database (`db/` directory) is out of scope for this upgrade.

---

## Summary

This feature manages configuration entities rather than application data:
- **Package Manifests**: Define dependency versions
- **Lockfiles**: Pin exact dependency tree
- **Runtime Configs**: Specify Node.js version across environments
- **CI/CD Configs**: Ensure consistent build environment

All changes are to configuration files, not application data or database schema.
