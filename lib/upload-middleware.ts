import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, getClientIP } from './auth-middleware';
import { 
  uploadFileToS3, 
  validateFile, 
  generateFileKey, 
  batchUploadFiles,
  S3_CONFIG,
  type FileMetadata 
} from './aws-s3';
import path from 'path';

// File upload response interface
export interface FileUploadResponse {
  success: boolean;
  files?: Array<{
    originalName: string;
    fileName: string;
    fileKey: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    category: string;
  }>;
  errors?: Array<{
    fileName: string;
    error: string;
  }>;
  message?: string;
}

// Upload configuration interface
export interface UploadConfig {
  category: keyof typeof S3_CONFIG.ALLOWED_FILE_TYPES;
  patientId?: string;
  isPatientAccessible?: boolean;
  maxFiles?: number;
  requirePatientId?: boolean;
  allowedRoles?: string[];
}

// File upload middleware
export async function handleFileUpload(
  request: NextRequest,
  config: UploadConfig
): Promise<NextResponse> {
  try {
    // Authenticate user
    const auth = await authenticateUser(request);
    if (auth instanceof NextResponse) return auth;

    // Check role permissions
    if (config.allowedRoles && !config.allowedRoles.includes(auth.user.role)) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions for file upload'
      }, { status: 403 });
    }

    // Validate patient ID requirement
    if (config.requirePatientId && !config.patientId) {
      return NextResponse.json({
        success: false,
        message: 'Patient ID is required for this upload category'
      }, { status: 400 });
    }

    // Parse form data
    const formData = await request.formData();
    const files: File[] = [];
    
    // Extract files from form data
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No files provided'
      }, { status: 400 });
    }

    // Check max files limit
    if (config.maxFiles && files.length > config.maxFiles) {
      return NextResponse.json({
        success: false,
        message: `Maximum ${config.maxFiles} files allowed`
      }, { status: 400 });
    }

    // Upload files
    const uploadResult = await batchUploadFiles(
      files,
      config.category,
      config.patientId,
      auth.user.id,
      config.isPatientAccessible ?? true
    );

    // Prepare response
    const response: FileUploadResponse = {
      success: uploadResult.failed.length === 0,
      files: uploadResult.successful.map(item => ({
        originalName: item.file,
        fileName: path.basename(item.key),
        fileKey: item.key,
        fileUrl: item.url,
        fileSize: files.find(f => f.name === item.file)?.size || 0,
        mimeType: files.find(f => f.name === item.file)?.type || '',
        category: config.category
      })),
      errors: uploadResult.failed
    };

    // Log upload activity
    await logFileUploadActivity(
      auth.user.id,
      config.category,
      uploadResult.successful.length,
      uploadResult.failed.length,
      getClientIP(request)
    );

    const statusCode = uploadResult.failed.length > 0 ? 207 : 200; // 207 Multi-Status
    return NextResponse.json(response, { status: statusCode });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({
      success: false,
      message: 'File upload failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Specialized upload handlers for different file types

// Medical Records Upload
export async function uploadMedicalRecords(request: NextRequest) {
  const formData = await request.formData();
  const patientId = formData.get('patientId') as string;
  
  return handleFileUpload(request, {
    category: 'medical-records',
    patientId,
    isPatientAccessible: true,
    maxFiles: 10,
    requirePatientId: true,
    allowedRoles: ['doctor', 'staff', 'admin', 'super-admin']
  });
}

// Prescription Upload
export async function uploadPrescriptions(request: NextRequest) {
  const formData = await request.formData();
  const patientId = formData.get('patientId') as string;
  
  return handleFileUpload(request, {
    category: 'prescriptions',
    patientId,
    isPatientAccessible: true,
    maxFiles: 5,
    requirePatientId: true,
    allowedRoles: ['doctor', 'admin', 'super-admin']
  });
}

// Test Reports Upload
export async function uploadTestReports(request: NextRequest) {
  const formData = await request.formData();
  const patientId = formData.get('patientId') as string;
  const isPatientAccessible = formData.get('isPatientAccessible') === 'true';
  
  return handleFileUpload(request, {
    category: 'test-reports',
    patientId,
    isPatientAccessible,
    maxFiles: 20,
    requirePatientId: true,
    allowedRoles: ['doctor', 'staff', 'admin', 'super-admin']
  });
}

// Discharge Summary Upload
export async function uploadDischargeSummaries(request: NextRequest) {
  const formData = await request.formData();
  const patientId = formData.get('patientId') as string;
  
  return handleFileUpload(request, {
    category: 'discharge-summaries',
    patientId,
    isPatientAccessible: true,
    maxFiles: 3,
    requirePatientId: true,
    allowedRoles: ['doctor', 'admin', 'super-admin']
  });
}

// Patient Documents Upload (for patient portal)
export async function uploadPatientDocuments(request: NextRequest) {
  const formData = await request.formData();
  const patientId = formData.get('patientId') as string;
  
  return handleFileUpload(request, {
    category: 'patient-documents',
    patientId,
    isPatientAccessible: false, // Requires approval
    maxFiles: 5,
    requirePatientId: true,
    allowedRoles: ['patient', 'doctor', 'staff', 'admin', 'super-admin']
  });
}

// Profile Picture Upload
export async function uploadProfilePicture(request: NextRequest) {
  return handleFileUpload(request, {
    category: 'profile-pictures',
    isPatientAccessible: true,
    maxFiles: 1,
    requirePatientId: false,
    allowedRoles: ['patient', 'doctor', 'staff', 'admin', 'super-admin']
  });
}

// After-care Instructions Upload
export async function uploadAfterCareInstructions(request: NextRequest) {
  const formData = await request.formData();
  const patientId = formData.get('patientId') as string;
  
  return handleFileUpload(request, {
    category: 'aftercare-instructions',
    patientId,
    isPatientAccessible: true,
    maxFiles: 10,
    requirePatientId: true,
    allowedRoles: ['doctor', 'staff', 'admin', 'super-admin']
  });
}

// File validation middleware
export function validateFileUpload(
  allowedTypes: string[],
  maxSize: number,
  maxFiles: number = 1
) {
  return async (request: NextRequest) => {
    try {
      const formData = await request.formData();
      const files: File[] = [];
      
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          files.push(value);
        }
      }
      
      if (files.length === 0) {
        return NextResponse.json({
          success: false,
          message: 'No files provided'
        }, { status: 400 });
      }
      
      if (files.length > maxFiles) {
        return NextResponse.json({
          success: false,
          message: `Maximum ${maxFiles} files allowed`
        }, { status: 400 });
      }
      
      for (const file of files) {
        const fileExtension = path.extname(file.name).toLowerCase().substring(1);
        
        if (!allowedTypes.includes(fileExtension)) {
          return NextResponse.json({
            success: false,
            message: `File type .${fileExtension} not allowed. Allowed types: ${allowedTypes.join(', ')}`
          }, { status: 400 });
        }
        
        if (file.size > maxSize) {
          return NextResponse.json({
            success: false,
            message: `File ${file.name} exceeds size limit of ${(maxSize / 1024 / 1024).toFixed(2)}MB`
          }, { status: 400 });
        }
      }
      
      return null; // Validation passed
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: 'File validation failed'
      }, { status: 400 });
    }
  };
}

// Log file upload activity
async function logFileUploadActivity(
  userId: string,
  category: string,
  successCount: number,
  failureCount: number,
  ipAddress: string
) {
  try {
    const { AuditLog } = require('@/models');
    
    await AuditLog.create({
      userId,
      action: `File upload: ${category}`,
      actionType: 'UPLOAD',
      resourceType: 'File',
      ipAddress,
      additionalData: {
        category,
        successCount,
        failureCount,
        timestamp: new Date()
      },
      riskLevel: failureCount > 0 ? 'MEDIUM' : 'LOW'
    });
  } catch (error) {
    console.error('Failed to log file upload activity:', error);
  }
}

// File access logging
export async function logFileAccess(
  fileKey: string,
  userId: string,
  action: 'view' | 'download' | 'share',
  ipAddress: string
) {
  try {
    const { AuditLog } = require('@/models');
    
    await AuditLog.create({
      userId,
      action: `File ${action}: ${fileKey}`,
      actionType: action.toUpperCase(),
      resourceType: 'File',
      resourceId: fileKey,
      ipAddress,
      riskLevel: action === 'share' ? 'HIGH' : 'LOW'
    });
  } catch (error) {
    console.error('Failed to log file access:', error);
  }
}

// Middleware for file download with access control
export async function handleSecureFileDownload(
  request: NextRequest,
  fileKey: string
) {
  try {
    const auth = await authenticateUser(request);
    if (auth instanceof NextResponse) return auth;

    const { generateSecureDownloadUrl } = await import('./aws-s3');
    
    // Generate secure download URL
    const result = await generateSecureDownloadUrl(
      fileKey,
      auth.user.id,
      auth.user.role,
      auth.user.role === 'patient' ? auth.user.patientId : undefined
    );
    
    if (result.error) {
      return NextResponse.json({
        success: false,
        message: result.error
      }, { status: 403 });
    }
    
    // Log file access
    await logFileAccess(fileKey, auth.user.id, 'download', getClientIP(request));
    
    return NextResponse.json({
      success: true,
      downloadUrl: result.url,
      expiresIn: 3600 // 1 hour
    });
    
  } catch (error) {
    console.error('File download error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to generate download URL'
    }, { status: 500 });
  }
}

export default {
  handleFileUpload,
  uploadMedicalRecords,
  uploadPrescriptions,
  uploadTestReports,
  uploadDischargeSummaries,
  uploadPatientDocuments,
  uploadProfilePicture,
  uploadAfterCareInstructions,
  validateFileUpload,
  handleSecureFileDownload,
  logFileAccess
};
