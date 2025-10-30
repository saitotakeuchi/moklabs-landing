# Container Reproducibility Documentation

## Overview

This document explains the container build strategy and reproducibility guarantees for the PNLD AI Service.

## Problem Statement

Docker containers should produce **deterministic builds** - the same source code and dependencies should always result in identical container images with identical behavior. This is critical for:

- **Debugging**: Ensure local and production environments match exactly
- **Security**: Track exact dependency versions for vulnerability scanning
- **Compliance**: Prove which versions were deployed
- **Rollbacks**: Confidently reproduce previous deployments

## Solution: Reproducible Builds

### 1. poetry.lock Inclusion

**Decision**: Include `poetry.lock` in Docker builds

**Implementation**:
- `.dockerignore` explicitly allows `poetry.lock` (see line 13 comment)
- `Dockerfile` requires `poetry.lock` (line 30: `COPY pyproject.toml poetry.lock ./`)
- No fallback to `poetry.lock*` - builds fail if lockfile missing

**Rationale**:
- `poetry.lock` pins exact dependency versions (including transitive dependencies)
- Without it, `poetry install` resolves versions dynamically, causing drift
- Local development and Docker containers must use identical dependencies

**Verification**:
```bash
# Build with progress output to verify poetry.lock is copied
docker build --progress=plain -t pnld-ai-service . 2>&1 | grep "poetry.lock"
```

### 2. Pinned Build Tools

**Decision**: Pin pip and setuptools versions

**Implementation** (Dockerfile:15-18):
```dockerfile
RUN python -m pip install --no-cache-dir --upgrade \
    pip==24.3.1 \
    setuptools==75.6.0
```

**Rationale**:
- Newer pip/setuptools versions can change dependency resolution
- Pinning ensures consistent behavior across builds
- Version numbers updated periodically via controlled process

### 3. Poetry Configuration

**Decision**: Configure Poetry for deterministic, non-interactive builds

**Implementation** (Dockerfile:24-27):
```dockerfile
ENV POETRY_VIRTUALENVS_IN_PROJECT=true \
    POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_CREATE=false
```

**Rationale**:
- `POETRY_VIRTUALENVS_IN_PROJECT=true`: Ensures consistent virtualenv location
- `POETRY_NO_INTERACTION=1`: Prevents prompts that could hang builds
- `POETRY_VIRTUALENVS_CREATE=false`: Uses system Python in container (already isolated)

### 4. Lockfile Validation

**Decision**: Validate lockfile integrity during build

**Implementation** (Dockerfile:32-33):
```dockerfile
RUN poetry check --lock
```

**Rationale**:
- Fails build if `poetry.lock` is out of sync with `pyproject.toml`
- Catches developer errors before deployment
- Ensures lockfile hasn't been manually edited incorrectly

### 5. Multi-Stage Build

**Decision**: Use multi-stage build with separate builder and runtime stages

**Implementation**:
- **Builder stage** (lines 4-36): Installs Poetry, validates lockfile, installs dependencies
- **Runtime stage** (lines 38-59): Copies only necessary files, runs as non-root user

**Rationale**:
- Smaller final images (build tools excluded from runtime)
- Better security (fewer attack surface components)
- Faster deployments (smaller image size)

## Vector Indexing Dead Code Removal

**Decision**: Removed `index_document_embeddings` function from `app/services/vector_search.py`

**Original Issue**:
- Function had TODO comment suggesting incomplete implementation
- Embedding persistence code was commented out
- Misleading to developers who might think it needs implementation

**Analysis**:
- Actual embedding persistence is already implemented in:
  - `upload_pdf` endpoint (app/api/v1/documents.py)
  - `index_pdf_document` endpoint (app/api/v1/documents.py)
- Function was NOT used anywhere in the codebase
- Dead code with misleading comments

**Resolution**:
- Removed entire function (previously lines 73-110 in vector_search.py)
- No API changes required (function was internal only)
- Tests continue to pass (function was never tested)

## Build Verification

### Local Testing

Test the Docker build locally:

```bash
# Build image
cd apps/pnld-ai-service
docker build -t pnld-ai-service:test .

# Verify image was created
docker images pnld-ai-service:test

# Run smoke test
docker run --rm pnld-ai-service:test python --version
```

### CI Smoke Test

The GitHub Actions workflow (`.github/workflows/ci.yml`) includes a `docker-build-test` job that:

1. Checks out the code
2. Sets up Docker Buildx
3. Builds the pnld-ai-service image
4. Verifies the image was created successfully
5. Checks the image size
6. Runs basic smoke tests

**Workflow Location**: `.github/workflows/ci.yml:59-87`

**When it Runs**:
- On every push to `main` or `develop` branches
- On every pull request targeting `main` or `develop`

**What it Validates**:
- poetry.lock is properly included
- Dependencies install without errors
- Image builds successfully
- No unexpected bloat in image size

## Dependency Updates

### Process for Updating Dependencies

1. **Update locally**:
   ```bash
   poetry update
   # Or update specific package:
   poetry update package-name
   ```

2. **Review changes**:
   ```bash
   git diff poetry.lock
   ```

3. **Test locally**:
   ```bash
   poetry install
   pytest
   ```

4. **Rebuild Docker**:
   ```bash
   docker build -t pnld-ai-service:test .
   ```

5. **Commit both files**:
   ```bash
   git add pyproject.toml poetry.lock
   git commit -m "Update dependencies: description of changes"
   ```

### Updating Build Tool Versions

When updating pinned versions (pip, setuptools):

1. Check for security advisories
2. Test locally first
3. Update Dockerfile pins
4. Document in commit message
5. Monitor CI for any issues

## Troubleshooting

### Build fails with "poetry.lock not found"

**Cause**: .dockerignore is excluding poetry.lock

**Fix**: Verify .dockerignore does NOT contain `poetry.lock` entry (should have comment instead)

### Build fails with "poetry.lock out of sync"

**Cause**: poetry.lock doesn't match pyproject.toml

**Fix**: Run `poetry lock` to regenerate lockfile, commit updated file

### Dependencies differ between local and Docker

**Cause**: Building without poetry.lock or using different Poetry version

**Fix**:
1. Ensure poetry.lock is committed
2. Run `poetry install --sync` locally
3. Rebuild Docker image from scratch: `docker build --no-cache -t pnld-ai-service .`

### Image size unexpectedly large

**Cause**: Build artifacts or unnecessary files in runtime stage

**Fix**:
1. Check .dockerignore covers unnecessary files
2. Verify multi-stage build is working (runtime stage should be much smaller)
3. Review Dockerfile COPY commands

## Monitoring and Validation

### Recommended Checks

**Before Deployment**:
- [ ] poetry.lock is up to date (`poetry check --lock`)
- [ ] Docker build succeeds locally
- [ ] CI smoke test passes
- [ ] Image size is reasonable (< 500MB for this service)

**After Deployment**:
- [ ] Health check endpoint responds
- [ ] Dependency versions match expectations
- [ ] No unexpected runtime errors related to missing packages

### Metrics to Track

- Docker image build time (should be consistent)
- Docker image size (should not grow unexpectedly)
- CI smoke test duration (should be stable)
- Build cache hit rate (indicates reproducibility)

## Related Documentation

- [Supabase Query Optimizations](./QUERY_OPTIMIZATIONS.md) - Database query performance improvements
- [README.md](./README.md) - General setup and usage instructions
- [.dockerignore](./.dockerignore) - Files excluded from Docker build context
- [Dockerfile](./Dockerfile) - Container build configuration

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2025-01-29 | 1.0 | Initial container reproducibility implementation |
|  |  | - Added poetry.lock to Docker builds |
|  |  | - Pinned pip==24.3.1, setuptools==75.6.0 |
|  |  | - Added poetry check --lock validation |
|  |  | - Removed index_document_embeddings dead code |
|  |  | - Added CI smoke test |

## Support

For questions or issues:
1. Check this documentation
2. Review Dockerfile and .dockerignore
3. Run CI smoke test locally
4. Check GitHub Actions workflow results
5. Contact development team if unexpected behavior occurs

---

**Last Updated**: 2025-01-29
**Author**: Claude Code
**Related Issue**: Container Reproducibility & Vector Indexing Stub Alignment
