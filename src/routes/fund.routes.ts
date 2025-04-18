import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { machineMiddleware } from '../middleware/machine';
import { getFunds, getFundById, createFund, updateFund, deleteFund, updateBalance, getFundTransactions } from '../controllers/fund.controllers';
import { zValidator } from '@hono/zod-validator';
import { fundSchema, fundUpdateSchema, balanceSchema } from '../types/fund';

const fundRoutes = new Hono();

// Protected routes
fundRoutes.use('*', authMiddleware);
fundRoutes.use('*', machineMiddleware);

// Fund management routes
fundRoutes.get('/', getFunds);
fundRoutes.post('/', zValidator('json', fundSchema), createFund);
fundRoutes.get('/:id', getFundById);
fundRoutes.put('/:id', zValidator('json', fundUpdateSchema), updateFund);
fundRoutes.delete('/:id', deleteFund);

// Fund balance routes
fundRoutes.put('/:id/balance', zValidator('json', balanceSchema), updateBalance);
fundRoutes.get('/:id/transactions', getFundTransactions);

export default fundRoutes;
