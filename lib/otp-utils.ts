import crypto from 'crypto';

const OTP_LENGTH = 6;
const OTP_VALIDITY_MINUTES = 10;

/**
 * Generates a random OTP and its expiration date.
 * @returns An object containing the OTP and its expiration date.
 */
export function generateOtp(): { otp: string; expires: Date } {
  // Generate a random 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();

  // Set an expiration date for the OTP
  const expires = new Date();
  expires.setMinutes(expires.getMinutes() + OTP_VALIDITY_MINUTES);

  return { otp, expires };
}
