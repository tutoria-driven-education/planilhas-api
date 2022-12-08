import { Router } from "express";
import * as authController from "../controllers/auth.js";
import * as mainController from "../controllers/main.js";
import { logger } from "../utils/logger.js";
const router = Router();

router.get("/", (req, res) => {
  return res.send("Rodando");
});

router.post("/auth", authController.getLinkToken);
router.post("/api/auth/token", authController.getTokenGoogle);

router.post("/execute", mainController.execute);
router.post("/update", mainController.updateSheet);
router.post("/control", mainController.updateControl);
router.post("/career", mainController.executeCarrer);
router.post("/flags", mainController.updateFlags);

// router.

router.get(
  "/students-attendance",
  mainController.getStudentsUnderNinetyPercent
);

router.get("/log", (req, res) => {
  logger.info("Adicionando no info");
  logger.error("Adicionando nao error");
  return res.send("Hello world");
});

export { router };
