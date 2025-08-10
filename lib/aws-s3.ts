import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import path from 'path';

// AWS S3 Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// S3 Bucket Configuration
export const S3_CONFIG = {
  BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME || 'hospital-management-files',
  REGION: process.env.AWS_REGION || 'us-east-1',
  
  // File type configurations
  ALLOWED_FILE_TYPES: {
    'medical-records': ['pdf', 'jpg', 'jpeg', 'png', 'dicom'],
    'prescriptions': ['pdf', 'jpg', 'jpeg', 'png'],
    'test-reports': ['pdf', 'jpg', 'jpeg', 'png', 'dicom'],
    'discharge-summaries': ['pdf', 'doc', 'docx'],
    'patient-documents': ['pdf', 'jpg', 'jpeg', 'png'],
    'profile-pictures': ['jpg', 'jpeg', 'png'],
    'aftercare-instructions': ['pdf', 'jpg', 'jpeg', 'png', 'mp4', 'mp3']
  },
  
  // File size limits (in bytes)
  MAX_FILE_SIZES: {
    'medical-records': 50 * 1024 * 1024, // 50MB
    'prescriptions': 10 * 1024 * 1024,   // 10MB
    'test-reports': 100 * 1024 * 1024,   // 100MB
    'discharge-summaries': 20 * 1024 * 1024, // 20MB
    'patient-documents': 10 * 1024 * 1024,   // 10MB
    'profile-pictures': 5 * 1024 * 1024,     // 5MB
    'aftercare-instructions': 200 * 1024 * 1024 // 200MB for videos
  },
  
  // S3 folder structure
  FOLDERS: {
    'medical-records': 'medical-records',
    'prescriptions': 'prescriptions',
    'test-reports': 'test-reports',
    'discharge-summaries': 'discharge-summaries',
    'patient-documents': 'patient-documents',
    'profile-pictures': 'profile-pictures',
    'aftercare-instructions': 'aftercare-instructions',
    'temp-uploads': 'temp-uploads'
  }
};

// File metadata interface
export interface FileMetadata {
  originalName: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  patientId?: string;
  userId: string;
  category: keyof typeof S3_CONFIG.FOLDERS;
  isPatientAccessible: boolean;
  encryptionKey?: string;
}

// Generate secure file key
export function generateFileKey(
  category: string,
  patientId: string | undefined,
  originalName: string,
  userId: string
): string {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalName).toLowerCase();
  const sanitizedName = path.basename(originalName, extension)
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .substring(0, 50);
  
  const folder = S3_CONFIG.FOLDERS[category as keyof typeof S3_CONFIG.FOLDERS] || 'misc';
  
  if (patientId) {
    return `${folder}/${patientId}/${timestamp}_${randomString}_${sanitizedName}${extension}`;
  } else {
    return `${folder}/${userId}/${timestamp}_${randomString}_${sanitizedName}${extension}`;
  }
}

// Validate file type and size
export function validateFile(
  file: File,
  category: keyof typeof S3_CONFIG.ALLOWED_FILE_TYPES
): { isValid: boolean; error?: string } {
  const fileExtension = path.extname(file.name).toLowerCase().substring(1);
  const allowedTypes = S3_CONFIG.ALLOWED_FILE_TYPES[category];
  const maxSize = S3_CONFIG.MAX_FILE_SIZES[category];
  
  if (!allowedTypes.includes(fileExtension)) {
    return {
      isValid: false,
      error: `File type .${fileExtension} not allowed for ${category}. Allowed types: ${allowedTypes.join(', ')}`
    };
  }
  
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds limit of ${(maxSize / 1024 / 1024).toFixed(2)}MB for ${category}`
    };
  }
  
  return { isValid: true };
}

// Upload file to S3
export async function uploadFileToS3(
  file: File,
  fileKey: string,
  metadata: FileMetadata
): Promise<{ success: boolean; fileUrl: string; error?: string }> {
  try {
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    // Prepare S3 upload parameters
    const uploadParams = {
      Bucket: S3_CONFIG.BUCKET_NAME,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: file.type,
      Metadata: {
        'original-name': metadata.originalName,
        'file-type': metadata.fileType,
        'file-size': metadata.fileSize.toString(),
        'patient-id': metadata.patientId || '',
        'user-id': metadata.userId,
        'category': metadata.category,
        'patient-accessible': metadata.isPatientAccessible.toString(),
        'upload-timestamp': new Date().toISOString()
      },
      // Server-side encryption
      ServerSideEncryption: 'AES256',
      // Set appropriate storage class
      StorageClass: metadata.category === 'temp-uploads' ? 'STANDARD_IA' : 'STANDARD'
    };
    
    // Upload to S3
    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);
    
    const fileUrl = `https://${S3_CONFIG.BUCKET_NAME}.s3.${S3_CONFIG.REGION}.amazonaws.com/${fileKey}`;
    
    return {
      success: true,
      fileUrl
    };
  } catch (error) {
    console.error('S3 upload error:', error);
    return {
      success: false,
      fileUrl: '',
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

// Generate presigned URL for secure file access
export async function generatePresignedUrl(
  fileKey: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: S3_CONFIG.BUCKET_NAME,
      Key: fileKey
    });
    
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error('Failed to generate file access URL');
  }
}

// Delete file from S3
export async function deleteFileFromS3(fileKey: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: S3_CONFIG.BUCKET_NAME,
      Key: fileKey
    });
    
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('S3 delete error:', error);
    return false;
  }
}

// Check if file exists in S3
export async function fileExistsInS3(fileKey: string): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: S3_CONFIG.BUCKET_NAME,
      Key: fileKey
    });
    
    await s3Client.send(command);
    return true;
  } catch (error) {
    return false;
  }
}

// Get file metadata from S3
export async function getFileMetadataFromS3(fileKey: string) {
  try {
    const command = new HeadObjectCommand({
      Bucket: S3_CONFIG.BUCKET_NAME,
      Key: fileKey
    });
    
    const response = await s3Client.send(command);
    
    return {
      contentType: response.ContentType,
      contentLength: response.ContentLength,
      lastModified: response.LastModified,
      metadata: response.Metadata
    };
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw new Error('Failed to get file metadata');
  }
}

// Generate secure download URL with access control
export async function generateSecureDownloadUrl(
  fileKey: string,
  userId: string,
  userRole: string,
  patientId?: string
): Promise<{ url: string; error?: string }> {
  try {
    // Check if file exists
    const exists = await fileExistsInS3(fileKey);
    if (!exists) {
      return { url: '', error: 'File not found' };
    }
    
    // Get file metadata to check access permissions
    const metadata = await getFileMetadataFromS3(fileKey);
    const filePatientId = metadata.metadata?.['patient-id'];
    const isPatientAccessible = metadata.metadata?.['patient-accessible'] === 'true';
    
    // Access control logic
    if (userRole === 'patient') {
      // Patients can only access their own files that are marked as patient-accessible
      if (filePatientId !== patientId || !isPatientAccessible) {
        return { url: '', error: 'Access denied' };
      }
    } else if (userRole === 'doctor' || userRole === 'staff') {
      // Healthcare providers can access patient files they're authorized for
      // Additional authorization logic can be added here
    } else if (!['admin', 'super-admin'].includes(userRole)) {
      return { url: '', error: 'Insufficient permissions' };
    }
    
    // Generate presigned URL (valid for 1 hour)
    const url = await generatePresignedUrl(fileKey, 3600);
    
    return { url };
  } catch (error) {
    console.error('Error generating secure download URL:', error);
    return { url: '', error: 'Failed to generate download URL' };
  }
}

// Batch upload multiple files
export async function batchUploadFiles(
  files: File[],
  category: keyof typeof S3_CONFIG.ALLOWED_FILE_TYPES,
  patientId: string | undefined,
  userId: string,
  isPatientAccessible: boolean = true
): Promise<{
  successful: Array<{ file: string; url: string; key: string }>;
  failed: Array<{ file: string; error: string }>;
}> {
  const successful: Array<{ file: string; url: string; key: string }> = [];
  const failed: Array<{ file: string; error: string }> = [];
  
  for (const file of files) {
    try {
      // Validate file
      const validation = validateFile(file, category);
      if (!validation.isValid) {
        failed.push({ file: file.name, error: validation.error! });
        continue;
      }
      
      // Generate file key
      const fileKey = generateFileKey(category, patientId, file.name, userId);
      
      // Prepare metadata
      const metadata: FileMetadata = {
        originalName: file.name,
        fileType: path.extname(file.name).toLowerCase().substring(1),
        fileSize: file.size,
        mimeType: file.type,
        patientId,
        userId,
        category,
        isPatientAccessible
      };
      
      // Upload file
      const uploadResult = await uploadFileToS3(file, fileKey, metadata);
      
      if (uploadResult.success) {
        successful.push({
          file: file.name,
          url: uploadResult.fileUrl,
          key: fileKey
        });
      } else {
        failed.push({
          file: file.name,
          error: uploadResult.error || 'Upload failed'
        });
      }
    } catch (error) {
      failed.push({
        file: file.name,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  return { successful, failed };
}

// Clean up temporary files (run as scheduled job)
export async function cleanupTempFiles(olderThanHours: number = 24) {
  // This would typically be implemented as a separate Lambda function
  // or scheduled job to clean up files in the temp-uploads folder
  console.log(`Cleaning up temp files older than ${olderThanHours} hours`);
  // Implementation would list objects in temp-uploads folder and delete old ones
}

export default {
  uploadFileToS3,
  generatePresignedUrl,
  generateSecureDownloadUrl,
  deleteFileFromS3,
  fileExistsInS3,
  getFileMetadataFromS3,
  batchUploadFiles,
  validateFile,
  generateFileKey,
  S3_CONFIG
};
