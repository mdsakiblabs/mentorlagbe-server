import express from "express";

import {
  createApplication,
  getMyApplications,
  getTutorApplications,
  updateApplicationStatus,
  cancelApplication,
  getStudentStats,
} from "../controllers/application.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyStudent, verifyTutor } from "../middlewares/verifyRole.js";

const router = express.Router();

router.get("/my-applications", verifyToken, verifyStudent, getMyApplications);

router.get("/my-stats", verifyToken, verifyStudent, getStudentStats);

// Get applications received by the logged-in tutor
router.get(
  "/tutor-applications",
  verifyToken,
  verifyTutor,
  getTutorApplications,
);

// Cancel a pending application - Student only
router.delete("/:applicationId", verifyToken, verifyStudent, cancelApplication);

// Accept or reject an application - Tutor only
router.patch(
  "/:applicationId/status",
  verifyToken,
  verifyTutor,
  updateApplicationStatus,
);

// Apply for a tuition - Student only
router.post("/:tuitionId", verifyToken, verifyStudent, createApplication);

export default router;
