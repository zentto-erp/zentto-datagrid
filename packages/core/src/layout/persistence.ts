/**
 * Layout persistence via IndexedDB.
 * Saves column order, widths, visibility, density per gridId.
 */

const DB_NAME = 'zentto-grid-layouts';
const STORE_NAME = 'layouts';
const DB_VERSION = 1;

export interface GridLayout {
  columnOrder?: string[];
  columnWidths?: Record<string, number>;
  columnVisibility?: Record<string, boolean>;
  density?: 'compact' | 'standard' | 'comfortable';
  groupByField?: string;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Save grid layout to IndexedDB.
 */
export async function saveLayout(gridId: string, layout: GridLayout): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(layout, gridId);
    await new Promise<void>((res, rej) => {
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  } catch {
    // IndexedDB not available (SSR, incognito) — silently ignore
  }
}

/**
 * Load grid layout from IndexedDB.
 */
export async function loadLayout(gridId: string): Promise<GridLayout | null> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(gridId);
    return new Promise((resolve) => {
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Clear layout for a grid.
 */
export async function clearLayout(gridId: string): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(gridId);
  } catch {
    // noop
  }
}
