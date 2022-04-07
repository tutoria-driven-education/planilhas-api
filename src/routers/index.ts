import { Router } from "express";
import { routerApi } from "./api";

const router = Router();

router.use("/api", routerApi);

export { router };
