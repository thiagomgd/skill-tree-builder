import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toolbar } from "../Toolbar";

describe("Toolbar", () => {
  const mockOnClearTree = jest.fn();
  const mockOnResetUnlocks = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render node count", () => {
    render(
      <Toolbar
        onClearTree={mockOnClearTree}
        onResetUnlocks={mockOnResetUnlocks}
        nodeCount={5}
      />
    );

    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("skills")).toBeInTheDocument();
  });

  it("should call onResetUnlocks when reset button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <Toolbar
        onClearTree={mockOnClearTree}
        onResetUnlocks={mockOnResetUnlocks}
        nodeCount={3}
      />
    );

    const resetButton = screen.getByRole("button", { name: /reset unlocks/i });
    await user.click(resetButton);

    expect(mockOnResetUnlocks).toHaveBeenCalledTimes(1);
  });

  it("should call onClearTree when clear button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <Toolbar
        onClearTree={mockOnClearTree}
        onResetUnlocks={mockOnResetUnlocks}
        nodeCount={3}
      />
    );

    const clearButton = screen.getByRole("button", { name: /clear all/i });
    await user.click(clearButton);

    expect(mockOnClearTree).toHaveBeenCalledTimes(1);
  });
});
