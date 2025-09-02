import { NextResponse } from 'next/server';
import { executeQuery } from '../../../../lib/db/connection';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const verifyOtpSchema = z.object({
  phoneNumber: z.string().min(10, 'Phone number is required'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = verifyOtpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: validation.error.errors[0].message }, { status: 400 });
    }

    const { phoneNumber, otp } = validation.data;

    const users: any = await executeQuery('SELECT * FROM users WHERE phoneNumber = ? AND otp = ?', [phoneNumber, otp]);

    if (!Array.isArray(users) || users.length === 0) {
        return NextResponse.json({ message: 'Invalid OTP or phone number' }, { status: 400 });
    }
    const user = users[0];

    // Check if the OTP has expired
    if (!user.otpExpires || new Date() > user.otpExpires) {
        // Clear the expired OTP from the database
        await executeQuery('UPDATE users SET otp = NULL, otpExpires = NULL WHERE id = ?', [user.id]);
        return NextResponse.json({ message: 'OTP has expired' }, { status: 400 });
    }

    // OTP is correct and not expired. Clear it from the database.
    await executeQuery('UPDATE users SET otp = NULL, otpExpires = NULL WHERE id = ?', [user.id]);

    // Create a JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '1d', // Token expires in one day
      }
    );

    // Exclude password from the user object returned to the frontend
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({ token, user: userWithoutPassword }, { status: 200 });

  } catch (error) {
    console.error('VERIFY_OTP_ERROR:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
