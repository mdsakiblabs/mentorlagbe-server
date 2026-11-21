import { ObjectId } from "mongodb";
import { getCollections } from "../config/collections.js";

// Get all pending tuitions - Admin only
export const getPendingTuitions = async (req, res) => {
  try {
    const { tuitions } = getCollections();

    const pendingTuitions = await tuitions
      .find({
        approvalStatus: "pending",
      })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      total: pendingTuitions.length,
      data: pendingTuitions,
    });
  } catch (error) {
    console.error("Get pending tuitions error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch pending tuitions.",
    });
  }
};

// Approve or reject a tuition - Admin only
export const updateTuitionApproval = async (req, res) => {
  try {
    const { tuitionId } = req.params;
    const { status } = req.body;

    if (!ObjectId.isValid(tuitionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tuition ID.",
      });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected.",
      });
    }

    const { tuitions } = getCollections();

    const tuition = await tuitions.findOne({
      _id: new ObjectId(tuitionId),
    });

    if (!tuition) {
      return res.status(404).json({
        success: false,
        message: "Tuition not found.",
      });
    }

    if (tuition.approvalStatus !== "pending") {
      return res.status(409).json({
        success: false,
        message: "This tuition has already been reviewed.",
      });
    }

    const result = await tuitions.updateOne(
      {
        _id: new ObjectId(tuitionId),
        approvalStatus: "pending",
      },
      {
        $set: {
          approvalStatus: status,
          reviewedAt: new Date(),
          reviewedBy: req.user.email,
        },
      },
    );

    if (result.modifiedCount === 0) {
      return res.status(409).json({
        success: false,
        message: "This tuition has already been reviewed.",
      });
    }

    res.status(200).json({
      success: true,
      message: `Tuition ${status} successfully.`,
    });
  } catch (error) {
    console.error("Update tuition approval error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update tuition approval status.",
    });
  }
};
