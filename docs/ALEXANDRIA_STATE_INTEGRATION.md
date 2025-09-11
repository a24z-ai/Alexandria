# Alexandria State Management Integration Plan

## Overview

This document outlines how we will integrate reading state management into Alexandria, allowing users to track their reading progress, save bookmarks, and be notified when documents are updated in the repository.

## Core Concepts

### The Library Metaphor
- **Visit**: A reading session where a user views a document
- **Bookmark**: A saved position within a document
- **Document Version**: A specific git commit version of a document
- **Library Card**: A user's complete reading history and preferences

## Integration Architecture

### 1. Data Flow

```
User Opens Document
        ↓
Check for Previous Visits
        ↓
Fetch Document + Git Metadata
        ↓
Compare Versions
        ↓
Create/Resume Visit
        ↓
Track Reading Activity
        ↓
Save Bookmarks
        ↓
Store Visit Data
```

### 2. Storage Strategy

#### Local Storage (Phase 1)
- Use IndexedDB for storing visits and bookmarks
- Key structure: `{volumeId}:{chapterId}:{gitHash}`
- Automatic cleanup of visits older than 90 days
- Maximum 100 bookmarks per document

#### API Integration (Phase 2)
- Optional server-side storage for authenticated users
- Sync across devices
- Collaborative bookmarks and annotations

## Component Integration

### ViewDisplay.tsx Modifications

```typescript
// New imports
import { useAlexandriaVisit } from '@/hooks/useAlexandriaVisit';
import { VersionNotification } from '@/components/VersionNotification';
import { BookmarkPanel } from '@/components/BookmarkPanel';

// Inside ViewDisplay component
const { 
  currentVisit, 
  bookmarks,
  hasVersionUpdate,
  saveBookmark,
  resumeFromBookmark 
} = useAlexandriaVisit({
  volumeId: manifest.repository,
  chapterId: selectedView?.id,
  documentVersion: fetchedVersion // From API response
});

// UI additions
{hasVersionUpdate && (
  <VersionNotification
    previous={currentVisit.documentVersion}
    current={fetchedVersion}
    onAccept={() => updateVisit(fetchedVersion)}
    onCompare={() => showVersionDiff()}
  />
)}

// Bookmark indicator in header
<BookmarkIndicator 
  count={bookmarks.length}
  onClick={() => setBookmarkPanelOpen(true)}
/>
```

### New Hook: useAlexandriaVisit

```typescript
// src/hooks/useAlexandriaVisit.ts
export function useAlexandriaVisit({
  volumeId,
  chapterId,
  documentVersion
}: UseVisitProps) {
  const [currentVisit, setCurrentVisit] = useState<AlexandriaVisit | null>(null);
  const [bookmarks, setBookmarks] = useState<AlexandriaBookmark[]>([]);
  
  // Initialize or resume visit
  useEffect(() => {
    const visitManager = new AlexandriaVisitManager();
    const visit = visitManager.startOrResumeVisit(volumeId, chapterId, documentVersion);
    setCurrentVisit(visit);
    setBookmarks(visit.bookmarks);
  }, [volumeId, chapterId]);
  
  // Track activity
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentVisit) {
        visitManager.updateActivity(currentVisit.id);
      }
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [currentVisit]);
  
  return {
    currentVisit,
    bookmarks,
    hasVersionUpdate: checkVersionUpdate(currentVisit, documentVersion),
    saveBookmark: (label?: string) => visitManager.saveBookmark(currentVisit.id, label),
    resumeFromBookmark: (bookmarkId: string) => visitManager.resumeBookmark(bookmarkId)
  };
}
```

## API Enhancements Required

### 1. Modify getViewContent Response

Currently returns: `string` (markdown content)

Should return:
```typescript
interface ViewContentResponse {
  content: string;
  version: {
    gitHash: string;
    branch: string;
    commitDate: string;
    commitMessage?: string;
    author?: string;
  };
  documentPath: string;
}
```

### 2. New Endpoint (Optional - Phase 2)

```typescript
// GET /api/alexandria/repos/{owner}/{name}/views/{viewId}/versions
interface VersionHistoryResponse {
  current: AlexandriaDocumentVersion;
  recent: AlexandriaDocumentVersion[]; // Last 10 versions
}
```

## UI Components

### 1. Version Update Notification

```tsx
// When document has been updated since last visit
<Alert className="mb-4 border-amber-200 bg-amber-50">
  <Info className="h-4 w-4 text-amber-600" />
  <AlertTitle>Document Updated</AlertTitle>
  <AlertDescription>
    This document was updated {timeAgo(version.publishedAt)} by {version.author}
    <div className="mt-2 flex gap-2">
      <Button size="sm" variant="outline" onClick={viewChanges}>
        View Changes
      </Button>
      <Button size="sm" onClick={continueReading}>
        Continue Reading
      </Button>
    </div>
  </AlertDescription>
</Alert>
```

### 2. Bookmark Panel

```tsx
// Slide-out panel showing saved bookmarks
<Sheet open={bookmarkPanelOpen} onOpenChange={setBookmarkPanelOpen}>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Reading Bookmarks</SheetTitle>
      <SheetDescription>
        Your saved positions in this document
      </SheetDescription>
    </SheetHeader>
    
    <div className="space-y-2 mt-4">
      {bookmarks.map(bookmark => (
        <BookmarkCard
          key={bookmark.id}
          bookmark={bookmark}
          isOutdated={bookmark.version !== currentVersion}
          onResume={() => resumeFromBookmark(bookmark.id)}
          onDelete={() => deleteBookmark(bookmark.id)}
        />
      ))}
    </div>
    
    <Button className="w-full mt-4" onClick={saveCurrentPosition}>
      <Bookmark className="mr-2 h-4 w-4" />
      Save Current Position
    </Button>
  </SheetContent>
</Sheet>
```

### 3. Bookmark Indicator Badge

```tsx
// In document header
<Badge 
  variant={hasVersionUpdate ? "warning" : "default"}
  className="cursor-pointer"
  onClick={() => setBookmarkPanelOpen(true)}
>
  <Bookmark className="h-3 w-3 mr-1" />
  {bookmarks.length} saved
  {hasVersionUpdate && (
    <AlertCircle className="h-3 w-3 ml-1" />
  )}
</Badge>
```

## Implementation Phases

### Phase 1: Core Functionality (Week 1-2)
- [ ] Create IndexedDB schema and manager
- [ ] Implement `useAlexandriaVisit` hook
- [ ] Add bookmark save/restore functionality
- [ ] Create basic UI components
- [ ] Store visits locally

### Phase 2: Version Tracking (Week 3)
- [ ] Modify API to return git metadata
- [ ] Implement version comparison
- [ ] Add version update notifications
- [ ] Create version diff viewer

### Phase 3: Enhanced UX (Week 4)
- [ ] Add bookmark labels and notes
- [ ] Implement bookmark search
- [ ] Add reading time tracking
- [ ] Create visit history view

### Phase 4: Advanced Features (Future)
- [ ] Server-side storage
- [ ] Cross-device sync
- [ ] Collaborative bookmarks
- [ ] Export/import functionality

## Data Privacy Considerations

- All data stored locally by default
- No tracking without user consent
- Clear data management UI
- Export functionality for data portability
- Automatic cleanup of old data

## Performance Considerations

- Debounced auto-save (30 second intervals)
- Lazy load bookmark data
- Maximum bookmark limits per document
- Efficient IndexedDB queries
- Background sync for version checks

## Testing Strategy

1. **Unit Tests**
   - Visit manager CRUD operations
   - Version comparison logic
   - Bookmark management

2. **Integration Tests**
   - Hook behavior with component lifecycle
   - IndexedDB operations
   - API integration

3. **E2E Tests**
   - Complete user journey from visit to bookmark
   - Version update flow
   - Data persistence across sessions

## Migration Path

For existing users:
1. Detect existing localStorage data
2. Migrate to new IndexedDB schema
3. Preserve user preferences
4. Show one-time notification about new features

## Success Metrics

- User engagement: % of users creating bookmarks
- Return rate: Users resuming from bookmarks
- Version awareness: Users viewing version updates
- Performance: Time to load visit data < 100ms
- Storage efficiency: < 1MB per user

## Open Questions

1. Should we track reading progress automatically or only on bookmark?
2. How long should we retain visit history?
3. Should bookmarks be shareable via URL?
4. Do we need offline support for version checking?
5. Should we support bookmark categories or tags?

## Next Steps

1. Review and approve this integration plan
2. Create detailed API specification for version metadata
3. Design database schema for IndexedDB
4. Build proof of concept for visit tracking
5. User testing with prototype