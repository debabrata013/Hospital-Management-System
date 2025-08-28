import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for contact form
const ContactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().regex(/^[+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number').optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000),
  type: z.enum(['general', 'appointment', 'complaint', 'feedback', 'emergency']).default('general')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request data
    const validationResult = ContactFormSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.errors
      }, { status: 400 });
    }
    
    const contactData = validationResult.data;
    
    // Generate ticket ID
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    const ticketId = `TKT${timestamp}${random}`;
    
    // In a real application, you would:
    // 1. Save the contact form data to database
    // 2. Send email notification to admin
    // 3. Send auto-reply to user
    // 4. Create support ticket if needed
    
    const contactDetails = {
      ticketId,
      ...contactData,
      status: 'received',
      submittedAt: new Date().toISOString(),
      priority: contactData.type === 'emergency' ? 'high' : 'normal'
    };
    
    // Simulate database save
    console.log('Contact form submitted:', contactDetails);
    
    // Simulate sending confirmation email
    const confirmationMessage = `Dear ${contactData.name},

Thank you for contacting Arogya Hospital. We have received your message and will respond within 24 hours.

Your Ticket ID: ${ticketId}
Subject: ${contactData.subject}
Type: ${contactData.type}

Our team will review your message and get back to you soon.

Best regards,
Arogya Hospital Team
Phone: +91 98765 43210
Email: care@arogyahospital.com`;
    
    console.log('Confirmation email sent:', confirmationMessage);
    
    // For emergency contacts, simulate immediate notification
    if (contactData.type === 'emergency') {
      console.log('EMERGENCY CONTACT - Immediate notification sent to admin');
    }
    
    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully! We will respond within 24 hours.',
      data: {
        ticketId,
        estimatedResponse: contactData.type === 'emergency' ? '1 hour' : '24 hours',
        confirmationSent: true
      }
    });
    
  } catch (error) {
    console.error('Contact form submission error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to send your message. Please try again or call us directly.',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET method to retrieve contact information
export async function GET(request: NextRequest) {
  try {
    const contactInfo = {
      hospital: {
        name: "Arogya Hospital",
        address: "123, Health Nagar, Near Connaught Place, New Delhi - 110001",
        phone: "+91 98765 43210",
        emergency: "+91 98765 43211",
        email: "care@arogyahospital.com",
        website: "https://arogyahospital.com"
      },
      workingHours: {
        opd: "8:00 AM - 8:00 PM",
        emergency: "24/7 Available",
        pharmacy: "7:00 AM - 11:00 PM"
      },
      departments: [
        { name: "Emergency", phone: "+91 98765 43211", available: "24/7" },
        { name: "OPD", phone: "+91 98765 43210", available: "8:00 AM - 8:00 PM" },
        { name: "Pharmacy", phone: "+91 98765 43212", available: "7:00 AM - 11:00 PM" },
        { name: "Lab", phone: "+91 98765 43213", available: "6:00 AM - 10:00 PM" }
      ],
      socialMedia: {
        facebook: "https://facebook.com/arogyahospital",
        twitter: "https://twitter.com/arogyahospital",
        instagram: "https://instagram.com/arogyahospital",
        youtube: "https://youtube.com/arogyahospital"
      },
      location: {
        latitude: 28.6328,
        longitude: 77.2197,
        googleMapsUrl: "https://maps.google.com/?q=28.6328,77.2197"
      }
    };
    
    return NextResponse.json({
      success: true,
      data: contactInfo,
      message: 'Contact information retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching contact info:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch contact information'
    }, { status: 500 });
  }
}
