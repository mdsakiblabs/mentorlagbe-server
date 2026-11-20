import { uploadImageToImgBB } from "../services/imageUpload.service.js";

// Upload image
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image to upload.",
      });
    }

    const imageUrl = await uploadImageToImgBB(req.file.buffer);

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
