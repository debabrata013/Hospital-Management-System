'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFileUpload, type UploadedFile, type UseFileUploadOptions } from '@/hooks/useFileUpload';
import { cn } from '@/lib/utils';

interface FileUploadProps extends UseFileUploadOptions {
  className?: string;
  accept?: Record<string, string[]>;
  multiple?: boolean;
  disabled?: boolean;
  title?: string;
  description?: string;
  showFileList?: boolean;
  allowRemove?: boolean;
}

export function FileUpload({
  className,
  accept,
  multiple = true,
  disabled = false,
  title = 'Upload Files',
  description = 'Drag and drop files here or click to browse',
  showFileList = true,
  allowRemove = true,
  ...uploadOptions
}: FileUploadProps) {
  const {
    uploadFiles,
    isUploading,
    uploadProgress,
    uploadedFiles,
    removeUploadedFile
  } = useFileUpload(uploadOptions);

  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      uploadFiles(acceptedFiles);
    }
  }, [uploadFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
    disabled: disabled || isUploading,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('video/')) return '🎥';
    if (mimeType.includes('audio/')) return '🎵';
    return '📁';
  };

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Upload Area */}
      <Card className={cn(
        'border-2 border-dashed transition-colors cursor-pointer',
        isDragActive || dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
        disabled && 'opacity-50 cursor-not-allowed'
      )}>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className="flex flex-col items-center justify-center text-center space-y-4"
          >
            <input {...getInputProps()} />
            
            {isUploading ? (
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            ) : (
              <Upload className={cn(
                'h-12 w-12',
                isDragActive || dragActive ? 'text-primary' : 'text-muted-foreground'
              )} />
            )}
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">
                {isUploading ? 'Uploading files...' : description}
              </p>
              
              {uploadOptions.maxFiles && (
                <p className="text-xs text-muted-foreground">
                  Maximum {uploadOptions.maxFiles} files allowed
                </p>
              )}
            </div>
            
            {!isUploading && (
              <Button variant="outline" size="sm" disabled={disabled}>
                Browse Files
              </Button>
            )}
          </div>
          
          {/* Upload Progress */}
          {isUploading && uploadProgress > 0 && (
            <div className="mt-4 space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">
                {uploadProgress}% uploaded
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Files List */}
      {showFileList && uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Uploaded Files ({uploadedFiles.length})
            </h4>
            
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={file.fileKey}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-lg">
                      {getFileIcon(file.mimeType)}
                    </span>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {file.originalName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {file.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(file.fileSize)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    
                    {allowRemove && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeUploadedFile(file.fileKey)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Specialized file upload components

export function MedicalRecordUpload({ 
  patientId, 
  onSuccess,
  className 
}: { 
  patientId: string;
  onSuccess?: (files: UploadedFile[]) => void;
  className?: string;
}) {
  return (
    <FileUpload
      category="medical-records"
      patientId={patientId}
      onSuccess={onSuccess}
      className={className}
      title="Upload Medical Records"
      description="Upload patient medical records, lab reports, or clinical documents"
      accept={{
        'application/pdf': ['.pdf'],
        'image/*': ['.jpg', '.jpeg', '.png'],
        'application/dicom': ['.dcm', '.dicom']
      }}
      maxFiles={10}
    />
  );
}

export function PrescriptionUpload({ 
  patientId, 
  onSuccess,
  className 
}: { 
  patientId: string;
  onSuccess?: (files: UploadedFile[]) => void;
  className?: string;
}) {
  return (
    <FileUpload
      category="prescriptions"
      patientId={patientId}
      onSuccess={onSuccess}
      className={className}
      title="Upload Prescriptions"
      description="Upload prescription documents or images"
      accept={{
        'application/pdf': ['.pdf'],
        'image/*': ['.jpg', '.jpeg', '.png']
      }}
      maxFiles={5}
    />
  );
}

export function TestReportUpload({ 
  patientId, 
  onSuccess,
  className 
}: { 
  patientId: string;
  onSuccess?: (files: UploadedFile[]) => void;
  className?: string;
}) {
  return (
    <FileUpload
      category="test-reports"
      patientId={patientId}
      onSuccess={onSuccess}
      className={className}
      title="Upload Test Reports"
      description="Upload laboratory results, radiology reports, or diagnostic images"
      accept={{
        'application/pdf': ['.pdf'],
        'image/*': ['.jpg', '.jpeg', '.png'],
        'application/dicom': ['.dcm', '.dicom']
      }}
      maxFiles={20}
    />
  );
}

export function ProfilePictureUpload({ 
  onSuccess,
  className 
}: { 
  onSuccess?: (files: UploadedFile[]) => void;
  className?: string;
}) {
  return (
    <FileUpload
      category="profile-pictures"
      onSuccess={onSuccess}
      className={className}
      title="Upload Profile Picture"
      description="Upload a profile picture (JPG, PNG only)"
      accept={{
        'image/*': ['.jpg', '.jpeg', '.png']
      }}
      maxFiles={1}
      multiple={false}
    />
  );
}

export function PatientDocumentUpload({ 
  patientId, 
  onSuccess,
  className 
}: { 
  patientId: string;
  onSuccess?: (files: UploadedFile[]) => void;
  className?: string;
}) {
  return (
    <FileUpload
      category="patient-documents"
      patientId={patientId}
      onSuccess={onSuccess}
      className={className}
      title="Upload Documents"
      description="Upload identity documents, insurance cards, or other patient documents"
      accept={{
        'application/pdf': ['.pdf'],
        'image/*': ['.jpg', '.jpeg', '.png']
      }}
      maxFiles={5}
    />
  );
}
