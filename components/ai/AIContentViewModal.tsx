import React from 'react';
import { X, FileText, Utensils, User, Calendar, Clock } from 'lucide-react';

interface AIContentViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  approval: {
    id: number;
    type: string;
    patientId: string;
    patientName: string;
    originalNotes: string;
    aiGeneratedContent: string;
    doctorId: string;
    doctorName: string;
    status: string;
    createdAt: string;
    approvedAt: string;
  } | null;
}

const AIContentViewModal = ({ isOpen, onClose, approval }: AIContentViewModalProps) => {
  if (!isOpen || !approval) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTypeIcon = () => {
    return approval.type === 'patient_summary' ? (
      <FileText className="h-5 w-5 text-blue-500" />
    ) : (
      <Utensils className="h-5 w-5 text-green-500" />
    );
  };

  const getTypeLabel = () => {
    return approval.type === 'patient_summary' ? 'Patient Summary' : 'Diet Plan';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            {getTypeIcon()}
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {getTypeLabel()} Details
              </h2>
              <p className="text-sm text-gray-600">
                {approval.patientName} ({approval.patientId})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Doctor</p>
                <p className="text-sm font-medium">{approval.doctorName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Generated</p>
                <p className="text-sm font-medium">{formatDate(approval.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Approved</p>
                <p className="text-sm font-medium">{formatDate(approval.approvedAt)}</p>
              </div>
            </div>
          </div>

          {/* Original Notes */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Original Doctor's Notes
            </h3>
            <div className="p-4 bg-gray-100 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                {approval.originalNotes}
              </pre>
            </div>
          </div>

          {/* AI Generated Content */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              AI Generated {getTypeLabel()}
            </h3>
            <div className={`p-4 rounded-lg ${
              approval.type === 'patient_summary' ? 'bg-blue-50' : 'bg-green-50'
            }`}>
              <pre className="whitespace-pre-wrap text-sm text-gray-700">
                {approval.aiGeneratedContent}
              </pre>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-green-700 font-medium">
                Status: {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
              </span>
            </div>
            <span className="text-sm text-green-600">
              This content has been approved and saved to the patient's medical record.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIContentViewModal;
