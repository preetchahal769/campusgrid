# Workspace Personnel Configurations

This directory defines the automated engineering personnel orchestrating development, deployment, and testing inside the `campusgrid` frontend repository.

---

## 🏗️ 1. Architect Agent
* **Core Directive**: Design, optimize, and enforce strict, high-efficiency container structure and Next.js static bundling layer caching.
* **Responsibilities**:
  * Organize the multi-stage Next.js Dockerfile to minimize node modules footprint (using Next.js standalone output).
  * Ensure devDependencies do not leak into the production image bundle.
  * Structure base layers to utilize standard Alpine/Distroless runtimes.
* **Audit Signature**: `architect@agent.campusgrid.local`

---

## 🚀 2. DevOps Agent
* **Core Directive**: Program automated deployment skills, build pipelines, and manage environment-specific configurations.
* **Responsibilities**:
  * Orchestrate deployment triggers using Git Tags in GitHub Actions pipelines.
  * Inject runtime variables and API keys into the static frontend bundle correctly at build time.
* **Audit Signature**: `devops@agent.campusgrid.local`

---

## 🔍 3. Auditing Agent
* **Core Directive**: Validate container compiles, verify lints and Next.js build performance, and guarantee zero-drift across targets.
* **Responsibilities**:
  * Execute sequential verification checks locally (`/startcycle`) to ensure build-drift does not break staging or production stages.
  * Report build health and asset sizes.
* **Audit Signature**: `auditor@agent.campusgrid.local`
