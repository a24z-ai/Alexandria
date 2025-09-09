import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { CodebaseViewSummary } from 'a24z-memory';
import { AlexandriaAPI } from '@/lib/alexandria-api';
import { ThemeToggle } from './ThemeToggle';
import { FontScaleControls } from './FontScaleControls';
import { EmptyState } from './EmptyState';
import { BookOpen } from 'lucide-react';
import { IndustryMarkdownSlide, ThemeProvider } from 'themed-markdown';
import 'themed-markdown/dist/index.css';
import { alexandriaTheme } from '@/lib/alexandria-theme';

// Dynamically import mermaid and make it globally available
if (typeof window !== 'undefined') {
  import('mermaid').then((mermaidModule) => {
    (window as Window & { mermaid?: typeof mermaidModule.default }).mermaid = mermaidModule.default;
  });
}

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
  const [fontScale, setFontScale] = useState<number>(1);
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

  // Initialize and listen for font scale changes
  useEffect(() => {
    // Initialize font scale from localStorage
    const savedScale = localStorage.getItem('fontScale');
    if (savedScale) {
      setFontScale(parseFloat(savedScale));
    }

    // Listen for font scale changes from FontScaleControls
    const handleFontScaleChange = (event: CustomEvent) => {
      setFontScale(event.detail.fontScale);
    };

    window.addEventListener('fontScaleChange', handleFontScaleChange as EventListener);
    
    return () => {
      window.removeEventListener('fontScaleChange', handleFontScaleChange as EventListener);
    };
  }, []);


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
        <div className="flex items-center gap-3">
          <BookOpen className="h-10 w-10 text-primary" />
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
          <FontScaleControls />
          <ThemeToggle />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">

        {/* Sidebar with views */}
        <div className={`${sidebarCollapsed ? 'w-0' : 'w-96'} border-r flex flex-col transition-all duration-300 overflow-hidden`}>
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
                          className={`cursor-pointer transition-colors rounded-none py-0 ${
                            selectedView?.id === view.id ? 'bg-accent' : 'hover:bg-accent/50'
                          }`}
                          onClick={() => setSelectedView(view)}
                        >
                          <CardHeader className="p-4 px-6">
                            <CardTitle className="text-lg">{view.name}</CardTitle>
                            {view.description && (
                              <CardDescription className="text-base mt-1">
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
                      className={`cursor-pointer transition-colors rounded-none py-0 ${
                        selectedView?.id === view.id ? 'bg-accent' : 'hover:bg-accent/50'
                      }`}
                      onClick={() => setSelectedView(view)}
                    >
                      <CardHeader className="p-4 px-6">
                        <CardTitle className="text-lg">{view.name}</CardTitle>
                        {view.description && (
                          <CardDescription className="text-base mt-1">
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
              <div>
                {loading ? (
                  <div className="p-8 text-muted-foreground">Loading content...</div>
                ) : error ? (
                  <div className="p-8 text-red-500">Error: {error}</div>
                ) : (
                  <ThemeProvider theme={alexandriaTheme}>
                    <IndustryMarkdownSlide
                      content={markdownContent}
                      slideIdPrefix="view"
                      slideIndex={0}
                      fontSizeScale={fontScale}
                    />
                  </ThemeProvider>
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