import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin, logAuditAction, getClientIP } from '@/lib/auth-middleware'
import connectToMongoose from '@/lib/mongoose'
const { User } = require('@/models')
import { NotificationService } from '@/lib/services/notification'

// POST /api/admin/notifications - Send notifications to users
export async function POST(request: NextRequest) {
  try {
    const auth = await requireSuperAdmin(request)
    if (auth instanceof NextResponse) return auth

    await connectToMongoose()

    const body = await request.json()
    const {
      recipientUserIds,
      recipients, // direct email list
      subject,
      message,
      priority = 'LOW',
      category = 'SYSTEM',
      type = 'EMAIL'
    } = body

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    let emails: string[] = Array.isArray(recipients) ? recipients.filter((e: any) => typeof e === 'string') : []

    if (Array.isArray(recipientUserIds) && recipientUserIds.length > 0) {
      const users = await User.find({ _id: { $in: recipientUserIds } }).select('email isActive')
      const userEmails = users.filter((u: any) => u.isActive && u.email).map((u: any) => u.email)
      emails = Array.from(new Set([...(emails || []), ...userEmails]))
    }

    if (!emails || emails.length === 0) {
      return NextResponse.json({ error: 'No recipients provided' }, { status: 400 })
    }

    const notifier = new NotificationService()
    const ok = await notifier.sendNotification({
      type,
      recipients: emails,
      subject,
      message,
      priority,
      category
    })

    await logAuditAction(
      auth.user.id,
      `Sent notification to ${emails.length} recipient(s)`,
      'CREATE',
      'Notification',
      '-',
      getClientIP(request),
      request.headers.get('user-agent') || undefined
    )

    return NextResponse.json({ success: ok })
  } catch (error) {
    console.error('Notification send error:', error)
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 })
  }
}


