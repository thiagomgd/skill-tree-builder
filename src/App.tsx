import { useCallback } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  type NodeTypes,
  MarkerType,
} from "@xyflow/react";
import { SkillNode } from "./components/SkillNode";
import { SkillForm } from "./components/SkillForm";
import { Toolbar } from "./components/Toolbar";
import { useSkillTree } from "./hooks/useSkillTree";
import type { SkillFormData } from "./types";
import { NODE_TYPE } from "./constants";

const nodeTypes: NodeTypes = {
  [NODE_TYPE]: SkillNode,
};

const defaultEdgeOptions = {
  markerEnd: { type: MarkerType.ArrowClosed },
};

function App() {
  const {
    nodes,
    edges,
    editingNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onReconnect,
    setRfInstance,
    addNode,
    updateNode,
    resetUnlocks,
    clearTree,
    setEditingNodeId,
  } = useSkillTree();

  const handleFormSubmit = useCallback(
    (skillData: SkillFormData) => {
      if (editingNode) {
        updateNode(editingNode.id, skillData);
      } else {
        addNode(skillData);
      }
    },
    [editingNode, updateNode, addNode]
  );

  const handleFormCancel = useCallback(() => {
    setEditingNodeId(null);
  }, [setEditingNodeId]);

  const handleClearTree = useCallback(() => {
    if (nodes.length === 0) return;
    if (confirm("Are you sure you want to clear all skills?")) {
      clearTree();
    }
  }, [nodes.length, clearTree]);

  return (
    <div className="h-screen w-screen flex">
      {/* Sidebar with form and toolbar */}
      <div className="w-80 p-4 flex flex-col gap-4 border-r">
        <h1 className="text-xl font-bold">Skill Tree Builder</h1>
        <SkillForm
          onSubmit={handleFormSubmit}
          editingNode={editingNode}
          onCancel={handleFormCancel}
        />
        <Toolbar
          onClearTree={handleClearTree}
          onResetUnlocks={resetUnlocks}
          nodeCount={nodes.length}
        />
      </div>

      {/* React Flow canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onReconnect={onReconnect}
          onInit={setRfInstance}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          colorMode="dark"
          fitView
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
}

export default App;
