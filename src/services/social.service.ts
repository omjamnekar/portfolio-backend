import { Repo } from "../models/Repo.js";
import { SocialProvider } from "../providers/socialProvider.interface.js";

export class SocialService {
  async syncProvider(provider: SocialProvider) {
    const items = await provider.fetchAll();

    const results = [];
    for (const item of items) {
      // upsert by provider + remoteId
      const doc = await Repo.findOneAndUpdate(
        { provider: provider.providerName, remoteId: item.remoteId },
        {
          $set: {
            title: item.title,
            description: item.description,
            url: item.url,
            language: item.language,
            topics: item.topics,
            raw: item.raw,
            fetchedAt: new Date(),
          },
        },
        { upsert: true, new: true }
      );
      results.push(doc);
    }
    return results;
  }
}
