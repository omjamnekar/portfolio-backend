# API Testing Guide

This directory contains comprehensive HTTP test files for the Portfolio Backend API. Use these files with REST Client extension in VS Code or any HTTP client that supports `.http` files.

## 📁 Folder Structure

```
tests/
├── README.md                    # This file
├── auth/                        # Authentication related tests
│   ├── admin-auth.http         # Admin login and profile management
│   └── github-oauth.http       # GitHub OAuth tests
├── github/                      # GitHub integration tests
│   ├── github-sync.http        # Repository synchronization
│   ├── github-management.http  # Repository CRUD operations
│   └── github-public.http      # Public GitHub endpoints
├── portfolio/                   # Portfolio data management tests
│   ├── certifications.http     # Certifications CRUD
│   ├── skills.http             # Skills CRUD
│   ├── projects.http           # Projects CRUD
│   ├── work-experience.http    # Work Experience CRUD
│   ├── additional-sections.http # Additional sections CRUD
│   └── portfolio-public.http   # Public portfolio endpoints
├── workflows/                   # End-to-end workflow tests
│   ├── admin-setup.http        # Initial admin setup workflow
│   ├── portfolio-setup.http    # Portfolio data setup workflow
│   └── complete-workflow.http  # Complete system workflow
└── utils/                       # Utility and system tests
    ├── health-check.http       # System health and status
    └── error-testing.http      # Error scenarios and edge cases
```

## 🚀 Quick Start

### 1. Setup Environment
- Copy `.env.example` to `.env` and configure your settings
- Start the server: `npm run dev`
- Seed admin user: `npm run seed admin`
- Seed portfolio data: `npm run seed:portfolio seed`

### 2. Get Authentication Token
Run any file in `auth/` folder to get a JWT token, or use:
```http
GET http://localhost:3000/token
```

### 3. Test Workflows
Start with files in `workflows/` folder for complete end-to-end testing.

## 📝 Usage Instructions

### Variables
All test files use these common variables:
- `@baseUrl` - API base URL (default: http://localhost:3000)
- `@token` - JWT token from login response

### Authentication
Most admin endpoints require authentication. Get a token first:
```http
# In any .http file
@token = {{login.response.body.token}}
```

### Testing Order
1. **System Health**: `utils/health-check.http`
2. **Authentication**: `auth/admin-auth.http`
3. **Workflows**: `workflows/admin-setup.http`
4. **Individual APIs**: Test specific endpoints as needed

## 🔧 Configuration

### Base URL
Update the base URL in each file if needed:
```http
@baseUrl = http://localhost:3000
# or for production
@baseUrl = https://your-api-domain.com
```

### Environment-Specific Testing
- **Development**: Use `http://localhost:3000`
- **Staging**: Use your staging URL
- **Production**: Use your production URL (be careful!)

## 📊 Test Categories

### Authentication Tests (`auth/`)
- Admin login/logout
- Profile management
- Password changes
- GitHub OAuth integration

### GitHub Integration Tests (`github/`)
- Repository synchronization
- Repository management
- Public repository endpoints
- Rate limiting tests

### Portfolio Data Tests (`portfolio/`)
- Complete CRUD operations for all portfolio entities
- Public portfolio endpoints
- Bulk operations
- Filtering and sorting

### Workflow Tests (`workflows/`)
- Complete system setup
- End-to-end user journeys
- Integration testing scenarios

### Utility Tests (`utils/`)
- Health checks
- Error handling
- Edge cases
- Performance testing

## 🐛 Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check if token is valid
   - Re-run authentication tests

2. **404 Not Found**
   - Verify the endpoint URL
   - Check if the resource exists

3. **500 Internal Server Error**
   - Check server logs
   - Verify database connection
   - Check environment variables

### Debug Tips
- Use `utils/health-check.http` to verify system status
- Check server logs for detailed error information
- Verify environment variables are set correctly

## 📚 Additional Resources

- [API Documentation](../API_DOCUMENTATION.md)
- [Deployment Guide](../DEPLOYMENT.md)
- [Main README](../README.md)

## 🤝 Contributing

When adding new tests:
1. Follow the existing folder structure
2. Use descriptive file names
3. Include comments explaining test scenarios
4. Update this README if adding new categories