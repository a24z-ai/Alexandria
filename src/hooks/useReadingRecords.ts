/**
 * React hook for managing Alexandria reading records
 * Provides easy access to bookmarks and visits
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ReadingRecordManager } from '../storage';
import type { 
  AlexandriaVisit, 
  AlexandriaBookmark,
  AlexandriaBookmarkedDocument 
} from '../types/alexandria-state';

interface UseReadingRecordsReturn {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Current session
  currentVisit: AlexandriaVisit | null;
  
  // Bookmarks
  bookmarks: AlexandriaBookmark[];
  bookmarkedDocuments: AlexandriaBookmarkedDocument[];
  
  // Actions
  startReading: (volumeId: string, chapterId: string, title?: string) => Promise<AlexandriaVisit>;
  saveBookmark: (label?: string) => Promise<AlexandriaBookmark | null>;
  removeBookmark: (bookmarkId: string) => Promise<void>;
  getBookmarkedDocuments: () => AlexandriaBookmarkedDocument[];
  openBookmarkedDocument: (visitId: string) => Promise<AlexandriaVisit | null>;
}

const STORAGE_USER_ID = 'alexandria_user'; // Default user ID for local storage

export function useReadingRecords(): UseReadingRecordsReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentVisit, setCurrentVisit] = useState<AlexandriaVisit | null>(null);
  const [bookmarks, setBookmarks] = useState<AlexandriaBookmark[]>([]);
  const [bookmarkedDocuments, setBookmarkedDocuments] = useState<AlexandriaBookmarkedDocument[]>([]);
  
  const managerRef = useRef<ReadingRecordManager | null>(null);

  // Initialize storage manager
  useEffect(() => {
    const initializeManager = async () => {
      try {
        setIsLoading(true);
        const manager = new ReadingRecordManager({ 
          adapter: 'localStorage',
          options: {
            keyPrefix: 'alexandria_',
            maxEntries: 500
          }
        });
        
        await manager.initialize();
        managerRef.current = manager;
        setIsInitialized(true);
        
        // Load bookmarked documents on initialization
        await loadBookmarkedDocuments();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize storage');
      } finally {
        setIsLoading(false);
      }
    };

    initializeManager();
  }, []);

  // Load bookmarked documents
  const loadBookmarkedDocuments = useCallback(async () => {
    if (!managerRef.current) return;

    try {
      const recentVisits = await managerRef.current.getRecentVisits(undefined, 50);
      
      // Group visits by document and get the most recent with bookmarks
      const documentMap = new Map<string, AlexandriaBookmarkedDocument>();
      
      for (const visit of recentVisits) {
        if (visit.bookmarks.length > 0) {
          const key = `${visit.volumeId}:${visit.chapterId}`;
          const existing = documentMap.get(key);
          
          if (!existing || visit.lastActiveAt > existing.lastVisited.getTime()) {
            documentMap.set(key, {
              visitId: visit.id,
              volumeId: visit.volumeId,
              chapterId: visit.chapterId,
              savedAt: new Date(visit.startedAt),
              lastVisited: new Date(visit.lastActiveAt),
              bookmarkCount: visit.bookmarks.length,
              documentPath: visit.documentVersion?.documentPath
            });
          }
        }
      }
      
      const documents = Array.from(documentMap.values());
      documents.sort((a, b) => b.lastVisited.getTime() - a.lastVisited.getTime());
      
      setBookmarkedDocuments(documents);
    } catch (err) {
      console.error('Failed to load bookmarked documents:', err);
    }
  }, []);

  // Start or resume reading session
  const startReading = useCallback(async (
    volumeId: string, 
    chapterId: string,
    title?: string
  ): Promise<AlexandriaVisit> => {
    if (!managerRef.current) {
      throw new Error('Storage not initialized');
    }

    try {
      setIsLoading(true);
      
      // Create a simple document version for now
      const documentVersion = {
        gitHash: 'current',
        publishedAt: new Date().toISOString(),
        branch: 'main',
        documentPath: `${volumeId}/${chapterId}`
      };
      
      const visit = await managerRef.current.startVisit(
        STORAGE_USER_ID,
        volumeId,
        chapterId,
        documentVersion
      );
      
      setCurrentVisit(visit);
      
      // Only check if THIS specific view/chapter has bookmarks
      // The visit.bookmarks array contains bookmarks for this specific visit
      setBookmarks(visit.bookmarks || []);
      
      // If no bookmarks in current visit, check if there are any existing bookmarks
      // for this specific document to determine if it was previously bookmarked
      if (visit.bookmarks.length === 0) {
        const existingBookmarks = await managerRef.current.getBookmarksForDocument(
          volumeId,
          chapterId
        );
        
        // Only set bookmarks if they exist for THIS specific view
        if (existingBookmarks.length > 0) {
          setBookmarks(existingBookmarks);
          visit.bookmarks = existingBookmarks;
          setCurrentVisit(visit);
        }
      }
      
      return visit;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start reading session');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save a bookmark for the current document
  const saveBookmark = useCallback(async (label?: string): Promise<AlexandriaBookmark | null> => {
    if (!managerRef.current || !currentVisit) {
      setError('No active reading session');
      return null;
    }

    // Check if a bookmark already exists for this document
    if (bookmarks.length > 0) {
      console.warn('Bookmark already exists for this document');
      return bookmarks[0]; // Return existing bookmark
    }

    try {
      setIsLoading(true);
      
      // Get current scroll position or selection as context
      const context = window.getSelection()?.toString() || 
                     `Position: ${Math.round(window.scrollY)}px`;
      
      const bookmark = await managerRef.current.createBookmark(
        currentVisit.id,
        label || `Bookmark at ${new Date().toLocaleString()}`,
        context
      );
      
      setBookmarks(prev => [...prev, bookmark]);
      
      // Reload bookmarked documents to update the list
      await loadBookmarkedDocuments();
      
      return bookmark;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save bookmark');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentVisit, bookmarks, loadBookmarkedDocuments]);

  // Remove a bookmark
  const removeBookmark = useCallback(async (bookmarkId: string): Promise<void> => {
    if (!managerRef.current) {
      throw new Error('Storage not initialized');
    }

    try {
      setIsLoading(true);
      await managerRef.current.deleteBookmark(bookmarkId);
      
      // Update local bookmarks state
      setBookmarks(prev => {
        const updated = prev.filter(b => b.id !== bookmarkId);
        // If all bookmarks are removed, ensure the array is empty
        return updated.length > 0 ? updated : [];
      });
      
      // Reload bookmarked documents to update counts
      await loadBookmarkedDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove bookmark');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadBookmarkedDocuments]);

  // Get all bookmarked documents (returns current state)
  const getBookmarkedDocuments = useCallback((): AlexandriaBookmarkedDocument[] => {
    return bookmarkedDocuments;
  }, [bookmarkedDocuments]);

  // Open a bookmarked document
  const openBookmarkedDocument = useCallback(async (visitId: string): Promise<AlexandriaVisit | null> => {
    if (!managerRef.current) {
      throw new Error('Storage not initialized');
    }

    try {
      const visitResult = await managerRef.current.getAdapter()?.getVisit(visitId);
      if (visitResult?.success && visitResult.data) {
        setCurrentVisit(visitResult.data);
        setBookmarks(visitResult.data.bookmarks);
        return visitResult.data;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open bookmarked document');
      return null;
    }
  }, []);

  // Update activity periodically when there's an active visit
  useEffect(() => {
    if (!currentVisit || !managerRef.current) return;

    const interval = setInterval(() => {
      managerRef.current?.updateVisitActivity(currentVisit.id);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [currentVisit]);

  return {
    isInitialized,
    isLoading,
    error,
    currentVisit,
    bookmarks,
    bookmarkedDocuments,
    startReading,
    saveBookmark,
    removeBookmark,
    getBookmarkedDocuments,
    openBookmarkedDocument
  };
}