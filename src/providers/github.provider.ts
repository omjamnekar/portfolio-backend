import axios from "axios";
import { SocialProvider, SocialItem } from "./socialProvider.interface.js";
import { logger } from "../utils/logger.js";

export interface GitHubRepoResponse {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  topics: string[];
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  size: number;
  default_branch: string;
  private: boolean;
  fork: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  has_downloads: boolean;
  license: { name: string } | null;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
}

export class GitHubProvider implements SocialProvider {
  providerName = "github";
  private token: string;
  private username: string;
  private baseUrl = "https://api.github.com";

  constructor(username: string, token: string) {
    this.username = username;
    this.token = token;
  }

  private getHeaders() {
    return {
      Authorization: `token ${this.token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Portfolio-Backend/1.0",
    };
  }

  async fetchAll(options: {
    includePrivate?: boolean;
    includeForks?: boolean;
    sort?: 'created' | 'updated' | 'pushed' | 'full_name';
    direction?: 'asc' | 'desc';
    perPage?: number;
  } = {}): Promise<SocialItem[]> {
    const {
      includePrivate = false,
      includeForks = true,
      sort = 'updated',
      direction = 'desc',
      perPage = 100
    } = options;

    try {
      const allRepos: GitHubRepoResponse[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const url = `${this.baseUrl}/users/${this.username}/repos`;
        const params = {
          per_page: perPage,
          page,
          sort,
          direction,
          type: includePrivate ? 'all' : 'public'
        };

        logger.debug(`Fetching GitHub repos page ${page} for ${this.username}`);

        const response = await axios.get(url, {
          headers: this.getHeaders(),
          params,
        });

        const repos = response.data as GitHubRepoResponse[];
        
        if (repos.length === 0) {
          hasMore = false;
        } else {
          allRepos.push(...repos);
          page++;
          
          // GitHub API rate limiting - be respectful
          if (page > 10) { // Limit to 1000 repos max
            logger.warn(`Reached maximum page limit for ${this.username}`);
            hasMore = false;
          }
        }
      }

      logger.info(`Fetched ${allRepos.length} repositories for ${this.username}`);

      // Filter and transform repos
      const filteredRepos = allRepos.filter(repo => {
        if (!includeForks && repo.fork) return false;
        return true;
      });

      return filteredRepos.map((repo) => this.transformRepo(repo));

    } catch (error) {
      logger.error(`Error fetching GitHub repos for ${this.username}:`, error);
      throw new Error(`Failed to fetch GitHub repositories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async fetchSingle(repoName: string): Promise<SocialItem> {
    try {
      const url = `${this.baseUrl}/repos/${this.username}/${repoName}`;
      
      const response = await axios.get(url, {
        headers: this.getHeaders(),
      });

      return this.transformRepo(response.data);
    } catch (error) {
      logger.error(`Error fetching GitHub repo ${repoName}:`, error);
      throw new Error(`Failed to fetch repository ${repoName}`);
    }
  }

  async fetchLanguages(repoName: string): Promise<Record<string, number>> {
    try {
      const url = `${this.baseUrl}/repos/${this.username}/${repoName}/languages`;
      
      const response = await axios.get(url, {
        headers: this.getHeaders(),
      });

      return response.data;
    } catch (error) {
      logger.error(`Error fetching languages for ${repoName}:`, error);
      return {};
    }
  }

  async fetchContributors(repoName: string): Promise<any[]> {
    try {
      const url = `${this.baseUrl}/repos/${this.username}/${repoName}/contributors`;
      
      const response = await axios.get(url, {
        headers: this.getHeaders(),
        params: { per_page: 10 }
      });

      return response.data;
    } catch (error) {
      logger.error(`Error fetching contributors for ${repoName}:`, error);
      return [];
    }
  }

  private transformRepo(repo: GitHubRepoResponse): SocialItem {
    return {
      remoteId: String(repo.id),
      title: repo.name,
      description: repo.description ?? undefined,
      url: repo.html_url,
      language: repo.language ?? undefined,
      topics: repo.topics || [],
      
      // Enhanced fields
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      watchers: repo.watchers_count,
      openIssues: repo.open_issues_count,
      size: repo.size,
      defaultBranch: repo.default_branch,
      isPrivate: repo.private,
      isFork: repo.fork,
      hasWiki: repo.has_wiki,
      hasPages: repo.has_pages,
      hasDownloads: repo.has_downloads,
      license: repo.license?.name,
      createdAt: new Date(repo.created_at),
      updatedAt: new Date(repo.updated_at),
      pushedAt: new Date(repo.pushed_at),
      homepage: repo.homepage ?? undefined,
      
      raw: repo,
    };
  }

  async getRateLimit(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/rate_limit`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      logger.error("Error fetching rate limit:", error);
      throw error;
    }
  }
}