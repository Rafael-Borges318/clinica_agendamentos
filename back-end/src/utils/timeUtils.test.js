import { describe, it, expect } from "vitest";
import { overlaps } from "./timeUtils.js";

describe("overlaps", () => {
  it("retorna true quando dois intervalos se sobrepõem", () => {
    const resultado = overlaps(10, 20, 15, 25);
    expect(resultado).toBe(true);
  });
});
