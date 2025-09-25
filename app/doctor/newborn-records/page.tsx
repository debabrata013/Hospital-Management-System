'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Baby, Calendar, Weight, User, Heart, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface NewbornRecord {
  id: number;
  record_id: string;
  birth_date: string;
  gender: 'male' | 'female' | 'ambiguous';
  status: 'healthy' | 'under_observation' | 'critical' | 'deceased';
  weight_grams: number;
  mother_name?: string;
  notes?: string;
  created_at: string;
}

export default function NewbornRecordsPage() {
  const [records, setRecords] = useState<NewbornRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);


  useEffect(() => {
    fetchUserProfile();
    fetchRecords();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/doctor/profile');
      const data = await response.json();
      if (data.success) {
        setUser(data.staff);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/doctor/newborn-records');
      const data = await response.json();
      if (data.success) {
        setRecords(data.data);
      }
    } catch (error) {
      console.error('Error fetching newborn records:', error);
      toast.error('Failed to load newborn records');
    } finally {
      setLoading(false);
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'under_observation': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      case 'deceased': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGenderIcon = (gender: string) => {
    switch (gender) {
      case 'male': return '👦';
      case 'female': return '👧';
      case 'ambiguous': return '👶';
      default: return '👶';
    }
  };


  const formatWeight = (grams: number) => {
    const kg = (grams / 1000).toFixed(2);
    return `${kg} kg`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/doctor"
                className="inline-flex items-center text-gray-600 hover:text-pink-600 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-2">
                <Baby className="h-6 w-6 text-pink-600" />
                <h1 className="text-2xl font-bold text-gray-900">Newborn Records</h1>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Records managed by nursing staff
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Records List */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Birth Records</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage newborn baby records and birth information
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading newborn records...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="p-8 text-center">
              <Baby className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No newborn records yet</h3>
              <p className="text-gray-600">Records will appear here once nursing staff adds them</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {records.map((record) => (
                <div key={record.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">{getGenderIcon(record.gender)}</span>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {record.record_id}
                        </h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                          {record.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{record.birth_date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Weight className="h-4 w-4" />
                          <span>{formatWeight(record.weight_grams)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>{record.mother_name || 'Not specified'}</span>
                        </div>
                      </div>

                      {record.notes && (
                        <p className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded">
                          {record.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
