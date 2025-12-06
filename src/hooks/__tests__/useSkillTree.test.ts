import React from "react";
import { renderHook, act } from "@testing-library/react";
import {
  ReactFlowProvider,
  type ReactFlowInstance,
  type Edge,
} from "@xyflow/react";
import { useSkillTree } from "../useSkillTree";
import type { AppNode } from "../../types";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock window.confirm
const mockConfirm = jest.fn();
Object.defineProperty(window, "confirm", {
  value: mockConfirm,
  writable: true,
});

// Wrapper component that sets up the mock RF instance
const wrapper = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(ReactFlowProvider, null, children);
};

// Helper to render hook with mock RF instance
const renderUseSkillTree = () => {
  const hookResult = renderHook(() => useSkillTree(), { wrapper });

  // Set up mock RF instance that dynamically returns current state
  act(() => {
    const mockInstance = {
      toObject: () => {
        // This function dynamically accesses the current state each time it's called
        return {
          nodes: hookResult.result.current.nodes,
          edges: hookResult.result.current.edges,
          viewport: { x: 0, y: 0, zoom: 1 },
        };
      },
    } satisfies Pick<ReactFlowInstance<AppNode, Edge>, "toObject">;

    hookResult.result.current.setRfInstance(
      mockInstance as ReactFlowInstance<AppNode, Edge>
    );
  });

  return hookResult;
};

describe("useSkillTree", () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    jest.clearAllTimers();
    mockConfirm.mockReturnValue(true); // Default to allowing deletion
  });

  describe("Node Management", () => {
    it("should add a new node", () => {
      const { result } = renderUseSkillTree();

      act(() => {
        result.current.addNode({
          name: "Test Skill",
          description: "Test Description",
          cost: 10,
          level: 1,
        });
      });

      expect(result.current.nodes).toHaveLength(1);
      expect(result.current.nodes[0].data.name).toBe("Test Skill");
      expect(result.current.nodes[0].data.unlocked).toBe(false);
    });

    it("should update an existing node", () => {
      const { result } = renderUseSkillTree();

      act(() => {
        result.current.addNode({
          name: "Original Name",
          description: "Original Description",
        });
      });

      const nodeId = result.current.nodes[0].id;

      act(() => {
        result.current.updateNode(nodeId, {
          name: "Updated Name",
          description: "Updated Description",
        });
      });

      expect(result.current.nodes[0].data.name).toBe("Updated Name");
      expect(result.current.nodes[0].data.description).toBe(
        "Updated Description"
      );
    });

    it("should delete a node and its connected edges", () => {
      const { result } = renderUseSkillTree();

      act(() => {
        result.current.addNode({ name: "Node 1", description: "" });
        result.current.addNode({ name: "Node 2", description: "" });
      });

      const nodeId1 = result.current.nodes[0].id;
      const nodeId2 = result.current.nodes[1].id;

      act(() => {
        result.current.onConnect({
          source: nodeId1,
          target: nodeId2,
          sourceHandle: null,
          targetHandle: null,
        });
      });

      expect(result.current.edges).toHaveLength(1);

      act(() => {
        result.current.deleteNode(nodeId1);
      });

      expect(result.current.nodes).toHaveLength(1);
      expect(result.current.edges).toHaveLength(0);
    });

    it("should warn when deleting a node with unlocked dependents", () => {
      const { result } = renderUseSkillTree();
      mockConfirm.mockReturnValue(true);

      act(() => {
        result.current.addNode({ name: "Prerequisite", description: "" });
        result.current.addNode({ name: "Dependent", description: "" });
      });

      const nodeId1 = result.current.nodes[0].id;
      const nodeId2 = result.current.nodes[1].id;

      act(() => {
        result.current.onConnect({
          source: nodeId1,
          target: nodeId2,
          sourceHandle: null,
          targetHandle: null,
        });
        // Unlock both nodes
        result.current.toggleNodeLock(nodeId1);
        result.current.toggleNodeLock(nodeId2);
      });

      expect(result.current.nodes[1].data.unlocked).toBe(true);

      act(() => {
        result.current.deleteNode(nodeId1);
      });

      expect(mockConfirm).toHaveBeenCalledWith(
        expect.stringContaining("unlocked skill(s)")
      );
      expect(result.current.nodes).toHaveLength(1);
      expect(result.current.edges).toHaveLength(0);
    });

    it("should prevent deletion if user cancels confirmation", () => {
      const { result } = renderUseSkillTree();
      mockConfirm.mockReturnValue(false);

      act(() => {
        result.current.addNode({ name: "Prerequisite", description: "" });
        result.current.addNode({ name: "Dependent", description: "" });
      });

      const nodeId1 = result.current.nodes[0].id;
      const nodeId2 = result.current.nodes[1].id;

      act(() => {
        result.current.onConnect({
          source: nodeId1,
          target: nodeId2,
          sourceHandle: null,
          targetHandle: null,
        });
        result.current.toggleNodeLock(nodeId1);
        result.current.toggleNodeLock(nodeId2);
      });

      const initialNodeCount = result.current.nodes.length;
      const initialEdgeCount = result.current.edges.length;

      act(() => {
        result.current.deleteNode(nodeId1);
      });

      expect(mockConfirm).toHaveBeenCalled();
      expect(result.current.nodes).toHaveLength(initialNodeCount);
      expect(result.current.edges).toHaveLength(initialEdgeCount);
    });

    it("should cascade-lock unlocked dependents when prerequisite is deleted", () => {
      const { result } = renderUseSkillTree();
      mockConfirm.mockReturnValue(true);

      act(() => {
        result.current.addNode({ name: "Prerequisite", description: "" });
        result.current.addNode({ name: "Dependent", description: "" });
      });

      const nodeId1 = result.current.nodes[0].id;
      const nodeId2 = result.current.nodes[1].id;

      act(() => {
        result.current.onConnect({
          source: nodeId1,
          target: nodeId2,
          sourceHandle: null,
          targetHandle: null,
        });
        // Unlock prerequisite and dependent
        result.current.toggleNodeLock(nodeId1);
        result.current.toggleNodeLock(nodeId2);
      });

      expect(result.current.nodes[1].data.unlocked).toBe(true);

      act(() => {
        result.current.deleteNode(nodeId1);
      });

      // Dependent should be locked after prerequisite is deleted
      expect(result.current.nodes[0].data.unlocked).toBe(false);
    });

    it("should warn about all dependents (locked and unlocked)", () => {
      const { result } = renderUseSkillTree();
      mockConfirm.mockReturnValue(true);

      act(() => {
        result.current.addNode({ name: "Prerequisite", description: "" });
        result.current.addNode({ name: "Unlocked Dependent", description: "" });
        result.current.addNode({ name: "Locked Dependent", description: "" });
      });

      const nodeId1 = result.current.nodes[0].id;
      const nodeId2 = result.current.nodes[1].id;
      const nodeId3 = result.current.nodes[2].id;

      act(() => {
        result.current.onConnect({
          source: nodeId1,
          target: nodeId2,
          sourceHandle: null,
          targetHandle: null,
        });
        result.current.onConnect({
          source: nodeId1,
          target: nodeId3,
          sourceHandle: null,
          targetHandle: null,
        });
        // Unlock prerequisite and one dependent
        result.current.toggleNodeLock(nodeId1);
        result.current.toggleNodeLock(nodeId2);
      });

      act(() => {
        result.current.deleteNode(nodeId1);
      });

      expect(mockConfirm).toHaveBeenCalledWith(
        expect.stringMatching(/2 skill\(s\)/)
      );
      expect(mockConfirm).toHaveBeenCalledWith(
        expect.stringMatching(/unlocked/)
      );
      expect(mockConfirm).toHaveBeenCalledWith(expect.stringMatching(/locked/));
    });

    it("should warn when deleting a node that is being edited", () => {
      const { result } = renderUseSkillTree();
      mockConfirm.mockReturnValue(true);

      act(() => {
        result.current.addNode({ name: "Test Node", description: "" });
      });

      const nodeId = result.current.nodes[0].id;

      act(() => {
        result.current.setEditingNodeId(nodeId);
      });

      expect(result.current.editingNode?.id).toBe(nodeId);

      act(() => {
        result.current.deleteNode(nodeId);
      });

      expect(mockConfirm).toHaveBeenCalledWith(
        expect.stringContaining("currently being edited")
      );
      expect(result.current.editingNode).toBeNull();
    });
  });

  describe("Unlock Logic", () => {
    it("should unlock a root node (no prerequisites)", () => {
      const { result } = renderUseSkillTree();

      act(() => {
        result.current.addNode({ name: "Root Skill", description: "" });
      });

      const nodeId = result.current.nodes[0].id;

      act(() => {
        const success = result.current.toggleNodeLock(nodeId);
        expect(success).toBe(true);
      });

      expect(result.current.nodes[0].data.unlocked).toBe(true);
    });

    it("should unlock a node when all prerequisites are met", () => {
      const { result } = renderUseSkillTree();

      act(() => {
        result.current.addNode({ name: "Prerequisite", description: "" });
        result.current.addNode({ name: "Dependent", description: "" });
      });

      const nodeId1 = result.current.nodes[0].id;
      const nodeId2 = result.current.nodes[1].id;

      act(() => {
        result.current.onConnect({
          source: nodeId1,
          target: nodeId2,
          sourceHandle: null,
          targetHandle: null,
        });
      });

      // Unlock prerequisite first
      act(() => {
        result.current.toggleNodeLock(nodeId1);
      });

      // Now unlock dependent
      act(() => {
        const success = result.current.toggleNodeLock(nodeId2);
        expect(success).toBe(true);
      });

      expect(result.current.nodes[1].data.unlocked).toBe(true);
    });
  });

  describe("Connections", () => {
    it("should allow valid connections", () => {
      const { result } = renderUseSkillTree();

      act(() => {
        result.current.addNode({ name: "Prerequisite", description: "" });
        result.current.addNode({ name: "Target", description: "" });
      });

      const nodeId1 = result.current.nodes[0].id;
      const nodeId2 = result.current.nodes[1].id;

      act(() => {
        result.current.onConnect({
          source: nodeId1,
          target: nodeId2,
          sourceHandle: null,
          targetHandle: null,
        });
      });

      expect(result.current.edges).toHaveLength(1);
    });
  });

  describe("Persistence", () => {
    it("should load from localStorage on mount", () => {
      const storedData = {
        nodes: [
          {
            id: "test-id",
            type: "skillNode" as const,
            position: { x: 100, y: 100 },
            data: {
              name: "Stored Skill",
              description: "Stored Description",
              unlocked: false,
            },
          },
        ],
        edges: [],
      };

      localStorageMock.setItem("skillTree", JSON.stringify(storedData));

      const { result } = renderUseSkillTree();

      expect(result.current.nodes).toHaveLength(1);
      expect(result.current.nodes[0].data.name).toBe("Stored Skill");
    });
  });
});
