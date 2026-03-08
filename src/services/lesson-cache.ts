import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = '@kodiq/lesson-cache/';
const CACHE_INDEX_KEY = '@kodiq/lesson-cache-index';
const MAX_CACHED_LESSONS = 10;

interface CachedLesson {
  lessonId: string;
  title: string;
  html: string;
  cachedAt: number;
}

interface CacheIndexEntry {
  lessonId: string;
  title: string;
  cachedAt: number;
}

interface CacheIndex {
  entries: CacheIndexEntry[];
}

async function loadIndex(): Promise<CacheIndex> {
  const raw = await AsyncStorage.getItem(CACHE_INDEX_KEY);
  if (!raw) return { entries: [] };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'entries' in parsed &&
      Array.isArray((parsed as CacheIndex).entries)
    ) {
      return parsed as CacheIndex;
    }
    return { entries: [] };
  } catch {
    return { entries: [] };
  }
}

async function saveIndex(index: CacheIndex): Promise<void> {
  await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(index));
}

export async function cacheLesson(
  lessonId: string,
  html: string,
  title: string,
): Promise<void> {
  const index = await loadIndex();

  // Remove existing entry if present (will re-add with fresh timestamp)
  index.entries = index.entries.filter(e => e.lessonId !== lessonId);

  // LRU eviction: remove oldest entries if at capacity
  while (index.entries.length >= MAX_CACHED_LESSONS) {
    const oldest = index.entries.reduce<CacheIndexEntry | null>(
      (min, entry) => (!min || entry.cachedAt < min.cachedAt ? entry : min),
      null,
    );
    if (oldest) {
      await AsyncStorage.removeItem(CACHE_PREFIX + oldest.lessonId);
      index.entries = index.entries.filter(e => e.lessonId !== oldest.lessonId);
    }
  }

  const cachedAt = Date.now();
  const lesson: CachedLesson = { lessonId, title, html, cachedAt };

  await AsyncStorage.setItem(CACHE_PREFIX + lessonId, JSON.stringify(lesson));

  index.entries.push({ lessonId, title, cachedAt });
  await saveIndex(index);
}

export async function getCachedLesson(
  lessonId: string,
): Promise<CachedLesson | null> {
  const raw = await AsyncStorage.getItem(CACHE_PREFIX + lessonId);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CachedLesson;
  } catch {
    return null;
  }
}

export async function getCacheIndex(): Promise<CacheIndex> {
  return loadIndex();
}

export async function removeCachedLesson(lessonId: string): Promise<void> {
  await AsyncStorage.removeItem(CACHE_PREFIX + lessonId);
  const index = await loadIndex();
  index.entries = index.entries.filter(e => e.lessonId !== lessonId);
  await saveIndex(index);
}

export async function clearLessonCache(): Promise<void> {
  const index = await loadIndex();
  for (const entry of index.entries) {
    await AsyncStorage.removeItem(CACHE_PREFIX + entry.lessonId);
  }
  await AsyncStorage.removeItem(CACHE_INDEX_KEY);
}

export async function getCacheSize(): Promise<number> {
  const index = await loadIndex();
  let total = 0;
  for (const entry of index.entries) {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + entry.lessonId);
    if (raw) {
      total += raw.length * 2; // approximate UTF-16 bytes
    }
  }
  return total;
}
