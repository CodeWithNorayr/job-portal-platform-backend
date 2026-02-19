import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";
import userRouter from "./routes/userRoute.js";
import userdataRouter from "./routes/userdataRoute.js";
import jobRouter from "./routes/jobRoute.js";
import companyRouter from "./routes/companyRoute.js";
import companydataRouter from "./routes/companydataRoute.js";
import applicationRouter from "./routes/applications.js";
import cloudinary from "./config/cloudinary.js";

// Initialize Express app
const app = express();

// PORT
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json()); // parse JSON bodies
app.use(
  cors({
    origin: "https://job-portal-platform-frontend-xzac.onrender.com",
    credentials: true,
  })
);

// ========================
// Routes
// ========================
app.use("/api/userdetails", userRouter);
app.use("/api/userdata", userdataRouter);
app.use("/api/jobdata", jobRouter);
app.use("/api/companydata", companyRouter);
app.use("/api/companydatas", companydataRouter);
app.use("/api/view", applicationRouter);

// Root endpoint
app.get("/", (_, res) => {
  res.send("API is working successfully");
});

// ========================
// Start Server
// ========================
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log("MongoDB connected successfully");

    // Test Cloudinary connection
    await cloudinary.api.ping();
    console.log("Cloudinary connected successfully");

    // Start Express
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Startup error:", error.message);
    process.exit(1);
  }
};

startServer();
