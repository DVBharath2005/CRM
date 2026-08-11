import { Router } from 'express';
import {
  getChallans,
  getChallanById,
  createChallan,
  updateChallanStatus,
} from '../controllers/challanController.js';
import { authenticateToken, requireRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', requireRoles(['Admin', 'Sales', 'Accounts', 'Warehouse']), getChallans);
router.get('/:id', requireRoles(['Admin', 'Sales', 'Accounts', 'Warehouse']), getChallanById);
router.post('/', requireRoles(['Admin', 'Sales']), createChallan);
router.patch('/:id/status', requireRoles(['Admin', 'Sales', 'Accounts', 'Warehouse']), updateChallanStatus);

export default router;
