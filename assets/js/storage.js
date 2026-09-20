// storage.js
// Version-aware local persistence. The historical key is intentionally kept so
// existing browser plans remain discoverable; planSchema decides whether a
// payload is usable legacy content, valid v2, malformed, or from the future.

import { normalizePlan } from './planSchema.js';

/** Stable public storage contract — do not rename for schema v2. */
export const STORAGE_KEY = 'sunoflow.plan.v1';

function getStorage() {
  try {
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      return globalThis.localStorage;
    }
  } catch {
    // Sandboxed/privacy browser contexts can throw while reading the property.
  }
  return null;
}

export function serialize(plan) {
  return JSON.stringify(plan);
}

/** Pure tolerant JSON parse; schema normalization happens at the I/O boundary. */
export function deserialize(str) {
  if (str == null || str === '') return null;
  try {
    const parsed = JSON.parse(str);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function savePlan(plan) {
  const storage = getStorage();
  if (!storage) return false;
  const normalized = normalizePlan(plan);
  if (!normalized) return false;
  try {
    storage.setItem(STORAGE_KEY, serialize(normalized));
    return true;
  } catch {
    return false;
  }
}

export function loadPlan() {
  const storage = getStorage();
  if (!storage) return null;
  try {
    return normalizePlan(deserialize(storage.getItem(STORAGE_KEY)));
  } catch {
    return null;
  }
}

export function clearPlan() {
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
