import { Schema, model, Document } from "mongoose";

// Certification Interface and Schema
export interface ICertification extends Document {
  name: string;
  issuer: string;
  issueDate?: Date;
  expired?: Date;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
  isActive: boolean;
  skills: [{ type: String }];
  certificateUrl: String;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
const CertificationSchema = new Schema<ICertification>(
  {
    // id is automatically handled by MongoDB (_id)
    name: { type: String, required: true }, // title
    issuer: { type: String, required: true },
    issueDate: { type: Date }, // issuedDate
    expired: { type: Date },
    credentialId: { type: String },
    credentialUrl: { type: String },
    skills: [{ type: String }], // array of skills covere d
    certificateUrl: { type: String }, // image or PDF preview link (optional)
    description: { type: String },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Skill Category Interface and Schema
export interface ISkillCategory extends Document {
  category: string;
  skills: string[];
  description?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const SkillCategorySchema = new Schema<ISkillCategory>(
  {
    category: { type: String, required: true, unique: true },
    skills: [{ type: String, required: true }],
    description: { try: String },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Project Interface and Schema
export interface IProject extends Document {
  name: string;
  description: string;
  technologies: string[];
  type: "mobile" | "web" | "desktop" | "api" | "other";
  github?: string;
  liveUrl?: string;
  images?: string[];
  startDate?: Date;
  endDate?: Date;
  status: "completed" | "in-progress" | "planned" | "archived";
  isFeatured: boolean;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    technologies: [{ type: String, required: true }],
    type: {
      type: String,
      enum: ["mobile", "web", "desktop", "api", "other"],
      required: true,
    },
    github: String,
    liveUrl: String,
    images: [String],
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ["completed", "in-progress", "planned", "archived"],
      default: "completed",
    },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Work Experience Interface and Schema
export interface IWorkExperience extends Document {
  company: string;
  role: string;
  period: string;
  startDate?: Date;
  endDate?: Date;
  location: string;
  description: string;
  achievements: string[];
  technologies?: string[];
  isCurrentRole: boolean;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const WorkExperienceSchema = new Schema<IWorkExperience>(
  {
    company: { type: String, required: true },
    role: { type: String, required: true },
    period: { type: String, required: true },
    startDate: Date,
    endDate: Date,
    location: { type: String, required: true },
    description: { type: String, required: true },
    achievements: [{ type: String, required: true }],
    technologies: [String],
    isCurrentRole: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Additional Section Interface and Schema (for interests, languages, etc.)
export interface IAdditionalSection extends Document {
  type: "interest" | "language" | "achievement" | "volunteer" | "other";
  title: string;
  content: any; // Flexible content structure
  description?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const AdditionalSectionSchema = new Schema<IAdditionalSection>(
  {
    type: {
      type: String,
      enum: ["interest", "language", "achievement", "volunteer", "other"],
      required: true,
    },
    title: { type: String, required: true },
    content: { type: Schema.Types.Mixed, required: true },
    description: String,
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// My Work (Portfolio) Interface and Schema
export interface IMyWork extends Document {
  title: string;
  type: "app" | "website" | "tool" | "system";
  description?: string;
  role?: string;
  company?: string;
  startDate?: Date;
  endDate?: Date;
  technologies: string[];
  responsibilities: string[];
  features: string[];
  challenges: string[];
  solutions: string[];
  impact?: {
    metrics?: string;
    businessValue?: string;
  };
  links?: {
    liveDemo?: string;
    githubRepo?: string;
    appStore?: string;
    playStore?: string;
    caseStudy?: string;
  };
  screenshots?: {
    url: string;
    caption?: string;
  }[];
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const MyWorkSchema = new Schema<IMyWork>(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["app", "website", "tool", "system"],
      required: true,
    },
    description: { type: String },
    role: { type: String },
    company: { type: String },
    startDate: Date,
    endDate: Date,
    technologies: [{ type: String, default: [] }],
    responsibilities: [{ type: String, default: [] }],
    features: [{ type: String, default: [] }],
    challenges: [{ type: String, default: [] }],
    solutions: [{ type: String, default: [] }],
    impact: {
      metrics: { type: String, default: "" },
      businessValue: { type: String, default: "" },
    },
    links: {
      liveDemo: { type: String, default: "" },
      githubRepo: { type: String, default: "" },
      appStore: { type: String, default: "" },
      playStore: { type: String, default: "" },
      caseStudy: { type: String, default: "" },
    },
    screenshots: [
      {
        url: { type: String, required: true },
        caption: { type: String, default: "" },
      },
    ],
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes for better performance
CertificationSchema.index({ displayOrder: 1, isActive: 1 });
SkillCategorySchema.index({ displayOrder: 1, isActive: 1 });
ProjectSchema.index({ displayOrder: 1, isFeatured: -1, isActive: 1 });
ProjectSchema.index({ type: 1, isActive: 1 });
WorkExperienceSchema.index({ displayOrder: 1, isCurrentRole: -1, isActive: 1 });
AdditionalSectionSchema.index({ type: 1, displayOrder: 1, isActive: 1 });
MyWorkSchema.index({ displayOrder: 1, isActive: 1 });
MyWorkSchema.index({ type: 1, isActive: 1 });

// Static methods for Projects
ProjectSchema.statics.getFeatured = function (limit = 6) {
  return this.find({
    isFeatured: true,
    isActive: true,
  })
    .sort({ displayOrder: 1 })
    .limit(limit);
};

ProjectSchema.statics.getByType = function (type: string, limit = 10) {
  return this.find({
    type,
    isActive: true,
  })
    .sort({ displayOrder: 1 })
    .limit(limit);
};

// Static methods for Work Experience
WorkExperienceSchema.statics.getCurrent = function () {
  return this.findOne({
    isCurrentRole: true,
    isActive: true,
  });
};

WorkExperienceSchema.statics.getAll = function () {
  return this.find({
    isActive: true,
  }).sort({ displayOrder: 1, startDate: -1 });
};

// Export models
export const Certification = model<ICertification>(
  "Certification",
  CertificationSchema
);
export const SkillCategory = model<ISkillCategory>(
  "SkillCategory",
  SkillCategorySchema
);
export const Project = model<IProject>("Project", ProjectSchema);
export const WorkExperience = model<IWorkExperience>(
  "WorkExperience",
  WorkExperienceSchema
);
export const AdditionalSection = model<IAdditionalSection>(
  "AdditionalSection",
  AdditionalSectionSchema
);
export const MyWork = model<IMyWork>("MyWork", MyWorkSchema);
