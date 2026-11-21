import express from "express";
import { createCheckoutSession } from "../controllers/payment.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/create-checkout-session", verifyToken, createCheckoutSession);

export default router;
