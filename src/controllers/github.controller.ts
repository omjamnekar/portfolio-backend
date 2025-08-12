import { Request, Response } from "express";
import { SocialService } from "../services/social.service.js";
import { GitHubProvider } from "../providers/github.provider.js";

const socialService = new SocialService();

export const fetchAndSaveGitHub = async (req: Request, res: Response) => {
  try {
    const { username, token } = req.body; // admin posts token or server can use saved token
    if (!username || !token)
      return res.status(400).json({ message: "username+token required" });

    const provider = new GitHubProvider(username, token);
    const saved = await socialService.syncProvider(provider);
    res.json({ count: saved.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch GitHub repos" });
  }
};
