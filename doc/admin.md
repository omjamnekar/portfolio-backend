# Admin Management API

## Overview
Admin management endpoints for user profile management, GitHub configuration, and system administration.

## Endpoints

### POST /admin/login
Admin user login.

**Authentication:** None

**Request Body:**
```json
{
  "identifier": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin",
    "githubUsername": "octocat",
    "lastLogin": "2024-01-01T12:00:00.000Z"
  }
}
```

### GET /admin/profile
Get admin user profile.

**Authentication:** Required

**Response:**
```json
{
  "_id": "...",
  "username": "admin",
  "email": "admin@example.com",
  "role": "admin",
  "isActive": true,
  "githubUsername": "octocat",
  "lastLogin": "2024-01-01T12:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

### PATCH /admin/profile
Update admin user profile.

**Authentication:** Required

**Request Body:**
```json
{
  "username": "newusername",
  "email": "newemail@example.com",
  "githubUsername": "newgithubuser"
}
```

**Response:**
```json
{
  "_id": "...",
  "username": "newusername",
  "email": "newemail@example.com",
  "githubUsername": "newgithubuser"
}
```

### POST /admin/change-password
Change admin user password.

**Authentication:** Required

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "message": "Password updated successfully"
}
```

### POST /admin/github/configure
Configure GitHub credentials for the admin user.

**Authentication:** Required

**Request Body:**
```json
{
  "githubToken": "ghp_...",
  "githubUsername": "octocat"
}
```

**Response:**
```json
{
  "message": "GitHub credentials configured successfully",
  "githubUsername": "octocat"
}
```

### POST /admin/github/sync
Sync GitHub repositories for the admin user.

**Authentication:** Required

**Response:**
```json
{
  "message": "GitHub repositories synced successfully",
  "success": true,
  "count": 25,
  "repos": [...]
}
```

### GET /admin/github/rate-limit
Get GitHub API rate limit information.

**Authentication:** Required

**Response:**
```json
{
  "rate": {
    "limit": 5000,
    "remaining": 4999,
    "reset": 1640995200,
    "used": 1
  },
  "resources": {
    "core": {
      "limit": 5000,
      "remaining": 4999,
      "reset": 1640995200,
      "used": 1
    }
  }
}
```

### GET /admin/github/languages
Get repository language statistics for the admin user.

**Authentication:** Required

**Response:**
```json
{
  "JavaScript": 15,
  "TypeScript": 8,
  "Python": 5,
  "Go": 2
}
```

## Frontend Integration Examples

### Admin Login Hook
```javascript
import { useState } from 'react';

export function useAdminLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (identifier, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ identifier, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      
      // Store token and user data
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}
```

### Admin Profile Management
```javascript
export class AdminService {
  constructor(token) {
    this.token = token;
    this.baseUrl = '/admin';
  }

  async getProfile() {
    const response = await fetch(`${this.baseUrl}/profile`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    return response.json();
  }

  async updateProfile(updates) {
    const response = await fetch(`${this.baseUrl}/profile`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    return response.json();
  }

  async changePassword(currentPassword, newPassword) {
    const response = await fetch(`${this.baseUrl}/change-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to change password');
    }

    return response.json();
  }

  async configureGitHub(githubToken, githubUsername) {
    const response = await fetch(`${this.baseUrl}/github/configure`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ githubToken, githubUsername })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to configure GitHub');
    }

    return response.json();
  }

  async syncGitHubRepos() {
    const response = await fetch(`${this.baseUrl}/github/sync`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to sync repositories');
    }

    return response.json();
  }
}
```

## Error Handling

Common error responses:

### 401 - Invalid Credentials
```json
{
  "error": "Invalid credentials"
}
```

### 400 - Validation Error
```json
{
  "error": "Email/username and password are required"
}
```

### 400 - GitHub Configuration Error
```json
{
  "error": "Invalid GitHub token"
}
```

### 404 - User Not Found
```json
{
  "error": "User not found"
}
```