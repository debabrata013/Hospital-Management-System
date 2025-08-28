import { NextRequest } from 'next/server';
import { uploadPrescriptions } from '@/lib/upload-middleware';

export async function POST(request: NextRequest) {
  return await uploadPrescriptions(request);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
