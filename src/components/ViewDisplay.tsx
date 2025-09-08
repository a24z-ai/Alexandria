import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { CodebaseViewSummary } from 'a24z-memory';
import { AlexandriaAPI } from '@/lib/alexandria-api';

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
  
  // Initialize API client
  const apiUrl = import.meta.env.PUBLIC_ALEXANDRIA_API_URL || 'https://git-gallery.com';
  const api = new AlexandriaAPI(apiUrl);

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
    <div className="h-full flex flex-col">
      <div className="border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{manifest.repository}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {manifest.views.length} views available
          </p>
        </div>
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
      </div>

      <div className="flex-1 flex">
        {/* Sidebar with views */}
        <div className="w-80 border-r">
          <ScrollArea className="h-full">
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
          </ScrollArea>
        </div>

        {/* Main content area */}
        <div className="flex-1">
          <ScrollArea className="h-full">
            {selectedView ? (
              <div className="p-8">
                {loading ? (
                  <div className="text-muted-foreground">Loading content...</div>
                ) : error ? (
                  <div className="text-red-500">Error: {error}</div>
                ) : (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <div 
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(markdownContent) }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Select a view from the sidebar to begin reading
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

// Simple markdown renderer (in production, use a proper library)
function renderMarkdown(content: string): string {
  return content
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mb-3 mt-6">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mb-2 mt-4">$1</h3>')
    .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*)\*/g, '<em>$1</em>')
    .replace(/```(.*?)```/gs, '<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-4"><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded">$1</code>')
    .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li class="ml-4">$1</li>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>')
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/^/, '<p class="mb-4">')
    .replace(/$/, '</p>');
}