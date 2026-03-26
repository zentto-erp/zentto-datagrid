// ─── Tree Data — Hierarchical row structure ──────────────────────────────────
import type { GridRow } from '../types';

/**
 * A row augmented with tree metadata.
 * Internal fields use `__zentto_tree_*` prefix to avoid collision with user data.
 */
export interface TreeNode extends GridRow {
  /** Depth level (0 = root) */
  __zentto_tree_level__?: number;
  /** Whether this node is currently expanded */
  __zentto_tree_expanded__?: boolean;
  /** Whether this node has child rows */
  __zentto_tree_has_children__?: boolean;
  /** Whether this node is a leaf (no children) */
  __zentto_tree_leaf__?: boolean;
}

/**
 * Build a flat array of visible tree rows from hierarchical data.
 *
 * Algorithm:
 * 1. Index all rows by their id field.
 * 2. Build a children map (parentId -> child rows).
 * 3. DFS traversal starting from roots (parentId is null/undefined/'').
 * 4. Only include children of expanded nodes.
 *
 * @param rows       Raw flat rows with id + parentId fields
 * @param idField    Field name used as unique identifier (e.g. 'id')
 * @param parentField Field name pointing to parent (e.g. 'parentId')
 * @param expandedIds Set of ids that are currently expanded
 * @returns Flat array with tree metadata, only visible rows
 */
export function buildTreeRows(
  rows: GridRow[],
  idField: string,
  parentField: string,
  expandedIds: Set<string>,
): TreeNode[] {
  // Build children map
  const childrenMap = new Map<string, GridRow[]>();
  const idSet = new Set<string>();

  for (const row of rows) {
    const id = String(row[idField] ?? '');
    idSet.add(id);
    const parentId = String(row[parentField] ?? '');
    if (!childrenMap.has(parentId)) {
      childrenMap.set(parentId, []);
    }
    childrenMap.get(parentId)!.push(row);
  }

  // Pre-compute which rows have children
  const hasChildrenSet = new Set<string>();
  for (const row of rows) {
    const id = String(row[idField] ?? '');
    const children = childrenMap.get(id);
    if (children && children.length > 0) {
      hasChildrenSet.add(id);
    }
  }

  // Find roots: rows whose parentId is empty, null, or not in the dataset
  const roots: GridRow[] = [];
  for (const row of rows) {
    const parentId = String(row[parentField] ?? '');
    if (!parentId || parentId === 'null' || parentId === 'undefined' || !idSet.has(parentId)) {
      roots.push(row);
    }
  }

  // DFS traversal
  const result: TreeNode[] = [];

  function visit(node: GridRow, level: number): void {
    const id = String(node[idField] ?? '');
    const hasChildren = hasChildrenSet.has(id);
    const isExpanded = expandedIds.has(id);

    const treeNode: TreeNode = {
      ...node,
      __zentto_tree_level__: level,
      __zentto_tree_expanded__: isExpanded,
      __zentto_tree_has_children__: hasChildren,
      __zentto_tree_leaf__: !hasChildren,
    };
    result.push(treeNode);

    // Only recurse if expanded and has children
    if (hasChildren && isExpanded) {
      const children = childrenMap.get(id) || [];
      for (const child of children) {
        visit(child, level + 1);
      }
    }
  }

  for (const root of roots) {
    visit(root, 0);
  }

  return result;
}

/**
 * Get all descendant IDs of a given node (recursive).
 * Useful for selecting/deselecting entire subtrees.
 */
export function getDescendantIds(
  rows: GridRow[],
  idField: string,
  parentField: string,
  nodeId: string,
): string[] {
  const childrenMap = new Map<string, GridRow[]>();
  for (const row of rows) {
    const parentId = String(row[parentField] ?? '');
    if (!childrenMap.has(parentId)) {
      childrenMap.set(parentId, []);
    }
    childrenMap.get(parentId)!.push(row);
  }

  const result: string[] = [];
  function collect(pid: string): void {
    const children = childrenMap.get(pid) || [];
    for (const child of children) {
      const cid = String(child[idField] ?? '');
      result.push(cid);
      collect(cid);
    }
  }
  collect(nodeId);
  return result;
}
