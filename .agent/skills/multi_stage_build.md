# Build Specification Skill: Multi-Stage Next.js Container Compiles

This skill enforces strict multi-stage Docker targeting across all testing, staging, and production environments for Next.js.

---

## 🛠️ Multi-Stage Specifications

### 1. `testing-env` (Target Stage)
* **Goal**: Optimized for development cycles, fast hot-reloading (HMR), and debug access.
* **Directives**:
  * Include all npm development packages.
  * Enable local dev server bindings.

### 2. `staging-env` (Target Stage)
* **Goal**: Mirror production behavior but run on pre-production infrastructure.
* **Directives**:
  * Execute `next build`.
  * Inject staging API endpoints and configurations.

### 3. `production-env` (Target Stage)
* **Goal**: Ultra-slim runtime executing pure static/standalone bundles.
* **Directives**:
  * Utilize Next.js standalone output to minimize node_modules size.
  * Point statically generated pages directly to production endpoints.
