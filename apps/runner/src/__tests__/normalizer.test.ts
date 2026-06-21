import { describe, expect, it } from "vitest";
import { FieldPathResolver } from "../normalizers/FieldPathResolver.js";
import { ResponseNormalizer } from "../normalizers/ResponseNormalizer.js";

describe("ResponseNormalizer", () => {
  it("maps response paths into components", () => {
    const normalizer = new ResponseNormalizer(new FieldPathResolver());

    const normalized = normalizer.normalize(
      { data: { answer: "hello", tool_calls: [{ name: "search" }] } },
      { answerPath: "$.data.answer", toolCallsPath: "$.data.tool_calls" },
    );

    expect(normalized.components.answer).toBe("hello");
    expect(normalized.toolCalls).toEqual([{ name: "search" }]);
  });
});
