import { connectDB, disconnectDB } from "../config/index.js";
import {
  Certification,
  SkillCategory,
  Project,
  WorkExperience,
  AdditionalSection,
} from "../models/Portfolio.js";
import { logger } from "../utils/logger.js";
import dotenv from "dotenv";

dotenv.config();

// Your portfolio data
const certifications = [
  {
    name: "Flutter and Dart -The Complete Guide",
    issuer: "Online Course",
    displayOrder: 1,
  },
  {
    name: "Microsoft Azure Certifications",
    issuer: "Microsoft",
    displayOrder: 2,
  },
  {
    name: "Understanding TypeScript",
    issuer: "Online Course",
    displayOrder: 3,
  },
  {
    name: "The Complete Web Development",
    issuer: "Online Course",
    displayOrder: 4,
  },
  {
    name: "Introduction to Programming Using HTML and CSS",
    issuer: "Online Course",
    displayOrder: 5,
  },
  {
    name: "Go: The complete Developer's Guide (Golang)",
    issuer: "Online Course",
    displayOrder: 6,
  },
  {
    name: "Ultimate Rust Crash Course",
    issuer: "Online Course",
    displayOrder: 7,
  },
];

const skillCategories = [
  {
    category: "Languages",
    skills: [
      "Dart",
      "HTML5",
      "CSS3",
      "JavaScript",
      "TypeScript",
      "Kotlin",
      "Python",
      "C++",
    ],
    displayOrder: 1,
  },
  {
    category: "Frameworks & Libraries",
    skills: ["Flutter", "React.js", "Flask", "Tailwind CSS", "Bootstrap"],
    displayOrder: 2,
  },
  {
    category: "Backend & APIs",
    skills: [
      "Node.js",
      "Express.js",
      "RESTful APIs",
      "gRPC",
      "JWT Authentication",
    ],
    displayOrder: 3,
  },
  {
    category: "AI & Machine Learning",
    skills: [
      "Gemini API",
      "Local LLaMA",
      "Copilot",
      "OLama",
      "RAG",
      "Cursor",
      "Windflow",
    ],
    displayOrder: 4,
  },
  {
    category: "Tools & Platforms",
    skills: [
      "Git",
      "GitHub",
      "Jira",
      "Figma",
      "Vercel",
      "Renderer",
      "Postman",
      "Firebase Studio",
    ],
    displayOrder: 5,
  },
  {
    category: "Databases",
    skills: [
      "MongoDB",
      "Firebase",
      "Supabase",
      "SQLite",
      "SQL",
      "MicrosoftSQL server",
      "PostgreSQL",
    ],
    displayOrder: 6,
  },
];

const projects = [
  {
    name: "Nutrito",
    description:
      "Food Product Analysis app using machine learning to evaluate food ingredients and compare with other products, providing alternative recommendations.",
    technologies: ["Machine Learning", "Mobile Development", "API Integration"],
    type: "mobile",
    github: "https://github.com/omjamnekar/nutrito",
    status: "completed",
    isFeatured: true,
    displayOrder: 1,
  },
  {
    name: "MealBook",
    description:
      "Pre-order app for food ordering before reaching the canteen. Features real-time updates on meals, payment gateway integration, and time-tracking functionality.",
    technologies: [
      "Flutter",
      "Payment Gateway",
      "Real-time Updates",
      "Time Tracking",
    ],
    type: "mobile",
    github: "https://github.com/omjamnekar/mealbook",
    status: "completed",
    isFeatured: true,
    displayOrder: 2,
  },
  {
    name: "Muvi",
    description:
      "Movies updates and trailers viewing app providing information about actors, movies and their trailers similar to IMDB functionality.",
    technologies: ["Flutter", "API Integration", "Media Streaming"],
    type: "mobile",
    status: "completed",
    isFeatured: true,
    displayOrder: 3,
  },
  {
    name: "Go",
    description:
      "Time and place capture app that can capture images of moments and store them in memory with location data for easy access and retrieval.",
    technologies: [
      "Flutter",
      "Location Services",
      "Image Processing",
      "Local Storage",
    ],
    type: "mobile",
    status: "completed",
    displayOrder: 4,
  },
  {
    name: "Virtual Note",
    description:
      "Cloud-based note-taking application for keeping all notes in the cloud with access from anywhere. Features synchronization across devices.",
    technologies: ["Cloud Storage", "Cross-platform", "Synchronization"],
    type: "web",
    status: "completed",
    displayOrder: 5,
  },
];

const workExperience = [
  {
    company: "WhatBytes",
    role: "Flutter developer",
    period: "June 2025 to Current",
    startDate: new Date("2025-06-01"),
    location: "Toronto, Canada (Remote)",
    description:
      "Built high-performance Flutter apps using clean architecture and responsive UI, WebSocket integration. Integrated with APIs and real-time data with sockets like Bloc and MethodChannel, like Riverpod and more often packages to build. Took part in code reviews, sprint meetings, and feature planning. Used Git, Figma, Slack, Postman for development and collaboration. Learned from mentors to improve code quality and app deployment. Contributed to each world, user-focused projects.",
    achievements: [
      "Built high-performance Flutter apps using clean architecture and responsive UI",
      "Integrated with APIs and real-time data with WebSocket",
      "Used modern state management solutions like Bloc and MethodChannel",
      "Implemented custom widgets, animations, and advanced routing/navigation patterns",
      "Participated in code reviews, sprint meetings, and feature planning",
      "Collaborated using Git, Figma, Slack, and Postman",
    ],
    technologies: [
      "Flutter",
      "Dart",
      "WebSocket",
      "Bloc",
      "Riverpod",
      "Git",
      "Figma",
      "Slack",
      "Postman",
    ],
    isCurrentRole: true,
    displayOrder: 1,
  },
];

const additionalSections = [
  // Interests
  {
    type: "interest",
    title: "Interests",
    content: {
      items: [
        "Coding",
        "Problem Solving",
        "Learning New Technologies",
        "Team Collaboration",
      ],
    },
    displayOrder: 1,
  },
  // Languages
  {
    type: "language",
    title: "Languages",
    content: {
      languages: [
        { name: "English", proficiency: "Professional" },
        { name: "Hindi", proficiency: "Native" },
      ],
    },
    displayOrder: 2,
  },
  // Achievements (placeholder)
  {
    type: "achievement",
    title: "Achievements",
    content: {
      achievements: [
        // Add your achievements here
      ],
    },
    displayOrder: 3,
  },
  // Volunteer Work (placeholder)
  {
    type: "volunteer",
    title: "Volunteer Work",
    content: {
      volunteerWork: [
        // Add your volunteer work here
      ],
    },
    displayOrder: 4,
  },
];

async function seedPortfolioData() {
  try {
    await connectDB();
    logger.info("Starting portfolio data seeding...");

    // Clear existing data (optional - comment out if you want to keep existing data)
    await Promise.all([
      Certification.deleteMany({}),
      SkillCategory.deleteMany({}),
      Project.deleteMany({}),
      WorkExperience.deleteMany({}),
      AdditionalSection.deleteMany({}),
    ]);
    logger.info("Cleared existing portfolio data");

    // Seed Certifications
    const createdCertifications = await Certification.insertMany(certifications);
    logger.info(`Created ${createdCertifications.length} certifications`);

    // Seed Skill Categories
    const createdSkillCategories = await SkillCategory.insertMany(skillCategories);
    logger.info(`Created ${createdSkillCategories.length} skill categories`);

    // Seed Projects
    const createdProjects = await Project.insertMany(projects);
    logger.info(`Created ${createdProjects.length} projects`);

    // Seed Work Experience
    const createdWorkExperience = await WorkExperience.insertMany(workExperience);
    logger.info(`Created ${createdWorkExperience.length} work experience entries`);

    // Seed Additional Sections
    const createdAdditionalSections = await AdditionalSection.insertMany(additionalSections);
    logger.info(`Created ${createdAdditionalSections.length} additional sections`);

    console.log("\n🎉 Portfolio data seeded successfully!");
    console.log("📊 Summary:");
    console.log(`   • ${createdCertifications.length} Certifications`);
    console.log(`   • ${createdSkillCategories.length} Skill Categories`);
    console.log(`   • ${createdProjects.length} Projects`);
    console.log(`   • ${createdWorkExperience.length} Work Experience entries`);
    console.log(`   • ${createdAdditionalSections.length} Additional Sections`);
    console.log("\n✅ You can now use the portfolio API endpoints!");

  } catch (error) {
    logger.error("Error seeding portfolio data:", error);
    console.error("❌ Failed to seed portfolio data:", error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

async function clearPortfolioData() {
  try {
    await connectDB();
    logger.info("Clearing all portfolio data...");

    const results = await Promise.all([
      Certification.deleteMany({}),
      SkillCategory.deleteMany({}),
      Project.deleteMany({}),
      WorkExperience.deleteMany({}),
      AdditionalSection.deleteMany({}),
    ]);

    const totalDeleted = results.reduce((sum, result) => sum + result.deletedCount, 0);
    
    console.log(`\n🗑️  Cleared ${totalDeleted} portfolio items successfully!`);
    logger.info(`Cleared ${totalDeleted} portfolio items`);

  } catch (error) {
    logger.error("Error clearing portfolio data:", error);
    console.error("❌ Failed to clear portfolio data:", error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

// Check command line arguments
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case "seed":
    seedPortfolioData();
    break;
  case "clear":
    clearPortfolioData();
    break;
  default:
    console.log("Usage:");
    console.log("  npm run seed:portfolio seed   - Seed portfolio data");
    console.log("  npm run seed:portfolio clear  - Clear all portfolio data");
    console.log("");
    seedPortfolioData(); // Default to seeding
}