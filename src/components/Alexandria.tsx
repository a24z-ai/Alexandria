import React, { useState } from 'react';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { RepositoryCard } from './RepositoryCard';
import { mockRepositories, getViewsForRepo, allTags } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import type { Repository } from '@/data/mockData';

export function Alexandria() {
  const [searchOpen, setSearchOpen] = useState(false);

  const handleRepoSelect = (repo: Repository) => {
    // Navigate to the repository page
    window.location.href = `/repo/${repo.id}`;
  };

  // For now, show all repos
  const filteredRepos = mockRepositories;

  // Keyboard shortcut for search
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                Alexandria <span className="text-sm font-normal text-muted-foreground">by a24z</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Library of codebase views and documentation
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setSearchOpen(true)}
                className="text-sm text-muted-foreground"
              >
                Search GitHub projects
                <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Stats Section */}
        <div className="mb-8 pb-8 border-b">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{mockRepositories.length}</div>
              <div className="text-sm text-muted-foreground">Repositories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {mockRepositories.reduce((acc, repo) => {
                  const manifest = getViewsForRepo(repo.id);
                  return acc + (manifest?.views.length || 0);
                }, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Views</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{allTags.length}</div>
              <div className="text-sm text-muted-foreground">Unique Tags</div>
            </div>
          </div>
        </div>

        {/* Repository Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRepos.map(repo => (
            <RepositoryCard
              key={repo.id}
              repository={repo}
              onSelect={handleRepoSelect}
            />
          ))}
        </div>
      </main>

      {/* Command Dialog for Search */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Search repositories, views, or tags..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Repositories">
            {mockRepositories.map(repo => (
              <CommandItem
                key={repo.id}
                onSelect={() => {
                  handleRepoSelect(repo);
                  setSearchOpen(false);
                }}
              >
                <span className="font-medium">{repo.name}</span>
                <span className="text-sm text-muted-foreground ml-2">by {repo.owner}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Quick Actions">
            <CommandItem>
              <span>Submit a Repository</span>
            </CommandItem>
            <CommandItem>
              <span>View Documentation</span>
            </CommandItem>
            <CommandItem>
              <span>Report an Issue</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}