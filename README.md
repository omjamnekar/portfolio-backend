# Portfolio Backend API

A comprehensive backend system for managing portfolio repositories with GitHub integration, featuring separate endpoints for public portfolio display and admin management.

## 🏗️ Architecture Overview

This backend serves two main purposes:

1. **Portfolio Website (Public)**: Read-only access to published repositories
2. **Admin Panel (Protected)**: Full CRUD operations for repository management

### Key Features

- ✅ GitHub repository synchronization
- ✅ Selective repository publishing
- ✅ Admin authentication & authorization
- ✅ Repository categorization and metadata management
- ✅ Featured repositories system
- ✅ Bulk operations for efficient management
- ✅ Rate limiting awareness
- ✅ Comprehensive logging

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB
- GitHub Personal Access Token

### Environment Variables

Create a `.env` file:

```env
# Database
MONGO_URI=mongodb://localhost:27017/portfolio

# Authentication
JWT_SECRET=your-super-secret-jwt-key

# GitHub Integration
GITHUB_USERNAME=your-github-username
GITHUB_TOKEN=your-github-personal-access-token

# Optional GitHub OAuth (for future use)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Logging
LOG_LEVEL=INFO
LOG_TO_FILE=false
LOG_DIR=./logs

# Server
PORT=3000
```

### Installation & Setup

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Production build
npm run build
npm start

# Seed admin user (optional)
npm run seed
```

## 📊 Data Flow

```
GitHub API → Fetch Repos → Store in MongoDB → Admin Selects → Portfolio Displays
```

### Repository States

1. **Fetched**: Repository exists in database (from GitHub sync)
2. **Published**: Repository is visible on portfolio (`isPublished: true`)
3. **Featured**: Repository appears in featured section (`isFeatured: true`)
4. **Hidden**: Repository is hidden from public view (`hidden: true`)

## 🔗 API Endpoints

### Public Endpoints (Portfolio)

#### Get Published Repositories
```http
GET /api/github/portfolio/repos
```
**Query Parameters:**
- `featured` (boolean): Filter featured repositories
- `language` (string): Filter by programming language
- `category` (string): Filter by category
- `limit` (number): Number of results (default: 50)
- `offset` (number): Pagination offset (default: 0)
- `sort` (string): Sort by `displayOrder`, `stars`, `updated`, `created`, `name`
- `order` (string): `asc` or `desc`

#### Get Featured Repositories
```http
GET /api/github/portfolio/repos/featured?limit=6
```

#### Get Popular Repositories
```http
GET /api/github/portfolio/repos/popular?limit=10
```

#### Get Repositories by Language
```http
GET /api/github/portfolio/repos/language/:language?limit=10
```

#### Get Repository Statistics
```http
GET /api/github/portfolio/stats
```

### Admin Endpoints (Protected)

All admin endpoints require `Authorization: Bearer <token>` header.

#### Authentication

##### Admin Login
```http
POST /admin/login
Content-Type: application/json

{
  "identifier": "admin@example.com",
  "password": "password"
}
```

##### Get Test Token (Development)
```http
GET /token
```

#### Repository Management

##### Get All Repositories (Admin View)
```http
GET /api/github/admin/repos
Authorization: Bearer <token>
```
**Query Parameters:**
- `provider` (string): Filter by provider (default: github)
- `featured` (boolean): Filter featured repositories
- `hidden` (boolean): Filter hidden repositories
- `published` (boolean): Filter published repositories
- `language` (string): Filter by programming language
- `category` (string): Filter by category
- `isFork` (boolean): Filter fork repositories
- `limit` (number): Number of results (default: 50)
- `offset` (number): Pagination offset (default: 0)
- `sort` (string): Sort field
- `order` (string): Sort order

##### Fetch Repositories from GitHub
```http
POST /api/github/fetch
Authorization: Bearer <token>
Content-Type: application/json

{
  "options": {
    "includePrivate": false,
    "includeForks": true,
    "sort": "updated",
    "direction": "desc"
  }
}
```

##### Update Repository
```http
PATCH /api/github/repos/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "isPublished": true,
  "isFeatured": true,
  "portfolioTitle": "Custom Portfolio Title",
  "portfolioDescription": "Custom description for portfolio",
  "category": "Web Development",
  "techStack": ["React", "Node.js", "MongoDB"],
  "demoUrl": "https://demo.example.com",
  "displayOrder": 1
}
```

##### Publish Repository
```http
POST /api/github/repos/:id/publish
Authorization: Bearer <token>
Content-Type: application/json

{
  "portfolioTitle": "My Awesome Project",
  "portfolioDescription": "A detailed description for the portfolio",
  "category": "Web Development",
  "techStack": ["React", "TypeScript"],
  "demoUrl": "https://demo.example.com",
  "displayOrder": 1
}
```

##### Unpublish Repository
```http
POST /api/github/repos/:id/unpublish
Authorization: Bearer <token>
```

##### Bulk Update Repositories
```http
PATCH /api/github/repos/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "repoIds": ["repo1_id", "repo2_id"],
  "updates": {
    "category": "Web Development",
    "isPublished": true
  }
}
```

##### Delete Repository
```http
DELETE /api/github/repos/:id
Authorization: Bearer <token>
```

#### GitHub Integration

##### Get GitHub Info & Rate Limit
```http
GET /api/github/info
Authorization: Bearer <token>
```

##### Sync Single Repository
```http
POST /api/github/sync-single
Authorization: Bearer <token>
Content-Type: application/json

{
  "repoName": "my-awesome-repo"
}
```

#### Admin Profile Management

##### Get Profile
```http
GET /admin/profile
Authorization: Bearer <token>
```

##### Update Profile
```http
PATCH /admin/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "newusername",
  "email": "newemail@example.com"
}
```

##### Configure GitHub Credentials
```http
POST /admin/github/configure
Authorization: Bearer <token>
Content-Type: application/json

{
  "githubToken": "ghp_xxxxxxxxxxxx",
  "githubUsername": "your-github-username"
}
```

##### Auto-sync GitHub Repositories
```http
POST /admin/github/sync
Authorization: Bearer <token>
```

## 🗄️ Database Schema

### Repository Model
```typescript
interface IRepo {
  provider: "github" | string;
  remoteId: string;
  title: string;
  description?: string;
  url?: string;
  language?: string;
  topics?: string[];
  
  // Display Control
  isFeatured?: boolean;
  hidden?: boolean;
  isPublished?: boolean;
  
  // GitHub Metadata
  stars?: number;
  forks?: number;
  watchers?: number;
  openIssues?: number;
  size?: number;
  defaultBranch?: string;
  isPrivate?: boolean;
  isFork?: boolean;
  license?: string;
  
  // Portfolio Customization
  displayOrder?: number;
  category?: string;
  techStack?: string[];
  demoUrl?: string;
  screenshots?: string[];
  portfolioTitle?: string;
  portfolioDescription?: string;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
  pushedAt?: Date;
  fetchedAt: Date;
}
```

### Admin User Model
```typescript
interface IAdminUser {
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
}
```

## 🔄 Workflow

### For Portfolio Display
1. Repositories are fetched from GitHub via admin panel
2. Admin selects which repositories to publish (`isPublished: true`)
3. Admin can customize portfolio-specific fields (title, description, category)
4. Portfolio frontend fetches only published repositories via public endpoints
5. Featured repositories can be highlighted on homepage

### For Admin Management
1. Admin logs in to get JWT token
2. Admin can fetch new repositories from GitHub
3. Admin manages repository metadata and publishing status
4. Admin can perform bulk operations for efficiency
5. All changes are immediately reflected in public portfolio

## 🛡️ Security Features

- JWT-based authentication for admin routes
- Password hashing with bcrypt
- Rate limiting awareness for GitHub API
- Input validation and sanitization
- Secure environment variable handling
- Request logging and monitoring

## 📝 Logging

The system includes comprehensive logging:
- Request/response logging
- Database operation logging
- GitHub API interaction logging
- Error tracking and debugging
- Performance monitoring

## 🚀 Deployment

### Production Checklist

1. Set strong `JWT_SECRET`
2. Configure MongoDB connection
3. Set up GitHub Personal Access Token
4. Configure environment variables
5. Set up process manager (PM2)
6. Configure reverse proxy (Nginx)
7. Set up SSL certificates
8. Configure logging and monitoring

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.