import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2, generateFileKey, validateFile, FileMetadata, getPresignedUrl } from '@/lib/r2-storage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const patientId = formData.get('patientId') as string;
    const documentType = formData.get('documentType') as string;
    const uploadedBy = formData.get('uploadedBy') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!patientId) {
      return NextResponse.json(
        { success: false, error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    // Validate file (max 10MB for medical files)
    const validation = validateFile(file, [], 10 * 1024 * 1024);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate unique key
    const key = generateFileKey(patientId, documentType || 'other', file.name);

    // Prepare metadata
    const metadata: FileMetadata = {
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      patientId,
      documentType: documentType as any,
      uploadedBy,
    };

    // Upload to R2
    const result = await uploadToR2(buffer, key, metadata);

    if (result.success) {
      // Generate presigned URL for immediate access (1 hour expiry)
      const presignedUrl = await getPresignedUrl(result.key!, 3600);

      return NextResponse.json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          key: result.key,
          presignedUrl, // Secure URL for immediate access
          originalName: file.name,
          size: file.size,
          mimeType: file.type,
          patientId,
          documentType,
          uploadTime: new Date().toISOString(),
        },
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Upload API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      },
      { status: 500 }
    );
  }
}

// Handle file retrieval with presigned URLs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const expiresIn = parseInt(searchParams.get('expiresIn') || '3600'); // Default 1 hour

    if (!key) {
      return NextResponse.json(
        { success: false, error: 'File key is required' },
        { status: 400 }
      );
    }

    const presignedUrl = await getPresignedUrl(key, expiresIn);

    return NextResponse.json({
      success: true,
      url: presignedUrl,
      expiresIn,
      key,
    });
  } catch (error) {
    console.error('Get File API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get file' 
      },
      { status: 500 }
    );
  }
}
