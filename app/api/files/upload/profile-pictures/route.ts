import { NextRequest } from 'next/server';
import { uploadProfilePicture } from '@/lib/upload-middleware';

export async function POST(request: NextRequest) {
  return await uploadProfilePicture(request);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
