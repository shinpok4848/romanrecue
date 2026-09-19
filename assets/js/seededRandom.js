// seededRandom.js
// Stable, dependency-free deterministic randomness with isolated named streams.
// Adding a draw in one stream never changes genre, concept, lyric, or parameter
// choices made by another stream.

/** Normalize a finite numeric seed without aliasing distinct unusual values. */
export function normalizeSeed(seed, fallback = 20240101) {
  const value = Number.isFinite(seed) ? seed : fallback;
  if (Number.isInteger(value) && value >= 0 && value <= 0xffffffff) {
    return value >>> 0;
  }
  // Fractions, negative values, and large integers retain their distinction.
  return hashString(String(value));
}

/** FNV-1a style stable string hash. */
export function hashString(value) {
  const text = String(value ?? '');
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Deterministic 32-bit PRNG returning floats in [0, 1). */
export function mulberry32(seed) {
  let state = normalizeSeed(seed, 0);
  return function next() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

/** Derive a stable sub-seed from a root seed and semantic stream names. */
export function deriveSeed(seed, ...names) {
  const root = normalizeSeed(seed);
  return (hashString(`${root}::${names.map(String).join('::')}`) ^ root) >>> 0;
}

/** Create an independent deterministic random stream. */
export function createNamedRng(seed, ...names) {
  return mulberry32(deriveSeed(seed, ...names));
}

/** Pick an inclusive integer range. */
export function intInRange(rng, min, max) {
  const low = Math.ceil(Math.min(min, max));
  const high = Math.floor(Math.max(min, max));
  return low + Math.floor(rng() * (high - low + 1));
}

/** Pick one array item, or undefined for an empty input. */
export function pick(rng, values) {
  if (!Array.isArray(values) || values.length === 0) return undefined;
  return values[Math.floor(rng() * values.length)];
}

/** Return a seeded shuffled copy without mutating the source. */
export function shuffle(rng, values) {
  const result = Array.isArray(values) ? [...values] : [];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

/** Build a fixed-length non-repeating rotation whenever the pool is large enough. */
export function buildRotation(rng, poolSize, length = 4) {
  if (!Number.isInteger(poolSize) || poolSize <= 0 || length <= 0) return [];
  const indices = shuffle(rng, Array.from({ length: poolSize }, (_, index) => index));
  return Array.from({ length }, (_, index) => indices[index % indices.length]);
}
