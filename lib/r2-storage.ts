import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME!;

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

export interface FileMetadata {
  originalName: string;
  mimeType: string;
  size: number;
  patientId?: string;
  documentType?: 'lab-report' | 'x-ray' | 'prescription' | 'medical-record' | 'profile-image' | 'other';
  uploadedBy?: string;
}

/**
 * Upload file to Cloudflare R2
 */
export async function uploadToR2(
  buffer: Buffer,
  key: string,
  metadata: FileMetadata
): Promise<UploadResult> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: metadata.mimeType,
      Metadata: {
        originalName: metadata.originalName,
        patientId: metadata.patientId || '',
        documentType: metadata.documentType || 'other',
        uploadedBy: metadata.uploadedBy || '',
        uploadDate: new Date().toISOString(),
      },
    });

    await r2Client.send(command);

    return {
      success: true,
      key,
      // Note: Use getPresignedUrl() to get secure access URLs when needed
    };
  } catch (error) {
    console.error('R2 Upload Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Generate a presigned URL for secure file access
 */
export async function getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    return await getSignedUrl(r2Client, command, { expiresIn });
  } catch (error) {
    console.error('Presigned URL Error:', error);
    throw new Error('Failed to generate presigned URL');
  }
}

/**
 * Delete file from R2
 */
export async function deleteFromR2(key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await r2Client.send(command);
    return true;
  } catch (error) {
    console.error('R2 Delete Error:', error);
    return false;
  }
}

/**
 * List files for a specific patient
 */
export async function listPatientFiles(patientId: string): Promise<any[]> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: `patients/${patientId}/`,
    });

    const response = await r2Client.send(command);
    return response.Contents || [];
  } catch (error) {
    console.error('R2 List Error:', error);
    return [];
  }
}

/**
 * Generate unique file key for organized storage
 */
export function generateFileKey(
  patientId: string,
  documentType: string,
  originalName: string
): string {
  const timestamp = Date.now();
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `patients/${patientId}/${documentType}/${timestamp}_${sanitizedName}`;
}

/**
 * Validate file type and size
 */
export function validateFile(file: File | Buffer, allowedTypes: string[], maxSize: number): {
  valid: boolean;
  error?: string;
} {
  // For medical files, we'll be more permissive but secure
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    ...allowedTypes
  ];

  if (file instanceof File) {
    if (!allowedMimeTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size ${file.size} exceeds maximum allowed size of ${maxSize} bytes`
      };
    }
  }

  return { valid: true };
}

export default r2Client;
