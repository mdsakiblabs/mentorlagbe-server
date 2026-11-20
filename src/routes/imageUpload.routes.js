import express from "express";

import { uploadImage } from "../controllers/imageUpload.controller.js";
import upload from "../middlewares/upload.middleware.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyTutor } from "../middlewares/verifyRole.js";

const router = express.Router();

// Upload image - Tutor only
router.post("/", verifyToken, verifyTutor, upload.single("image"), uploadImage);

export default router;
