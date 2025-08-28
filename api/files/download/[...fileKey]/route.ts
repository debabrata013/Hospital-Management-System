import { NextRequest, NextResponse } from 'next/server';
import { handleSecureFileDownload } from '@/lib/upload-middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { fileKey: string[] } }
) {
  try {
    // Reconstruct the file key from the path segments
    const fileKey = params.fileKey.join('/');
    
    if (!fileKey) {
      return NextResponse.json({
        success: false,
        message: 'File key is required'
      }, { status: 400 });
    }
    
    return await handleSecureFileDownload(request, fileKey);
  } catch (error) {
    console.error('File download route error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to process download request'
    }, { status: 500 });
  }
}
