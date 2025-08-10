import { NextRequest, NextResponse } from 'next/server';
import { BillingService } from '@/lib/services/billing';
import { financialReportSchema } from '@/lib/validations/billing';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const billingService = new BillingService();

// GET /api/billing/reports - Generate financial reports
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permissions - only admin and billing managers can access reports
    if (!['admin', 'billing_manager', 'finance_manager'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions for financial reports' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reportParams = {
      reportType: searchParams.get('reportType') || 'daily',
      dateFrom: searchParams.get('dateFrom'),
      dateTo: searchParams.get('dateTo'),
      department: searchParams.get('department'),
      paymentMethod: searchParams.get('paymentMethod'),
      includeRefunds: searchParams.get('includeRefunds') === 'true',
      groupBy: searchParams.get('groupBy')
    };

    const validation = financialReportSchema.safeParse(reportParams);
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid report parameters',
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const report = await billingService.generateFinancialReport(validation.data);

    return NextResponse.json({
      success: true,
      data: report,
      generatedAt: new Date().toISOString(),
      generatedBy: session.user.name
    });

  } catch (error) {
    console.error('Error generating financial report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

// POST /api/billing/reports - Generate custom report
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permissions
    if (!['admin', 'billing_manager', 'finance_manager'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions for custom reports' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = financialReportSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid report configuration',
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const report = await billingService.generateFinancialReport(validation.data);

    // Log report generation for audit
    await billingService.logAuditTrail({
      action: 'GENERATE_FINANCIAL_REPORT',
      entityType: 'REPORT',
      entityId: `report-${Date.now()}`,
      userId: session.user.id,
      details: {
        reportType: validation.data.reportType,
        dateRange: {
          from: validation.data.dateFrom,
          to: validation.data.dateTo
        },
        filters: {
          department: validation.data.department,
          paymentMethod: validation.data.paymentMethod
        }
      },
      riskLevel: 'LOW'
    });

    return NextResponse.json({
      success: true,
      data: report,
      generatedAt: new Date().toISOString(),
      generatedBy: session.user.name,
      message: 'Custom report generated successfully'
    });

  } catch (error) {
    console.error('Error generating custom report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate custom report' },
      { status: 500 }
    );
  }
}
