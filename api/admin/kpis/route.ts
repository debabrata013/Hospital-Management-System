import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth-middleware'
import connectToMongoose from '@/lib/mongoose'

export async function GET(request: NextRequest) {
  try {
    // Authenticate super admin
    const auth = await requireSuperAdmin(request)
    if (auth instanceof NextResponse) return auth

    await connectToMongoose()

    // Import models dynamically
    const Patient = (await import('@/models/Patient.js')).default
    const Appointment = (await import('@/models/Appointment.js')).default
    const Billing = (await import('@/models/Billing.js')).default
    const Medicine = (await import('@/models/Medicine.js')).default
    const AuditLog = (await import('@/models/AuditLog.js')).default

    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Parallel queries for better performance
    const [
      patientsToday,
      appointmentsToday,
      revenueToday,
      lowStockMedicines,
      totalReports,
      totalPatients,
      totalAppointments,
      pendingBills
    ] = await Promise.all([
      // Patients registered today
      Patient.countDocuments({
        createdAt: { $gte: today, $lt: tomorrow }
      }),

      // Appointments today
      Appointment.countDocuments({
        appointmentDate: { $gte: today, $lt: tomorrow }
      }),

      // Revenue today
      Billing.aggregate([
        {
          $match: {
            createdAt: { $gte: today, $lt: tomorrow },
            status: { $in: ['paid', 'partial'] }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$finalAmount' }
          }
        }
      ]),

      // Low stock medicines
      Medicine.countDocuments({
        isActive: true,
        $expr: { $lte: ['$inventory.currentStock', '$inventory.minimumStock'] }
      }),

      // Total reports generated today
      AuditLog.countDocuments({
        actionType: 'REPORT_GENERATED',
        createdAt: { $gte: today, $lt: tomorrow }
      }),

      // Total patients
      Patient.countDocuments({ isActive: true }),

      // Total appointments this month
      Appointment.countDocuments({
        appointmentDate: {
          $gte: new Date(today.getFullYear(), today.getMonth(), 1),
          $lt: new Date(today.getFullYear(), today.getMonth() + 1, 1)
        }
      }),

      // Pending bills
      Billing.countDocuments({
        status: { $in: ['pending', 'partial'] }
      })
    ])

    // Get inventory status
    const inventoryStatus = await Medicine.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalMedicines: { $sum: 1 },
          lowStock: {
            $sum: {
              $cond: [
                { $lte: ['$inventory.currentStock', '$inventory.minimumStock'] },
                1,
                0
              ]
            }
          },
          outOfStock: {
            $sum: {
              $cond: [
                { $eq: ['$inventory.currentStock', 0] },
                1,
                0
              ]
            }
          }
        }
      }
    ])

    // Get appointment status breakdown
    const appointmentStats = await Appointment.aggregate([
      {
        $match: {
          appointmentDate: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    const kpis = {
      dailyStats: {
        patientsToday,
        appointmentsToday,
        revenueToday: revenueToday[0]?.totalRevenue || 0,
        reportsCount: totalReports
      },
      overallStats: {
        totalPatients,
        totalAppointments,
        pendingBills,
        lowStockMedicines
      },
      inventoryStatus: {
        total: inventoryStatus[0]?.totalMedicines || 0,
        lowStock: inventoryStatus[0]?.lowStock || 0,
        outOfStock: inventoryStatus[0]?.outOfStock || 0,
        status: inventoryStatus[0]?.lowStock > 0 ? 'warning' : 'good'
      },
      appointmentBreakdown: appointmentStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count
        return acc
      }, {} as Record<string, number>),
      trends: {
        // Weekly patient registration trend
        weeklyPatients: await Patient.aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]),
        
        // Weekly revenue trend
        weeklyRevenue: await Billing.aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              },
              status: { $in: ['paid', 'partial'] }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
              },
              revenue: { $sum: '$finalAmount' }
            }
          },
          { $sort: { _id: 1 } }
        ])
      }
    }

    return NextResponse.json({
      success: true,
      data: kpis
    })

  } catch (error) {
    console.error('KPIs fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch KPIs' },
      { status: 500 }
    )
  }
}
