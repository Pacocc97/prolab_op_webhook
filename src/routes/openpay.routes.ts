import { Router } from "express";
import {
  createChargeController,
  openPayCallbackController,
} from "../controllers/openpay.controller";

const router = Router();

// POST /openpay/create-charge
router.post("/create-charge", createChargeController);

// GET /openpay/callback
router.get("/callback", openPayCallbackController);

export default router;
