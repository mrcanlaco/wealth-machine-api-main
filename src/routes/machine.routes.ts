import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { machineMiddleware } from '../middleware/machine';
import { zValidator } from '@hono/zod-validator';
import { machineSchema, machineUpdateSchema, saveStoresFundsSchema } from '../types/machine';
import {
  getMachine,
  getMachineMinimal,
  createMachine,
  listMachines,
  updateMachine,
  deleteMachine,
  saveStoresFunds
} from '../controllers/machine.controllers';

const machineRoutes = new Hono();

// Auth middleware for all machine routes
machineRoutes.use('*', authMiddleware);

// Machine management routes
machineRoutes.get('/list', listMachines);
machineRoutes.post('/create', zValidator('json', machineSchema), createMachine);

machineRoutes.use('*', machineMiddleware);
machineRoutes.get('/', getMachine);
machineRoutes.get('/minimal', getMachineMinimal);

machineRoutes.put('/basic-info', zValidator('json', machineUpdateSchema), updateMachine);
machineRoutes.put('/stores-funds', zValidator('json', saveStoresFundsSchema), saveStoresFunds);

machineRoutes.delete('/', deleteMachine);

export default machineRoutes;
