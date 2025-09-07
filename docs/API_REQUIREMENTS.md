# API Requirements for Alexandria

## Overview
Alexandria requires a registry API to manage repository discovery and provide additional documentation structure. The frontend fetches `.a24z/views.json` directly from GitHub, but uses the API for repository registration and organization.

## Base URL
```
https://api.your-domain.com/v1
```

## Endpoints

### 1. List Registered Repositories
**GET** `/repos`

Returns all registered repositories with their metadata.

#### Response
```json
{
  "repositories": [
    {
      "id": "anthropics/claude-code",
      "owner": "anthropics",
      "name": "claude-code",
      "description": "Official VS Code extension for Claude",
      "stars": 1234,
      "hasViews": true,
      "hasDocs": true,
      "viewsUrl": "https://raw.githubusercontent.com/anthropics/claude-code/main/.a24z/views.json",
      "lastUpdated": "2024-01-15T10:00:00Z",
      "tags": ["vscode", "ai", "extension"]
    }
  ],
  "total": 42,
  "lastUpdated": "2024-01-15T12:00:00Z"
}
```

### 2. Get Repository Details
**GET** `/repos/:owner/:name`

Returns detailed information about a specific repository.

#### Response
```json
{
  "id": "anthropics/claude-code",
  "owner": "anthropics",
  "name": "claude-code",
  "description": "Official VS Code extension for Claude",
  "stars": 1234,
  "hasViews": true,
  "hasDocs": true,
  "viewsUrl": "https://raw.githubusercontent.com/anthropics/claude-code/main/.a24z/views.json",
  "additionalDocs": {
    "sections": [
      {
        "title": "Getting Started",
        "path": "README.md",
        "type": "markdown"
      },
      {
        "title": "Architecture Guide",
        "path": "docs/architecture.md",
        "type": "markdown"
      }
    ]
  },
  "metadata": {
    "primaryLanguage": "TypeScript",
    "topics": ["vscode", "ai", "claude"],
    "license": "MIT",
    "lastCommit": "2024-01-15T09:00:00Z"
  }
}
```

### 3. Get Repository Documentation Structure
**GET** `/repos/:owner/:name/docs`

Returns the organized documentation structure for additional docs (beyond .a24z/views).

#### Response
```json
{
  "repository": "anthropics/claude-code",
  "sections": [
    {
      "id": "getting-started",
      "title": "Getting Started",
      "path": "README.md",
      "type": "guide",
      "order": 1
    },
    {
      "id": "architecture",
      "title": "Architecture",
      "path": "docs/architecture.md",
      "type": "reference",
      "order": 2
    },
    {
      "id": "contributing",
      "title": "Contributing",
      "path": "CONTRIBUTING.md",
      "type": "guide",
      "order": 3
    }
  ]
}
```

### 4. Register New Repository
**POST** `/repos`

Register a new repository with the Alexandria library.

#### Request Body
```json
{
  "owner": "organization",
  "name": "repository",
  "branch": "main" // optional, defaults to "main"
}
```

#### Response
```json
{
  "success": true,
  "repository": {
    "id": "organization/repository",
    "owner": "organization",
    "name": "repository",
    "status": "indexing",
    "message": "Repository registered successfully. Indexing in progress..."
  }
}
```

### 5. Search Repositories
**GET** `/search`

Search across all registered repositories.

#### Query Parameters
- `q` - Search query (required)
- `type` - Filter by content type: `views`, `docs`, `all` (optional)
- `tags` - Comma-separated list of tags (optional)
- `limit` - Number of results (default: 20, max: 100)
- `offset` - Pagination offset (default: 0)

#### Response
```json
{
  "results": [
    {
      "repository": "anthropics/claude-code",
      "matches": [
        {
          "type": "view",
          "title": "Authentication Pattern",
          "path": "docs/patterns/authentication.md",
          "excerpt": "...implementing authentication in Claude Code...",
          "score": 0.95
        }
      ]
    }
  ],
  "total": 15,
  "query": "authentication"
}
```

### 6. Get Statistics
**GET** `/stats`

Returns aggregate statistics about the library.

#### Response
```json
{
  "repositories": {
    "total": 42,
    "withViews": 38,
    "withDocs": 35
  },
  "content": {
    "totalViews": 523,
    "totalDocs": 187,
    "uniqueTags": 67
  },
  "activity": {
    "recentlyUpdated": 12,
    "addedThisWeek": 3
  },
  "lastUpdated": "2024-01-15T12:00:00Z"
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": {
    "code": "REPOSITORY_NOT_FOUND",
    "message": "Repository 'owner/name' not found",
    "details": {}
  },
  "status": 404
}
```

Common error codes:
- `REPOSITORY_NOT_FOUND` - 404
- `INVALID_REQUEST` - 400
- `RATE_LIMITED` - 429
- `SERVER_ERROR` - 500
- `GITHUB_API_ERROR` - 502

## Authentication (Optional)

For repository registration and management:

```
Authorization: Bearer <api-token>
```

## Rate Limiting

- Public endpoints: 100 requests/minute per IP
- Authenticated endpoints: 1000 requests/minute per token
- Headers returned:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## CORS Configuration

The API should allow CORS from:
- `https://a24z-ai.github.io`
- `http://localhost:4321` (development)
- Custom domains if configured

## Caching Strategy

- Repository list: Cache for 5 minutes
- Repository details: Cache for 10 minutes
- Views data: Fetch directly from GitHub (no caching)
- Search results: Cache for 1 minute

## Implementation Notes

1. **Views Data**: The API doesn't store .a24z/views.json content. The frontend fetches this directly from GitHub to ensure freshness.

2. **Repository Discovery**: The API can implement various discovery mechanisms:
   - Manual registration via POST endpoint
   - GitHub search API for repos with `.a24z` directories
   - Webhook integration for automatic updates

3. **Scalability**: Consider using:
   - Redis for caching
   - PostgreSQL for repository metadata
   - Background jobs for indexing

4. **GitHub Integration**: The API needs a GitHub token for:
   - Fetching repository metadata (stars, description)
   - Checking for .a24z directory existence
   - Getting additional documentation structure