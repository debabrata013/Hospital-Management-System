import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2, FileMetadata, getPresignedUrl } from '@/lib/r2-storage';

export async function POST(request: NextRequest) {
  try {
    // Create a test file buffer
    const testContent = `
🏥 आरोग्य अस्पताल (Arogya Hospital) - R2 Storage Test
=================================================

Test File Details:
- Upload Time: ${new Date().toISOString()}
- Test Type: Cloudflare R2 Integration
- Status: Connection Successful ✅

This is a test file to verify Cloudflare R2 storage integration
for the Hospital Management System.

Medical Document Storage Features:
✅ Patient Records
✅ Lab Reports  
✅ X-Ray Images
✅ Prescriptions
✅ Medical History
✅ Profile Images

Storage Configuration:
- Bucket: hospital
- Region: Auto
- Endpoint: Cloudflare R2
- Security: Presigned URLs Only
- Max File Size: 10MB
- Supported Formats: PDF, DOC, DOCX, JPG, PNG, GIF, WEBP

Test completed successfully! 🎉
    `;

    const buffer = Buffer.from(testContent, 'utf-8');
    const key = `test/r2-connection-test-${Date.now()}.txt`;

    const metadata: FileMetadata = {
      originalName: 'r2-test.txt',
      mimeType: 'text/plain',
      size: buffer.length,
      patientId: 'TEST-001',
      documentType: 'other',
      uploadedBy: 'system-test',
    };

    const result = await uploadToR2(buffer, key, metadata);

    if (result.success) {
      // Generate presigned URL for secure access
      const presignedUrl = await getPresignedUrl(result.key!, 3600);

      return NextResponse.json({
        success: true,
        message: '🎉 Cloudflare R2 connection successful!',
        data: {
          testFile: {
            key: result.key,
            presignedUrl, // Secure access URL
            size: buffer.length,
            uploadTime: new Date().toISOString(),
            expiresIn: 3600, // 1 hour
          },
          configuration: {
            bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
            endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
            region: 'auto',
            security: 'Presigned URLs Only',
          },
          features: [
            'File Upload ✅',
            'Metadata Storage ✅', 
            'Organized File Structure ✅',
            'Presigned URL Security ✅',
            'Error Handling ✅'
          ]
        },
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error,
          troubleshooting: [
            'Check environment variables in .env.local',
            'Verify Cloudflare R2 credentials',
            'Ensure bucket permissions are correct',
            'Check network connectivity'
          ]
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('R2 Test Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Test failed',
        details: 'Failed to connect to Cloudflare R2 storage'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'R2 Test Endpoint',
    instructions: 'Send a POST request to test Cloudflare R2 connection',
    endpoints: {
      test: 'POST /api/test-r2',
      upload: 'POST /api/upload',
      retrieve: 'GET /api/upload?key=<file-key>&expiresIn=<seconds>'
    },
    security: 'All file access uses presigned URLs for maximum security'
  });
}
