import { Request, Response } from "express";
import {
  Certification,
  SkillCategory,
  Project,
  WorkExperience,
  AdditionalSection,
  MyWork,
} from "../models/Portfolio.js";
import { logger } from "../utils/logger.js";

// Generic CRUD helper functions
const createGenericController = (Model: any, modelName: string) => {
  return {
    // Get all items
    getAll: async (_: Request, res: Response) => {
      try {
        const [items, total] = await Promise.all([
          Model.find(),
          Model.countDocuments(),
        ]);

        res.json({
          [modelName.toLowerCase() + "s"]: items,
          pagination: {
            total,
            // limit: Number(limit),
            // offset: Number(offset),
            // hasMore: Number(offset) + items.length < total,
          },
        });
      } catch (error) {
        logger.error(`Error fetching ${modelName}s:`, error);
        res.status(500).json({ error: `Failed to fetch ${modelName}s` });
      }
    },

    // Get single item by ID
    getById: async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const item = await Model.findById(id);

        if (!item) {
          return res.status(404).json({ error: `${modelName} not found` });
        }

        res.json(item);
      } catch (error) {
        logger.error(`Error fetching ${modelName}:`, error);
        res.status(500).json({ error: `Failed to fetch ${modelName}` });
      }
    },

    // Create new item
    create: async (req: Request, res: Response) => {
      try {
        const item = new Model(req.body);
        await item.save();

        logger.info(`${modelName} created:`, { id: item._id });
        res.status(201).json(item);
      } catch (error) {
        logger.error(`Error creating ${modelName}:`, error);
        res.status(400).json({
          error: `Failed to create ${modelName}`,
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },

    // Update item
    update: async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const updates = req.body;

        const item = await Model.findByIdAndUpdate(
          id,
          { $set: updates },
          { new: true, runValidators: true }
        );

        if (!item) {
          return res.status(404).json({ error: `${modelName} not found` });
        }

        logger.info(`${modelName} updated:`, { id });
        res.json(item);
      } catch (error) {
        logger.error(`Error updating ${modelName}:`, error);
        res.status(400).json({
          error: `Failed to update ${modelName}`,
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },

    // Delete item
    delete: async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const item = await Model.findByIdAndDelete(id);

        if (!item) {
          return res.status(404).json({ error: `${modelName} not found` });
        }

        logger.info(`${modelName} deleted:`, { id });
        res.json({
          message: `${modelName} deleted successfully`,
          deletedItem: {
            id: item._id,
            name: item.name || item.title || item.company || "Unknown",
          },
        });
      } catch (error) {
        logger.error(`Error deleting ${modelName}:`, error);
        res.status(500).json({ error: `Failed to delete ${modelName}` });
      }
    },

    // Bulk operations
    bulkUpdate: async (req: Request, res: Response) => {
      try {
        const { ids, updates } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
          return res.status(400).json({ error: "IDs are required" });
        }

        const result = await Model.updateMany(
          { _id: { $in: ids } },
          { $set: updates }
        );

        logger.info(`Bulk updated ${result.modifiedCount} ${modelName}s`, {
          ids,
          updates: Object.keys(updates),
        });

        res.json({
          message: `Successfully updated ${result.modifiedCount} ${modelName}s`,
          modifiedCount: result.modifiedCount,
          matchedCount: result.matchedCount,
        });
      } catch (error) {
        logger.error(`Error bulk updating ${modelName}s:`, error);
        res.status(500).json({ error: `Failed to bulk update ${modelName}s` });
      }
    },

    // Bulk delete
    bulkDelete: async (req: Request, res: Response) => {
      try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
          return res.status(400).json({ error: "IDs are required" });
        }

        const result = await Model.deleteMany({ _id: { $in: ids } });

        logger.info(`Bulk deleted ${result.deletedCount} ${modelName}s`, {
          ids,
        });

        res.json({
          message: `Successfully deleted ${result.deletedCount} ${modelName}s`,
          deletedCount: result.deletedCount,
        });
      } catch (error) {
        logger.error(`Error bulk deleting ${modelName}s:`, error);
        res.status(500).json({ error: `Failed to bulk delete ${modelName}s` });
      }
    },
  };
};

// Create controllers for each model
export const certificationController = createGenericController(
  Certification,
  "Certification"
);
export const skillCategoryController = createGenericController(
  SkillCategory,
  "SkillCategory"
);
export const projectController = createGenericController(Project, "Project");
export const workExperienceController = createGenericController(
  WorkExperience,
  "WorkExperience"
);
export const additionalSectionController = createGenericController(
  AdditionalSection,
  "AdditionalSection"
);
export const myWorkController = createGenericController(MyWork, "MyWork");

// Specialized controllers with additional functionality

// Project-specific controllers
export const projectSpecialController = {
  ...projectController,

  // Get featured projects
  getFeatured: async (req: Request, res: Response) => {
    try {
      const { limit = 6 } = req.query;
      const projects = await (Project as any).getFeatured(Number(limit));

      res.json({
        projects,
        count: projects.length,
      });
    } catch (error) {
      logger.error("Error fetching featured projects:", error);
      res.status(500).json({ error: "Failed to fetch featured projects" });
    }
  },

  // Get projects by type
  getByType: async (req: Request, res: Response) => {
    try {
      const { type } = req.params;
      const { limit = 10 } = req.query;

      const projects = await (Project as any).getByType(type, Number(limit));

      res.json({
        type,
        projects,
        count: projects.length,
      });
    } catch (error) {
      logger.error("Error fetching projects by type:", error);
      res.status(500).json({ error: "Failed to fetch projects by type" });
    }
  },

  // Toggle featured status
  toggleFeatured: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const project = await Project.findById(id);

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      project.isFeatured = !project.isFeatured;
      await project.save();

      logger.info(`Project featured status toggled:`, {
        id,
        isFeatured: project.isFeatured,
      });

      res.json({
        message: `Project ${
          project.isFeatured ? "featured" : "unfeatured"
        } successfully`,
        project,
      });
    } catch (error) {
      logger.error("Error toggling project featured status:", error);
      res.status(500).json({ error: "Failed to toggle featured status" });
    }
  },
};

// Work Experience-specific controllers
export const workExperienceSpecialController = {
  ...workExperienceController,

  // Get current role
  getCurrent: async (_: Request, res: Response) => {
    try {
      const currentRole = await (WorkExperience as any).getCurrent();

      if (!currentRole) {
        return res.status(404).json({ error: "No current role found" });
      }

      res.json(currentRole);
    } catch (error) {
      logger.error("Error fetching current role:", error);
      res.status(500).json({ error: "Failed to fetch current role" });
    }
  },

  // Set as current role
  setAsCurrent: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // First, unset all current roles
      await WorkExperience.updateMany(
        { isCurrentRole: true },
        { $set: { isCurrentRole: false } }
      );

      // Then set the specified role as current
      const workExperience = await WorkExperience.findByIdAndUpdate(
        id,
        { $set: { isCurrentRole: true } },
        { new: true }
      );

      if (!workExperience) {
        return res.status(404).json({ error: "Work experience not found" });
      }

      logger.info(`Work experience set as current:`, { id });

      res.json({
        message: "Work experience set as current role successfully",
        workExperience,
      });
    } catch (error) {
      logger.error("Error setting current role:", error);
      res.status(500).json({ error: "Failed to set current role" });
    }
  },
};

// Additional Section-specific controllers
export const additionalSectionSpecialController = {
  ...additionalSectionController,

  // Get by type
  getByType: async (req: Request, res: Response) => {
    try {
      const { type } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      const [items, total] = await Promise.all([
        AdditionalSection.find({ type, isActive: true })
          .sort({ displayOrder: 1 })
          .limit(Number(limit))
          .skip(Number(offset)),
        AdditionalSection.countDocuments({ type, isActive: true }),
      ]);

      res.json({
        type,
        items,
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset),
          hasMore: Number(offset) + items.length < total,
        },
      });
    } catch (error) {
      logger.error("Error fetching additional sections by type:", error);
      res
        .status(500)
        .json({ error: "Failed to fetch additional sections by type" });
    }
  },
};

// Portfolio overview controller
export const portfolioOverviewController = {
  // Get complete portfolio overview
  getOverview: async (_: Request, res: Response) => {
    try {
      const [
        certifications,
        skillCategories,
        featuredProjects,
        currentRole,
        recentProjects,
      ] = await Promise.all([
        Certification.find({ isActive: true })
          .sort({ displayOrder: 1 })
          .limit(10),
        SkillCategory.find({ isActive: true }).sort({ displayOrder: 1 }),
        (Project as any).getFeatured(6),
        (WorkExperience as any).getCurrent(),
        Project.find({ isActive: true }).sort({ updatedAt: -1 }).limit(5),
      ]);

      res.json({
        overview: {
          certifications: {
            items: certifications,
            total: certifications.length,
          },
          skills: {
            categories: skillCategories,
            total: skillCategories.length,
          },
          projects: {
            featured: featuredProjects,
            recent: recentProjects,
            featuredCount: featuredProjects.length,
          },
          workExperience: {
            current: currentRole,
          },
        },
        lastUpdated: new Date(),
      });
    } catch (error) {
      logger.error("Error fetching portfolio overview:", error);
      res.status(500).json({ error: "Failed to fetch portfolio overview" });
    }
  },

  // Get portfolio statistics
  getStats: async (_: Request, res: Response) => {
    try {
      const [
        totalCertifications,
        totalSkillCategories,
        totalProjects,
        featuredProjects,
        totalWorkExperience,
        projectsByType,
      ] = await Promise.all([
        Certification.countDocuments({ isActive: true }),
        SkillCategory.countDocuments({ isActive: true }),
        Project.countDocuments({ isActive: true }),
        Project.countDocuments({ isFeatured: true, isActive: true }),
        WorkExperience.countDocuments({ isActive: true }),
        Project.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: "$type", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
      ]);

      res.json({
        stats: {
          certifications: totalCertifications,
          skillCategories: totalSkillCategories,
          projects: {
            total: totalProjects,
            featured: featuredProjects,
            byType: projectsByType,
          },
          workExperience: totalWorkExperience,
        },
        generatedAt: new Date(),
      });
    } catch (error) {
      logger.error("Error fetching portfolio stats:", error);
      res.status(500).json({ error: "Failed to fetch portfolio statistics" });
    }
  },
};
