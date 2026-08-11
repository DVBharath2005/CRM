import { Response } from 'express';
import { prisma } from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalCustomers,
      activeCustomers,
      leadCustomers,
      totalProducts,
      allProducts,
      totalChallans,
      confirmedChallans,
      draftChallans,
      recentStockLogs,
      recentChallans,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { status: 'Active' } }),
      prisma.customer.count({ where: { status: 'Lead' } }),
      prisma.product.count(),
      prisma.product.findMany(),
      prisma.salesChallan.count(),
      prisma.salesChallan.findMany({ where: { status: 'Confirmed' } }),
      prisma.salesChallan.count({ where: { status: 'Draft' } }),
      prisma.stockLog.findMany({
        take: 5,
        orderBy: { timestamp: 'desc' },
        include: {
          product: {
            select: { name: true, sku: true },
          },
        },
      }),
      prisma.salesChallan.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { customerName: true, businessName: true } } },
      }),
    ]);

    const lowStockAlertsCount = allProducts.filter(
      (p) => p.currentStock <= p.minStockAlert
    ).length;

    const totalRevenue = confirmedChallans.reduce(
      (acc, c) => acc + (c.totalAmount || 0),
      0
    );

    res.json({
      stats: {
        customers: {
          total: totalCustomers,
          active: activeCustomers,
          lead: leadCustomers,
        },
        products: {
          total: totalProducts,
          lowStockAlerts: lowStockAlertsCount,
        },
        challans: {
          total: totalChallans,
          confirmed: confirmedChallans.length,
          draft: draftChallans,
          totalRevenue,
        },
      },
      recentStockLogs,
      recentChallans: recentChallans.map((c) => ({
        ...c,
        customerSnapshot: JSON.parse(c.customerSnapshot),
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch dashboard stats' });
  }
};
