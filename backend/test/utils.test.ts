import { generateNewSlug, slugGenerator } from "../src/utils/slug";
import { describe, test, expect } from "@jest/globals";

describe("乱数生成モジュール", () => {
  const testGeneraotr = generateNewSlug(0);
  test("シードが固定できる", () => {
    expect(slugGenerator(testGeneraotr)).toBe("ffffffba50d87f5a46b8");
  });
  test("乱数の桁数が20桁になる", () => {
    expect(slugGenerator(testGeneraotr)).toHaveLength(20);
  });
  test("試行結果が毎回異なる", () => {
    expect(slugGenerator(testGeneraotr)).not.toBe(slugGenerator(testGeneraotr));
  });
});
