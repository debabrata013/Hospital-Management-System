import { useState, useEffect } from 'react'

interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

export function usePharmacyStats() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/pharmacy/dashboard')
      const result: ApiResponse<any> = await response.json()
      
      if (result.success) {
        setStats(result.data)
        setError(null)
      } else {
        setError(result.error || 'Failed to fetch stats')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return { stats, loading, error, refetch: fetchStats }
}

export function useMedicines(filters: any = {}) {
  const [medicines, setMedicines] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMedicines = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value))
      })

      const response = await fetch(`/api/pharmacy/medicines?${params}`)
      const result: ApiResponse<any[]> = await response.json()
      
      if (result.success) {
        setMedicines(result.data)
        setError(null)
      } else {
        setError(result.error || 'Failed to fetch medicines')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedicines()
  }, [JSON.stringify(filters)])

  const createMedicine = async (data: any) => {
    try {
      const response = await fetch('/api/pharmacy/medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success) {
        await fetchMedicines()
        return result.data
      }
      throw new Error(result.error)
    } catch (err) {
      throw err
    }
  }

  return { medicines, loading, error, refetch: fetchMedicines, createMedicine }
}

export function useVendors(filters: any = {}) {
  const [vendors, setVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVendors = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value))
      })

      const response = await fetch(`/api/pharmacy/vendors?${params}`)
      const result: ApiResponse<any[]> = await response.json()
      
      if (result.success) {
        setVendors(result.data)
        setError(null)
      } else {
        setError(result.error || 'Failed to fetch vendors')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVendors()
  }, [JSON.stringify(filters)])

  const createVendor = async (data: any) => {
    try {
      const response = await fetch('/api/pharmacy/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success) {
        await fetchVendors()
        return result.data
      }
      throw new Error(result.error)
    } catch (err) {
      throw err
    }
  }

  return { vendors, loading, error, refetch: fetchVendors, createVendor }
}

export function usePrescriptions(filters: any = {}) {
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPrescriptions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value))
      })

      const response = await fetch(`/api/pharmacy/prescriptions?${params}`)
      const result: ApiResponse<any[]> = await response.json()
      
      if (result.success) {
        setPrescriptions(result.data)
        setError(null)
      } else {
        setError(result.error || 'Failed to fetch prescriptions')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrescriptions()
  }, [JSON.stringify(filters)])

  const dispensePrescription = async (id: string, items: any[]) => {
    try {
      const response = await fetch(`/api/pharmacy/prescriptions/${id}/dispense`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      })
      const result = await response.json()
      if (result.success) {
        await fetchPrescriptions()
        return result.data
      }
      throw new Error(result.error)
    } catch (err) {
      throw err
    }
  }

  return { prescriptions, loading, error, refetch: fetchPrescriptions, dispensePrescription }
}

export function useStockAlerts() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/pharmacy/alerts')
      const result: ApiResponse<any[]> = await response.json()
      
      if (result.success) {
        setAlerts(result.data)
        setError(null)
      } else {
        setError(result.error || 'Failed to fetch alerts')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [])

  return { alerts, loading, error, refetch: fetchAlerts }
}
