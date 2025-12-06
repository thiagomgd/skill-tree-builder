import { wouldCreateCycle, validateLockStatus } from "../nodeUtils";
import type { SkillNode } from "../../types";
import type { Edge } from "@xyflow/react";
import { NODE_TYPE } from "../../constants";

describe("wouldCreateCycle", () => {
  it("should return true for a simple cycle (A -> B -> A)", () => {
    const edges: Edge[] = [{ id: "1", source: "A", target: "B" }];
    expect(wouldCreateCycle("B", "A", edges)).toBe(true);
  });
});

describe("validateLockStatus", () => {
  const createNode = (id: string, unlocked: boolean): SkillNode => ({
    id,
    type: NODE_TYPE,
    position: { x: 0, y: 0 },
    data: {
      name: `Node ${id}`,
      description: "",
      unlocked,
    },
  });

  it("should return error when target is unlocked but source is locked", () => {
    const nodes: SkillNode[] = [createNode("A", false), createNode("B", true)];
    expect(validateLockStatus("A", "B", nodes)).toBe(
      "Cannot connect a locked prerequisite to an unlocked skill"
    );
  });
});
