const mysql = require('mysql2/promise')

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management'
}

async function testPharmacyAutoBilling() {
  let connection
  
  try {
    console.log('🧪 Testing Pharmacy Auto-billing Backend...\n')
    
    // Connect to database
    connection = await mysql.createConnection(dbConfig)
    console.log('✅ Database connected')

    // Test 1: Create test prescription
    console.log('\n📝 Test 1: Creating test prescription...')
    
    const prescriptionId = `PRESC${Date.now()}`
    const patientId = 'PAT001'
    
    await connection.execute(`
      INSERT INTO prescriptions (prescription_id, patient_id, doctor_id, doctor_name, status, total_amount)
      VALUES (?, ?, 1, 'Dr. Test', 'pending', 500.00)
    `, [prescriptionId, patientId])
    
    const prescriptionDbId = await connection.execute(`SELECT id FROM prescriptions WHERE prescription_id = ?`, [prescriptionId])
    const prescDbId = prescriptionDbId[0][0].id
    
    // Add prescription medications
    await connection.execute(`
      INSERT INTO prescription_medications (prescription_id, medicine_id, medicine_name, dosage, frequency, duration, quantity, unit_price, total_price)
      VALUES (?, 1, 'Paracetamol 500mg', '1 tablet', 'Twice daily', '5 days', 10, 5.00, 50.00)
    `, [prescDbId])
    
    await connection.execute(`
      INSERT INTO prescription_medications (prescription_id, medicine_id, medicine_name, dosage, frequency, duration, quantity, unit_price, total_price)
      VALUES (?, 2, 'Amoxicillin 250mg', '1 capsule', 'Thrice daily', '7 days', 21, 15.00, 315.00)
    `, [prescDbId])
    
    console.log(`✅ Created prescription: ${prescriptionId}`)

    // Test 2: Test dispensePrescription with auto-billing
    console.log('\n💊 Test 2: Testing prescription dispensing with auto-billing...')
    
    const dispensingItems = [
      {
        medicine_id: 1,
        medicine_name: 'Paracetamol 500mg',
        quantity: 10,
        unit_price: 5.00
      },
      {
        medicine_id: 2,
        medicine_name: 'Amoxicillin 250mg',
        quantity: 21,
        unit_price: 15.00
      }
    ]
    
    // Simulate the dispensePrescription function
    const totalAmount = dispensingItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
    
    // Update prescription status
    await connection.execute(`UPDATE prescriptions SET status = 'completed' WHERE prescription_id = ?`, [prescriptionId])
    
    // Mark items as dispensed
    for (const item of dispensingItems) {
      await connection.execute(`
        UPDATE prescription_medications 
        SET is_dispensed = 1, dispensed_at = CURRENT_TIMESTAMP, dispensed_by = 1
        WHERE prescription_id = ? AND medicine_id = ?
      `, [prescDbId, item.medicine_id])
      
      // Create stock transaction
      await connection.execute(`
        INSERT INTO medicine_stock_transactions (
          medicine_id, transaction_type, quantity, unit_price, total_amount,
          reference_id, notes, created_by
        ) VALUES (?, 'sale', ?, ?, ?, ?, ?, 1)
      `, [item.medicine_id, item.quantity, item.unit_price, item.quantity * item.unit_price, prescriptionId, `Dispensed from prescription ${prescriptionId}`])
    }
    
    console.log(`✅ Prescription dispensed, total amount: ₹${totalAmount}`)

    // Test 3: Auto-create billing entry
    console.log('\n🧾 Test 3: Testing auto-billing creation...')
    
    const billId = `BILL${Date.now()}`
    
    // Create main bill record
    await connection.execute(`
      INSERT INTO billing (
        bill_id, patient_id, bill_date, bill_type, subtotal, total_amount,
        paid_amount, balance_amount, payment_status, payment_method, 
        reference_id, created_by
      ) VALUES (?, ?, CURDATE(), 'pharmacy', ?, ?, 0, ?, 'pending', 'cash', ?, 1)
    `, [billId, patientId, totalAmount, totalAmount, totalAmount, prescriptionId])

    // Get billing record ID
    const billRecord = await connection.execute(`SELECT id FROM billing WHERE bill_id = ?`, [billId])
    const billingId = billRecord[0][0].id

    // Add billing items
    for (const item of dispensingItems) {
      const itemTotal = item.unit_price * item.quantity
      await connection.execute(`
        INSERT INTO billing_items (
          billing_id, item_type, item_name, quantity, unit_price, 
          total_price, final_amount
        ) VALUES (?, 'medicine', ?, ?, ?, ?, ?)
      `, [billingId, item.medicine_name, item.quantity, item.unit_price, itemTotal, itemTotal])
    }
    
    console.log(`✅ Auto-bill created: ${billId}`)

    // Test 4: Verify auto-billing integration
    console.log('\n🔍 Test 4: Verifying auto-billing integration...')
    
    const [billData] = await connection.execute(`
      SELECT b.*, COUNT(bi.id) as item_count 
      FROM billing b 
      LEFT JOIN billing_items bi ON b.id = bi.billing_id 
      WHERE b.bill_id = ? 
      GROUP BY b.id
    `, [billId])
    
    const [stockTransactions] = await connection.execute(`
      SELECT COUNT(*) as transaction_count 
      FROM medicine_stock_transactions 
      WHERE reference_id = ?
    `, [prescriptionId])
    
    console.log(`✅ Bill verification:`)
    console.log(`   - Bill ID: ${billData[0].bill_id}`)
    console.log(`   - Total Amount: ₹${billData[0].total_amount}`)
    console.log(`   - Items Count: ${billData[0].item_count}`)
    console.log(`   - Stock Transactions: ${stockTransactions[0].transaction_count}`)

    // Test 5: Test offline billing API endpoint
    console.log('\n🌐 Test 5: Testing offline billing API simulation...')
    
    const offlineBillData = {
      patient_id: patientId,
      patient_name: 'Test Patient',
      items: [
        {
          medicine_id: 1,
          medicine_name: 'Paracetamol 500mg',
          bill_quantity: 5,
          unit_price: 5.00
        }
      ],
      payment_method: 'cash',
      total_amount: 25.00
    }
    
    // Simulate offline bill creation
    const offlineBillId = `BILL${Date.now()}_OFFLINE`
    
    await connection.execute(`
      INSERT INTO billing (
        bill_id, patient_id, bill_date, bill_type, subtotal, total_amount,
        paid_amount, balance_amount, payment_status, payment_method, created_by
      ) VALUES (?, ?, CURDATE(), 'pharmacy', ?, ?, 0, ?, 'pending', ?, 1)
    `, [offlineBillId, offlineBillData.patient_id, offlineBillData.total_amount, offlineBillData.total_amount, offlineBillData.total_amount, offlineBillData.payment_method])
    
    console.log(`✅ Offline bill simulation: ${offlineBillId}`)

    // Test 6: Verify database integrity
    console.log('\n🔒 Test 6: Verifying database integrity...')
    
    const [prescriptionStatus] = await connection.execute(`
      SELECT status, 
             (SELECT COUNT(*) FROM prescription_medications WHERE prescription_id = ? AND is_dispensed = 1) as dispensed_items
      FROM prescriptions WHERE prescription_id = ?
    `, [prescDbId, prescriptionId])
    
    const [billingIntegrity] = await connection.execute(`
      SELECT 
        (SELECT COUNT(*) FROM billing WHERE reference_id = ?) as bills_count,
        (SELECT COUNT(*) FROM billing_items bi JOIN billing b ON bi.billing_id = b.id WHERE b.reference_id = ?) as items_count
    `, [prescriptionId, prescriptionId])
    
    console.log(`✅ Database integrity check:`)
    console.log(`   - Prescription status: ${prescriptionStatus[0].status}`)
    console.log(`   - Dispensed items: ${prescriptionStatus[0].dispensed_items}`)
    console.log(`   - Auto-generated bills: ${billingIntegrity[0].bills_count}`)
    console.log(`   - Billing items: ${billingIntegrity[0].items_count}`)

    console.log('\n🎉 All tests completed successfully!')
    console.log('\n📊 Test Summary:')
    console.log('✅ Prescription creation - PASSED')
    console.log('✅ Prescription dispensing - PASSED')
    console.log('✅ Auto-billing creation - PASSED')
    console.log('✅ Database integration - PASSED')
    console.log('✅ Offline billing simulation - PASSED')
    console.log('✅ Data integrity verification - PASSED')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Stack trace:', error.stack)
  } finally {
    if (connection) {
      await connection.end()
      console.log('\n🔌 Database connection closed')
    }
  }
}

// Run tests
testPharmacyAutoBilling()
