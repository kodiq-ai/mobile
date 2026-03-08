import { useCallback, useEffect, useState } from 'react';
import {
  cacheLesson as cacheLessonService,
  clearLessonCache,
  getCacheIndex,
  getCacheSize as getCacheSizeService,
  getCachedLesson as getCachedLessonService,
  removeCachedLesson as removeCachedLessonService,
} from '../services/lesson-cache';

interface CacheIndexEntry {
  lessonId: string;
  title: string;
  cachedAt: number;
}

interface UseLessonCacheResult {
  cachedLessons: CacheIndexEntry[];
  cacheSize: number;
  cacheLesson: (lessonId: string, html: string, title: string) => Promise<void>;
  getCachedLesson: (lessonId: string) => Promise<string | null>;
  removeCachedLesson: (lessonId: string) => Promise<void>;
  clearCache: () => Promise<void>;
  refreshIndex: () => Promise<void>;
}

export function useLessonCache(): UseLessonCacheResult {
  const [cachedLessons, setCachedLessons] = useState<CacheIndexEntry[]>([]);
  const [cacheSize, setCacheSize] = useState(0);

  const refreshIndex = useCallback(async () => {
    const index = await getCacheIndex();
    setCachedLessons(index.entries);
    const size = await getCacheSizeService();
    setCacheSize(size);
  }, []);

  useEffect(() => {
    void refreshIndex();
  }, [refreshIndex]);

  const cacheLesson = useCallback(
    async (lessonId: string, html: string, title: string) => {
      await cacheLessonService(lessonId, html, title);
      await refreshIndex();
    },
    [refreshIndex],
  );

  const getCachedLesson = useCallback(
    async (lessonId: string): Promise<string | null> => {
      const lesson = await getCachedLessonService(lessonId);
      return lesson?.html ?? null;
    },
    [],
  );

  const removeCachedLesson = useCallback(
    async (lessonId: string) => {
      await removeCachedLessonService(lessonId);
      await refreshIndex();
    },
    [refreshIndex],
  );

  const clearCache = useCallback(async () => {
    await clearLessonCache();
    await refreshIndex();
  }, [refreshIndex]);

  return {
    cachedLessons,
    cacheSize,
    cacheLesson,
    getCachedLesson,
    removeCachedLesson,
    clearCache,
    refreshIndex,
  };
}
