import { ObjectId } from "mongodb";
import { getCollections } from "../config/collections.js";

// Create a new tuition application
export const createApplication = async (req, res) => {
  try {
    const { tuitionId } = req.params;
    const { preferredSchedule, studentNote } = req.body;

    // Validate tuition ID
    if (!ObjectId.isValid(tuitionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tuition ID.",
      });
    }

    // Validate preferred schedule
    if (
      !preferredSchedule ||
      typeof preferredSchedule !== "string" ||
      !preferredSchedule.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Preferred schedule is required.",
      });
    }

    const { users, tuitions, applications } = getCollections();

    // Find the logged-in student
    const student = await users.findOne({
      email: req.user.email,
      role: "student",
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found.",
      });
    }

    // Find an approved and active tuition
    const tuition = await tuitions.findOne({
      _id: new ObjectId(tuitionId),
      approvalStatus: "approved",
      isActive: true,
    });

    if (!tuition) {
      return res.status(404).json({
        success: false,
        message: "Tuition not found or is not available.",
      });
    }

    // Prevent duplicate applications
    const existingApplication = await applications.findOne({
      tuitionId: new ObjectId(tuitionId),
      studentEmail: student.email,
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this tuition.",
      });
    }

    // Create application
    const newApplication = {
      tuitionId: new ObjectId(tuitionId),
      tuitionTitle: tuition.title,
      subject: tuition.subject,
      monthlyFee: tuition.monthlyFee,
      tutorEmail: tuition.tutorEmail,
      studentName: student.name,
      studentEmail: student.email,
      studentPhone: student.phone || "",
      preferredSchedule: preferredSchedule.trim(),
      studentNote: typeof studentNote === "string" ? studentNote.trim() : "",
      status: "pending",
      appliedAt: new Date(),
    };

    const result = await applications.insertOne(newApplication);

    res.status(201).json({
      success: true,
      message: "Tuition application submitted successfully.",
      data: {
        _id: result.insertedId,
        ...newApplication,
      },
    });
  } catch (error) {
    console.error("Create application error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to submit tuition application.",
    });
  }
};

// Get all applications submitted by the logged-in student
export const getMyApplications = async (req, res) => {
  try {
    const { applications } = getCollections();

    const myApplications = await applications
      .find({
        studentEmail: req.user.email,
      })
      .sort({ appliedAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      total: myApplications.length,
      data: myApplications,
    });
  } catch (error) {
    console.error("Get my applications error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch your applications.",
    });
  }
};

// Get all applications received by the logged-in tutor
export const getTutorApplications = async (req, res) => {
  try {
    const { applications } = getCollections();

    const tutorApplications = await applications
      .find({
        tutorEmail: req.user.email,
      })
      .sort({ appliedAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      total: tutorApplications.length,
      data: tutorApplications,
    });
  } catch (error) {
    console.error("Get tutor applications error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch tutor applications.",
    });
  }
};

// Update application status - Tutor only
export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    // Validate application ID
    if (!ObjectId.isValid(applicationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID.",
      });
    }

    // Validate status
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be accepted or rejected.",
      });
    }

    const { applications } = getCollections();

    // Find application belonging to the logged-in tutor
    const application = await applications.findOne({
      _id: new ObjectId(applicationId),
      tutorEmail: req.user.email,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found or you do not own this application.",
      });
    }

    // Only pending applications can be updated
    if (application.status !== "pending") {
      return res.status(409).json({
        success: false,
        message: "This application has already been processed.",
      });
    }

    await applications.updateOne(
      {
        _id: new ObjectId(applicationId),
        tutorEmail: req.user.email,
        status: "pending",
      },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
    );

    res.status(200).json({
      success: true,
      message: `Application ${status} successfully.`,
    });
  } catch (error) {
    console.error("Update application status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update application status.",
    });
  }
};

// Cancel a pending application - Student only
export const cancelApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    if (!ObjectId.isValid(applicationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID.",
      });
    }

    const { applications } = getCollections();

    const result = await applications.deleteOne({
      _id: new ObjectId(applicationId),
      studentEmail: req.user.email,
      status: "pending",
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Pending application not found or you do not own this application.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Application cancelled successfully.",
    });
  } catch (error) {
    console.error("Cancel application error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to cancel application.",
    });
  }
};

// Get dashboard statistics for the logged-in student
export const getStudentStats = async (req, res) => {
  try {
    const { users, applications } = getCollections();

    // Find the logged-in student's current plan
    const student = await users.findOne(
      {
        email: req.user.email,
        role: "student",
      },
      {
        projection: {
          plan: 1,
        },
      },
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found.",
      });
    }

    // Count only this student's applications
    const [totalApplied, acceptedApplications, pendingApplications] =
      await Promise.all([
        applications.countDocuments({
          studentEmail: req.user.email,
        }),
        applications.countDocuments({
          studentEmail: req.user.email,
          status: "accepted",
        }),
        applications.countDocuments({
          studentEmail: req.user.email,
          status: "pending",
        }),
      ]);

    res.status(200).json({
      success: true,
      data: {
        totalApplied,
        acceptedApplications,
        pendingApplications,
        currentPlan: student.plan || "free",
      },
    });
  } catch (error) {
    console.error("Get student stats error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch student dashboard statistics.",
    });
  }
};
