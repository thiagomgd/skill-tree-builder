import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SkillForm } from "../SkillForm";
import type { SkillNode } from "../../types";

describe("SkillForm", () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Create Mode", () => {
    it("should render form in create mode", () => {
      render(<SkillForm onSubmit={mockOnSubmit} />);

      expect(screen.getByText("Add New Skill")).toBeInTheDocument();
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /add skill/i })
      ).toBeInTheDocument();
    });

    it("should submit form with valid data", async () => {
      const user = userEvent.setup();
      render(<SkillForm onSubmit={mockOnSubmit} />);

      await user.type(screen.getByLabelText(/name/i), "Test Skill");
      await user.type(
        screen.getByLabelText(/description/i),
        "Test Description"
      );
      await user.type(screen.getByLabelText(/cost/i), "10");
      await user.type(screen.getByLabelText(/level/i), "1");

      await user.click(screen.getByRole("button", { name: /add skill/i }));

      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: "Test Skill",
        description: "Test Description",
        cost: 10,
        level: 1,
      });
    });
  });

  describe("Edit Mode", () => {
    const mockEditingNode: SkillNode = {
      id: "test-id",
      type: "skillNode",
      position: { x: 100, y: 100 },
      data: {
        name: "Original Name",
        description: "Original Description",
        cost: 5,
        level: 2,
        unlocked: false,
      },
    };

    it("should render form in edit mode", () => {
      render(
        <SkillForm
          onSubmit={mockOnSubmit}
          editingNode={mockEditingNode}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText("Edit Skill")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Original Name")).toBeInTheDocument();
      expect(
        screen.getByDisplayValue("Original Description")
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /update skill/i })
      ).toBeInTheDocument();
    });

    it("should submit updated data", async () => {
      const user = userEvent.setup();
      render(
        <SkillForm
          onSubmit={mockOnSubmit}
          editingNode={mockEditingNode}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByLabelText(/name/i);
      await user.clear(nameInput);
      await user.type(nameInput, "Updated Name");

      await user.click(screen.getByRole("button", { name: /update skill/i }));

      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: "Updated Name",
        description: "Original Description",
        cost: 5,
        level: 2,
      });
    });
  });
});
