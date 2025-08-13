import axios from "axios";
import { logger } from "../utils/logger.js";

const BASE_URL = "http://localhost:3000";

async function testGitHubFetch() {
  try {
    // Step 1: Get authentication token
    logger.info("Step 1: Getting authentication token...");
    const tokenResponse = await axios.get(`${BASE_URL}/token`);
    const { token } = tokenResponse.data;
    logger.info("✅ Token received");

    // Step 2: Check GitHub configuration
    logger.info("Step 2: Checking GitHub configuration...");
    try {
      const infoResponse = await axios.get(`${BASE_URL}/api/github/info`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      logger.info("✅ GitHub configured:", {
        username: infoResponse.data.username,
        rateLimit: infoResponse.data.rateLimit
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 500) {
        logger.error("❌ GitHub not configured. Please set GITHUB_USERNAME and GITHUB_TOKEN in .env file");
        return;
      }
      throw error;
    }

    // Step 3: Check current repos (should be empty initially)
    logger.info("Step 3: Checking current repositories...");
    const initialRepos = await axios.get(`${BASE_URL}/api/github/repos`);
    logger.info(`📊 Current repo count: ${initialRepos.data.pagination.total}`);

    // Step 4: Fetch repositories from GitHub (no credentials needed - uses .env)
    logger.info("Step 4: Fetching repositories from GitHub...");
    const fetchResponse = await axios.post(
      `${BASE_URL}/api/github/fetch`,
      {
        options: {
          includePrivate: false,
          includeForks: true,
          sort: "updated"
        }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    logger.info("✅ GitHub fetch completed:", fetchResponse.data);

    // Step 5: Check repositories again
    logger.info("Step 5: Checking repositories after fetch...");
    const finalRepos = await axios.get(`${BASE_URL}/api/github/repos`);
    logger.info(`📊 Final repo count: ${finalRepos.data.pagination.total}`);

    if (finalRepos.data.repos.length > 0) {
      logger.info("🎉 Success! Sample repositories:");
      finalRepos.data.repos.slice(0, 3).forEach((repo: any) => {
        logger.info(`  - ${repo.title} (${repo.language || 'No language'}) - ⭐ ${repo.stars || 0}`);
      });
    }

    // Step 6: Test featured repositories
    logger.info("Step 6: Testing featured repositories endpoint...");
    const featuredRepos = await axios.get(`${BASE_URL}/api/github/repos/featured`);
    logger.info(`📌 Featured repos: ${featuredRepos.data.count}`);

    // Step 7: Test popular repositories
    logger.info("Step 7: Testing popular repositories endpoint...");
    const popularRepos = await axios.get(`${BASE_URL}/api/github/repos/popular`);
    logger.info(`🔥 Popular repos: ${popularRepos.data.count}`);

    // Step 8: Test single repo sync
    if (finalRepos.data.repos.length > 0) {
      const sampleRepo = finalRepos.data.repos[0];
      logger.info(`Step 8: Testing single repo sync for: ${sampleRepo.title}`);
      
      const singleSyncResponse = await axios.post(
        `${BASE_URL}/api/github/sync-single`,
        { repoName: sampleRepo.title },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      logger.info("✅ Single repo sync completed:", singleSyncResponse.data.message);
    }

  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error("❌ API Error:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
    } else {
      logger.error("❌ Unexpected error:", error);
    }
  }
}

// Run the test
testGitHubFetch();