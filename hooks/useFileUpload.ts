import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface UploadedFile {
  originalName: string;
  fileName: string;
  fileKey: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  category: string;
}

export interface UploadError {
  fileName: string;
  error: string;
}

export interface UploadResponse {
  success: boolean;
  files?: UploadedFile[];
  errors?: UploadError[];
  message?: string;
}

export interface UseFileUploadOptions {
  category: string;
  patientId?: string;
  maxFiles?: number;
  onSuccess?: (files: UploadedFile[]) => void;
  onError?: (errors: UploadError[]) => void;
  showToast?: boolean;
}

export function useFileUpload(options: UseFileUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    if (!files || files.length === 0) {
      if (options.showToast !== false) {
        toast.error('Please select files to upload');
      }
      return;
    }

    const fileArray = Array.from(files);

    if (options.maxFiles && fileArray.length > options.maxFiles) {
      if (options.showToast !== false) {
        toast.error(`Maximum ${options.maxFiles} files allowed`);
      }
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      
      // Add files to form data
      fileArray.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });

      // Add additional data
      if (options.patientId) {
        formData.append('patientId', options.patientId);
      }

      // Determine upload endpoint based on category
      const endpoint = `/api/files/upload/${options.category}`;

      // Upload with progress tracking
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const result: UploadResponse = await response.json();

      if (result.success) {
        setUploadedFiles(prev => [...prev, ...(result.files || [])]);
        
        if (options.showToast !== false) {
          toast.success(`Successfully uploaded ${result.files?.length || 0} file(s)`);
        }
        
        if (options.onSuccess && result.files) {
          options.onSuccess(result.files);
        }
      } else {
        if (options.showToast !== false) {
          toast.error(result.message || 'Upload failed');
        }
        
        if (options.onError && result.errors) {
          options.onError(result.errors);
        }
      }

      // Handle partial success (some files uploaded, some failed)
      if (result.files && result.errors && result.errors.length > 0) {
        if (options.showToast !== false) {
          toast.warning(`${result.files.length} files uploaded, ${result.errors.length} failed`);
        }
      }

      setUploadProgress(100);
    } catch (error) {
      console.error('Upload error:', error);
      
      if (options.showToast !== false) {
        toast.error('Upload failed. Please try again.');
      }
      
      if (options.onError) {
        options.onError([{
          fileName: 'Unknown',
          error: error instanceof Error ? error.message : 'Upload failed'
        }]);
      }
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, [options]);

  const clearUploadedFiles = useCallback(() => {
    setUploadedFiles([]);
  }, []);

  const removeUploadedFile = useCallback((fileKey: string) => {
    setUploadedFiles(prev => prev.filter(file => file.fileKey !== fileKey));
  }, []);

  return {
    uploadFiles,
    isUploading,
    uploadProgress,
    uploadedFiles,
    clearUploadedFiles,
    removeUploadedFile
  };
}

// Specialized hooks for different file types

export function useMedicalRecordUpload(patientId: string, onSuccess?: (files: UploadedFile[]) => void) {
  return useFileUpload({
    category: 'medical-records',
    patientId,
    maxFiles: 10,
    onSuccess
  });
}

export function usePrescriptionUpload(patientId: string, onSuccess?: (files: UploadedFile[]) => void) {
  return useFileUpload({
    category: 'prescriptions',
    patientId,
    maxFiles: 5,
    onSuccess
  });
}

export function useTestReportUpload(patientId: string, onSuccess?: (files: UploadedFile[]) => void) {
  return useFileUpload({
    category: 'test-reports',
    patientId,
    maxFiles: 20,
    onSuccess
  });
}

export function useDischargeSummaryUpload(patientId: string, onSuccess?: (files: UploadedFile[]) => void) {
  return useFileUpload({
    category: 'discharge-summaries',
    patientId,
    maxFiles: 3,
    onSuccess
  });
}

export function usePatientDocumentUpload(patientId: string, onSuccess?: (files: UploadedFile[]) => void) {
  return useFileUpload({
    category: 'patient-documents',
    patientId,
    maxFiles: 5,
    onSuccess
  });
}

export function useProfilePictureUpload(onSuccess?: (files: UploadedFile[]) => void) {
  return useFileUpload({
    category: 'profile-pictures',
    maxFiles: 1,
    onSuccess
  });
}

export function useAfterCareInstructionUpload(patientId: string, onSuccess?: (files: UploadedFile[]) => void) {
  return useFileUpload({
    category: 'aftercare-instructions',
    patientId,
    maxFiles: 10,
    onSuccess
  });
}
