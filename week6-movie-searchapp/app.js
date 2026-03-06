const API_KEY  = '673c8a05';          
const BASE_URL = 'https://www.omdbapi.com/';
const RESULTS_PER_PAGE = 10;          
const RECENT_MAX = 8;
const CACHE_PREFIX = 'cs_movie_';    
const RECENT_KEY  = 'cs_recent';     

const searchInput    = document.getElementById('searchInput');
const clearBtn       = document.getElementById('clearBtn');
const searchStatus   = document.getElementById('searchStatus');
const searchMeta     = document.getElementById('searchMeta');
const loaderWrapper  = document.getElementById('loaderWrapper');
const errorMsg       = document.getElementById('errorMsg');
const resultsSection = document.getElementById('resultsSection');
const resultsGrid    = document.getElementById('resultsGrid');
const pagination     = document.getElementById('pagination');
const emptyState     = document.getElementById('emptyState');
const recentSearches = document.getElementById('recentSearches');
const recentTags     = document.getElementById('recentTags');
const clearRecent    = document.getElementById('clearRecent');
const modalOverlay   = document.getElementById('modalOverlay');
const modalContent   = document.getElementById('modalContent');
const modalClose     = document.getElementById('modalClose');

let state = {
  query:       '',
  currentPage: 1,
  totalResults: 0,
  debounceTimer: null,
  loading:     false,
};


function debounce(fn, delay) {
  let timer;
  function debounced(...args) {
    clearTimeout(timer);
    searchStatus.textContent = 'Searching…';
    timer = setTimeout(() => {
      searchStatus.textContent = '';
      fn.apply(this, args);
    }, delay);
  }
  debounced.cancel = () => {
    clearTimeout(timer);
    timer = null;
  };
  return debounced;
}


function getRecent() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
  } catch { return []; }
}

function saveRecent(query) {
  if (!query.trim()) return;
  let recent = getRecent().filter(q => q.toLowerCase() !== query.toLowerCase());
  recent.unshift(query.trim());
  recent = recent.slice(0, RECENT_MAX);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
  renderRecent();
}

function renderRecent() {
  const recent = getRecent();
  if (!recent.length) {
    recentSearches.classList.remove('visible');
    return;
  }
  recentSearches.classList.add('visible');
  recentTags.innerHTML = recent.map(q =>
    `<button class="recent-tag" data-query="${escapeAttr(q)}">${escapeHtml(q)}</button>`
  ).join('');
}

clearRecent.addEventListener('click', () => {
  localStorage.removeItem(RECENT_KEY);
  renderRecent();
});

recentTags.addEventListener('click', e => {
  const btn = e.target.closest('.recent-tag');
  if (!btn) return;
  const q = btn.dataset.query;
  searchInput.value = q;
  clearBtn.classList.add('visible');
  triggerSearch(q, 1);
});


function getCached(imdbID) {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + imdbID);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function setCache(imdbID, data) {
  try {
    sessionStorage.setItem(CACHE_PREFIX + imdbID, JSON.stringify(data));
  } catch {  }
}

async function searchMovies(query, page = 1) {
  const url = `${BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}&page=${page}&type=`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Network error');
  return res.json();
}

async function getMovieDetail(imdbID) {
  const cached = getCached(imdbID);
  if (cached) return cached;

  const url = `${BASE_URL}?apikey=${API_KEY}&i=${imdbID}&plot=full`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Network error');
  const data = await res.json();
  setCache(imdbID, data);
  return data;
}

async function triggerSearch(query, page) {
  query = query.trim();
  if (!query) {
    showEmptyState();
    return;
  }
  if (!searchInput.value.trim()) {
    showEmptyState();
    return;
  }

  state.query = query;
  state.currentPage = page;
  state.loading = true;

  showLoader();

  try {
    const data = await searchMovies(query, page);

    if (data.Response === 'False') {
      showError(data.Error || 'No results found.');
    } else {
      state.totalResults = parseInt(data.totalResults, 10);
      saveRecent(query);
      renderResults(data.Search);
      renderPagination();
      renderMeta();
    }
  } catch (err) {
    showError('Failed to fetch results. Check your connection.');
  } finally {
    state.loading = false;
    hideLoader();
  }
}

function renderResults(movies) {
  hideError();
  emptyState.style.display = 'none';

  resultsGrid.innerHTML = movies.map(m => {
    const hasPoster = m.Poster && m.Poster !== 'N/A';
    return `
      <article class="movie-card" data-id="${m.imdbID}" tabindex="0" role="button" aria-label="${escapeAttr(m.Title)}">
        ${hasPoster
          ? `<img class="card-poster" src="${escapeAttr(m.Poster)}" alt="${escapeAttr(m.Title)}" loading="lazy" />`
          : `<div class="card-poster-placeholder">🎬<small>No image</small></div>`
        }
        <div class="card-body">
          <h3 class="card-title">${escapeHtml(m.Title)}</h3>
          <div class="card-meta">
            <span class="card-year">${m.Year || '—'}</span>
            <span class="card-type">${capitalize(m.Type || 'movie')}</span>
          </div>
        </div>
      </article>
    `;
  }).join('');

  resultsSection.classList.add('visible');

  resultsGrid.querySelectorAll('.card-poster').forEach(img => {
    img.addEventListener('error', () => {
      img.parentElement.innerHTML = '<div class="card-poster-placeholder">🎬<small>No image</small></div>';
    });
  });

  resultsGrid.querySelectorAll('.movie-card').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.id));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(card.dataset.id); }
    });
  });
}

function renderMeta() {
  const totalPages = Math.ceil(state.totalResults / RESULTS_PER_PAGE);
  const start = (state.currentPage - 1) * RESULTS_PER_PAGE + 1;
  const end   = Math.min(state.currentPage * RESULTS_PER_PAGE, state.totalResults);
  searchMeta.textContent = `Showing ${start}–${end} of ${state.totalResults.toLocaleString()} results`;
}


function renderPagination() {
  const totalPages = Math.ceil(state.totalResults / RESULTS_PER_PAGE);
  if (totalPages <= 1) { pagination.innerHTML = ''; return; }

  let html = '';

  html += `<button class="page-btn" data-page="${state.currentPage - 1}" ${state.currentPage === 1 ? 'disabled' : ''}>‹ Prev</button>`;

  const pages = getPageRange(state.currentPage, totalPages);
  let lastWas = null;
  pages.forEach(p => {
    if (p === '…') {
      if (lastWas !== '…') html += `<span class="page-ellipsis">…</span>`;
      lastWas = '…';
    } else {
      html += `<button class="page-btn ${p === state.currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
      lastWas = p;
    }
  });

  html += `<button class="page-btn" data-page="${state.currentPage + 1}" ${state.currentPage === totalPages ? 'disabled' : ''}>Next ›</button>`;

  pagination.innerHTML = html;

  pagination.querySelectorAll('.page-btn:not(:disabled)').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = parseInt(btn.dataset.page, 10);
      if (page !== state.currentPage) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        triggerSearch(state.query, page);
      }
    });
  });
}

function getPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const delta = 2;
  const range = [];
  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i);
  }
  const result = [1];
  if (range[0] > 2) result.push('…');
  result.push(...range);
  if (range[range.length - 1] < total - 1) result.push('…');
  result.push(total);
  return result;
}


async function openModal(imdbID) {
  modalContent.innerHTML = `<div class="modal-loader">${loaderHTML()}</div>`;
  modalOverlay.classList.add('visible');
  document.body.style.overflow = 'hidden';

  try {
    const m = await getMovieDetail(imdbID);
    if (m.Response === 'False') {
      modalContent.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-2)">Details unavailable</div>`;
      return;
    }

    const hasPoster = m.Poster && m.Poster !== 'N/A';
    const hasRating = m.imdbRating && m.imdbRating !== 'N/A';

    modalContent.innerHTML = `
      <div class="modal-hero">
        ${hasPoster
          ? `<img class="modal-poster" src="${escapeAttr(m.Poster)}" alt="${escapeAttr(m.Title)}" />`
          : `<div class="modal-poster-placeholder">🎬</div>`
        }
        <div class="modal-info">
          <span class="modal-type-badge">${capitalize(m.Type || 'Movie')}</span>
          <h2 class="modal-title">${escapeHtml(m.Title)}</h2>
          <p class="modal-year">${m.Year || ''}${m.Runtime && m.Runtime !== 'N/A' ? ' · ' + m.Runtime : ''}</p>
          ${hasRating ? `<div class="rating-pill">⭐ ${m.imdbRating} <span style="color:var(--text-3);font-weight:400">/ 10</span></div>` : ''}
          <div class="modal-detail-row" style="margin-top:${hasRating ? '16px' : '0'}">
            ${m.Genre && m.Genre !== 'N/A'    ? `<div class="modal-detail"><span class="modal-detail-label">Genre</span><span class="modal-detail-value">${escapeHtml(m.Genre)}</span></div>` : ''}
            ${m.Director && m.Director !== 'N/A' ? `<div class="modal-detail"><span class="modal-detail-label">Director</span><span class="modal-detail-value">${escapeHtml(m.Director)}</span></div>` : ''}
            ${m.Actors && m.Actors !== 'N/A'   ? `<div class="modal-detail"><span class="modal-detail-label">Cast</span><span class="modal-detail-value">${escapeHtml(m.Actors)}</span></div>` : ''}
            ${m.Language && m.Language !== 'N/A' ? `<div class="modal-detail"><span class="modal-detail-label">Language</span><span class="modal-detail-value">${escapeHtml(m.Language)}</span></div>` : ''}
          </div>
        </div>
      </div>
      ${m.Plot && m.Plot !== 'N/A' ? `
        <div class="modal-body-text">
          <div class="modal-plot"><strong>Plot</strong>${escapeHtml(m.Plot)}</div>
        </div>` : ''}
    `;
    const modalPoster = modalContent.querySelector('.modal-poster');
    if (modalPoster) {
      modalPoster.addEventListener('error', () => {
        modalPoster.replaceWith(Object.assign(document.createElement('div'), {
          className: 'modal-poster-placeholder',
          textContent: '🎬'
        }));
      });
    }
  } catch {
    modalContent.innerHTML = `<div style="padding:40px;text-align:center;color:var(--accent)">Could not load details.</div>`;
  }
}

function closeModal() {
  modalOverlay.classList.remove('visible');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

function loaderHTML() {
  return `<div class="loader">
    <div class="loader-dot"></div>
    <div class="loader-dot"></div>
    <div class="loader-dot"></div>
  </div>`;
}


const debouncedSearch = debounce((query) => {
  triggerSearch(query, 1);
}, 350);

searchInput.addEventListener('input', e => {
  const val = e.target.value;
  clearBtn.classList.toggle('visible', val.length > 0);

  if (!val.trim()) {
    debouncedSearch.cancel();
    searchStatus.textContent = '';
    showEmptyState();
    return;
  }

  debouncedSearch(val);
});

clearBtn.addEventListener('click', () => {
  debouncedSearch.cancel();
  searchInput.value = '';
  clearBtn.classList.remove('visible');
  searchStatus.textContent = '';
  searchMeta.textContent = '';
  showEmptyState();
  searchInput.focus();
});


function showLoader() {
  loaderWrapper.classList.add('visible');
  resultsSection.classList.remove('visible');
  pagination.innerHTML = '';
  errorMsg.classList.remove('visible');
  emptyState.style.display = 'none';
  searchMeta.textContent = '';
}

function hideLoader() { loaderWrapper.classList.remove('visible'); }

function showEmptyState() {
  emptyState.style.display = '';
  resultsSection.classList.remove('visible');
  pagination.innerHTML = '';
  searchMeta.textContent = '';
  recentSearches.classList.remove('visible');
  hideLoader();
  hideError();
}

function showError(msg) {
  if (!searchInput.value.trim()) {
    showEmptyState();
    return;
  }
  errorMsg.textContent = msg;
  errorMsg.classList.add('visible');
  resultsSection.classList.remove('visible');
  pagination.innerHTML = '';
}

function hideError() { errorMsg.classList.remove('visible'); errorMsg.textContent = ''; }


function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function escapeAttr(str) {
  return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

renderRecent();
showEmptyState();
searchInput.focus();