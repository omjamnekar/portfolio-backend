import { Schema, model, Document } from "mongoose";

export interface IBlogPost extends Document {
  // Core fields (all optional except Mongo _id)
  title?: string;
  slug?: string; // URL-friendly title, unique when present
  excerpt?: string;
  content?: string;
  author?: string;
  createdAt?: Date; // managed by timestamps
  updatedAt?: Date; // managed by timestamps
  tags?: string[];
  videoUrl?: string;
  coverImage?: string;
}

// Simple slugify utility (no external deps)
function slugify(input: string) {
  return input
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // remove invalid chars
    .replace(/\s+/g, "-") // spaces to dashes
    .replace(/-+/g, "-") // collapse dashes
    .replace(/^-|-$/g, ""); // trim leading/trailing dashes
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    title: { type: String },
    slug: { type: String, index: true, unique: true, sparse: true },
    excerpt: { type: String },
    content: { type: String },
    author: { type: String },
    tags: { type: [String], default: undefined },
    videoUrl: { type: String },
    coverImage: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Ensure slug exists and is unique if title/slug provided
BlogPostSchema.pre("save", async function (next) {
  const doc = this as any;

  // Normalize slug to lowercase
  if (doc.slug) {
    doc.slug = slugify(doc.slug);
  }

  // Generate slug from title if missing
  if (!doc.slug && doc.title) {
    doc.slug = slugify(doc.title);
  }

  // If no slug, nothing to enforce
  if (!doc.slug) return next();

  // Ensure uniqueness by appending -2, -3, ... if conflict
  const Model = this.constructor as any;
  let base = doc.slug;
  let candidate = base;
  let suffix = 2;

  // Only check when new or slug modified
  const needCheck = doc.isNew || doc.isModified("slug");
  if (!needCheck) return next();

  // Loop while exists another doc with same slug
  while (await Model.findOne({ slug: candidate, _id: { $ne: doc._id } })) {
    candidate = `${base}-${suffix++}`;
  }
  doc.slug = candidate;

  next();
});

// Helpful indexes
BlogPostSchema.index({ createdAt: -1 });
BlogPostSchema.index({ author: 1 });
BlogPostSchema.index({ tags: 1 });

export const BlogPost = model<IBlogPost>("BlogPost", BlogPostSchema);
