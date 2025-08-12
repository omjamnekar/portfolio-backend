import express from "express";
import { blogController } from "../controllers/blog.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public endpoints
router.get("/", blogController.list);
router.get("/:idOrSlug", blogController.get);

// Admin endpoints (CRUD)
router.post("/admin", authMiddleware, blogController.create);
router.patch("/admin/:id", authMiddleware, blogController.update);
router.delete("/admin/:id", authMiddleware, blogController.remove);
router.patch("/admin/bulk/update", authMiddleware, blogController.bulkUpdate);
router.delete("/admin/bulk/delete", authMiddleware, blogController.bulkDelete);

export default router;
