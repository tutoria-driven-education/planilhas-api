import { Request, Response } from "express";
import { Code, Login } from "types";
import * as authService from "../services/auth";

export async function getLinkToken(req: Request, res: Response) {
  const { email, password }: Login = req.body;

  if (
    email !== process.env.APP_LOGIN ||
    password !== process.env.APP_PASSWORD
  ) {
    return res.sendStatus(401);
  }

  const link: string = await authService.getLinkToken();

  return res.send({ link });
}

export async function getTokenGoogle(req: Request, res: Response) {
  const { code }: Code = req.body;
  if (!code) return res.sendStatus(400);
  const token = await authService.getTokenGoogle(code);

  return res.send({ token });
}
