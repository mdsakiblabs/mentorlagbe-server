import express from "express";

import {
  getAllTuitions,
  getTuitionById,
  createTuition,
  getMyTuitions,
  updateMyTuition,
  deleteMyTuition,
  updateTuitionStatus,
  getTutorStats,
} from "../controllers/tuition.controller.js";

import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyTutor } from "../middlewares/verifyRole.js";

const router = express.Router();

// Public routes
router.get("/", getAllTuitions);
router.get("/my-tuitions", verifyToken, verifyTutor, getMyTuitions);
// Tutor dashboard statistics - Tutor only
router.get("/my-stats", verifyToken, verifyTutor, getTutorStats);
router.get("/:id", getTuitionById);

// Protected route - Tutor only
router.post("/", verifyToken, verifyTutor, createTuition);

// Activate or close a tuition - Tutor only
router.patch("/:id/status", verifyToken, verifyTutor, updateTuitionStatus);

// Update tuition - Tutor only
router.patch("/:id", verifyToken, verifyTutor, updateMyTuition);

// Delete tuition - Tutor only
router.delete("/:id", verifyToken, verifyTutor, deleteMyTuition);

export default router;
