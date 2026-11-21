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
