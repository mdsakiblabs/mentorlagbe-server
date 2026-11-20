import { ObjectId } from "mongodb";
import { getCollections } from "../config/collections.js";

// Get all approved and active tuitions
export const getAllTuitions = async (req, res) => {
  try {
    const { tuitions } = getCollections();

    const {
      search,
      subject,
      classLevel,
      mode,
      location,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {
      approvalStatus: "approved",
      isActive: true,
    };

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    if (subject) {
      filter.subject = subject;
    }

    if (classLevel) {
      filter.classLevel = classLevel;
    }

    if (mode) {
      filter.mode = mode;
    }

    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const pageLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));

    const skip = (currentPage - 1) * pageLimit;

    const [results, total] = await Promise.all([
      tuitions
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit)
        .toArray(),

      tuitions.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: currentPage,
      limit: pageLimit,
      totalPages: Math.ceil(total / pageLimit),
      data: results,
    });
  } catch (error) {
    console.error("Get all tuitions error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve tuitions.",
    });
  }
};

// Get a single approved tuition by ID
export const getTuitionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tuition ID.",
      });
    }

    const { tuitions } = getCollections();

    const tuition = await tuitions.findOne({
      _id: new ObjectId(id),
      approvalStatus: "approved",
      isActive: true,
    });

    if (!tuition) {
      return res.status(404).json({
        success: false,
        message: "Tuition not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: tuition,
    });
  } catch (error) {
    console.error("Get tuition details error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve tuition details.",
    });
  }
};

export const createTuition = async (req, res) => {
  try {
    if (req.user.role !== "tutor") {
      return res.status(403).json({
        success: false,
        message: "Only tutors can create tuition posts.",
      });
    }

    const {
      title,
      subject,
      classLevel,
      mode,
      location,
      monthlyFee,
      daysPerWeek,
      bannerImage,
      description,
    } = req.body;

    // Validate required fields
    if (
      !title?.trim() ||
      !subject?.trim() ||
      !classLevel?.trim() ||
      !mode ||
      monthlyFee === undefined ||
      daysPerWeek === undefined ||
      !description?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required tuition information.",
      });
    }

    if (!["Online", "Offline"].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: "Mode must be Online or Offline.",
      });
    }

    if (mode === "Offline" && !location?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Location is required for offline tuition.",
      });
    }

    const fee = Number(monthlyFee);
    const days = Number(daysPerWeek);

    if (!Number.isFinite(fee) || fee <= 0) {
      return res.status(400).json({
        success: false,
        message: "Monthly fee must be a positive number.",
      });
    }

    if (!Number.isInteger(days) || days < 1 || days > 7) {
      return res.status(400).json({
        success: false,
        message: "Days per week must be between 1 and 7.",
      });
    }

    const { users, tuitions } = getCollections();

    const tutor = await users.findOne({
      email: req.user.email,
    });

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor account not found.",
      });
    }

    // Free tutors can create a maximum of 2 tuition posts
    if (tutor.plan === "free") {
      const existingPosts = await tuitions.countDocuments({
        tutorEmail: tutor.email,
      });

      if (existingPosts >= 2) {
        return res.status(403).json({
          success: false,
          message:
            "Free plan allows only 2 tuition posts. Upgrade to Pro for unlimited posts.",
        });
      }
    }

    const newTuition = {
      title: title.trim(),
      subject: subject.trim(),
      classLevel: classLevel.trim(),
      mode,
      location: location?.trim() || "",
      monthlyFee: fee,
      daysPerWeek: days,
      bannerImage: bannerImage?.trim() || "",
      description: description.trim(),
      tutorName: tutor.name,
      tutorEmail: tutor.email,
      approvalStatus: "pending",
      isActive: true,
      createdAt: new Date(),
    };

    const result = await tuitions.insertOne(newTuition);

    res.status(201).json({
      success: true,
      message:
        "Tuition created successfully and is waiting for admin approval.",
      data: {
        _id: result.insertedId,
        ...newTuition,
      },
    });
  } catch (error) {
    console.error("Create tuition error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create tuition.",
    });
  }
};
