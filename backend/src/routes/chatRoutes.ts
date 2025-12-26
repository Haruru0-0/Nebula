import express from 'express';
import * as chatController from '../controllers/chatController';
import { authenticate } from '../middlewares/authMiddleware';
import { validate, schemas } from '../middlewares/validation';

const router = express.Router();

router.use(authenticate);

router.post('/:agentId', validate(schemas.sendMessage), chatController.chat);
router.get('/:agentId/conversations', chatController.getConversations);
router.get('/conversations/:conversationId/get', chatController.getConversationById);
router.patch('/conversations/:conversationId', chatController.updateConversation);
router.delete('/conversations/:conversationId/delete', chatController.deleteConversation);

export default router;