import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { machineMiddleware } from '../middleware/machine';
import { createConversation, listConversations, getConversation, deleteConversation, sendMessage, getMessages, askAssistant, analyzeFinances } from '../controllers/chat.controllers';
import { zValidator } from '@hono/zod-validator';
import { messageSchema } from '../types/chat';

const chatRoutes = new Hono();

// Protected routes
chatRoutes.use('*', authMiddleware);
chatRoutes.use('*', machineMiddleware);

// Chat routes
chatRoutes.post('/', createConversation);
chatRoutes.get('/', listConversations);
chatRoutes.get('/:id', getConversation);
chatRoutes.delete('/:id', deleteConversation);

// Message routes
chatRoutes.get('/:id/messages', getMessages);
chatRoutes.post('/:id/messages', zValidator('json', messageSchema), sendMessage);

// AI Assistant routes
chatRoutes.post('/assistant', askAssistant);
chatRoutes.post('/analyze', analyzeFinances);
// chatRoutes.get('/analysis', getAnalysis);

export default chatRoutes;
