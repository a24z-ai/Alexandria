/**
 * Alexandria Reading Records Storage
 * Main exports for the storage system
 */

export { ReadingRecordManager } from './ReadingRecordManager';
export { LocalStorageReadingRecordAdapter } from './adapters/localStorage';
export { MemoryReadingRecordAdapter } from './adapters/memory';

export type {
  ReadingRecordAdapter,
  StorageConfig,
  StorageCapabilities,
  StorageResult,
  StorageStats,
  VisitQuery,
  BookmarkQuery,
  StorageEvents
} from './types';