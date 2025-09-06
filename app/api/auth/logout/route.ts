
import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST(req: NextRequest) {
  const cookie = serialize('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: -1, // Expire the cookie immediately
    path: '/',
  });

  return new NextResponse(
    JSON.stringify({ message: 'Logout successful' }),
    {
      status: 200,
      headers: {
        'Set-Cookie': cookie,
        'Content-Type': 'application/json',
      },
    }
  );
}
