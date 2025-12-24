import express from 'express';
import * as chatController from '../controllers/chatController';
import { authenticate } from '../middlewares/authMiddleware';
import { validate, schemas } from '../middlewares/validation';

const router = express.Router();

router.use(authenticate);

router.post('/:agentId/chat', validate(schemas.sendMessage), chatController.chat);
router.get('/:agentId/conversations', chatController.getConversations);
router.get('/conversations/:conversationId', chatController.getConversationById);
router.delete('/conversations/:conversationId', chatController.deleteConversation);

export default router;