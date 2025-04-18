import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';
import { swaggerConfig } from './docs/swagger';
import { errorHandler } from './utils/error.handler';

// Import routes
import authRoutes from './routes/auth.routes';
import machineRoutes from './routes/machine.routes';
import storeRoutes from './routes/store.routes';
import fundRoutes from './routes/fund.routes';
import walletRoutes from './routes/wallet.routes';
import transactionRoutes from './routes/transaction.routes';
import chatRoutes from './routes/chat.routes';
import configRoutes from './routes/config.routes';
import reportRoutes from './routes/report.routes';
import memberRoutes from './routes/member.routes';
import postRoutes from './routes/post.routes';

const app = new Hono();

// Global middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', secureHeaders());
app.use('*', cors({
  origin: (origin) => {
    return origin;
  }, // Chấp nhận request từ bất kỳ origin nào gửi đến
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Machine-Id'],
  exposeHeaders: ['Content-Length', 'Content-Type'],
  credentials: true,
  maxAge: 86400,
}));

// Global error handler
app.onError(errorHandler);

// Documentation
app.get('/docs', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>API Documentation</title>
      </head>
      <body>
        <div id="redoc"></div>
        <script src="https://cdn.jsdelivr.net/npm/redoc@next/bundles/redoc.standalone.js"></script>
        <script>
          Redoc.init('/api-spec', {
            theme: {
              colors: {
                primary: {
                  main: '#2196f3'
                }
              }
            }
          }, document.getElementById('redoc'))
        </script>
      </body>
    </html>
  `)
})
app.get('/api-spec', (c) => c.json(swaggerConfig));

// Routes
app.route('/api/config', configRoutes);
app.route('/api/auth', authRoutes);
app.route('/api/machine', machineRoutes);
app.route('/api/stores', storeRoutes);
app.route('/api/funds', fundRoutes);
app.route('/api/wallets', walletRoutes);
app.route('/api/transactions', transactionRoutes);
app.route('/api/chats', chatRoutes);
app.route('/api/reports', reportRoutes);
app.route('/api/members', memberRoutes);
app.route('/api/posts', postRoutes);

// Health check endpoint
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

const port = parseInt(process.env.PORT || '3000', 10);
console.log(`Server is running on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};
