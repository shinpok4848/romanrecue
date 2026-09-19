// app.js
//
// UI layer for SunoFlow. Imports the pure FEAT-001 logic modules and wires them
// to the DOM. All dynamic text is inserted via textContent / createElement (no
// innerHTML interpolation) so user theme text and comma-heavy prompts can never
// break markup or inject HTML. 100% self-contained: no network, no CDN.

import { generateMonthlyPlan, formatCopyAllSettings } from './promptEngine.js';
import {
  toJSON,
  fromJSON,
  toCSV,
  toMarkdownTable,
  buildYouTubeDescription,
} from './exporters.js';
import { savePlan, loadPlan } from './storage.js';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const STATUS_CYCLE = ['Planned', 'Generated', 'Published'];

/** Full track types shown for each filter value. */
const FILTER_TYPES = {
  all: null, // null = show everything
  main: 'main',
  shorts: 'shorts',
};

const state = {
  plan: null,
  filter: 'all',
};

// ---------------------------------------------------------------------------
// DOM references
// ---------------------------------------------------------------------------

const els = {
  form: document.getElementById('generate-form'),
  themeInput: document.getElementById('theme-input'),
  filterGroup: document.getElementById('filter-group'),
  calendar: document.getElementById('calendar'),
  tracks: document.getElementById('tracks'),
  emptyState: document.getElementById('empty-state'),
  toast: document.getElementById('toast'),
  exportJson: document.getElementById('export-json-btn'),
  importJson: document.getElementById('import-json-btn'),
  importInput: document.getElementById('import-json-input'),
  exportCsv: document.getElementById('export-csv-btn'),
  exportMd: document.getElementById('export-md-btn'),
};

// ---------------------------------------------------------------------------
// Small DOM helpers
// ---------------------------------------------------------------------------

/**
 * Create an element with optional class, text, and attributes. Text is always
 * assigned via textContent so it is never parsed as HTML.
 */
function el(tag, { className, text, attrs } = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  }
  return node;
}

/** Remove all children of a node. */
function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

let toastTimer = null;

/** Show a transient toast. `isError` switches to the error styling. */
function showToast(message, isError = false) {
  const toast = els.toast;
  toast.textContent = message;
  toast.hidden = false;
  toast.classList.toggle('toast--error', Boolean(isError));
  // Force reflow so the transition re-triggers on rapid successive calls.
  void toast.offsetWidth;
  toast.classList.add('is-visible');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('is-visible');
    toastTimer = setTimeout(() => {
      toast.hidden = true;
    }, 220);
  }, 1800);
}

// ---------------------------------------------------------------------------
// Clipboard (with graceful fallback)
// ---------------------------------------------------------------------------

/** Legacy fallback copy for contexts without navigator.clipboard (e.g. file://). */
function fallbackCopy(text) {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand && document.execCommand('copy');
    document.body.removeChild(ta);
    return Boolean(ok);
  } catch {
    return false;
  }
}

/** Copy text, preferring the async Clipboard API, then a legacy fallback. */
async function copyText(text, label) {
  const okMsg = `${label} copied ✓`;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      showToast(okMsg);
      return;
    }
  } catch {
    // Fall through to the legacy path below.
  }
  if (fallbackCopy(text)) {
    showToast(okMsg);
  } else {
    showToast(`Copy unavailable — select the text manually`, true);
  }
}

// ---------------------------------------------------------------------------
// Downloads (Blob + object URL, fully client-side)
// ---------------------------------------------------------------------------

function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = el('a', { attrs: { href: url, download: filename } });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoke on the next tick so the download has a chance to start.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** Build a filesystem-safe base name from the plan theme. */
function planBaseName() {
  const theme = (state.plan && state.plan.theme) || 'plan';
  const slug = String(theme)
    .trim()
    .replace(/[^a-zA-Z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  return `sunoflow-${slug || 'plan'}`;
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

const WEEK_ORDER = ['Wed', 'Thu', 'Fri', 'Sat'];

function renderCalendar() {
  clear(els.calendar);
  if (!state.plan) return;

  const byWeek = new Map();
  for (const track of state.plan.tracks) {
    if (!byWeek.has(track.week)) byWeek.set(track.week, []);
    byWeek.get(track.week).push(track);
  }

  const weeks = [...byWeek.keys()].sort((a, b) => a - b);
  for (const week of weeks) {
    const weekEl = el('div', { className: 'calendar__week' });
    weekEl.appendChild(
      el('h3', { className: 'calendar__week-title', text: `Week ${week}` }),
    );
    const tracks = byWeek
      .get(week)
      .slice()
      .sort((a, b) => WEEK_ORDER.indexOf(a.day) - WEEK_ORDER.indexOf(b.day));
    for (const track of tracks) {
      const slot = el('div', {
        className: `calendar__slot calendar__slot--${track.type}`,
      });
      slot.appendChild(
        el('span', { className: 'calendar__slot-day', text: track.day }),
      );
      slot.appendChild(
        el('span', {
          className: 'calendar__slot-type',
          text: track.type === 'main' ? 'Full' : 'Shorts',
        }),
      );
      slot.appendChild(
        el('span', { className: 'calendar__slot-date', text: track.releaseDate }),
      );
      weekEl.appendChild(slot);
    }
    els.calendar.appendChild(weekEl);
  }
}

/** Build one labelled copyable field (mono value block + copy button). */
function buildCopyField(label, value, copyLabel, track) {
  const field = el('div', { className: 'field' });
  const head = el('div', { className: 'field__head' });
  head.appendChild(el('span', { className: 'field__label', text: label }));
  if (copyLabel) {
    const btn = el('button', {
      className: 'btn btn--tiny',
      text: `Copy ${label}`,
      attrs: { type: 'button' },
    });
    btn.addEventListener('click', () => copyText(value, copyLabel));
    head.appendChild(btn);
  }
  field.appendChild(head);
  field.appendChild(
    el('p', { className: 'field__value field__value--mono', text: value }),
  );
  return field;
}

function buildParamChip(label, value) {
  const chip = el('span', { className: 'param-chip' });
  chip.appendChild(el('strong', { text: `${label}: ` }));
  chip.appendChild(document.createTextNode(String(value)));
  return chip;
}

function buildStatusToggle(track) {
  const btn = el('button', {
    className: 'status-toggle',
    text: track.status,
    attrs: { type: 'button', 'data-status': track.status, 'aria-label': 'Toggle status' },
  });
  btn.addEventListener('click', () => {
    const idx = STATUS_CYCLE.indexOf(track.status);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    track.status = next;
    btn.textContent = next;
    btn.setAttribute('data-status', next);
    savePlan(state.plan);
    showToast(`Status → ${next}`);
  });
  return btn;
}

function buildCard(track) {
  const card = el('article', { className: 'card', attrs: { 'data-type': track.type } });

  // Top row: meta + status.
  const top = el('div', { className: 'card__top' });
  const metaWrap = el('div');
  const meta = el('div', { className: 'card__meta' });
  meta.appendChild(
    el('span', {
      className: `card__type card__type--${track.type}`,
      text: track.type === 'main' ? '본편 · Full' : '숏츠 · Shorts',
    }),
  );
  meta.appendChild(el('span', { text: `W${track.week} · ${track.day}` }));
  meta.appendChild(el('span', { text: track.releaseDate }));
  metaWrap.appendChild(meta);
  metaWrap.appendChild(el('h3', { className: 'card__title', text: track.title }));
  top.appendChild(metaWrap);
  top.appendChild(buildStatusToggle(track));
  card.appendChild(top);

  // Prompt fields (each copyable).
  card.appendChild(buildCopyField('Style', track.stylePrompt, 'Style Prompt', track));
  card.appendChild(buildCopyField('Exclude', track.excludePrompt, 'Exclude Prompt', track));
  card.appendChild(buildCopyField('Mood', track.mood, 'Mood', track));
  card.appendChild(buildCopyField('Lyrics', track.lyricsGuide, 'Lyrics guide', track));

  // Parameter chips.
  const params = el('div', { className: 'card__params' });
  params.appendChild(buildParamChip('Vocal', track.vocalGender));
  params.appendChild(buildParamChip('Weirdness', `${track.weirdness}%`));
  params.appendChild(buildParamChip('Style Influence', `${track.styleInfluence}%`));
  card.appendChild(params);

  // Shorts hook guide.
  if (track.type === 'shorts' && track.shortsHookGuide) {
    const g = track.shortsHookGuide;
    const guide = el('div', { className: 'hook-guide' });
    guide.appendChild(el('p', { className: 'hook-guide__label', text: 'Shorts Hook Guide' }));
    const dl = el('dl');
    const addRow = (dt, dd) => {
      dl.appendChild(el('dt', { text: dt }));
      dl.appendChild(el('dd', { text: dd }));
    };
    addRow('Highlight', g.highlightSection);
    addRow('Video Hook', g.videoHookIdea);
    addRow('Hashtags', (g.captionHashtags || []).map((h) => `#${h}`).join(' '));
    guide.appendChild(dl);
    card.appendChild(guide);
  }

  // Actions row.
  const actions = el('div', { className: 'card__actions' });
  const allBtn = el('button', {
    className: 'btn btn--tiny',
    text: 'Copy All Settings',
    attrs: { type: 'button' },
  });
  allBtn.addEventListener('click', () =>
    copyText(formatCopyAllSettings(track), 'All settings'),
  );
  actions.appendChild(allBtn);

  const ytBtn = el('button', {
    className: 'btn btn--tiny',
    text: 'Copy YouTube Description',
    attrs: { type: 'button' },
  });
  ytBtn.addEventListener('click', () =>
    copyText(buildYouTubeDescription(track), 'YouTube description'),
  );
  actions.appendChild(ytBtn);
  card.appendChild(actions);

  return card;
}

function renderTracks() {
  clear(els.tracks);
  if (!state.plan) {
    els.emptyState.hidden = false;
    return;
  }
  els.emptyState.hidden = true;

  const typeFilter = FILTER_TYPES[state.filter];
  const visible = state.plan.tracks.filter(
    (t) => typeFilter == null || t.type === typeFilter,
  );
  for (const track of visible) {
    els.tracks.appendChild(buildCard(track));
  }
}

function render() {
  renderCalendar();
  renderTracks();
}

// ---------------------------------------------------------------------------
// Plan lifecycle
// ---------------------------------------------------------------------------

function setPlan(plan, { persist = true } = {}) {
  state.plan = plan;
  if (persist) savePlan(plan);
  render();
}

/** Minimal shape validation for imported plans. */
function isValidPlan(plan) {
  return (
    plan &&
    typeof plan === 'object' &&
    Array.isArray(plan.tracks) &&
    plan.tracks.length > 0 &&
    plan.tracks.every((t) => t && typeof t.id === 'string' && typeof t.title === 'string')
  );
}

// ---------------------------------------------------------------------------
// Event wiring
// ---------------------------------------------------------------------------

function handleGenerate(event) {
  event.preventDefault();
  const theme = els.themeInput.value.trim();
  const plan = generateMonthlyPlan({ theme });
  setPlan(plan);
  showToast('Monthly plan generated ✓');
}

function handleFilterClick(event) {
  const btn = event.target.closest('button[data-filter]');
  if (!btn) return;
  state.filter = btn.getAttribute('data-filter');
  for (const b of els.filterGroup.querySelectorAll('button[data-filter]')) {
    b.classList.toggle('is-active', b === btn);
  }
  renderTracks();
}

function handleExportJson() {
  if (!state.plan) return showToast('Nothing to export yet', true);
  downloadFile(`${planBaseName()}.json`, toJSON(state.plan), 'application/json');
  showToast('Exported JSON ✓');
}

function handleExportCsv() {
  if (!state.plan) return showToast('Nothing to export yet', true);
  downloadFile(`${planBaseName()}.csv`, toCSV(state.plan), 'text/csv');
  showToast('Exported CSV ✓');
}

function handleExportMd() {
  if (!state.plan) return showToast('Nothing to export yet', true);
  downloadFile(`${planBaseName()}.md`, toMarkdownTable(state.plan), 'text/markdown');
  showToast('Exported Markdown ✓');
}

function handleImportClick() {
  els.importInput.click();
}

function handleImportChange(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const plan = fromJSON(String(reader.result));
      if (!isValidPlan(plan)) {
        showToast('Invalid plan file', true);
        return;
      }
      state.filter = 'all';
      for (const b of els.filterGroup.querySelectorAll('button[data-filter]')) {
        b.classList.toggle('is-active', b.getAttribute('data-filter') === 'all');
      }
      if (els.themeInput && typeof plan.theme === 'string') {
        els.themeInput.value = plan.theme;
      }
      setPlan(plan);
      showToast('Plan imported ✓');
    } catch {
      showToast('Could not parse JSON', true);
    }
  };
  reader.onerror = () => showToast('Could not read file', true);
  reader.readAsText(file);
  // Reset so re-importing the same file fires change again.
  event.target.value = '';
}

function init() {
  els.form.addEventListener('submit', handleGenerate);
  els.filterGroup.addEventListener('click', handleFilterClick);
  els.exportJson.addEventListener('click', handleExportJson);
  els.exportCsv.addEventListener('click', handleExportCsv);
  els.exportMd.addEventListener('click', handleExportMd);
  els.importJson.addEventListener('click', handleImportClick);
  els.importInput.addEventListener('change', handleImportChange);

  const saved = loadPlan();
  if (isValidPlan(saved)) {
    state.plan = saved;
    if (els.themeInput && typeof saved.theme === 'string') {
      els.themeInput.value = saved.theme;
    }
  }
  render();
}

init();
