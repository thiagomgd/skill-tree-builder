import {
  loadFromStorage,
  saveToStorage,
  type StoredFlow,
} from "../storageUtils";
import { STORAGE_KEY, NODE_TYPE } from "../../constants";

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

describe("storageUtils", () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe("loadFromStorage", () => {
    it("should load valid data from localStorage", () => {
      const storedData: StoredFlow = {
        nodes: [
          {
            id: "test-id",
            type: NODE_TYPE,
            position: { x: 100, y: 100 },
            data: {
              name: "Test Skill",
              description: "Test Description",
              unlocked: false,
            },
          },
        ],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
      };

      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(storedData));

      const result = loadFromStorage();
      expect(result).toEqual(storedData);
      expect(result?.nodes).toHaveLength(1);
      expect(result?.nodes[0].data.name).toBe("Test Skill");
    });
  });

  describe("saveToStorage", () => {
    it("should save valid data to localStorage", () => {
      const flowData: StoredFlow = {
        nodes: [
          {
            id: "test-id",
            type: NODE_TYPE,
            position: { x: 100, y: 100 },
            data: {
              name: "Test Skill",
              description: "Test Description",
              unlocked: false,
            },
          },
        ],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
      };

      saveToStorage(flowData);

      const stored = localStorageMock.getItem(STORAGE_KEY);
      expect(stored).toBeTruthy();
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed).toEqual(flowData);
        expect(parsed.nodes).toHaveLength(1);
      }
    });
  });
});
