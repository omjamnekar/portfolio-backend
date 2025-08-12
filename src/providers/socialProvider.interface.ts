export interface SocialItem {
  remoteId: string;
  title: string;
  description?: string;
  url?: string;
  language?: string;
  topics?: string[];
  raw?: any;
}

export interface SocialProvider {
  providerName: string;
  fetchAll(params?: any): Promise<SocialItem[]>;
}
