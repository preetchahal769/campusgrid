import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface School {
  id: string
  name: string
  address: string
  contactEmail: string
  status: string | { status: string }
  createdAt: string
  region?: string
}

export interface Invoice {
  id: string
  schoolName: string
  amount: number
  amountDue?: number
  status: string | { status: string }
  dueDate: string
}

export interface SubscriptionStats {
  totalRevenue: number
  revenue?: number
  totalAmount?: number
  activeSubscriptions: number
  pendingInvoices: number
  growthRate: number
  collectedRevenue?: number
  recentInvoices: Invoice[]
  trends?: AnalyticsTrend[]
  nodesByRegion?: Record<string, number>
}


export interface AuditLog {
  id: string
  action: string
  actorName: string
  actorRole: string
  timestamp: string
  details: string
  status: string | { status: string }
  severity?: string
  actorAvatar?: string
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | string
  details?: string
}

export interface StorageInfo {
  usagePercent: number
  totalBytes?: number
  usedBytes?: number
}

export interface LiveTraffic {
  totalActiveUsers: number
}

export interface EscalationTicket {
  id: string
  title?: string
  severity: 'high' | 'medium' | 'low' | string
  status: string
  createdAt?: string
}

export interface FinancialProjections {
  currentMRR: number
  growthRate?: number
}

export interface AnalyticsTrend {
  month: string
  revenue: number
  nodeCount: number
  userCount: number
}

export interface AnalyticsStats {
  totalStudents: number
  totalTeachers: number
  activeSchools: number
}

export interface GlobalAnalytics {
  trends?: AnalyticsTrend[]
  stats?: AnalyticsStats
  nodesByRegion?: Record<string, number> | { region: string; count: number }[]
}

interface NexusState {
  schools: School[]
  finance: SubscriptionStats | null
  auditLogs: AuditLog[]
  analytics: GlobalAnalytics | null
  health: SystemHealth | null
  storage: StorageInfo | null
  traffic: LiveTraffic | null
  escalations: EscalationTicket[]
  projections: FinancialProjections | null
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
    setFinance: (state, action: PayloadAction<SubscriptionStats | { data: SubscriptionStats } | { summary: SubscriptionStats }>) => {
      // Handle nested data or summary objects
      const data = (action.payload as any).data || (action.payload as any).summary || action.payload
      state.finance = data
      state.isLoading = false
      state.error = null
      localStorage.setItem('nexus_finance', JSON.stringify(data))
    },
    setAuditLogs: (state, action: PayloadAction<AuditLog[] | { data: AuditLog[] } | { logs: AuditLog[] }>) => {
      const data = (action.payload as any).data || (action.payload as any).logs || action.payload
      state.auditLogs = Array.isArray(data) ? data : []
      state.isLoading = false
      state.error = null
    },
    setAnalytics: (state, action: PayloadAction<GlobalAnalytics | { data: GlobalAnalytics } | { analytics: GlobalAnalytics }>) => {
      const data = (action.payload as any).data || (action.payload as any).analytics || action.payload
      state.analytics = data
      state.isLoading = false
      state.error = null
    },
    setTelemetry: (state, action: PayloadAction<{ health: SystemHealth | null, storage: StorageInfo | null, traffic: LiveTraffic | null, escalations: EscalationTicket[], projections: FinancialProjections | null }>) => {
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
