# Repository Management API

## Overview
Repository management endpoints for CRUD operations on stored repositories and public access to portfolio data.

## Public Endpoints (No Authentication Required)

### GET /api/repos
Get all repositories with filtering and pagination.

**Query Parameters:**
- `provider` (string) - Filter by provider (default: all)
- `featured` (boolean) - Filter featured repositories
- `hidden` (boolean) - Filter hidden repositories
- `language` (string) - Filter by programming language
- `limit` (number) - Number of results (default: 50)
- `offset` (number) - Pagination offset (default: 0)

**Response:**
```json
{
  "repos": [
    {
      "_id": "...",
      "provider": "github",
      "title": "awesome-project",
      "description": "An awesome project",
      "url": "https://github.com/user/awesome-project",
      "language": "JavaScript",
      "topics": ["react", "nodejs"],
      "isFeatured": false,
      "hidden": false,
      "fetchedAt": "2024-01-01T12:00:00.000Z"
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

## Protected Endpoints (Authentication Required)

### PATCH /api/repos/:id
Update repository metadata.

**Authentication:** Required

**Parameters:**
- `id` (string) - Repository ID

**Request Body:**
```json
{
  "isFeatured": true,
  "hidden": false,
  "title": "Updated Project Name",
  "description": "Updated description"
}
```

**Allowed Fields:**
- `isFeatured` (boolean)
- `hidden` (boolean) 
- `title` (string)
- `description` (string)

**Response:**
```json
{
  "_id": "...",
  "title": "Updated Project Name",
  "description": "Updated description",
  "isFeatured": true,
  "hidden": false
}
```

## Data Models

### Repository Object
```typescript
interface Repository {
  _id: string;
  provider: "github" | string;
  remoteId: string;
  title: string;
  description?: string;
  url?: string;
  language?: string;
  topics?: string[];
  isFeatured?: boolean;
  hidden?: boolean;
  fetchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Pagination Object
```typescript
interface Pagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}
```

## Frontend Integration Examples

### Repository List Component
```javascript
import React, { useState, useEffect } from 'react';

export function RepositoryList({ filters = {} }) {
  const [repos, setRepos] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRepos() {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          limit: '10',
          offset: '0',
          ...filters
        });

        const response = await fetch(`/api/repos?${params}`);
        const data = await response.json();

        setRepos(data.repos);
        setPagination(data.pagination);
      } catch (error) {
        console.error('Failed to fetch repositories:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRepos();
  }, [filters]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {repos.map(repo => (
        <div key={repo._id} className="repo-card">
          <h3>{repo.title}</h3>
          <p>{repo.description}</p>
          <span>Language: {repo.language}</span>
          {repo.isFeatured && <span className="featured">Featured</span>}
        </div>
      ))}
      
      {pagination?.hasMore && (
        <button onClick={() => loadMore()}>
          Load More
        </button>
      )}
    </div>
  );
}
```

### Repository Update Function
```javascript
export async function updateRepository(id, updates, token) {
  const response = await fetch(`/api/repos/${id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update repository');
  }

  return response.json();
}

// Usage
try {
  const updatedRepo = await updateRepository('repo-id', {
    isFeatured: true,
    title: 'New Title'
  }, userToken);
  
  console.log('Repository updated:', updatedRepo);
} catch (error) {
  console.error('Update failed:', error.message);
}
```

### Pagination Hook
```javascript
import { useState, useCallback } from 'react';

export function usePagination(fetchFunction, initialLimit = 10) {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: initialLimit,
    offset: 0,
    hasMore: false
  });
  const [loading, setLoading] = useState(false);

  const loadPage = useCallback(async (offset = 0, append = false) => {
    try {
      setLoading(true);
      const result = await fetchFunction({
        limit: pagination.limit,
        offset
      });

      if (append) {
        setItems(prev => [...prev, ...result.repos]);
      } else {
        setItems(result.repos);
      }

      setPagination(result.pagination);
    } catch (error) {
      console.error('Failed to load page:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, pagination.limit]);

  const loadMore = useCallback(() => {
    if (pagination.hasMore && !loading) {
      loadPage(pagination.offset + pagination.limit, true);
    }
  }, [loadPage, pagination, loading]);

  const refresh = useCallback(() => {
    loadPage(0, false);
  }, [loadPage]);

  return {
    items,
    pagination,
    loading,
    loadMore,
    refresh,
    loadPage
  };
}
```

## Error Handling

### 404 - Repository Not Found
```json
{
  "error": "Repository not found"
}
```

### 401 - Unauthorized (for protected endpoints)
```json
{
  "message": "No token provided"
}
```

### 500 - Server Error
```json
{
  "error": "Failed to fetch repositories"
}
```