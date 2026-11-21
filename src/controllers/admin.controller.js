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

// Get all payment records - Admin only
export const getAllPayments = async (req, res) => {
  try {
    const { payments } = getCollections();

    const allPayments = await payments
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const totalAmount = allPayments.reduce(
      (total, payment) => total + (payment.amount || 0),
      0,
    );

    res.status(200).json({
      success: true,
      total: allPayments.length,
      totalAmount,
      data: allPayments,
    });
  } catch (error) {
    console.error("Get all payments error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch payment records.",
    });
  }
};

// Get all users - Admin only
export const getAllUsers = async (req, res) => {
  try {
    const { users } = getCollections();

    const allUsers = await users
      .find(
        {},
        {
          projection: {
            name: 1,
            email: 1,
            role: 1,
            plan: 1,
            phone: 1,
            bio: 1,
            image: 1,
            createdAt: 1,
          },
        },
      )
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      total: allUsers.length,
      data: allUsers,
    });
  } catch (error) {
    console.error("Get all users error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch users.",
    });
  }
};

// Update user role - Admin only
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    if (!["student", "tutor"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be student or tutor.",
      });
    }

    if (req.user.id === userId) {
      return res.status(403).json({
        success: false,
        message: "You cannot change your own role.",
      });
    }

    const { users } = getCollections();
    const targetUser = await users.findOne({
      _id: new ObjectId(userId),
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (targetUser.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin role cannot be changed.",
      });
    }

    const result = await users.updateOne(
      {
        _id: new ObjectId(userId),
        role: { $in: ["student", "tutor"] },
      },
      {
        $set: {
          role,
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return res.status(409).json({
        success: false,
        message: "User role could not be updated.",
      });
    }

    res.status(200).json({
      success: true,
      message: `User role updated to ${role} successfully.`,
    });
  } catch (error) {
    console.error("Update user role error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update user role.",
    });
  }
};

// Get admin dashboard statistics - Admin only
export const getAdminStats = async (req, res) => {
  try {
    const { users, tuitions, payments } = getCollections();

    const [
      totalUsers,
      totalTutors,
      pendingTuitions,
      approvedTuitions,
      revenueResult,
    ] = await Promise.all([
      users.countDocuments(),
      users.countDocuments({ role: "tutor" }),
      tuitions.countDocuments({ approvalStatus: "pending" }),
      tuitions.countDocuments({ approvalStatus: "approved" }),
      payments
        .aggregate([
          {
            $match: {
              status: "paid",
              currency: "usd",
            },
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$amount" },
            },
          },
        ])
        .toArray(),
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalTutors,
        pendingTuitions,
        approvedTuitions,
        totalRevenue,
        currency: "usd",
      },
    });
  } catch (error) {
    console.error("Get admin stats error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch admin dashboard statistics.",
    });
  }
};
