import { describe, it, expect } from "vitest";
import { isAsync } from "../is-async.mjs";

describe("isAsync", () => {
  it("returns true for async functions", () => {
    const asyncFn = async () => {};
    expect(isAsync(asyncFn)).toBe(true);
  });

  it("returns false for regular functions", () => {
    const regularFn = () => {};
    expect(isAsync(regularFn)).toBe(false);
  });

  it("returns true for async function declarations", () => {
    async function asyncDecl() {}
    expect(isAsync(asyncDecl)).toBe(true);
  });

  it("returns false for generator functions", () => {
    function* genFn() {}
    expect(isAsync(genFn)).toBe(false);
  });
});
