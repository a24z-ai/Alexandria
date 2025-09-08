# GitHub Integration Guide

## Overview
Alexandria integrates with GitHub to fetch and display `.a24z/views.json` files from repositories. This document outlines how to prepare your repository and integrate with Alexandria.

## For Repository Owners

### 1. Create Your Views File

Create `.a24z/views.json` in your repository root:

```json
{
  "version": "1.0.0",
  "repository": "your-org/your-repo",
  "views": [
    {
      "id": "getting-started",
      "title": "Getting Started Guide",
      "description": "Learn how to use this project",
      "docPath": "docs/getting-started.md",
      "tags": ["tutorial", "beginner"],
      "type": "tutorial",
      "lastUpdated": "2024-01-15T10:00:00Z"
    },
    {
      "id": "architecture",
      "title": "Architecture Overview",
      "description": "Understanding the system design",
      "docPath": "docs/architecture.md",
      "tags": ["architecture", "advanced"],
      "type": "explanation",
      "lastUpdated": "2024-01-10T10:00:00Z"
    }
  ]
}
```

### 2. View Object Schema

Each view in the `views` array should follow this structure:

```typescript
interface A24zView {
  id: string;                    // Unique identifier for the view
  title: string;                  // Display title
  description?: string;           // Brief description (optional)
  docPath: string;                // Path to markdown file from repo root
  tags?: string[];                // Categorization tags (optional)
  type?: 'guide' | 'reference' | 'tutorial' | 'explanation'; // Document type
  lastUpdated?: string;           // ISO 8601 date string (optional)
}
```

### 3. Supported Document Types

- **`tutorial`**: Step-by-step learning content
- **`guide`**: How-to guides for specific tasks
- **`reference`**: API documentation, configuration options
- **`explanation`**: Conceptual documentation, architecture overviews

### 4. Best Practices

#### File Organization
```
your-repo/
├── .a24z/
│   └── views.json          # Views configuration
├── docs/
│   ├── getting-started.md  # Tutorial content
│   ├── architecture.md     # Explanation content
│   ├── api-reference.md    # Reference content
│   └── guides/
│       └── deployment.md   # Guide content
```

#### Writing Good Views
1. **Clear Titles**: Use descriptive, action-oriented titles
2. **Helpful Descriptions**: Briefly explain what readers will learn
3. **Consistent Tags**: Use standard tags across your organization
4. **Regular Updates**: Keep `lastUpdated` current when content changes

#### Markdown Best Practices
- Use proper heading hierarchy (# for title, ## for sections)
- Include code examples with syntax highlighting
- Add diagrams and images where helpful
- Cross-reference other views using relative links

### 5. Testing Your Integration

Before registering with Alexandria:

1. **Validate JSON**: Ensure `.a24z/views.json` is valid JSON
2. **Check Paths**: Verify all `docPath` values point to existing files
3. **Test Markdown**: Ensure markdown files render correctly
4. **Public Access**: Confirm repository is public or accessible

Use this tool to validate: `https://jsonlint.com/`

## For Alexandria Frontend

### 1. Using the Alexandria API

The frontend now uses the Alexandria API instead of direct GitHub access:

```typescript
import { AlexandriaAPI } from '@/lib/alexandria-api';

// Initialize with environment-specific URL
const apiUrl = import.meta.env.PUBLIC_ALEXANDRIA_API_URL || 'https://git-gallery.com';
const api = new AlexandriaAPI(apiUrl);

// Fetch all repositories
const data = await api.getRepositories();

// Fetch specific repository
const repo = await api.getRepository('owner', 'name');

// Register new repository
const result = await api.registerRepository({
  owner: 'owner',
  name: 'repo-name',
  branch: 'main' // optional
});
```

### 2. API Benefits

Using the Alexandria API provides:

- **Cached Data**: Repositories are cached in S3, reducing GitHub API calls
- **Auto-refresh**: Data refreshes hourly when accessed
- **Aggregated Views**: All repository views in a single response
- **CORS Support**: Proper headers for browser access
- **Error Resilience**: Falls back to cached data if GitHub is unavailable

### 3. Environment Configuration

Set the API URL in your environment:

```env
# .env file
PUBLIC_ALEXANDRIA_API_URL=http://localhost:3002  # Development
PUBLIC_ALEXANDRIA_API_URL=https://git-gallery.com # Production
```

### 4. Fetching Document Content

For markdown content, the API client can still fetch directly from GitHub:

```typescript
// This goes directly to GitHub for now
const content = await api.getViewContent('owner', 'repo', 'docs/file.md');
```

### 5. Error Handling

The API provides consistent error responses:

```typescript
try {
  const repo = await api.getRepository('owner', 'name');
} catch (error) {
  // Error codes: REPOSITORY_NOT_FOUND, RATE_LIMITED, S3_CONNECTION_ERROR, etc.
  console.error(error.message);
}
```

## GitHub Actions Integration

### Auto-validate Views on PR

Add this workflow to `.github/workflows/validate-views.yml`:

```yaml
name: Validate a24z Views

on:
  pull_request:
    paths:
      - '.a24z/views.json'
      - 'docs/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Validate JSON Structure
        run: |
          if ! jq empty .a24z/views.json; then
            echo "Invalid JSON in .a24z/views.json"
            exit 1
          fi
      
      - name: Check Document Paths
        run: |
          for path in $(jq -r '.views[].docPath' .a24z/views.json); do
            if [ ! -f "$path" ]; then
              echo "Missing document: $path"
              exit 1
            fi
          done
      
      - name: Validate Markdown
        run: |
          npm install -g markdownlint-cli
          markdownlint docs/**/*.md
```

### Auto-update Alexandria on Push

```yaml
name: Update Alexandria

on:
  push:
    branches: [main]
    paths:
      - '.a24z/views.json'

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Notify Alexandria API
        run: |
          curl -X POST https://api.alexandria.a24z.ai/v1/repos/webhook \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer ${{ secrets.ALEXANDRIA_TOKEN }}" \
            -d '{
              "owner": "${{ github.repository_owner }}",
              "name": "${{ github.event.repository.name }}",
              "event": "views_updated"
            }'
```

## Security Considerations

### 1. Content Security Policy
The frontend should implement CSP headers to prevent XSS:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               img-src 'self' https://raw.githubusercontent.com; 
               script-src 'self' 'unsafe-inline';">
```

### 2. Sanitize Markdown
Always sanitize markdown before rendering:

```typescript
import DOMPurify from 'dompurify';
import { marked } from 'marked';

function renderMarkdown(content: string) {
  const html = marked(content);
  return DOMPurify.sanitize(html);
}
```

### 3. Validate External Links
Check and mark external links:

```typescript
function processLinks(html: string) {
  return html.replace(
    /<a href="(https?:\/\/[^"]+)"/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer"'
  );
}
```

## Troubleshooting

### Views Not Appearing

1. Check `.a24z/views.json` exists in default branch
2. Verify JSON is valid
3. Ensure repository is public
4. Check browser console for fetch errors

### Documents Not Loading

1. Verify `docPath` values are correct
2. Check file exists in repository
3. Ensure markdown files are in default branch
4. Look for CORS errors in console

### Rate Limiting Issues

1. Implement caching on frontend
2. Use conditional requests with ETags
3. Consider authenticated requests
4. Batch requests where possible

## Future Enhancements

### Planned Features

1. **GitHub App Integration**: OAuth flow for private repos
2. **Webhooks**: Real-time updates when views change
3. **PR Previews**: Preview views from pull requests
4. **Analytics**: Track which views are most popular
5. **Versioning**: Support multiple versions of documentation
6. **Search**: Full-text search across all documents

### Community Contributions

We welcome contributions! Ideas for enhancement:

- GitHub Action for auto-generating views.json
- CLI tool for validating views locally
- VS Code extension for editing views
- Templates for common documentation patterns