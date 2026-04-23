// routes/contactQueryRoutes.js
import { Router } from 'express';
import {
    submitContactQuery,
    getContactQueries,
    updateQueryStatus,
    deleteQuery,
    getQueryStats
} from '../controllers/contactQuery.controller.js';
import { auth, authAdmin } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/permission.middleware.js';

const contactQueryRouter = Router();

// Public route - submit contact form
contactQueryRouter.post('/submit', submitContactQuery);

// Admin routes
contactQueryRouter.get('/admin/queries', auth, authAdmin, requirePermission("manage_inquiries"), getContactQueries);
contactQueryRouter.put('/admin/queries/:queryId', auth, authAdmin, requirePermission("manage_inquiries"), updateQueryStatus);
contactQueryRouter.delete('/admin/queries/:queryId', auth, authAdmin, requirePermission("manage_inquiries"), deleteQuery);
contactQueryRouter.get('/admin/queries/stats', auth, authAdmin, requirePermission("manage_inquiries"), getQueryStats);

export default contactQueryRouter;