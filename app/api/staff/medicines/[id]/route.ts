
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql-connection';
import { NextRequest } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const userId = request.headers.get('x-user-id');

  if (!userId) {
    return new NextResponse('Unauthorized: User ID not found in headers', { status: 401 });
  }

  try {
    const query = `
      UPDATE medicine_deliveries
      SET status = 'delivered', delivered_at = NOW(), delivered_by = ?
      WHERE id = ?;
    `;

    await executeQuery(query, [userId, id]);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error updating medicine delivery status:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
