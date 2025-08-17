import express from "express";
import {
  certificationController,
  skillCategoryController,
  projectController,
  projectSpecialController,
  workExperienceController,
  workExperienceSpecialController,
  additionalSectionController,
  additionalSectionSpecialController,
  portfolioOverviewController,
  myWorkController,
} from "../controllers/portfolio.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// ===========================================
// PUBLIC ROUTES (Portfolio Display)
// ===========================================

// Portfolio Overview
router.get("/overview", portfolioOverviewController.getOverview);
router.get("/stats", portfolioOverviewController.getStats);

// Public Certifications
router.get("/certifications", (req, res) => {
  req.query.isActive = "true";
  certificationController.getAll(req, res);
});

// Public Skills
router.get("/skills", (req, res) => {
  req.query.isActive = "true";
  skillCategoryController.getAll(req, res);
});

// Public Projects
router.get("/projects", (req, res) => {
  req.query.isActive = "true";
  projectController.getAll(req, res);
});

router.get("/projects/featured", projectSpecialController.getFeatured);
router.get("/projects/type/:type", projectSpecialController.getByType);
router.get("/projects/:id", projectController.getById);

// Public Work Experience
router.get("/work-experience", (req, res) => {
  req.query.isActive = "true";
  workExperienceController.getAll(req, res);
});

router.get(
  "/work-experience/current",
  workExperienceSpecialController.getCurrent
);

// Public Additional Sections
router.get("/additional/:type", additionalSectionSpecialController.getByType);

// Public MyWork
router.get("/mywork", (req, res) => {
  req.query.isActive = "true";
  myWorkController.getAll(req, res);
});
router.get("/mywork/:id", myWorkController.getById);

// ===========================================
// USER ROUTES (Authenticated - Non-admin)
// ===========================================

// Normal user access to MyWork (authenticated, no admin role required)
// router.get("/user/mywork", authMiddleware, myWorkController.getAll);
// router.get("/user/mywork/:id", authMiddleware, myWorkController.getById);

// ===========================================
// ADMIN ROUTES (Protected - CRUD Operations)
// ===========================================

// Certifications CRUD
router.get(
  "/admin/certifications",
  authMiddleware,
  certificationController.getAll
);
router.get(
  "/admin/certifications/:id",
  authMiddleware,
  certificationController.getById
);
router.post(
  "/admin/certifications",
  authMiddleware,
  certificationController.create
);
router.patch(
  "/admin/certifications/:id",
  authMiddleware,
  certificationController.update
);
router.delete(
  "/admin/certifications/:id",
  authMiddleware,
  certificationController.delete
);
router.patch(
  "/admin/certifications/bulk/update",
  authMiddleware,
  certificationController.bulkUpdate
);
router.delete(
  "/admin/certifications/bulk/delete",
  authMiddleware,
  certificationController.bulkDelete
);

// Skill Categories CRUD
router.get("/admin/skills", authMiddleware, skillCategoryController.getAll);
router.get(
  "/admin/skills/:id",
  authMiddleware,
  skillCategoryController.getById
);
router.post("/admin/skills", authMiddleware, skillCategoryController.create);
router.patch(
  "/admin/skills/:id",
  authMiddleware,
  skillCategoryController.update
);
router.delete(
  "/admin/skills/:id",
  authMiddleware,
  skillCategoryController.delete
);
router.patch(
  "/admin/skills/bulk/update",
  authMiddleware,
  skillCategoryController.bulkUpdate
);
router.delete(
  "/admin/skills/bulk/delete",
  authMiddleware,
  skillCategoryController.bulkDelete
);

// Projects CRUD
router.get("/admin/projects", authMiddleware, projectController.getAll);
router.get("/admin/projects/:id", authMiddleware, projectController.getById);
router.post("/admin/projects", authMiddleware, projectController.create);
router.patch("/admin/projects/:id", authMiddleware, projectController.update);
router.delete("/admin/projects/:id", authMiddleware, projectController.delete);
router.patch(
  "/admin/projects/bulk/update",
  authMiddleware,
  projectController.bulkUpdate
);
router.delete(
  "/admin/projects/bulk/delete",
  authMiddleware,
  projectController.bulkDelete
);

// Project Special Operations
router.post(
  "/admin/projects/:id/toggle-featured",
  authMiddleware,
  projectSpecialController.toggleFeatured
);

// Work Experience CRUD
router.get(
  "/admin/work-experience",
  authMiddleware,
  workExperienceController.getAll
);
router.get(
  "/admin/work-experience/:id",
  authMiddleware,
  workExperienceController.getById
);
router.post(
  "/admin/work-experience",
  authMiddleware,
  workExperienceController.create
);
router.patch(
  "/admin/work-experience/:id",
  authMiddleware,
  workExperienceController.update
);
router.delete(
  "/admin/work-experience/:id",
  authMiddleware,
  workExperienceController.delete
);
router.patch(
  "/admin/work-experience/bulk/update",
  authMiddleware,
  workExperienceController.bulkUpdate
);
router.delete(
  "/admin/work-experience/bulk/delete",
  authMiddleware,
  workExperienceController.bulkDelete
);

// Work Experience Special Operations
router.post(
  "/admin/work-experience/:id/set-current",
  authMiddleware,
  workExperienceSpecialController.setAsCurrent
);

// Additional Sections CRUD
router.get(
  "/admin/additional",
  authMiddleware,
  additionalSectionController.getAll
);
router.get(
  "/admin/additional/:id",
  authMiddleware,
  additionalSectionController.getById
);
router.post(
  "/admin/additional",
  authMiddleware,
  additionalSectionController.create
);
router.patch(
  "/admin/additional/:id",
  authMiddleware,
  additionalSectionController.update
);
router.delete(
  "/admin/additional/:id",
  authMiddleware,
  additionalSectionController.delete
);
router.patch(
  "/admin/additional/bulk/update",
  authMiddleware,
  additionalSectionController.bulkUpdate
);
router.delete(
  "/admin/additional/bulk/delete",
  authMiddleware,
  additionalSectionController.bulkDelete
);

// Additional Sections by Type (Admin)
router.get(
  "/admin/additional/type/:type",
  authMiddleware,
  additionalSectionSpecialController.getByType
);

// MyWork CRUD
router.get("/admin/mywork", authMiddleware, myWorkController.getAll);
router.get("/admin/mywork/:id", authMiddleware, myWorkController.getById);
router.post("/admin/mywork", authMiddleware, myWorkController.create);
router.patch("/admin/mywork/:id", authMiddleware, myWorkController.update);
router.delete("/admin/mywork/:id", authMiddleware, myWorkController.delete);
router.patch(
  "/admin/mywork/bulk/update",
  authMiddleware,
  myWorkController.bulkUpdate
);
router.delete(
  "/admin/mywork/bulk/delete",
  authMiddleware,
  myWorkController.bulkDelete
);

export default router;
