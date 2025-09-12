/**
 * Component to display bookmarked documents
 * Shows a list of documents the user has bookmarked for quick access
 */

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bookmark, Clock, FileText, ChevronRight, Trash2 } from 'lucide-react';
import { useReadingRecords } from '@/hooks/useReadingRecords';
import type { AlexandriaBookmarkedDocument } from '@/types/alexandria-state';

interface BookmarkedDocumentsProps {
  onOpenDocument?: (document: AlexandriaBookmarkedDocument) => void;
  className?: string;
}

export function BookmarkedDocuments({ onOpenDocument, className = '' }: BookmarkedDocumentsProps) {
  const [documents, setDocuments] = useState<AlexandriaBookmarkedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    isInitialized,
    bookmarkedDocuments,
    removeBookmark
  } = useReadingRecords();

  useEffect(() => {
    if (isInitialized) {
      setDocuments(bookmarkedDocuments);
      setIsLoading(false);
    }
  }, [isInitialized, bookmarkedDocuments]);

  const handleOpenDocument = (doc: AlexandriaBookmarkedDocument) => {
    if (onOpenDocument) {
      onOpenDocument(doc);
    } else {
      // Default behavior: navigate to the document
      const [owner, name] = doc.volumeId.split('/');
      const baseUrl = window.location.pathname.includes('/Alexandria') ? '/Alexandria' : '';
      window.location.href = `${baseUrl}/repo?owner=${owner}&name=${name}&view=${doc.chapterId}`;
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return diffMinutes === 0 ? 'Just now' : `${diffMinutes}m ago`;
      }
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!isInitialized || isLoading) {
    return (
      <div className={`space-y-2 ${className}`}>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Bookmark className="h-5 w-5" />
          Your Bookmarked Documents
        </h2>
        <div className="text-muted-foreground text-sm">Loading bookmarks...</div>
      </div>
    );
  }

  if (documents.length === 0) {
    // Return null to hide the entire section when there are no bookmarks
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Bookmark className="h-5 w-5" />
        Your Bookmarked Documents
        <Badge variant="secondary" className="ml-auto">
          {documents.length}
        </Badge>
      </h2>
      
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc) => (
          <Card 
            key={`${doc.volumeId}-${doc.chapterId}`}
            className="hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => handleOpenDocument(doc)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base line-clamp-1">
                    {doc.title || doc.chapterId}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1 line-clamp-1">
                    {doc.volumeId}
                  </CardDescription>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
              </div>
            </CardHeader>
            
            <CardFooter className="pt-0 pb-3 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {doc.bookmarkCount} {doc.bookmarkCount === 1 ? 'bookmark' : 'bookmarks'}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(new Date(doc.lastVisited))}
                </span>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}