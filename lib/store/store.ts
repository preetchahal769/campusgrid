import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import studentReducer from './slices/studentSlice'
import teacherReducer from './slices/teacherSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    student: studentReducer,
    teacher: teacherReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
