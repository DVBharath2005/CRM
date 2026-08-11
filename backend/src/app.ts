import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import productRoutes from './routes/productRoutes.js';
import challanRoutes from './routes/challanRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

export const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Anjali Enterprise - Operations Portal Backend API',
    timestamp: new Date().toISOString(),
  });
});

// Demo credentials list for quick login reference
app.get('/api/auth/demo-credentials', (req, res) => {
  res.json({
    roles: [
      { role: 'Admin', email: 'amit.verma@anjalienterprise.com', password: 'password123', name: 'Amit Verma (System Administrator)' },
      { role: 'Sales', email: 'rahul.sharma@anjalienterprise.com', password: 'password123', name: 'Rahul Sharma (Sales Lead)' },
      { role: 'Warehouse', email: 'vikram.singh@anjalienterprise.com', password: 'password123', name: 'Vikram Singh (Warehouse Head)' },
      { role: 'Accounts', email: 'priya.patel@anjalienterprise.com', password: 'password123', name: 'Priya Patel (Chief Accountant)' },
    ],
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/challans', challanRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling middleware
app.use(errorHandler);
