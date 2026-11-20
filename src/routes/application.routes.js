import express from "express";

import {
  createApplication,
  getMyApplications,
  getTutorApplications,
} from "../controllers/application.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyStudent, verifyTutor } from "../middlewares/verifyRole.js";

const router = express.Router();

router.get("/my-applications", verifyToken, verifyStudent, getMyApplications);

// Get applications received by the logged-in tutor
router.get(
  "/tutor-applications",
  verifyToken,
  verifyTutor,
  getTutorApplications,
);

// Apply for a tuition - Student only
router.post("/:tuitionId", verifyToken, verifyStudent, createApplication);

export default router;
