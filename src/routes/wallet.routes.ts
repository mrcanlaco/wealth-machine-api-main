import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { machineMiddleware } from '../middleware/machine';
import { createWallet, getWallets, getWalletById, updateWallet, deleteWallet, updateBalance, getTransactions } from '../controllers/wallet.controllers';
import { zValidator } from '@hono/zod-validator';
import { walletSchema, walletUpdateSchema, walletUpdateBalanceSchema } from '../types/wallet';

const walletRoutes = new Hono();

// Protected routes
walletRoutes.use('*', authMiddleware);
walletRoutes.use('*', machineMiddleware);

// Wallet management routes
walletRoutes.get('/', getWallets);
walletRoutes.post('/', zValidator('json', walletSchema), createWallet);
walletRoutes.get('/:walletId', getWalletById);
walletRoutes.put('/:walletId', zValidator('json', walletUpdateSchema), updateWallet);
walletRoutes.delete('/:walletId', deleteWallet);

// Wallet balance and transaction routes
walletRoutes.post('/:walletId/balance', zValidator('json', walletUpdateBalanceSchema), updateBalance);
walletRoutes.get('/:walletId/transactions', getTransactions);

export default walletRoutes;
