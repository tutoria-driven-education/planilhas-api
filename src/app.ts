import "./setup";
import express from "express";
import cors from "cors";
import { router } from "./routers/index";

const app = express();

app.use(express.json())
  .use(cors())
  .use(router);

export default app;
