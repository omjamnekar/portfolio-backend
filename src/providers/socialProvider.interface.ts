export interface SocialItem {
  remoteId: string;
  title: string;
  description?: string;
  url?: string;
  language?: string;
  topics?: string[];
  
  // Enhanced GitHub-specific fields
  stars?: number;
  forks?: number;
  watchers?: number;
  openIssues?: number;
  size?: number;
  defaultBranch?: string;
  isPrivate?: boolean;
  isFork?: boolean;
  hasWiki?: boolean;
  hasPages?: boolean;
  hasDownloads?: boolean;
  license?: string;
  createdAt?: Date;
  updatedAt?: Date;
  pushedAt?: Date;
  homepage?: string;
  
  // Portfolio display control
  isPublished?: boolean;
  portfolioDescription?: string;
  portfolioTitle?: string;
  
  raw?: any;
}

export interface SocialProvider {
  providerName: string;
  fetchAll(params?: any): Promise<SocialItem[]>;
}