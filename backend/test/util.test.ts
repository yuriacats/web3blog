import { slugNumber } from "../src/util";

test("乱数が生成される", () => {
  expect(slugNumber("てすとたいとる").tobe(111));
});
