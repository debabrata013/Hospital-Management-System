import { NextRequest } from 'next/server';
import { uploadTestReports } from '@/lib/upload-middleware';

export async function POST(request: NextRequest) {
  return await uploadTestReports(request);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
