import express from "express";

import {
  createApplication,
  getMyApplications,
} from "../controllers/application.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyStudent } from "../middlewares/verifyRole.js";

const router = express.Router();

router.get("/my-applications", verifyToken, verifyStudent, getMyApplications);

// Apply for a tuition - Student only
router.post("/:tuitionId", verifyToken, verifyStudent, createApplication);

export default router;
