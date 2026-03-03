/* ===================================================
   api.js — Bible API Layer
   getbible.net v2 API + localStorage caching
   =================================================== */

'use strict';

const BibleAPI = (() => {

  /* ── Configuration ─────────────────────────────── */
  const BASE = 'https://getbible.net/v2';
  const CACHE_PREFIX = 'bible_ch_';
  const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

  /* ── In-memory cache (session) ─────────────────── */
  const memCache = new Map();

  /* ── Helpers ───────────────────────────────────── */

  function cacheKey(version, bookId, chapter) {
    return `${CACHE_PREFIX}${version}_${bookId}_${chapter}`;
  }

  function saveToStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
    } catch (e) {
      // Storage full — clear old Bible cache entries
      try {
        const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX));
        keys.slice(0, Math.ceil(keys.length / 2)).forEach(k => localStorage.removeItem(k));
        localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
      } catch (_) { /* ignore */ }
    }
  }

  function loadFromStorage(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const { ts, data } = JSON.parse(raw);
      if (Date.now() - ts > CACHE_TTL) {
        localStorage.removeItem(key);
        return null;
      }
      return data;
    } catch (_) {
      return null;
    }
  }

  /**
   * Parse the getbible.net API response into a standardized verse array.
   * Response verses may come as an Array or an Object keyed by verse number.
   */
  function parseVerses(raw) {
    if (!raw) return [];
    let verses = raw.verses;
    if (!verses) return [];

    // If it's an object (keyed by verse num), convert to array
    if (!Array.isArray(verses)) {
      verses = Object.values(verses);
    }

    return verses
      .filter(v => v && v.text)
      .map(v => ({
        verse: Number(v.verse),
        text: v.text.trim(),
        name: v.name || '',
      }))
      .sort((a, b) => a.verse - b.verse);
  }

  /* ── Core fetch ────────────────────────────────── */

  /**
   * Fetch a single chapter.
   * Returns: { bookName, chapter, verses: [{verse, text, name}] }
   */
  async function fetchChapter(version, bookId, chapter) {
    const key = cacheKey(version, bookId, chapter);

    // 1. Memory cache
    if (memCache.has(key)) return memCache.get(key);

    // 2. localStorage cache
    const stored = loadFromStorage(key);
    if (stored) {
      memCache.set(key, stored);
      return stored;
    }

    // 3. Fetch from API
    const url = `${BASE}/${version}/${bookId}/${chapter}.json`;

    let raw;
    try {
      const res = await fetch(url, { mode: 'cors' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      raw = await res.json();
    } catch (err) {
      throw new Error(`성경 데이터를 불러오지 못했습니다.\n${err.message}`);
    }

    const result = {
      bookId,
      bookName: raw.book_name || '',
      chapter: raw.chapter || chapter,
      translation: raw.translation || version,
      verses: parseVerses(raw),
    };

    if (result.verses.length === 0) {
      throw new Error('해당 장의 데이터가 없습니다. 다른 버전을 시도해 보세요.');
    }

    // Save to both caches
    memCache.set(key, result);
    saveToStorage(key, result);

    return result;
  }

  /**
   * Fetch multiple chapters (for text search).
   * Returns a flat array of { bookId, chapter, verse, text, name }
   */
  async function fetchBook(version, bookId, onProgress) {
    const book = getBook(bookId);
    if (!book) return [];

    const results = [];
    for (let ch = 1; ch <= book.chs; ch++) {
      try {
        const data = await fetchChapter(version, bookId, ch);
        for (const v of data.verses) {
          results.push({ bookId, chapter: ch, verse: v.verse, text: v.text, name: v.name });
        }
      } catch (_) { /* skip chapter if unavailable */ }
      if (onProgress) onProgress(ch, book.chs);
    }
    return results;
  }

  /**
   * Text search across loaded/cached chapters.
   * Searches only what's currently in localStorage cache.
   * @returns {Array} matches with {bookId, chapter, verse, text}
   */
  function searchCached(version, query, maxResults = 100) {
    if (!query || query.length < 2) return [];
    const ql = query.toLowerCase();
    const results = [];

    // Scan localStorage for cached chapters of this version
    try {
      const prefix = `${CACHE_PREFIX}${version}_`;
      for (const key of Object.keys(localStorage)) {
        if (!key.startsWith(prefix)) continue;
        const cached = loadFromStorage(key);
        if (!cached || !cached.verses) continue;

        for (const v of cached.verses) {
          if (v.text.toLowerCase().includes(ql)) {
            results.push({
              bookId:  cached.bookId,
              chapter: cached.chapter,
              verse:   v.verse,
              text:    v.text,
            });
            if (results.length >= maxResults) return results;
          }
        }
      }
    } catch (_) { /* ignore */ }

    return results;
  }

  /**
   * Clear all cached Bible data for a version (or all)
   */
  function clearCache(version) {
    const prefix = version ? `${CACHE_PREFIX}${version}_` : CACHE_PREFIX;
    const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix));
    keys.forEach(k => localStorage.removeItem(k));
    if (!version) memCache.clear();
    else {
      for (const [k] of memCache) {
        if (k.startsWith(`${CACHE_PREFIX}${version}_`)) memCache.delete(k);
      }
    }
  }

  /**
   * Get count of cached chapters across all versions
   */
  function getCacheStats() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX));
    return { chapters: keys.length };
  }

  return { fetchChapter, fetchBook, searchCached, clearCache, getCacheStats };
})();
