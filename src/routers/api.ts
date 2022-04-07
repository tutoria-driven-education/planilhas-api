import { Router } from "express";
import * as authController from "../controllers/auth";
import * as robotController from "../controllers/robot";

const router = Router();

router.get("/test", (req, res) => {
  console.log("rodando...");
  return res.send("Rodando");
});

router.post("/auth", authController.getLinkToken);
router.post("/auth/token", authController.getTokenGoogle);

router.post("/execute", robotController.generateSpreadsheets);
router.post("/update", robotController.updateSheet);
export { router as routerApi };
