import { useState, useEffect, type FormEvent } from "react";
import type { SkillFormData, SkillNode } from "../types";

interface SkillFormProps {
  onSubmit: (skill: SkillFormData) => void;
  editingNode?: SkillNode | null;
  onCancel?: () => void;
}

export function SkillForm({ onSubmit, editingNode, onCancel }: SkillFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState<string>("");
  const [level, setLevel] = useState<string>("");

  const isEditMode = editingNode !== null && editingNode !== undefined;

  // Populate form when editing
  useEffect(() => {
    if (editingNode) {
      setName(editingNode.data.name);
      setDescription(editingNode.data.description);
      setCost(editingNode.data.cost?.toString() ?? "");
      setLevel(editingNode.data.level?.toString() ?? "");
    } else {
      // Reset form when not editing
      setName("");
      setDescription("");
      setCost("");
      setLevel("");
    }
  }, [editingNode]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      cost: cost ? parseInt(cost, 10) : undefined,
      level: level ? parseInt(level, 10) : undefined,
    });

    // Reset form after submit (only in create mode)
    if (!isEditMode) {
      setName("");
      setDescription("");
      setCost("");
      setLevel("");
    }
  };

  const handleCancel = () => {
    setName("");
    setDescription("");
    setCost("");
    setLevel("");
    onCancel?.();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-800 rounded-xl p-4 shadow-xl border border-slate-700"
    >
      <h2 className="text-lg font-semibold text-slate-100 mb-4">
        {isEditMode ? "Edit Skill" : "Add New Skill"}
      </h2>

      <div className="space-y-3">
        {/* Name field */}
        <div>
          <label
            htmlFor="skill-name"
            className="block text-sm text-slate-300 mb-1"
          >
            Name <span className="text-red-400">*</span>
          </label>
          <input
            id="skill-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., JavaScript Basics"
            required
            className="
              w-full px-3 py-2 rounded-lg
              bg-slate-700 border border-slate-600
              text-slate-100 placeholder-slate-400
              focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
              transition-all
            "
          />
        </div>

        {/* Description field */}
        <div>
          <label
            htmlFor="skill-description"
            className="block text-sm text-slate-300 mb-1"
          >
            Description
          </label>
          <textarea
            id="skill-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this skill cover?"
            rows={2}
            className="
              w-full px-3 py-2 rounded-lg resize-none
              bg-slate-700 border border-slate-600
              text-slate-100 placeholder-slate-400
              focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
              transition-all
            "
          />
        </div>

        {/* Cost and Level fields */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="skill-cost"
              className="block text-sm text-slate-300 mb-1"
            >
              Cost
            </label>
            <input
              id="skill-cost"
              type="number"
              min="0"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="0"
              className="
                w-full px-3 py-2 rounded-lg
                bg-slate-700 border border-slate-600
                text-slate-100 placeholder-slate-400
                focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                transition-all
              "
            />
          </div>
          <div>
            <label
              htmlFor="skill-level"
              className="block text-sm text-slate-300 mb-1"
            >
              Level
            </label>
            <input
              id="skill-level"
              type="number"
              min="1"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              placeholder="1"
              className="
                w-full px-3 py-2 rounded-lg
                bg-slate-700 border border-slate-600
                text-slate-100 placeholder-slate-400
                focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                transition-all
              "
            />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-4">
        <button
          type="submit"
          disabled={!name.trim()}
          className="
            flex-1 py-2 px-4 rounded-lg font-medium
            bg-emerald-600 text-white
            hover:bg-emerald-500 disabled:bg-slate-600 disabled:cursor-not-allowed
            transition-colors
          "
        >
          {isEditMode ? "Update Skill" : "Add Skill"}
        </button>
        {isEditMode && (
          <button
            type="button"
            onClick={handleCancel}
            className="
              py-2 px-4 rounded-lg font-medium
              bg-slate-600 text-slate-200
              hover:bg-slate-500
              transition-colors
            "
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
