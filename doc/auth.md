# Authentication API

## Overview
The authentication system provides JWT-based authentication for admin users and GitHub OAuth integration.

## Endpoints

### GET /token
Get a test JWT token for development purposes.

**Authentication:** None

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Test token generated"
}
```

**Note:** This endpoint is for development only. In production, use proper login endpoints.

### GET /auth/github/callback
GitHub OAuth callback endpoint.

**Authentication:** None

**Query Parameters:**
- `code` (string) - OAuth authorization code from GitHub

**Response:**
```json
{
  "jwtToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "githubAccessToken": "gho_...",
  "user": {
    "id": 12345,
    "login": "octocat",
    "name": "The Octocat",
    "email": "octocat@github.com"
  }
}
```

## Frontend Integration

### GitHub OAuth Flow
```javascript
// 1. Redirect user to GitHub OAuth
const clientId = 'your-github-client-id';
const redirectUri = 'http://localhost:3000/auth/github/callback';
const scope = 'user:email';

window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

// 2. Handle callback (in your callback component)
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

if (code) {
  const response = await fetch(`/auth/github/callback?code=${code}`);
  const { jwtToken, user } = await response.json();
  
  // Store token and user info
  localStorage.setItem('token', jwtToken);
  localStorage.setItem('user', JSON.stringify(user));
}
```

### Token Usage
```javascript
// Get stored token
const token = localStorage.getItem('token');

// Use in API requests
const response = await fetch('/api/protected-endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Token Validation
```javascript
function isTokenValid(token) {
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
```

## Security Notes

1. **Token Storage**: Store JWT tokens securely (httpOnly cookies recommended for production)
2. **Token Expiration**: Check token expiration before making API calls
3. **HTTPS**: Always use HTTPS in production
4. **Environment Variables**: Keep OAuth secrets in environment variables
5. **Validation**: Always validate tokens on the server side