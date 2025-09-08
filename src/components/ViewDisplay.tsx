import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { CodebaseViewSummary } from 'a24z-memory';
import { AlexandriaAPI } from '@/lib/alexandria-api';
import { ThemeToggle } from './ThemeToggle';
import { EmptyState } from './EmptyState';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import type { Components } from 'react-markdown';

// Custom components for markdown rendering
const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-4xl font-bold mb-6 mt-2 text-gray-200 dark:text-gray-300">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-3xl font-semibold mb-4 mt-8 text-gray-200 dark:text-gray-300">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-2xl font-semibold mb-3 mt-6 text-gray-300 dark:text-gray-400">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-xl font-semibold mb-2 mt-4 text-gray-300 dark:text-gray-400">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="mb-4 leading-7 text-gray-400 dark:text-gray-500">
      {children}
    </p>
  ),
  a: ({ href, children }) => (
    <a 
      href={href}
      className="text-blue-500 dark:text-blue-400 hover:underline font-medium"
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-6 mb-4 space-y-2">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-6 mb-4 space-y-2">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="text-gray-400 dark:text-gray-500">
      {children}
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-gray-600 pl-4 py-2 my-4 italic text-gray-500 dark:text-gray-600">
      {children}
    </blockquote>
  ),
  code: ({ inline, className, children }) => {
    if (inline) {
      return (
        <code className="bg-zinc-800 dark:bg-zinc-900 px-1.5 py-0.5 rounded text-sm font-mono text-gray-300 dark:text-gray-400">
          {children}
        </code>
      );
    }
    return (
      <code className={className}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="bg-zinc-900 dark:bg-zinc-950 p-4 rounded-lg overflow-x-auto mb-4 border border-border">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto mb-4">
      <table className="w-full border-collapse">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-muted">
      {children}
    </thead>
  ),
  th: ({ children }) => (
    <th className="border border-zinc-700 px-4 py-2 text-left font-semibold text-gray-300 dark:text-gray-400">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-zinc-700 px-4 py-2 text-gray-400 dark:text-gray-500">
      {children}
    </td>
  ),
  hr: () => (
    <hr className="my-8 border-zinc-700" />
  ),
  img: ({ src, alt }) => (
    <img 
      src={src} 
      alt={alt} 
      className="rounded-lg my-4 max-w-full h-auto"
    />
  ),
};

interface ViewsManifest {
  version: string;
  repository: string;
  views: CodebaseViewSummary[];
}

interface ViewDisplayProps {
  manifest: ViewsManifest;
  onBack?: () => void;
  backUrl?: string;
}

export function ViewDisplay({ manifest, onBack, backUrl }: ViewDisplayProps) {
  const [selectedView, setSelectedView] = useState<CodebaseViewSummary | null>(null);
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Load sidebar state from localStorage
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  
  // Initialize API client
  const apiUrl = import.meta.env.PUBLIC_ALEXANDRIA_API_URL || 'https://git-gallery.com';
  const api = new AlexandriaAPI(apiUrl);

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (selectedView && selectedView.overviewPath) {
      const [owner, name] = manifest.repository.split('/');
      
      const fetchContent = async () => {
        try {
          setLoading(true);
          setError(null);
          // Fetch markdown content from GitHub via API or directly
          const content = await api.getViewContent(owner, name, selectedView.overviewPath);
          setMarkdownContent(content);
        } catch (err) {
          setError('Failed to load view content');
          console.error('Error fetching view content:', err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchContent();
    }
  }, [selectedView, manifest.repository]);

  const groupedViews = manifest.views.reduce((acc, view) => {
    const category = view.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(view);
    return acc;
  }, {} as Record<string, CodebaseViewSummary[]>);

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold">
            <a 
              href={`https://github.com/${manifest.repository}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {manifest.repository.split('/')[1]}
            </a>
          </h1>
          <p className="text-base text-muted-foreground">
            by {manifest.repository.split('/')[0]}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(onBack || backUrl) && (
            onBack ? (
              <button
                onClick={onBack}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Back to repositories
              </button>
            ) : (
              <a
                href={backUrl}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Back to repositories
              </a>
            )
          )}
          <ThemeToggle />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Toggle button for sidebar */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute left-0 top-4 z-10 bg-background border border-border rounded-r-md p-2 hover:bg-accent transition-colors"
          style={{ left: sidebarCollapsed ? 0 : '320px' }}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {sidebarCollapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            )}
          </svg>
        </button>

        {/* Sidebar with views */}
        <div className={`${sidebarCollapsed ? 'w-0' : 'w-80'} border-r flex flex-col transition-all duration-300 overflow-hidden`}>
          <ScrollArea className="flex-1">
            {Object.keys(groupedViews).length > 1 ? (
              <Tabs defaultValue={Object.keys(groupedViews)[0]} className="w-full">
                <TabsList className="w-full justify-start rounded-none border-b h-auto p-0">
                  {Object.keys(groupedViews).map(category => (
                    <TabsTrigger 
                      key={category}
                      value={category}
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {Object.entries(groupedViews).map(([category, views]) => (
                  <TabsContent key={category} value={category} className="mt-0 p-4">
                    <div className="space-y-2">
                      {views.map(view => (
                        <Card
                          key={view.id}
                          className={`cursor-pointer transition-colors ${
                            selectedView?.id === view.id ? 'bg-accent' : 'hover:bg-accent/50'
                          }`}
                          onClick={() => setSelectedView(view)}
                        >
                          <CardHeader className="p-4">
                            <CardTitle className="text-sm">{view.name}</CardTitle>
                            {view.description && (
                              <CardDescription className="text-xs mt-1">
                                {view.description}
                              </CardDescription>
                            )}
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="p-4">
                <div className="space-y-2">
                  {Object.values(groupedViews)[0]?.map(view => (
                    <Card
                      key={view.id}
                      className={`cursor-pointer transition-colors ${
                        selectedView?.id === view.id ? 'bg-accent' : 'hover:bg-accent/50'
                      }`}
                      onClick={() => setSelectedView(view)}
                    >
                      <CardHeader className="p-4">
                        <CardTitle className="text-sm">{view.name}</CardTitle>
                        {view.description && (
                          <CardDescription className="text-xs mt-1">
                            {view.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            {selectedView ? (
              <div className="p-8">
                {loading ? (
                  <div className="text-muted-foreground">Loading content...</div>
                ) : error ? (
                  <div className="text-red-500">Error: {error}</div>
                ) : (
                  <div className="max-w-none">
                    <ReactMarkdown
                      components={markdownComponents}
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight, rehypeRaw]}
                    >
                      {markdownContent}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState />
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}