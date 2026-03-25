import { css } from 'lit';

export const gridStyles = css`
  :host {
    display: block;
    font-family: var(--zg-font-family, Inter, system-ui, -apple-system, sans-serif);
    font-size: var(--zg-font-size, 0.875rem);
    color: var(--zg-text-color, #333);
  }

  /* ─── Container ─────────────────────────────────────── */
  .zg-container {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--zg-border-color, #e0e0e0);
    border-radius: 8px;
    overflow: hidden;
    background: var(--zg-bg, #fff);
    outline: none;
  }

  /* ─── Themes ────────────────────────────────────────── */
  .zg-theme-dark {
    --zg-bg: #1a1a2e;
    --zg-text-color: #e0e0e0;
    --zg-border-color: #333;
    --zg-header-bg: #16213e;
    --zg-row-bg: #1a1a2e;
    --zg-row-alt-bg: #16213e;
    --zg-row-hover-bg: #1f2b45;
    --zg-footer-bg: #16213e;
    --zg-input-bg: #0f0f23;
    --zg-input-border: #444;
  }

  .zg-theme-zentto {
    --zg-primary: #f59e0b;
    --zg-header-bg: #fffbeb;
  }

  /* ─── Toolbar ───────────────────────────────────────── */
  .zg-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 12px;
    border-bottom: 1px solid var(--zg-border-color, #e0e0e0);
    background: var(--zg-header-bg, #f8f9fa);
    gap: 8px;
    min-height: 36px;
  }

  .zg-toolbar-left, .zg-toolbar-right {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .zg-row-count {
    font-size: 0.78rem;
    color: #888;
  }

  /* ─── Buttons ───────────────────────────────────────── */
  .zg-btn {
    border: 1px solid var(--zg-border-color, #ddd);
    background: var(--zg-bg, #fff);
    color: var(--zg-text-color, #333);
    padding: 4px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.75rem;
    font-family: inherit;
    transition: background 0.15s;
  }

  .zg-btn:hover { background: var(--zg-row-hover-bg, #f0f0f0); }
  .zg-btn:disabled { opacity: 0.5; cursor: default; }
  .zg-btn-sm { padding: 2px 8px; min-width: 28px; }

  /* ─── Find bar ──────────────────────────────────────── */
  .zg-find-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px;
    border-bottom: 1px solid var(--zg-border-color, #e0e0e0);
    background: var(--zg-bg, #fff);
  }

  .zg-find-input {
    border: 1px solid var(--zg-input-border, #ddd);
    border-radius: 4px;
    padding: 3px 8px;
    font-size: 0.8rem;
    font-family: inherit;
    width: 200px;
    background: var(--zg-input-bg, #fff);
    color: var(--zg-text-color, #333);
    outline: none;
  }

  .zg-find-input:focus { border-color: var(--zg-primary, #f59e0b); }
  .zg-find-count { font-size: 0.75rem; color: #888; }

  /* ─── Table ─────────────────────────────────────────── */
  .zg-table-wrapper {
    flex: 1;
    overflow: auto;
  }

  .zg-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  /* ─── Header ────────────────────────────────────────── */
  .zg-th {
    text-align: left;
    padding: 8px 12px;
    font-weight: 600;
    font-size: 0.8rem;
    background: var(--zg-header-bg, #f8f9fa);
    border-bottom: 2px solid var(--zg-border-color, #e0e0e0);
    white-space: nowrap;
    user-select: none;
    position: sticky;
    top: 0;
    z-index: 2;
  }

  .zg-th-sortable { cursor: pointer; }
  .zg-th-sortable:hover { background: #eee; }
  .zg-th-right { text-align: right; }
  .zg-th-row-num { text-align: center; color: #aaa; font-weight: 400; }

  /* ─── Filter row ────────────────────────────────────── */
  .zg-filter-row td {
    padding: 2px 4px;
    background: var(--zg-header-bg, #f8f9fa);
    border-bottom: 1px solid var(--zg-border-color, #e0e0e0);
  }

  .zg-filter-input {
    width: 100%;
    border: 1px solid var(--zg-input-border, #ddd);
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 0.72rem;
    font-family: inherit;
    background: var(--zg-input-bg, #f5f5f5);
    color: var(--zg-text-color, #333);
    outline: none;
    box-sizing: border-box;
    height: 22px;
  }

  .zg-filter-input:focus {
    border-color: var(--zg-primary, #f59e0b);
    background: var(--zg-bg, #fff);
  }

  /* ─── Body rows ─────────────────────────────────────── */
  .zg-row {
    cursor: default;
    transition: background 0.1s;
  }

  .zg-row:hover { background: var(--zg-row-hover-bg, #f0f7ff) !important; }
  .zg-row-alt { background: var(--zg-row-alt-bg, #fafafa); }
  .zg-row-totals { background: #f5f5f5; font-weight: 700; }

  .zg-td {
    padding: 6px 12px;
    border-bottom: 1px solid var(--zg-border-color, #eee);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .zg-td-right { text-align: right; }
  .zg-td-row-num { text-align: center; color: #ccc; font-size: 0.75rem; }
  .zg-td-totals { font-weight: 700; border-top: 2px solid var(--zg-border-color, #ccc); }

  /* ─── Density ───────────────────────────────────────── */
  .zg-density-compact .zg-td, .zg-density-compact .zg-th { padding: 3px 8px; font-size: 0.78rem; }
  .zg-density-comfortable .zg-td, .zg-density-comfortable .zg-th { padding: 10px 14px; }

  /* ─── Status chips ──────────────────────────────────── */
  .zg-chip {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 0.72rem;
    font-weight: 600;
    line-height: 1.6;
  }

  .zg-chip--filled { color: #fff; }
  .zg-chip--outlined { background: transparent !important; border: 1.5px solid; }

  .zg-chip--success { background: #067d62; border-color: #067d62; color: #067d62; }
  .zg-chip--success.zg-chip--filled { color: #fff; }
  .zg-chip--error { background: #cc0c39; border-color: #cc0c39; color: #cc0c39; }
  .zg-chip--error.zg-chip--filled { color: #fff; }
  .zg-chip--warning { background: #ff9800; border-color: #ff9800; color: #ff9800; }
  .zg-chip--warning.zg-chip--filled { color: #fff; }
  .zg-chip--info { background: #0288d1; border-color: #0288d1; color: #0288d1; }
  .zg-chip--info.zg-chip--filled { color: #fff; }
  .zg-chip--primary { background: #f59e0b; border-color: #f59e0b; color: #f59e0b; }
  .zg-chip--primary.zg-chip--filled { color: #fff; }
  .zg-chip--default { background: #9e9e9e; border-color: #9e9e9e; color: #9e9e9e; }
  .zg-chip--default.zg-chip--filled { color: #fff; }

  /* ─── Progress bar ──────────────────────────────────── */
  .zg-progress {
    position: relative;
    width: 100%;
    height: 16px;
    background: #eee;
    border-radius: 8px;
    overflow: hidden;
  }
  .zg-progress-bar {
    height: 100%;
    background: var(--zg-primary, #f59e0b);
    border-radius: 8px;
    transition: width 0.3s;
  }
  .zg-progress-text {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.65rem;
    line-height: 16px;
    font-weight: 600;
  }

  /* ─── Rating ────────────────────────────────────────── */
  .zg-rating { color: #f59e0b; letter-spacing: 2px; }

  /* ─── Find highlight ────────────────────────────────── */
  .zg-find-match { background: rgba(255, 213, 79, 0.3) !important; }
  .zg-find-current { background: rgba(255, 152, 0, 0.5) !important; outline: 2px solid #ff9800; }

  /* ─── Footer ────────────────────────────────────────── */
  .zg-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 12px;
    border-top: 2px solid var(--zg-border-color, #e0e0e0);
    background: var(--zg-footer-bg, #fafafa);
    font-size: 0.78rem;
    min-height: 36px;
  }

  .zg-footer-left, .zg-footer-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .zg-footer-left { color: #666; }

  .zg-page-size {
    border: 1px solid var(--zg-input-border, #ddd);
    border-radius: 4px;
    padding: 2px 4px;
    font-size: 0.78rem;
    font-family: inherit;
    background: var(--zg-input-bg, #fff);
    color: var(--zg-text-color, #333);
  }

  .zg-page-info { color: #888; }
  .zg-status-agg { margin-left: 4px; }

  /* ─── Loading ───────────────────────────────────────── */
  .zg-loading {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.7);
    z-index: 10;
  }

  .zg-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #eee;
    border-top-color: var(--zg-primary, #f59e0b);
    border-radius: 50%;
    animation: zg-spin 0.8s linear infinite;
  }

  @keyframes zg-spin { to { transform: rotate(360deg); } }
`;
