import express from 'express';
import * as authController from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddleware';
import { validate, schemas } from '../middlewares/validation';

const router = express.Router();

router.post('/signup', validate(schemas.signUp), authController.signUp);
router.post('/signin', validate(schemas.signIn), authController.signIn);
router.post('/forgot-password', validate(schemas.forgotPassword), authController.forgotPassword);
router.post('/reset-password', validate(schemas.resetPassword), authController.resetPassword);
router.get('/profile', authenticate, authController.getProfile);

export default router;