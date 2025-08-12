import { Request, Response } from "express";
import { BlogPost } from "../models/Blog.js";
import { logger } from "../utils/logger.js";

// Build flexible query from request
function buildQuery(q: any) {
  const query: any = {};

  if (q.author) query.author = q.author;

  if (q.tag) query.tags = q.tag;
  if (q.tags) {
    const tags = Array.isArray(q.tags) ? q.tags : String(q.tags).split(",");
    query.tags = { $in: tags.map((t: string) => t.trim()).filter(Boolean) };
  }

  // text search in title/excerpt/content
  if (q.search) {
    const regex = new RegExp(String(q.search).trim(), "i");
    query.$or = [{ title: regex }, { excerpt: regex }, { content: regex }];
  }

  return query;
}

export const blogController = {
  // Public: list posts
  list: async (req: Request, res: Response) => {
    try {
      const { limit = 20, offset = 0, sort = "createdAt", order = "desc" } =
        req.query as any;

      const query = buildQuery(req.query);

      const sortObj: any = {};
      sortObj[String(sort)] = String(order).toLowerCase() === "desc" ? -1 : 1;

      const [items, total] = await Promise.all([
        BlogPost.find(query)
          .sort(sortObj)
          .limit(Number(limit))
          .skip(Number(offset)),
        BlogPost.countDocuments(query),
      ]);

      res.json({
        posts: items,
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset),
          hasMore: Number(offset) + items.length < total,
        },
      });
    } catch (error) {
      logger.error("Error listing blog posts:", error);
      res.status(500).json({ error: "Failed to list blog posts" });
    }
  },

  // Public: get by slug or id
  get: async (req: Request, res: Response) => {
    try {
      const { idOrSlug } = req.params as any;

      const isObjectId = /^[a-f\d]{24}$/i.test(idOrSlug);
      const post = isObjectId
        ? await BlogPost.findById(idOrSlug)
        : await BlogPost.findOne({ slug: idOrSlug });

      if (!post) return res.status(404).json({ error: "Blog post not found" });
      res.json(post);
    } catch (error) {
      logger.error("Error getting blog post:", error);
      res.status(500).json({ error: "Failed to get blog post" });
    }
  },

  // Admin: create
  create: async (req: Request, res: Response) => {
    try {
      const post = new BlogPost(req.body);
      await post.save();
      res.status(201).json(post);
    } catch (error) {
      logger.error("Error creating blog post:", error);
      res.status(400).json({
        error: "Failed to create blog post",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Admin: update (partial)
  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params as any;
      const updates = req.body;

      const post = await BlogPost.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!post) return res.status(404).json({ error: "Blog post not found" });
      res.json(post);
    } catch (error) {
      logger.error("Error updating blog post:", error);
      res.status(400).json({
        error: "Failed to update blog post",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Admin: delete
  remove: async (req: Request, res: Response) => {
    try {
      const { id } = req.params as any;
      const post = await BlogPost.findByIdAndDelete(id);
      if (!post) return res.status(404).json({ error: "Blog post not found" });
      res.json({ message: "Blog post deleted", id });
    } catch (error) {
      logger.error("Error deleting blog post:", error);
      res.status(500).json({ error: "Failed to delete blog post" });
    }
  },

  // Admin: bulk update
  bulkUpdate: async (req: Request, res: Response) => {
    try {
      const { ids, updates } = req.body as any;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "IDs are required" });
      }

      const result = await BlogPost.updateMany(
        { _id: { $in: ids } },
        { $set: updates }
      );

      res.json({
        message: `Updated ${result.modifiedCount} posts`,
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount,
      });
    } catch (error) {
      logger.error("Error bulk updating blog posts:", error);
      res.status(500).json({ error: "Failed to bulk update blog posts" });
    }
  },

  // Admin: bulk delete
  bulkDelete: async (req: Request, res: Response) => {
    try {
      const { ids } = req.body as any;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "IDs are required" });
      }

      const result = await BlogPost.deleteMany({ _id: { $in: ids } });
      res.json({
        message: `Deleted ${result.deletedCount} posts`,
        deletedCount: result.deletedCount,
      });
    } catch (error) {
      logger.error("Error bulk deleting blog posts:", error);
      res.status(500).json({ error: "Failed to bulk delete blog posts" });
    }
  },
};
