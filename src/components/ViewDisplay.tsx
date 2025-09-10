import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { CodebaseViewSummary } from 'a24z-memory';
import { AlexandriaAPI } from '@/lib/alexandria-api';
import { ThemeToggle } from './ThemeToggle';
import { FontScaleControls } from './FontScaleControls';
import { EmptyState } from './EmptyState';
import { AnimatedBookIcon } from './AnimatedBookIcon';
import { BookOpen, Link2, Check, Presentation, FileText, Menu, X, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IndustryMarkdownSlide, SlidePresentation, ThemeProvider, parseMarkdownIntoPresentation } from 'themed-markdown';
import 'themed-markdown/dist/index.css';
import { alexandriaTheme, alexandriaThemeDark } from '@/lib/alexandria-theme';

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
  const [copied, setCopied] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if dark mode is enabled
    return document.documentElement.className === 'dark';
  });
  const [viewMode, setViewMode] = useState<'document' | 'slides'>(() => {
    // Load view mode preference from localStorage
    const saved = localStorage.getItem('viewMode');
    return (saved === 'slides' || saved === 'document') ? saved : 'document';
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Load sidebar state from localStorage, default to collapsed on mobile
    const saved = localStorage.getItem('sidebarCollapsed');
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    return saved ? JSON.parse(saved) : isMobile;
  });
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showCompactControls, setShowCompactControls] = useState(() => {
    if (typeof window !== 'undefined') {
      // Show compact controls (copy link only) when:
      // - Portrait orientation on mobile/tablet
      // - Very narrow screens (< 640px)
      const isPortrait = window.innerHeight > window.innerWidth;
      const isNarrow = window.innerWidth < 640;
      return isPortrait || isNarrow;
    }
    return false;
  });
  
  // Check URL for view parameter on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const viewId = params.get('view');
      if (viewId && manifest.views.length > 0) {
        const view = manifest.views.find(v => v.id === viewId);
        if (view) {
          setSelectedView(view);
        }
      }
    }
  }, [manifest.views]);
  
  // Initialize API client
  const api = useMemo(() => {
    const apiUrl = typeof window !== 'undefined' && window.ALEXANDRIA_CONFIG?.apiUrl ? 
                   window.ALEXANDRIA_CONFIG.apiUrl :
                   import.meta.env.PUBLIC_ALEXANDRIA_API_URL || 
                   'https://git-gallery.com';
    return new AlexandriaAPI(apiUrl);
  }, []);

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Handle window resize and orientation
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        setSidebarCollapsed(true);
      }
      // Determine if we should show compact controls
      const isPortrait = window.innerHeight > window.innerWidth;
      const isNarrow = window.innerWidth < 640;
      setShowCompactControls(isPortrait || isNarrow);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    // Initial check
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Close mobile drawer when selecting a view
  const handleMobileViewSelect = (view: CodebaseViewSummary) => {
    handleViewSelect(view);
    setMobileDrawerOpen(false);
  };

  // Save view mode preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  // Listen for theme changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const isDark = document.documentElement.className === 'dark';
          setIsDarkMode(isDark);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

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
        } catch {
          setError('Failed to load view content');
        } finally {
          setLoading(false);
        }
      };
      
      fetchContent();
    }
  }, [selectedView, manifest.repository, api]);

  const copyMarkdownLink = () => {
    if (selectedView && selectedView.overviewPath) {
      const [owner, name] = manifest.repository.split('/');
      const branch = 'main'; // Could be made configurable
      const url = `https://raw.githubusercontent.com/${owner}/${name}/${branch}/${selectedView.overviewPath}`;
      
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleViewSelect = (view: CodebaseViewSummary) => {
    setSelectedView(view);
    
    // Update URL with view parameter
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set('view', view.id);
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, '', newUrl);
    }
  };

  const groupedViews = manifest.views.reduce((acc, view) => {
    const category = view.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(view);
    return acc;
  }, {} as Record<string, CodebaseViewSummary[]>);

  // Sort views within each category by displayOrder, then by name
  Object.keys(groupedViews).forEach(category => {
    groupedViews[category].sort((a, b) => {
      // First sort by displayOrder (lower numbers first)
      // If displayOrder is undefined, treat it as a high number
      const orderA = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.displayOrder ?? Number.MAX_SAFE_INTEGER;
      
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      
      // If displayOrder is the same, sort by name
      return a.name.localeCompare(b.name);
    });
  });

  // Sort categories alphabetically with "other" last
  const sortedCategories = Object.keys(groupedViews).sort((a, b) => {
    if (a === 'other') return 1;
    if (b === 'other') return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b px-4 md:px-6 py-3 md:py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-3">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          >
            {mobileDrawerOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

          {(onBack || backUrl) ? (
            <AnimatedBookIcon 
              size={40}
              className="text-primary hidden md:block"
              onClick={onBack || (() => backUrl && (window.location.href = backUrl))}
            />
          ) : (
            <BookOpen className="h-8 w-8 md:h-10 md:w-10 text-primary" />
          )}
          <div>
            <h1 className="text-xl md:text-2xl font-bold">
              <a 
                href={`https://github.com/${manifest.repository}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {manifest.repository.split('/')[1]}
              </a>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground hidden md:block">
              by {manifest.repository.split('/')[0]}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.open(`https://github.com/${manifest.repository}`, '_blank')}
            title="View on GitHub"
            className="h-9 w-9 md:h-10 md:w-10"
          >
            <Github className="h-4 w-4" />
          </Button>
          {selectedView && selectedView.overviewPath && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode(viewMode === 'document' ? 'slides' : 'document')}
                title={viewMode === 'document' ? 'Switch to slides view' : 'Switch to document view'}
                className="h-9 w-9 md:h-10 md:w-10 hidden lg:flex"
              >
                {viewMode === 'document' ? (
                  <Presentation className="h-4 w-4" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyMarkdownLink}
                title="Copy markdown link"
                className={`h-9 w-9 md:h-10 md:w-10 ${showCompactControls ? 'flex' : 'hidden lg:flex'}`}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Link2 className="h-4 w-4" />
                )}
              </Button>
            </>
          )}
          <FontScaleControls className={`${showCompactControls ? 'hidden' : 'flex'}`} />
          <ThemeToggle />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile drawer overlay */}
        {mobileDrawerOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileDrawerOpen(false)}
          />
        )}

        {/* Sidebar with views - Desktop: collapsible, Mobile: drawer */}
        <div className={`
          ${mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          ${sidebarCollapsed && !mobileDrawerOpen ? 'md:w-0' : 'md:w-96'}
          fixed md:relative
          inset-y-0 left-0
          w-80 md:w-96
          bg-background
          border-r flex flex-col
          transition-all duration-300
          z-50 md:z-auto
        `}>
          {sortedCategories.length > 1 ? (
            <Tabs defaultValue={sortedCategories[0]} className="w-full h-full flex flex-col gap-0">
              <TabsList className="w-full justify-start rounded-none border-b h-auto p-0 flex-shrink-0">
                {sortedCategories.map(category => (
                  <TabsTrigger 
                    key={category}
                    value={category}
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary py-3"
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>
              {sortedCategories.map(category => (
                <TabsContent key={category} value={category} className="m-0 p-0 flex-1 overflow-hidden focus-visible:outline-none">
                  <ScrollArea className="h-full p-0">
                    <div className="flex flex-col">
                      {groupedViews[category].map(view => (
                          <Card
                            key={view.id}
                            className={`cursor-pointer transition-all duration-200 border-0 rounded-none border-l-4 border-b ${
                              selectedView?.id === view.id 
                                ? 'bg-accent border-l-primary' 
                                : 'hover:bg-accent/50 border-l-transparent hover:border-l-muted-foreground/30'
                            }`}
                            onClick={() => handleMobileViewSelect(view)}
                          >
                            <CardHeader className="px-3 py-2">
                              <CardTitle className="text-base font-medium leading-tight">{view.name}</CardTitle>
                              {view.description && (
                                <CardDescription className="text-sm mt-1.5 line-clamp-2">
                                  {view.description}
                                </CardDescription>
                              )}
                              {view.overviewPath && (
                                <div className="flex items-center gap-1 mt-2">
                                  <svg className="w-3 h-3 text-muted-foreground/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <span className="text-xs text-muted-foreground/80 truncate">
                                    {view.overviewPath.split('/').pop()}
                                  </span>
                                </div>
                              )}
                            </CardHeader>
                          </Card>
                        ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
            ) : (
            <ScrollArea className="h-full p-0">
              <div className="flex flex-col">
                {Object.values(groupedViews)[0]?.map(view => (
                    <Card
                      key={view.id}
                      className={`cursor-pointer transition-all duration-200 border-0 rounded-none border-l-4 border-b ${
                        selectedView?.id === view.id 
                          ? 'bg-accent border-l-primary' 
                          : 'hover:bg-accent/50 border-l-transparent hover:border-l-muted-foreground/30'
                      }`}
                      onClick={() => handleViewSelect(view)}
                    >
                      <CardHeader className="px-3 py-2">
                        <CardTitle className="text-base font-medium leading-tight">{view.name}</CardTitle>
                        {view.description && (
                          <CardDescription className="text-sm mt-1.5 line-clamp-2">
                            {view.description}
                          </CardDescription>
                        )}
                        {view.overviewPath && (
                          <div className="flex items-center gap-1 mt-2">
                            <svg className="w-3 h-3 text-muted-foreground/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-xs text-muted-foreground/80 truncate">
                              {view.overviewPath.split('/').pop()}
                            </span>
                          </div>
                        )}
                      </CardHeader>
                    </Card>
                ))}
              </div>
            </ScrollArea>
            )}
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-hidden w-full relative">
          {selectedView ? (
            <>
              {/* Loading overlay with skeleton */}
              <div className={`absolute inset-0 bg-background transition-opacity duration-300 z-10 ${
                loading ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}>
                <div className="p-8 space-y-4">
                  <div className="h-8 bg-muted/30 rounded w-3/4 animate-pulse" />
                  <div className="space-y-3">
                    <div className="h-4 bg-muted/20 rounded w-full animate-pulse" />
                    <div className="h-4 bg-muted/20 rounded w-5/6 animate-pulse" />
                    <div className="h-4 bg-muted/20 rounded w-4/6 animate-pulse" />
                  </div>
                  <div className="space-y-3 pt-4">
                    <div className="h-4 bg-muted/20 rounded w-full animate-pulse" />
                    <div className="h-4 bg-muted/20 rounded w-full animate-pulse" />
                    <div className="h-4 bg-muted/20 rounded w-3/4 animate-pulse" />
                  </div>
                </div>
              </div>
              
              {/* Error state */}
              {error && (
                <div className="p-8 text-red-500">Error: {error}</div>
              )}
              
              {/* Content with fade-in */}
              {!error && (
                <div className={`h-full transition-opacity duration-500 ${
                  loading ? 'opacity-0' : 'opacity-100'
                }`}>
                  <ThemeProvider theme={isDarkMode ? alexandriaThemeDark : alexandriaTheme}>
                    {viewMode === 'document' ? (
                      <div className="h-full overflow-y-auto overflow-x-hidden">
                        <IndustryMarkdownSlide
                          content={markdownContent}
                          slideIdPrefix="view"
                          slideIndex={0}
                          fontSizeScale={fontScale}
                        />
                      </div>
                ) : (() => {
                  const presentation = parseMarkdownIntoPresentation(markdownContent);
                  const slideContents = presentation.slides.map(slide => slide.location.content);
                  return (
                    <div className="h-full w-full">
                      <SlidePresentation
                        slides={slideContents}
                        showNavigation={true}
                        showSlideCounter={true}
                        showFullscreenButton={true}
                        enableKeyboardScrolling={true}
                        slideIdPrefix="presentation"
                        containerHeight="100%"
                        fontSizeScale={fontScale}
                      />
                    </div>
                  );
                })()}
                  </ThemeProvider>
                </div>
              )}
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}