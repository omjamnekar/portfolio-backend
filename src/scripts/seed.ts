import { connectDB, disconnectDB } from "../config/index.js";
import { AdminUser } from "../models/AdminUser.js";
import { logger } from "../utils/logger.js";
import dotenv from "dotenv";

dotenv.config();

async function createAdminUser() {
  try {
    await connectDB();
    
    const adminData = {
      username: process.env.ADMIN_USERNAME || "admin",
      email: process.env.ADMIN_EMAIL || "admin@portfolio.com",
      password: process.env.ADMIN_PASSWORD || "admin123",
      githubUsername: process.env.GITHUB_USERNAME || "",
    };

    // Check if admin already exists
    const existingAdmin = await AdminUser.findOne({
      $or: [
        { email: adminData.email },
        { username: adminData.username }
      ]
    });

    if (existingAdmin) {
      logger.info("Admin user already exists:", {
        username: existingAdmin.username,
        email: existingAdmin.email
      });
      return existingAdmin;
    }

    // Create new admin user
    const admin = await (AdminUser as any).createAdmin(adminData);
    
    logger.info("Admin user created successfully:", {
      username: admin.username,
      email: admin.email,
      id: admin._id
    });

    return admin;
  } catch (error) {
    logger.error("Error creating admin user:", error);
    throw error;
  }
}

async function seed() {
  try {
    logger.info("Starting database seeding...");
    
    await createAdminUser();
    
    logger.info("Database seeding completed successfully!");
  } catch (error) {
    logger.error("Database seeding failed:", error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed();
}

export { createAdminUser, seed };