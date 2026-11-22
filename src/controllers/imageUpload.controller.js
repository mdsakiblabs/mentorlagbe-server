import { uploadImageToImgBB } from "../services/imageUpload.service.js";
import { fileTypeFromBuffer } from "file-type";
// Upload image
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image to upload.",
      });
    }

    const fileType = await fileTypeFromBuffer(req.file.buffer);

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!fileType || !allowedTypes.includes(fileType.mime)) {
      return res.status(400).json({
        success: false,
        message: "Only valid JPEG, PNG, and WebP images are allowed.",
      });
    }

    const imageUrl = await uploadImageToImgBB(req.file.buffer, fileType.ext);

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully.",
      data: {
        imageUrl,
      },
    });
  } catch (error) {
    console.error("Image upload error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to upload image.",
    });
  }
};
