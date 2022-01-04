/* eslint-disable no-unused-vars */
import { Router } from 'express';
import * as authController from '../controllers/auth.js';
import * as mainController from '../controllers/main.js';
const router = Router();

router.post('/api/auth', function (req, res) {
	authController.getLinkToken;
});
router.post('/api/auth/token', function (req, res) {
	authController.getTokenGoogle;
});
router.post('/api/execute', function (req, res) {
	mainController.execute;
});

export { router };