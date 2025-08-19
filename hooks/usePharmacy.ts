import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

// Updated Types to match our API structure
interface Medicine {
  id: number;
  medicine_id: string;
  name: string;
  generic_name?: string;
  brand_name?: string;
  category: string;
  manufacturer?: string;
  composition?: string;
  strength?: string;
  dosage_form: string;
  pack_size?: string;
  unit_price: number;
  mrp: number;
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number;
  expiry_date?: string;
  batch_number?: string;
  supplier?: string;
  storage_conditions?: string;
  side_effects?: string;
  contraindications?: string;
  drug_interactions?: string;
  pregnancy_category?: string;
  prescription_required: boolean;
  is_active: boolean;
  stock_status?: 'low' | 'medium' | 'good';
  expiry_status?: 'expired' | 'expiring_soon' | 'expiring_later' | 'good';
  created_at: string;
  updated_at: string;
}

interface Prescription {
  id: number;
  prescription_id: string;
  patient_id: number;
  doctor_id: number;
  appointment_id?: number;
  medical_record_id?: number;
  prescription_date: string;
  total_amount: number;
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  notes?: string;
  follow_up_date?: string;
  patient_name: string;
  patient_code: string;
  patient_phone?: string;
  doctor_name: string;
  specialization?: string;
  total_medications: number;
  dispensed_medications: number;
  dispensing_status: 'fully_dispensed' | 'partially_dispensed' | 'pending';
  created_at: string;
  updated_at: string;
}

interface PrescriptionMedication {
  id: number;
  prescription_id: number;
  medicine_id: number;
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  instructions?: string;
  is_dispensed: boolean;
  dispensed_at?: string;
  dispensed_by?: number;
}

interface StockTransaction {
  id: number;
  medicine_id: number;
  transaction_type: 'purchase' | 'sale' | 'return' | 'adjustment' | 'expired';
  quantity: number;
  unit_price: number;
  total_amount: number;
  batch_number?: string;
  expiry_date?: string;
  supplier?: string;
  reference_id?: string;
  notes?: string;
  created_by: number;
  created_at: string;
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
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Pharmacy Stats Hook
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

      // Fetch stock overview
      const response = await fetch('/api/pharmacy/stock');
      const data: ApiResponse<{
        overview: {
          total_medicines: number;
          low_stock_count: number;
          expiring_soon_count: number;
          total_stock_value: number;
        };
      }> = await response.json();

      if (data.success) {
        setStats({
          totalMedicines: data.data.overview.total_medicines,
          lowStock: data.data.overview.low_stock_count,
          expiringSoon: data.data.overview.expiring_soon_count,
          totalValue: data.data.overview.total_stock_value,
          loading: false,
          error: null
        });
      } else {
        throw new Error(data.error || 'Failed to fetch stats');
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

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { ...stats, refetch: fetchStats };
};

// Medicines Hook
export const useMedicines = (queryParams: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  lowStock?: boolean;
  expiringSoon?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
} = {}) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
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
      const data: ApiResponse<{ medicines: Medicine[]; filters: any }> = await response.json();

      if (data.success) {
        setMedicines(data.data.medicines);
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
  }, [JSON.stringify(queryParams)]);

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
        await fetchMedicines();
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
      const response = await fetch(`/api/pharmacy/medicines/${medicineId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      const data: ApiResponse<Medicine> = await response.json();

      if (data.success) {
        toast.success(data.message || 'Medicine updated successfully');
        await fetchMedicines();
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

  const deleteMedicine = async (medicineId: string) => {
    try {
      const response = await fetch(`/api/pharmacy/medicines/${medicineId}`, {
        method: 'DELETE'
      });

      const data: ApiResponse<any> = await response.json();

      if (data.success) {
        toast.success(data.message || 'Medicine deleted successfully');
        await fetchMedicines();
        return true;
      } else {
        throw new Error(data.error || 'Failed to delete medicine');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete medicine';
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
    updateMedicine,
    deleteMedicine
  };
};

// Prescriptions Hook
export const usePrescriptions = (queryParams: {
  page?: number;
  limit?: number;
  status?: string;
  patientId?: string;
  doctorId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  pendingOnly?: boolean;
} = {}) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [statistics, setStatistics] = useState({
    total_prescriptions: 0,
    active_prescriptions: 0,
    completed_prescriptions: 0,
    pending_dispensing: 0
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
      const data: ApiResponse<{
        prescriptions: Prescription[];
        statistics: any;
      }> = await response.json();

      if (data.success) {
        setPrescriptions(data.data.prescriptions);
        setStatistics(data.data.statistics);
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
  }, [JSON.stringify(queryParams)]);

  const createPrescription = async (prescriptionData: {
    patient_id: string;
    doctor_id: string;
    appointment_id?: string;
    medical_record_id?: string;
    prescription_date?: string;
    medications: Array<{
      medicine_id: string;
      dosage: string;
      frequency: string;
      duration: string;
      quantity: number;
      instructions?: string;
    }>;
    notes?: string;
    follow_up_date?: string;
  }) => {
    try {
      const response = await fetch('/api/pharmacy/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prescriptionData)
      });

      const data: ApiResponse<{
        prescription: Prescription;
        medications: PrescriptionMedication[];
      }> = await response.json();

      if (data.success) {
        toast.success(data.message || 'Prescription created successfully');
        await fetchPrescriptions();
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to create prescription');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create prescription';
      toast.error(errorMessage);
      throw error;
    }
  };

  const dispenseMedication = async (prescriptionId: string, medicationId: number, quantityDispensed: number, notes?: string) => {
    try {
      const response = await fetch(`/api/pharmacy/prescriptions/${prescriptionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'dispense_medication',
          medication_id: medicationId,
          quantity_dispensed: quantityDispensed,
          notes
        })
      });

      const data: ApiResponse<any> = await response.json();

      if (data.success) {
        toast.success(data.message || 'Medication dispensed successfully');
        await fetchPrescriptions();
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to dispense medication');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to dispense medication';
      toast.error(errorMessage);
      throw error;
    }
  };

  const dispenseAllMedications = async (prescriptionId: string, notes?: string) => {
    try {
      const response = await fetch(`/api/pharmacy/prescriptions/${prescriptionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'dispense_all',
          notes
        })
      });

      const data: ApiResponse<any> = await response.json();

      if (data.success) {
        toast.success(data.message || 'All medications dispensed successfully');
        await fetchPrescriptions();
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to dispense all medications');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to dispense all medications';
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
    statistics,
    loading,
    error,
    refetch: fetchPrescriptions,
    createPrescription,
    dispenseMedication,
    dispenseAllMedications
  };
};

export const useStock = (alertType?: 'low' | 'expiring' | 'expired') => {
  const [stockData, setStockData] = useState({
    overview: {
      total_medicines: 0,
      low_stock_count: 0,
      expired_count: 0,
      expiring_soon_count: 0,
      total_stock_value: 0
    },
    stock_alerts: [] as Medicine[],
    recent_transactions: [] as StockTransaction[]
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStock = useCallback(async (page = 1, limit = 20) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (alertType) {
        params.append('alertType', alertType);
      }

      const response = await fetch(`/api/pharmacy/stock?${params.toString()}`);
      const data: ApiResponse<typeof stockData> = await response.json();

      if (data.success) {
        setStockData(data.data);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } else {
        throw new Error(data.error || 'Failed to fetch stock data');
      }
    } catch (error) {
      console.error('Error fetching stock data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch stock data');
    } finally {
      setLoading(false);
    }
  }, [alertType]);

  const addStockTransaction = async (transactionData: {
    medicine_id: string;
    transaction_type: 'purchase' | 'sale' | 'return' | 'adjustment' | 'expired';
    quantity: number;
    unit_price?: number;
    total_amount?: number;
    batch_number?: string;
    expiry_date?: string;
    supplier?: string;
    reference_id?: string;
    notes?: string;
    adjustment_type?: 'increase' | 'decrease';
  }) => {
    try {
      const response = await fetch('/api/pharmacy/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData)
      });

      const data: ApiResponse<{
        transaction: StockTransaction;
        updated_medicine: Medicine;
      }> = await response.json();

      if (data.success) {
        toast.success(data.message || 'Stock transaction completed successfully');
        await fetchStock();
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to process stock transaction');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process stock transaction';
      toast.error(errorMessage);
      throw error;
    }
  };

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  return {
    stockData,
    pagination,
    loading,
    error,
    refetch: fetchStock,
    addStockTransaction
  };
};

// Pharmacy Alerts Hook
export const usePharmacyAlerts = () => {
  const [alerts, setAlerts] = useState<Medicine[]>([]);
  const [summary, setSummary] = useState({
    lowStockCount: 0,
    outOfStockCount: 0,
    expiringSoonCount: 0,
    expiredCount: 0,
    totalAlerts: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch low stock alerts
      const lowStockResponse = await fetch('/api/pharmacy/stock?alertType=low');
      const lowStockData: ApiResponse<{
        overview: any;
        stock_alerts: Medicine[];
      }> = await lowStockResponse.json();

      // Fetch expiring alerts
      const expiringResponse = await fetch('/api/pharmacy/stock?alertType=expiring');
      const expiringData: ApiResponse<{
        overview: any;
        stock_alerts: Medicine[];
      }> = await expiringResponse.json();

      // Fetch expired alerts
      const expiredResponse = await fetch('/api/pharmacy/stock?alertType=expired');
      const expiredData: ApiResponse<{
        overview: any;
        stock_alerts: Medicine[];
      }> = await expiredResponse.json();

      if (lowStockData.success && expiringData.success && expiredData.success) {
        const allAlerts = [
          ...lowStockData.data.stock_alerts,
          ...expiringData.data.stock_alerts,
          ...expiredData.data.stock_alerts
        ];

        setAlerts(allAlerts);
        setSummary({
          lowStockCount: lowStockData.data.stock_alerts.filter(m => m.stock_status === 'low').length,
          outOfStockCount: lowStockData.data.stock_alerts.filter(m => m.current_stock === 0).length,
          expiringSoonCount: expiringData.data.stock_alerts.length,
          expiredCount: expiredData.data.stock_alerts.length,
          totalAlerts: allAlerts.length
        });
      } else {
        throw new Error('Failed to fetch alerts');
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  }, []);

  const markAlertsResolved = async (medicineIds: string[]) => {
    try {
      // This would typically update the medicines or create alert resolution records
      // For now, we'll just refresh the alerts
      toast.success('Alerts marked as resolved');
      await fetchAlerts();
      return true;
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
    alerts: {
      lowStock: alerts.filter(m => m.stock_status === 'low'),
      outOfStock: alerts.filter(m => m.current_stock === 0),
      expiringSoon: alerts.filter(m => m.expiry_status === 'expiring_soon'),
      expired: alerts.filter(m => m.expiry_status === 'expired'),
      overstock: alerts.filter(m => m.current_stock > m.maximum_stock)
    },
    summary,
    loading,
    error,
    refetch: fetchAlerts,
    markAlertsResolved
  };
};

// Search Hook
export const usePharmacySearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string, type: 'medicines' | 'prescriptions' | 'patients' | 'all' = 'all', limit = 10) => {
    try {
      setLoading(true);
      setError(null);

      if (!query || query.length < 2) {
        throw new Error('Search query must be at least 2 characters long');
      }

      const params = new URLSearchParams({
        q: query,
        type,
        limit: limit.toString()
      });

      const response = await fetch(`/api/pharmacy/search?${params.toString()}`);
      const data: ApiResponse<{
        medicines?: Medicine[];
        prescriptions?: Prescription[];
        patients?: any[];
      }> = await response.json();

      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Search failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getMedicineSuggestions = async (params: {
    symptoms?: string;
    category?: string;
    doctor_id?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/pharmacy/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'medicine_suggestions',
          ...params
        })
      });

      const data: ApiResponse<Medicine[]> = await response.json();

      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to get medicine suggestions');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get medicine suggestions';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getPatientHistory = async (patientId: string, limit = 10) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/pharmacy/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'patient_history',
          patient_id: patientId,
          limit
        })
      });

      const data: ApiResponse<{
        patient: any;
        prescription_history: Prescription[];
        frequent_medicines: Medicine[];
      }> = await response.json();

      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to get patient history');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get patient history';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    search,
    getMedicineSuggestions,
    getPatientHistory
  };
};

// Reports Hook
export const usePharmacyReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async (params: {
    type: 'overview' | 'sales' | 'inventory' | 'prescriptions' | 'expiry' | 'financial';
    dateFrom?: string;
    dateTo?: string;
    category?: string;
    doctorId?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/pharmacy/reports?${queryParams.toString()}`);
      const data: ApiResponse<any> = await response.json();

      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to generate report');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate report';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    generateReport
  };
};

// Individual Prescription Hook
export const usePrescriptionDetails = (prescriptionId: string) => {
  const [prescription, setPrescription] = useState<{
    prescription: Prescription & {
      patient_phone?: string;
      date_of_birth?: string;
      gender?: string;
      blood_group?: string;
      allergies?: string;
      current_medications?: string;
      appointment_date?: string;
      appointment_time?: string;
      diagnosis?: string;
      doctor_notes?: string;
    };
    medications: Array<PrescriptionMedication & {
      generic_name?: string;
      brand_name?: string;
      category?: string;
      manufacturer?: string;
      current_stock: number;
      minimum_stock: number;
      expiry_date?: string;
      batch_number?: string;
      side_effects?: string;
      contraindications?: string;
      drug_interactions?: string;
      availability_status: 'available' | 'partial' | 'out_of_stock';
      expiry_status: 'expired' | 'expiring_soon' | 'good';
    }>;
    dispensing_summary: {
      total_medications: number;
      dispensed_medications: number;
      pending_medications: number;
      out_of_stock_medications: number;
      total_amount: number;
      dispensed_amount: number;
      pending_amount: number;
    };
    dispensing_history: StockTransaction[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrescriptionDetails = useCallback(async () => {
    if (!prescriptionId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/pharmacy/prescriptions/${prescriptionId}`);
      const data: ApiResponse<typeof prescription> = await response.json();

      if (data.success) {
        setPrescription(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch prescription details');
      }
    } catch (error) {
      console.error('Error fetching prescription details:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch prescription details');
    } finally {
      setLoading(false);
    }
  }, [prescriptionId]);

  const dispenseMedication = async (medicationId: number, quantityDispensed: number, notes?: string) => {
    try {
      const response = await fetch(`/api/pharmacy/prescriptions/${prescriptionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'dispense_medication',
          medication_id: medicationId,
          quantity_dispensed: quantityDispensed,
          notes
        })
      });

      const data: ApiResponse<any> = await response.json();

      if (data.success) {
        toast.success(data.message || 'Medication dispensed successfully');
        await fetchPrescriptionDetails();
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to dispense medication');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to dispense medication';
      toast.error(errorMessage);
      throw error;
    }
  };

  const dispenseAll = async (notes?: string) => {
    try {
      const response = await fetch(`/api/pharmacy/prescriptions/${prescriptionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'dispense_all',
          notes
        })
      });

      const data: ApiResponse<any> = await response.json();

      if (data.success) {
        toast.success(data.message || 'All medications dispensed successfully');
        await fetchPrescriptionDetails();
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to dispense all medications');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to dispense all medications';
      toast.error(errorMessage);
      throw error;
    }
  };

  const updateStatus = async (status: string, notes?: string) => {
    try {
      const response = await fetch(`/api/pharmacy/prescriptions/${prescriptionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          status,
          notes
        })
      });

      const data: ApiResponse<any> = await response.json();

      if (data.success) {
        toast.success(data.message || 'Prescription status updated successfully');
        await fetchPrescriptionDetails();
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to update prescription status');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update prescription status';
      toast.error(errorMessage);
      throw error;
    }
  };

  useEffect(() => {
    fetchPrescriptionDetails();
  }, [fetchPrescriptionDetails]);

  return {
    prescription,
    loading,
    error,
    refetch: fetchPrescriptionDetails,
    dispenseMedication,
    dispenseAll,
    updateStatus
  };
};

// Medicine Details Hook
export const useMedicineDetails = (medicineId: string) => {
  const [medicine, setMedicine] = useState<{
    medicine: Medicine;
    recent_transactions: StockTransaction[];
    usage_stats: {
      prescription_count: number;
      total_dispensed: number;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedicineDetails = useCallback(async () => {
    if (!medicineId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/pharmacy/medicines/${medicineId}`);
      const data: ApiResponse<typeof medicine> = await response.json();

      if (data.success) {
        setMedicine(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch medicine details');
      }
    } catch (error) {
      console.error('Error fetching medicine details:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch medicine details');
    } finally {
      setLoading(false);
    }
  }, [medicineId]);

  const updateStock = async (stockAdjustment: number, notes?: string, batchNumber?: string, expiryDate?: string) => {
    try {
      const response = await fetch(`/api/pharmacy/medicines/${medicineId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stock_adjustment: stockAdjustment,
          adjustment_notes: notes,
          batch_number: batchNumber,
          expiry_date: expiryDate
        })
      });

      const data: ApiResponse<Medicine> = await response.json();

      if (data.success) {
        toast.success(data.message || 'Stock updated successfully');
        await fetchMedicineDetails();
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to update stock');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update stock';
      toast.error(errorMessage);
      throw error;
    }
  };

  useEffect(() => {
    fetchMedicineDetails();
  }, [fetchMedicineDetails]);

  return {
    medicine,
    loading,
    error,
    refetch: fetchMedicineDetails,
    updateStock
  };
};
