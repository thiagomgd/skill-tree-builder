interface ToolbarProps {
  onClearTree: () => void;
  onResetUnlocks: () => void;
  nodeCount: number;
}

export function Toolbar({
  onClearTree,
  onResetUnlocks,
  nodeCount,
}: ToolbarProps) {
  return (
    <div className="bg-slate-800 rounded-xl p-3 shadow-xl border border-slate-700">
      <div className="flex items-center gap-3">
        {/* Node count indicator */}
        <div className="text-sm text-slate-400">
          <span className="font-medium text-slate-200">{nodeCount}</span>{" "}
          {nodeCount === 1 ? "skill" : "skills"}
        </div>

        <div className="h-4 w-px bg-slate-600" />

        {/* Action buttons */}
        <button
          onClick={onResetUnlocks}
          disabled={nodeCount === 0}
          className="
            px-3 py-1.5 rounded-lg text-sm font-medium
            bg-amber-600/20 text-amber-400 border border-amber-600/30
            hover:bg-amber-600/30 disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          "
          title="Lock all skills"
        >
          🔒 Reset Unlocks
        </button>

        <button
          onClick={onClearTree}
          disabled={nodeCount === 0}
          className="
            px-3 py-1.5 rounded-lg text-sm font-medium
            bg-red-600/20 text-red-400 border border-red-600/30
            hover:bg-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          "
          title="Remove all skills"
        >
          🗑️ Clear All
        </button>
      </div>

      {/* Usage hints */}
      <div className="mt-3 pt-3 border-t border-slate-700">
        <p className="text-xs text-slate-500">
          <span className="text-slate-400">Tip:</span> Drag from handle to
          handle to create prerequisites. Click a skill to lock/unlock it.
        </p>
      </div>
    </div>
  );
}
