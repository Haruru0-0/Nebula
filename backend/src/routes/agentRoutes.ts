import express from 'express';
import * as agentController from '../controllers/agentController';
import { authenticate } from '../middlewares/authMiddleware';
import { validate, schemas } from '../middlewares/validation';

const router = express.Router();

router.use(authenticate);

router.post('/', validate(schemas.createAgent), agentController.createAgent);
router.get('/', agentController.getAgents);
router.get('/:id', agentController.getAgentById);
router.put('/:id', validate(schemas.updateAgent), agentController.updateAgent);
router.delete('/:id', agentController.deleteAgent);

export default router;