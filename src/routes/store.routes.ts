import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { machineMiddleware } from '../middleware/machine';
import { listStores, createStore, getStore, updateStore, deleteStore, createFund } from '../controllers/store.controllers';
import { getFunds } from '../controllers/fund.controllers';
import { zValidator } from '@hono/zod-validator';
import { storeSchema, storeUpdateSchema } from '../types/store';
import { fundSchema } from '../types/fund';

const storeRoutes = new Hono();

// Protected routes
storeRoutes.use('*', authMiddleware);
storeRoutes.use('*', machineMiddleware);

// Store management routes
storeRoutes.get('/', listStores);
storeRoutes.post('/', zValidator('json', storeSchema), createStore);
storeRoutes.get('/:id', getStore);
storeRoutes.put('/:id', zValidator('json', storeUpdateSchema), updateStore);
storeRoutes.delete('/:id', deleteStore);

// Fund management routes
storeRoutes.get('/:storeId/funds', getFunds);
storeRoutes.post('/:storeId/funds', zValidator('json', fundSchema), createFund);

export default storeRoutes;
