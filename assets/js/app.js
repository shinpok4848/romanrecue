// app.js
// Browser-only UI for the dependency-free SunoFlow engine. Dynamic content is
// inserted exclusively with textContent/createTextNode; imported themes and
// lyrics are never interpreted as HTML.

import { generateMonthlyPlan, formatCopyAllSettings } from './promptEngine.js';
import {
  toJSON,
  fromJSON,
  toCSV,
  toMarkdown,
  buildYouTubeDescription,
} from './exporters.js';
import { savePlan, loadPlan } from './storage.js';
import { inspectPlanSchema, isLegacyPlan, normalizePlan } from './planSchema.js';
import { formatStructure } from './structureProfiles.js';

const STATUS_CYCLE = ['Planned', 'Generated', 'Published'];
const FILTER_TYPES = { all: null, main: 'main', shorts: 'shorts' };
const WEEK_ORDER = ['Wed', 'Thu', 'Fri', 'Sat'];

const state = { plan: null, filter: 'all' };

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

function el(tag, { className, text, attrs } = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  }
  return node;
}

function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

let toastTimer = null;
function showToast(message, isError = false) {
  els.toast.textContent = message;
  els.toast.hidden = false;
  els.toast.classList.toggle('toast--error', Boolean(isError));
  void els.toast.offsetWidth;
  els.toast.classList.add('is-visible');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    els.toast.classList.remove('is-visible');
    toastTimer = setTimeout(() => { els.toast.hidden = true; }, 220);
  }, 1800);
}

function fallbackCopy(text) {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-1000px';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand && document.execCommand('copy');
    document.body.removeChild(textarea);
    return Boolean(copied);
  } catch {
    return false;
  }
}

async function copyText(text, label) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(String(text ?? ''));
      showToast(`${label} 복사 완료 ✓`);
      return;
    }
  } catch {
    // Continue to the dependency-free legacy path.
  }
  if (fallbackCopy(String(text ?? ''))) showToast(`${label} 복사 완료 ✓`);
  else showToast('복사할 수 없습니다 — 텍스트를 직접 선택해 주세요', true);
}

function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = el('a', { attrs: { href: url, download: filename } });
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function planBaseName() {
  const theme = state.plan?.theme || 'plan';
  const slug = String(theme)
    .trim()
    .replace(/[^a-zA-Z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLocaleLowerCase('en-US');
  return `sunoflow-${slug || 'plan'}`;
}

let fallbackSeedCounter = 0;
function freshGenerationSeed() {
  const buffer = new Uint32Array(1);
  try {
    if (globalThis.crypto?.getRandomValues) {
      globalThis.crypto.getRandomValues(buffer);
      return buffer[0];
    }
  } catch {
    // Date/performance fallback below is only for older restricted browsers.
  }
  fallbackSeedCounter = (fallbackSeedCounter + 1) >>> 0;
  const highResolution = typeof performance !== 'undefined'
    ? Math.floor(performance.now() * 1000)
    : 0;
  return (Date.now() ^ highResolution ^ fallbackSeedCounter) >>> 0;
}

function daySortIndex(day) {
  const index = WEEK_ORDER.indexOf(day);
  return index < 0 ? WEEK_ORDER.length : index;
}

function renderCalendar() {
  clear(els.calendar);
  if (!state.plan) return;
  const byWeek = new Map();
  for (const track of state.plan.tracks) {
    if (!byWeek.has(track.week)) byWeek.set(track.week, []);
    byWeek.get(track.week).push(track);
  }

  for (const week of [...byWeek.keys()].sort((a, b) => a - b)) {
    const weekNode = el('div', { className: 'calendar__week' });
    weekNode.appendChild(el('h3', { className: 'calendar__week-title', text: `Week ${week}` }));
    const tracks = byWeek.get(week).slice().sort((a, b) => daySortIndex(a.day) - daySortIndex(b.day));
    for (const track of tracks) {
      const slot = el('div', { className: `calendar__slot calendar__slot--${track.type}` });
      slot.appendChild(el('span', { className: 'calendar__slot-day', text: track.day }));
      slot.appendChild(el('span', { className: 'calendar__slot-type', text: track.type === 'main' ? 'Full' : 'Shorts' }));
      slot.appendChild(el('span', { className: 'calendar__slot-date', text: track.releaseDate }));
      weekNode.appendChild(slot);
    }
    els.calendar.appendChild(weekNode);
  }
}

function buildCopyField(label, value, copyLabel, options = {}) {
  const text = String(value ?? '');
  const field = el('section', { className: `field${options.korean ? ' field--korean' : ''}` });
  const head = el('div', { className: 'field__head' });
  head.appendChild(el('span', { className: 'field__label', text: label }));
  const button = el('button', {
    className: 'btn btn--tiny',
    text: `Copy ${options.shortLabel || label}`,
    attrs: { type: 'button', 'aria-label': `${label} 복사` },
  });
  button.addEventListener('click', () => copyText(text, copyLabel || label));
  head.appendChild(button);
  field.appendChild(head);

  const valueNode = el(options.multiline ? 'pre' : 'p', {
    className: `field__value field__value--mono${options.korean ? ' field__value--lyrics' : ''}`,
    text,
  });
  if (options.collapsible) {
    const details = el('details', { className: 'field__details' });
    if (options.open) details.open = true;
    const lineCount = text ? text.split(/\r?\n/).length : 0;
    details.appendChild(el('summary', {
      text: options.summary || (lineCount > 1 ? `내용 보기 · ${lineCount} lines` : '내용 보기'),
    }));
    details.appendChild(valueNode);
    field.appendChild(details);
  } else {
    field.appendChild(valueNode);
  }
  return field;
}

function buildParamChip(label, value) {
  const chip = el('span', { className: 'param-chip' });
  chip.appendChild(el('strong', { text: `${label}: ` }));
  chip.appendChild(document.createTextNode(String(value ?? '—')));
  return chip;
}

function buildStatusToggle(track) {
  const button = el('button', {
    className: 'status-toggle',
    text: track.status,
    attrs: {
      type: 'button',
      'data-status': track.status,
      'aria-label': `${track.title} 상태 변경`,
    },
  });
  button.addEventListener('click', () => {
    const currentIndex = STATUS_CYCLE.indexOf(track.status);
    const next = STATUS_CYCLE[(Math.max(currentIndex, 0) + 1) % STATUS_CYCLE.length];
    track.status = next;
    button.textContent = next;
    button.setAttribute('data-status', next);
    savePlan(state.plan);
    showToast(`상태 → ${next}`);
  });
  return button;
}

function buildCard(track) {
  const legacy = track.legacy === true || isLegacyPlan(state.plan);
  const card = el('article', {
    className: `card${legacy ? ' card--legacy' : ''}`,
    attrs: { 'data-type': track.type },
  });

  const top = el('div', { className: 'card__top' });
  const metaWrap = el('div', { className: 'card__identity' });
  const meta = el('div', { className: 'card__meta' });
  meta.appendChild(el('span', {
    className: `card__type card__type--${track.type}`,
    text: track.type === 'main' ? '본편 · Full' : '숏츠 · Shorts',
  }));
  meta.appendChild(el('span', { text: `W${track.week} · ${track.day}` }));
  meta.appendChild(el('span', { text: track.releaseDate }));
  if (legacy) meta.appendChild(el('span', { className: 'legacy-badge', text: 'Legacy v1' }));
  metaWrap.appendChild(meta);

  const titleRow = el('div', { className: 'card__title-row' });
  titleRow.appendChild(el('h3', { className: 'card__title', text: track.title }));
  const titleCopy = el('button', {
    className: 'btn btn--tiny',
    text: 'Copy Title',
    attrs: { type: 'button', 'aria-label': '제목 복사' },
  });
  titleCopy.addEventListener('click', () => copyText(track.title, 'Title'));
  titleRow.appendChild(titleCopy);
  metaWrap.appendChild(titleRow);
  top.appendChild(metaWrap);
  top.appendChild(buildStatusToggle(track));
  card.appendChild(top);

  if (!legacy && track.concept) {
    const concept = el('div', { className: 'concept-strip' });
    concept.appendChild(el('strong', { text: `${track.concept.paletteNameKo || '콘셉트'} · ` }));
    concept.appendChild(document.createTextNode(`${track.concept.scene} — ${track.concept.emotionalArc}`));
    card.appendChild(concept);
  } else if (legacy) {
    card.appendChild(el('p', {
      className: 'legacy-note',
      text: '이 항목은 기존 v1 플랜입니다. 아래 Lyrics는 완성형 한글 가사가 아니라 당시 저장된 영어 가이드입니다.',
    }));
  }

  const params = el('div', { className: 'card__params' });
  if (!legacy) {
    params.appendChild(buildParamChip('BPM', track.bpm));
    params.appendChild(buildParamChip('Key', track.key));
  }
  params.appendChild(buildParamChip('Vocal', track.vocalGender));
  params.appendChild(buildParamChip('Weirdness', `${track.weirdness}%`));
  params.appendChild(buildParamChip('Style Influence', `${track.styleInfluence}%`));
  card.appendChild(params);

  card.appendChild(buildCopyField('Style Prompt', track.stylePrompt, 'Style Prompt', { collapsible: true }));
  card.appendChild(buildCopyField('Exclude Prompt', track.excludePrompt, 'Exclude Prompt', { collapsible: true }));
  card.appendChild(buildCopyField('Mood', track.mood, 'Mood', { collapsible: true }));
  if (!legacy && track.vocalPhrase) {
    card.appendChild(buildCopyField('Vocal Direction', track.vocalPhrase, 'Vocal Direction', { collapsible: true }));
  }

  const lyrics = track.lyrics ?? track.lyricsGuide ?? '';
  card.appendChild(buildCopyField(
    legacy ? 'Legacy English Lyrics Guidance' : '완성형 한글 Lyrics',
    lyrics,
    legacy ? 'Legacy lyrics guidance' : 'Full Korean Lyrics',
    { collapsible: true, multiline: true, korean: !legacy, shortLabel: 'Lyrics' },
  ));

  if (!legacy && Array.isArray(track.structure)) {
    card.appendChild(buildCopyField('Song Structure', formatStructure(track.structure), 'Song Structure', { collapsible: true, shortLabel: 'Structure' }));
    card.appendChild(buildCopyField('Structure Rationale', track.structureRationale, 'Structure Rationale', { collapsible: true, shortLabel: 'Rationale' }));
    card.appendChild(buildCopyField('Producer Prescription', track.producerPrescription, 'Producer Prescription', { collapsible: true, shortLabel: 'Prescription' }));
  }

  if (track.type === 'shorts' && track.shortsHookGuide) {
    const guide = track.shortsHookGuide;
    if (guide.excerpt) {
      card.appendChild(buildCopyField('Shorts Exact Excerpt', guide.excerpt, 'Shorts Exact Excerpt', {
        collapsible: true,
        multiline: true,
        korean: true,
        shortLabel: 'Excerpt',
      }));
    }
    const guideNode = el('details', { className: 'hook-guide' });
    guideNode.appendChild(el('summary', { className: 'hook-guide__label', text: 'Shorts Hook Guide' }));
    const list = el('dl');
    const addRow = (term, description) => {
      list.appendChild(el('dt', { text: term }));
      list.appendChild(el('dd', { text: description || '—' }));
    };
    addRow('Source', guide.sourceSection || guide.highlightSection);
    addRow('Highlight', guide.highlightSection);
    addRow('Video Hook', guide.videoHookIdea);
    addRow('Hashtags', (guide.captionHashtags || []).map((tag) => `#${tag}`).join(' '));
    guideNode.appendChild(list);
    card.appendChild(guideNode);
  }

  const actions = el('div', { className: 'card__actions' });
  const copyAll = el('button', { className: 'btn btn--tiny btn--primary-small', text: 'Copy All Settings', attrs: { type: 'button' } });
  copyAll.addEventListener('click', () => copyText(formatCopyAllSettings(track), 'All settings'));
  actions.appendChild(copyAll);
  const copyYouTube = el('button', { className: 'btn btn--tiny', text: 'Copy YouTube Description', attrs: { type: 'button' } });
  copyYouTube.addEventListener('click', () => copyText(buildYouTubeDescription(track), 'YouTube description'));
  actions.appendChild(copyYouTube);
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
  const type = FILTER_TYPES[state.filter];
  for (const track of state.plan.tracks.filter((item) => type == null || item.type === type)) {
    els.tracks.appendChild(buildCard(track));
  }
}

function render() {
  renderCalendar();
  renderTracks();
}

function setPlan(plan, { persist = true } = {}) {
  const normalized = normalizePlan(plan);
  if (!normalized) return false;
  state.plan = normalized;
  if (persist) savePlan(normalized);
  render();
  return true;
}

function updateFilterButtons() {
  for (const button of els.filterGroup.querySelectorAll('button[data-filter]')) {
    const active = button.getAttribute('data-filter') === state.filter;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  }
}

function handleGenerate(event) {
  event.preventDefault();
  const theme = els.themeInput.value.trim();
  const plan = generateMonthlyPlan({ theme, seed: freshGenerationSeed() });
  if (!setPlan(plan)) {
    showToast('생성된 플랜을 검증할 수 없습니다', true);
    return;
  }
  showToast('새 월간 Suno v6 패키지 생성 완료 ✓');
}

function handleFilterClick(event) {
  const button = event.target.closest('button[data-filter]');
  if (!button) return;
  state.filter = button.getAttribute('data-filter');
  updateFilterButtons();
  renderTracks();
}

function handleExportJson() {
  if (!state.plan) return showToast('내보낼 플랜이 없습니다', true);
  downloadFile(`${planBaseName()}.json`, toJSON(state.plan), 'application/json');
  showToast('JSON 내보내기 완료 ✓');
}

function handleExportCsv() {
  if (!state.plan) return showToast('내보낼 플랜이 없습니다', true);
  downloadFile(`${planBaseName()}.csv`, toCSV(state.plan), 'text/csv;charset=utf-8');
  showToast('CSV 내보내기 완료 ✓');
}

function handleExportMd() {
  if (!state.plan) return showToast('내보낼 플랜이 없습니다', true);
  downloadFile(`${planBaseName()}.md`, toMarkdown(state.plan), 'text/markdown;charset=utf-8');
  showToast('Markdown 내보내기 완료 ✓');
}

function handleImportChange(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const result = inspectPlanSchema(fromJSON(String(reader.result)));
      if (!result.plan) {
        const message = result.error === 'future-schema'
          ? '더 최신 버전의 플랜이라 가져올 수 없습니다'
          : '손상되었거나 지원하지 않는 플랜입니다';
        showToast(message, true);
        return;
      }
      state.filter = 'all';
      updateFilterButtons();
      if (typeof result.plan.theme === 'string') els.themeInput.value = result.plan.theme;
      setPlan(result.plan);
      showToast(result.legacy ? 'Legacy v1 플랜을 안전하게 불러왔습니다 ✓' : '플랜 가져오기 완료 ✓');
    } catch {
      showToast('JSON을 해석할 수 없습니다', true);
    }
  };
  reader.onerror = () => showToast('파일을 읽을 수 없습니다', true);
  reader.readAsText(file);
  event.target.value = '';
}

function init() {
  els.form.addEventListener('submit', handleGenerate);
  els.filterGroup.addEventListener('click', handleFilterClick);
  els.exportJson.addEventListener('click', handleExportJson);
  els.exportCsv.addEventListener('click', handleExportCsv);
  els.exportMd.addEventListener('click', handleExportMd);
  els.importJson.addEventListener('click', () => els.importInput.click());
  els.importInput.addEventListener('change', handleImportChange);
  updateFilterButtons();

  const saved = loadPlan();
  if (saved) {
    state.plan = saved;
    if (typeof saved.theme === 'string') els.themeInput.value = saved.theme;
  }
  render();
}

init();
