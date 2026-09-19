// storage.js
//
// localStorage persistence for the current monthly plan, plus pure
// serialize/deserialize helpers shared with import/export. The module guards
// for the absence of localStorage so it imports cleanly in node (for tests)
// and works via file:// in a browser. NO DOM access at module top level.

/** Stable localStorage key for the persisted plan. */
export const STORAGE_KEY = 'sunoflow.plan.v1';

/**
 * Resolve a Web Storage object if one is available in the current runtime.
 * Returns null in node (no localStorage) or if access throws (e.g. privacy
 * mode / disabled storage), so callers can degrade gracefully.
 * @returns {Storage|null}
 */
function getStorage() {
  try {
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      return globalThis.localStorage;
    }
  } catch {
    // Accessing localStorage can throw in some sandboxed contexts.
  }
  return null;
}

/**
 * Serialize a plan object to a storable JSON string.
 * Pure — testable without a browser.
 * @param {object} plan
 * @returns {string}
 */
export function serialize(plan) {
  return JSON.stringify(plan);
}

/**
 * Deserialize a stored JSON string back into a plan object. Returns null for
 * empty/invalid input instead of throwing. Pure — testable without a browser.
 * @param {string|null|undefined} str
 * @returns {object|null}
 */
export function deserialize(str) {
  if (str == null || str === '') return null;
  try {
    const parsed = JSON.parse(str);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Persist a plan to localStorage. No-op (returns false) when storage is
 * unavailable.
 * @param {object} plan
 * @returns {boolean} true if the plan was saved
 */
export function savePlan(plan) {
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, serialize(plan));
    return true;
  } catch {
    return false;
  }
}

/**
 * Load the persisted plan from localStorage, or null if none/unavailable.
 * @returns {object|null}
 */
export function loadPlan() {
  const storage = getStorage();
  if (!storage) return null;
  try {
    return deserialize(storage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

/**
 * Remove the persisted plan from localStorage. No-op when unavailable.
 * @returns {boolean} true if a clear was attempted successfully
 */
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
