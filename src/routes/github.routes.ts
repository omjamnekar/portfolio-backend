import express from "express";
import { fetchAndSaveGitHub } from "../controllers/github.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/fetch", authMiddleware, fetchAndSaveGitHub);

export default router;
