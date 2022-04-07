import { Router } from "express";
import * as authController from "../controllers/auth.js";
import * as mainController from "../controllers/main.js";

const router = Router();

router.get("/test", (req, res) => {
  console.log("rodando...");
  return res.send("Rodando");
});

router.post("/auth", authController.getLinkToken);
router.post("/auth/token", authController.getTokenGoogle);

router.post("/execute", mainController.execute);
router.post("/update", mainController.updateSheet);
export { router as routerApi };
