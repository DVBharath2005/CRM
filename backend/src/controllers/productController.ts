import { Response } from 'express';
import { prisma } from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const category = (req.query.category as string) || '';
    const lowStockOnly = req.query.lowStock === 'true';

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { location: { contains: search } },
      ];
    }

    if (category) {
      where.category = category;
    }

    const productsList = await prisma.product.findMany({ where });

    let filteredIds: string[] | undefined = undefined;
    if (lowStockOnly) {
      filteredIds = productsList
        .filter((p) => p.currentStock <= p.minStockAlert)
        .map((p) => p.id);
      where.id = { in: filteredIds };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch products' });
  }
};

export const getProductById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stockLogs: {
          orderBy: { timestamp: 'desc' },
          take: 20,
        },
      },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json({ product });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch product detail' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      sku,
      category,
      unitPrice,
      currentStock,
      minStockAlert,
      location,
    } = req.body;

    if (!name || !sku || !category || unitPrice === undefined || currentStock === undefined) {
      res.status(400).json({
        error: 'Required fields: name, sku, category, unitPrice, currentStock',
      });
      return;
    }

    const existingSku = await prisma.product.findUnique({
      where: { sku: sku.trim().toUpperCase() },
    });
    if (existingSku) {
      res.status(400).json({ error: `Product with SKU '${sku}' already exists` });
      return;
    }

    const createdBy = req.user ? `${req.user.name} (${req.user.role})` : 'System';

    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          name,
          sku: sku.trim().toUpperCase(),
          category,
          unitPrice: parseFloat(unitPrice),
          currentStock: parseInt(currentStock),
          minStockAlert: parseInt(minStockAlert || 5),
          location: location || 'Main Warehouse',
        },
      });

      if (newProduct.currentStock > 0) {
        await tx.stockLog.create({
          data: {
            productId: newProduct.id,
            quantityChanged: newProduct.currentStock,
            movementType: 'IN',
            reason: 'Initial Product Creation Stock',
            createdBy,
          },
        });
      }

      return newProduct;
    });

    res.status(201).json({
      message: 'Product created successfully',
      product,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create product' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, sku, category, unitPrice, minStockAlert, location } = req.body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    if (sku && sku.trim().toUpperCase() !== existing.sku) {
      const skuCheck = await prisma.product.findUnique({
        where: { sku: sku.trim().toUpperCase() },
      });
      if (skuCheck) {
        res.status(400).json({ error: `SKU '${sku}' is already taken by another product` });
        return;
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        sku: sku ? sku.trim().toUpperCase() : existing.sku,
        category: category ?? existing.category,
        unitPrice: unitPrice !== undefined ? parseFloat(unitPrice) : existing.unitPrice,
        minStockAlert: minStockAlert !== undefined ? parseInt(minStockAlert) : existing.minStockAlert,
        location: location ?? existing.location,
      },
    });

    res.json({
      message: 'Product updated successfully',
      product: updated,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update product' });
  }
};

export const adjustStock = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { quantityChanged, movementType, reason } = req.body;

    if (!quantityChanged || !movementType || !reason) {
      res.status(400).json({
        error: 'Required fields: quantityChanged (positive int), movementType (IN or OUT), reason',
      });
      return;
    }

    if (!['IN', 'OUT'].includes(movementType)) {
      res.status(400).json({ error: "movementType must be 'IN' or 'OUT'" });
      return;
    }

    const qty = Math.abs(parseInt(quantityChanged));
    if (qty <= 0) {
      res.status(400).json({ error: 'quantityChanged must be greater than 0' });
      return;
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    if (movementType === 'OUT' && product.currentStock < qty) {
      res.status(400).json({
        error: `Insufficient stock for '${product.name}' (SKU: ${product.sku}). Available stock: ${product.currentStock}, Requested reduction: ${qty}`,
      });
      return;
    }

    const createdBy = req.user ? `${req.user.name} (${req.user.role})` : 'System User';

    const result = await prisma.$transaction(async (tx) => {
      const newStock =
        movementType === 'IN'
          ? product.currentStock + qty
          : product.currentStock - qty;

      const updatedProduct = await tx.product.update({
        where: { id },
        data: { currentStock: newStock },
      });

      const log = await tx.stockLog.create({
        data: {
          productId: id,
          quantityChanged: qty,
          movementType,
          reason,
          createdBy,
        },
      });

      return { product: updatedProduct, log };
    });

    res.json({
      message: `Stock successfully adjusted (${movementType} ${qty})`,
      product: result.product,
      log: result.log,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to adjust stock' });
  }
};

export const getStockLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 15;
    const productId = req.query.productId as string;
    const movementType = req.query.movementType as string;

    const skip = (page - 1) * limit;

    const where: any = {};
    if (productId) where.productId = productId;
    if (movementType) where.movementType = movementType;

    const [logs, total] = await Promise.all([
      prisma.stockLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: {
          product: {
            select: {
              name: true,
              sku: true,
              category: true,
            },
          },
        },
      }),
      prisma.stockLog.count({ where }),
    ]);

    res.json({
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch stock logs' });
  }
};
