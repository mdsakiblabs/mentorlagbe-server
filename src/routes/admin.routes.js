import express from "express";

import {
  getPendingTuitions,
  updateTuitionApproval,
  getAllPayments,
  getAllUsers,
  updateUserRole,
} from "../controllers/admin.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyAdmin } from "../middlewares/verifyRole.js";

const router = express.Router();

// Get pending tuitions - Admin only
router.get("/pending-tuitions", verifyToken, verifyAdmin, getPendingTuitions);

router.get("/payments", verifyToken, verifyAdmin, getAllPayments);

// Get all users - Admin only
router.get("/users", verifyToken, verifyAdmin, getAllUsers);

// Approve or reject a tuition - Admin only
router.patch(
  "/tuitions/:tuitionId/status",
  verifyToken,
  verifyAdmin,
  updateTuitionApproval,
);

// Update user role - Admin only
router.patch("/users/:userId/role", verifyToken, verifyAdmin, updateUserRole);

export default router;
