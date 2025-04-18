import { Context } from 'hono';
import { defaultStores, defaultWallets } from '../config/template';

export const getTemplate = async (c: Context) => {
  try {
    return c.json({
      success: true,
      data: {
        stores: defaultStores,
        wallets: defaultWallets
      }
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Internal server error'
    }, 500);
  }
};
