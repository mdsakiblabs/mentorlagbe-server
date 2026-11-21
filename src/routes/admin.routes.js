import express from "express";

import {
  getPendingTuitions,
  updateTuitionApproval,
} from "../controllers/admin.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyAdmin } from "../middlewares/verifyRole.js";

const router = express.Router();

// Get pending tuitions - Admin only
router.get("/pending-tuitions", verifyToken, verifyAdmin, getPendingTuitions);

// Approve or reject a tuition - Admin only
router.patch(
  "/tuitions/:tuitionId/status",
  verifyToken,
  verifyAdmin,
  updateTuitionApproval,
);

export default router;
