# Alexandria by a24z

> 📚 Library of Codebase Views

Alexandria is a centralized platform for discovering and browsing a24z-memory documentation across GitHub repositories. It provides a beautiful, searchable interface for exploring technical documentation, architectural decisions, and development patterns.

🌐 **Live Site**: [https://a24z-ai.github.io/Alexandria](https://a24z-ai.github.io/Alexandria)

## Features

- 🔍 **Browse Repositories** - Discover projects using a24z-memory format
- 📖 **View Documentation** - Read structured documentation with syntax highlighting
- 🏷️ **Organized Content** - Views organized by type (tutorials, guides, references)
- 🔗 **Shareable URLs** - Direct links to specific repository documentation
- ⚡ **Fast & Static** - Built with Astro and deployed on GitHub Pages
- 🎨 **Beautiful UI** - Modern interface with shadcn/ui components
- 🔗 **GitHub Integration** - Quick access to source repositories via GitHub button in viewer

## Project Structure

```
Alexandria/
├── src/
│   ├── components/         # React components
│   │   ├── Alexandria.tsx  # Main app component
│   │   ├── ViewDisplay.tsx # Document viewer
│   │   └── ui/            # shadcn/ui components
│   ├── pages/             # Astro pages
│   │   ├── index.astro    # Homepage
│   │   └── repo/[owner]/[name].astro # Repository views
│   └── data/              # Mock data (temporary)
├── docs/                  # Documentation
│   ├── API_REQUIREMENTS.md    # API specification
│   └── GITHUB_INTEGRATION.md  # Integration guide
└── .github/workflows/     # GitHub Actions for deployment
```

## Technology Stack

- **Framework**: [Astro](https://astro.build) - Static site generator
- **UI Library**: [React](https://react.dev) - For interactive components
- **Components**: [shadcn/ui](https://ui.shadcn.com) - Beautiful, accessible components
- **Styling**: [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- **Package Manager**: [Bun](https://bun.sh) - Fast all-in-one toolkit
- **Deployment**: GitHub Pages with GitHub Actions

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed
- Node.js 18+ (as fallback)
- Git

### Development

```bash
# Clone the repository
git clone https://github.com/a24z-ai/Alexandria.git
cd Alexandria

# Install dependencies
bun install

# Start development server
bun run dev

# Open http://localhost:4321
```

### Building for Production

```bash
# Build the static site
bun run build

# Preview production build
bun run preview
```

## Adding Your Repository

To add your repository to Alexandria:

1. **Create `.a24z/views.json`** in your repository:

```json
{
  "version": "1.0.0",
  "repository": "your-org/your-repo",
  "views": [
    {
      "id": "getting-started",
      "title": "Getting Started",
      "description": "Learn how to use this project",
      "docPath": "docs/getting-started.md",
      "tags": ["tutorial", "beginner"],
      "type": "tutorial"
    }
  ]
}
```

2. **View your repository in Alexandria**:
   - Example: [a24z-memory setup guide](https://a24z-ai.github.io/Alexandria/repo/?owner=a24z-ai&name=a24z-memory&view=setup-guide)

3. **Register your repository** (coming soon via API)

See [GitHub Integration Guide](./docs/GITHUB_INTEGRATION.md) for detailed instructions.

## Documentation

- [API Requirements](./docs/API_REQUIREMENTS.md) - Backend API specification
- [GitHub Integration](./docs/GITHUB_INTEGRATION.md) - How to integrate your repository

## Next Steps

### Phase 1: Current (MVP)
- ✅ Static site with mock data
- ✅ Repository browsing interface
- ✅ Markdown rendering
- ✅ GitHub Pages deployment

### Phase 2: API Integration
- [ ] Build registry API backend
- [ ] Connect frontend to live API
- [ ] Implement repository registration
- [ ] Add search functionality

### Phase 3: Enhanced Features
- [ ] GitHub authentication for private repos
- [ ] Real-time updates via webhooks
- [ ] Full-text search across documents
- [ ] Analytics and popular content

### Phase 4: Community Features
- [ ] User submissions via pull requests
- [ ] Comments and discussions
- [ ] Version history tracking
- [ ] Multi-language support

## Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server at http://localhost:4321 |
| `bun run build` | Build production site to `./dist/` |
| `bun run preview` | Preview production build locally |
| `bun install <package>` | Add a new dependency |

## Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT - See [LICENSE](./LICENSE) file for details

## Acknowledgments

- Built with [Astro](https://astro.build)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Deployed on [GitHub Pages](https://pages.github.com)
- Part of the [a24z-memory](https://github.com/a24z-ai/a24z-memory) ecosystem

---

Built with ❤️ by [a24z](https://github.com/a24z-ai)