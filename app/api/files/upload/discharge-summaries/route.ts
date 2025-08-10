import { NextRequest } from 'next/server';
import { uploadDischargeSummaries } from '@/lib/upload-middleware';

export async function POST(request: NextRequest) {
  return await uploadDischargeSummaries(request);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
