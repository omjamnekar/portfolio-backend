import { Request, Response } from "express";
import { SocialService } from "../services/social.service.js";
import { GitHubProvider } from "../providers/github.provider.js";
import { GitHubService } from "../services/github.service.js";
import { Repo } from "../models/Repo.js";
import { logger } from "../utils/logger.js";

const socialService = new SocialService();
const githubService = new GitHubService();

// Get GitHub credentials from environment variables
const getGitHubCredentials = () => {
  const username = process.env.GITHUB_USERNAME;
  const token = process.env.GITHUB_TOKEN;

  if (!username || !token) {
    throw new Error(
      "GitHub credentials not configured. Please set GITHUB_USERNAME and GITHUB_TOKEN in environment variables."
    );
  }

  return { username, token };
};

export const fetchAndSaveGitHub = async (req: Request, res: Response) => {
  try {
    const { options = {} } = req.body;

    // Get credentials from environment
    const { username, token } = getGitHubCredentials();

    const provider = new GitHubProvider(username, token);
    const syncResult = await socialService.syncProvider(provider, options);

    logger.info(`GitHub sync completed for ${username}`, syncResult);

    res.json({
      success: true,
      message: `Successfully synced ${syncResult.total} repositories for ${username}`,
      username,
      ...syncResult,
    });
  } catch (error) {
    logger.error("Error in fetchAndSaveGitHub:", error);
    res.status(500).json({
      error: "Failed to fetch GitHub repositories",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Portfolio endpoints (public - only published repos)
export const getPortfolioRepositories = async (req: Request, res: Response) => {
  try {
    const {
      featured,
      language,
      category,
      limit = 50,
      offset = 0,
      sort = "displayOrder",
      order = "asc",
    } = req.query;

    // Build query for published repos only
    const query: any = {
      provider: "github",
      isPublished: true,
      hidden: false,
    };

    if (featured !== undefined) query.isFeatured = featured === "true";
    if (language) query.language = language;
    if (category) query.category = category;

    // Build sort object
    const sortObj: any = {};
    if (sort === "stars") sortObj.stars = order === "desc" ? -1 : 1;
    else if (sort === "updated") sortObj.updatedAt = order === "desc" ? -1 : 1;
    else if (sort === "created") sortObj.createdAt = order === "desc" ? -1 : 1;
    else if (sort === "name") sortObj.title = order === "desc" ? -1 : 1;
    else sortObj.displayOrder = order === "desc" ? -1 : 1;

    const [repos, total] = await Promise.all([
      Repo.find(query)
        .sort(sortObj)
        .limit(Number(limit))
        .skip(Number(offset))
        .select("-raw"),
      Repo.countDocuments(query),
    ]);

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
    logger.error("Error fetching portfolio repositories:", error);
    res.status(500).json({ error: "Failed to fetch repositories" });
  }
};

// Admin endpoints (all repos for management)
export const getAdminRepositories = async (req: Request, res: Response) => {
  try {
    const {
      // provider = "github",
      // featured,
      // hidden,
      // published,
      // language,
      // category,
      // isFork,
      limit = 50,
      offset = 0,
      sort = "fetchedAt",
      order = "desc",
    } = req.query;

    // Build query
    // const query: any = { provider };

    // if (featured !== undefined) query.isFeatured = featured === "true";
    // if (hidden !== undefined) query.hidden = hidden === "true";
    // if (published !== undefined) query.isPublished = published === "true";
    // if (language) query.language = language;
    // if (category) query.category = category;
    // if (isFork !== undefined) query.isFork = isFork === "true";

    // // Build sort object
    // const sortObj: any = {};
    // if (sort === "stars") sortObj.stars = order === "desc" ? -1 : 1;
    // else if (sort === "updated") sortObj.updatedAt = order === "desc" ? -1 : 1;
    // else if (sort === "created") sortObj.createdAt = order === "desc" ? -1 : 1;
    // else if (sort === "name") sortObj.title = order === "desc" ? -1 : 1;
    // else sortObj.fetchedAt = -1;

    const [repos, total] = await Promise.all([
      Repo.find(),
      Repo.countDocuments(),
    ]);

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
    logger.error("Error fetching repositories:", error);
    res.status(500).json({ error: "Failed to fetch repositories" });
  }
};

export const getFeaturedRepositories = async (req: Request, res: Response) => {
  try {
    const { limit = 6 } = req.query;

    const repos = await (Repo as any).getFeatured(Number(limit));

    res.json({
      repos,
      count: repos.length,
    });
  } catch (error) {
    logger.error("Error fetching featured repositories:", error);
    res.status(500).json({ error: "Failed to fetch featured repositories" });
  }
};

export const getPopularRepositories = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    const repos = await (Repo as any).getPopular(Number(limit));

    res.json({
      repos,
      count: repos.length,
    });
  } catch (error) {
    logger.error("Error fetching popular repositories:", error);
    res.status(500).json({ error: "Failed to fetch popular repositories" });
  }
};

export const getRepositoriesByLanguage = async (
  req: Request,
  res: Response
) => {
  try {
    const { language } = req.params;
    const { limit = 10 } = req.query;

    if (!language) {
      return res.status(400).json({ error: "Language parameter is required" });
    }

    const repos = await (Repo as any).getByLanguage(language, Number(limit));

    res.json({
      language,
      repos,
      count: repos.length,
    });
  } catch (error) {
    logger.error("Error fetching repositories by language:", error);
    res.status(500).json({ error: "Failed to fetch repositories by language" });
  }
};

export const getRepositoryStats = async (req: Request, res: Response) => {
  try {
    const { provider } = req.query;

    const stats = await socialService.getRepositoryStats(provider as string);

    res.json(stats);
  } catch (error) {
    logger.error("Error fetching repository stats:", error);
    res.status(500).json({ error: "Failed to fetch repository statistics" });
  }
};

export const updateRepository = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Only allow certain fields to be updated
    const allowedUpdates = [
      "isFeatured",
      "hidden",
      "title",
      "description",
      "displayOrder",
      "category",
      "techStack",
      "demoUrl",
      "screenshots",
      "isPublished",
      "portfolioTitle",
      "portfolioDescription",
    ];

    const filteredUpdates = Object.keys(updates)
      .filter((key) => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {} as any);

    const repo = await Repo.findByIdAndUpdate(
      id,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    );

    if (!repo) {
      return res.status(404).json({ error: "Repository not found" });
    }

    logger.info(`Repository updated: ${repo.title}`, {
      id,
      updates: Object.keys(filteredUpdates),
    });

    res.json(repo);
  } catch (error) {
    logger.error("Error updating repository:", error);
    res.status(500).json({ error: "Failed to update repository" });
  }
};

// Bulk operations for admin
export const bulkUpdateRepositories = async (req: Request, res: Response) => {
  try {
    const { repoIds, updates } = req.body;

    if (!repoIds || !Array.isArray(repoIds) || repoIds.length === 0) {
      return res.status(400).json({ error: "Repository IDs are required" });
    }

    // Only allow certain fields to be updated
    const allowedUpdates = [
      "isFeatured",
      "hidden",
      "isPublished",
      "displayOrder",
      "category",
      "techStack",
      "demoUrl",
      "screenshots",
      "portfolioTitle",
      "portfolioDescription",
    ];

    const filteredUpdates = Object.keys(updates)
      .filter((key) => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {} as any);

    const result = await Repo.updateMany(
      { _id: { $in: repoIds } },
      { $set: filteredUpdates }
    );

    logger.info(`Bulk updated ${result.modifiedCount} repositories`, {
      repoIds,
      updates: Object.keys(filteredUpdates),
    });

    res.json({
      message: `Successfully updated ${result.modifiedCount} repositories`,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount,
    });
  } catch (error) {
    logger.error("Error bulk updating repositories:", error);
    res.status(500).json({ error: "Failed to bulk update repositories" });
  }
};

export const publishRepository = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      portfolioTitle,
      portfolioDescription,
      category,
      techStack,
      demoUrl,
      displayOrder,
    } = req.body;

    const repo = await Repo.findByIdAndUpdate(
      id,
      {
        $set: {
          isPublished: true,
          ...(portfolioTitle && { portfolioTitle }),
          ...(portfolioDescription && { portfolioDescription }),
          ...(category && { category }),
          ...(techStack && { techStack }),
          ...(demoUrl && { demoUrl }),
          ...(displayOrder !== undefined && { displayOrder }),
        },
      },
      { new: true }
    );

    if (!repo) {
      return res.status(404).json({ error: "Repository not found" });
    }

    logger.info(`Repository published: ${repo.title}`, { id });

    res.json({
      message: "Repository published successfully",
      repo,
    });
  } catch (error) {
    logger.error("Error publishing repository:", error);
    res.status(500).json({ error: "Failed to publish repository" });
  }
};

export const unpublishRepository = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const repo = await Repo.findByIdAndUpdate(
      id,
      { $set: { isPublished: false } },
      { new: true }
    );

    if (!repo) {
      return res.status(404).json({ error: "Repository not found" });
    }

    logger.info(`Repository unpublished: ${repo.title}`, { id });

    res.json({
      message: "Repository unpublished successfully",
      repo,
    });
  } catch (error) {
    logger.error("Error unpublishing repository:", error);
    res.status(500).json({ error: "Failed to unpublish repository" });
  }
};

export const deleteRepository = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const repo = await Repo.findByIdAndDelete(id);

    if (!repo) {
      return res.status(404).json({ error: "Repository not found" });
    }

    logger.info(`Repository deleted: ${repo.title}`, { id });

    res.json({
      message: "Repository deleted successfully",
      deletedRepo: {
        id: repo._id,
        title: repo.title,
        provider: repo.provider,
      },
    });
  } catch (error) {
    logger.error("Error deleting repository:", error);
    res.status(500).json({ error: "Failed to delete repository" });
  }
};

export const syncSingleRepository = async (req: Request, res: Response) => {
  try {
    const { repoName } = req.body;

    if (!repoName) {
      return res.status(400).json({
        error: "Repository name is required",
      });
    }

    // Get credentials from environment
    const { username, token } = getGitHubCredentials();

    const provider = new GitHubProvider(username, token);
    const repoData = await provider.fetchSingle(repoName);

    // Upsert the repository
    const repo = await Repo.findOneAndUpdate(
      { provider: "github", remoteId: repoData.remoteId },
      {
        $set: {
          ...repoData,
          provider: "github",
          fetchedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    logger.info(`Single repository synced: ${repoName}`, {
      username,
      repoId: repo._id,
    });

    res.json({
      success: true,
      message: `Successfully synced repository: ${repoName}`,
      username,
      repo,
    });
  } catch (error) {
    logger.error("Error syncing single repository:", error);
    res.status(500).json({
      error: "Failed to sync repository",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getGitHubInfo = async (req: Request, res: Response) => {
  try {
    const { username, token } = getGitHubCredentials();

    const provider = new GitHubProvider(username, token);
    const rateLimit = await provider.getRateLimit();

    res.json({
      username,
      configured: true,
      rateLimit: {
        limit: rateLimit.rate.limit,
        remaining: rateLimit.rate.remaining,
        reset: new Date(rateLimit.rate.reset * 1000),
        used: rateLimit.rate.used,
      },
      other: {},
    });
  } catch (error) {
    logger.error("Error getting GitHub info:", error);
    res.status(500).json({
      error: "Failed to get GitHub information",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
