import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin, logAuditAction, getClientIP } from '@/lib/auth-middleware';
import { DatabaseUtils } from '@/lib/db-utils';

export async function GET(req: NextRequest) {
  try {
    // Authenticate super admin
    const auth = await requireSuperAdmin(req);
    if (auth instanceof NextResponse) {
      return auth;
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';

    // Build filter
    const filter: any = { role: 'admin' };
    if (status !== 'all') {
      filter.isActive = status === 'active';
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get admins with pagination
    const result = await DatabaseUtils.paginate('users', filter, page, limit);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    // Log audit action
    await logAuditAction(
      auth.user.id,
      'VIEW_ADMINS',
      'admins',
      { page, limit, search, status },
      getClientIP(req)
    );

    return NextResponse.json({
      admins: result.data,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate super admin
    const auth = await requireSuperAdmin(req);
    if (auth instanceof NextResponse) {
      return auth;
    }

    const body = await req.json();
    const { name, email, password, department, permissions } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if admin already exists
    const existingAdmin = await DatabaseUtils.find('users', { email });
    if (existingAdmin.success && existingAdmin.data.length > 0) {
      return NextResponse.json(
        { error: 'Admin with this email already exists' },
        { status: 409 }
      );
    }

    // Create new admin
    const adminData = {
      userId: DatabaseUtils.generateUniqueId('ADM'),
      name,
      email,
      passwordHash: password, // In production, this should be hashed
      role: 'admin',
      department: department || 'General',
      permissions: permissions || ['read', 'write'],
      isActive: true,
      createdBy: auth.user.id,
      createdAt: new Date()
    };

    const result = await DatabaseUtils.create('users', adminData);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    // Log audit action
    await logAuditAction(
      auth.user.id,
      'CREATE_ADMIN',
      'admins',
      { adminId: result.data._id, email },
      getClientIP(req)
    );

    return NextResponse.json({
      message: 'Admin created successfully',
      admin: {
        ...result.data,
        passwordHash: undefined // Don't return password hash
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
