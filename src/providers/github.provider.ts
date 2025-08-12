import axios from "axios";
import { SocialProvider, SocialItem } from "./socialProvider.interface.js";

export class GitHubProvider implements SocialProvider {
  providerName = "github";
  private token: string;
  private username: string;

  constructor(username: string, token: string) {
    this.username = username;
    this.token = token;
  }

  async fetchAll(): Promise<SocialItem[]> {
    // fetch all repos (pagination can be added)
    const url = `https://api.github.com/users/${this.username}/repos?per_page=100&sort=updated`;
    const res = await axios.get(url, {
      headers: {
        Authorization: `token ${this.token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    const repos = res.data as any[];
    return repos.map((r) => ({
      remoteId: String(r.id),
      title: r.name,
      description: r.description,
      url: r.html_url,
      language: r.language,
      topics: r.topics || [],
      raw: r,
    }));
  }
}
