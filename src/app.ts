import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/index.js";
import { authMiddleware } from "./middlewares/auth.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import githubRoutes from "./routes/github.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import portfolioRoutes from "./routes/portfolio.routes.js";
import blogRoutes from "./routes/blog.routes.js";
import { Repo } from "./models/Repo.js";
import jwt from "jsonwebtoken";
import { logger } from "./utils/logger.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });
  next();
});

// Public routes
app.get("/", (_, res) => {
  res.json({
    message: "Portfolio Backend API",
    version: "1.0.0",
    endpoints: {
      auth: "/auth/*",
      github: "/api/github/*",
      portfolio: "/api/portfolio/*",
      blog: "/api/blog/*",
      repos: "/api/repos/*",
      token: "/token",
    },
    github: {
      configured: !!(process.env.GITHUB_USERNAME && process.env.GITHUB_TOKEN),
      username: process.env.GITHUB_USERNAME || "Not configured"
    }
  });
});

// Public route to get a test token
app.get("/token", (_, res) => {
  const token = jwt.sign(
    { userId: "test-user", role: "admin" },
    process.env.JWT_SECRET as string,
    { expiresIn: "1h" }
  );
  res.json({ token, message: "Test token generated" });
});

// Auth routes
app.use("/auth", authRoutes);

// Admin routes
app.use("/admin", adminRoutes);

// Portfolio routes
app.use("/api/portfolio", portfolioRoutes);

// Blog routes
app.use("/api/blog", blogRoutes);

// Protected API routes
app.use("/api/github", githubRoutes);

// Repos API routes
app.get("/api/repos", async (req, res) => {
  try {
    const {
      provider,
      featured,
      hidden,
      language,
      limit = 50,
      offset = 0,
    } = req.query;

    const query: any = {};
    if (provider) query.provider = provider;
    if (featured !== undefined) query.isFeatured = featured === "true";
    if (hidden !== undefined) query.hidden = hidden === "true";
    if (language) query.language = language;

    const repos = await Repo.find(query)
      .sort({ fetchedAt: -1 })
      .limit(Number(limit))
      .skip(Number(offset))
      .select("-raw"); // Exclude raw data from public API

    const total = await Repo.countDocuments(query);

    res.json({
      repos,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: Number(offset) + repos.length < total,
      },
    });
  } catch (error) {
    logger.error("Error fetching repos:", error);
    res.status(500).json({ error: "Failed to fetch repositories" });
  }
});

// Protected repo management routes
app.patch("/api/repos/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Only allow certain fields to be updated
    const allowedUpdates = ["isFeatured", "hidden", "title", "description"];
    const filteredUpdates = Object.keys(updates)
      .filter((key) => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {} as any);

    const repo = await Repo.findByIdAndUpdate(
      id,
      { $set: filteredUpdates },
      { new: true }
    );

    if (!repo) {
      return res.status(404).json({ error: "Repository not found" });
    }

    res.json(repo);
  } catch (error) {
    logger.error("Error updating repo:", error);
    res.status(500).json({ error: "Failed to update repository" });
  }
});

// Protected route example
app.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You are authorized",
    user: (req as any).user,
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Initialize database connection
connectDB().catch((error) => {
  logger.error("Failed to connect to database:", error);
  process.exit(1);
});

export default app;