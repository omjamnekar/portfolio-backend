// src/routes/admin.routes.ts
import { Router } from "express";
import { AdminUser } from "../models/AdminUser.js";
import { GitHubService } from "../services/github.service.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { logger } from "../utils/logger.js";
import jwt from "jsonwebtoken";

const router = Router();
const githubService = new GitHubService();

// Admin login
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        error: "Email/username and password are required",
      });
    }

    const user = await (AdminUser as any).findByEmailOrUsername(identifier);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    logger.info(`Admin user logged in: ${user.username}`);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        githubUsername: user.githubUsername,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    logger.error("Admin login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Get admin profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const user = await AdminUser.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    logger.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Update admin profile
router.patch("/profile", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const updates = req.body;

    // Remove sensitive fields that shouldn't be updated directly
    delete updates.password;
    delete updates.role;
    delete updates.githubToken;

    const user = await AdminUser.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    logger.error("Update profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Change password
router.post("/change-password", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "New password must be at least 6 characters long",
      });
    }

    const user = await AdminUser.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isValidCurrentPassword = await user.comparePassword(currentPassword);
    if (!isValidCurrentPassword) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    logger.info(`Password changed for user: ${user.username}`);
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    logger.error("Change password error:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
});

// Configure GitHub credentials
router.post("/github/configure", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { githubToken, githubUsername } = req.body;

    if (!githubToken || !githubUsername) {
      return res.status(400).json({
        error: "GitHub token and username are required",
      });
    }

    const user = await githubService.updateAdminGitHubCredentials(
      userId,
      githubToken,
      githubUsername
    );

    res.json({
      message: "GitHub credentials configured successfully",
      githubUsername: user.githubUsername,
    });
  } catch (error) {
    logger.error("Configure GitHub error:", error);
    res.status(400).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to configure GitHub credentials",
    });
  }
});

// Sync GitHub repositories
router.post("/github/sync", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const result = await githubService.autoSyncAdminRepos(userId);

    res.json({
      message: "GitHub repositories synced successfully",
      ...result,
    });
  } catch (error) {
    logger.error("Sync GitHub repos error:", error);
    res.status(400).json({
      error:
        error instanceof Error ? error.message : "Failed to sync repositories",
    });
  }
});

// Get GitHub rate limit
router.get("/github/rate-limit", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const user = await AdminUser.findById(userId).select("+githubToken");

    if (!user?.githubToken) {
      return res.status(400).json({ error: "GitHub token not configured" });
    }

    const rateLimit = await githubService.getRateLimit(user.githubToken);
    res.json(rateLimit);
  } catch (error) {
    logger.error("Get rate limit error:", error);
    res.status(500).json({ error: "Failed to fetch rate limit" });
  }
});

// Get repository languages stats
router.get("/github/languages", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const user = await AdminUser.findById(userId).select("+githubToken");

    if (!user?.githubToken || !user?.githubUsername) {
      return res
        .status(400)
        .json({ error: "GitHub credentials not configured" });
    }

    const languages = await githubService.getRepositoryLanguages(
      user.githubUsername,
      user.githubToken
    );

    res.json(languages);
  } catch (error) {
    logger.error("Get languages error:", error);
    res.status(500).json({ error: "Failed to fetch repository languages" });
  }
});

export default router;
