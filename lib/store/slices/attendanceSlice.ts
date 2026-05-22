import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Student {
  id: string
  name: string
  rollNumber: string
  status: 'present' | 'absent' | 'leave'
  leaveStatus?: 'approved' | 'pending' | 'none'
}

interface AttendanceState {
  class10A: Student[]
  isLoading: boolean
  error: string | null
}

const initialState: AttendanceState = {
  class10A: [
    {
      id: 'stud-1',
      name: 'Aarav Sharma',
      rollNumber: 'CG-2026-1001',
      status: 'present',
      leaveStatus: 'pending'
    },
    {
      id: 'stud-2',
      name: 'Diya Patel',
      rollNumber: 'CG-2026-1002',
      status: 'present',
      leaveStatus: 'pending'
    },
    {
      id: 'stud-3',
      name: 'Kabir Mehta',
      rollNumber: 'CG-2026-1003',
      status: 'present',
      leaveStatus: 'pending'
    },
    {
      id: 'stud-4',
      name: 'Priya Singh',
      rollNumber: 'CG-2026-1004',
      status: 'present',
      leaveStatus: 'none'
    },
    {
      id: 'stud-5',
      name: 'Rohan Gupta',
      rollNumber: 'CG-2026-1005',
      status: 'present',
      leaveStatus: 'none'
    },
    {
      id: 'stud-6',
      name: 'Meera Reddy',
      rollNumber: 'CG-2026-1006',
      status: 'present',
      leaveStatus: 'none'
    }
  ],
  isLoading: false,
  error: null
}

export const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    toggleStudentStatus: (
      state,
      action: PayloadAction<{ id: string; newStatus: 'present' | 'absent'; isMorningRoll?: boolean }>
    ) => {
      const student = state.class10A.find(s => s.id === action.payload.id)
      if (student && student.leaveStatus !== 'approved') {
        student.status = action.payload.newStatus
      }
    },
    updateLeaveStatusByName: (
      state,
      action: PayloadAction<{ name: string; leaveAction: 'approve' | 'decline'; isMaster?: boolean }>
    ) => {
      const student = state.class10A.find(s => s.name.toLowerCase() === action.payload.name.toLowerCase())
      if (student) {
        if (action.payload.leaveAction === 'approve') {
          student.leaveStatus = 'approved'
          student.status = 'leave'
        } else {
          student.leaveStatus = 'none'
          student.status = 'present' // default back to present if declined
        }
      }
    },
    submitMorningRoll: (state) => {
      // Typically writes/posts attendance data. We can just log or set loading.
      console.log('Morning Roll call submitted successfully!')
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.isLoading = false
    }
  }
})

export const {
  toggleStudentStatus,
  updateLeaveStatusByName,
  submitMorningRoll,
  setLoading,
  setError
} = attendanceSlice.actions

export default attendanceSlice.reducer
