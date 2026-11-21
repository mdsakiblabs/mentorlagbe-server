import express from "express";
import { updateProfile } from "../controllers/profile.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

// Update logged-in user's profile
router.patch("/", verifyToken, updateProfile);

export default router;
