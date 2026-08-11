import { Response } from 'express';
import { prisma } from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

export const getCustomers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const status = (req.query.status as string) || '';
    const customerType = (req.query.type as string) || '';

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { customerName: { contains: search } },
        { businessName: { contains: search } },
        { mobileNumber: { contains: search } },
        { email: { contains: search } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (customerType) {
      where.customerType = customerType;
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          _count: {
            select: { followUps: true, challans: true },
          },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    res.json({
      customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch customers' });
  }
};

export const getCustomerById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        followUps: {
          orderBy: { createdAt: 'desc' },
        },
        challans: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    res.json({ customer });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch customer detail' });
  }
};

export const createCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      customerName,
      mobileNumber,
      email,
      businessName,
      gstNumber,
      customerType,
      address,
      status,
      followUpDate,
      notes,
    } = req.body;

    if (!customerName || !mobileNumber || !email || !businessName || !customerType || !address) {
      res.status(400).json({
        error: 'Required fields: customerName, mobileNumber, email, businessName, customerType, address',
      });
      return;
    }

    const customer = await prisma.customer.create({
      data: {
        customerName,
        mobileNumber,
        email,
        businessName,
        gstNumber: gstNumber || null,
        customerType,
        address,
        status: status || 'Lead',
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        notes: notes || null,
      },
    });

    res.status(201).json({
      message: 'Customer created successfully',
      customer,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create customer' });
  }
};

export const updateCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      customerName,
      mobileNumber,
      email,
      businessName,
      gstNumber,
      customerType,
      address,
      status,
      followUpDate,
      notes,
    } = req.body;

    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        customerName: customerName ?? existing.customerName,
        mobileNumber: mobileNumber ?? existing.mobileNumber,
        email: email ?? existing.email,
        businessName: businessName ?? existing.businessName,
        gstNumber: gstNumber !== undefined ? gstNumber : existing.gstNumber,
        customerType: customerType ?? existing.customerType,
        address: address ?? existing.address,
        status: status ?? existing.status,
        followUpDate: followUpDate ? new Date(followUpDate) : existing.followUpDate,
        notes: notes !== undefined ? notes : existing.notes,
      },
    });

    res.json({
      message: 'Customer updated successfully',
      customer: updated,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update customer' });
  }
};

export const addFollowUpNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { note, nextFollowUpDate } = req.body;

    if (!note || note.trim() === '') {
      res.status(400).json({ error: 'Follow-up note content is required' });
      return;
    }

    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    const createdBy = req.user ? `${req.user.name} (${req.user.role})` : 'System User';

    const followUp = await prisma.followUpNote.create({
      data: {
        customerId: id,
        note,
        createdBy,
      },
    });

    if (nextFollowUpDate) {
      await prisma.customer.update({
        where: { id },
        data: { followUpDate: new Date(nextFollowUpDate) },
      });
    }

    res.status(201).json({
      message: 'Follow-up note added successfully',
      followUp,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to add follow-up note' });
  }
};
