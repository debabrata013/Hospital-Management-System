import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, getClientIP } from '@/lib/auth-middleware';
import { generateSecureDownloadUrl } from '@/lib/aws-s3';
import { logFileAccess } from '@/lib/upload-middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { fileKey: string[] } }
) {
  try {
    // Authenticate user (patient or staff)
    const auth = await authenticateUser(request);
    if (auth instanceof NextResponse) return auth;

    // Reconstruct the file key from the path segments
    const fileKey = params.fileKey.join('/');
    
    if (!fileKey) {
      return NextResponse.json({
        success: false,
        message: 'File key is required'
      }, { status: 400 });
    }

    // For patients, ensure they can only access their own files
    let patientId: string | undefined;
    if (auth.user.role === 'patient') {
      patientId = auth.user.patientId;
      
      // Check if the file key contains the patient's ID
      if (!fileKey.includes(patientId)) {
        return NextResponse.json({
          success: false,
          message: 'Access denied: File does not belong to this patient'
        }, { status: 403 });
      }
    }

    // Generate secure download URL with access control
    const result = await generateSecureDownloadUrl(
      fileKey,
      auth.user.id,
      auth.user.role,
      patientId
    );

    if (result.error) {
      return NextResponse.json({
        success: false,
        message: result.error
      }, { status: 403 });
    }

    // Log file access for audit trail
    await logFileAccess(fileKey, auth.user.id, 'download', getClientIP(request));

    // Return the presigned URL
    return NextResponse.json({
      success: true,
      downloadUrl: result.url,
      expiresIn: 3600, // 1 hour
      message: 'Download URL generated successfully'
    });

  } catch (error) {
    console.error('Patient file download error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to generate download URL'
    }, { status: 500 });
  }
}
