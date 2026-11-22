import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";
import imageUploadRoutes from "./routes/imageUpload.routes.js";
import { connectDB } from "./config/db.js";
import { createAuth } from "./config/auth.js";
import adminRoutes from "./routes/admin.routes.js";
import tuitionRoutes from "./routes/tuition.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import { handleStripeWebhook } from "./controllers/payment.controller.js";
import { getCollections } from "./config/collections.js";
import profileRoutes from "./routes/profile.routes.js";
import multer from "multer";

dotenv.config();

const app = express();

// CORS middleware
app.use(cors());

// Test route
app.get("/", (req, res) => {
  res.send("MentorLagbe API is running!");
});

// Start server after database connection
const startServer = async () => {
  try {
    await connectDB();

    const { payments } = getCollections();

    const paymentIndexes = await payments.indexes();
    const oldPaymentIndex = paymentIndexes.find(
      (index) => index.name === "sessionId_1",
    );

    if (oldPaymentIndex) {
      await payments.dropIndex("sessionId_1");
    }

    await payments.createIndex(
      { stripeSessionId: 1 },
      {
        unique: true,
        partialFilterExpression: {
          stripeSessionId: { $type: "string" },
        },
      },
    );

    const { applications } = getCollections();

    await applications.createIndex(
      { tuitionId: 1, studentEmail: 1 },
      { unique: true },
    );

    const auth = createAuth();

    // Better Auth handler (Express 5)
    app.all("/api/auth/{*any}", toNodeHandler(auth));

    app.use("/api/upload-image", imageUploadRoutes);

    app.post(
      "/api/payments/webhook",
      express.raw({ type: "application/json" }),
      handleStripeWebhook,
    );
    // Body parser for API routes
    app.use(express.json());

    // Tuition routes
    app.use("/api/tuitions", tuitionRoutes);

    // Application routes
    app.use("/api/applications", applicationRoutes);

    app.use("/api/admin", adminRoutes);

    app.use("/api/payments", paymentRoutes);

    app.use("/api/profile", profileRoutes);

    // Global error handler
    app.use((error, req, res, next) => {
      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({
            success: false,
            message: "Image size must not exceed 5 MB.",
          });
        }

        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message === "Only image files are allowed.") {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      console.error("Unhandled server error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    });

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`MentorLagbe server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
