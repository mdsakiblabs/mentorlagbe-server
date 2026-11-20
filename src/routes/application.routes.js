import express from "express";

import { createApplication } from "../controllers/application.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyStudent } from "../middlewares/verifyRole.js";

const router = express.Router();

// Apply for a tuition - Student only
router.post("/:tuitionId", verifyToken, verifyStudent, createApplication);

export default router;
