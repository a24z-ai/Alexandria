import { useState, useEffect } from 'react';
import { ViewDisplay } from './ViewDisplay';
import { AlexandriaAPI } from '@/lib/alexandria-api';
import type { Repository } from '@/lib/alexandria-api';
import { ThemeProvider } from 'themed-markdown';

interface RepositoryViewerProps {
  backUrl?: string;
}

export function RepositoryViewer({ backUrl }: RepositoryViewerProps) {
  const [repository, setRepository] = useState<Repository | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Parse owner and name from URL query params
    const params = new URLSearchParams(window.location.search);
    const owner = params.get('owner');
    const name = params.get('name');
    
    if (owner && name) {
      
      // Fetch repository data
      const fetchRepository = async () => {
        try {
          const apiUrl = typeof window !== 'undefined' && window.ALEXANDRIA_CONFIG?.apiUrl ? 
                         window.ALEXANDRIA_CONFIG.apiUrl :
                         import.meta.env.PUBLIC_ALEXANDRIA_API_URL || 
                         'https://git-gallery.com';
          const api = new AlexandriaAPI(apiUrl);
          const data = await api.getRepository(owner, name);
          setRepository(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch repository');
          console.error('Error fetching repository:', err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchRepository();
    } else {
      setError('Invalid repository URL');
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading repository...</div>
      </div>
    );
  }

  if (error || !repository) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error || 'Repository not found'}</p>
          <a href={backUrl} className="text-primary hover:underline">
            ← Back to repositories
          </a>
        </div>
      </div>
    );
  }

  // Transform repository data to match ViewDisplay expectations
  // Sort views alphabetically by name
  const sortedViews = [...(repository.views || [])].sort((a, b) => 
    a.name.localeCompare(b.name)
  );
  
  const manifest = {
    version: '1.0.0',
    repository: repository.id,
    views: sortedViews
  };

  return <ThemeProvider><ViewDisplay manifest={manifest} backUrl={backUrl} /></ThemeProvider>;
}