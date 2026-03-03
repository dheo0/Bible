/* ===================================================
   data.js — Bible Metadata
   성경 책 정보, 버전 정보, 검색용 약어
   =================================================== */

'use strict';

/* ── Bible Versions ─────────────────────────────── */
const VERSIONS = {
  korean:    { label: '개역성경 (KRV)', lang: 'ko', api: 'korean' },
  koreankjv: { label: '한글 킹제임스역',  lang: 'ko', api: 'koreankjv' },
  kjv:    { label: 'King James Version (KJV)', lang: 'en', api: 'kjv' },
  web:    { label: 'World English Bible (WEB)', lang: 'en', api: 'web' },
  asv:    { label: 'American Standard Version (ASV)', lang: 'en', api: 'asv' },
};

/* ── 66 Books ────────────────────────────────────── */
const BOOKS = [
  // ── 구약 Old Testament (1-39) ──────────────────
  { id:  1, ko: '창세기',         en: 'Genesis',          chs: 50,  testament: 'old' },
  { id:  2, ko: '출애굽기',       en: 'Exodus',           chs: 40,  testament: 'old' },
  { id:  3, ko: '레위기',         en: 'Leviticus',        chs: 27,  testament: 'old' },
  { id:  4, ko: '민수기',         en: 'Numbers',          chs: 36,  testament: 'old' },
  { id:  5, ko: '신명기',         en: 'Deuteronomy',      chs: 34,  testament: 'old' },
  { id:  6, ko: '여호수아',       en: 'Joshua',           chs: 24,  testament: 'old' },
  { id:  7, ko: '사사기',         en: 'Judges',           chs: 21,  testament: 'old' },
  { id:  8, ko: '룻기',           en: 'Ruth',             chs:  4,  testament: 'old' },
  { id:  9, ko: '사무엘상',       en: '1 Samuel',         chs: 31,  testament: 'old' },
  { id: 10, ko: '사무엘하',       en: '2 Samuel',         chs: 24,  testament: 'old' },
  { id: 11, ko: '열왕기상',       en: '1 Kings',          chs: 22,  testament: 'old' },
  { id: 12, ko: '열왕기하',       en: '2 Kings',          chs: 25,  testament: 'old' },
  { id: 13, ko: '역대상',         en: '1 Chronicles',     chs: 29,  testament: 'old' },
  { id: 14, ko: '역대하',         en: '2 Chronicles',     chs: 36,  testament: 'old' },
  { id: 15, ko: '에스라',         en: 'Ezra',             chs: 10,  testament: 'old' },
  { id: 16, ko: '느헤미야',       en: 'Nehemiah',         chs: 13,  testament: 'old' },
  { id: 17, ko: '에스더',         en: 'Esther',           chs: 10,  testament: 'old' },
  { id: 18, ko: '욥기',           en: 'Job',              chs: 42,  testament: 'old' },
  { id: 19, ko: '시편',           en: 'Psalms',           chs: 150, testament: 'old' },
  { id: 20, ko: '잠언',           en: 'Proverbs',         chs: 31,  testament: 'old' },
  { id: 21, ko: '전도서',         en: 'Ecclesiastes',     chs: 12,  testament: 'old' },
  { id: 22, ko: '아가',           en: 'Song of Solomon',  chs:  8,  testament: 'old' },
  { id: 23, ko: '이사야',         en: 'Isaiah',           chs: 66,  testament: 'old' },
  { id: 24, ko: '예레미야',       en: 'Jeremiah',         chs: 52,  testament: 'old' },
  { id: 25, ko: '예레미야애가',   en: 'Lamentations',     chs:  5,  testament: 'old' },
  { id: 26, ko: '에스겔',         en: 'Ezekiel',          chs: 48,  testament: 'old' },
  { id: 27, ko: '다니엘',         en: 'Daniel',           chs: 12,  testament: 'old' },
  { id: 28, ko: '호세아',         en: 'Hosea',            chs: 14,  testament: 'old' },
  { id: 29, ko: '요엘',           en: 'Joel',             chs:  3,  testament: 'old' },
  { id: 30, ko: '아모스',         en: 'Amos',             chs:  9,  testament: 'old' },
  { id: 31, ko: '오바댜',         en: 'Obadiah',          chs:  1,  testament: 'old' },
  { id: 32, ko: '요나',           en: 'Jonah',            chs:  4,  testament: 'old' },
  { id: 33, ko: '미가',           en: 'Micah',            chs:  7,  testament: 'old' },
  { id: 34, ko: '나훔',           en: 'Nahum',            chs:  3,  testament: 'old' },
  { id: 35, ko: '하박국',         en: 'Habakkuk',         chs:  3,  testament: 'old' },
  { id: 36, ko: '스바냐',         en: 'Zephaniah',        chs:  3,  testament: 'old' },
  { id: 37, ko: '학개',           en: 'Haggai',           chs:  2,  testament: 'old' },
  { id: 38, ko: '스가랴',         en: 'Zechariah',        chs: 14,  testament: 'old' },
  { id: 39, ko: '말라기',         en: 'Malachi',          chs:  4,  testament: 'old' },
  // ── 신약 New Testament (40-66) ─────────────────
  { id: 40, ko: '마태복음',       en: 'Matthew',          chs: 28,  testament: 'new' },
  { id: 41, ko: '마가복음',       en: 'Mark',             chs: 16,  testament: 'new' },
  { id: 42, ko: '누가복음',       en: 'Luke',             chs: 24,  testament: 'new' },
  { id: 43, ko: '요한복음',       en: 'John',             chs: 21,  testament: 'new' },
  { id: 44, ko: '사도행전',       en: 'Acts',             chs: 28,  testament: 'new' },
  { id: 45, ko: '로마서',         en: 'Romans',           chs: 16,  testament: 'new' },
  { id: 46, ko: '고린도전서',     en: '1 Corinthians',    chs: 16,  testament: 'new' },
  { id: 47, ko: '고린도후서',     en: '2 Corinthians',    chs: 13,  testament: 'new' },
  { id: 48, ko: '갈라디아서',     en: 'Galatians',        chs:  6,  testament: 'new' },
  { id: 49, ko: '에베소서',       en: 'Ephesians',        chs:  6,  testament: 'new' },
  { id: 50, ko: '빌립보서',       en: 'Philippians',      chs:  4,  testament: 'new' },
  { id: 51, ko: '골로새서',       en: 'Colossians',       chs:  4,  testament: 'new' },
  { id: 52, ko: '데살로니가전서', en: '1 Thessalonians',  chs:  5,  testament: 'new' },
  { id: 53, ko: '데살로니가후서', en: '2 Thessalonians',  chs:  3,  testament: 'new' },
  { id: 54, ko: '디모데전서',     en: '1 Timothy',        chs:  6,  testament: 'new' },
  { id: 55, ko: '디모데후서',     en: '2 Timothy',        chs:  4,  testament: 'new' },
  { id: 56, ko: '디도서',         en: 'Titus',            chs:  3,  testament: 'new' },
  { id: 57, ko: '빌레몬서',       en: 'Philemon',         chs:  1,  testament: 'new' },
  { id: 58, ko: '히브리서',       en: 'Hebrews',          chs: 13,  testament: 'new' },
  { id: 59, ko: '야고보서',       en: 'James',            chs:  5,  testament: 'new' },
  { id: 60, ko: '베드로전서',     en: '1 Peter',          chs:  5,  testament: 'new' },
  { id: 61, ko: '베드로후서',     en: '2 Peter',          chs:  3,  testament: 'new' },
  { id: 62, ko: '요한일서',       en: '1 John',           chs:  5,  testament: 'new' },
  { id: 63, ko: '요한이서',       en: '2 John',           chs:  1,  testament: 'new' },
  { id: 64, ko: '요한삼서',       en: '3 John',           chs:  1,  testament: 'new' },
  { id: 65, ko: '유다서',         en: 'Jude',             chs:  1,  testament: 'new' },
  { id: 66, ko: '요한계시록',     en: 'Revelation',       chs: 22,  testament: 'new' },
];

/* ── Korean book abbreviations → book id ────────── */
const KO_ABBR = {
  '창': 1,  '출': 2,  '레': 3,  '민': 4,  '신': 5,
  '수': 6,  '삿': 7,  '룻': 8,  '삼상': 9,'삼하': 10,
  '왕상': 11,'왕하': 12,'대상': 13,'대하': 14,'스': 15,
  '느': 16, '에': 17, '욥': 18, '시': 19, '잠': 20,
  '전': 21, '아': 22, '사': 23, '렘': 24, '애': 25,
  '겔': 26, '단': 27, '호': 28, '욜': 29, '암': 30,
  '옵': 31, '욘': 32, '미': 33, '나': 34, '합': 35,
  '습': 36, '학': 37, '슥': 38, '말': 39,
  '마': 40, '막': 41, '눅': 42, '요': 43, '행': 44,
  '롬': 45, '고전': 46,'고후': 47,'갈': 48, '엡': 49,
  '빌': 50, '골': 51, '살전': 52,'살후': 53,'딤전': 54,
  '딤후': 55,'딛': 56, '몬': 57, '히': 58, '약': 59,
  '벧전': 60,'벧후': 61,'요일': 62,'요이': 63,'요삼': 64,
  '유': 65, '계': 66,
};

/* Full Korean names → book id */
const KO_FULL = {};
BOOKS.forEach(b => { KO_FULL[b.ko] = b.id; });

/* ── English book abbreviations → book id ──────── */
const EN_ABBR = {
  gen:1, exo:2, ex:2, lev:3, num:4, deu:5, deut:5,
  jos:6, jdg:7, jud:7, rut:8, '1sa':9, '2sa':10,
  '1ki':11, '2ki':12, '1ch':13, '2ch':14, ezr:15,
  neh:16, est:17, job:18, psa:19, ps:19, pro:20,
  ecc:21, song:22, sos:22, isa:23, jer:24, lam:25,
  eze:26, ezk:26, dan:27, hos:28, joe:29, joel:29,
  amo:30, oba:31, jon:32, mic:33, nah:34, hab:35,
  zep:36, hag:37, zec:38, mal:39,
  mat:40, mt:40, mar:41, mk:41, luk:42, lk:42,
  joh:43, jn:43, act:44, rom:45, '1co':46, '2co':47,
  gal:48, eph:49, phi:50, php:50, col:51, '1th':52,
  '2th':53, '1ti':54, '2ti':55, tit:56, phm:57,
  heb:58, jam:59, jas:59, '1pe':60, '2pe':61,
  '1jo':62, '1jn':62, '2jo':63, '3jo':64, jud:65,
  rev:66,
};

/* Full English names → book id */
const EN_FULL = {};
BOOKS.forEach(b => { EN_FULL[b.en.toLowerCase()] = b.id; });

/* ── Helper functions ──────────────────────────── */

/** Get book object by id (1-66) */
function getBook(id) {
  return BOOKS.find(b => b.id === id) || null;
}

/** Get display name for book based on current version lang */
function bookDisplayName(book, lang = 'ko') {
  return lang === 'ko' ? book.ko : book.en;
}

/**
 * Parse a reference string like:
 *   "요 3:16", "요한복음 3:16", "John 3:16", "창 1:1-10"
 * Returns { bookId, chapter, verse, verseEnd } or null
 */
function parseReference(input) {
  if (!input) return null;
  input = input.trim();

  // Pattern: [book name/abbr] [chapter][:verse[-verseEnd]]
  // Allow Korean colons (：) and hyphens
  const pat = /^(.+?)\s+(\d+)(?:[:\uFF1A](\d+)(?:[-–](\d+))?)?$/;
  const m = input.match(pat);
  if (!m) return null;

  const bookStr  = m[1].trim();
  const chapter  = parseInt(m[2], 10);
  const verse    = m[3] ? parseInt(m[3], 10) : null;
  const verseEnd = m[4] ? parseInt(m[4], 10) : verse;

  // Try to resolve book
  let bookId = null;

  // Korean: full name
  bookId = KO_FULL[bookStr];

  // Korean: abbreviation
  if (!bookId) bookId = KO_ABBR[bookStr];

  // English: full name (case-insensitive)
  if (!bookId) bookId = EN_FULL[bookStr.toLowerCase()];

  // English: abbreviation (lowercase)
  if (!bookId) {
    const abbr = bookStr.toLowerCase().replace(/\./g, '').replace(/\s+/g, '');
    bookId = EN_ABBR[abbr];
  }

  if (!bookId) return null;

  const book = getBook(bookId);
  if (!book) return null;
  if (chapter < 1 || chapter > book.chs) return null;

  return { bookId, chapter, verse, verseEnd };
}

/**
 * Search books by name (partial match, Korean or English)
 * @param {string} q - search query
 * @param {'old'|'new'|'all'} testament
 */
function searchBooks(q, testament = 'all') {
  if (!q) {
    return testament === 'all' ? BOOKS : BOOKS.filter(b => b.testament === testament);
  }
  const ql = q.toLowerCase();
  return BOOKS.filter(b => {
    if (testament !== 'all' && b.testament !== testament) return false;
    return b.ko.includes(q) || b.en.toLowerCase().includes(ql);
  });
}
