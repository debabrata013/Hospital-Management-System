import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

/**
 * A utility function to get the logged-in user's ID from the request.
 * Decodes JWT token from cookies to get the actual user ID.
 */
export async function getLoggedInUserId(req: NextRequest): Promise<string | null> {
  try {
    const token = req.cookies.get('auth-token')?.value;
    if (!token) {
      console.log('No auth token found in cookies');
      return null;
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;
    
    console.log('Decoded user ID from JWT:', userId);
    return userId;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
}
