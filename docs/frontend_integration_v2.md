# CampusGrid Frontend Integration Guide (V2) - Security & Media Upgrade

This guide explains the changes required on the frontend to support the new security and media handling features.

---

## 🔐 1. Authentication: Refresh Token Rotation

We have moved from a single Access Token to a **Dual Token** system with **Rotation**.

### What has changed:
1. **Login**: The `/auth/login` endpoint now sets **two** cookies:
   - `access_token`: Short-lived.
   - `refresh_token`: Long-lived.
2. **Token Rotation**: Every time you refresh your access token, the backend issues a **new** refresh token and invalidates the old one.
3. **Security Detection**: If an old (used) refresh token is ever used again, the backend assumes a theft has occurred and **logs out all sessions** for that user.

### Action for Frontend:
- **Automatic Interceptor**: Use an Axios (or fetch) interceptor to handle `401 Unauthorized` errors.
- **Refresh Flow**: When a `401` occurs, call `POST /auth/refresh` (no body needed, it uses the cookie).
- **Session Expired**: If `/auth/refresh` also returns a `401`, redirect the user to the login page immediately as their session is fully invalidated.

---

## 📂 2. Private Media & Presigned URLs

All files in our MinIO/S3 storage are now **Private**. You cannot access them via direct permanent links.

### How to access files:
1. When you fetch an object (like an Assignment or Profile), the backend will provide a **Presigned URL**.
2. **Expiration**: These URLs are temporary and expire in **5 minutes**.
3. **Usage**: Use these URLs directly in `<img>` tags or `<a>` download links. Do not cache these URLs permanently as they will stop working.

---

## 📤 3. Media & Document Uploads (Multiple Files)

The backend now supports uploading multiple files (PDFs, DOCX, Images) at once for Assignments, Broadcasts, and Submissions.

### How to upload:
1. **Content-Type**: Use `multipart/form-data`.
2. **Field Name**: Switch from `file` to **`files`** (plural).
3. **Endpoints Updated**:
   - `POST /broadcast`: Accepts multiple documents in the `files` field.
   - `POST /academics/assignments`: Teachers can now attach multiple resource files.
   - `POST /academics/assignments/:id/submit`: Students can upload multiple work files.

### Example (React/Axios):
```javascript
const formData = new FormData();
formData.append('title', 'Project Requirements');

// Append multiple files to the 'files' field
selectedFiles.forEach(file => {
  formData.append('files', file); 
});

await axios.post('/academics/assignments', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

---

## 🛠️ Summary of New Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/refresh` | Rotates both Access and Refresh tokens. |
| `PATCH` | `/users/profile/photo` | Upload a new profile picture (Multipart). |
| `GET` | `/storage/presign` | (Internal) Used by backend to generate links. |

---

## ? 4. Assignment Submission Status (For Students)

To make it easier to show 'Submitted' vs 'Pending' on the dashboard, the assignment list response has been simplified.

### What has changed:
1. **isSubmitted**: A new boolean flag added to every assignment object.
2. **submission**: This is now a **single object** (instead of an array) containing the student's submission details if isSubmitted is true.

### Response Structure:
\\\json
{
  'id': 'assignment-id',
  'title': 'Math Homework',
  'isSubmitted': true,
  'submission': {
    'status': 'SUBMITTED',
    'submittedAt': '2026-05-09T...',
    'attachments': [
      { 'filename': 'solution.pdf', 'fileurl': 'https://...' }
    ]
  }
}
\\\`n
### Note on Re-submission:
The backend now **blocks** multiple submissions. If a student attempts to submit again, they will receive a 403 Forbidden error with the message: 'You have already submitted this assignment.'

---

## ?? 5. New Detail & Submission Endpoints (Base App Complete)

To complete the dashboard experience, we have added endpoints to fetch individual details and student submissions.

### Endpoints:
- **GET /academics/assignments/:id**: Get full details of one assignment (including attachments).
- **GET /academics/assignments/:id/submissions**: (Teachers Only) Get all student submissions for this assignment.
- **GET /broadcast/:id**: Get full details of one broadcast.

These endpoints ensure that when a user clicks on a list item, they can see the full document links and details properly.

---

## ?? 6. Updated Broadcast Logic (Simplified for Teachers)

We have simplified the broadcast flow to make it faster for school staff.

### Logic Changes:
- **Endpoint Path**: Standardized to **\/communications/broadcasts\** (Please update your POST and GET calls).
- **Targeting**: 
    - **Teachers & Principals**: No longer need to select a target. The backend automatically sends to the whole school (\ALL\).
    - **Admins**: Still have full control over targeting specific roles/groups.

### Implementation Detail:
- **GET \/communications/broadcasts/target-roles\**: Now returns an **empty array \[]\** for Teachers/Principals.
- **UI Suggestion**: If \	arget-roles\ returns an empty array, **hide the target selection dropdown** in the broadcast creation form. If it returns data (for Admins), show the dropdown.

### API Endpoints Updated:
- **POST \/communications/broadcasts\**: Send a new broadcast (Multipart/form-data with \iles\ array).
- **GET \/communications/broadcasts\**: Fetch the list of broadcasts.
- **GET \/communications/broadcasts/:id\**: Fetch full details of one announcement.

---

## ?? 7. Class In-charge & Attendance System

Dedicated endpoints for Teachers assigned as Class In-charges.

### Get My Students (with Leave Status)
- **Method**: \GET\\
- **URL**: \/academics/sections/my-class/students\\
- **Response**: Returns students in your section with a live \isOnLeave\ flag.\
\\\json
{
  'sectionId': '...',
  'students': [
    {
      'id': 'student_id',
      'name': 'Alice Smith',
      'rollNumber': 101,
      'isOnLeave': true,
      'leaveReason': 'Family Wedding'
    }
  ]
}
\\\`n
### Mark Class Attendance (Secure)
- **Method**: \POST\\
- **URL**: \/attendance/class/:sectionId\\
- **Body**: Standard attendance records array.\
- **Validation**: Fails if you are not the assigned in-charge for this section.\

### View History (Filtered)
- **Method**: \GET\\
- **URL**: \/attendance?section_id=SEC_ID\&date=2024-05-09\\
- **URL**: \/attendance?users_id=USER_ID\\
- **Note**: Use these filters to see history for a whole class or a specific student.

---

## 👮 8. Teacher Replacement (Substitution) System

For Principals and Admins to manage vacant classes.

### Get Absent Teachers & Affected Slots
- **Method**: `GET`
- **URL**: `/academics/substitutions/absent-teachers`
- **Response**: List of absent teachers and their empty timetable slots today.
```json
[
  {
    "teacherId": "...",
    "name": "John Doe",
    "affectedSlots": [
      { "timetableId": "...", "lectureNo": 2, "subject": "Maths", "class": "10-A" }
    ]
  }
]
```

### Get Available Substitutes
- **Method**: `GET`
- **URL**: `/academics/substitutions/available-teachers?lectureNo=2&dayOfWeek=Monday`
- **Response**: List of teachers who are FREE during this specific lecture.

### Assign Replacement
- **Method**: `POST`
- **URL**: `/academics/substitutions/assign`
- **Body**:
```json
{
  "date": "2024-05-09",
  "timetableId": "...",
  "subTeacherId": "...",
  "role": "TEACHING",
  "message": "Please cover Chapter 5"
}
```
- **Note**: Possible roles are `TEACHING`, `DISCIPLINE`, `REVISION`.

### View Active Replacements
- **Method**: `GET`
- **URL**: `/academics/substitutions/active`
