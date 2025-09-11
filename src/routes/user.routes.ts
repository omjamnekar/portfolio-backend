import express from "express";
import { userDetailController } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/detail", userDetailController.getUserData);

export default router;
