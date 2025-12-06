import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SkillNode } from "../SkillNode";
import type { SkillNode as SkillNodeType } from "../../types";

// Mock React Flow's Handle component
jest.mock("@xyflow/react", () => ({
  ...jest.requireActual("@xyflow/react"),
  Handle: ({ position }: { position: string }) => (
    <div data-testid={`handle-${position}`} />
  ),
  Position: {
    Top: "top",
    Bottom: "bottom",
  },
}));

describe("SkillNode", () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnToggleLock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, "confirm").mockReturnValue(true);
    jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const createNodeProps = (
    node: SkillNodeType,
    selected = false
  ): React.ComponentProps<typeof SkillNode> =>
    ({
      id: node.id,
      data: {
        ...node.data,
        onEdit: mockOnEdit,
        onDelete: mockOnDelete,
        onToggleLock: mockOnToggleLock,
      },
      selected,
      type: "skillNode",
      dragging: false,
      zIndex: 0,
      selectable: true,
      deletable: true,
      draggable: true,
      isConnectable: true,
      positionAbsoluteX: 0,
      positionAbsoluteY: 0,
    }) as React.ComponentProps<typeof SkillNode>;

  describe("Rendering", () => {
    it("should render locked node", () => {
      const node: SkillNodeType = {
        id: "test-id",
        type: "skillNode",
        position: { x: 100, y: 100 },
        data: {
          name: "Test Skill",
          description: "Test Description",
          unlocked: false,
        },
      };

      render(<SkillNode {...createNodeProps(node)} />);

      expect(screen.getByText("Test Skill")).toBeInTheDocument();
      expect(screen.getByText("Test Description")).toBeInTheDocument();
      expect(screen.getByText("🔒")).toBeInTheDocument();
    });

    it("should render unlocked node", () => {
      const node: SkillNodeType = {
        id: "test-id",
        type: "skillNode",
        position: { x: 100, y: 100 },
        data: {
          name: "Unlocked Skill",
          description: "Unlocked Description",
          unlocked: true,
        },
      };

      render(<SkillNode {...createNodeProps(node)} />);

      expect(screen.getByText("Unlocked Skill")).toBeInTheDocument();
      expect(screen.getByText("✓")).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call onToggleLock when clicking node", async () => {
      const user = userEvent.setup();
      mockOnToggleLock.mockReturnValue(true);

      const node: SkillNodeType = {
        id: "test-id",
        type: "skillNode",
        position: { x: 100, y: 100 },
        data: {
          name: "Locked Skill",
          description: "",
          unlocked: false,
        },
      };

      render(<SkillNode {...createNodeProps(node)} />);

      const nodeElement = screen.getByText("Locked Skill").closest("div");
      if (nodeElement) {
        await user.click(nodeElement);
      }

      expect(mockOnToggleLock).toHaveBeenCalled();
    });

    it("should call onEdit when edit button is clicked", async () => {
      const user = userEvent.setup();

      const node: SkillNodeType = {
        id: "test-id",
        type: "skillNode",
        position: { x: 100, y: 100 },
        data: {
          name: "Skill",
          description: "",
          unlocked: false,
        },
      };

      render(<SkillNode {...createNodeProps(node)} />);

      // Hover to show buttons
      const nodeElement = screen.getByText("Skill").closest("div");
      if (nodeElement) {
        await user.hover(nodeElement);
      }

      const editButton = screen.getByTitle("Edit skill");
      await user.click(editButton);

      expect(mockOnEdit).toHaveBeenCalled();
    });

    it("should call onDelete when delete button is clicked", async () => {
      const user = userEvent.setup();

      const node: SkillNodeType = {
        id: "test-id",
        type: "skillNode",
        position: { x: 100, y: 100 },
        data: {
          name: "Skill",
          description: "",
          unlocked: false,
        },
      };

      render(<SkillNode {...createNodeProps(node)} />);

      // Hover to show buttons
      const nodeElement = screen.getByText("Skill").closest("div");
      if (nodeElement) {
        await user.hover(nodeElement);
      }

      const deleteButton = screen.getByTitle("Delete skill");
      await user.click(deleteButton);

      expect(window.confirm).toHaveBeenCalledWith('Delete "Skill"?');
      expect(mockOnDelete).toHaveBeenCalled();
    });
  });
});
