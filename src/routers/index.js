/* eslint-disable no-unused-vars */
import { Router } from 'express';
import * as authController from '../controllers/auth.js';
import * as mainController from '../controllers/main.js';
import * as userController from '../controllers/user.js';

const router = Router();

router.post('/api/auth', authController.getLinkToken);
router.post('/api/auth/token', authController.getTokenGoogle);

router.post('/api/execute', mainController.execute);

router.post('/api/login', userController.login);

// We're disabling this for now
router.post('/api/user', userController.create);
router.get('/api/user', userController.getAll);
router.get('/api/userGroup', userController.getAllGroups);

export { router };