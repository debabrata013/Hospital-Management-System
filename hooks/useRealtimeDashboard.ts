import { useState, useEffect, useCallback } from 'react'

interface DashboardStats {
  doctorsOnDuty: number
  staffOnDuty: number
  availableRooms: number
  shiftChanges: number
  totalPatients: number
  todayAppointments: number
  emergencyCases: number
  lastUpdated: string
}

interface UseRealtimeDashboardReturn {
  stats: DashboardStats
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useRealtimeDashboard(refreshInterval: number = 30000): UseRealtimeDashboardReturn {
  const [stats, setStats] = useState<DashboardStats>({
    doctorsOnDuty: 0,
    staffOnDuty: 0,
    availableRooms: 0,
    shiftChanges: 0,
    totalPatients: 0,
    todayAppointments: 0,
    emergencyCases: 0,
    lastUpdated: new Date().toISOString()
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setError(null)
      const response = await fetch('/api/admin/realtime-dashboard-stats')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats')
    } finally {
      setLoading(false)
    }
  }, [])

  const refresh = useCallback(() => {
    setLoading(true)
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    // Initial fetch
    fetchStats()

    // Set up interval for auto-refresh
    const interval = setInterval(fetchStats, refreshInterval)

    return () => clearInterval(interval)
  }, [fetchStats, refreshInterval])

  return {
    stats,
    loading,
    error,
    refresh
  }
}
