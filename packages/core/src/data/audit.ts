export interface AuditEntry {
  field: string;
  rowKey: string;
  oldValue: unknown;
  newValue: unknown;
  user: string;
  timestamp: number;
}

export class AuditTrail {
  private entries: AuditEntry[] = [];
  record(entry: AuditEntry): void { this.entries.push(entry); }
  getHistory(rowKey: string, field: string): AuditEntry[] {
    return this.entries.filter(e => e.rowKey === rowKey && e.field === field);
  }
  getAll(): AuditEntry[] { return [...this.entries]; }
  clear(): void { this.entries = []; }
  hasHistory(rowKey: string, field: string): boolean {
    return this.entries.some(e => e.rowKey === rowKey && e.field === field);
  }
  getLatest(rowKey: string, field: string): AuditEntry | undefined {
    const h = this.getHistory(rowKey, field);
    return h.length > 0 ? h[h.length - 1] : undefined;
  }
}
