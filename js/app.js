/* ===================================================
   app.js — Main Application Logic
   =================================================== */

'use strict';

const App = (() => {

  /* ── State ─────────────────────────────────────── */
  const state = {
    version:      'korean',     // current Bible version
    bookId:       null,        // current book (1-66)
    chapter:      null,        // current chapter
    testament:    'old',       // sidebar tab
    fontSize:     18,          // px
    compareMode:  false,       // side-by-side
    compareVer:   'kjv',       // second version for comparison
    lastSearch:   '',
    sidebarOpen:  false,
  };

  /* ── DOM refs ──────────────────────────────────── */
  const $ = id => document.getElementById(id);
  const $$ = sel => document.querySelectorAll(sel);

  const dom = {
    menuBtn:         $('menuBtn'),
    sidebar:         $('sidebar'),
    sidebarBackdrop: $('sidebarBackdrop'),
    bookFilter:      $('bookFilter'),
    bookList:        $('bookList'),
    searchInput:     $('searchInput'),
    searchClear:     $('searchClear'),
    versionSelect:   $('versionSelect'),
    themeBtn:        $('themeBtn'),
    // screens
    welcomeScreen:   $('welcomeScreen'),
    readingScreen:   $('readingScreen'),
    searchScreen:    $('searchScreen'),
    loadingScreen:   $('loadingScreen'),
    // reading
    chapterTitle:    $('chapterTitle'),
    verBadge:        $('verBadge'),
    chPicker:        $('chPicker'),
    versesWrap:      $('versesWrap'),
    prevChBtn:       $('prevChBtn'),
    nextChBtn:       $('nextChBtn'),
    prevChBtn2:      $('prevChBtn2'),
    nextChBtn2:      $('nextChBtn2'),
    // search
    srTitle:         $('srTitle'),
    srSubtitle:      $('srSubtitle'),
    srList:          $('srList'),
    srClose:         $('srClose'),
    // quick grid
    quickGrid:       $('quickGrid'),
    // font
    fontUp:          $('fontUp'),
    fontDown:        $('fontDown'),
    // compare
    compareBtn:      $('compareBtn'),
    // toast
    toast:           $('toast'),
  };

  /* ── Theme ─────────────────────────────────────── */
  function initTheme() {
    const saved = localStorage.getItem('bible_theme') || 'light';
    setTheme(saved);
  }

  function setTheme(t) {
    document.body.dataset.theme = t;
    localStorage.setItem('bible_theme', t);
    const moon = dom.themeBtn.querySelector('.ic-moon');
    const sun  = dom.themeBtn.querySelector('.ic-sun');
    moon.style.display = t === 'dark' ? 'none' : '';
    sun.style.display  = t === 'dark' ? ''     : 'none';
  }

  function toggleTheme() {
    setTheme(document.body.dataset.theme === 'dark' ? 'light' : 'dark');
  }

  /* ── Font size ─────────────────────────────────── */
  function initFontSize() {
    const saved = parseInt(localStorage.getItem('bible_font') || '18', 10);
    state.fontSize = saved;
    applyFontSize();
  }

  function applyFontSize() {
    document.documentElement.style.setProperty('--font-size', `${state.fontSize}px`);
    document.documentElement.style.setProperty('--line-h', state.fontSize >= 22 ? '2.1' : '1.9');
  }

  function changeFontSize(delta) {
    state.fontSize = Math.min(30, Math.max(13, state.fontSize + delta));
    localStorage.setItem('bible_font', state.fontSize);
    applyFontSize();
    showToast(`글자 크기: ${state.fontSize}px`);
  }

  /* ── Sidebar ───────────────────────────────────── */
  function openSidebar() {
    state.sidebarOpen = true;
    dom.sidebar.classList.add('open');
    dom.sidebarBackdrop.classList.add('show');
  }

  function closeSidebar() {
    state.sidebarOpen = false;
    dom.sidebar.classList.remove('open');
    dom.sidebarBackdrop.classList.remove('show');
  }

  function toggleSidebar() {
    state.sidebarOpen ? closeSidebar() : openSidebar();
  }

  /* ── Book list ─────────────────────────────────── */
  function renderBookList(filter = '') {
    const books = searchBooks(filter, state.testament);
    const lang  = currentLang();

    dom.bookList.innerHTML = '';
    books.forEach(book => {
      const li = document.createElement('li');
      li.className = 'book-item' + (book.id === state.bookId ? ' active' : '');
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', book.id === state.bookId ? 'true' : 'false');
      li.dataset.id = book.id;

      const name  = lang === 'ko' ? book.ko : book.en;
      const chs   = book.chs;

      li.innerHTML = `<span>${name}</span><span class="book-item-num">${chs}장</span>`;
      li.addEventListener('click', () => {
        selectBook(book.id);
        if (window.innerWidth < 768) closeSidebar();
      });
      dom.bookList.appendChild(li);
    });
  }

  function setTestamentTab(tab) {
    state.testament = tab;
    $$('.t-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    renderBookList(dom.bookFilter.value);
  }

  /* ── Version ───────────────────────────────────── */
  function currentLang() {
    return VERSIONS[state.version]?.lang || 'ko';
  }

  function changeVersion(ver) {
    if (!VERSIONS[ver]) return;
    state.version = ver;
    localStorage.setItem('bible_version', ver);

    // Re-render current chapter with new version
    if (state.bookId && state.chapter) {
      loadChapter(state.bookId, state.chapter);
    }
    renderBookList(dom.bookFilter.value);
  }

  /* ── Screen management ─────────────────────────── */
  function showScreen(name) {
    dom.welcomeScreen.style.display  = 'none';
    dom.readingScreen.style.display  = 'none';
    dom.searchScreen.style.display   = 'none';
    dom.loadingScreen.style.display  = 'none';

    if (name === 'welcome')  dom.welcomeScreen.style.display = '';
    if (name === 'reading')  dom.readingScreen.style.display = '';
    if (name === 'search')   dom.searchScreen.style.display  = '';
    if (name === 'loading')  dom.loadingScreen.style.display = '';
  }

  function showWelcome() {
    state.bookId  = null;
    state.chapter = null;
    showScreen('welcome');
    renderBookList(dom.bookFilter.value);
    // Hide compare btn on welcome
    dom.compareBtn.style.display = 'none';
  }

  /* ── Book / Chapter selection ──────────────────── */
  function selectBook(bookId) {
    const book = getBook(bookId);
    if (!book) return;
    state.bookId = bookId;
    loadChapter(bookId, 1);
    renderBookList(dom.bookFilter.value);
  }

  async function loadChapter(bookId, chapter, targetVerse = null) {
    const book = getBook(bookId);
    if (!book) return;

    // Clamp chapter
    chapter = Math.max(1, Math.min(chapter, book.chs));

    state.bookId  = bookId;
    state.chapter = chapter;

    showScreen('loading');

    try {
      let primaryData;
      let compareData = null;

      if (state.compareMode) {
        [primaryData, compareData] = await Promise.all([
          BibleAPI.fetchChapter(state.version, bookId, chapter),
          BibleAPI.fetchChapter(state.compareVer, bookId, chapter),
        ]);
      } else {
        primaryData = await BibleAPI.fetchChapter(state.version, bookId, chapter);
      }

      renderReading(book, primaryData, compareData);
      showScreen('reading');
      dom.compareBtn.style.display = '';

      // Scroll to target verse
      if (targetVerse) {
        setTimeout(() => scrollToVerse(targetVerse), 100);
      } else {
        dom.readingScreen.parentElement.scrollTop = 0;
      }

    } catch (err) {
      showScreen('reading');
      dom.versesWrap.innerHTML = `
        <div class="error-box">
          <h3>⚠ 오류</h3>
          <p>${err.message}</p>
          <p style="font-size:12px;color:var(--tx3)">
            일부 번역본은 getbible.net에서 제공되지 않을 수 있습니다.<br>
            다른 버전을 선택해 보세요.
          </p>
          <button onclick="App.loadChapter(${bookId}, ${chapter})">다시 시도</button>
        </div>`;
    }

    // Update book list active state
    $$('.book-item').forEach(li => {
      li.classList.toggle('active', Number(li.dataset.id) === bookId);
    });
  }

  /* ── Render reading view ───────────────────────── */
  function renderReading(book, data, compareData = null) {
    const lang = currentLang();
    const bookName = lang === 'ko' ? book.ko : book.en;

    // Title
    dom.chapterTitle.textContent = `${bookName} ${data.chapter}장`;
    dom.verBadge.textContent = VERSIONS[state.version]?.label.split(' ')[0] || state.version;

    // Chapter picker
    renderChapterPicker(book);

    // Nav buttons
    dom.prevChBtn.disabled = data.chapter <= 1;
    dom.nextChBtn.disabled = data.chapter >= book.chs;
    dom.prevChBtn2.disabled = data.chapter <= 1;
    dom.nextChBtn2.disabled = data.chapter >= book.chs;

    // Verses
    if (compareData) {
      renderCompare(data, compareData);
    } else {
      renderVerses(data.verses, data);
    }
  }

  function renderChapterPicker(book) {
    dom.chPicker.innerHTML = '';
    for (let c = 1; c <= book.chs; c++) {
      const btn = document.createElement('button');
      btn.className = 'ch-btn' + (c === state.chapter ? ' active' : '');
      btn.textContent = c;
      btn.addEventListener('click', () => loadChapter(state.bookId, c));
      dom.chPicker.appendChild(btn);
    }
  }

  function renderVerses(verses, meta) {
    dom.versesWrap.innerHTML = '';

    if (!verses || verses.length === 0) {
      dom.versesWrap.innerHTML = '<p style="color:var(--tx3);padding:20px">구절을 불러올 수 없습니다.</p>';
      return;
    }

    const frag = document.createDocumentFragment();
    verses.forEach(v => {
      const row = document.createElement('div');
      row.className = 'verse-row';
      row.dataset.verse = v.verse;

      const refText = `${meta ? (VERSIONS[meta.translation || state.version]?.label.split(' ')[0] || state.version) : ''} ${getBook(state.bookId)?.ko || ''} ${state.chapter}:${v.verse}`;

      row.innerHTML = `
        <span class="v-num">${v.verse}</span>
        <span class="v-text">${escapeHtml(v.text)}</span>
        <div class="verse-actions">
          <button class="v-action-btn" onclick="App.copyVerse('${escapeAttr(v.text)}', '${escapeAttr(refText)}')">복사</button>
          <button class="v-action-btn" onclick="App.shareVerse('${escapeAttr(v.text)}', '${escapeAttr(refText)}')">공유</button>
        </div>`;

      row.addEventListener('click', e => {
        if (e.target.closest('.verse-actions')) return;
        row.classList.toggle('selected');
      });

      frag.appendChild(row);
    });

    dom.versesWrap.appendChild(frag);
  }

  function renderCompare(data1, data2) {
    dom.versesWrap.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'compare-wrap';

    const col1 = document.createElement('div');
    col1.className = 'compare-col';
    col1.innerHTML = `<div class="compare-col-header">${VERSIONS[state.version]?.label.split(' ')[0] || state.version}</div>`;
    const verses1 = document.createElement('div');
    renderVersesInto(verses1, data1.verses, data1);
    col1.appendChild(verses1);

    const col2 = document.createElement('div');
    col2.className = 'compare-col';
    col2.innerHTML = `<div class="compare-col-header">${VERSIONS[state.compareVer]?.label.split(' ')[0] || state.compareVer}</div>`;
    const verses2 = document.createElement('div');
    renderVersesInto(verses2, data2.verses, data2);
    col2.appendChild(verses2);

    wrap.appendChild(col1);
    wrap.appendChild(col2);
    dom.versesWrap.appendChild(wrap);
  }

  function renderVersesInto(container, verses, meta) {
    if (!verses || verses.length === 0) {
      container.innerHTML = '<p style="color:var(--tx3);font-size:13px">데이터 없음</p>';
      return;
    }
    verses.forEach(v => {
      const row = document.createElement('div');
      row.className = 'verse-row';
      row.innerHTML = `<span class="v-num">${v.verse}</span><span class="v-text">${escapeHtml(v.text)}</span>`;
      container.appendChild(row);
    });
  }

  /* ── Scroll to verse ───────────────────────────── */
  function scrollToVerse(verseNum) {
    const row = dom.versesWrap.querySelector(`[data-verse="${verseNum}"]`);
    if (!row) return;
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    row.classList.add('highlight-anim');
    row.addEventListener('animationend', () => row.classList.remove('highlight-anim'), { once: true });
  }

  /* ── Compare mode ──────────────────────────────── */
  function toggleCompare() {
    if (state.compareMode) {
      state.compareMode = false;
      dom.compareBtn.classList.remove('active');
      dom.compareBtn.title = '두 버전 비교';
      if (state.bookId && state.chapter) loadChapter(state.bookId, state.chapter);
    } else {
      // Pick compare version
      const cur = state.version;
      const others = Object.keys(VERSIONS).filter(v => v !== cur);
      const best = cur.startsWith('korean') || cur === 'koreankjv'
        ? (others.find(v => v === 'kjv') || others[0])
        : (others.find(v => v === 'korean') || others[0]);
      state.compareVer = best;
      state.compareMode = true;
      dom.compareBtn.classList.add('active');
      dom.compareBtn.title = '비교 모드 끄기';
      if (state.bookId && state.chapter) loadChapter(state.bookId, state.chapter);
    }
  }

  /* ── Search ────────────────────────────────────── */
  async function handleSearch(q) {
    q = q.trim();
    if (!q) return;

    state.lastSearch = q;

    // 1. Try to parse as a Bible reference first
    const ref = parseReference(q);
    if (ref) {
      loadChapter(ref.bookId, ref.chapter, ref.verse);
      dom.searchInput.value = '';
      updateSearchClear('');
      return;
    }

    // 2. Text search in cached chapters
    showScreen('loading');

    const cachedResults = BibleAPI.searchCached(state.version, q);

    if (cachedResults.length > 0) {
      showSearchResults(q, cachedResults);
      return;
    }

    // 3. No cached results — inform user
    showSearchResults(q, []);
  }

  function showSearchResults(query, results) {
    showScreen('search');
    dom.compareBtn.style.display = 'none';

    const lang = currentLang();
    dom.srTitle.textContent = `"${query}" 검색 결과`;
    dom.srSubtitle.textContent = results.length
      ? `${results.length}개 구절 발견 (현재 버전: ${VERSIONS[state.version]?.label.split(' ')[0]})`
      : '검색 결과가 없습니다.';

    dom.srList.innerHTML = '';

    if (results.length === 0) {
      dom.srList.innerHTML = `
        <div class="error-box">
          <h3>검색 결과 없음</h3>
          <p>
            "<strong>${escapeHtml(query)}</strong>"에 대한 결과를 찾지 못했습니다.<br>
            먼저 구절을 읽으면 해당 내용이 검색 인덱스에 추가됩니다.
          </p>
          <p style="font-size:12px;margin-top:8px">
            팁: 구절 참조로 바로 이동할 수 있습니다 (예: <em>요 3:16</em>, <em>John 3:16</em>)
          </p>
        </div>`;
      return;
    }

    const frag = document.createDocumentFragment();
    results.forEach(r => {
      const book = getBook(r.bookId);
      if (!book) return;
      const bookName = lang === 'ko' ? book.ko : book.en;

      const item = document.createElement('div');
      item.className = 'sr-item';

      const highlighted = highlightText(r.text, query);

      item.innerHTML = `
        <div class="sr-item-ref">${bookName} ${r.chapter}:${r.verse}</div>
        <div class="sr-item-text">${highlighted}</div>`;

      item.addEventListener('click', () => {
        loadChapter(r.bookId, r.chapter, r.verse);
      });

      frag.appendChild(item);
    });

    dom.srList.appendChild(frag);
  }

  function highlightText(text, query) {
    const escaped = escapeHtml(text);
    const q = escapeHtml(query);
    const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return escaped.replace(re, '<mark>$1</mark>');
  }

  /* ── Copy / Share ──────────────────────────────── */
  function copyVerse(text, ref) {
    const full = `${text} — ${ref}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(full)
        .then(() => showToast('복사되었습니다'))
        .catch(() => showToast('복사 실패'));
    } else {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = full;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('복사되었습니다');
    }
  }

  function shareVerse(text, ref) {
    const shareData = {
      title: ref,
      text: `${text} — ${ref}`,
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      copyVerse(text, ref);
      showToast('클립보드에 복사되었습니다 (공유 불가)');
    }
  }

  /* ── Toast ─────────────────────────────────────── */
  let toastTimer;
  function showToast(msg) {
    dom.toast.textContent = msg;
    dom.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => dom.toast.classList.remove('show'), 2200);
  }

  /* ── Utilities ─────────────────────────────────── */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;');
  }
  function escapeAttr(str) {
    return String(str).replace(/'/g, '&#39;').replace(/"/g, '&quot;');
  }

  function updateSearchClear(val) {
    dom.searchClear.style.display = val ? '' : 'none';
  }

  /* ── Keyboard shortcuts ────────────────────────── */
  function initKeyboard() {
    document.addEventListener('keydown', e => {
      // Ignore if typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

      switch (e.key) {
        case 'ArrowLeft':
          if (state.bookId && state.chapter) loadChapter(state.bookId, state.chapter - 1);
          break;
        case 'ArrowRight':
          if (state.bookId && state.chapter) loadChapter(state.bookId, state.chapter + 1);
          break;
        case '/':
        case 'f':
          e.preventDefault();
          dom.searchInput.focus();
          break;
        case 'Escape':
          if (dom.searchInput === document.activeElement) dom.searchInput.blur();
          if (state.sidebarOpen) closeSidebar();
          break;
      }
    });
  }

  /* ── URL hash navigation ───────────────────────── */
  function parseHash() {
    // Format: #korean/43/3/16  (version/bookId/chapter[/verse])
    const hash = location.hash.slice(1);
    if (!hash) return;
    const parts = hash.split('/');
    if (parts.length < 3) return;
    const [ver, bookId, ch, vs] = parts;
    if (VERSIONS[ver]) {
      state.version = ver;
      dom.versionSelect.value = ver;
    }
    const b = parseInt(bookId, 10);
    const c = parseInt(ch, 10);
    const v = vs ? parseInt(vs, 10) : null;
    if (b >= 1 && b <= 66 && c >= 1) {
      loadChapter(b, c, v);
    }
  }

  function updateHash() {
    if (state.bookId && state.chapter) {
      location.hash = `${state.version}/${state.bookId}/${state.chapter}`;
    }
  }

  /* ── Init ──────────────────────────────────────── */
  function init() {
    // Restore saved version
    const savedVer = localStorage.getItem('bible_version');
    if (savedVer && VERSIONS[savedVer]) {
      state.version = savedVer;
      dom.versionSelect.value = savedVer;
    }

    initTheme();
    initFontSize();
    renderBookList();
    showWelcome();

    // ── Event listeners ──────────────────────────

    // Sidebar toggle
    dom.menuBtn.addEventListener('click', toggleSidebar);
    dom.sidebarBackdrop.addEventListener('click', closeSidebar);

    // Testament tabs
    $$('.t-tab').forEach(btn => {
      btn.addEventListener('click', () => setTestamentTab(btn.dataset.tab));
    });

    // Book filter
    dom.bookFilter.addEventListener('input', e => {
      renderBookList(e.target.value);
    });

    // Search
    dom.searchInput.addEventListener('input', e => {
      updateSearchClear(e.target.value);
    });
    dom.searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleSearch(dom.searchInput.value);
    });
    dom.searchClear.addEventListener('click', () => {
      dom.searchInput.value = '';
      updateSearchClear('');
      dom.searchInput.focus();
    });

    // Version select
    dom.versionSelect.addEventListener('change', e => changeVersion(e.target.value));

    // Theme
    dom.themeBtn.addEventListener('click', toggleTheme);

    // Chapter nav
    dom.prevChBtn.addEventListener('click',  () => loadChapter(state.bookId, state.chapter - 1));
    dom.nextChBtn.addEventListener('click',  () => loadChapter(state.bookId, state.chapter + 1));
    dom.prevChBtn2.addEventListener('click', () => loadChapter(state.bookId, state.chapter - 1));
    dom.nextChBtn2.addEventListener('click', () => loadChapter(state.bookId, state.chapter + 1));

    // Search results close
    dom.srClose.addEventListener('click', () => {
      if (state.bookId && state.chapter) {
        showScreen('reading');
        dom.compareBtn.style.display = '';
      } else {
        showWelcome();
      }
    });

    // Quick grid
    dom.quickGrid.querySelectorAll('button[data-book]').forEach(btn => {
      btn.addEventListener('click', () => {
        loadChapter(Number(btn.dataset.book), Number(btn.dataset.ch));
      });
    });

    // Font size
    dom.fontUp.addEventListener('click',   () => changeFontSize(+2));
    dom.fontDown.addEventListener('click', () => changeFontSize(-2));

    // Compare button
    dom.compareBtn.addEventListener('click', toggleCompare);

    // Keyboard
    initKeyboard();

    // Hash-based navigation
    window.addEventListener('hashchange', parseHash);
    parseHash();

    // Track hash when chapter loads
    const origLoad = loadChapter;
    // We'll update hash after successful load inside loadChapter
  }

  /* ── Public API ────────────────────────────────── */
  return {
    init,
    showWelcome,
    loadChapter,
    copyVerse,
    shareVerse,
  };

})();

/* Start the app */
document.addEventListener('DOMContentLoaded', () => App.init());
