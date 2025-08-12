import { Router } from "express";
import axios from "axios";
import jwt from "jsonwebtoken";

const router = Router();

router.get("/github/callback", async (req, res) => {
  const code = req.query.code as string;

  try {
    // 1️⃣ Exchange code for access token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: { Accept: "application/json" },
      }
    );

    const githubAccessToken = tokenResponse.data.access_token;

    // 2️⃣ Fetch user data from GitHub
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${githubAccessToken}` },
    });

    const user = userResponse.data;

    // 3️⃣ Sign our own JWT token
    const jwtToken = jwt.sign(
      { id: user.id, login: user.login, provider: "github" },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.json({ jwtToken, githubAccessToken, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "GitHub login failed" });
  }
});

export default router;
