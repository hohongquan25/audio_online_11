import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility (used by all UI components)", () => {
  it("merges multiple class strings", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("filters out falsy values", () => {
    expect(cn("foo", false, null, undefined, "bar")).toBe("foo bar");
  });

  it("returns empty string when all falsy", () => {
    expect(cn(false, null, undefined)).toBe("");
  });
});

describe("Button component exports", () => {
  it("can be imported", async () => {
    const mod = await import("@/components/ui/Button");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("object"); // forwardRef returns object
  });
});

describe("Input component exports", () => {
  it("can be imported", async () => {
    const mod = await import("@/components/ui/Input");
    expect(mod.default).toBeDefined();
  });
});

describe("Card component exports", () => {
  it("can be imported", async () => {
    const mod = await import("@/components/ui/Card");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });
});

describe("Modal component exports", () => {
  it("can be imported", async () => {
    const mod = await import("@/components/ui/Modal");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });
});
