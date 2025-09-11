/**
 * Alexandria Reading State Types
 * Manages reading sessions, bookmarks, and annotations in the library metaphor
 */

/**
 * Represents a bookmark within a document - a saved reading position
 * Like placing a ribbon or card in a physical book
 */
export interface AlexandriaBookmark {
  id: string;
  label?: string;                    // User's note about this bookmark
  chapterTitle?: string;             // The section/heading where bookmark was placed
  createdAt: number;                 // When the bookmark was created
  lastVisited?: number;              // Last time user returned to this bookmark
  context?: string;                  // Brief text excerpt for context
}

/**
 * Represents a specific version of a document in the repository
 * Like tracking which printing or revision of a book you're reading
 */
export interface AlexandriaDocumentVersion {
  gitHash: string;                   // Git commit hash identifying this version
  publishedAt: string;               // When this version was committed
  branch: string;                    // Which branch (main, dev, etc.)
  commitMessage?: string;            // Description of what changed
  author?: string;                   // Who made the changes
  documentPath: string;              // Path to the document in the repo
}

/**
 * A visit represents a reading session with a specific document
 * Like visiting the library to read a particular book
 */
export interface AlexandriaVisit {
  id: string;
  volumeId: string;                  // Repository ID (owner/name)
  chapterId: string;                 // View/document ID
  documentVersion: AlexandriaDocumentVersion; // Which version was being read
  
  // Visit timeline
  startedAt: number;                 // When user started reading
  lastActiveAt: number;              // Last interaction timestamp
  endedAt?: number;                  // When visit ended (if ended)
  readingDuration?: number;          // Total active reading time (milliseconds)
  
  // Bookmarks and notes from this visit
  bookmarks: AlexandriaBookmark[];   // Saved positions during this visit
  annotations?: AlexandriaAnnotation[]; // Future: highlights and margin notes
  
  // Visit metadata
  isActive: boolean;                 // Currently active visit
  device?: string;                   // Device identifier for sync
  referrer?: string;                 // How user arrived at this document
}

/**
 * Annotation represents a highlight or margin note
 * Like writing notes in the margins of a book
 */
export interface AlexandriaAnnotation {
  id: string;
  text: string;                      // The highlighted text
  note?: string;                     // User's note about the highlight
  color?: 'gold' | 'terracotta' | 'teal' | 'ochre'; // Theme-based colors
  createdAt: number;
}

/**
 * Library card tracks all user's reading across the library
 * Like a personal library card with reading history
 */
export interface AlexandriaLibraryCard {
  id: string;                        // User identifier (local or authenticated)
  activeVisits: Map<string, AlexandriaVisit>; // Currently active visits by document
  visitHistory: AlexandriaVisit[];            // Past visits
  preferences: AlexandriaReadingPreferences;
}

/**
 * User's reading preferences
 */
export interface AlexandriaReadingPreferences {
  autoBookmark: boolean;             // Auto-save reading position
  bookmarkInterval: number;          // How often to auto-bookmark (ms)
  showEditionChanges: boolean;       // Notify when document is updated
  preserveAnnotations: boolean;      // Keep annotations across editions
}

/**
 * Notification when a document has been updated
 * Like a librarian's note about a new revision of a book
 */
export interface AlexandriaVersionUpdate {
  previousVersion: AlexandriaDocumentVersion;
  currentVersion: AlexandriaDocumentVersion;
  changesPreview?: string;           // Brief description of changes
  bookmarksAffected: boolean;        // Whether bookmarks may be outdated
}

/**
 * Export/import format for reading visits
 * Like a reading list or study notes you can share
 */
export interface AlexandriaReadingExport {
  version: '1.0';
  exportedAt: number;
  library: string;                   // API URL or library identifier
  visits: AlexandriaVisit[];
  preferences?: AlexandriaReadingPreferences;
}