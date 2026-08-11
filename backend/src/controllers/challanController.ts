import { Response } from 'express';
import { prisma } from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

const generateChallanNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const count = await prisma.salesChallan.count();
  const nextNum = (count + 1).toString().padStart(4, '0');
  return `CH-${year}-${nextNum}`;
};

export const getChallans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const status = (req.query.status as string) || '';
    const customerId = (req.query.customerId as string) || '';

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { challanNumber: { contains: search } },
        { customerSnapshot: { contains: search } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    const [challans, total] = await Promise.all([
      prisma.salesChallan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: {
              customerName: true,
              businessName: true,
              mobileNumber: true,
              email: true,
            },
          },
          items: true,
        },
      }),
      prisma.salesChallan.count({ where }),
    ]);

    const formattedChallans = challans.map((c) => ({
      ...c,
      customerSnapshot: JSON.parse(c.customerSnapshot),
      items: c.items.map((item) => ({
        ...item,
        productSnapshot: JSON.parse(item.productSnapshot),
      })),
    }));

    res.json({
      challans: formattedChallans,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch sales challans' });
  }
};

export const getChallanById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const challan = await prisma.salesChallan.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
      },
    });

    if (!challan) {
      res.status(404).json({ error: 'Sales Challan not found' });
      return;
    }

    const formatted = {
      ...challan,
      customerSnapshot: JSON.parse(challan.customerSnapshot),
      items: challan.items.map((item) => ({
        ...item,
        productSnapshot: JSON.parse(item.productSnapshot),
      })),
    };

    res.json({ challan: formatted });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch challan details' });
  }
};

export const createChallan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { customerId, items, status = 'Draft' } = req.body;

    if (!customerId) {
      res.status(400).json({ error: 'Customer ID is required' });
      return;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'At least one item is required in the challan' });
      return;
    }

    if (!['Draft', 'Confirmed'].includes(status)) {
      res.status(400).json({ error: "Initial status must be either 'Draft' or 'Confirmed'" });
      return;
    }

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    const customerSnapshot = JSON.stringify({
      id: customer.id,
      customerName: customer.customerName,
      businessName: customer.businessName,
      mobileNumber: customer.mobileNumber,
      email: customer.email,
      gstNumber: customer.gstNumber,
      address: customer.address,
      customerType: customer.customerType,
    });

    const productIds = items.map((i: any) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    const insufficientStockErrors: string[] = [];
    let totalQuantity = 0;
    let totalAmount = 0;

    const processedItems: any[] = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        res.status(400).json({ error: `Product with ID '${item.productId}' not found` });
        return;
      }

      const qty = parseInt(item.quantity);
      if (isNaN(qty) || qty <= 0) {
        res.status(400).json({ error: `Invalid quantity for product ${product.name}` });
        return;
      }

      if (status === 'Confirmed') {
        if (product.currentStock < qty) {
          insufficientStockErrors.push(
            `Product '${product.name}' (SKU: ${product.sku}) has insufficient stock. Available: ${product.currentStock}, Requested: ${qty}`
          );
        }
      }

      const unitPrice = item.unitPrice !== undefined ? parseFloat(item.unitPrice) : product.unitPrice;
      const subtotal = qty * unitPrice;

      totalQuantity += qty;
      totalAmount += subtotal;

      const productSnapshot = JSON.stringify({
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category,
        unitPrice,
        location: product.location,
      });

      processedItems.push({
        productId: product.id,
        productSnapshot,
        quantity: qty,
        unitPrice,
        subtotal,
      });
    }

    if (insufficientStockErrors.length > 0) {
      res.status(400).json({
        error: 'Cannot confirm sales challan due to insufficient stock',
        details: insufficientStockErrors,
      });
      return;
    }

    const challanNumber = await generateChallanNumber();
    const createdBy = req.user ? `${req.user.name} (${req.user.role})` : 'System User';

    const result = await prisma.$transaction(async (tx) => {
      const newChallan = await tx.salesChallan.create({
        data: {
          challanNumber,
          customerId,
          customerSnapshot,
          totalQuantity,
          totalAmount,
          status,
          createdBy,
          items: {
            create: processedItems,
          },
        },
        include: { items: true },
      });

      if (status === 'Confirmed') {
        for (const item of processedItems) {
          const product = productMap.get(item.productId)!;
          await tx.product.update({
            where: { id: product.id },
            data: { currentStock: product.currentStock - item.quantity },
          });

          await tx.stockLog.create({
            data: {
              productId: product.id,
              quantityChanged: item.quantity,
              movementType: 'OUT',
              reason: `Sales Challan ${challanNumber} Confirmed`,
              createdBy,
            },
          });
        }
      }

      return newChallan;
    });

    const formatted = {
      ...result,
      customerSnapshot: JSON.parse(result.customerSnapshot),
      items: result.items.map((i) => ({
        ...i,
        productSnapshot: JSON.parse(i.productSnapshot),
      })),
    };

    res.status(201).json({
      message: `Sales Challan ${challanNumber} created successfully (${status})`,
      challan: formatted,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create sales challan' });
  }
};

export const updateChallanStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Draft', 'Confirmed', 'Cancelled'].includes(status)) {
      res.status(400).json({ error: "Status must be 'Draft', 'Confirmed', or 'Cancelled'" });
      return;
    }

    const existing = await prisma.salesChallan.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      res.status(404).json({ error: 'Sales Challan not found' });
      return;
    }

    if (existing.status === status) {
      res.json({ message: `Challan is already in '${status}' status`, challan: existing });
      return;
    }

    const createdBy = req.user ? `${req.user.name} (${req.user.role})` : 'System User';

    if (existing.status === 'Draft' && status === 'Confirmed') {
      const productIds = existing.items.map((i) => i.productId);
      const dbProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });
      const productMap = new Map(dbProducts.map((p) => [p.id, p]));

      const insufficientStockErrors: string[] = [];

      for (const item of existing.items) {
        const product = productMap.get(item.productId);
        if (!product) {
          insufficientStockErrors.push(`Product ID ${item.productId} no longer exists`);
          continue;
        }
        if (product.currentStock < item.quantity) {
          insufficientStockErrors.push(
            `Product '${product.name}' (SKU: ${product.sku}) has insufficient stock. Available: ${product.currentStock}, Requested: ${item.quantity}`
          );
        }
      }

      if (insufficientStockErrors.length > 0) {
        res.status(400).json({
          error: 'Cannot confirm sales challan due to insufficient stock',
          details: insufficientStockErrors,
        });
        return;
      }

      const updated = await prisma.$transaction(async (tx) => {
        for (const item of existing.items) {
          const product = productMap.get(item.productId)!;
          await tx.product.update({
            where: { id: product.id },
            data: { currentStock: product.currentStock - item.quantity },
          });

          await tx.stockLog.create({
            data: {
              productId: product.id,
              quantityChanged: item.quantity,
              movementType: 'OUT',
              reason: `Sales Challan ${existing.challanNumber} Confirmed`,
              createdBy,
            },
          });
        }

        return tx.salesChallan.update({
          where: { id },
          data: { status: 'Confirmed' },
          include: { items: true },
        });
      });

      res.json({
        message: `Challan ${existing.challanNumber} confirmed and stock updated`,
        challan: updated,
      });
      return;
    }

    if (existing.status === 'Confirmed' && status === 'Cancelled') {
      const productIds = existing.items.map((i) => i.productId);
      const dbProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });
      const productMap = new Map(dbProducts.map((p) => [p.id, p]));

      const updated = await prisma.$transaction(async (tx) => {
        for (const item of existing.items) {
          const product = productMap.get(item.productId);
          if (product) {
            await tx.product.update({
              where: { id: product.id },
              data: { currentStock: product.currentStock + item.quantity },
            });

            await tx.stockLog.create({
              data: {
                productId: product.id,
                quantityChanged: item.quantity,
                movementType: 'IN',
                reason: `Sales Challan ${existing.challanNumber} Cancelled - Stock Restored`,
                createdBy,
              },
            });
          }
        }

        return tx.salesChallan.update({
          where: { id },
          data: { status: 'Cancelled' },
          include: { items: true },
        });
      });

      res.json({
        message: `Challan ${existing.challanNumber} cancelled and stock restored`,
        challan: updated,
      });
      return;
    }

    const updated = await prisma.salesChallan.update({
      where: { id },
      data: { status },
      include: { items: true },
    });

    res.json({
      message: `Challan ${existing.challanNumber} status updated to '${status}'`,
      challan: updated,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update challan status' });
  }
};
