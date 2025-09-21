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
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    birth_date: '',
    gender: 'male' as const,
    status: 'healthy' as const,
    weight_grams: '',
    mother_name: '',
    notes: ''
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.birth_date || !formData.gender || !formData.status || !formData.weight_grams) {
      toast.error('Please fill in all required fields');
      return;
    }

    const weight = parseInt(formData.weight_grams);
    if (isNaN(weight) || weight < 500 || weight > 10000) {
      toast.error('Weight must be between 500g and 10000g');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/doctor/newborn-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Newborn record created successfully');
        setShowForm(false);
        setFormData({
          birth_date: '',
          gender: 'male',
          status: 'healthy',
          weight_grams: '',
          mother_name: '',
          notes: ''
        });
        fetchRecords(); // Refresh the list
      } else {
        toast.error(data.message || 'Failed to create newborn record');
      }
    } catch (error) {
      console.error('Error creating newborn record:', error);
      toast.error('Failed to create newborn record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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

            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Record
            </button>
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
              <p className="text-gray-600 mb-4">Start by adding the first newborn record</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Record
              </button>
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
                          <span>{formatDate(record.birth_date)}</span>
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

      {/* Add Record Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add Newborn Record</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Birth Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      name="birth_date"
                      value={formData.birth_date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender *
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                      required
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="ambiguous">Ambiguous</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Health Status *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                      required
                    >
                      <option value="healthy">Healthy</option>
                      <option value="under_observation">Under Observation</option>
                      <option value="critical">Critical</option>
                      <option value="deceased">Deceased</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (grams) *
                    </label>
                    <input
                      type="number"
                      name="weight_grams"
                      value={formData.weight_grams}
                      onChange={handleInputChange}
                      placeholder="3000"
                      min="500"
                      max="10000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mother's Name
                  </label>
                  <input
                    type="text"
                    name="mother_name"
                    value={formData.mother_name}
                    onChange={handleInputChange}
                    placeholder="Enter mother's name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Additional notes about the birth..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Save Record'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
