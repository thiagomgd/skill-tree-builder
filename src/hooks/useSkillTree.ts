import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import {
  useNodesState,
  useEdgesState,
  addEdge,
  reconnectEdge,
  type Edge,
  type Connection,
  type ReactFlowInstance,
} from "@xyflow/react";
import type { SkillNode, SkillData, SkillFormData, AppNode } from "../types";
import {
  NODE_TYPE,
  SAVE_DEBOUNCE_MS,
  NEW_NODE_OFFSET,
  NEW_NODE_X_RANGE,
  NEW_NODE_Y_RANGE,
} from "../constants";
import {
  validateConnection,
  getPrerequisiteIds,
  getDependentIds,
} from "../utils/nodeUtils";
import { loadFromStorage, saveToStorage } from "../utils/storageUtils";

/**
 * Central hook for all skill tree functionality.
 * Manages nodes, edges, persistence, unlock logic, and cycle detection.
 */
export function useSkillTree() {
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance<
    AppNode,
    Edge
  > | null>(null);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nodeMap = useMemo(
    () => new Map(nodes.map((node) => [node.id, node])),
    [nodes]
  );

  // Load from localStorage on mount
  useEffect(() => {
    const storedData = loadFromStorage();
    if (storedData) {
      setNodes((storedData.nodes as SkillNode[]) || []);
      setEdges(storedData.edges || []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to localStorage using React Flow's toObject()
  const saveFlow = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      saveToStorage(flow);
    }
  }, [rfInstance]);

  // Debounced save effect
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveFlow();
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [nodes, edges, saveFlow]);

  const onConnect = useCallback(
    (connection: Connection) => {
      const { source, target } = connection;

      if (!source || !target) return;

      const error = validateConnection(source, target, edges, nodes);
      if (error) {
        alert(error);
        return;
      }

      setEdges((eds) => addEdge(connection, eds));
    },
    [edges, nodes, setEdges]
  );

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      const { source, target } = newConnection;

      if (!source || !target) return;

      const edgesWithoutOld = edges.filter((e) => e.id !== oldEdge.id);
      const error = validateConnection(source, target, edgesWithoutOld, nodes);
      if (error) {
        alert(error);
        return;
      }

      setEdges((eds) => reconnectEdge(oldEdge, newConnection, eds));
    },
    [edges, nodes, setEdges]
  );

  const addNode = useCallback(
    (skillData: SkillFormData) => {
      const data: SkillData = {
        name: skillData.name,
        description: skillData.description,
        cost: skillData.cost,
        level: skillData.level,
        unlocked: false,
      };

      const newNode: SkillNode = {
        id: crypto.randomUUID(),
        type: NODE_TYPE,
        position: {
          x: NEW_NODE_OFFSET + Math.random() * NEW_NODE_X_RANGE,
          y: NEW_NODE_OFFSET + Math.random() * NEW_NODE_Y_RANGE,
        },
        data,
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  const updateNode = useCallback(
    (id: string, updates: Partial<SkillFormData>) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === id
            ? {
                ...node,
                data: {
                  ...node.data,
                  ...updates,
                },
              }
            : node
        )
      );
      setEditingNodeId(null);
    },
    [setNodes]
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      const node = nodeMap.get(nodeId);
      if (!node) return;

      // Check if node is currently being edited
      if (editingNodeId === nodeId) {
        if (
          !confirm(
            `"${node.data.name}" is currently being edited. Delete anyway?`
          )
        ) {
          return;
        }
      }

      // Check for dependents that would be affected
      const dependentIds = getDependentIds(nodeId, edges);
      const unlockedDependents = dependentIds.filter(
        (id) => nodeMap.get(id)?.data.unlocked === true
      );
      const lockedDependents = dependentIds.filter(
        (id) => nodeMap.get(id)?.data.unlocked !== true
      );

      if (dependentIds.length > 0) {
        const unlockedNames = unlockedDependents
          .map((id) => nodeMap.get(id)?.data.name)
          .filter(Boolean);
        const lockedNames = lockedDependents
          .map((id) => nodeMap.get(id)?.data.name)
          .filter(Boolean);

        let message = `"${node.data.name}" is a prerequisite for ${dependentIds.length} skill(s).\n\n`;

        if (unlockedDependents.length > 0) {
          message += `⚠️ ${unlockedDependents.length} unlocked: ${unlockedNames.join(", ")}\n`;
        }
        if (lockedDependents.length > 0) {
          message += `🔒 ${lockedDependents.length} locked: ${lockedNames.join(", ")}\n`;
        }

        message +=
          "\nDeleting will remove these connections and may affect unlock requirements.\n\nDo you want to proceed?";

        if (!confirm(message)) {
          return;
        }
      }

      const remainingEdges = edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      );

      // Check which unlocked dependents should be locked after deletion
      // (if they no longer meet their unlock requirements)
      const nodesToLock: string[] = [];
      if (unlockedDependents.length > 0) {
        for (const dependentId of unlockedDependents) {
          const dependentNode = nodeMap.get(dependentId);
          if (!dependentNode || !dependentNode.data.unlocked) continue;

          // Check prerequisites BEFORE deletion to see if node originally had any
          const originalPrerequisiteIds = getPrerequisiteIds(
            dependentId,
            edges
          );
          const remainingPrerequisiteIds = getPrerequisiteIds(
            dependentId,
            remainingEdges
          );

          // If node originally had prerequisites and now has none, lock it
          // (it lost all its prerequisites and can't satisfy unlock requirements)
          if (
            originalPrerequisiteIds.length > 0 &&
            remainingPrerequisiteIds.length === 0
          ) {
            nodesToLock.push(dependentId);
            continue;
          }

          // If no prerequisites remain and it never had any, it's a root node - keep it unlocked
          if (remainingPrerequisiteIds.length === 0) continue;

          // Check if all remaining prerequisites are unlocked
          const allPrerequisitesUnlocked = remainingPrerequisiteIds.every(
            (id) => {
              const prereq = nodeMap.get(id);
              return prereq?.data.unlocked === true;
            }
          );

          if (!allPrerequisitesUnlocked) {
            nodesToLock.push(dependentId);
          }
        }
      }

      setNodes((nds) =>
        nds
          .filter((node) => node.id !== nodeId)
          .map((n) => {
            if (nodesToLock.indexOf(n.id) !== -1) {
              return {
                ...n,
                data: { ...n.data, unlocked: false },
              };
            }
            return n;
          })
      );
      setEdges(remainingEdges);

      if (editingNodeId === nodeId) {
        setEditingNodeId(null);
      }
    },
    [setNodes, setEdges, editingNodeId, edges, nodeMap]
  );

  const canUnlock = useCallback(
    (nodeId: string): boolean => {
      const node = nodeMap.get(nodeId);
      if (!node) return false;
      if (node.data.unlocked) return true;

      const prerequisiteIds = getPrerequisiteIds(nodeId, edges);

      // Root nodes (no prerequisites) can always be unlocked
      if (prerequisiteIds.length === 0) return true;

      // Check if all prerequisites are unlocked
      return prerequisiteIds.every(
        (id) => nodeMap.get(id)?.data.unlocked === true
      );
    },
    [nodeMap, edges]
  );

  const canLock = useCallback(
    (nodeId: string): boolean => {
      const node = nodeMap.get(nodeId);
      if (!node) return false;
      if (!node.data.unlocked) return true;

      const dependentIds = getDependentIds(nodeId, edges);

      // Can lock if no unlocked dependents
      return !dependentIds.some(
        (id) => nodeMap.get(id)?.data.unlocked === true
      );
    },
    [nodeMap, edges]
  );

  const toggleNodeLock = useCallback(
    (nodeId: string): boolean => {
      const node = nodeMap.get(nodeId);
      if (!node) return false;

      const isUnlocked = node.data.unlocked;
      const canToggle = isUnlocked ? canLock(nodeId) : canUnlock(nodeId);
      if (!canToggle) return false;

      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? { ...n, data: { ...n.data, unlocked: !isUnlocked } }
            : n
        )
      );

      return true;
    },
    [nodeMap, canUnlock, canLock, setNodes]
  );

  const resetUnlocks = useCallback(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: { ...node.data, unlocked: false },
      }))
    );
  }, [setNodes]);

  const clearTree = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, [setNodes, setEdges]);

  const editingNode = useMemo(
    () => (editingNodeId ? (nodeMap.get(editingNodeId) ?? null) : null),
    [editingNodeId, nodeMap]
  );

  const enhancedNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onEdit: () => setEditingNodeId(node.id),
          onDelete: () => deleteNode(node.id),
          onToggleLock: () => toggleNodeLock(node.id),
        },
      })),
    [nodes, setEditingNodeId, deleteNode, toggleNodeLock]
  );

  return {
    // State
    nodes: enhancedNodes,
    edges,
    editingNode,

    // React Flow handlers
    onNodesChange,
    onEdgesChange,
    onConnect,
    onReconnect,
    setRfInstance,

    // Actions
    addNode,
    updateNode,
    deleteNode,
    toggleNodeLock,
    resetUnlocks,
    clearTree,
    setEditingNodeId,
  };
}
