import express from "express";

import {
  getAllTuitions,
  getTuitionById,
  createTuition,
  getMyTuitions,
  updateMyTuition,
  deleteMyTuition,
} from "../controllers/tuition.controller.js";

import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyTutor } from "../middlewares/verifyRole.js";

const router = express.Router();

// Public routes
router.get("/", getAllTuitions);
router.get("/my-tuitions", verifyToken, verifyTutor, getMyTuitions);
router.get("/:id", getTuitionById);

// Protected route - Tutor only
router.post("/", verifyToken, verifyTutor, createTuition);

// Update tuition - Tutor only
router.patch("/:id", verifyToken, verifyTutor, updateMyTuition);

// Delete tuition - Tutor only
router.delete("/:id", verifyToken, verifyTutor, deleteMyTuition);

export default router;
