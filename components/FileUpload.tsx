'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, File, CheckCircle, AlertCircle, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface FileUploadProps {
  patientId: string;
  onUploadSuccess?: (fileData: any) => void;
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
}

interface UploadedFile {
  key: string;
  presignedUrl: string;
  originalName: string;
  size: number;
  mimeType: string;
  documentType: string;
  uploadTime: string;
}

const documentTypes = [
  { value: 'lab-report', label: 'Lab Report' },
  { value: 'x-ray', label: 'X-Ray' },
  { value: 'prescription', label: 'Prescription' },
  { value: 'medical-record', label: 'Medical Record' },
  { value: 'profile-image', label: 'Profile Image' },
  { value: 'other', label: 'Other' },
];

export default function FileUpload({ 
  patientId, 
  onUploadSuccess,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  allowedTypes = []
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [documentType, setDocumentType] = useState('other');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file size
    if (file.size > maxFileSize) {
      toast.error(`File size exceeds ${Math.round(maxFileSize / (1024 * 1024))}MB limit`);
      return;
    }

    // Validate file type if specified
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      toast.error(`File type ${file.type} not allowed`);
      return;
    }

    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('patientId', patientId);
      formData.append('documentType', documentType);
      formData.append('uploadedBy', 'current-user'); // Replace with actual user ID

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        const newFile: UploadedFile = {
          key: result.data.key,
          presignedUrl: result.data.presignedUrl,
          originalName: result.data.originalName,
          size: result.data.size,
          mimeType: result.data.mimeType,
          documentType: result.data.documentType,
          uploadTime: result.data.uploadTime,
        };

        setUploadedFiles(prev => [...prev, newFile]);
        toast.success('File uploaded successfully!');
        
        if (onUploadSuccess) {
          onUploadSuccess(newFile);
        }

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        toast.error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const viewFile = async (file: UploadedFile) => {
    try {
      // Check if current presigned URL is still valid (basic check)
      const uploadTime = new Date(file.uploadTime).getTime();
      const now = Date.now();
      const hoursSinceUpload = (now - uploadTime) / (1000 * 60 * 60);
      
      if (hoursSinceUpload < 1) {
        // Use existing presigned URL if less than 1 hour old
        window.open(file.presignedUrl, '_blank');
      } else {
        // Generate new presigned URL
        const response = await fetch(`/api/upload?key=${encodeURIComponent(file.key)}&expiresIn=3600`);
        const result = await response.json();
        
        if (result.success) {
          window.open(result.url, '_blank');
        } else {
          toast.error('Failed to access file');
        }
      }
    } catch (error) {
      console.error('Error accessing file:', error);
      toast.error('Failed to access file');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          File Upload
        </CardTitle>
        <CardDescription>
          Upload medical documents, reports, and images for Patient ID: {patientId}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Document Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="documentType">Document Type</Label>
          <Select value={documentType} onValueChange={setDocumentType}>
            <SelectTrigger>
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* File Input */}
        <div className="space-y-2">
          <Label htmlFor="file">Select File</Label>
          <Input
            ref={fileInputRef}
            id="file"
            type="file"
            onChange={handleFileSelect}
            disabled={isUploading}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.txt"
          />
          <p className="text-sm text-muted-foreground">
            Supported formats: PDF, DOC, DOCX, JPG, PNG, GIF, WEBP, TXT (Max: {Math.round(maxFileSize / (1024 * 1024))}MB)
          </p>
        </div>

        {/* Upload Status */}
        {isUploading && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-700">Uploading file...</span>
          </div>
        )}

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <Label>Uploaded Files</Label>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">{file.originalName}</p>
                      <p className="text-xs text-muted-foreground">
                        {file.documentType} • {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewFile(file)}
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
