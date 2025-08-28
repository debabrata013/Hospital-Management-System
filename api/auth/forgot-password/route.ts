import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongoose';
import User from '@/models/User';
import AuditLog from '@/models/AuditLog';
import { z } from 'zod';
import nodemailer from 'nodemailer';

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format')
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    
    // Validate input
    const validation = forgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid email format',
          details: validation.error.errors
        },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Find user by email
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    });
    
    // Always return success to prevent email enumeration
    const successResponse = {
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.'
    };

    if (!user) {
      // Log failed attempt
      await AuditLog.create({
        userId: null,
        userRole: 'unknown',
        userName: 'Password Reset Request',
        action: `Password reset requested for non-existent email: ${email}`,
        actionType: 'PASSWORD_RESET_FAILED',
        resourceType: 'User',
        ipAddress: getClientIP(request),
        deviceInfo: {
          userAgent: request.headers.get('user-agent') || 'unknown'
        },
        riskLevel: 'LOW'
      });

      return NextResponse.json(successResponse);
    }

    // Check if user has recent reset request (rate limiting)
    const recentReset = user.passwordResetToken && 
                       user.passwordResetExpires && 
                       user.passwordResetExpires > new Date(Date.now() - 5 * 60 * 1000); // 5 minutes

    if (recentReset) {
      return NextResponse.json({
        success: false,
        error: 'Password reset email was already sent recently. Please check your email or wait 5 minutes before requesting again.'
      }, { status: 429 });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save reset token to user
    await User.findByIdAndUpdate(user._id, {
      passwordResetToken: hashedToken,
      passwordResetExpires: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      passwordResetRequestedAt: new Date()
    });

    // Send reset email
    const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    try {
      await sendPasswordResetEmail(user.email, user.name, resetURL);
      
      // Log successful reset request
      await AuditLog.create({
        userId: user._id,
        userRole: user.role,
        userName: user.name,
        action: `Password reset requested for: ${user.email}`,
        actionType: 'PASSWORD_RESET_REQUESTED',
        resourceType: 'User',
        resourceId: user._id.toString(),
        ipAddress: getClientIP(request),
        deviceInfo: {
          userAgent: request.headers.get('user-agent') || 'unknown'
        },
        riskLevel: 'MEDIUM'
      });

    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      
      // Clear the reset token if email failed
      await User.findByIdAndUpdate(user._id, {
        passwordResetToken: undefined,
        passwordResetExpires: undefined,
        passwordResetRequestedAt: undefined
      });

      return NextResponse.json({
        success: false,
        error: 'Failed to send password reset email. Please try again later.'
      }, { status: 500 });
    }

    return NextResponse.json(successResponse);

  } catch (error) {
    console.error('Forgot password error:', error);

    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error. Please try again.'
      },
      { status: 500 }
    );
  }
}

// Helper functions
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return request.ip || 'unknown';
}

async function sendPasswordResetEmail(email: string, name: string, resetURL: string): Promise<void> {
  // Create transporter
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const emailTemplate = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset - आरोग्य अस्पताल</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #EC4899, #BE185D); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: linear-gradient(135deg, #EC4899, #BE185D); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
          .warning { background: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 आरोग्य अस्पताल</h1>
            <p>Password Reset Request</p>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>We received a request to reset your password for your आरोग्य अस्पताल account.</p>
            
            <p>Click the button below to reset your password:</p>
            
            <div style="text-align: center;">
              <a href="${resetURL}" class="button">Reset Password</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 4px;">${resetURL}</p>
            
            <div class="warning">
              <strong>⚠️ Important Security Information:</strong>
              <ul>
                <li>This link will expire in 30 minutes</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Never share this link with anyone</li>
                <li>Our team will never ask for your password via email</li>
              </ul>
            </div>
            
            <p>If you're having trouble with the button above, you can also reset your password by logging into your account and going to Settings > Security.</p>
            
            <p>If you need help, please contact our support team at support@hospital.com</p>
            
            <p>Best regards,<br>आरोग्य अस्पताल Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email from आरोग्य अस्पताल Hospital Management System.</p>
            <p>© 2024 आरोग्य अस्पताल. All rights reserved.</p>
            <p>If you received this email by mistake, please ignore it.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@hospital.com',
    to: email,
    subject: 'Password Reset Request - आरोग्य अस्पताल',
    html: emailTemplate
  };

  await transporter.sendMail(mailOptions);
}
