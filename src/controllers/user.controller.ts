import { Request, Response } from "express";
import { UserDataSection } from "../models/Portfolio";

export const userDetailController = {
  getUserData: async (_: Request, res: Response) => {
    try {
      // Assuming only one user document exists
      const user = await UserDataSection.findOne();

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },
};
