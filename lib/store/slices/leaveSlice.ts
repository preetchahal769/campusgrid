import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface LeaveRequest {
  id: string
  studentName: string
  class: string
  duration: string
  dates: string
  reason: string
}

interface LeaveState {
  pendingRequests: LeaveRequest[]
  isLoading: boolean
  error: string | null
}

const initialState: LeaveState = {
  pendingRequests: [
    {
      id: "lr-1",
      studentName: "Aarav Sharma",
      class: "10-A",
      duration: "2 Days",
      dates: "23 May - 24 May",
      reason: "Recovering from severe viral fever, doctor advised complete bed rest."
    },
    {
      id: "lr-2",
      studentName: "Diya Patel",
      class: "10-A",
      duration: "1 Day",
      dates: "25 May",
      reason: "Attending sister's wedding ceremony in Noida."
    },
    {
      id: "lr-3",
      studentName: "Kabir Mehta",
      class: "10-A",
      duration: "3 Days",
      dates: "26 May - 28 May",
      reason: "Family emergency requiring travel to hometown."
    }
  ],
  isLoading: false,
  error: null
}

export const leaveSlice = createSlice({
  name: 'leaves',
  initialState,
  reducers: {
    resolveLeaveRequest: (state, action: PayloadAction<string>) => {
      state.pendingRequests = state.pendingRequests.filter(req => req.id !== action.payload)
    },
    addLeaveRequest: (state, action: PayloadAction<LeaveRequest>) => {
      state.pendingRequests.push(action.payload)
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
  resolveLeaveRequest,
  addLeaveRequest,
  setLoading,
  setError
} = leaveSlice.actions

export default leaveSlice.reducer
