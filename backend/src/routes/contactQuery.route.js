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

const contactQueryRouter = Router();

// Public route - submit contact form
contactQueryRouter.post('/submit', submitContactQuery);

// Admin routes
contactQueryRouter.get('/admin/queries', auth, authAdmin, getContactQueries);
contactQueryRouter.put('/admin/queries/:queryId', auth, authAdmin, updateQueryStatus);
contactQueryRouter.delete('/admin/queries/:queryId', auth, authAdmin, deleteQuery);
contactQueryRouter.get('/admin/queries/stats', auth, authAdmin, getQueryStats);

export default contactQueryRouter;