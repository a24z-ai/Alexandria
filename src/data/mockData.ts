export interface A24zView {
  id: string;
  title: string;
  description?: string;
  docPath: string;
  tags?: string[];
  type?: 'guide' | 'reference' | 'tutorial' | 'explanation';
  lastUpdated?: string;
}

export interface Repository {
  id: string;
  owner: string;
  name: string;
  description?: string;
  stars: number;
  viewsUrl: string;
  hasViews: boolean;
  hasDocs: boolean;
  lastUpdated: string;
}

export interface ViewsManifest {
  version: string;
  repository: string;
  views: A24zView[];
}

// Mock repositories
export const mockRepositories: Repository[] = [
  {
    id: 'anthropics/claude-code',
    owner: 'anthropics',
    name: 'claude-code',
    description: 'Official VS Code extension for Claude',
    stars: 1234,
    viewsUrl: 'https://raw.githubusercontent.com/anthropics/claude-code/main/.a24z/views.json',
    hasViews: true,
    hasDocs: true,
    lastUpdated: '2024-01-15T10:00:00Z'
  },
  {
    id: 'vercel/next.js',
    owner: 'vercel',
    name: 'next.js',
    description: 'The React Framework for Production',
    stars: 98765,
    viewsUrl: 'https://raw.githubusercontent.com/vercel/next.js/main/.a24z/views.json',
    hasViews: true,
    hasDocs: true,
    lastUpdated: '2024-01-14T15:30:00Z'
  },
  {
    id: 'shadcn-ui/ui',
    owner: 'shadcn-ui',
    name: 'ui',
    description: 'Beautifully designed components built with Radix UI and Tailwind CSS',
    stars: 45678,
    viewsUrl: 'https://raw.githubusercontent.com/shadcn-ui/ui/main/.a24z/views.json',
    hasViews: true,
    hasDocs: false,
    lastUpdated: '2024-01-13T09:00:00Z'
  }
];

// Mock views for anthropics/claude-code
export const mockClaudeViews: ViewsManifest = {
  version: '1.0.0',
  repository: 'anthropics/claude-code',
  views: [
    {
      id: 'getting-started',
      title: 'Getting Started with Claude Code',
      description: 'Learn how to set up and use Claude Code effectively',
      docPath: 'docs/getting-started.md',
      tags: ['tutorial', 'beginner'],
      type: 'tutorial',
      lastUpdated: '2024-01-15T10:00:00Z'
    },
    {
      id: 'architecture-overview',
      title: 'Architecture Overview',
      description: 'Understanding the Claude Code architecture and design decisions',
      docPath: 'docs/architecture.md',
      tags: ['architecture', 'design', 'advanced'],
      type: 'explanation',
      lastUpdated: '2024-01-10T10:00:00Z'
    },
    {
      id: 'api-reference',
      title: 'API Reference',
      description: 'Complete API documentation for Claude Code extensions',
      docPath: 'docs/api-reference.md',
      tags: ['api', 'reference'],
      type: 'reference',
      lastUpdated: '2024-01-12T10:00:00Z'
    },
    {
      id: 'authentication-pattern',
      title: 'Authentication Pattern',
      description: 'Best practices for implementing authentication in Claude Code',
      docPath: 'docs/patterns/authentication.md',
      tags: ['pattern', 'authentication', 'security'],
      type: 'guide',
      lastUpdated: '2024-01-08T10:00:00Z'
    }
  ]
};

// Mock views for vercel/next.js
export const mockNextViews: ViewsManifest = {
  version: '1.0.0',
  repository: 'vercel/next.js',
  views: [
    {
      id: 'app-router-guide',
      title: 'App Router Complete Guide',
      description: 'Master the Next.js App Router with this comprehensive guide',
      docPath: 'docs/app-router.md',
      tags: ['routing', 'app-router', 'guide'],
      type: 'guide',
      lastUpdated: '2024-01-14T15:30:00Z'
    },
    {
      id: 'server-components',
      title: 'React Server Components',
      description: 'Understanding and using React Server Components in Next.js',
      docPath: 'docs/server-components.md',
      tags: ['react', 'server-components', 'performance'],
      type: 'explanation',
      lastUpdated: '2024-01-13T10:00:00Z'
    },
    {
      id: 'data-fetching',
      title: 'Data Fetching Patterns',
      description: 'Best practices for fetching data in Next.js applications',
      docPath: 'docs/data-fetching.md',
      tags: ['data', 'patterns', 'api'],
      type: 'guide',
      lastUpdated: '2024-01-11T10:00:00Z'
    }
  ]
};

// Mock markdown content
export const mockMarkdownContent = `# Getting Started with Claude Code

Welcome to Claude Code! This guide will help you get started with the official VS Code extension for Claude.

## Installation

1. Open VS Code
2. Go to Extensions (Cmd+Shift+X)
3. Search for "Claude Code"
4. Click Install

## Configuration

After installation, you'll need to configure your API key:

\`\`\`json
{
  "claude.apiKey": "your-api-key-here",
  "claude.model": "claude-3-opus",
  "claude.temperature": 0.7
}
\`\`\`

## Basic Usage

Once configured, you can start using Claude Code:

- **Cmd+K**: Open Claude chat
- **Cmd+Shift+K**: Generate code
- **Cmd+Alt+K**: Explain code

## Features

### Code Generation
Claude can generate code based on your natural language descriptions. Simply describe what you want and Claude will generate the appropriate code.

### Code Explanation
Select any piece of code and ask Claude to explain it. Great for understanding complex codebases.

### Refactoring
Claude can help refactor your code to be more efficient, readable, and maintainable.

## Best Practices

1. **Be specific**: The more specific your requests, the better Claude's responses
2. **Provide context**: Include relevant code context when asking questions
3. **Iterate**: Don't hesitate to refine your requests based on Claude's responses

## Troubleshooting

### API Key Issues
If you're having trouble with your API key:
- Ensure it's correctly set in settings
- Check that it has the necessary permissions
- Try regenerating the key if issues persist

### Performance
For better performance:
- Use specific file contexts
- Break down large requests
- Clear conversation history periodically

## Next Steps

- Check out our [Architecture Overview](./architecture.md)
- Browse the [API Reference](./api-reference.md)
- Learn about [Authentication Patterns](./patterns/authentication.md)
`;

// Helper to get views by repo
export function getViewsForRepo(repoId: string): ViewsManifest | null {
  switch(repoId) {
    case 'anthropics/claude-code':
      return mockClaudeViews;
    case 'vercel/next.js':
      return mockNextViews;
    default:
      return null;
  }
}

// All unique tags
export const allTags = Array.from(new Set([
  ...mockClaudeViews.views.flatMap(v => v.tags || []),
  ...mockNextViews.views.flatMap(v => v.tags || [])
]));