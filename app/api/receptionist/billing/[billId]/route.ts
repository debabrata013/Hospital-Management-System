import { isStaticBuild } from '@/lib/api-utils';

// Force dynamic for development server
// Generate static parameters for build
export async function generateStaticParams() {
  // During static build, we provide a list of IDs to pre-render
  return [
    { billId: '1' },
    { billId: '2' },
    { billId: '3' }
  ];
}

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: parseInt(process.env.DB_PORT || '3306'),
  charset: 'utf8mb4',
  timezone: '+05:30',
  connectTimeout: 20000
};

async function getConnection() {
  return await mysql.createConnection(dbConfig);
}

// GET - Get bill details with items
export async function GET(
  request: NextRequest,
  { params }: { params: { billId: string } }
) {
  let connection;
  try {
    const { billId } = params;
    const url = new URL(request.url);
    const isPdf = url.searchParams.get('format') === 'pdf';

    connection = await getConnection();
    // Get bill details
  const [billsRaw] = await connection.execute(
      `SELECT 
        b.*, 
        p.name as patient_name, p.contact_number as patient_phone,
        p.patient_id as patient_code, p.age, p.gender, p.address,
        u.name as created_by_name,
        a.appointment_id, a.doctor_id,
        doc.name as doctor_name
      FROM bills b
      LEFT JOIN patients p ON b.patient_id = p.id
      LEFT JOIN users u ON b.created_by = u.id
      LEFT JOIN appointments a ON b.appointment_id = a.id
      LEFT JOIN users doc ON a.doctor_id = doc.id
      WHERE b.bill_id = ?`,
      [billId]
    );
    // Type assertion for MySQL results
    const bills = billsRaw as any[];
    if (!Array.isArray(bills) || bills.length === 0) {
      return NextResponse.json(
        { message: 'Bill not found' },
        { status: 404 }
      );
    }
    const bill = bills[0];
    // Get bill items
    const [itemsRaw] = await connection.execute(
      `SELECT * FROM bill_items WHERE bill_id = ? ORDER BY id`,
      [bill.id]
    );
    const items = itemsRaw as any[];
    // Get payment history
    const [paymentsRaw] = await connection.execute(
      `SELECT * FROM payments WHERE bill_id = ? ORDER BY created_at DESC`,
      [bill.id]
    );
    const payments = paymentsRaw as any[];

    if (isPdf) {
      // Generate PDF using pdf-lib (no external fonts/files needed)
      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Helvetica (WinAnsi) cannot render the Unicode rupee character (₹ U+20B9).
      // Sanitize any text to replace it with an ASCII-safe representation.
      const sanitize = (text: string) => (text ?? '').replace(/\u20B9/g, 'Rs. ');

      const drawText = (text: string, x: number, y: number, size = 12) => {
        page.drawText(sanitize(text), { x, y, size, font, color: rgb(0, 0, 0) });
      };

      let y = 800;
      // Header
      drawText('NMSC Hospital Bill', 200, y, 18);
      y -= 30;
      drawText(`Bill ID: ${bill.bill_id}`, 50, y);
      y -= 18;
      drawText(`Date: ${new Date(bill.created_at).toLocaleString()}`, 50, y);
      y -= 18;
      drawText(`Patient: ${bill.patient_name} (${bill.patient_code})`, 50, y);
      y -= 18;
      drawText(`Phone: ${bill.patient_phone}`, 50, y);
      y -= 18;
      drawText(`Age/Gender: ${bill.age} / ${bill.gender}`, 50, y);
      y -= 18;
      drawText(`Address: ${bill.address || ''}`, 50, y);
      y -= 24;

      drawText('Bill Items:', 50, y);
      y -= 18;
      items.forEach((item, idx) => {
        const line = `${idx + 1}. ${item.item_name} (${item.item_type}) x${item.quantity} - Rs. ${item.unit_price}`;
        drawText(line, 60, y);
        y -= 16;
        if (y < 80) {
          // new page if needed
          page = pdfDoc.addPage([595.28, 841.89]);
          y = 800;
        }
      });
      y -= 10;
  drawText(`Subtotal: Rs. ${bill.total_amount}`, 50, y);
      y -= 16;
  drawText(`Discount: -Rs. ${bill.discount_amount}`, 50, y);
      y -= 16;
  drawText(`Tax: +Rs. ${bill.tax_amount}`, 50, y);
      y -= 20;
  drawText(`Final Amount: Rs. ${bill.final_amount}`, 50, y, 14);
      y -= 20;
      drawText(`Status: ${bill.payment_status}`, 50, y);
      y -= 16;
      drawText(`Created By: ${bill.created_by_name}`, 50, y);

      const pdfBytes = await pdfDoc.save();
      return new NextResponse(new Uint8Array(pdfBytes) as any, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="NMSC Hospital Bill.pdf"',
        },
      });
    }

    // Default: JSON
    return NextResponse.json({
      bill: {
        ...bill,
        items,
        payments
      }
    });
  } catch (error) {
    console.error('Get bill details error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch bill details' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// DELETE - Cancel/void bill
export async function DELETE(
  request: NextRequest,
  { params }: { params: { billId: string } }
) {
  let connection;
  
  try {
    const { billId } = params;
    
    connection = await getConnection();
    
    // Check if bill can be cancelled (not paid)
    const [billsRaw] = await connection.execute(
      `SELECT payment_status FROM bills WHERE bill_id = ?`,
      [billId]
    );
    const bills = billsRaw as any[];
    if (!Array.isArray(bills) || bills.length === 0) {
      return NextResponse.json(
        { message: 'Bill not found' },
        { status: 404 }
      );
    }
    if (bills[0].payment_status === 'paid') {
      return NextResponse.json(
        { message: 'Cannot cancel paid bill' },
        { status: 400 }
      );
    }
    // Update bill status to cancelled
    await connection.execute(
      `UPDATE bills SET payment_status = 'cancelled', updated_at = NOW() WHERE bill_id = ?`,
      [billId]
    );
    return NextResponse.json({
      message: 'Bill cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel bill error:', error);
    return NextResponse.json(
      { message: 'Failed to cancel bill' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
