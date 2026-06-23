import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import studentReducer from './slices/studentSlice'
import teacherReducer from './slices/teacherSlice'
import nexusReducer from './slices/nexusSlice'
import leaveReducer from './slices/leaveSlice'
import attendanceReducer from './slices/attendanceSlice'
import { studentApi } from './services/studentApi'

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      student: studentReducer,
      teacher: teacherReducer,
      nexus: nexusReducer,
      leaves: leaveReducer,
      attendance: attendanceReducer,
      [studentApi.reducerPath]: studentApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat(studentApi.middleware),
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
