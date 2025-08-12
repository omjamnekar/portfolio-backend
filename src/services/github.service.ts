import axios from "axios";
import { AdminUser, IAdminUser } from "../models/AdminUser.js";
import { SocialService } from "./social.service.js";
import { GitHubProvider } from "../providers/github.provider.js";
import { logger } from "../utils/logger.js";

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  topics: string[];
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  created_at: string;
  private: boolean;
  fork: boolean;
}

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
}

export class GitHubService {
  private socialService = new SocialService();

  /**
   * Sync GitHub repositories for a user
   */
  async syncUserRepos(username: string, token: string) {
    try {
      const provider = new GitHubProvider(username, token);
      const syncedRepos = await this.socialService.syncProvider(provider);

      logger.info(`Synced ${syncedRepos.length} repositories for ${username}`);
      return {
        success: true,
        count: syncedRepos.length,
        repos: syncedRepos,
      };
    } catch (error) {
      logger.error("Error syncing GitHub repos:", error);
      throw new Error("Failed to sync GitHub repositories");
    }
  }

  /**
   * Get GitHub user information
   */
  async getUserInfo(token: string): Promise<GitHubUser> {
    try {
      const response = await axios.get("https://api.github.com/user", {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      return response.data;
    } catch (error) {
      logger.error("Error fetching GitHub user info:", error);
      throw new Error("Failed to fetch GitHub user information");
    }
  }

  /**
   * Validate GitHub token
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await axios.get("https://api.github.com/user", {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get repository languages for a user
   */
  async getRepositoryLanguages(username: string, token: string) {
    try {
      const provider = new GitHubProvider(username, token);
      const repos = await provider.fetchAll();

      const languageStats: { [key: string]: number } = {};

      repos.forEach((repo) => {
        if (repo.language) {
          languageStats[repo.language] =
            (languageStats[repo.language] || 0) + 1;
        }
      });

      // Sort languages by frequency
      const sortedLanguages = Object.entries(languageStats)
        .sort(([, a], [, b]) => b - a)
        .reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {} as { [key: string]: number });

      return sortedLanguages;
    } catch (error) {
      logger.error("Error fetching repository languages:", error);
      throw new Error("Failed to fetch repository languages");
    }
  }

  /**
   * Update admin user's GitHub credentials
   */
  async updateAdminGitHubCredentials(
    userId: string,
    githubToken: string,
    githubUsername: string
  ): Promise<IAdminUser> {
    try {
      // Validate token first
      const isValid = await this.validateToken(githubToken);
      if (!isValid) {
        throw new Error("Invalid GitHub token");
      }

      // Get user info to verify username
      const userInfo = await this.getUserInfo(githubToken);
      if (userInfo.login !== githubUsername) {
        throw new Error("GitHub username does not match token");
      }

      const user = await AdminUser.findByIdAndUpdate(
        userId,
        {
          $set: {
            githubToken,
            githubUsername,
          },
        },
        { new: true }
      );

      if (!user) {
        throw new Error("Admin user not found");
      }

      logger.info(`Updated GitHub credentials for user ${user.username}`);
      return user;
    } catch (error) {
      logger.error("Error updating GitHub credentials:", error);
      throw error;
    }
  }

  /**
   * Auto-sync repositories for admin user
   */
  async autoSyncAdminRepos(userId: string) {
    try {
      const user = await AdminUser.findById(userId).select("+githubToken");

      if (!user || !user.githubToken || !user.githubUsername) {
        throw new Error("GitHub credentials not configured for user");
      }

      return await this.syncUserRepos(user.githubUsername, user.githubToken);
    } catch (error) {
      logger.error("Error auto-syncing admin repos:", error);
      throw error;
    }
  }

  /**
   * Get GitHub API rate limit info
   */
  async getRateLimit(token: string) {
    try {
      const response = await axios.get("https://api.github.com/rate_limit", {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      return response.data;
    } catch (error) {
      logger.error("Error fetching rate limit:", error);
      throw new Error("Failed to fetch rate limit information");
    }
  }
}
