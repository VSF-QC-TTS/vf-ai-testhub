import promptfoo from "promptfoo";

const evalRecord = await promptfoo.evaluate(
  {
    prompts: ["{{input}}"],
    providers: [
      async (prompt: string) => ({
        output: `Echo: ${prompt}`,
      }),
    ],
    tests: [
      {
        vars: { input: "VinFast" },
        assert: [{ type: "contains", value: "VinFast" }],
      },
    ],
    writeLatestResults: false,
  },
  {
    cache: false,
    maxConcurrency: 1,
  },
);

const summary = await evalRecord.toEvaluateSummary();
const stats = summary.stats;
if (stats.failures > 0 || stats.errors > 0 || stats.successes < 1) {
  console.error(JSON.stringify(summary, null, 2));
  process.exit(1);
}

console.log(
  JSON.stringify({
    ok: true,
    successes: stats.successes,
    failures: stats.failures,
    errors: stats.errors,
  }),
);

process.exit(0);
