import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { executeQuery } from '@/lib/db/connection';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get the auth token from cookies
    const token = request.cookies.get('auth-token')?.value || request.cookies.get('auth-backup')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const doctorId = decoded.userId || decoded.id;

    if (!doctorId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const reportId = params.id;

    // Fetch the specific USG report
    const query = `
      SELECT 
        ur.id,
        ur.report_id,
        ur.patient_id,
        ur.report_type,
        ur.report_data,
        ur.created_at,
        p.name as patient_name,
        p.patient_id as patient_code,
        p.age,
        p.gender,
        u.name as doctor_name
      FROM usg_reports ur
      LEFT JOIN patients p ON ur.patient_id = p.id
      LEFT JOIN users u ON ur.doctor_id = u.id
      WHERE ur.id = ? AND ur.doctor_id = ?
    `;

    const reports = await executeQuery(query, [reportId, doctorId]) as any[];

    if (!reports || reports.length === 0) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const report = reports[0];
    const reportData = JSON.parse(report.report_data);

    // Generate HTML content for NT/NB Ultrasonography PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>NT/NB Ultrasonography Report - ${report.patient_name}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            line-height: 1.4; 
            color: #333;
          }
          .header { 
            text-align: center; 
            border-bottom: 3px solid #2563eb; 
            padding-bottom: 15px; 
            margin-bottom: 25px; 
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
          }
          .hospital-name {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .hospital-subtitle {
            font-size: 14px;
            opacity: 0.9;
          }
          .patient-info { 
            background: #f8fafc; 
            padding: 20px; 
            margin-bottom: 25px; 
            border-radius: 8px;
            border-left: 4px solid #2563eb;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-bottom: 15px;
          }
          .info-item {
            display: flex;
            flex-direction: column;
          }
          .info-label {
            font-weight: bold;
            color: #374151;
            font-size: 12px;
            margin-bottom: 3px;
          }
          .info-value {
            color: #1f2937;
            font-size: 14px;
          }
          .report-title {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            text-decoration: underline;
            margin: 25px 0;
            color: #1e40af;
          }
          .section { 
            margin-bottom: 20px; 
            page-break-inside: avoid;
          }
          .section-title { 
            font-weight: bold; 
            color: #1e40af; 
            margin-bottom: 10px; 
            font-size: 14px;
          }
          .field-row {
            display: flex;
            gap: 20px;
            margin-bottom: 10px;
            flex-wrap: wrap;
          }
          .field {
            flex: 1;
            min-width: 150px;
          }
          .field-label {
            font-weight: 600;
            color: #4b5563;
            font-size: 13px;
            margin-bottom: 2px;
          }
          .field-value {
            color: #1f2937;
            font-size: 14px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 2px;
          }
          .fetal-params {
            background: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
          }
          .impression-section {
            background: #fef3c7;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #f59e0b;
            margin: 20px 0;
          }
          .note-section {
            background: #fee2e2;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #ef4444;
            margin: 20px 0;
            font-size: 12px;
          }
          .footer {
            margin-top: 40px;
            text-align: right;
            border-top: 2px solid #e5e7eb;
            padding-top: 20px;
          }
          .signature-line {
            margin-top: 30px;
            border-top: 1px solid #9ca3af;
            width: 200px;
            margin-left: auto;
            padding-top: 5px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
          }
          @media print { 
            body { margin: 0; }
            .header { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="hospital-name">NMSC HOSPITAL</div>
          <div class="hospital-subtitle">Gynecology & Obstetrics Department</div>
          <div style="font-size: 12px; margin-top: 10px;">
            Advanced Ultrasonography Services
          </div>
        </div>
        
        <div class="patient-info">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">MRS.</span>
              <span class="info-value">${reportData.patientName || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">YEARS/GENDER</span>
              <span class="info-value">${reportData.age || 'N/A'}/${reportData.gender || 'FEMALE'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">SCANS NO:</span>
              <span class="info-value">${reportData.scansNo || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">DATE:</span>
              <span class="info-value">${reportData.date || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">REF.BY DR.</span>
              <span class="info-value">${reportData.refBy || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div class="report-title">NT AND NB ULTRASONOGRAPHY REPORT</div>

        <div class="field-row">
          <div class="field">
            <div class="field-label">LMP:</div>
            <div class="field-value">${reportData.lmp || 'N/A'}</div>
          </div>
          <div class="field">
            <div class="field-label">GA by LMP: w days</div>
            <div class="field-value">${reportData.gaByLmp || 'N/A'}</div>
          </div>
          <div class="field">
            <div class="field-label">EDD by LMP:</div>
            <div class="field-value">${reportData.eddByLmp || 'N/A'}</div>
          </div>
        </div>

        <div class="section">
          <div class="field-value" style="margin: 15px 0; font-size: 14px;">
            ${reportData.generalObservation || 'Single live intrauterine gestation seen at the time of the scan.'}
          </div>
        </div>

        <div class="fetal-params">
          <div class="section-title">Fetal parameters:</div>
          
          <div class="field-row">
            <div class="field">
              <div class="field-label">• CRL</div>
              <div class="field-value">${reportData.fetalParameters?.crl || 'N/A'} cm</div>
            </div>
            <div class="field">
              <div class="field-label">• YOLK SAC</div>
              <div class="field-value">${reportData.fetalParameters?.yolkSac || 'Seen'}</div>
            </div>
            <div class="field">
              <div class="field-label">• FHR</div>
              <div class="field-value">${reportData.fetalParameters?.fhr || 'N/A'} bpm</div>
            </div>
          </div>

          <div style="margin: 15px 0;">
            <div class="field-label">Nuchal Translucency thickness:</div>
            <div class="field-value">${reportData.fetalParameters?.nuchalTranslucency || 'N/A'} mm</div>
          </div>

          <div style="margin: 15px 0;">
            <div class="field-label">Nasal bone seen & measure:</div>
            <div class="field-value">${reportData.fetalParameters?.nasalBone || 'N/A'} mm</div>
          </div>

          <div style="margin: 15px 0;">
            <div class="field-label">PLACENTA:</div>
            <div class="field-value">${reportData.fetalParameters?.placenta || 'Posterior body grade 0 maturity.'}</div>
          </div>

          <div style="margin: 15px 0;">
            <div class="field-label">Cervical length:</div>
            <div class="field-value">${reportData.fetalParameters?.cervicalLength || 'Internal OS is closed.'}</div>
          </div>
        </div>

        <div class="impression-section">
          <div class="section-title">IMPRESSION:</div>
          <div style="font-weight: bold; font-size: 14px;">
            ${reportData.impression || 'SINGLE LIVE INTRA UTERINE W D NORMAL GESTATION WITH REST OF PARAMETERS AS MENTIONED ABOVE.'}
          </div>
        </div>

        <div style="margin: 20px 0;">
          <div class="field-label">EDD By Scan:</div>
          <div class="field-value">${reportData.eddByScan || 'N/A'}</div>
        </div>

        <div style="margin: 20px 0;">
          <div class="field-label">Sugg:</div>
          <div class="field-value">${reportData.suggestion || 'Anomaly scans at 20-22 wks.'}</div>
        </div>

        <div class="note-section">
          <div class="field-label">NOTE:</div>
          <div style="font-size: 11px; font-style: italic;">
            ${reportData.doctorNote || 'I have not detected / nor disclosed the sex of foetus to the patient or anybody in any manner.'}
          </div>
        </div>

        <div class="footer">
          <div><strong>Generated on:</strong> ${new Date(report.created_at).toLocaleDateString()}</div>
          <div><strong>Report ID:</strong> ${report.report_id}</div>
          <div class="signature-line">
            ${report.doctor_name}<br>
            (MD, Gynecology & Obstetrics)
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('Error generating USG report PDF:', error);
    return NextResponse.json({ 
      error: 'Failed to generate PDF',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
