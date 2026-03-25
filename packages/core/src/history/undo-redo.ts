/**
 * Undo/Redo history stack for grid cell edits.
 */

export interface EditAction {
  type: 'cell-edit' | 'row-add' | 'row-delete' | 'paste' | 'bulk-edit';
  timestamp: number;
  /** For cell-edit */
  rowKey?: string;
  field?: string;
  oldValue?: unknown;
  newValue?: unknown;
  /** For row-add / row-delete */
  row?: Record<string, unknown>;
  rowIndex?: number;
  /** For paste / bulk-edit */
  changes?: Array<{ rowKey: string; field: string; oldValue: unknown; newValue: unknown }>;
}

export class UndoRedoStack {
  private _undoStack: EditAction[] = [];
  private _redoStack: EditAction[] = [];
  private _maxSize: number;

  constructor(maxSize = 100) {
    this._maxSize = maxSize;
  }

  push(action: EditAction): void {
    this._undoStack.push(action);
    if (this._undoStack.length > this._maxSize) {
      this._undoStack.shift();
    }
    // Clear redo stack on new action
    this._redoStack = [];
  }

  undo(): EditAction | null {
    const action = this._undoStack.pop() ?? null;
    if (action) this._redoStack.push(action);
    return action;
  }

  redo(): EditAction | null {
    const action = this._redoStack.pop() ?? null;
    if (action) this._undoStack.push(action);
    return action;
  }

  get canUndo(): boolean { return this._undoStack.length > 0; }
  get canRedo(): boolean { return this._redoStack.length > 0; }
  get undoCount(): number { return this._undoStack.length; }
  get redoCount(): number { return this._redoStack.length; }

  clear(): void {
    this._undoStack = [];
    this._redoStack = [];
  }

  /** Get description of last action for UI tooltip */
  get lastActionDescription(): string {
    const action = this._undoStack[this._undoStack.length - 1];
    if (!action) return '';
    switch (action.type) {
      case 'cell-edit': return `Edit ${action.field}`;
      case 'row-add': return 'Add row';
      case 'row-delete': return 'Delete row';
      case 'paste': return `Paste ${action.changes?.length ?? 0} cells`;
      case 'bulk-edit': return `Edit ${action.changes?.length ?? 0} cells`;
      default: return '';
    }
  }
}
