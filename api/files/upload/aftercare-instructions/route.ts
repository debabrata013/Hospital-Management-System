import { NextRequest } from 'next/server';
import { uploadAfterCareInstructions } from '@/lib/upload-middleware';

export async function POST(request: NextRequest) {
  return await uploadAfterCareInstructions(request);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
