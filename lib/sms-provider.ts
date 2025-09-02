import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.error('Twilio credentials are not set in the environment variables.');
  // You might want to throw an error here in a real application
}

const client = twilio(accountSid, authToken);

/**
 * Sends an SMS message to a specified phone number.
 * @param to The recipient's phone number.
 * @param body The content of the SMS message.
 * @returns A promise that resolves when the SMS is sent.
 */
export async function sendSms(to: string, body: string): Promise<void> {
  try {
    await client.messages.create({
      body,
      from: twilioPhoneNumber,
      to,
    });
    console.log(`SMS sent to ${to}`);
  } catch (error) {
    console.error(`Failed to send SMS to ${to}:`, error);
    // Handle the error appropriately in your application
    // For example, you might want to re-throw the error or return a status
    throw new Error('Failed to send SMS.');
  }
}
