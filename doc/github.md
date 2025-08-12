# GitHub Integration API

## Overview
The GitHub integration allows you to fetch repositories from GitHub and store them in the database for portfolio display.

## Configuration
GitHub credentials are configured via environment variables:
```env
GITHUB_USERNAME=your-github-username
GITHUB_TOKEN=ghp_your-github-personal-access-token
```

## Endpoints

### GET /api/github/info
Get GitHub configuration and rate limit information.

**Authentication:** Required

**Response:**
```json
{
  "username": "octocat",
  "configured": true,
  "rateLimit": {
    "limit": 5000,
    "remaining": 4999,
    "reset": "2024-01-01T12:00:00.000Z",
    "used": 1
  }
}
```

### POST /api/github/fetch
Fetch all repositories from GitHub and store them in the database.

**Authentication:** Required

**Request Body:**
```json
{
  "options": {
    "includePrivate": false,
    "includeForks": true,
    "sort": "updated",
    "direction": "desc"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully synced 25 repositories for octocat",
  "username": "octocat",
  "created": 5,
  "updated": 20,
  "deleted": 0,
  "total": 25,
  "repos": [...]
}
```

### POST /api/github/sync-single
Sync a single repository from GitHub.

**Authentication:** Required

**Request Body:**
```json
{
  "repoName": "Hello-World"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully synced repository: Hello-World",
  "username": "octocat",
  "repo": {
    "_id": "...",
    "title": "Hello-World",
    "description": "My first repository on GitHub!",
    "stars": 1234,
    "language": "JavaScript"
  }
}
```

### GET /api/github/repos
Get all repositories with filtering and pagination.

**Authentication:** None

**Query Parameters:**
- `provider` (string) - Filter by provider (default: "github")
- `featured` (boolean) - Filter featured repositories
- `hidden` (boolean) - Filter hidden repositories  
- `language` (string) - Filter by programming language
- `category` (string) - Filter by category
- `isFork` (boolean) - Filter fork repositories
- `limit` (number) - Number of results (default: 50)
- `offset` (number) - Pagination offset (default: 0)
- `sort` (string) - Sort field: "stars", "updated", "created", "name" (default: "stars")
- `order` (string) - Sort order: "asc", "desc" (default: "desc")

**Response:**
```json
{
  "repos": [
    {
      "_id": "...",
      "provider": "github",
      "title": "awesome-project",
      "description": "An awesome project",
      "url": "https://github.com/octocat/awesome-project",
      "language": "JavaScript",
      "topics": ["react", "nodejs"],
      "stars": 1234,
      "forks": 56,
      "isFeatured": true,
      "hidden": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-02T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

### GET /api/github/repos/featured
Get featured repositories.

**Authentication:** None

**Query Parameters:**
- `limit` (number) - Number of results (default: 6)

**Response:**
```json
{
  "repos": [...],
  "count": 6
}
```

### GET /api/github/repos/popular
Get popular repositories sorted by stars.

**Authentication:** None

**Query Parameters:**
- `limit` (number) - Number of results (default: 10)

**Response:**
```json
{
  "repos": [...],
  "count": 10
}
```

### GET /api/github/repos/language/:language
Get repositories by programming language.

**Authentication:** None

**Parameters:**
- `language` (string) - Programming language name

**Query Parameters:**
- `limit` (number) - Number of results (default: 10)

**Response:**
```json
{
  "language": "JavaScript",
  "repos": [...],
  "count": 15
}
```

### GET /api/github/repos/stats
Get repository statistics.

**Authentication:** None

**Query Parameters:**
- `provider` (string) - Filter by provider

**Response:**
```json
{
  "total": 25,
  "featured": 6,
  "languages": [
    { "_id": "JavaScript", "count": 10 },
    { "_id": "Python", "count": 8 },
    { "_id": "TypeScript", "count": 5 }
  ],
  "providers": [
    { "_id": "github", "count": 25 }
  ],
  "recentlyFetched": [...]
}
```

### PATCH /api/github/repos/:id
Update repository metadata for portfolio customization.

**Authentication:** Required

**Parameters:**
- `id` (string) - Repository ID

**Request Body:**
```json
{
  "isFeatured": true,
  "category": "Web Development",
  "techStack": ["React", "Node.js", "MongoDB"],
  "demoUrl": "https://demo.example.com",
  "displayOrder": 1
}
```

**Response:**
```json
{
  "_id": "...",
  "title": "awesome-project",
  "isFeatured": true,
  "category": "Web Development",
  "techStack": ["React", "Node.js", "MongoDB"],
  "demoUrl": "https://demo.example.com",
  "displayOrder": 1
}
```

### DELETE /api/github/repos/:id
Delete a repository from the database.

**Authentication:** Required

**Parameters:**
- `id` (string) - Repository ID

**Response:**
```json
{
  "message": "Repository deleted successfully",
  "deletedRepo": {
    "id": "...",
    "title": "awesome-project",
    "provider": "github"
  }
}
```

## Frontend Integration Examples

### React Hook for Repositories
```javascript
import { useState, useEffect } from 'react';

export function useRepositories(filters = {}) {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRepos() {
      try {
        setLoading(true);
        const params = new URLSearchParams(filters);
        const response = await fetch(`/api/github/repos?${params}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch repositories');
        }
        
        const data = await response.json();
        setRepos(data.repos);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRepos();
  }, [filters]);

  return { repos, loading, error };
}
```

### Sync Repositories Function
```javascript
export async function syncGitHubRepos(token) {
  const response = await fetch('/api/github/fetch', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      options: {
        includeForks: false,
        includePrivate: false
      }
    })
  });

  if (!response.ok) {
    throw new Error('Failed to sync repositories');
  }

  return response.json();
}
```

## Error Handling

Common error responses:

### 500 - GitHub Not Configured
```json
{
  "error": "Failed to fetch GitHub repositories",
  "message": "GitHub credentials not configured. Please set GITHUB_USERNAME and GITHUB_TOKEN in environment variables."
}
```

### 401 - Unauthorized
```json
{
  "message": "No token provided"
}
```

### 404 - Repository Not Found
```json
{
  "error": "Repository not found"
}
```