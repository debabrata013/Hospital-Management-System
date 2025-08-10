import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

// Types
interface Medicine {
  _id: string;
  medicineId: string;
  medicineName: string;
  genericName?: string;
  brandName?: string;
  manufacturer: string;
  category: string;
  dosageForm: string;
  strength: string;
  unit: string;
  inventory: {
    currentStock: number;
    reorderLevel: number;
    maximumStock: number;
  };
  pricing: {
    costPrice: number;
    sellingPrice: number;
    mrp: number;
  };
  batches: Array<{
    batchNo: string;
    quantity: number;
    expiryDate: string;
    status: string;
  }>;
  isActive: boolean;
}

interface Prescription {
  _id: string;
  prescriptionId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  medicines: Array<{
    medicineId: string;
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
    instructions?: string;
  }>;
  status: 'pending' | 'partially_dispensed' | 'dispensed' | 'cancelled';
  prescriptionDate: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

interface Alert {
  lowStock: Medicine[];
  outOfStock: Medicine[];
  expiringSoon: Array<Medicine & { daysToExpiry: number }>;
  expired: Array<Medicine & { daysExpired: number }>;
  overstock: Medicine[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Custom hooks
export const usePharmacyStats = () => {
  const [stats, setStats] = useState({
    totalMedicines: 0,
    lowStock: 0,
    expiringSoon: 0,
    totalValue: 0,
    loading: true,
    error: null as string | null
  });

  const fetchStats = useCallback(async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));

      // Fetch medicines count and value
      const medicinesResponse = await fetch('/api/pharmacy/medicines?limit=1');
      const medicinesData: ApiResponse<Medicine[]> = await medicinesResponse.json();

      // Fetch alerts for low stock and expiring items
      const alertsResponse = await fetch('/api/pharmacy/alerts');
      const alertsData: ApiResponse<{ alerts: Alert; summary: any }> = await alertsResponse.json();

      if (medicinesData.success && alertsData.success) {
        const totalValue = await calculateTotalInventoryValue();
        
        setStats({
          totalMedicines: medicinesData.pagination?.total || 0,
          lowStock: alertsData.data.summary.lowStockCount + alertsData.data.summary.outOfStockCount,
          expiringSoon: alertsData.data.summary.expiringSoonCount,
          totalValue,
          loading: false,
          error: null
        });
      } else {
        throw new Error(medicinesData.error || alertsData.error || 'Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching pharmacy stats:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch stats'
      }));
    }
  }, []);

  const calculateTotalInventoryValue = async (): Promise<number> => {
    try {
      const response = await fetch('/api/pharmacy/inventory?reportType=value_summary');
      const data: ApiResponse<{ totalValue: number }> = await response.json();
      return data.success ? data.data.totalValue : 0;
    } catch {
      return 0;
    }
  };

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { ...stats, refetch: fetchStats };
};

export const useMedicines = (queryParams: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  manufacturer?: string;
  stockStatus?: string;
} = {}) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedicines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/pharmacy/medicines?${params.toString()}`);
      const data: ApiResponse<Medicine[]> = await response.json();

      if (data.success) {
        setMedicines(data.data);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } else {
        throw new Error(data.error || 'Failed to fetch medicines');
      }
    } catch (error) {
      console.error('Error fetching medicines:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch medicines');
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  const createMedicine = async (medicineData: Partial<Medicine>) => {
    try {
      const response = await fetch('/api/pharmacy/medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medicineData)
      });

      const data: ApiResponse<Medicine> = await response.json();

      if (data.success) {
        toast.success(data.message || 'Medicine created successfully');
        await fetchMedicines(); // Refresh the list
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to create medicine');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create medicine';
      toast.error(errorMessage);
      throw error;
    }
  };

  const updateMedicine = async (medicineId: string, updates: Partial<Medicine>) => {
    try {
      const response = await fetch('/api/pharmacy/medicines', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicineId, updates })
      });

      const data: ApiResponse<Medicine> = await response.json();

      if (data.success) {
        toast.success(data.message || 'Medicine updated successfully');
        await fetchMedicines(); // Refresh the list
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to update medicine');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update medicine';
      toast.error(errorMessage);
      throw error;
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  return {
    medicines,
    pagination,
    loading,
    error,
    refetch: fetchMedicines,
    createMedicine,
    updateMedicine
  };
};

export const usePrescriptions = (queryParams: {
  page?: number;
  limit?: number;
  status?: string;
  patientId?: string;
  search?: string;
} = {}) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrescriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/pharmacy/prescriptions?${params.toString()}`);
      const data: ApiResponse<Prescription[]> = await response.json();

      if (data.success) {
        setPrescriptions(data.data);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } else {
        throw new Error(data.error || 'Failed to fetch prescriptions');
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch prescriptions');
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  const dispensePrescription = async (prescriptionId: string, dispensingData: any) => {
    try {
      const response = await fetch('/api/pharmacy/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prescriptionId,
          ...dispensingData
        })
      });

      const data: ApiResponse<any> = await response.json();

      if (data.success) {
        toast.success(data.message || 'Prescription dispensed successfully');
        await fetchPrescriptions(); // Refresh the list
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to dispense prescription');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to dispense prescription';
      toast.error(errorMessage);
      throw error;
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  return {
    prescriptions,
    pagination,
    loading,
    error,
    refetch: fetchPrescriptions,
    dispensePrescription
  };
};

export const usePharmacyAlerts = (alertType: string = 'all') => {
  const [alerts, setAlerts] = useState<Alert>({
    lowStock: [],
    outOfStock: [],
    expiringSoon: [],
    expired: [],
    overstock: []
  });
  const [summary, setSummary] = useState({
    lowStockCount: 0,
    outOfStockCount: 0,
    expiringSoonCount: 0,
    expiredCount: 0,
    overstockCount: 0,
    totalAlerts: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/pharmacy/alerts?alertType=${alertType}`);
      const data: ApiResponse<{ alerts: Alert; summary: any }> = await response.json();

      if (data.success) {
        setAlerts(data.data.alerts);
        setSummary(data.data.summary);
      } else {
        throw new Error(data.error || 'Failed to fetch alerts');
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  }, [alertType]);

  const sendAlertNotifications = async (medicineIds: string[], recipients?: string[]) => {
    try {
      const response = await fetch('/api/pharmacy/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_notifications',
          medicineIds,
          recipients,
          alertType
        })
      });

      const data: ApiResponse<any> = await response.json();

      if (data.success) {
        toast.success(data.message || 'Notifications sent successfully');
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to send notifications');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send notifications';
      toast.error(errorMessage);
      throw error;
    }
  };

  const markAlertsResolved = async (medicineIds: string[]) => {
    try {
      const response = await fetch('/api/pharmacy/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mark_resolved',
          medicineIds,
          alertType
        })
      });

      const data: ApiResponse<any> = await response.json();

      if (data.success) {
        toast.success(data.message || 'Alerts marked as resolved');
        await fetchAlerts(); // Refresh alerts
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to mark alerts as resolved');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark alerts as resolved';
      toast.error(errorMessage);
      throw error;
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return {
    alerts,
    summary,
    loading,
    error,
    refetch: fetchAlerts,
    sendAlertNotifications,
    markAlertsResolved
  };
};

export const useInventory = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addBatch = async (batchData: {
    medicineId: string;
    batchNo: string;
    quantity: number;
    expiryDate: string;
    costPrice: number;
    sellingPrice: number;
    mrp: number;
    vendorId?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/pharmacy/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_batch',
          ...batchData
        })
      });

      const data: ApiResponse<Medicine> = await response.json();

      if (data.success) {
        toast.success(data.message || 'Batch added successfully');
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to add batch');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add batch';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const recordStockMovement = async (movementData: {
    medicineId: string;
    movementType: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER' | 'RETURN' | 'DAMAGE' | 'EXPIRED';
    quantity: number;
    batchNo?: string;
    reason: string;
    referenceId?: string;
    notes?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/pharmacy/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'stock_movement',
          ...movementData
        })
      });

      const data: ApiResponse<Medicine> = await response.json();

      if (data.success) {
        toast.success(data.message || 'Stock movement recorded successfully');
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to record stock movement');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to record stock movement';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (reportParams: {
    reportType: 'stock_summary' | 'low_stock' | 'expiry_report' | 'movement_history' | 'value_summary';
    dateFrom?: string;
    dateTo?: string;
    category?: string;
    manufacturer?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      Object.entries(reportParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/pharmacy/inventory?${params.toString()}`);
      const data: ApiResponse<any> = await response.json();

      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to generate report');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate report';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    addBatch,
    recordStockMovement,
    generateReport
  };
};
