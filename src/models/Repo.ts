import { Schema, model, Document } from "mongoose";

export interface IRepo extends Document {
  provider: "github" | "linkedin" | string;
  remoteId: string; // provider-specific id
  title: string;
  description?: string;
  url?: string;
  language?: string;
  topics?: string[];
  isFeatured?: boolean;
  hidden?: boolean;
  fetchedAt: Date;
  
  // Enhanced GitHub-specific fields
  stars?: number;
  forks?: number;
  watchers?: number;
  openIssues?: number;
  size?: number; // in KB
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
  
  // Portfolio-specific fields
  displayOrder?: number;
  category?: string;
  techStack?: string[];
  demoUrl?: string;
  screenshots?: string[];
  
  // Portfolio display control
  isPublished?: boolean; // Whether to show on portfolio
  portfolioDescription?: string; // Custom description for portfolio
  portfolioTitle?: string; // Custom title for portfolio
  
  raw?: any;
}

const RepoSchema = new Schema<IRepo>(
  {
    provider: { type: String, required: true, index: true },
    remoteId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: String,
    url: String,
    language: String,
    topics: [String],
    isFeatured: { type: Boolean, default: false, index: true },
    hidden: { type: Boolean, default: false, index: true },
    fetchedAt: { type: Date, default: Date.now },
    
    // Enhanced GitHub-specific fields
    stars: { type: Number, default: 0, index: true },
    forks: { type: Number, default: 0 },
    watchers: { type: Number, default: 0 },
    openIssues: { type: Number, default: 0 },
    size: Number,
    defaultBranch: String,
    isPrivate: { type: Boolean, default: false },
    isFork: { type: Boolean, default: false, index: true },
    hasWiki: Boolean,
    hasPages: Boolean,
    hasDownloads: Boolean,
    license: String,
    pushedAt: Date,
    homepage: String,
    
    // Portfolio-specific fields
    displayOrder: { type: Number, default: 0 },
    category: { type: String, index: true },
    techStack: [String],
    demoUrl: String,
    screenshots: [String],
    
    // Portfolio display control
    isPublished: { type: Boolean, default: false, index: true },
    portfolioDescription: String,
    portfolioTitle: String,
    
    raw: Schema.Types.Mixed,
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound indexes for efficient queries
RepoSchema.index({ provider: 1, remoteId: 1 }, { unique: true });
RepoSchema.index({ provider: 1, isFeatured: 1, hidden: 1 });
RepoSchema.index({ provider: 1, language: 1 });
RepoSchema.index({ provider: 1, stars: -1 });
RepoSchema.index({ displayOrder: 1, isFeatured: -1, stars: -1 });

// Virtual for GitHub URL
RepoSchema.virtual('githubUrl').get(function() {
  if (this.provider === 'github' && this.raw?.full_name) {
    return `https://github.com/${this.raw.full_name}`;
  }
  return this.url;
});

// Static methods for Portfolio (public display)
RepoSchema.statics.getPublished = function(limit = 50) {
  return this.find({ 
    isPublished: true, 
    hidden: false 
  })
  .sort({ displayOrder: 1, isFeatured: -1, stars: -1 })
  .limit(limit)
  .select('-raw');
};

RepoSchema.statics.getFeatured = function(limit = 6) {
  return this.find({ 
    isFeatured: true, 
    isPublished: true,
    hidden: false 
  })
  .sort({ displayOrder: 1, stars: -1 })
  .limit(limit)
  .select('-raw');
};

RepoSchema.statics.getByLanguage = function(language: string, limit = 10) {
  return this.find({ 
    language, 
    hidden: false 
  })
  .sort({ stars: -1, updatedAt: -1 })
  .limit(limit)
  .select('-raw');
};

RepoSchema.statics.getPopular = function(limit = 10) {
  return this.find({ 
    hidden: false,
    isFork: false 
  })
  .sort({ stars: -1, forks: -1 })
  .limit(limit)
  .select('-raw');
};

RepoSchema.statics.getRecent = function(limit = 10) {
  return this.find({ 
    hidden: false 
  })
  .sort({ pushedAt: -1, updatedAt: -1 })
  .limit(limit)
  .select('-raw');
};

export const Repo = model<IRepo>("Repo", RepoSchema);