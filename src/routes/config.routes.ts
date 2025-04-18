import { Hono } from 'hono';
import { getTemplate } from '../controllers/config.controllers';

const configRoutes = new Hono();

/**
 * @route GET /api/config/template
 * @desc Get default template for machine initialization
 * @access Public
 */
// Config routes
configRoutes.get('/template', getTemplate);

export default configRoutes;