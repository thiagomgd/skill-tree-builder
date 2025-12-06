import type { Edge } from "@xyflow/react";
import type { SkillNode } from "../types";
import { STORAGE_KEY } from "../constants";

export interface StoredFlow {
  nodes: SkillNode[];
  edges: Edge[];
  viewport?: { x: number; y: number; zoom: number };
}

/**
 * Load skill tree data from localStorage
 */
export function loadFromStorage(): StoredFlow | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored) as StoredFlow;

    if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
      console.warn("Invalid stored data structure, ignoring");
      return null;
    }

    return data;
  } catch (error) {
    console.warn("Failed to load from localStorage:", error);
    return null;
  }
}

/**
 * Save skill tree data to localStorage
 */
export function saveToStorage(flow: StoredFlow): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flow));
  } catch (error) {
    console.warn("Failed to save to localStorage:", error);
  }
}
