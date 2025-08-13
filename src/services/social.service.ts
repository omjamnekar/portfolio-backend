import { Repo } from "../models/Repo.js";
import { SocialProvider } from "../providers/socialProvider.interface.js";
import { logger } from "../utils/logger.js";

export interface SyncOptions {
  preserveCustomFields?: boolean;
  updateExisting?: boolean;
  deleteRemoved?: boolean;
}

export interface SyncResult {
  created: number;
  updated: number;
  deleted: number;
  total: number;
  repos: any[];
}

export class SocialService {
  async syncProvider(
    provider: SocialProvider, 
    options: SyncOptions = {}
  ): Promise<SyncResult> {
    const {
      preserveCustomFields = true,
      updateExisting = true,
      deleteRemoved = false
    } = options;

    try {
      logger.info(`Starting sync for provider: ${provider.providerName}`);
      
      const items = await provider.fetchAll();
      const results: any[] = [];
      let created = 0;
      let updated = 0;
      let deleted = 0;

      // Get existing repos for this provider
      const existingRepos = await Repo.find({ 
        provider: provider.providerName 
      });
      
      const existingRemoteIds = new Set(
        existingRepos.map(repo => repo.remoteId)
      );
      
      const fetchedRemoteIds = new Set(
        items.map(item => item.remoteId)
      );

      // Process each fetched item
      for (const item of items) {
        const existingRepo = existingRepos.find(
          repo => repo.remoteId === item.remoteId
        );

        if (existingRepo) {
          // Update existing repo
          if (updateExisting) {
            const updateData: any = {
              title: item.title,
              description: item.description,
              url: item.url,
              language: item.language,
              topics: item.topics,
              fetchedAt: new Date(),
              raw: item.raw,
            };

            // Add enhanced fields
            if (item.stars !== undefined) updateData.stars = item.stars;
            if (item.forks !== undefined) updateData.forks = item.forks;
            if (item.watchers !== undefined) updateData.watchers = item.watchers;
            if (item.openIssues !== undefined) updateData.openIssues = item.openIssues;
            if (item.size !== undefined) updateData.size = item.size;
            if (item.defaultBranch) updateData.defaultBranch = item.defaultBranch;
            if (item.isPrivate !== undefined) updateData.isPrivate = item.isPrivate;
            if (item.isFork !== undefined) updateData.isFork = item.isFork;
            if (item.hasWiki !== undefined) updateData.hasWiki = item.hasWiki;
            if (item.hasPages !== undefined) updateData.hasPages = item.hasPages;
            if (item.hasDownloads !== undefined) updateData.hasDownloads = item.hasDownloads;
            if (item.license) updateData.license = item.license;
            if (item.pushedAt) updateData.pushedAt = item.pushedAt;
            if (item.homepage) updateData.homepage = item.homepage;

            // Preserve custom fields if requested
            if (preserveCustomFields) {
              // Don't overwrite these portfolio-specific fields
              delete updateData.isFeatured;
              delete updateData.hidden;
              delete updateData.displayOrder;
              delete updateData.category;
              delete updateData.techStack;
              delete updateData.demoUrl;
              delete updateData.screenshots;
            }

            const doc = await Repo.findByIdAndUpdate(
              existingRepo._id,
              { $set: updateData },
              { new: true }
            );
            
            if (doc) {
              results.push(doc);
              updated++;
            }
          } else {
            results.push(existingRepo);
          }
        } else {
          // Create new repo
          const newRepoData = {
            provider: provider.providerName,
            remoteId: item.remoteId,
            title: item.title,
            description: item.description,
            url: item.url,
            language: item.language,
            topics: item.topics,
            fetchedAt: new Date(),
            
            // Enhanced fields
            stars: item.stars || 0,
            forks: item.forks || 0,
            watchers: item.watchers || 0,
            openIssues: item.openIssues || 0,
            size: item.size,
            defaultBranch: item.defaultBranch,
            isPrivate: item.isPrivate || false,
            isFork: item.isFork || false,
            hasWiki: item.hasWiki,
            hasPages: item.hasPages,
            hasDownloads: item.hasDownloads,
            license: item.license,
            pushedAt: item.pushedAt,
            homepage: item.homepage,
            
            raw: item.raw,
          };

          const doc = await Repo.create(newRepoData);
          results.push(doc);
          created++;
        }
      }

      // Handle deleted repos
      if (deleteRemoved) {
        const removedIds = [...existingRemoteIds].filter(
          id => !fetchedRemoteIds.has(id)
        );

        if (removedIds.length > 0) {
          const deleteResult = await Repo.deleteMany({
            provider: provider.providerName,
            remoteId: { $in: removedIds }
          });
          deleted = deleteResult.deletedCount || 0;
          
          logger.info(`Deleted ${deleted} removed repositories`);
        }
      }

      const syncResult: SyncResult = {
        created,
        updated,
        deleted,
        total: results.length,
        repos: results
      };

      logger.info(`Sync completed for ${provider.providerName}:`, {
        created,
        updated,
        deleted,
        total: results.length
      });

      return syncResult;

    } catch (error) {
      logger.error(`Error syncing provider ${provider.providerName}:`, error);
      throw error;
    }
  }

  async getRepositoryStats(provider?: string) {
    const query = provider ? { provider } : {};
    
    const [
      total,
      featured,
      byLanguage,
      byProvider,
      recent
    ] = await Promise.all([
      Repo.countDocuments(query),
      Repo.countDocuments({ ...query, isFeatured: true }),
      Repo.aggregate([
        { $match: { ...query, language: { $ne: null } } },
        { $group: { _id: "$language", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Repo.aggregate([
        { $match: query },
        { $group: { _id: "$provider", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Repo.find(query)
        .sort({ fetchedAt: -1 })
        .limit(5)
        .select('title provider fetchedAt')
    ]);

    return {
      total,
      featured,
      languages: byLanguage,
      providers: byProvider,
      recentlyFetched: recent
    };
  }
}