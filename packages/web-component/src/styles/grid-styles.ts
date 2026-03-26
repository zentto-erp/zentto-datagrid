import { css } from 'lit';

/**
 * ZenttoDataGrid — Zentto Design Language
 *
 * Identidad visual propia: warm tones, generous radius, soft depth.
 * Tipografia: Inter (open source, libre).
 * Todas las variables --zg-* son overrideables desde fuera del shadow DOM.
 *
 * Override desde framework:
 *   zentto-grid { --zg-primary: #8b5cf6; --zg-row-height: 48px; }
 */
export const gridStyles = css`
  :host {
    display: block;

    /* ─── Overrideable Design Tokens ───────────────────── */

    /* Typography — Inter (libre, open source) */
    --zg-font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    --zg-font-size: 13.5px;
    --zg-grid-size: 8px;

    /* Shape */
    --zg-radius: 4px;
    --zg-radius-lg: 10px;

    /* Palette — Zentto warm identity */
    --zg-primary: #e67e22;
    --zg-primary-soft: rgba(230, 126, 34, 0.09);
    --zg-bg: #ffffff;
    --zg-surface: #f7f8fa;
    --zg-text: #1c1e21;
    --zg-text-secondary: #5f6368;
    --zg-text-muted: #9aa0a6;
    --zg-border: rgba(0, 0, 0, 0.1);
    --zg-border-strong: rgba(0, 0, 0, 0.18);
    --zg-focus-ring: 0 0 0 3px rgba(230, 126, 34, 0.22);

    /* Header */
    --zg-header-bg: #f7f8fa;
    --zg-header-color: #1c1e21;
    --zg-header-hover: rgba(0, 0, 0, 0.04);
    --zg-header-height: 42px;
    --zg-header-weight: 600;
    --zg-header-size: 12.5px;
    --zg-header-tracking: 0.025em;

    /* Rows */
    --zg-row-height: 40px;
    --zg-row-bg: var(--zg-bg);
    --zg-row-stripe: #fafbfc;
    --zg-row-hover: rgba(230, 126, 34, 0.06);
    --zg-row-selected: rgba(230, 126, 34, 0.1);

    /* Footer */
    --zg-footer-bg: #f7f8fa;

    /* Inputs */
    --zg-input-bg: #fff;
    --zg-input-border: rgba(0, 0, 0, 0.18);

    /* Depth */
    --zg-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06);
    --zg-shadow-md: 0 4px 14px rgba(0, 0, 0, 0.1);
    --zg-shadow-lg: 0 8px 28px rgba(0, 0, 0, 0.14);

    /* Status */
    --zg-success: #0d9668;
    --zg-error: #d63031;
    --zg-warning: #e67e22;
    --zg-info: #2d7dd2;

    font-family: var(--zg-font-family);
    font-size: var(--zg-font-size);
    color: var(--zg-text);
    -webkit-font-smoothing: antialiased;
  }

  *, *::before, *::after { box-sizing: border-box; }

  /* ═══════════════════════════════════════════════
     THEMES
     ═══════════════════════════════════════════════ */

  .zg-theme-dark {
    --zg-bg: #1b1f27;
    --zg-surface: #242830;
    --zg-text: #dce0e5;
    --zg-text-secondary: #9aa0a6;
    --zg-text-muted: #6b7280;
    --zg-border: rgba(255, 255, 255, 0.1);
    --zg-border-strong: rgba(255, 255, 255, 0.16);
    --zg-header-bg: #242830;
    --zg-header-color: #e0e3e8;
    --zg-header-hover: rgba(255, 255, 255, 0.05);
    --zg-row-bg: #1b1f27;
    --zg-row-stripe: #21252d;
    --zg-row-hover: rgba(230, 126, 34, 0.12);
    --zg-row-selected: rgba(230, 126, 34, 0.18);
    --zg-footer-bg: #242830;
    --zg-input-bg: #181c24;
    --zg-input-border: rgba(255, 255, 255, 0.14);
    --zg-primary-soft: rgba(230, 126, 34, 0.15);
    --zg-focus-ring: 0 0 0 3px rgba(230, 126, 34, 0.3);
    --zg-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
    --zg-shadow-md: 0 4px 14px rgba(0, 0, 0, 0.4);
    --zg-shadow-lg: 0 8px 28px rgba(0, 0, 0, 0.5);
    --zg-success: #34d399;
    --zg-error: #f87171;
    --zg-warning: #fbbf24;
    --zg-info: #60a5fa;
  }

  /* Dark mode overrides for hardcoded elements */
  /* Dark mode explicit overrides */
  .zg-theme-dark .zg-td { color: #dce0e5; }
  .zg-theme-dark .zg-th { color: #e0e3e8; }
  .zg-theme-dark .zg-loading { background: rgba(27, 31, 39, 0.75); }
  .zg-theme-dark .zg-toggle-thumb { background: #dce0e5; }
  .zg-theme-dark .zg-config-code { background: #0d1117; color: #c9d1d9; }
  .zg-theme-dark .zg-bottom-sheet { background: #242830; color: #dce0e5; }
  .zg-theme-dark .zg-datepicker { background: #242830; color: #dce0e5; }
  .zg-theme-dark .zg-datepicker-day { color: #dce0e5; }
  .zg-theme-dark .zg-chip--filled { color: #1b1f27; }
  .zg-theme-dark .zg-import-modal { background: #242830; color: #dce0e5; }
  .zg-theme-dark .zg-config-fw-tab--active { color: #1b1f27; }
  .zg-theme-dark .zg-config-panel { background: #1b1f27; color: #dce0e5; }
  .zg-theme-dark .zg-config-select { background: #181c24; color: #dce0e5; border-color: rgba(255,255,255,0.14); }
  .zg-theme-dark .zg-context-menu { background: #242830; color: #dce0e5; }
  .zg-theme-dark .zg-header-menu { background: #242830; color: #dce0e5; }
  .zg-theme-dark .zg-toolbar-panel { background: #242830; color: #dce0e5; }
  .zg-theme-dark .zg-filter-input { background: #181c24; color: #dce0e5; }
  .zg-theme-dark .zg-find-input { background: #181c24; color: #dce0e5; }
  .zg-theme-dark .zg-edit-input { color: #dce0e5; border-bottom-color: var(--zg-primary); }
  .zg-theme-dark .zg-page-size { background: #181c24; color: #dce0e5; }
  .zg-theme-dark .zg-btn { background: #242830; color: #dce0e5; border-color: rgba(255,255,255,0.14); }
  .zg-theme-dark .zg-btn:hover { background: #2d323c; }
  .zg-theme-dark .zg-row-group-header { background: #242830 !important; }
  .zg-theme-dark .zg-row-totals { background: #242830; }
  .zg-theme-dark .zg-td-detail { background: #1e2228; }
  .zg-theme-dark .zg-group-chip { background: #242830; color: #dce0e5; border-color: rgba(255,255,255,0.14); }

  .zg-theme-zentto {
    --zg-primary: #f59e0b;
    --zg-primary-soft: rgba(245, 158, 11, 0.09);
    --zg-header-bg: #fffcf5;
    --zg-header-hover: rgba(245, 158, 11, 0.06);
    --zg-row-hover: rgba(245, 158, 11, 0.06);
    --zg-row-selected: rgba(245, 158, 11, 0.1);
    --zg-focus-ring: 0 0 0 3px rgba(245, 158, 11, 0.22);
  }

  /* ═══════════════════════════════════════════════
     CONTAINER
     ═══════════════════════════════════════════════ */

  .zg-container {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--zg-border);
    border-radius: var(--zg-radius-lg);
    overflow: hidden;
    background: var(--zg-bg);
    outline: none;
    position: relative;
  }

  /* ═══════════════════════════════════════════════
     TOOLBAR
     ═══════════════════════════════════════════════ */

  .zg-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 12px;
    border-bottom: 1px solid var(--zg-border);
    background: var(--zg-header-bg);
    gap: 8px;
    min-height: 38px;
  }

  .zg-toolbar-left, .zg-toolbar-right {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .zg-row-count {
    font-size: 12px;
    color: var(--zg-text-secondary);
    font-weight: 500;
  }

  /* ═══════════════════════════════════════════════
     BUTTONS
     ═══════════════════════════════════════════════ */

  .zg-btn {
    border: 1px solid var(--zg-border-strong);
    background: var(--zg-bg);
    color: var(--zg-text);
    padding: 4px 10px;
    border-radius: var(--zg-radius);
    cursor: pointer;
    font-size: 12px;
    font-family: inherit;
    font-weight: 500;
    transition: background 0.15s, border-color 0.15s;
  }
  .zg-btn:hover { background: var(--zg-surface); border-color: var(--zg-primary); }
  .zg-btn:disabled { opacity: 0.4; cursor: default; pointer-events: none; }
  .zg-btn-sm { padding: 2px 8px; min-width: 28px; }

  .zg-btn-icon {
    border: 1px solid transparent;
    background: transparent;
    color: var(--zg-text-secondary);
    padding: 5px 7px;
    border-radius: var(--zg-radius);
    cursor: pointer;
    font-size: 0.85rem;
    font-family: inherit;
    transition: all 0.15s;
    line-height: 1;
  }
  .zg-btn-icon:hover {
    background: var(--zg-primary-soft);
    color: var(--zg-primary);
  }
  .zg-btn-icon--active {
    background: var(--zg-primary-soft);
    color: var(--zg-primary);
    border-color: var(--zg-primary);
  }

  .zg-btn-primary {
    border: 1px solid var(--zg-primary);
    background: var(--zg-primary);
    color: #fff;
    padding: 5px 14px;
    border-radius: var(--zg-radius);
    cursor: pointer;
    font-size: 12px;
    font-family: inherit;
    font-weight: 600;
    transition: opacity 0.15s;
  }
  .zg-btn-primary:hover { opacity: 0.88; }

  .zg-btn-danger {
    border: 1px solid var(--zg-error);
    background: var(--zg-error);
    color: #fff;
    padding: 5px 14px;
    border-radius: var(--zg-radius);
    cursor: pointer;
    font-size: 12px;
    font-family: inherit;
    font-weight: 600;
    transition: opacity 0.15s;
  }
  .zg-btn-danger:hover { opacity: 0.88; }

  /* ═══════════════════════════════════════════════
     ROW GROUP DROP ZONE
     ═══════════════════════════════════════════════ */

  .zg-group-drop-zone {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 12px;
    min-height: 34px;
    border-bottom: 1px solid var(--zg-border);
    background: var(--zg-surface);
    transition: background 0.15s;
  }
  .zg-group-drop-zone--empty {
    justify-content: center;
    color: var(--zg-text-muted);
    font-size: 12px;
    border-bottom-style: dashed;
  }
  .zg-group-drop-zone--dragover {
    background: var(--zg-primary-soft);
    border-color: var(--zg-primary);
    border-bottom-style: dashed;
  }

  .zg-group-drop-label {
    font-size: 11px;
    color: var(--zg-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: 600;
    flex-shrink: 0;
  }

  .zg-group-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px 2px 10px;
    background: var(--zg-bg);
    border: 1px solid var(--zg-border-strong);
    border-radius: 14px;
    font-size: 11.5px;
    font-weight: 600;
    color: var(--zg-text);
    cursor: grab;
    transition: all 0.15s;
    box-shadow: var(--zg-shadow-sm);
    user-select: none;
  }
  .zg-group-chip:hover { border-color: var(--zg-primary); }
  .zg-group-chip:active { cursor: grabbing; }

  .zg-group-chip-remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px; height: 16px;
    border-radius: 50%;
    border: none;
    background: transparent;
    color: var(--zg-text-muted);
    cursor: pointer;
    font-size: 10px;
    padding: 0;
    line-height: 1;
    transition: all 0.1s;
  }
  .zg-group-chip-remove:hover { background: rgba(214, 48, 49, 0.1); color: var(--zg-error); }

  .zg-th--groupable { cursor: grab; }
  .zg-th--groupable:active { cursor: grabbing; }

  /* ═══════════════════════════════════════════════
     FIND BAR
     ═══════════════════════════════════════════════ */

  .zg-find-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px;
    border-bottom: 1px solid var(--zg-border);
    background: var(--zg-bg);
  }

  .zg-find-input {
    border: 1px solid var(--zg-input-border);
    border-radius: var(--zg-radius);
    padding: 4px 10px;
    font-size: 12.5px;
    font-family: inherit;
    width: 220px;
    background: var(--zg-input-bg);
    color: var(--zg-text);
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .zg-find-input:focus {
    border-color: var(--zg-primary);
    box-shadow: var(--zg-focus-ring);
  }
  .zg-find-count { font-size: 11px; color: var(--zg-text-muted); }

  /* ═══════════════════════════════════════════════
     TABLE
     ═══════════════════════════════════════════════ */

  .zg-table-wrapper { flex: 1; overflow: auto; }

  .zg-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  /* ═══════════════════════════════════════════════
     HEADER
     ═══════════════════════════════════════════════ */

  .zg-th {
    text-align: left;
    padding: 0 calc(var(--zg-grid-size) * 1.5);
    height: var(--zg-header-height);
    font-weight: var(--zg-header-weight);
    font-size: var(--zg-header-size);
    letter-spacing: var(--zg-header-tracking);
    color: var(--zg-header-color);
    background: var(--zg-header-bg);
    border-bottom: 1px solid var(--zg-border-strong);
    white-space: nowrap;
    user-select: none;
    position: sticky;
    top: 0;
    z-index: 2;
    vertical-align: middle;
  }
  .zg-th { position: relative; }

  .zg-th-sortable { cursor: pointer; }
  .zg-th-sortable:hover { background: var(--zg-header-hover); }
  .zg-th-right { text-align: right; }
  .zg-th-row-num { text-align: center; color: var(--zg-text-muted); font-weight: 400; font-size: 11px; }

  /* ═══════════════════════════════════════════════
     FILTER ROW
     ═══════════════════════════════════════════════ */

  .zg-filter-row td {
    padding: 2px 4px;
    background: var(--zg-header-bg);
    border-bottom: 1px solid var(--zg-border);
  }

  .zg-filter-input {
    width: 100%;
    border: 1px solid var(--zg-input-border);
    border-radius: var(--zg-radius);
    padding: 3px 8px;
    font-size: 11.5px;
    font-family: inherit;
    background: var(--zg-input-bg);
    color: var(--zg-text);
    outline: none;
    box-sizing: border-box;
    height: 24px;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .zg-filter-input:focus {
    border-color: var(--zg-primary);
    box-shadow: var(--zg-focus-ring);
  }

  /* ═══════════════════════════════════════════════
     BODY ROWS
     ═══════════════════════════════════════════════ */

  .zg-row {
    cursor: default;
    transition: background 0.1s;
  }
  .zg-row:hover { background: var(--zg-row-hover) !important; }
  .zg-row-alt { background: var(--zg-row-stripe); }
  .zg-row-totals { background: var(--zg-surface); font-weight: 700; }

  .zg-td {
    padding: 0 calc(var(--zg-grid-size) * 1.5);
    height: var(--zg-row-height);
    border-bottom: 1px solid var(--zg-border);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: middle;
    font-variant-numeric: tabular-nums;
  }
  .zg-td-right { text-align: right; letter-spacing: -0.01em; }
  .zg-td-row-num { text-align: center; color: var(--zg-text-muted); font-size: 11px; }
  .zg-td-totals {
    font-weight: 700;
    border-top: 2px solid var(--zg-border-strong);
    overflow: visible;
    text-overflow: clip;
    white-space: nowrap;
  }

  /* ═══════════════════════════════════════════════
     DENSITY
     ═══════════════════════════════════════════════ */

  .zg-density-compact .zg-td { height: 30px; font-size: 12px; }
  .zg-density-compact .zg-th { height: 34px; font-size: 11.5px; }
  .zg-density-compact .zg-td, .zg-density-compact .zg-th { padding: 0 8px; }

  .zg-density-comfortable .zg-td { height: 48px; }
  .zg-density-comfortable .zg-th { height: 46px; }
  .zg-density-comfortable .zg-td, .zg-density-comfortable .zg-th { padding: 0 14px; }

  /* ═══════════════════════════════════════════════
     STATUS CHIPS
     ═══════════════════════════════════════════════ */

  .zg-chip {
    display: inline-flex;
    align-items: center;
    height: 22px;
    padding: 0 9px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    line-height: 1;
  }

  .zg-chip--filled { color: #fff; }
  .zg-chip--outlined { background: transparent !important; border: 1.5px solid; }

  .zg-chip--success { background: var(--zg-success); border-color: var(--zg-success); color: var(--zg-success); }
  .zg-chip--success.zg-chip--filled { color: #fff; }
  .zg-chip--error { background: var(--zg-error); border-color: var(--zg-error); color: var(--zg-error); }
  .zg-chip--error.zg-chip--filled { color: #fff; }
  .zg-chip--warning { background: var(--zg-warning); border-color: var(--zg-warning); color: var(--zg-warning); }
  .zg-chip--warning.zg-chip--filled { color: #fff; }
  .zg-chip--info { background: var(--zg-info); border-color: var(--zg-info); color: var(--zg-info); }
  .zg-chip--info.zg-chip--filled { color: #fff; }
  .zg-chip--primary { background: var(--zg-primary); border-color: var(--zg-primary); color: var(--zg-primary); }
  .zg-chip--primary.zg-chip--filled { color: #fff; }
  .zg-chip--default { background: #7c8590; border-color: #7c8590; color: #7c8590; }
  .zg-chip--default.zg-chip--filled { color: #fff; }

  /* ═══════════════════════════════════════════════
     PROGRESS BAR
     ═══════════════════════════════════════════════ */

  .zg-progress {
    position: relative; width: 100%; height: 14px;
    background: var(--zg-surface); border-radius: 7px; overflow: hidden;
  }
  .zg-progress-bar {
    height: 100%; background: var(--zg-primary);
    border-radius: 7px; transition: width 0.3s ease;
  }
  .zg-progress-text {
    position: absolute; top: 0; left: 50%; transform: translateX(-50%);
    font-size: 9px; line-height: 14px; font-weight: 700;
  }

  .zg-rating { color: var(--zg-warning); letter-spacing: 2px; }

  /* ═══════════════════════════════════════════════
     FIND HIGHLIGHT
     ═══════════════════════════════════════════════ */

  .zg-find-match { background: rgba(252, 211, 77, 0.25) !important; }
  .zg-find-current { background: rgba(230, 126, 34, 0.35) !important; outline: 2px solid var(--zg-primary); }

  /* ═══════════════════════════════════════════════
     FOOTER
     ═══════════════════════════════════════════════ */

  .zg-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 12px; height: 38px;
    border-top: 1px solid var(--zg-border-strong);
    background: var(--zg-footer-bg);
    font-size: 12.5px;
  }

  .zg-footer-left, .zg-footer-right { display: flex; align-items: center; gap: 8px; }
  .zg-footer-left { color: var(--zg-text-secondary); }

  .zg-page-size {
    border: 1px solid var(--zg-input-border);
    border-radius: var(--zg-radius);
    padding: 2px 6px;
    font-size: 12px;
    font-family: inherit;
    background: var(--zg-input-bg);
    color: var(--zg-text);
    cursor: pointer;
  }

  .zg-page-info { color: var(--zg-text-secondary); font-variant-numeric: tabular-nums; }
  .zg-status-agg { margin-left: 4px; }

  /* ═══════════════════════════════════════════════
     LOADING
     ═══════════════════════════════════════════════ */

  .zg-loading {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255, 255, 255, 0.65);
    z-index: 10;
    backdrop-filter: blur(1px);
  }

  .zg-spinner {
    width: 28px; height: 28px;
    border: 3px solid var(--zg-border);
    border-top-color: var(--zg-primary);
    border-radius: 50%;
    animation: zg-spin 0.7s linear infinite;
  }
  @keyframes zg-spin { to { transform: rotate(360deg); } }

  /* ═══════════════════════════════════════════════
     MASTER-DETAIL
     ═══════════════════════════════════════════════ */

  .zg-th-expand, .zg-td-expand {
    width: 32px; min-width: 32px; max-width: 32px;
    text-align: center; cursor: pointer; user-select: none;
    padding: 4px !important;
  }

  .zg-expand-chevron {
    display: inline-flex; align-items: center; justify-content: center;
    width: 18px; height: 18px;
    border-radius: var(--zg-radius);
    font-size: 0.6rem;
    color: var(--zg-text-secondary);
    transition: transform 0.2s ease, background 0.15s;
  }
  .zg-expand-chevron:hover { background: var(--zg-primary-soft); color: var(--zg-primary); }
  .zg-expand-chevron--expanded { transform: rotate(90deg); }

  .zg-row-detail td { padding: 0 !important; }
  .zg-td-detail { background: var(--zg-surface); border-bottom: 1px solid var(--zg-border); }

  .zg-detail-panel {
    padding: 12px 16px 12px 56px;
    font-size: var(--zg-font-size);
    line-height: 1.6;
    color: var(--zg-text);
  }

  /* ═══════════════════════════════════════════════
     ROW GROUPING
     ═══════════════════════════════════════════════ */

  .zg-row-group-header { cursor: pointer; background: var(--zg-surface) !important; }
  .zg-row-group-header:hover { background: var(--zg-header-hover) !important; }

  .zg-td-group-header {
    padding: 6px 12px !important;
    font-size: var(--zg-font-size);
    border-bottom: 1px solid var(--zg-border);
  }

  .zg-group-chevron {
    display: inline-flex; align-items: center; justify-content: center;
    width: 16px; height: 16px;
    border-radius: var(--zg-radius);
    font-size: 0.55rem;
    margin-right: 6px;
    color: var(--zg-text-secondary);
    transition: transform 0.2s ease;
  }
  .zg-group-chevron--expanded { transform: rotate(90deg); }

  .zg-group-child-count { opacity: 0.5; margin-left: 4px; font-weight: 400; font-size: 11px; }

  .zg-row-subtotal { background: var(--zg-surface) !important; font-weight: 600; font-style: italic; }
  .zg-td-subtotal { border-top: 1px dashed var(--zg-border); font-size: 12px; }

  /* ═══════════════════════════════════════════════
     COLUMN PINNING
     ═══════════════════════════════════════════════ */

  .zg-th-pinned, .zg-td-pinned { box-shadow: 2px 0 4px -1px rgba(0, 0, 0, 0.07); }

  /* ═══════════════════════════════════════════════
     CONTEXT MENU
     ═══════════════════════════════════════════════ */

  .zg-context-menu {
    position: absolute; z-index: 20;
    min-width: 180px; max-height: 320px; overflow-y: auto;
    background: var(--zg-bg);
    border: 1px solid var(--zg-border);
    border-radius: var(--zg-radius-lg);
    box-shadow: var(--zg-shadow-lg);
    padding: 4px 0;
    font-size: var(--zg-font-size);
  }

  .zg-context-item {
    display: flex; align-items: center; gap: 8px;
    padding: 7px 14px; cursor: pointer; white-space: nowrap;
    transition: background 0.1s;
  }
  .zg-context-item:hover { background: var(--zg-primary-soft); color: var(--zg-primary); }

  .zg-context-divider { height: 1px; margin: 4px 0; background: var(--zg-border); }

  /* ═══════════════════════════════════════════════
     COLUMN RESIZE
     ═══════════════════════════════════════════════ */

  .zg-resize-handle {
    position: absolute; right: 0; top: 0; bottom: 0;
    width: 4px; cursor: col-resize; user-select: none; z-index: 4;
    transition: background 0.1s;
  }
  .zg-resize-handle:hover { background: var(--zg-primary); opacity: 0.4; }

  /* ═══════════════════════════════════════════════
     COLUMN GROUPS
     ═══════════════════════════════════════════════ */

  .zg-column-group-row .zg-th-group {
    text-align: center; font-size: 11px; font-weight: 700;
    padding: 4px 8px;
    background: var(--zg-header-bg);
    border-bottom: 1px solid var(--zg-border);
    border-right: 1px solid var(--zg-border);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .zg-th-group-empty { border-right: none; }

  /* ═══════════════════════════════════════════════
     AVATAR / IMAGE / LINK
     ═══════════════════════════════════════════════ */

  .zg-avatar-cell { display: flex; align-items: center; gap: 8px; }

  .zg-avatar { width: 30px; height: 30px; object-fit: cover; flex-shrink: 0; }
  .zg-avatar--circular { border-radius: 50%; }
  .zg-avatar--rounded { border-radius: var(--zg-radius); }
  .zg-avatar--square { border-radius: 0; }

  .zg-avatar-text { display: flex; flex-direction: column; line-height: 1.3; }
  .zg-avatar-subtitle { font-size: 11px; color: var(--zg-text-muted); }

  .zg-thumb { object-fit: cover; border-radius: var(--zg-radius); vertical-align: middle; }

  .zg-link { color: var(--zg-primary); text-decoration: none; font-weight: 500; }
  .zg-link:hover { text-decoration: underline; }

  /* ═══════════════════════════════════════════════
     TOOLBAR DROPDOWNS
     ═══════════════════════════════════════════════ */

  .zg-toolbar-dropdown { position: relative; display: inline-block; }

  .zg-toolbar-panel {
    position: absolute; top: calc(100% + 4px); right: 0;
    z-index: 15; min-width: 220px; max-height: 360px; overflow-y: auto;
    background: var(--zg-bg);
    border: 1px solid var(--zg-border);
    border-radius: var(--zg-radius-lg);
    box-shadow: var(--zg-shadow-lg);
    padding: 4px 0;
  }
  .zg-toolbar-panel-left { right: auto; left: 0; }

  .zg-panel-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 4px 12px 8px;
    border-bottom: 1px solid var(--zg-border);
    margin-bottom: 4px;
  }

  .zg-panel-title {
    font-size: 11px; font-weight: 700;
    color: var(--zg-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* ═══════════════════════════════════════════════
     COLUMN CHOOSER / DENSITY / FILTER PANEL
     ═══════════════════════════════════════════════ */

  .zg-col-item {
    display: flex; align-items: center; gap: 8px;
    padding: 5px 12px; cursor: pointer;
    font-size: var(--zg-font-size);
    transition: background 0.1s;
  }
  .zg-col-item:hover { background: var(--zg-primary-soft); }

  .zg-col-checkbox { width: 16px; height: 16px; accent-color: var(--zg-primary); cursor: pointer; }

  .zg-density-item {
    display: flex; align-items: center; gap: 8px;
    padding: 7px 14px; cursor: pointer;
    font-size: var(--zg-font-size);
    transition: background 0.1s;
  }
  .zg-density-item:hover { background: var(--zg-primary-soft); }
  .zg-density-item--active { color: var(--zg-primary); font-weight: 600; }

  .zg-filter-panel {
    display: flex; flex-wrap: wrap; align-items: flex-end;
    gap: 8px; padding: 6px 12px;
    border-bottom: 1px solid var(--zg-border);
    background: var(--zg-bg);
  }

  .zg-filter-field { display: flex; flex-direction: column; gap: 2px; }

  .zg-filter-label {
    font-size: 10px; font-weight: 600;
    color: var(--zg-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .zg-filter-select {
    border: 1px solid var(--zg-input-border);
    border-radius: 6px;
    padding: 5px 26px 5px 8px;
    font-size: 12px; font-family: inherit;
    background: var(--zg-input-bg);
    color: var(--zg-text);
    outline: none; min-width: 120px; cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%235f6368' d='M3 5l3 3 3-3z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .zg-filter-select:focus { border-color: var(--zg-primary); box-shadow: var(--zg-focus-ring); }

  .zg-filter-text {
    border: 1px solid var(--zg-input-border);
    border-radius: 6px;
    padding: 5px 8px; font-size: 12px; font-family: inherit;
    background: var(--zg-input-bg); color: var(--zg-text);
    outline: none; min-width: 100px;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .zg-filter-text:focus { border-color: var(--zg-primary); box-shadow: var(--zg-focus-ring); }

  .zg-filter-range { display: flex; align-items: center; gap: 4px; }
  .zg-filter-range input {
    width: 70px;
    border: 1px solid var(--zg-input-border);
    border-radius: 6px;
    padding: 5px 6px; font-size: 12px; font-family: inherit;
    background: var(--zg-input-bg); color: var(--zg-text); outline: none;
  }
  .zg-filter-range input:focus { border-color: var(--zg-primary); }

  .zg-filter-active-count {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 18px; height: 18px;
    background: var(--zg-primary); color: #fff;
    border-radius: 9px; font-size: 10px; font-weight: 700;
    padding: 0 4px; margin-left: 4px;
  }

  .zg-filter-clear {
    font-size: 11px; color: var(--zg-primary);
    cursor: pointer; padding: 4px 8px;
    border-radius: var(--zg-radius);
    border: none; background: none;
    font-family: inherit; font-weight: 500;
  }
  .zg-filter-clear:hover { background: var(--zg-primary-soft); }

  /* ═══════════════════════════════════════════════
     HEADER CONTEXT MENU
     ═══════════════════════════════════════════════ */

  .zg-header-menu {
    position: absolute; z-index: 25; min-width: 200px;
    background: var(--zg-bg);
    border: 1px solid var(--zg-border);
    border-radius: var(--zg-radius-lg);
    box-shadow: var(--zg-shadow-lg);
    padding: 4px 0; font-size: var(--zg-font-size);
  }

  .zg-header-menu-item {
    display: flex; align-items: center; gap: 8px;
    padding: 7px 14px; cursor: pointer; white-space: nowrap;
    transition: background 0.1s;
  }
  .zg-header-menu-item:hover { background: var(--zg-primary-soft); color: var(--zg-primary); }
  .zg-header-menu-item--disabled { opacity: 0.35; pointer-events: none; }

  .zg-header-menu-icon { width: 18px; text-align: center; font-size: 12px; }

  .zg-th-menu-trigger {
    display: inline-flex; align-items: center; justify-content: center;
    width: 20px; height: 20px;
    border-radius: var(--zg-radius);
    cursor: pointer; opacity: 0;
    transition: opacity 0.15s, background 0.15s;
    font-size: 0.6rem; color: var(--zg-text-muted);
    position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
  }
  .zg-th:hover .zg-th-menu-trigger { opacity: 1; }
  .zg-th-menu-trigger:hover { background: var(--zg-primary-soft); color: var(--zg-primary); }
  .zg-th-right .zg-th-menu-trigger { left: 4px; right: auto; }

  /* ═══════════════════════════════════════════════
     ROW SELECTION
     ═══════════════════════════════════════════════ */

  .zg-th-checkbox, .zg-td-checkbox {
    width: 36px; min-width: 36px; max-width: 36px;
    text-align: center; padding: 4px !important;
  }

  .zg-row-checkbox { width: 16px; height: 16px; accent-color: var(--zg-primary); cursor: pointer; margin: 0; }

  .zg-row--selected { background: var(--zg-row-selected) !important; }
  .zg-row--selected:hover { background: var(--zg-row-selected) !important; filter: brightness(0.97); }

  /* ═══════════════════════════════════════════════
     DRAG & DROP
     ═══════════════════════════════════════════════ */

  .zg-row--dragging { opacity: 0.5; }
  .zg-row--drag-over { border-top: 2px solid var(--zg-primary) !important; }

  .zg-drag-handle {
    width: 24px; min-width: 24px; max-width: 24px;
    text-align: center; cursor: grab;
    color: var(--zg-text-muted); font-size: 0.8rem;
    padding: 4px 2px !important; user-select: none;
  }
  .zg-drag-handle:active { cursor: grabbing; }
  .zg-drag-handle:hover { color: var(--zg-text-secondary); }

  .zg-drop-zone {
    border: 2px dashed var(--zg-border-strong);
    background: var(--zg-surface);
    border-radius: var(--zg-radius-lg);
    min-height: 60px;
    display: flex; align-items: center; justify-content: center;
    color: var(--zg-text-muted); font-size: 12px;
    transition: all 0.15s;
  }
  .zg-drop-zone--over { background: var(--zg-primary-soft); border-color: var(--zg-primary); }

  .zg-selection-info { font-size: 12px; color: var(--zg-primary); font-weight: 600; }

  /* ═══════════════════════════════════════════════
     SEPARATOR / EDITING / CRUD
     ═══════════════════════════════════════════════ */

  .zg-toolbar-sep { width: 1px; height: 20px; background: var(--zg-border); margin: 0 2px; }

  .zg-td--editable { cursor: cell; }
  .zg-td--editable:hover { background: rgba(0,0,0,0.015); }

  /* Active cell (Excel-like subtle border) */
  .zg-td--active {
    outline: 1.5px solid var(--zg-primary) !important;
    outline-offset: -1.5px;
  }

  .zg-edit-input {
    width: 100%;
    height: 100%;
    border: none;
    border-bottom: 1.5px solid var(--zg-primary);
    border-radius: 0;
    padding: 0;
    margin: 0;
    font-size: inherit;
    font-family: inherit;
    background: transparent;
    color: var(--zg-text);
    outline: none;
    box-sizing: border-box;
  }

  .zg-new-row { background: var(--zg-primary-soft) !important; }
  .zg-new-row .zg-td { border-bottom: 2px dashed var(--zg-primary); }

  .zg-crud-bar {
    display: flex; align-items: center; gap: 6px;
    padding: 5px 12px;
    border-bottom: 1px solid var(--zg-border);
    background: var(--zg-bg);
  }

  /* ═══════════════════════════════════════════════
     IMPORT
     ═══════════════════════════════════════════════ */

  .zg-import-zone {
    display: none; align-items: center; justify-content: center;
    padding: 8px 12px;
    border-bottom: 2px dashed var(--zg-primary);
    background: var(--zg-primary-soft);
    color: var(--zg-text-secondary); font-size: 12px; gap: 8px;
  }
  .zg-import-zone--visible { display: flex; }
  .zg-import-zone--over { background: rgba(230, 126, 34, 0.12); }

  .zg-import-file { display: none; }

  .zg-import-overlay {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0, 0, 0, 0.35);
    z-index: 30;
    backdrop-filter: blur(2px);
  }

  .zg-import-modal {
    background: var(--zg-bg);
    border-radius: var(--zg-radius-lg);
    box-shadow: var(--zg-shadow-lg);
    padding: 20px;
    min-width: 400px; max-width: 600px;
    max-height: 80%; overflow-y: auto;
  }

  .zg-import-modal h3 {
    margin: 0 0 14px;
    font-size: 15px; font-weight: 700; color: var(--zg-text);
  }

  .zg-import-droparea {
    border: 2px dashed var(--zg-border-strong);
    border-radius: var(--zg-radius-lg);
    padding: 20px;
    text-align: center; color: var(--zg-text-secondary);
    cursor: pointer; transition: all 0.15s;
    margin-bottom: 14px;
  }
  .zg-import-droparea:hover,
  .zg-import-droparea--over {
    border-color: var(--zg-primary);
    background: var(--zg-primary-soft);
    color: var(--zg-primary);
  }

  .zg-import-droparea-icon { font-size: 28px; margin-bottom: 8px; display: block; }
  .zg-import-droparea-text { font-size: var(--zg-font-size); font-weight: 500; }
  .zg-import-droparea-hint { font-size: 11px; color: var(--zg-text-muted); margin-top: 4px; }

  .zg-import-preview { margin-top: 14px; font-size: 12px; }

  .zg-import-preview-table {
    width: 100%; border-collapse: collapse;
    margin-top: 8px; font-size: 11px;
  }
  .zg-import-preview-table th {
    background: var(--zg-header-bg);
    padding: 4px 8px;
    border: 1px solid var(--zg-border);
    font-weight: 600; text-align: left;
  }
  .zg-import-preview-table td {
    padding: 4px 8px;
    border: 1px solid var(--zg-border);
  }

  .zg-import-stats {
    display: flex; gap: 12px; margin-top: 8px;
    font-size: 12px; color: var(--zg-text-secondary);
  }
  .zg-import-stats strong { color: var(--zg-text); }

  .zg-import-actions {
    display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px;
  }

  /* ═══════════════════════════════════════════════
     DATE PICKER (inline calendar)
     ═══════════════════════════════════════════════ */

  .zg-datepicker {
    position: absolute;
    z-index: 30;
    background: var(--zg-bg);
    border: 1px solid var(--zg-border);
    border-radius: var(--zg-radius-lg);
    box-shadow: var(--zg-shadow-lg);
    padding: 8px;
    width: 240px;
    font-size: 12px;
  }

  .zg-datepicker-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2px 6px;
  }

  .zg-datepicker-title {
    font-weight: 700;
    font-size: 13px;
    color: var(--zg-text);
  }

  .zg-datepicker-nav {
    border: none;
    background: none;
    cursor: pointer;
    color: var(--zg-text-secondary);
    padding: 4px;
    border-radius: var(--zg-radius);
    line-height: 1;
    display: flex;
  }
  .zg-datepicker-nav:hover { background: var(--zg-primary-soft); color: var(--zg-primary); }

  .zg-datepicker-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
    text-align: center;
  }

  .zg-datepicker-dayname {
    font-size: 10px;
    font-weight: 600;
    color: var(--zg-text-muted);
    padding: 4px 0;
  }

  .zg-datepicker-day {
    border: none;
    background: none;
    cursor: pointer;
    padding: 5px 0;
    border-radius: var(--zg-radius);
    font-size: 12px;
    color: var(--zg-text);
    font-family: inherit;
    transition: all 0.1s;
  }
  .zg-datepicker-day:hover { background: var(--zg-primary-soft); }

  .zg-datepicker-day--selected {
    background: var(--zg-primary) !important;
    color: #fff !important;
    font-weight: 700;
  }

  .zg-datepicker-day--today {
    outline: 2px solid var(--zg-primary);
    outline-offset: -2px;
    font-weight: 600;
  }

  .zg-datepicker-day--empty {
    display: block;
  }

  .zg-datepicker-footer {
    display: flex;
    justify-content: space-between;
    padding-top: 6px;
    border-top: 1px solid var(--zg-border);
    margin-top: 6px;
  }

  .zg-datepicker-btn {
    border: none;
    background: none;
    cursor: pointer;
    color: var(--zg-primary);
    font-size: 11px;
    font-weight: 600;
    font-family: inherit;
    padding: 3px 6px;
    border-radius: var(--zg-radius);
    transition: background 0.1s;
  }
  .zg-datepicker-btn:hover { background: var(--zg-primary-soft); }

  .zg-datepicker-btn--clear { color: var(--zg-error); }
  .zg-datepicker-btn--clear:hover { background: rgba(214, 48, 49, 0.08); }

  /* ═══════════════════════════════════════════════
     BOTTOM SHEET (mobile detail drawer)
     ═══════════════════════════════════════════════ */

  .zg-bottom-sheet-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 100;
    animation: zg-fade-in 0.2s ease;
  }

  .zg-bottom-sheet {
    position: fixed;
    left: 0; right: 0; bottom: 0;
    max-height: 85vh;
    background: var(--zg-bg);
    border-radius: 16px 16px 0 0;
    box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.2);
    z-index: 101;
    display: flex;
    flex-direction: column;
    animation: zg-slide-up 0.25s ease;
    overflow: hidden;
  }

  .zg-bottom-sheet-handle {
    display: flex;
    justify-content: center;
    padding: 8px 0 4px;
    cursor: grab;
  }
  .zg-bottom-sheet-handle::after {
    content: '';
    width: 36px;
    height: 4px;
    background: var(--zg-text-muted);
    border-radius: 2px;
    opacity: 0.4;
  }

  .zg-bottom-sheet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 16px 10px;
    border-bottom: 1px solid var(--zg-border);
  }

  .zg-bottom-sheet-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--zg-text);
  }

  .zg-bottom-sheet-body {
    flex: 1;
    overflow-y: auto;
    padding: 12px 16px 20px;
    -webkit-overflow-scrolling: touch;
  }

  .zg-bottom-sheet-field {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid var(--zg-border);
    font-size: 13px;
  }
  .zg-bottom-sheet-field:last-child { border-bottom: none; }

  .zg-bottom-sheet-label {
    font-weight: 600;
    color: var(--zg-text-secondary);
    flex-shrink: 0;
    margin-right: 12px;
  }

  .zg-bottom-sheet-value {
    color: var(--zg-text);
    text-align: right;
    word-break: break-word;
  }

  @keyframes zg-slide-up {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  @keyframes zg-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  /* ═══════════════════════════════════════════════
     CONFIGURATOR PANEL (built-in sidebar)
     ═══════════════════════════════════════════════ */

  .zg-config-wrapper {
    display: flex;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .zg-config-main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .zg-config-panel {
    width: 260px;
    min-width: 260px;
    border-left: 1px solid var(--zg-border);
    background: var(--zg-surface);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    font-size: 12.5px;
  }

  .zg-config-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 10px;
    border-bottom: 1px solid var(--zg-border);
    background: var(--zg-header-bg);
  }

  .zg-config-title {
    font-size: 12px;
    font-weight: 700;
    color: var(--zg-text);
  }

  .zg-config-close {
    border: none;
    background: none;
    cursor: pointer;
    color: var(--zg-text-muted);
    padding: 2px;
    border-radius: var(--zg-radius);
    line-height: 1;
  }
  .zg-config-close:hover { color: var(--zg-text); background: var(--zg-primary-soft); }

  /* Tabs */
  .zg-config-tabs {
    display: flex;
    border-bottom: 1px solid var(--zg-border);
    background: var(--zg-bg);
  }

  .zg-config-tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 0;
    cursor: pointer;
    border: none;
    background: none;
    color: var(--zg-text-muted);
    font-size: 13px;
    transition: color 0.15s, border-color 0.15s;
    border-bottom: 2px solid transparent;
  }
  .zg-config-tab:hover { color: var(--zg-text); }
  .zg-config-tab--active {
    color: var(--zg-primary);
    border-bottom-color: var(--zg-primary);
  }

  /* Body */
  .zg-config-body {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
    -webkit-overflow-scrolling: touch;
  }

  /* Section */
  .zg-config-section {
    font-size: 10px;
    font-weight: 700;
    color: var(--zg-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin: 10px 0 6px;
  }
  .zg-config-section:first-child { margin-top: 0; }

  /* Switch row */
  .zg-config-switch {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 0;
  }

  .zg-config-switch-label {
    font-size: 12.5px;
    color: var(--zg-text);
    cursor: pointer;
    flex: 1;
  }

  /* Toggle switch (pure CSS) */
  .zg-toggle {
    position: relative;
    width: 34px;
    height: 18px;
    flex-shrink: 0;
  }
  .zg-toggle input {
    opacity: 0;
    width: 0;
    height: 0;
    position: absolute;
  }
  .zg-toggle-track {
    position: absolute;
    inset: 0;
    background: var(--zg-border-strong);
    border-radius: 9px;
    cursor: pointer;
    transition: background 0.2s;
  }
  .zg-toggle input:checked + .zg-toggle-track {
    background: var(--zg-primary);
  }
  .zg-toggle-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 14px;
    height: 14px;
    background: #fff;
    border-radius: 50%;
    transition: transform 0.2s;
    pointer-events: none;
    box-shadow: 0 1px 2px rgba(0,0,0,0.15);
  }
  .zg-toggle input:checked ~ .zg-toggle-thumb {
    transform: translateX(16px);
  }

  /* Select */
  .zg-config-select-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin: 4px 0;
  }

  .zg-config-select-label {
    font-size: 10px;
    font-weight: 600;
    color: var(--zg-text-muted);
  }

  .zg-config-select {
    border: 1px solid var(--zg-input-border);
    border-radius: var(--zg-radius);
    padding: 5px 24px 5px 8px;
    font-size: 12px;
    font-family: inherit;
    background: var(--zg-input-bg);
    color: var(--zg-text);
    outline: none;
    width: 100%;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%235f6368' d='M3 5l3 3 3-3z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 6px center;
    transition: border-color 0.15s;
  }
  .zg-config-select:focus { border-color: var(--zg-primary); }

  /* Chip */
  .zg-config-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px 2px 8px;
    background: var(--zg-primary-soft);
    border: 1px solid var(--zg-primary);
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    color: var(--zg-primary);
    margin: 4px 0;
  }

  .zg-config-chip-x {
    border: none;
    background: none;
    cursor: pointer;
    color: var(--zg-primary);
    font-size: 10px;
    padding: 0;
    line-height: 1;
    opacity: 0.7;
  }
  .zg-config-chip-x:hover { opacity: 1; }

  /* Divider */
  .zg-config-divider {
    height: 1px;
    background: var(--zg-border);
    margin: 8px 0;
  }

  /* Inline flex for paired selects */
  .zg-config-row {
    display: flex;
    gap: 6px;
    align-items: flex-end;
  }
  .zg-config-row > * { flex: 1; }

  /* Code block */
  .zg-config-code {
    margin: 0;
    padding: 10px;
    background: #1e1e1e;
    color: #d4d4d4;
    font-size: 10.5px;
    font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
    border-radius: var(--zg-radius);
    overflow: auto;
    max-height: 400px;
    white-space: pre-wrap;
    word-break: break-word;
    line-height: 1.5;
  }

  /* Code framework tabs */
  .zg-config-fw-tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 6px;
  }

  .zg-config-fw-tab {
    padding: 3px 8px;
    border: 1px solid var(--zg-border);
    border-radius: 10px;
    font-size: 10.5px;
    font-weight: 600;
    cursor: pointer;
    background: var(--zg-bg);
    color: var(--zg-text-secondary);
    transition: all 0.15s;
  }
  .zg-config-fw-tab:hover { border-color: var(--zg-primary); }
  .zg-config-fw-tab--active {
    background: var(--zg-primary);
    color: #fff;
    border-color: var(--zg-primary);
  }

  /* Hint text */
  .zg-config-hint {
    font-size: 11px;
    color: var(--zg-text-muted);
    line-height: 1.4;
    margin: 4px 0;
  }

  /* ═══════════════════════════════════════════════
     v0.2 — VIRTUAL SCROLL
     ═══════════════════════════════════════════════ */

  .zg-virtual-scroll {
    overflow-y: auto;
    position: relative;
  }

  .zg-virtual-scroll .zg-table {
    position: relative;
    will-change: transform;
  }

  .zg-virtual-spacer {
    position: absolute;
    top: 0;
    left: 0;
    width: 1px;
    pointer-events: none;
    visibility: hidden;
  }

  /* ═══════════════════════════════════════════════
     v0.2 — RANGE SELECTION
     ═══════════════════════════════════════════════ */

  .zg-td--in-range {
    background: var(--zg-primary-soft) !important;
    outline: none;
  }

  /* Border around the entire range block */
  .zg-td--in-range::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    border: 1px solid var(--zg-primary);
    opacity: 0.3;
  }

  .zg-td--active {
    outline: 2px solid var(--zg-primary);
    outline-offset: -2px;
    z-index: 1;
    position: relative;
  }

  /* ═══════════════════════════════════════════════
     v0.2 — SPARKLINES
     ═══════════════════════════════════════════════ */

  .zg-sparkline {
    display: inline-block;
    vertical-align: middle;
    overflow: visible;
  }

  /* ═══════════════════════════════════════════════
     v0.2 — UNDO/REDO TOOLBAR
     ═══════════════════════════════════════════════ */

  .zg-toolbar-sep {
    width: 1px;
    height: 18px;
    background: var(--zg-border);
    flex-shrink: 0;
    margin: 0 2px;
  }

  /* ═══════════════════════════════════════════════
     ACCESSIBILITY — FOCUS VISIBLE
     ═══════════════════════════════════════════════ */

  .zg-th:focus-visible {
    outline: 2px solid var(--zg-primary);
    outline-offset: -2px;
    z-index: 4;
    position: relative;
  }

  .zg-btn-icon:focus-visible,
  .zg-btn:focus-visible,
  .zg-btn-primary:focus-visible {
    box-shadow: var(--zg-focus-ring);
    outline: none;
  }

  .zg-row-checkbox:focus-visible {
    outline: 2px solid var(--zg-primary);
    outline-offset: 2px;
  }

  /* Skip link for screen readers */
  .zg-sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* ═══════════════════════════════════════════════
     MOBILE
     ═══════════════════════════════════════════════ */

  @media (max-width: 767px) {
    :host {
      --zg-font-size: 12px;
      --zg-grid-size: 6px;
      --zg-row-height: 34px;
      --zg-header-height: 34px;
    }
    .zg-toolbar { flex-wrap: wrap; padding: 4px 8px; }
    .zg-toolbar-right { flex-wrap: wrap; }
    .zg-btn { padding: 3px 6px; font-size: 11px; }
    .zg-footer { flex-wrap: wrap; gap: 4px; height: auto; padding: 4px 8px; }
    .zg-avatar { width: 22px; height: 22px; }
    .zg-detail-panel { padding: 8px 12px 8px 40px; }
    .zg-group-drop-zone { flex-wrap: wrap; }
  }

  .zg-chart-panel{border-bottom:1px solid var(--zg-border);background:var(--zg-bg)}.zg-chart-toolbar{display:flex;align-items:center;justify-content:space-between;padding:6px 12px;border-bottom:1px solid var(--zg-border);background:var(--zg-surface);gap:8px}.zg-chart-controls{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.zg-chart-select{padding:4px 8px;border:1px solid var(--zg-border-strong);border-radius:var(--zg-radius);background:var(--zg-input-bg);color:var(--zg-text);font-size:12px;font-family:var(--zg-font-family);cursor:pointer}.zg-chart-select:focus{outline:none;box-shadow:var(--zg-focus-ring);border-color:var(--zg-primary)}.zg-chart-values-label{font-size:11px;color:var(--zg-text-secondary);font-weight:600}.zg-chart-value-toggle{display:flex;align-items:center;gap:4px;font-size:11px;color:var(--zg-text-secondary);cursor:pointer}.zg-chart-value-toggle input{accent-color:var(--zg-primary)}.zg-chart-body{padding:12px;min-height:200px;max-height:400px;display:flex;align-items:center;justify-content:center}.zg-chart-body svg{max-width:100%;max-height:350px}.zg-theme-dark .zg-chart-select{background:#181c24;color:#dce0e5;border-color:rgba(255,255,255,0.14)}
  .zg-note-indicator{position:absolute;top:0;right:0;width:0;height:0;border-left:6px solid transparent;border-top:6px solid #f59e0b;pointer-events:auto;cursor:help}.zg-note-indicator::after{content:attr(title);position:absolute;top:8px;right:0;background:#1c1e21;color:#fff;padding:4px 8px;border-radius:4px;font-size:11px;white-space:pre-wrap;max-width:200px;z-index:100;pointer-events:none;opacity:0;transition:opacity 0.15s;box-shadow:0 4px 14px rgba(0,0,0,0.2)}.zg-note-indicator:hover::after{opacity:1}
  .zg-note-overlay{position:absolute;inset:0;background:rgba(0,0,0,0.3);z-index:200}.zg-note-editor{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:var(--zg-bg);border:1px solid var(--zg-border);border-radius:var(--zg-radius-lg);box-shadow:var(--zg-shadow-lg);z-index:201;width:320px;max-width:90%}.zg-note-editor-header{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--zg-border);font-weight:600;font-size:13px}.zg-note-textarea{width:100%;min-height:80px;padding:10px 14px;border:none;outline:none;resize:vertical;font-family:var(--zg-font-family);font-size:var(--zg-font-size);color:var(--zg-text);background:var(--zg-bg)}.zg-note-editor-footer{display:flex;justify-content:flex-end;gap:8px;padding:8px 14px;border-top:1px solid var(--zg-border)}.zg-theme-dark .zg-note-editor{background:#242830;color:#dce0e5}.zg-theme-dark .zg-note-textarea{background:#1b1f27;color:#dce0e5}
`;
