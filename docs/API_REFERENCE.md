# CampusGrid API Reference

This document provides a comprehensive overview of all APIs available in the CampusGrid system, including their purposes, endpoints, and expected parameters.

---

## 1. Authentication & Profile Management
All APIs (except Login) require an `Authorization` header: `Bearer <access_token>`.

### Authentication
#### ✅ User Login
- **Endpoint**: `POST /auth/login`
- **Body**:
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```
- **Success Response (200 OK)**: Sets `access_token` and `refresh_token` (cookies/body). Returns user object.

#### ✅ Token Refresh
- **Endpoint**: `POST /auth/refresh`
- **Description**: Rotates both Access and Refresh tokens. Uses the `refresh_token` cookie.

#### Change Password
- **Endpoint**: `PATCH /auth/change-password`
- **Body**: `{ "oldPassword": "...", "newPassword": "..." }`

### Profile Management
#### ✅ Get My Info
- **Endpoint**: `GET /users/me`
- **Description**: Returns full user object.

#### ✅ Update Basic Profile
- **Endpoint**: `PATCH /users/profile`
- **Body**: `{ "name": "...", "phoneNo": "..." }`

#### ✅ Upload Profile Photo
- **Endpoint**: `PATCH /users/profile/photo`
- **Body**: `multipart/form-data` with key `file`.

#### ✅ Register Device (For Push Notifications)
- **Endpoint**: `PATCH /users/fcm-token`
- **Body**: `{ "fcmToken": "..." }`

---

## 2. Nexus Super Admin Console (SUPER_ADMIN)

### School Orchestration
#### Create New School Node
- **Endpoint**: `POST /schools`
- **Body**: `{ "name": "...", "address": "...", "contactEmail": "...", "region": "..." }`

#### Toggle School Status
- **Endpoint**: `PATCH /schools/:id/status`
- **Body**: `{ "status": "ACTIVE | SUSPENDED | INACTIVE" }`

### Governance
#### Global User Directory
- **Endpoint**: `GET /users/global`
- **Description**: List all administrative users (Super Admin, Admin, Principal) across the entire grid.

### Infrastructure Billing
#### Global Subscription Overview
- **Endpoint**: `GET /finance/subscriptions/overview`
- **Description**: High-level summary stats (Revenue, Active Nodes) + Recent 50 bills.

#### List All Subscriptions
- **Endpoint**: `GET /finance/subscriptions`
- **Query Parameters**: `?schoolId=...&status=...`
- **Description**: Detailed list of all billing records across the grid.

#### Generate Monthly Invoices (Manual)
- **Endpoint**: `POST /finance/subscriptions/process-monthly`
- **Body**: `{ "month": "YYYY-MM" }` (Optional: Defaults to current month)
- **Description**: Triggers billing engine for the specified month.
- **AUTOMATION**: A Cron Job runs automatically on the **1st of every month at midnight**.

#### Record School Payment
- **Endpoint**: `PATCH /finance/subscriptions/:id/pay`
- **Body**: `{ "amount": 2000 }`
- **Description**: Quick action to mark a bill as `PAID`.

#### Update Subscription Record (Manual)
- **Endpoint**: `PATCH /finance/subscriptions/:id`
- **Body**: `{ "studentCount": 100, "ratePerStudent": 80, "amountDue": 8000, "status": "PAID", ... }`
- **Description**: Full manual override of any subscription field.

### Global Audit Logs
- **Endpoint**: `GET /audit-logs`
- **Response Enrichment**: 
    - `severity`: INFO, WARN, or CRITICAL.
    - `actorAvatar`: URL to the user's profile picture.

### Global Analytics
- **Endpoint**: `GET /analytics/global-dashboard`
- **New Data Points**:
    - `trends`: 12-month historical data for Revenue, Node Count, and User Count.
    - `nodesByRegion`: Distribution of schools across geographic regions.

---

## ⚡ Nexus Upgrade: Change Log for Frontend
To support the high-fidelity Nexus experience, the following changes have been implemented:

1.  **Route Standardization**: 
    - The `/finance/subscriptions` prefix is now standardized.
    - `GET /finance/subscriptions/overview` replaces the old unversioned route.
    - `POST /finance/subscriptions/process-monthly` is the new standard for billing.
2.  **Data Models**:
    - `School` objects now include a `region` field for geographic analytics.
    - `AuditLog` objects now include `severity` levels.
3.  **Analytics Enrichment**:
    - The Global Dashboard now returns a `trends` array (12 items) and `nodesByRegion` object.
4.  **Audit Logs**:
    - Frontend can now display the `actorAvatar` directly from the log entry for a more visual experience.
    - `severity` can be used to color-code log entries (e.g., Red for CRITICAL).

---
---

## 3. School Operations (Principal & Admin)

### User Registration
#### ✅ Create User
- **Endpoint**: `POST /users`
- **Body**: `{ "email": "...", "password": "...", "name": "...", "role": "..." }`

#### Role Profiles
- **POST /teachers**: Create teacher profile.
- **POST /students**: Create student profile.

### Academic Setup
#### ✅ Grades & Sections
- **POST /academics/grades**: Create grade.
- **POST /academics/sections**: Create section.

#### ✅ Teacher Assignments
- **Endpoint**: `POST /teachers/assign`
- **Body**: `{ "teachers_id": "...", "section_id": "...", "subject_id": "..." }`

---

## 4. Academic Engine (Curriculum & Exams)

### Calendar & Events
- **GET /academics/events**: List holidays/events.
- **POST /academics/terms**: Manage academic terms.

### Examination System
- **POST /academics/exams**: Create exam period.
- **POST /academics/exams/schedule**: Schedule papers.
- **POST /academics/exams/results/bulk**: Post marks.

### ✅ Timetable
- **POST /academics/timetable**: Assign period.
- **GET /academics/timetable/section/:id**: Fetch class timetable.
- **GET /academics/timetable/teacher/:id**: Fetch teacher timetable.

### Substitution System
- **GET /academics/substitutions/absent-teachers**: List absent teachers today.
- **GET /academics/substitutions/available-teachers**: Find free teachers for a slot.
- **POST /academics/substitutions/assign**: Assign a replacement.

---

## 5. Teacher Portal (Daily Operations)

### Attendance
#### Mark Attendance
- **Endpoint**: `POST /attendance/mark`
- **Body**: `{ "sectionId": "...", "date": "...", "records": [...] }`

#### ✅ Class In-charge Attendance
- **GET /academics/sections/my-class/students**: Get students with leave status.
- **POST /attendance/class/:sectionId**: Mark attendance (restricted to class in-charge).

### Assignments
#### ✅ Create Assignment
- **Endpoint**: `POST /academics/assignments`
- **Body**: `multipart/form-data` with **`files`** array for multiple attachments.

#### Manage Submissions
- **GET /academics/assignments/:id/submissions**: View all student work.
- **PATCH /academics/assignments/submissions/:subId/grade**: Grade a submission.

---

## 6. Finance & Billing

### Student Fees
- **POST /finance/fees/structure**: Set fee per grade.
- **POST /finance/fees/generate-monthly/:gradeId**: Generate bills.
- **PATCH /finance/fees/bills/:billId/pay**: Record payment.
- **GET /finance/fees/bills/:id/receipt**: Download PDF.

### Staff Payroll
- **POST /finance/payroll/structure**: Set salary details.
- **POST /finance/payroll/process-monthly**: Run payroll.
- **GET /finance/payroll/:id/slip**: Download pay slip.

---

## 7. Communications (Socket.io & FCM)

### Chat System
- **Socket URL**: `http://localhost:3000/chat`
- **REST Endpoints**:
  - `GET /users/search`: Find users.
  - `POST /messages/conversations`: Start/Get chat.
  - `GET /messages/conversations/:id/history`: Load history.
  - `POST /messages`: Send message.

### ✅ Broadcasts
- **POST /communications/broadcasts**: Send announcement (supports multiple `files`).
- **GET /communications/broadcasts**: List announcements.
- **GET /communications/broadcasts/:id**: Announcement details.

---

## 8. Media & Storage
All media links are **Private Presigned URLs** valid for 5 minutes.

### Uploads
- Use `multipart/form-data`.
- Use field name **`files`** for multiple files.
- Use field name **`file`** for single files (e.g., profile photo).
