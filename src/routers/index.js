import { Router } from "express";
import * as authController from "../controllers/auth.js";
import * as mainController from "../controllers/main.js";
const router = Router();

router.get("/test", (req, res) => {
  console.log("rodando...");
  return res.send("Rodando");
});

router.post("/api/auth", authController.getLinkToken);
router.post("/api/auth/token", authController.getTokenGoogle);

router.post("/api/execute", mainController.execute);
router.post("/api/update", mainController.updateSheet);
export { router };
