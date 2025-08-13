import express from "express";
import { 
  fetchAndSaveGitHub,
  getPortfolioRepositories,
  getAdminRepositories,
  getFeaturedRepositories,
  getPopularRepositories,
  getRepositoriesByLanguage,
  getRepositoryStats,
  updateRepository,
  deleteRepository,
  syncSingleRepository,
  getGitHubInfo,
  bulkUpdateRepositories,
  publishRepository,
  unpublishRepository
} from "../controllers/github.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes (Portfolio - only published repos)
router.get("/portfolio/repos", getPortfolioRepositories);
router.get("/portfolio/repos/featured", getFeaturedRepositories);
router.get("/portfolio/repos/popular", getPopularRepositories);
router.get("/portfolio/repos/language/:language", getRepositoriesByLanguage);
router.get("/portfolio/stats", getRepositoryStats);

// Legacy public routes (for backward compatibility)
router.get("/repos", getPortfolioRepositories);
router.get("/repos/featured", getFeaturedRepositories);
router.get("/repos/popular", getPopularRepositories);
router.get("/repos/language/:language", getRepositoriesByLanguage);
router.get("/repos/stats", getRepositoryStats);

// Admin routes (Authentication required - all repos)
router.get("/admin/repos", authMiddleware, getAdminRepositories);
router.get("/info", authMiddleware, getGitHubInfo);
router.post("/fetch", authMiddleware, fetchAndSaveGitHub);
router.post("/sync-single", authMiddleware, syncSingleRepository);

// Repository management (Admin only)
router.patch("/repos/:id", authMiddleware, updateRepository);
router.delete("/repos/:id", authMiddleware, deleteRepository);
router.patch("/repos/bulk", authMiddleware, bulkUpdateRepositories);

// Publishing controls (Admin only)
router.post("/repos/:id/publish", authMiddleware, publishRepository);
router.post("/repos/:id/unpublish", authMiddleware, unpublishRepository);

export default router;