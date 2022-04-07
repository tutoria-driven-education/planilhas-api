import { Request, Response } from "express";
import * as authService from "../services/auth";

export async function getLinkToken(req: Request, res: Response) {
  const { email, password } = req.body;

  if (
    email !== process.env.APP_LOGIN ||
    password !== process.env.APP_PASSWORD
  ) {
    return res.status(401).send({ message: "Email or password incorrect!" });
  }
  try {
    const link = await authService.getLinkToken();
    return res.send({ link });
  } catch (error) {
    console.log("Error in getLinkToken function", error?.message);
    res.sendStatus(500);
  }
}

export async function getTokenGoogle(req: Request, res: Response) {
  const { code } = req.body;
  if (!code) {
    return res.status(400).send({ message: "Code is required!" });
  }
  try {
    const token = await authService.getTokenGoogle(code);

    return res.send({ token });
  } catch (error) {
    res.sendStatus(500);
  }
}
