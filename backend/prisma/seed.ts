import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clear existing data
  await prisma.challanItem.deleteMany();
  await prisma.salesChallan.deleteMany();
  await prisma.stockLog.deleteMany();
  await prisma.product.deleteMany();
  await prisma.followUpNote.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users for all 4 required roles
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = await Promise.all([
    // Employee Name Accounts for Anjali Enterprise
    prisma.user.create({
      data: {
        name: 'Amit Verma (System Administrator)',
        email: 'amit.verma@anjalienterprise.com',
        password: hashedPassword,
        role: 'Admin',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Rahul Sharma (Sales Lead)',
        email: 'rahul.sharma@anjalienterprise.com',
        password: hashedPassword,
        role: 'Sales',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Vikram Singh (Warehouse Head)',
        email: 'vikram.singh@anjalienterprise.com',
        password: hashedPassword,
        role: 'Warehouse',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Priya Patel (Chief Accountant)',
        email: 'priya.patel@anjalienterprise.com',
        password: hashedPassword,
        role: 'Accounts',
      },
    }),
    // Generic Role Aliases
    prisma.user.create({
      data: {
        name: 'System Administrator',
        email: 'admin@anjalienterprise.com',
        password: hashedPassword,
        role: 'Admin',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Rahul Sharma (Sales Lead)',
        email: 'sales@anjalienterprise.com',
        password: hashedPassword,
        role: 'Sales',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Vikram Singh (Warehouse Head)',
        email: 'warehouse@anjalienterprise.com',
        password: hashedPassword,
        role: 'Warehouse',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Priya Patel (Chief Accountant)',
        email: 'accounts@anjalienterprise.com',
        password: hashedPassword,
        role: 'Accounts',
      },
    }),
    // Legacy Alias Accounts
    prisma.user.create({
      data: {
        name: 'System Administrator',
        email: 'admin@company.com',
        password: hashedPassword,
        role: 'Admin',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Rahul Sharma (Sales Lead)',
        email: 'sales@company.com',
        password: hashedPassword,
        role: 'Sales',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Vikram Singh (Warehouse Head)',
        email: 'warehouse@company.com',
        password: hashedPassword,
        role: 'Warehouse',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Priya Patel (Chief Accountant)',
        email: 'accounts@company.com',
        password: hashedPassword,
        role: 'Accounts',
      },
    }),
  ]);

  console.log('✅ Created demo users for Admin, Sales, Warehouse, Accounts roles');

  // 3. Create Sample Customers (15 Detailed Customers)
  const newCustomersData = [
    {
      customerName: 'Apex Logistics Ltd',
      mobileNumber: '+91 9876543210',
      email: 'contact@apexlogistics.com',
      businessName: 'Apex Distribution Hub',
      gstNumber: '27AAACA1234B1Z5',
      customerType: 'Distributor' as const,
      address: 'Plot 42, MIDC Industrial Area, Mumbai, Maharashtra 400093',
      status: 'Active' as const,
      followUpDate: new Date('2026-08-15'),
      notes: 'Key distributor for West region. Enquired about bulk pricing.',
    },
    {
      customerName: 'Metro Retail Outlets',
      mobileNumber: '+91 9123456789',
      email: 'purchase@metroretail.in',
      businessName: 'Metro Hypermarkets chain',
      gstNumber: '07BBBCC5678D1Z9',
      customerType: 'Retail' as const,
      address: 'Building 12, Connaught Place, New Delhi 110001',
      status: 'Active' as const,
      followUpDate: new Date('2026-08-18'),
      notes: 'Weekly recurring stock orders.',
    },
    {
      customerName: 'Global Wholesale Traders',
      mobileNumber: '+91 9988776655',
      email: 'info@globalwholesale.co.in',
      businessName: 'Global Enterprise Wholesale',
      gstNumber: '33CCCCD9876E1Z2',
      customerType: 'Wholesale' as const,
      address: '15 Trade Centre, Ring Road, Chennai, Tamil Nadu 600006',
      status: 'Lead' as const,
      followUpDate: new Date('2026-08-20'),
      notes: 'New lead interested in electronic appliances.',
    },
    {
      customerName: 'Shree Ram Electric & Hardware Corp',
      mobileNumber: '+91 9825011223',
      email: 'sales@shreeramelectric.in',
      businessName: 'Shree Ram Hardware Depot',
      gstNumber: '24AAACS1234F1Z1',
      customerType: 'Distributor' as const,
      address: 'GIDC Phase II, Vatva, Ahmedabad, Gujarat 382445',
      status: 'Active' as const,
      followUpDate: new Date('2026-08-16'),
      notes: 'High volume hardware purchaser.',
    },
    {
      customerName: 'Kalyan Supermarket Chains',
      mobileNumber: '+91 9422033445',
      email: 'procurement@kalyanretail.com',
      businessName: 'Kalyan Retail Outlets',
      gstNumber: '27AACCK4567G1Z8',
      customerType: 'Retail' as const,
      address: 'FC Road, Shivaji Nagar, Pune, Maharashtra 411005',
      status: 'Active' as const,
      followUpDate: new Date('2026-08-17'),
      notes: 'Monthly packaging roll requirements.',
    },
    {
      customerName: 'Venkateshwara Agencies & Wholesale',
      mobileNumber: '+91 9000155667',
      email: 'orders@venkateshwaraagencies.com',
      businessName: 'Venkateshwara Commercial Hub',
      gstNumber: '36AADCV7890H1Z4',
      customerType: 'Wholesale' as const,
      address: 'Ranigunj, Secunderabad, Hyderabad, Telangana 500003',
      status: 'Active' as const,
      followUpDate: new Date('2026-08-22'),
      notes: 'Interested in barcode printer consignments.',
    },
    {
      customerName: 'Southern Logistics & Supplies',
      mobileNumber: '+91 9845077889',
      email: 'admin@southernlogistics.co.in',
      businessName: 'Southern Supply Network',
      gstNumber: '33AACCS3456I1Z9',
      customerType: 'Distributor' as const,
      address: 'Peenya Industrial Area, Bengaluru, Karnataka 560058',
      status: 'Active' as const,
      followUpDate: new Date('2026-08-19'),
      notes: 'Logistics partner for South zone.',
    },
    {
      customerName: 'Mahavir Traders & Co.',
      mobileNumber: '+91 9414099001',
      email: 'mahavirtraders.jpr@gmail.com',
      businessName: 'Mahavir Trading House',
      gstNumber: '08AACCM9012J1Z3',
      customerType: 'Wholesale' as const,
      address: 'VKI Area, Road No 5, Jaipur, Rajasthan 302013',
      status: 'Lead' as const,
      followUpDate: new Date('2026-08-25'),
      notes: 'Requested product catalog and price list.',
    },
    {
      customerName: 'Empire Retail Stores Ltd',
      mobileNumber: '+91 9811022334',
      email: 'purchasing@empireretail.in',
      businessName: 'Empire Hypermarkets',
      gstNumber: '07AACCE6789K1Z7',
      customerType: 'Retail' as const,
      address: 'DLF Cyber City, Sector 24, Gurgaon, Haryana 122002',
      status: 'Active' as const,
      followUpDate: new Date('2026-08-21'),
      notes: 'Order confirmed for POS terminals.',
    },
    {
      customerName: 'Balaji Super Traders',
      mobileNumber: '+91 9755044556',
      email: 'balajitraderindore@yahoo.com',
      businessName: 'Balaji Commercial Depot',
      gstNumber: '23AACCB2345L1Z2',
      customerType: 'Wholesale' as const,
      address: 'Sanwer Road Industrial Area, Indore, Madhya Pradesh 452015',
      status: 'Active' as const,
      followUpDate: new Date('2026-08-24'),
      notes: 'Regular buyer of packaging supplies.',
    },
    {
      customerName: 'National Goods Distribution Hub',
      mobileNumber: '+91 9830066778',
      email: 'dispatch@nationalgoods.com',
      businessName: 'National Logistics Hub',
      gstNumber: '19AACCN5678M1Z6',
      customerType: 'Distributor' as const,
      address: 'Dankuni Industrial Complex, Kolkata, West Bengal 712311',
      status: 'Active' as const,
      followUpDate: new Date('2026-08-23'),
      notes: 'East region distribution partner.',
    },
    {
      customerName: 'Surat Textile & Accessories Outlet',
      mobileNumber: '+91 9898011223',
      email: 'surattextiles.procurement@gmail.com',
      businessName: 'Surat Textile Mart',
      gstNumber: '24AACCS8901N1Z0',
      customerType: 'Retail' as const,
      address: 'Ring Road Textile Market, Surat, Gujarat 395002',
      status: 'Lead' as const,
      followUpDate: new Date('2026-08-26'),
      notes: 'Inquiry for thermal barcode label rolls.',
    },
    {
      customerName: 'Royal Mart Hypermarket',
      mobileNumber: '+91 9900033445',
      email: 'storemanager@royalmart.in',
      businessName: 'Royal Mart Stores',
      gstNumber: '29AACCR2345O1Z5',
      customerType: 'Retail' as const,
      address: 'Devaraja Urs Road, Mysuru, Karnataka 570001',
      status: 'Active' as const,
      followUpDate: new Date('2026-08-27'),
      notes: 'Purchases thermal receipt printers.',
    },
    {
      customerName: 'Star Packaging Solutions',
      mobileNumber: '+91 9820055667',
      email: 'info@starpackagingsolutions.com',
      businessName: 'Star Packaging Depot',
      gstNumber: '27AACCS6789P1Z1',
      customerType: 'Wholesale' as const,
      address: 'Wagle Industrial Estate, Thane, Maharashtra 400604',
      status: 'Active' as const,
      followUpDate: new Date('2026-08-28'),
      notes: 'Stretch film roll bulk order lead.',
    },
    {
      customerName: 'Pioneer Industrial Suppliers',
      mobileNumber: '+91 9814088990',
      email: 'sales@pioneerindustrial.co.in',
      businessName: 'Pioneer Supply House',
      gstNumber: '03AACCP2345T1Z3',
      customerType: 'Distributor' as const,
      address: 'Focal Point, Phase V, Ludhiana, Punjab 141010',
      status: 'Active' as const,
      followUpDate: new Date('2026-08-29'),
      notes: 'North region industrial equipment distributor.',
    },
  ];

  const createdCustomers = await Promise.all(
    newCustomersData.map((cData) =>
      prisma.customer.create({
        data: {
          ...cData,
          followUps: {
            create: [
              {
                note: `Account setup completed for ${cData.businessName}. Initial inquiry registered.`,
                createdBy: 'Rahul Sharma (Sales Lead)',
              },
            ],
          },
        },
      })
    )
  );

  const customer1 = createdCustomers[0];
  const customer2 = createdCustomers[1];

  console.log(`✅ Created ${createdCustomers.length} realistic sample customers with follow-up histories`);

  // 4. Create Sample Products & Initial Stock Logs (15 Stock Items)
  const productsData = [
    {
      name: 'Industrial Heavy Duty Barcode Scanner',
      sku: 'PRD-BAR-001',
      category: 'Hardware & Electronics',
      unitPrice: 4500.0,
      currentStock: 45,
      minStockAlert: 10,
      location: 'Warehouse A - Shelf 12',
    },
    {
      name: 'Thermal Receipt Printer 80mm',
      sku: 'PRD-PRN-002',
      category: 'Hardware & Electronics',
      unitPrice: 6200.0,
      currentStock: 3, // LOW STOCK ALERT!
      minStockAlert: 5,
      location: 'Warehouse A - Shelf 15',
    },
    {
      name: 'Smart POS Billing Terminal',
      sku: 'PRD-POS-003',
      category: 'Hardware & Electronics',
      unitPrice: 18500.0,
      currentStock: 20,
      minStockAlert: 5,
      location: 'Warehouse B - Secure Storage',
    },
    {
      name: 'Heavy-Duty Packaging Tape Box (36 rolls)',
      sku: 'PRD-TAP-004',
      category: 'Packaging Materials',
      unitPrice: 1200.0,
      currentStock: 120,
      minStockAlert: 20,
      location: 'Warehouse C - Bulk Pallets',
    },
    {
      name: 'Wireless Handheld Barcode Reader 2D',
      sku: 'PRD-BAR-005',
      category: 'Hardware & Electronics',
      unitPrice: 3800.0,
      currentStock: 60,
      minStockAlert: 10,
      location: 'Warehouse A - Shelf A1',
    },
    {
      name: 'Barcode Label Roll (1000 Labels)',
      sku: 'PRD-LBL-006',
      category: 'Packaging Materials',
      unitPrice: 450.0,
      currentStock: 350,
      minStockAlert: 50,
      location: 'Warehouse C - Shelf B2',
    },
    {
      name: 'Heavy Duty Digital Weighing Scale (300kg)',
      sku: 'PRD-SCL-007',
      category: 'Hardware & Electronics',
      unitPrice: 14500.0,
      currentStock: 4, // LOW STOCK!
      minStockAlert: 5,
      location: 'Warehouse B - Shelf C3',
    },
    {
      name: 'Android Rugged Handheld Terminal (PDA)',
      sku: 'PRD-PDA-008',
      category: 'Hardware & Electronics',
      unitPrice: 24000.0,
      currentStock: 18,
      minStockAlert: 4,
      location: 'Warehouse B - Secure Room',
    },
    {
      name: 'Pallet Wrap Stretch Film Roll (6 rolls)',
      sku: 'PRD-FLM-009',
      category: 'Packaging Materials',
      unitPrice: 1850.0,
      currentStock: 85,
      minStockAlert: 15,
      location: 'Warehouse C - Pallet Bay',
    },
    {
      name: 'Laser Desktop Shipping Printer',
      sku: 'PRD-PRN-010',
      category: 'Hardware & Electronics',
      unitPrice: 11200.0,
      currentStock: 2, // LOW STOCK!
      minStockAlert: 5,
      location: 'Warehouse A - Shelf A4',
    },
    {
      name: 'ESD Antistatic Gloves (Pack of 10 pairs)',
      sku: 'PRD-GLV-011',
      category: 'Safety & Warehousing',
      unitPrice: 650.0,
      currentStock: 140,
      minStockAlert: 25,
      location: 'Warehouse A - Safety Rack',
    },
    {
      name: 'Steel Strapping Roll 19mm',
      sku: 'PRD-STP-012',
      category: 'Packaging Materials',
      unitPrice: 2400.0,
      currentStock: 40,
      minStockAlert: 10,
      location: 'Warehouse C - Heavy Rack C1',
    },
    {
      name: 'Automatic Carton Sealing Machine',
      sku: 'PRD-MCH-013',
      category: 'Machinery & Tools',
      unitPrice: 48000.0,
      currentStock: 3,
      minStockAlert: 2,
      location: 'Warehouse B - Machinery Bay',
    },
    {
      name: 'Hydraulic Hand Pallet Truck 3 Ton',
      sku: 'PRD-PLT-014',
      category: 'Machinery & Tools',
      unitPrice: 19500.0,
      currentStock: 1, // LOW STOCK!
      minStockAlert: 3,
      location: 'Warehouse B - Heavy Bay',
    },
    {
      name: 'RFID Smart Inventory Tag (1000 Pcs)',
      sku: 'PRD-TAG-015',
      category: 'Hardware & Electronics',
      unitPrice: 5500.0,
      currentStock: 90,
      minStockAlert: 20,
      location: 'Warehouse A - Tech Bin A6',
    },
  ];

  const products = await Promise.all(
    productsData.map((pData) =>
      prisma.product.create({
        data: pData,
      })
    )
  );

  // Create stock movement logs for initial stock IN
  for (const prod of products) {
    await prisma.stockLog.create({
      data: {
        productId: prod.id,
        quantityChanged: prod.currentStock + 5, // simulate original stock before a test deduction
        movementType: 'IN',
        reason: 'Initial Vendor Consignment Receiving',
        createdBy: 'Vikram Singh (Warehouse Head)',
      },
    });
  }

  console.log('✅ Created 4 products with stock levels and low-stock alert triggers');

  // 5. Create Sample Sales Challans
  // Challan 1: Confirmed
  const item1Product = products[0]; // Barcode scanner
  const item1Qty = 5;
  const item1Subtotal = item1Product.unitPrice * item1Qty;

  const item2Product = products[3]; // Packaging tape
  const item2Qty = 10;
  const item2Subtotal = item2Product.unitPrice * item2Qty;

  const totalAmount1 = item1Subtotal + item2Subtotal;
  const totalQty1 = item1Qty + item2Qty;

  const challan1 = await prisma.salesChallan.create({
    data: {
      challanNumber: 'CH-2026-0001',
      customerId: customer1.id,
      customerSnapshot: JSON.stringify({
        id: customer1.id,
        customerName: customer1.customerName,
        businessName: customer1.businessName,
        mobileNumber: customer1.mobileNumber,
        email: customer1.email,
        gstNumber: customer1.gstNumber,
        address: customer1.address,
        customerType: customer1.customerType,
      }),
      totalQuantity: totalQty1,
      totalAmount: totalAmount1,
      status: 'Confirmed',
      createdBy: 'Rahul Sharma (Sales)',
      items: {
        create: [
          {
            productId: item1Product.id,
            productSnapshot: JSON.stringify({
              id: item1Product.id,
              name: item1Product.name,
              sku: item1Product.sku,
              category: item1Product.category,
              unitPrice: item1Product.unitPrice,
              location: item1Product.location,
            }),
            quantity: item1Qty,
            unitPrice: item1Product.unitPrice,
            subtotal: item1Subtotal,
          },
          {
            productId: item2Product.id,
            productSnapshot: JSON.stringify({
              id: item2Product.id,
              name: item2Product.name,
              sku: item2Product.sku,
              category: item2Product.category,
              unitPrice: item2Product.unitPrice,
              location: item2Product.location,
            }),
            quantity: item2Qty,
            unitPrice: item2Product.unitPrice,
            subtotal: item2Subtotal,
          },
        ],
      },
    },
  });

  // Add stock OUT log for confirmed challan 1
  await prisma.stockLog.create({
    data: {
      productId: item1Product.id,
      quantityChanged: item1Qty,
      movementType: 'OUT',
      reason: 'Sales Challan CH-2026-0001 Confirmed Dispatch',
      createdBy: 'Rahul Sharma (Sales)',
    },
  });

  await prisma.stockLog.create({
    data: {
      productId: item2Product.id,
      quantityChanged: item2Qty,
      movementType: 'OUT',
      reason: 'Sales Challan CH-2026-0001 Confirmed Dispatch',
      createdBy: 'Rahul Sharma (Sales)',
    },
  });

  // Challan 2: Draft
  const item3Product = products[2]; // POS terminal
  const item3Qty = 2;
  const item3Subtotal = item3Product.unitPrice * item3Qty;

  await prisma.salesChallan.create({
    data: {
      challanNumber: 'CH-2026-0002',
      customerId: customer2.id,
      customerSnapshot: JSON.stringify({
        id: customer2.id,
        customerName: customer2.customerName,
        businessName: customer2.businessName,
        mobileNumber: customer2.mobileNumber,
        email: customer2.email,
        gstNumber: customer2.gstNumber,
        address: customer2.address,
        customerType: customer2.customerType,
      }),
      totalQuantity: item3Qty,
      totalAmount: item3Subtotal,
      status: 'Draft',
      createdBy: 'Rahul Sharma (Sales)',
      items: {
        create: [
          {
            productId: item3Product.id,
            productSnapshot: JSON.stringify({
              id: item3Product.id,
              name: item3Product.name,
              sku: item3Product.sku,
              category: item3Product.category,
              unitPrice: item3Product.unitPrice,
              location: item3Product.location,
            }),
            quantity: item3Qty,
            unitPrice: item3Product.unitPrice,
            subtotal: item3Subtotal,
          },
        ],
      },
    },
  });

  console.log('✅ Created sample Sales Challans (Confirmed & Draft)');
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
