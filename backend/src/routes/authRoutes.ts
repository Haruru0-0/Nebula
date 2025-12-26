import express from 'express';
import * as authController from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddleware';
import { validate, schemas } from '../middlewares/validation';

const router = express.Router();

router.post('/signup', validate(schemas.signUp), authController.signUp);
router.post('/signin', validate(schemas.signIn), authController.signIn);
router.post('/verify-email', validate(schemas.verifyEmail), authController.verifyEmail);
router.post('/resend-verification', validate(schemas.resendVerification), authController.resendVerification);
router.post('/forgot-password', validate(schemas.forgotPassword), authController.forgotPassword);
router.post('/reset-password', validate(schemas.resetPassword), authController.resetPassword);
router.post('/change-password', authenticate, validate(schemas.changePassword), authController.changePassword);
router.get('/profile', authenticate, authController.getProfile);

export default router;