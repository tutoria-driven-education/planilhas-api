import { Router } from 'express';
import * as authController from '../controllers/auth';
import * as mainController from '../controllers/main';

const router = Router();

router.get('/test', (req, res) => {
  // eslint-disable-next-line no-console
  console.log('rodando...');
  return res.send('Rodando');
});

router.post('/api/auth', authController.getLinkToken);
router.post('/api/auth/token', authController.getTokenGoogle);

router.post('/api/execute', mainController.execute);
export default { router };
