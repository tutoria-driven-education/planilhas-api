import { Router } from "express";
import * as authController from "../controllers/auth";
import * as mainController from "../controllers/main";
import { logger } from "../utils/logger";
const router = Router();

router.get("/test", (req, res) => {
  console.log("rodando...");
  return res.send("Rodando");
});

router.post("/api/auth", authController.getLinkToken);
router.post("/api/auth/token", authController.getTokenGoogle);

router.post("/api/execute", mainController.execute);
router.post("/api/update", mainController.updateSheet);
router.post("/api/control", mainController.updateControl);
router.post("/api/career", mainController.executeCarrer);

router.get(
  "/api/students-attendance",
  mainController.getStudentsUnderNinetyPercent
);

router.get("/log", (req, res) => {
  logger.info("Adicionando no info");
  logger.error("Adicionando nao error");
  return res.send("Hello world");
});

export { router };
