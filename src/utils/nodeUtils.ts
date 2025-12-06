import type { Edge } from "@xyflow/react";
import type { SkillNode } from "../types";

/**
 * Detects if adding an edge from source to target would create a cycle.
 */
export function wouldCreateCycle(
  source: string,
  target: string,
  edges: Edge[]
): boolean {
  const visited = new Set<string>();

  function canReach(from: string, to: string): boolean {
    if (from === to) return true;
    if (visited.has(from)) return false;

    visited.add(from);

    // Find all nodes reachable from 'from' via outgoing edges
    const outgoingEdges = edges.filter((e) => e.source === from);
    for (const edge of outgoingEdges) {
      if (canReach(edge.target, to)) return true;
    }

    return false;
  }

  return canReach(target, source);
}

/**
 * Validates lock status for a connection.
 * Returns an error message if invalid, or null if valid.
 */
export function validateLockStatus(
  source: string,
  target: string,
  nodes: SkillNode[]
): string | null {
  const targetNode = nodes.find((n) => n.id === target);
  const sourceNode = nodes.find((n) => n.id === source);

  // If either node doesn't exist, we can't validate
  if (!targetNode || !sourceNode) {
    return null;
  }

  if (targetNode.data.unlocked && !sourceNode.data.unlocked) {
    return "Cannot connect a locked prerequisite to an unlocked skill";
  }

  return null;
}

/**
 * Validates a connection between two nodes
 * Returns an error message if invalid, or null if valid
 */
export function validateConnection(
  source: string,
  target: string,
  edges: Edge[],
  nodes: SkillNode[]
): string | null {
  if (wouldCreateCycle(source, target, edges)) {
    return "Cannot create this connection - it would create a circular dependency";
  }

  return validateLockStatus(source, target, nodes);
}

/**
 * Get all prerequisite node IDs (nodes that have edges pointing to the target)
 */
export function getPrerequisiteIds(nodeId: string, edges: Edge[]): string[] {
  return edges
    .filter((edge) => edge.target === nodeId)
    .map((edge) => edge.source);
}

/**
 * Get all dependent node IDs (nodes that have edges pointing from the source)
 */
export function getDependentIds(nodeId: string, edges: Edge[]): string[] {
  return edges
    .filter((edge) => edge.source === nodeId)
    .map((edge) => edge.target);
}
