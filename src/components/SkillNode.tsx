import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { SkillNodeProps } from "../types";

const getBaseStyles = (unlocked: boolean) =>
  unlocked
    ? "bg-emerald-50 border-emerald-400 text-emerald-900"
    : "bg-slate-100 border-slate-300 text-slate-600 opacity-80";

const getBadgeStyles = (unlocked: boolean) =>
  unlocked ? "bg-emerald-200/50" : "bg-slate-200";

function StatusIcon({ unlocked }: { unlocked: boolean }) {
  return (
    <span
      className={`
        flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs
        transition-all duration-300
        ${unlocked ? "bg-emerald-200 text-emerald-700" : "bg-slate-200 text-slate-500"}
      `}
    >
      {unlocked ? "✓" : "🔒"}
    </span>
  );
}

function MetaBadge({ label, unlocked }: { label: string; unlocked: boolean }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs ${getBadgeStyles(unlocked)}`}
    >
      {label}
    </span>
  );
}

type ButtonVariant = "primary" | "danger";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-blue-500 hover:bg-blue-600",
  danger: "bg-red-500 hover:bg-red-600",
};

function ActionButton({
  icon,
  onClick,
  title,
  variant = "primary",
}: {
  icon: string;
  onClick: (e: React.MouseEvent) => void;
  title: string;
  variant?: ButtonVariant;
}) {
  return (
    <button
      className={`
        w-6 h-6 rounded-full text-white text-xs shadow-md
        flex items-center justify-center transition-colors
        ${BUTTON_VARIANTS[variant]}
      `}
      onClick={onClick}
      title={title}
    >
      {icon}
    </button>
  );
}

function SkillNodeComponent({ data, selected }: SkillNodeProps) {
  const {
    name,
    description,
    cost,
    level,
    unlocked,
    onEdit,
    onDelete,
    onToggleLock,
  } = data;

  const handleClick = () => {
    if (!onToggleLock) return;

    const success = onToggleLock();
    if (!success) {
      const message = unlocked
        ? `Cannot lock "${name}" - other unlocked skills depend on it. Lock those skills first.`
        : `Cannot unlock "${name}" - unlock all prerequisite skills first.`;
      alert(message);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete "${name}"?`)) {
      onDelete?.();
    }
  };

  const containerClasses = `
    relative min-w-[180px] max-w-[220px] p-4 rounded-xl border-2 shadow-lg
    transition-all duration-200 ease-out cursor-pointer
    ${getBaseStyles(unlocked)}
    ${selected ? "ring-2 ring-blue-500 ring-offset-2" : ""}
    hover:shadow-xl hover:scale-[1.02]
    group
  `;

  return (
    <div onClick={handleClick} className={containerClasses}>
      <Handle type="target" position={Position.Top} />

      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-sm leading-tight flex-1">{name}</h3>
        <StatusIcon unlocked={unlocked} />
      </div>

      {description && (
        <p className="text-xs opacity-75 mb-3 line-clamp-2">{description}</p>
      )}

      {(cost !== undefined || level !== undefined) && (
        <div className="flex gap-3 text-xs">
          {cost !== undefined && (
            <MetaBadge label={`Cost: ${cost}`} unlocked={unlocked} />
          )}
          {level !== undefined && (
            <MetaBadge label={`Lvl ${level}`} unlocked={unlocked} />
          )}
        </div>
      )}

      <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <ActionButton
          icon="✎"
          onClick={handleEdit}
          title="Edit skill"
          variant="primary"
        />
        <ActionButton
          icon="×"
          onClick={handleDelete}
          title="Delete skill"
          variant="danger"
        />
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export const SkillNode = memo(SkillNodeComponent);
