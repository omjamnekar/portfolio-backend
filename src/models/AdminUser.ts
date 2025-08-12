import { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";

export interface IAdminUser extends Document {
  username: string;
  email: string;
  password: string;
  role: "admin" | "moderator";
  isActive: boolean;
  lastLogin?: Date;
  githubToken?: string;
  githubUsername?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AdminUserSchema = new Schema<IAdminUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["admin", "moderator"],
      default: "admin",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    githubToken: {
      type: String,
      select: false, // Don't include in queries by default
    },
    githubUsername: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
AdminUserSchema.index({ email: 1 });
AdminUserSchema.index({ username: 1 });

// Hash password before saving
AdminUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method to compare passwords
AdminUserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Static method to find user by email or username
AdminUserSchema.statics.findByEmailOrUsername = function (identifier: string) {
  return this.findOne({
    $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
    isActive: true,
  });
};

// Static method to create admin user
AdminUserSchema.statics.createAdmin = async function (userData: {
  username: string;
  email: string;
  password: string;
  githubUsername?: string;
}) {
  const existingUser = await this.findOne({
    $or: [
      { email: userData.email.toLowerCase() },
      { username: userData.username },
    ],
  });

  if (existingUser) {
    throw new Error("User with this email or username already exists");
  }

  return this.create({
    ...userData,
    email: userData.email.toLowerCase(),
    role: "admin",
  });
};

// Remove password from JSON output
AdminUserSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.githubToken;
  return userObject;
};

export const AdminUser = model<IAdminUser>("AdminUser", AdminUserSchema);
