import { NextRequest } from 'next/server';
import { uploadPatientDocuments } from '@/lib/upload-middleware';

export async function POST(request: NextRequest) {
  return await uploadPatientDocuments(request);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
