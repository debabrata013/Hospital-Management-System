import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Mock contact form submission
    const submission = {
      id: Date.now().toString(),
      name: body.name,
      email: body.email,
      subject: body.subject,
      message: body.message,
      type: body.type || 'general',
      phone: body.phone,
      submittedAt: new Date().toISOString(),
      status: 'received'
    };

    return NextResponse.json({
      success: true,
      data: submission,
      message: 'Contact form submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
