import { expect, test } from "bun:test";
import { cn } from "./utils";

test("cn はクラス名を結合する", () => {
  expect(cn("a", "b")).toBe("a b");
});

test("cn は falsy な値を無視する", () => {
  expect(cn("a", false, undefined, "b")).toBe("a b");
});

test("cn は Tailwind の競合するクラスを後勝ちにする", () => {
  expect(cn("p-2", "p-4")).toBe("p-4");
});
