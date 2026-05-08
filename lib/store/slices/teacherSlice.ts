import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface TeacherProfile {
  id: string  // teacher profile ID (different from user ID)
  qualification: string
  specilization: string   // note: API uses this spelling
  Experince: string
  users: { name: string; email: string }
  teachersubjectsection: {
    subject: { name: string; code: string }
    section: { name: string; grade: { name: string } }
  }[]
}

export interface TimetableEntry {
  id: string
  dayOfWeek: string
  lectureNo: number
  startTime: string
  endTime: string
  section: { name: string; grade: { name: string } }
  subject: { name: string }
}

export interface LeaveRequest {
  id: string
  startDate: string
  endDate: string
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED'
  student: { users: { name: string } }
}

export interface Submission {
  id: string
  content: string
  fileUrl?: string
  marks?: number
  student: { users: { name: string } }
  assignment: { title: string; maxMarks: number }
}

interface TeacherState {
  profile: TeacherProfile | null
  timetable: TimetableEntry[]
  leaveRequests: LeaveRequest[]
  submissions: Submission[]
  isLoading: boolean
  error: string | null
}

const initialState: TeacherState = {
  profile: null,
  timetable: [],
  leaveRequests: [],
  submissions: [],
  isLoading: false,
  error: null,
}

export const teacherSlice = createSlice({
  name: 'teacher',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setTeacherProfile: (state, action: PayloadAction<TeacherProfile>) => {
      state.profile = action.payload
    },
    setTimetable: (state, action: PayloadAction<TimetableEntry[]>) => {
      state.timetable = action.payload
    },
    setLeaveRequests: (state, action: PayloadAction<LeaveRequest[]>) => {
      state.leaveRequests = action.payload
    },
    updateLeaveStatus: (state, action: PayloadAction<{ id: string; status: LeaveRequest['status'] }>) => {
      const leave = state.leaveRequests.find(l => l.id === action.payload.id)
      if (leave) leave.status = action.payload.status
    },
    setSubmissions: (state, action: PayloadAction<Submission[]>) => {
      state.submissions = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.isLoading = false
    },
    resetTeacherData: () => initialState,
  },
})

export const {
  setLoading,
  setTeacherProfile,
  setTimetable,
  setLeaveRequests,
  updateLeaveStatus,
  setSubmissions,
  setError,
  resetTeacherData,
} = teacherSlice.actions

export default teacherSlice.reducer
