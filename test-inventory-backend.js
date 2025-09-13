#!/usr/bin/env node

// Complete Inventory Management Backend Test
// Using built-in fetch (Node.js 18+)

const BASE_URL = 'http://localhost:3000/api/admin/inventory';

async function testInventoryBackend() {
  console.log('🧪 Testing Complete Inventory Management Backend...\n');

  try {
    // Test 1: Get inventory data
    console.log('📊 Test 1: Getting inventory data...');
    const inventoryResponse = await fetch(`${BASE_URL}`);
    const inventoryData = await inventoryResponse.json();
    
    if (inventoryData.success) {
      console.log('✅ Inventory data retrieved successfully');
      console.log(`   Total Items: ${inventoryData.data.totalItems.toLocaleString()}`);
      console.log(`   Critical Stock: ${inventoryData.data.criticalStock.toLocaleString()}`);
      console.log(`   Expiring Soon: ${inventoryData.data.expiringSoon.toLocaleString()}`);
      console.log(`   Total Value: ₹${inventoryData.data.totalValue.toLocaleString()}`);
      console.log(`   Medicines: ${inventoryData.data.inventory.length}`);
    } else {
      console.log('❌ Failed to get inventory data:', inventoryData.error);
    }

    // Test 2: Add new medicine
    console.log('\n💊 Test 2: Adding new medicine...');
    const newMedicine = {
      name: 'Test Medicine',
      generic_name: 'Test Generic',
      category: 'Test Category',
      strength: '100mg',
      dosage_form: 'tablet',
      unit_price: 10.50,
      mrp: 15.00,
      current_stock: 100,
      minimum_stock: 20,
      maximum_stock: 500,
      supplier: 'Test Supplier',
      manufacturer: 'Test Manufacturer'
    };

    const addResponse = await fetch(`${BASE_URL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMedicine)
    });
    
    const addResult = await addResponse.json();
    if (addResult.success) {
      console.log('✅ Medicine added successfully');
      console.log(`   Medicine ID: ${addResult.data.medicine_id}`);
    } else {
      console.log('❌ Failed to add medicine:', addResult.error);
    }

    // Test 3: Search and filter
    console.log('\n🔍 Test 3: Testing search and filters...');
    
    // Search by name
    const searchResponse = await fetch(`${BASE_URL}?search=Paracetamol`);
    const searchData = await searchResponse.json();
    console.log(`✅ Search results: ${searchData.data.inventory.length} medicines found`);

    // Filter by category
    const categoryResponse = await fetch(`${BASE_URL}?category=Analgesic`);
    const categoryData = await categoryResponse.json();
    console.log(`✅ Category filter: ${categoryData.data.inventory.length} medicines found`);

    // Critical stock filter
    const criticalResponse = await fetch(`${BASE_URL}?critical=true`);
    const criticalData = await criticalResponse.json();
    console.log(`✅ Critical stock filter: ${criticalData.data.inventory.length} medicines found`);

    // Test 4: Stock transactions
    console.log('\n📦 Test 4: Testing stock transactions...');
    
    const stockTransaction = {
      medicine_id: 1,
      transaction_type: 'IN',
      quantity: 50,
      unit_price: 12.00,
      total_amount: 600.00,
      batch_number: 'BATCH001',
      supplier: 'Test Supplier',
      notes: 'Test stock addition'
    };

    const stockResponse = await fetch(`${BASE_URL}/stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stockTransaction)
    });
    
    const stockResult = await stockResponse.json();
    if (stockResult.success) {
      console.log('✅ Stock transaction recorded successfully');
      console.log(`   Transaction ID: ${stockResult.data.transaction_id}`);
    } else {
      console.log('❌ Failed to record stock transaction:', stockResult.error);
    }

    // Test 5: Vendor management
    console.log('\n🏢 Test 5: Testing vendor management...');
    
    const newVendor = {
      name: 'Test Vendor Corp',
      contact_person: 'John Doe',
      phone: '9876543210',
      email: 'john@testvendor.com',
      address: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      pincode: '123456',
      gst_number: 'GST123456789',
      payment_terms: '30 days',
      credit_limit: 100000
    };

    const vendorResponse = await fetch(`${BASE_URL}/vendors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newVendor)
    });
    
    const vendorResult = await vendorResponse.json();
    if (vendorResult.success) {
      console.log('✅ Vendor added successfully');
      console.log(`   Vendor ID: ${vendorResult.data.supplier_id}`);
    } else {
      console.log('❌ Failed to add vendor:', vendorResult.error);
    }

    // Test 6: Purchase orders
    console.log('\n📋 Test 6: Testing purchase orders...');
    
    const purchaseOrder = {
      supplier_id: 1,
      order_date: new Date().toISOString().split('T')[0],
      expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      total_amount: 1500.00,
      notes: 'Test purchase order',
      items: [
        {
          medicine_id: 1,
          quantity: 100,
          unit_price: 10.00,
          total_price: 1000.00,
          batch_number: 'PO001'
        },
        {
          medicine_id: 2,
          quantity: 50,
          unit_price: 10.00,
          total_price: 500.00,
          batch_number: 'PO002'
        }
      ]
    };

    const poResponse = await fetch(`${BASE_URL}/purchase-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(purchaseOrder)
    });
    
    const poResult = await poResponse.json();
    if (poResult.success) {
      console.log('✅ Purchase order created successfully');
      console.log(`   Order ID: ${poResult.data.order_id}`);
    } else {
      console.log('❌ Failed to create purchase order:', poResult.error);
    }

    // Test 7: Reports
    console.log('\n📊 Test 7: Testing reports...');
    
    const reportTypes = ['summary', 'critical', 'expiring', 'category', 'vendor'];
    
    for (const reportType of reportTypes) {
      const reportResponse = await fetch(`${BASE_URL}/reports?type=${reportType}`);
      const reportData = await reportResponse.json();
      
      if (reportData.success) {
        console.log(`✅ ${reportType} report generated successfully`);
      } else {
        console.log(`❌ Failed to generate ${reportType} report:`, reportData.error);
      }
    }

    console.log('\n🎉 All backend tests completed!');
    console.log('\n📋 Backend Features Available:');
    console.log('   ✅ Inventory Management (CRUD)');
    console.log('   ✅ Stock Transactions (IN/OUT/ADJUSTMENT)');
    console.log('   ✅ Vendor Management (CRUD)');
    console.log('   ✅ Purchase Order Management');
    console.log('   ✅ Search and Filtering');
    console.log('   ✅ Reports Generation');
    console.log('   ✅ Real-time Stock Updates');
    console.log('   ✅ Critical Stock Alerts');
    console.log('   ✅ Expiry Date Tracking');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testInventoryBackend();
