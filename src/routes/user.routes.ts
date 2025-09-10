import express from "express";
import { userDetailController } from "../controllers/user.controller";

const router = express.Router();

router.get("/detail", userDetailController.getUserData);

export default router;
