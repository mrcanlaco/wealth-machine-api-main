import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { machineMiddleware } from '../middleware/machine';
import { 
  getOverview, 
  getSummary,
  getCashFlow,
  getBalanceSheet,
  getIncomeStatement,
  getTrends,
  getCategoryAnalysis,
  getPredictions,
  exportReport
} from '../controllers/report.controllers';
import { zValidator } from '@hono/zod-validator';
import { exportReportSchema } from '../types/report';
const reportRoutes = new Hono();

// Protected routes
reportRoutes.use('*', authMiddleware);
reportRoutes.use('*', machineMiddleware);

// Report routes
reportRoutes.get('/overview', getOverview);
reportRoutes.get('/summary', getSummary);
reportRoutes.get('/cash-flow', getCashFlow);
reportRoutes.get('/balance-sheet', getBalanceSheet);
reportRoutes.get('/income-statement', getIncomeStatement);
reportRoutes.get('/trends', getTrends);
reportRoutes.get('/category-analysis', getCategoryAnalysis);
reportRoutes.get('/predictions', getPredictions);
reportRoutes.post('/export', zValidator('query', exportReportSchema), exportReport);

export default reportRoutes;
