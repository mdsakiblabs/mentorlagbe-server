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
