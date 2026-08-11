import assert from 'node:assert';
import { app } from '../app.js';
import { prisma } from '../config/prisma.js';
import http from 'node:http';

let server: http.Server;
const PORT = 5099;
const BASE_URL = `http://localhost:${PORT}/api`;

const request = async (
  endpoint: string,
  options: { method?: string; body?: any; token?: string } = {}
) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => null);
  return { status: res.status, data };
};

async function runTests() {
  console.log('🧪 Starting API Verification Tests...');

  server = app.listen(PORT);

  try {
    // 1. Health check
    console.log('Testing GET /api/health...');
    const health = await request('/health');
    assert.strictEqual(health.status, 200);
    assert.strictEqual(health.data.status, 'OK');
    console.log('  ✅ Health check passed');

    // 2. Authentication Login (Sales role)
    console.log('Testing POST /api/auth/login...');
    const loginRes = await request('/auth/login', {
      method: 'POST',
      body: { email: 'sales@company.com', password: 'password123' },
    });
    assert.strictEqual(loginRes.status, 200);
    assert.strictEqual(loginRes.data.user.role, 'Sales');
    const salesToken = loginRes.data.token;
    console.log('  ✅ Sales login passed');

    // 3. Admin Login
    const adminLoginRes = await request('/auth/login', {
      method: 'POST',
      body: { email: 'admin@company.com', password: 'password123' },
    });
    assert.strictEqual(adminLoginRes.status, 200);
    const adminToken = adminLoginRes.data.token;
    console.log('  ✅ Admin login passed');

    // 4. GET /api/customers
    console.log('Testing GET /api/customers...');
    const custRes = await request('/customers', { token: salesToken });
    assert.strictEqual(custRes.status, 200);
    assert.ok(Array.isArray(custRes.data.customers));
    assert.ok(custRes.data.customers.length > 0);
    console.log(`  ✅ Customers list returned ${custRes.data.customers.length} items`);

    const testCustomerId = custRes.data.customers[0].id;

    // 5. GET /api/products
    console.log('Testing GET /api/products...');
    const prodRes = await request('/products', { token: salesToken });
    assert.strictEqual(prodRes.status, 200);
    assert.ok(Array.isArray(prodRes.data.products));
    assert.ok(prodRes.data.products.length > 0);
    console.log(`  ✅ Products list returned ${prodRes.data.products.length} items`);

    const testProduct = prodRes.data.products.find((p: any) => p.currentStock > 2);
    assert.ok(testProduct, 'Test product with available stock found');

    // 6. Test Sales Challan Creation (Draft)
    console.log('Testing POST /api/challans (Draft)...');
    const draftRes = await request('/challans', {
      method: 'POST',
      token: salesToken,
      body: {
        customerId: testCustomerId,
        status: 'Draft',
        items: [{ productId: testProduct.id, quantity: 1 }],
      },
    });
    assert.strictEqual(draftRes.status, 201);
    assert.strictEqual(draftRes.data.challan.status, 'Draft');
    console.log(`  ✅ Draft Challan created: ${draftRes.data.challan.challanNumber}`);

    // 7. Test Insufficient Stock Error handling in Confirmed Sales Challan
    console.log('Testing Insufficient Stock Error validation...');
    const insufficientRes = await request('/challans', {
      method: 'POST',
      token: salesToken,
      body: {
        customerId: testCustomerId,
        status: 'Confirmed',
        items: [{ productId: testProduct.id, quantity: 999999 }], // Exceeding stock
      },
    });
    assert.strictEqual(insufficientRes.status, 400);
    assert.ok(insufficientRes.data.error.includes('insufficient stock'));
    console.log('  ✅ Insufficient stock error handled cleanly with 400 Bad Request');

    // 8. Test Confirmed Sales Challan Stock Deduction
    console.log('Testing Confirmed Challan automatic stock deduction...');
    const stockBefore = testProduct.currentStock;
    const confirmRes = await request('/challans', {
      method: 'POST',
      token: salesToken,
      body: {
        customerId: testCustomerId,
        status: 'Confirmed',
        items: [{ productId: testProduct.id, quantity: 2 }],
      },
    });
    assert.strictEqual(confirmRes.status, 201);
    assert.strictEqual(confirmRes.data.challan.status, 'Confirmed');

    // Verify product stock deducted
    const updatedProdRes = await request(`/products/${testProduct.id}`, { token: salesToken });
    assert.strictEqual(updatedProdRes.data.product.currentStock, stockBefore - 2);
    console.log(`  ✅ Stock successfully reduced from ${stockBefore} to ${updatedProdRes.data.product.currentStock}`);

    // 9. Dashboard Stats API
    console.log('Testing GET /api/dashboard/stats...');
    const dashRes = await request('/dashboard/stats', { token: adminToken });
    assert.strictEqual(dashRes.status, 200);
    assert.ok(dashRes.data.stats.customers.total > 0);
    console.log('  ✅ Dashboard stats API verified');

    console.log('🎉 ALL API TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test execution failed:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    await prisma.$disconnect();
  }
}

runTests();
