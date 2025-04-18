import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { machineMiddleware } from '../middleware/machine';
import { listMachineMembers, removeMachineMember, listMachineInvitations, createInvitation, acceptInvitation, rejectInvitation } from '../controllers/member.controllers';
import { zValidator } from '@hono/zod-validator';
import {  memberSchema } from '../types/member';

const memberRoutes = new Hono();

// Protected routes
memberRoutes.use('*', authMiddleware);
memberRoutes.post('/invitations/:invitationId/accept', acceptInvitation);
memberRoutes.post('/invitations/:invitationId/reject', rejectInvitation);

memberRoutes.use('*', machineMiddleware);
memberRoutes.get('/members', listMachineMembers);
memberRoutes.delete('/members/:memberId', removeMachineMember);
memberRoutes.get('/invitations', listMachineInvitations);
memberRoutes.post('/invitations', zValidator('json', memberSchema), createInvitation);


export default memberRoutes;
