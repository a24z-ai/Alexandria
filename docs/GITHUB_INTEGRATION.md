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

### 1. Fetching Views Data

The frontend fetches views directly from GitHub:

```typescript
async function fetchViews(owner: string, repo: string, branch = 'main') {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/.a24z/views.json`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Views not found');
    
    const data = await response.json();
    return validateViewsManifest(data);
  } catch (error) {
    console.error(`Failed to fetch views for ${owner}/${repo}:`, error);
    return null;
  }
}
```

### 2. Fetching Document Content

Fetch the actual markdown content:

```typescript
async function fetchDocument(owner: string, repo: string, docPath: string, branch = 'main') {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${docPath}`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error('Document not found');
  
  return response.text();
}
```

### 3. Handling Private Repositories

For private repositories, you'll need authentication:

```typescript
const headers = {
  'Authorization': `token ${GITHUB_TOKEN}`,
  'Accept': 'application/vnd.github.v3.raw'
};

const response = await fetch(url, { headers });
```

### 4. Rate Limiting

GitHub API rate limits:
- **Unauthenticated**: 60 requests/hour per IP
- **Authenticated**: 5,000 requests/hour per token

Use conditional requests to minimize API calls:

```typescript
const headers = {
  'If-None-Match': etag, // From previous response
};
```

### 5. Caching Strategy

Implement client-side caching:

```typescript
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

class ViewsCache {
  private cache = new Map();
  
  set(key: string, data: any) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  
  get(key: string) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
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