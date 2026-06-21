import { describe, expect, it } from "vitest";
import { PromptfooConfigBuilder } from "../promptfoo/PromptfooConfigBuilder.js";
import { runSnapshotFixture } from "./runSnapshotFixture.js";

describe("PromptfooConfigBuilder", () => {
  it("builds an in-memory test suite from snapshot", () => {
    const suite = new PromptfooConfigBuilder().build(runSnapshotFixture());

    expect(suite.prompts).toEqual(["{{input}}"]);
    expect(suite.tests).toHaveLength(1);
    expect(suite.tests[0]?.vars.input).toBe("hello");
    expect(suite.tests[0]?.metadata.testCaseId).toBe("case-1");
  });
});
