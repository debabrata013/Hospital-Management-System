import { NextResponse } from 'next/server';
import { executeQuery } from '../../../../lib/db/connection';
import { generateOtp } from '../../../../lib/otp-utils';
import { sendSms } from '../../../../lib/sms-provider';

export async function POST(req: Request) {
  try {
    const { phoneNumber } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json({ message: 'Phone number is required' }, { status: 400 });
    }

    // Find the user with the given phone number
    const users: any = await executeQuery('SELECT * FROM users WHERE phoneNumber = ?', [phoneNumber]);

    if (!Array.isArray(users) || users.length === 0) {
        return NextResponse.json({ message: 'User with this phone number not found' }, { status: 404 });
    }
    const user = users[0];

    // Generate a new OTP and its expiration date
    const { otp, expires } = generateOtp();

    // Update the user's record with the new OTP
    await executeQuery('UPDATE users SET otp = ?, otpExpires = ? WHERE id = ?', [otp, expires, user.id]);

    // Send the OTP via SMS
    const message = `Your आरोग्य अस्पताल login OTP is: ${otp}. It is valid for 10 minutes.`;
    await sendSms(user.phoneNumber, message);

    return NextResponse.json({ message: 'OTP sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('SEND_OTP_ERROR:', error);
    // In case of a Twilio error, sendSms will throw.
    if (error instanceof Error && error.message === 'Failed to send SMS.') {
        return NextResponse.json({ message: 'Failed to send OTP. Please check the phone number or try again later.' }, { status: 500 });
    }
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
