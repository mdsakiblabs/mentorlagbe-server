import { ObjectId } from "mongodb";
import { getCollections } from "../config/collections.js";

// Update logged-in user's profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, bio, image } = req.body;

    const updates = {};

    if (name !== undefined) {
      if (
        typeof name !== "string" ||
        name.trim().length < 2 ||
        name.trim().length > 80
      ) {
        return res.status(400).json({
          success: false,
          message: "Name must be between 2 and 80 characters.",
        });
      }

      updates.name = name.trim();
    }

    if (phone !== undefined) {
      if (typeof phone !== "string" || phone.length > 20) {
        return res.status(400).json({
          success: false,
          message:
            "Phone number must be a valid string with a maximum of 20 characters.",
        });
      }

      updates.phone = phone.trim();
    }

    if (bio !== undefined) {
      if (typeof bio !== "string" || bio.length > 500) {
        return res.status(400).json({
          success: false,
          message: "Bio must be a string with a maximum of 500 characters.",
        });
      }

      updates.bio = bio.trim();
    }

    if (image !== undefined) {
      if (typeof image !== "string") {
        return res.status(400).json({
          success: false,
          message: "Profile image must be a valid URL.",
        });
      }

      if (image.trim() !== "") {
        try {
          const imageURL = new URL(image);

          if (!["http:", "https:"].includes(imageURL.protocol)) {
            throw new Error("Invalid protocol");
          }
        } catch {
          return res.status(400).json({
            success: false,
            message: "Profile image must be a valid HTTP or HTTPS URL.",
          });
        }
      }

      updates.image = image.trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one profile field to update.",
      });
    }

    const { users } = getCollections();

    const result = await users.updateOne(
      { _id: new ObjectId(req.user.id) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
    }

    const updatedUser = await users.findOne(
      { _id: new ObjectId(req.user.id) },
      {
        projection: {
          name: 1,
          email: 1,
          phone: 1,
          bio: 1,
          image: 1,
          role: 1,
          plan: 1,
        },
      },
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Profile update error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update profile.",
    });
  }
};
