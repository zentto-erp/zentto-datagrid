/**
 * Layout persistence — localStorage (sync) + zentto-cache (async remote).
 *
 * Estrategia:
 * - localStorage.getItem() es SÍNCRONO → layout se aplica ANTES del primer render
 * - zentto-cache (Redis + PG) es ASÍNCRONO → sync en background después del render
 * - Al guardar: escribe local + remoto en paralelo
 * - Al cargar: lee local inmediato, luego intenta remoto y actualiza si difiere
 */

import type { PivotConfig } from '../types';

const STORAGE_PREFIX = 'zentto-grid-layout:';

export interface GridChartLayout {
  open?: boolean;
  type?: 'bar' | 'line' | 'pie' | 'area' | 'donut' | 'scatter' | 'stacked' | 'combo';
  xField?: string;
  yFields?: string[];
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  title?: string;
  showLegend?: boolean;
}

export interface GridLayout {
  columnOrder?: string[];
  columnWidths?: Record<string, number>;
  columnVisibility?: Record<string, boolean>;
  density?: 'compact' | 'standard' | 'comfortable';
  groupByField?: string;
  groupSort?: 'asc' | 'desc' | '';
  features?: Record<string, boolean | string>;
  theme?: string;
  locale?: string;
  sorts?: Array<{ field: string; direction: string }>;
  pageSize?: number;
  freezeRows?: number;
  freezeCols?: number;
  viewMode?: 'table' | 'form' | 'cards' | 'kanban' | 'chart';
  kanbanField?: string;
  pivotConfig?: PivotConfig;
  chart?: GridChartLayout;
}

/* ══════════════════════════════════════════
   Remote cache config (zentto-cache)
   ══════════════════════════════════════════ */

export interface RemoteCacheConfig {
  baseUrl: string;       // https://cache.zentto.net
  companyId: string;
  userId?: string;
  email?: string;
  appKey?: string;       // x-app-key (solo server-side; en browser usa cookie HttpOnly)
}

let _remoteConfig: RemoteCacheConfig | null = null;

/**
 * Configurar remote cache. Llamar una vez al inicializar la app.
 */
export function configureRemoteCache(config: RemoteCacheConfig): void {
  _remoteConfig = config;
}

/* ══════════════════════════════════════════
   Local storage (SÍNCRONO)
   ══════════════════════════════════════════ */

/**
 * Save grid layout. SYNCHRONOUS + async remote.
 */
export function saveLayout(gridId: string, layout: GridLayout): void {
  // 1. Local — síncrono, inmediato
  try {
    localStorage.setItem(STORAGE_PREFIX + gridId, JSON.stringify(layout));
  } catch {
    // localStorage full or not available (SSR)
  }

  // 2. Remote — asíncrono, background
  saveLayoutRemote(gridId, layout).catch(() => {});
}

/**
 * Load grid layout. SYNCHRONOUS — returns immediately from localStorage.
 * Si hay remote config, intenta sync en background.
 */
export function loadLayout(gridId: string): GridLayout | null {
  let local: GridLayout | null = null;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + gridId);
    local = raw ? JSON.parse(raw) : null;
  } catch {
    // noop
  }

  // Intentar sync remoto en background (no bloquea)
  if (_remoteConfig) {
    loadLayoutRemote(gridId).then((remote) => {
      if (remote && JSON.stringify(remote) !== JSON.stringify(local)) {
        // Remote tiene datos diferentes — actualizar local
        try {
          localStorage.setItem(STORAGE_PREFIX + gridId, JSON.stringify(remote));
        } catch { /* noop */ }
        // Disparar evento para que el grid se actualice
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('zentto-grid-layout-sync', {
            detail: { gridId, layout: remote },
          }));
        }
      }
    }).catch(() => {});
  }

  return local;
}

/**
 * Clear layout for a grid.
 */
export function clearLayout(gridId: string): void {
  try {
    localStorage.removeItem(STORAGE_PREFIX + gridId);
  } catch { /* noop */ }

  // También limpiar remoto
  deleteLayoutRemote(gridId).catch(() => {});
}

/* ══════════════════════════════════════════
   Remote cache (zentto-cache — ASÍNCRONO)
   ══════════════════════════════════════════ */

/**
 * Headers de auth para zentto-cache.
 * - En browser: cookie HttpOnly zentto_token viaja automáticamente (credentials: include)
 * - En server/MCP: appKey va en x-app-key header
 */
function remoteHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (_remoteConfig?.appKey) headers['x-app-key'] = _remoteConfig.appKey;
  return headers;
}

async function saveLayoutRemote(gridId: string, layout: GridLayout): Promise<void> {
  if (!_remoteConfig) return;
  const { baseUrl, companyId, userId, email } = _remoteConfig;

  await fetch(`${baseUrl}/v1/grid-layouts/${gridId}`, {
    method: 'PUT',
    headers: remoteHeaders(),
    credentials: 'include', // Cookie HttpOnly zentto_token
    body: JSON.stringify({ companyId, userId, email, gridId, layout }),
  });
}

async function loadLayoutRemote(gridId: string): Promise<GridLayout | null> {
  if (!_remoteConfig) return null;
  const { baseUrl, companyId, userId, email } = _remoteConfig;

  const params = new URLSearchParams({ companyId });
  if (userId) params.set('userId', userId);
  if (email) params.set('email', email);

  const res = await fetch(`${baseUrl}/v1/grid-layouts/${gridId}?${params}`, {
    headers: remoteHeaders(),
    credentials: 'include',
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.layout ?? null;
}

async function deleteLayoutRemote(gridId: string): Promise<void> {
  if (!_remoteConfig) return;
  const { baseUrl, companyId, userId, email } = _remoteConfig;

  const params = new URLSearchParams({ companyId });
  if (userId) params.set('userId', userId);
  if (email) params.set('email', email);

  await fetch(`${baseUrl}/v1/grid-layouts/${gridId}?${params}`, {
    method: 'DELETE',
    headers: remoteHeaders(),
    credentials: 'include',
  });
}

// Backward compat aliases
export { saveLayout as saveLayoutSync, loadLayout as loadLayoutSync };
