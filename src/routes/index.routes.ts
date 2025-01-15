import { Router } from "express";
import openpayRouter from "./openpay.routes";

const router = Router();

router.use("/openpay", openpayRouter);

export default router;
