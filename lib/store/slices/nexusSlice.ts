import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface School {
  id: string
  name: string
  address: string
  contactEmail: string
  status: any
  createdAt: string
  region?: string
}

interface SubscriptionStats {
  totalRevenue: number
  activeSubscriptions: number
  pendingInvoices: number
  growthRate: number
  recentInvoices: any[]
  trends?: any[]
  nodesByRegion?: any
}

interface AuditLog {
  id: string
  action: string
  actorName: string
  actorRole: string
  timestamp: string
  details: string
  status: any
  severity?: string
  actorAvatar?: string
}

interface NexusState {
  schools: School[]
  finance: SubscriptionStats | null
  auditLogs: AuditLog[]
  analytics: any | null
  health: any | null
  storage: any | null
  traffic: any | null
  escalations: any[]
  projections: any | null
  isLoading: boolean
  error: string | null
}

const getInitialState = (): NexusState => {
  if (typeof window !== 'undefined') {
    const savedSchools = localStorage.getItem('nexus_schools')
    const savedFinance = localStorage.getItem('nexus_finance')
    return {
      schools: savedSchools ? JSON.parse(savedSchools) : [],
      finance: savedFinance ? JSON.parse(savedFinance) : null,
      auditLogs: [],
      analytics: null,
      health: null,
      storage: null,
      traffic: null,
      escalations: [],
      projections: null,
      isLoading: false,
      error: null,
    }
  }
  return {
    schools: [],
    finance: null,
    auditLogs: [],
    analytics: null,
    health: null,
    storage: null,
    traffic: null,
    escalations: [],
    projections: null,
    isLoading: false,
    error: null,
  }
}

const initialState: NexusState = getInitialState()

export const nexusSlice = createSlice({
  name: 'nexus',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setSchools: (state, action: PayloadAction<School[]>) => {
      state.schools = action.payload
      state.isLoading = false
      state.error = null
      localStorage.setItem('nexus_schools', JSON.stringify(action.payload))
    },
    setFinance: (state, action: PayloadAction<any>) => {
      // Handle nested data or summary objects
      const data = action.payload.data || action.payload.summary || action.payload
      state.finance = data
      state.isLoading = false
      state.error = null
      localStorage.setItem('nexus_finance', JSON.stringify(data))
    },
    setAuditLogs: (state, action: PayloadAction<any>) => {
      const data = action.payload.data || action.payload.logs || action.payload
      state.auditLogs = Array.isArray(data) ? data : []
      state.isLoading = false
      state.error = null
    },
    setAnalytics: (state, action: PayloadAction<any>) => {
      const data = action.payload.data || action.payload.analytics || action.payload
      state.analytics = data
      state.isLoading = false
      state.error = null
    },
    setTelemetry: (state, action: PayloadAction<{ health: any, storage: any, traffic: any, escalations: any[], projections: any }>) => {
      state.health = action.payload.health
      state.storage = action.payload.storage
      state.traffic = action.payload.traffic
      state.escalations = action.payload.escalations
      state.projections = action.payload.projections
      state.isLoading = false
      state.error = null
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.isLoading = false
    },
    updateSchoolInStore: (state, action: PayloadAction<School>) => {
      const updated = action.payload
      state.schools = state.schools.map(s => s.id === updated.id ? updated : s)
      localStorage.setItem('nexus_schools', JSON.stringify(state.schools))
    },
    clearNexusData: () => {
      localStorage.removeItem('nexus_schools')
      localStorage.removeItem('nexus_finance')
      return {
        schools: [],
        finance: null,
        auditLogs: [],
        analytics: null,
        health: null,
        storage: null,
        traffic: null,
        escalations: [],
        projections: null,
        isLoading: false,
        error: null,
      }
    }
  },
})

export const { 
  setLoading, 
  setSchools, 
  setFinance, 
  setAuditLogs, 
  setAnalytics, 
  setTelemetry,
  setError,
  updateSchoolInStore,
  clearNexusData
} = nexusSlice.actions

export default nexusSlice.reducer
