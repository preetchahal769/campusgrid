import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface StudentProfile {
  id: string
  admissionNumber: string
  rollNumber: number
  rankingPoints: number
  status: string
  users: {
    name: string
    email: string
    globalRating: number
    globalRank: number
  }
  section: {
    id: string
    name: string
    grade: { name: string }
  }
}

export interface Assignment {
  id: string
  title: string
  description: string
  dueDate: string
  maxMarks: number
  subject: { name: string; code: string }
  isSubmitted?: boolean
  submission?: {
    status: string
    submittedAt: string
    attachments: { fileurl: string; filename: string }[]
  }
}

export interface Broadcast {
  id: string
  title: string
  message: string
  targetrole: string
  author: { name: string; role: string }
  attachments: { id: string; fileurl: string; filetype: string; filename: string }[]
}

export interface TimetableEntry {
  id: string
  dayOfWeek: string
  lectureNo: number
  startTime: string
  endTime: string
  teachersubjectsection: {
    subject: { name: string }
    teachers: { users: { name: string } }
  }
}

export interface AttendanceRecord {
  date: string
  status: 'PRESENT' | 'ABSENT' | 'LEAVE'
}

export interface LeaveRecord {
  id: string
  startDate: string
  endDate: string
  reason: string
  attachmentUrl?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED'
}

interface StudentState {
  profile: StudentProfile | null
  assignments: Assignment[]
  broadcasts: Broadcast[]
  timetable: TimetableEntry[]
  attendance: AttendanceRecord[]
  leaves: LeaveRecord[]
  isLoading: boolean
  error: string | null
}

const getInitialState = (): StudentState => {
  if (typeof window !== 'undefined') {
    const savedProfile = localStorage.getItem('cg_profile')
    return {
      profile: savedProfile ? JSON.parse(savedProfile) : null,
      assignments: [],
      broadcasts: [],
      timetable: [],
      attendance: [],
      leaves: [],
      isLoading: false,
      error: null,
    }
  }
  return {
    profile: null,
    assignments: [],
    broadcasts: [],
    timetable: [],
    attendance: [],
    leaves: [],
    isLoading: false,
    error: null,
  }
}

const initialState: StudentState = getInitialState()

export const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setProfile: (state, action: PayloadAction<StudentProfile>) => {
      state.profile = action.payload
      localStorage.setItem('cg_profile', JSON.stringify(action.payload))
    },
    setAssignments: (state, action: PayloadAction<Assignment[]>) => {
      state.assignments = action.payload
    },
    setBroadcasts: (state, action: PayloadAction<Broadcast[]>) => {
      state.broadcasts = action.payload
    },
    setTimetable: (state, action: PayloadAction<TimetableEntry[]>) => {
      state.timetable = action.payload
    },
    setAttendance: (state, action: PayloadAction<AttendanceRecord[]>) => {
      state.attendance = action.payload
    },
    setLeaves: (state, action: PayloadAction<LeaveRecord[]>) => {
      state.leaves = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.isLoading = false
    },
    resetStudentData: () => {
      localStorage.removeItem('cg_profile')
      return {
        profile: null,
        assignments: [],
        broadcasts: [],
        timetable: [],
        attendance: [],
        leaves: [],
        isLoading: false,
        error: null,
      }
    }
  },
})

export const {
  setLoading,
  setProfile,
  setAssignments,
  setBroadcasts,
  setTimetable,
  setAttendance,
  setLeaves,
  setError,
  resetStudentData
} = studentSlice.actions

export default studentSlice.reducer
