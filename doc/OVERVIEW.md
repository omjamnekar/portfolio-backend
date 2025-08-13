# Portfolio API Test Files Overview

This document provides a quick overview of all the `.http` test files available for testing the Portfolio Backend API.

## 🎯 **Portfolio API Test Files** (Main Focus)

### 📁 `tests/portfolio/` - Portfolio Data Management

#### 1. **`portfolio-public.http`** - Public Portfolio Endpoints
**No authentication required** - These are the endpoints your portfolio website will use:
```http
GET /api/portfolio/overview          # Complete portfolio overview
GET /api/portfolio/stats             # Portfolio statistics  
GET /api/portfolio/certifications    # Public certifications
GET /api/portfolio/skills            # Public skills
GET /api/portfolio/projects          # Public projects
GET /api/portfolio/projects/featured # Featured projects
GET /api/portfolio/work-experience   # Public work experience
```

### 📁 `tests/blog/` - Blog Management

#### 1. **`blog.http`** - Blog Public and Admin Endpoints
```http
GET    /api/blog                      # Public: list posts
GET    /api/blog/:idOrSlug           # Public: get post by id or slug
POST   /api/blog/admin               # Admin: create post
PATCH  /api/blog/admin/:id           # Admin: update post
DELETE /api/blog/admin/:id           # Admin: delete post
PATCH  /api/blog/admin/bulk/update   # Admin: bulk update
DELETE /api/blog/admin/bulk/delete   # Admin: bulk delete
```

#### 2. **`certifications.http`** - Certifications CRUD
**Authentication required** - Manage your certifications:
```http
GET    /api/portfolio/admin/certifications     # Get all certifications
POST   /api/portfolio/admin/certifications     # Create new certification
PATCH  /api/portfolio/admin/certifications/:id # Update certification
DELETE /api/portfolio/admin/certifications/:id # Delete certification
```
**Sample Create Request:**
```json
{
  "name": "AWS Certified Solutions Architect",
  "issuer": "Amazon Web Services",
  "issueDate": "2024-01-15",
  "credentialId": "AWS-CSA-2024-001",
  "description": "Professional-level certification"
}
```

#### 3. **`skills.http`** - Skills Categories CRUD
**Authentication required** - Manage your skill categories:
```http
GET    /api/portfolio/admin/skills     # Get all skill categories
POST   /api/portfolio/admin/skills     # Create new skill category
PATCH  /api/portfolio/admin/skills/:id # Update skill category
DELETE /api/portfolio/admin/skills/:id # Delete skill category
```
**Sample Create Request:**
```json
{
  "category": "Cloud Platforms",
  "skills": ["AWS", "Azure", "Google Cloud", "Heroku"],
  "description": "Cloud computing platforms"
}
```

#### 4. **`projects.http`** - Projects CRUD
**Authentication required** - Manage your projects:
```http
GET    /api/portfolio/admin/projects     # Get all projects
POST   /api/portfolio/admin/projects     # Create new project
PATCH  /api/portfolio/admin/projects/:id # Update project
DELETE /api/portfolio/admin/projects/:id # Delete project
POST   /api/portfolio/admin/projects/:id/toggle-featured # Toggle featured
```
**Sample Create Request:**
```json
{
  "name": "Portfolio Backend API",
  "description": "Comprehensive backend API for portfolio management",
  "technologies": ["Node.js", "Express.js", "MongoDB", "TypeScript"],
  "type": "api",
  "github": "https://github.com/username/portfolio-backend",
  "status": "completed",
  "isFeatured": true
}
```

#### 5. **`work-experience.http`** - Work Experience CRUD
**Authentication required** - Manage your work experience:
```http
GET    /api/portfolio/admin/work-experience     # Get all work experience
POST   /api/portfolio/admin/work-experience     # Create new work experience
PATCH  /api/portfolio/admin/work-experience/:id # Update work experience
DELETE /api/portfolio/admin/work-experience/:id # Delete work experience
POST   /api/portfolio/admin/work-experience/:id/set-current # Set as current role
```
**Sample Create Request:**
```json
{
  "company": "WhatBytes",
  "role": "Flutter developer",
  "period": "June 2025 to Current",
  "location": "Toronto, Canada (Remote)",
  "description": "Built high-performance Flutter apps",
  "achievements": [
    "Built high-performance Flutter apps using clean architecture",
    "Integrated with APIs and real-time data with WebSocket"
  ],
  "technologies": ["Flutter", "Dart", "WebSocket", "Bloc"],
  "isCurrentRole": true
}
```

#### 6. **`additional-sections.http`** - Additional Sections CRUD
**Authentication required** - Manage interests, languages, achievements, etc.:
```http
GET    /api/portfolio/admin/additional     # Get all additional sections
POST   /api/portfolio/admin/additional     # Create new section
PATCH  /api/portfolio/admin/additional/:id # Update section
DELETE /api/portfolio/admin/additional/:id # Delete section
```
**Sample Create Requests:**
```json
// Interests
{
  "type": "interest",
  "title": "Interests",
  "content": {
    "items": ["Coding", "Problem Solving", "Learning New Technologies"]
  }
}

// Languages
{
  "type": "language", 
  "title": "Languages",
  "content": {
    "languages": [
      {"name": "English", "proficiency": "Professional"},
      {"name": "Hindi", "proficiency": "Native"}
    ]
  }
}
```

## 🔐 **Authentication Test Files**

### 📁 `tests/auth/`

#### **`admin-auth.http`** - Admin Authentication
```http
GET  /token                    # Get test token (development)
POST /admin/login             # Admin login
GET  /admin/profile           # Get admin profile
PATCH /admin/profile          # Update admin profile
POST /admin/change-password   # Change password
```

## 🐙 **GitHub Integration Test Files**

### 📁 `tests/github/`

#### **`github-public.http`** - Public GitHub Endpoints
```http
GET /api/github/portfolio/repos          # Published repositories
GET /api/github/portfolio/repos/featured # Featured repositories
GET /api/github/portfolio/stats          # GitHub statistics
```

#### **`github-sync.http`** - GitHub Synchronization
```http
POST /api/github/fetch       # Fetch all repositories from GitHub
POST /api/github/sync-single # Sync single repository
GET  /api/github/info        # GitHub info and rate limit
```

#### **`github-management.http`** - GitHub Repository Management
```http
GET    /api/github/admin/repos        # Get all repositories (admin)
PATCH  /api/github/repos/:id          # Update repository
POST   /api/github/repos/:id/publish  # Publish repository
DELETE /api/github/repos/:id          # Delete repository
```

## 🔄 **Workflow Test Files**

### 📁 `tests/workflows/`

#### **`admin-setup.http`** - Complete Admin Setup
Step-by-step workflow for setting up the admin system.

#### **`portfolio-setup.http`** - Portfolio Data Setup  
Step-by-step workflow for creating initial portfolio data.

#### **`complete-workflow.http`** - End-to-End Testing
Complete system testing including GitHub + Portfolio integration.

## 🛠️ **Utility Test Files**

### 📁 `tests/utils/`

#### **`health-check.http`** - System Health
```http
GET / # System health check
```

#### **`error-testing.http`** - Error Scenarios
Tests for error handling, validation, and security.

## 🚀 **Quick Start Guide**

### 1. **Setup Your Environment**
```bash
# Copy environment file
cp .env.example .env

# Configure your .env file with:
# - MONGO_URI
# - JWT_SECRET  
# - GITHUB_USERNAME
# - GITHUB_TOKEN

# Start the server
npm run dev

# Seed admin user
npm run seed admin

# Seed portfolio data
npm run seed:portfolio seed
```

### 2. **Start Testing**

#### **Option A: Test Portfolio APIs (Recommended)**
1. Open `tests/portfolio/portfolio-public.http`
2. Run: `GET {{baseUrl}}/api/portfolio/overview`
3. Open `tests/auth/admin-auth.http` 
4. Run: `GET {{baseUrl}}/token` to get authentication token
5. Open any `tests/portfolio/*.http` file and start testing CRUD operations

#### **Option B: Follow Complete Workflow**
1. Open `tests/workflows/admin-setup.http`
2. Follow the step-by-step workflow
3. Open `tests/workflows/portfolio-setup.http`
4. Create sample portfolio data

### 3. **Test Your Data**
```http
# Check what you created
GET http://localhost:3000/api/portfolio/overview

# View your certifications
GET http://localhost:3000/api/portfolio/certifications

# View your projects  
GET http://localhost:3000/api/portfolio/projects

# View your skills
GET http://localhost:3000/api/portfolio/skills
```

## 📋 **What Each API Does**

### **Portfolio APIs** (Your main focus)
- **Certifications**: Store your professional certifications
- **Skills**: Organize your technical skills by categories
- **Projects**: Showcase your development projects
- **Work Experience**: Track your professional experience
- **Additional Sections**: Store interests, languages, achievements, etc.

### **GitHub APIs** (Bonus feature)
- **Sync**: Fetch repositories from your GitHub account
- **Manage**: Select which repositories to display on your portfolio
- **Publish**: Control which GitHub projects appear publicly

## 🎯 **Key Features to Test**

1. **CRUD Operations**: Create, Read, Update, Delete for all portfolio data
2. **Featured Content**: Mark projects/items as featured for homepage display
3. **Display Ordering**: Control the order items appear on your portfolio
4. **Active/Inactive**: Show/hide items without deleting them
5. **Bulk Operations**: Update multiple items at once
6. **Public vs Admin**: Separate endpoints for public display vs admin management

## 📱 **How to Use with VS Code**

1. **Install REST Client Extension**
2. **Open any `.http` file**
3. **Click "Send Request" above any HTTP request**
4. **View responses in the right panel**

## 🎉 **Ready to Test!**

You now have **200+ test scenarios** across **20+ test files** to thoroughly test your Portfolio Backend API. Start with the portfolio APIs to see your data management system in action!