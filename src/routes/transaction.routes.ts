import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { machineMiddleware } from '../middleware/machine';
import { zValidator } from '@hono/zod-validator';
import { 
  transactionSchema, 
  transactionUpdateSchema, 
  allocationSchema,
  transactionQuerySchema,
  transactionReportSchema 
} from '../types/transaction';
import { 
  getTransactions,
  getTransactionReport,  
  getTransactionById, 
  createTransaction, 
  updateTransaction, 
  deleteTransaction,
  allocateBalance} from '../controllers/transaction.controllers';

const transactionRoutes = new Hono();

// Protected routes
transactionRoutes.use('*', authMiddleware);
transactionRoutes.use('*', machineMiddleware);

// Transaction management routes
transactionRoutes.get('/', zValidator('query', transactionQuerySchema), getTransactions);
transactionRoutes.get('/report', zValidator('query', transactionReportSchema), getTransactionReport);
transactionRoutes.get('/:id', getTransactionById);
transactionRoutes.post('/', zValidator('json', transactionSchema), createTransaction);
transactionRoutes.put('/:id', zValidator('json', transactionUpdateSchema), updateTransaction);
transactionRoutes.delete('/:id', deleteTransaction);

// Allocation route
transactionRoutes.post('/allocate', zValidator('json', allocationSchema), allocateBalance);

export default transactionRoutes;
