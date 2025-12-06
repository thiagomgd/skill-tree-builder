import type { Node, NodeProps } from "@xyflow/react";
import { NODE_TYPE } from "./constants";

/**
 * Input data for creating/editing skills (form data).
 */
export interface SkillFormData {
  name: string;
  description: string;
  cost?: number;
  level?: number;
}

/**
 * Skill data stored in each node.
 * Note: No `id` field - use the Node's built-in `id` property instead.
 * Extends Record<string, unknown> for React Flow v12 type compatibility.
 */
export interface SkillData extends Record<string, unknown> {
  name: string;
  description: string;
  cost?: number;
  level?: number;
  unlocked: boolean;
  // Callbacks injected at runtime (not persisted)
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleLock?: () => boolean;
}

/**
 * Custom React Flow node for skills.
 * Use React Flow's Edge type directly for edges - no custom type needed.
 */
export type SkillNode = Node<SkillData, typeof NODE_TYPE>;

/**
 * Union type for all node types in the app (following React Flow TypeScript best practices).
 */
export type AppNode = SkillNode;

/**
 * Props for the SkillNode component (custom React Flow node).
 */
export type SkillNodeProps = NodeProps<SkillNode>;
