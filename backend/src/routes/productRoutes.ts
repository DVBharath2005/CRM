import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  adjustStock,
  getStockLogs,
} from '../controllers/productController.js';
import { authenticateToken, requireRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/stock-logs', requireRoles(['Admin', 'Warehouse', 'Sales', 'Accounts']), getStockLogs);
router.get('/', requireRoles(['Admin', 'Warehouse', 'Sales', 'Accounts']), getProducts);
router.get('/:id', requireRoles(['Admin', 'Warehouse', 'Sales', 'Accounts']), getProductById);
router.post('/', requireRoles(['Admin', 'Warehouse']), createProduct);
router.put('/:id', requireRoles(['Admin', 'Warehouse']), updateProduct);
router.post('/:id/stock-adjust', requireRoles(['Admin', 'Warehouse']), adjustStock);

export default router;
