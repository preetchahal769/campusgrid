# CampusGrid Frontend — Code Quality & Best Practices Review

This document records the code quality status and remaining recommendations for the `campusgrid` Next.js frontend application.

---

## ✅ Resolved Issues (Previously Identified)

All previously identified architecture concerns have been successfully addressed.

### 1. Request-Isolated Redux Store (RESOLVED ✅)
- **Was:** Store was instantiated in the global module scope, causing SSR session state to leak across different user requests.
- **Fixed:** Store instantiation decoupled via `makeStore()` factory in `lib/store/store.ts`. Each client request receives an isolated store instance managed by `useRef` inside `StoreProvider.tsx`.

### 2. Edge-Compatible Route Middleware (RESOLVED ✅)
- **Was:** Route protection was handled inside page components, allowing brief unauthorized renders.
- **Fixed:** Centralized route security migrated to `middleware.ts` using a custom edge-safe JWT decoder (`decodeJwt`). Handles role-based redirects, login bypass, and cross-role access prevention before any page renders.

### 3. Redux Auth Union Type Alignment (RESOLVED ✅)
- **Was:** Auth state `userRole` used `as any` casts to accommodate all role strings.
- **Fixed:** `authSlice.ts` fully typed with a proper union `'student' | 'teacher' | 'principal' | 'admin' | 'super_admin'`. No raw casting remains.

### 4. TypeScript Type-Safety in Global State (RESOLVED ✅)
- **Was:** `nexusSlice.ts` used `any` and `any[]` for all slice shapes.
- **Fixed:** Dedicated interfaces established for every shape: `School`, `Invoice`, `SubscriptionStats`, `AuditLog`, `SystemHealth`, `StorageInfo`, `LiveTraffic`, `EscalationTicket`, `FinancialProjections`, `AnalyticsTrend`, `AnalyticsStats`, `GlobalAnalytics`. Slice state is 100% strongly typed.

### 5. Silent Catch Blocks (RESOLVED ✅)
- **Was:** Empty `catch {}` blocks in hooks like `useSchoolInfo.ts` swallowed errors silently.
- **Fixed:** Refactored to structured `console.warn` calls for dev-time tracing without crashing the UI.

---

## 🟡 Open: API Path Mismatches (Frontend Calling Wrong Endpoints)

The frontend is calling some backend routes with incorrect URL prefixes, causing silent 404 failures. These are **frontend-side fixes** — the backend routes exist and are correct.

### 1. Subscription Routes Missing `/finance/` Prefix

The backend registers all subscription routes under `@Controller('finance/subscriptions')`. The frontend drops the `/finance/` prefix in three places:

| File | Wrong Path Called | Correct Path |
|---|---|---|
| `app/super_admin/finance/subscriptions/page.tsx:L75` | `/subscriptions/overview` | `/finance/subscriptions/overview` |
| `app/super_admin/page.tsx:L86` | `/subscriptions/overview` | `/finance/subscriptions/overview` |
| `app/super_admin/finance/process-monthly/page.tsx:L51` | `/subscriptions/process-monthly` | `/finance/subscriptions/process-monthly` |
| `app/super_admin/finance/payments/page.tsx:L102` | `/subscriptions/${id}/pay` | `/finance/subscriptions/${id}/pay` |

**Action:** In each file listed above, update the `apiFetch(...)` path to include the `/finance/` prefix. The correct paths are already being used as the primary attempt in some files — the wrong paths are fallback calls that always return 404.

### 2. User Registration Path Mismatch

| File | Wrong Path Called | Correct Path |
|---|---|---|
| `app/principal/register-user/page.tsx:L63` | `/users/register` | `/users` |

The backend exposes `POST /users` (no `/register` suffix). Every user registration from the principal panel currently returns a 404.

**Action:** Change `apiFetch("/users/register", ...)` → `apiFetch("/users", ...)`.

---

## 🟡 Open: Missing Backend Endpoint the Frontend Needs

### `GET /academics/tss` — Not Yet Implemented in Backend

| Property | Detail |
|---|---|
| **File** | `app/principal/timetable/page.tsx:L62` |
| **Call** | `apiFetch("/academics/tss")` |
| **Purpose** | Loads all Teacher-Subject-Section (TSS) mappings so the principal can pick a mapping when building the timetable |
| **Status** | Backend does not have this route. The timetable form (`POST /academics/timetable`) requires a `teachersubjectsection_id` in its body, but there is no endpoint to list available TSS mappings. |

**Action (Backend):** Add `GET /academics/tss` to `academics.controller.ts` that returns the `teachersubjectsection` table scoped to the school. See `backend_review_and_guidelines.md` in the backend repo or `api_gap_analysis.md` for the full specification.

---

## 🟢 Informational: Backend Modules with No Frontend UI Yet

The following backend modules are fully implemented but have no corresponding frontend screens. These are planned for future sprints:

| Module | Backend Routes Available |
|---|---|
| **Exams & Report Cards** | Create exam, schedule, submit results, student report card |
| **School Calendar** | Create/list academic terms and events |
| **Fee Management** | Fee structure, bill generation, student fee view, receipt |
| **Payroll** | Structure, generate, pay, payslips |
| **Messaging / Chat** | Conversations, message history, send message |
| **Studio Rooms** | Create, distribute, swap requests |

---

## 🚀 Posture Assessment

The `campusgrid` frontend is in a clean, secure, and strongly typed state. SSR isolation, RBAC middleware, and type-safety concerns are all fully resolved.

**Remaining action items:**

| Priority | Issue | Effort |
|---|---|---|
| 🟡 **High** | Fix `/subscriptions/` → `/finance/subscriptions/` in 4 files | Very Low (10 min) |
| 🟡 **High** | Fix `/users/register` → `/users` in register-user page | Very Low (2 min) |
| 🟢 **Low** | Build frontend screens for Exams, Calendar, Fees, Payroll, Messaging | High (multiple sprints) |
