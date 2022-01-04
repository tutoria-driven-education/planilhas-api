import * as authService from '../services/auth.js';

export async function getLinkToken(req, res) {
  const { email, password } = req.body;

  if (email !== process.env.APP_LOGIN || password !== process.env.APP_PASSWORD) {
    return res.sendStatus(401);
  }

  const link = await authService.getLinkToken();

  return res.send({ link });
}

export async function getTokenGoogle(req, res) {
  const { code } = req.body;
  if (!code) return res.sendStatus(400);
  const token = await authService.getTokenGoogle(code);

  return res.send({ token });
}
