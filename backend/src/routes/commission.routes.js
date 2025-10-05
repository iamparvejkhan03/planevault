import { Router } from 'express';
import {
    getCommissions,
    updateCommissions
} from '../controllers/commission.controller.js';
import { authAdmin } from '../middlewares/auth.middleware.js';

const commissionRouter = Router();

// All routes require admin authentication

commissionRouter.get('/', getCommissions);
commissionRouter.put('/', authAdmin, updateCommissions);

export default commissionRouter;