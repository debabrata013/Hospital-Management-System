
import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

const NODE_ENV = process.env.NODE_ENV || 'development';

export async function POST() {
  // Create a cookie that is expired.
  const cookie = serialize('auth-token', '', {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0), // Set expiry date to the past
    path: '/',
  });

  return new NextResponse(
    JSON.stringify({ message: "Logout successful" }),
    {
      status: 200,
      headers: { 'Set-Cookie': cookie },
    }
  );
}
