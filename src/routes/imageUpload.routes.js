import express from "express";

import { uploadImage } from "../controllers/imageUpload.controller.js";
import upload from "../middlewares/upload.middleware.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyTutor } from "../middlewares/verifyRole.js";

const router = express.Router();

// Upload tuition banner - Tutor only
router.post("/", verifyToken, verifyTutor, upload.single("image"), uploadImage);

// Upload profile picture - All authenticated users
router.post("/profile", verifyToken, upload.single("image"), uploadImage);

export default router;
