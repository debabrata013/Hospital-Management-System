// Pharmacy API - Medicine Management
// GET /api/pharmacy/medicines - Get all medicines with filtering
// POST /api/pharmacy/medicines - Add new medicine

import { NextRequest, NextResponse } from 'next/server';
const { executeQuery, dbUtils } = require('@/lib/mysql-connection');

// GET - Fetch medicines with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const lowStock = searchParams.get('lowStock') === 'true';
    const expiringSoon = searchParams.get('expiringSoon') === 'true';
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'ASC';
    
    const offset = (page - 1) * limit;
    
    // Build WHERE conditions
    let whereConditions = ['is_active = 1'];
    let queryParams: any[] = [];
    
    if (search) {
      whereConditions.push('(name LIKE ? OR generic_name LIKE ? OR brand_name LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (category) {
      whereConditions.push('category = ?');
      queryParams.push(category);
    }
    
    if (lowStock) {
      whereConditions.push('current_stock <= minimum_stock');
    }
    
    if (expiringSoon) {
      whereConditions.push('expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)');
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Main query
    const query = `
      SELECT 
        id,
        medicine_id,
        name,
        generic_name,
        brand_name,
        category,
        manufacturer,
        composition,
        strength,
        dosage_form,
        pack_size,
        unit_price,
        mrp,
        current_stock,
        minimum_stock,
        maximum_stock,
        expiry_date,
        batch_number,
        supplier,
        prescription_required,
        CASE 
          WHEN current_stock <= minimum_stock THEN 'low'
          WHEN current_stock <= (minimum_stock * 1.5) THEN 'medium'
          ELSE 'good'
        END as stock_status,
        CASE 
          WHEN expiry_date <= CURDATE() THEN 'expired'
          WHEN expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'expiring_soon'
          WHEN expiry_date <= DATE_ADD(CURDATE(), INTERVAL 90 DAY) THEN 'expiring_later'
          ELSE 'good'
        END as expiry_status,
        created_at,
        updated_at
      FROM medicines 
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;
    
    queryParams.push(limit, offset);
    
    // Count query for pagination
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM medicines 
      ${whereClause}
    `;
    
    const countParams = queryParams.slice(0, -2); // Remove limit and offset
    
    // Execute queries
    const [medicines, countResult] = await Promise.all([
      executeQuery(query, queryParams),
      executeQuery(countQuery, countParams)
    ]);
    
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);
    
    // Get categories for filter options
    const categoriesQuery = `
      SELECT DISTINCT category 
      FROM medicines 
      WHERE is_active = 1 AND category IS NOT NULL 
      ORDER BY category
    `;
    const categories = await executeQuery(categoriesQuery);
    
    return NextResponse.json({
      success: true,
      data: {
        medicines,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        filters: {
          categories: categories.map((cat: any) => cat.category)
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching medicines:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch medicines'
    }, { status: 500 });
  }
}

// POST - Add new medicine
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'dosage_form', 'unit_price', 'mrp'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({
          success: false,
          error: `${field} is required`
        }, { status: 400 });
      }
    }
    
    // Generate medicine ID
    const medicineId = dbUtils.generateId('MED');
    
    // Prepare medicine data
    const medicineData = {
      medicine_id: medicineId,
      name: body.name,
      generic_name: body.generic_name || null,
      brand_name: body.brand_name || null,
      category: body.category || null,
      manufacturer: body.manufacturer || null,
      composition: body.composition || null,
      strength: body.strength || null,
      dosage_form: body.dosage_form,
      pack_size: body.pack_size || null,
      unit_price: parseFloat(body.unit_price),
      mrp: parseFloat(body.mrp),
      current_stock: parseInt(body.current_stock) || 0,
      minimum_stock: parseInt(body.minimum_stock) || 10,
      maximum_stock: parseInt(body.maximum_stock) || 1000,
      expiry_date: body.expiry_date ? dbUtils.formatDate(body.expiry_date) : null,
      batch_number: body.batch_number || null,
      supplier: body.supplier || null,
      storage_conditions: body.storage_conditions || null,
      side_effects: body.side_effects || null,
      contraindications: body.contraindications || null,
      drug_interactions: body.drug_interactions || null,
      pregnancy_category: body.pregnancy_category || 'Unknown',
      prescription_required: body.prescription_required !== false, // Default true
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    // Check if medicine with same name already exists
    const existingMedicine = await executeQuery(
      'SELECT id FROM medicines WHERE name = ? AND is_active = 1',
      [body.name]
    );
    
    if (existingMedicine.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Medicine with this name already exists'
      }, { status: 409 });
    }
    
    // Insert medicine
    const insertQuery = `
      INSERT INTO medicines (
        medicine_id, name, generic_name, brand_name, category, manufacturer,
        composition, strength, dosage_form, pack_size, unit_price, mrp,
        current_stock, minimum_stock, maximum_stock, expiry_date, batch_number,
        supplier, storage_conditions, side_effects, contraindications,
        drug_interactions, pregnancy_category, prescription_required, is_active,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await executeQuery(insertQuery, Object.values(medicineData));
    
    // Create initial stock transaction if stock > 0
    if (medicineData.current_stock > 0) {
      const stockTransactionData = {
        medicine_id: result.insertId,
        transaction_type: 'purchase',
        quantity: medicineData.current_stock,
        unit_price: medicineData.unit_price,
        total_amount: medicineData.current_stock * medicineData.unit_price,
        batch_number: medicineData.batch_number,
        expiry_date: medicineData.expiry_date,
        supplier: medicineData.supplier,
        reference_id: medicineId,
        notes: 'Initial stock entry',
        created_by: 1, // TODO: Get from auth
        created_at: new Date()
      };
      
      const stockQuery = `
        INSERT INTO medicine_stock_transactions (
          medicine_id, transaction_type, quantity, unit_price, total_amount,
          batch_number, expiry_date, supplier, reference_id, notes, created_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      await executeQuery(stockQuery, Object.values(stockTransactionData));
    }
    
    // Fetch the created medicine
    const createdMedicine = await executeQuery(
      'SELECT * FROM medicines WHERE id = ?',
      [result.insertId]
    );
    
    return NextResponse.json({
      success: true,
      message: 'Medicine added successfully',
      data: createdMedicine[0]
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error adding medicine:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to add medicine'
    }, { status: 500 });
  }
}
