import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongoose';
import User from '@/models/User';
import AuditLog from '@/models/AuditLog';
import { z } from 'zod';

// Validation schema
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, number and special character'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    
    // Validate input
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid input',
          details: validation.error.errors
        },
        { status: 400 }
      );
    }

    const { token, password } = validation.data;

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
      isActive: true
    });

    if (!user) {
      // Log failed reset attempt
      await AuditLog.create({
        userId: null,
        userRole: 'unknown',
        userName: 'Invalid Reset Attempt',
        action: `Invalid or expired password reset token used`,
        actionType: 'PASSWORD_RESET_FAILED',
        resourceType: 'User',
        ipAddress: getClientIP(request),
        deviceInfo: {
          userAgent: request.headers.get('user-agent') || 'unknown'
        },
        riskLevel: 'MEDIUM'
      });

      return NextResponse.json({
        success: false,
        error: 'Invalid or expired reset token. Please request a new password reset.'
      }, { status: 400 });
    }

    // Check if new password is different from current password
    const isSamePassword = await bcrypt.compare(password, user.passwordHash);
    if (isSamePassword) {
      return NextResponse.json({
        success: false,
        error: 'New password must be different from your current password.'
      }, { status: 400 });
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(password, saltRounds);

    // Update user password and clear reset token
    await User.findByIdAndUpdate(user._id, {
      passwordHash: newPasswordHash,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
      passwordResetRequestedAt: undefined,
      failedLoginAttempts: 0, // Reset failed login attempts
      lockoutUntil: undefined, // Clear any lockout
      passwordChangedAt: new Date(),
      // Force re-authentication by incrementing a version field
      tokenVersion: (user.tokenVersion || 0) + 1
    });

    // Log successful password reset
    await AuditLog.create({
      userId: user._id,
      userRole: user.role,
      userName: user.name,
      action: `Password successfully reset for: ${user.email}`,
      actionType: 'PASSWORD_RESET_SUCCESS',
      resourceType: 'User',
      resourceId: user._id.toString(),
      ipAddress: getClientIP(request),
      deviceInfo: {
        userAgent: request.headers.get('user-agent') || 'unknown'
      },
      riskLevel: 'HIGH' // High risk because it's a security-sensitive action
    });

    // Send confirmation email
    try {
      await sendPasswordResetConfirmationEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);

    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error. Please try again.'
      },
      { status: 500 }
    );
  }
}

// GET method to verify reset token validity
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Reset token is required'
      }, { status: 400 });
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
      isActive: true
    }).select('email name passwordResetExpires');

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired reset token'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Reset token is valid',
      data: {
        email: user.email,
        name: user.name,
        expiresAt: user.passwordResetExpires
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);

    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error'
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

async function sendPasswordResetConfirmationEmail(email: string, name: string): Promise<void> {
  const nodemailer = require('nodemailer');
  
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
        <title>Password Reset Successful - आरोग्य अस्पताल</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .success { background: #D1FAE5; border: 1px solid #10B981; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .security-tips { background: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 आरोग्य अस्पताल</h1>
            <p>Password Reset Successful</p>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            
            <div class="success">
              <strong>✅ Password Reset Successful</strong>
              <p>Your password has been successfully reset. You can now login to your account using your new password.</p>
            </div>
            
            <p>This confirmation is to let you know that your आरोग्य अस्पताल account password was changed on ${new Date().toLocaleString()}.</p>
            
            <div class="security-tips">
              <strong>🔒 Security Tips:</strong>
              <ul>
                <li>Keep your password secure and don't share it with anyone</li>
                <li>Use a unique password that you don't use for other accounts</li>
                <li>Consider enabling two-factor authentication for added security</li>
                <li>If you didn't make this change, contact us immediately</li>
              </ul>
            </div>
            
            <p>If you didn't reset your password or if you have any security concerns, please contact our support team immediately at security@hospital.com</p>
            
            <p>You can now login to your account at: <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login">Login to आरोग्य अस्पताल</a></p>
            
            <p>Best regards,<br>आरोग्य अस्पताल Security Team</p>
          </div>
          <div class="footer">
            <p>This is an automated security notification from आरोग्य अस्पताल Hospital Management System.</p>
            <p>© 2024 आरोग्य अस्पताल. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.SMTP_FROM || 'security@hospital.com',
    to: email,
    subject: 'Password Reset Successful - आरोग्य अस्पताल',
    html: emailTemplate
  };

  await transporter.sendMail(mailOptions);
}
