import http from "node:http";

const port = Number(process.env.PORT ?? 8090);

const server = http.createServer(async (request, response) => {
  if (request.method !== "POST" || request.url !== "/chat") {
    response.writeHead(404, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "not_found" }));
    return;
  }

  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");
  let payload = {};
  try {
    payload = rawBody.length > 0 ? JSON.parse(rawBody) : {};
  } catch {
    response.writeHead(400, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "invalid_json" }));
    return;
  }
  const message = typeof payload.message === "string" ? payload.message : "";

  response.writeHead(200, { "content-type": "application/json" });
  response.end(
    JSON.stringify({
      data: {
        answer: `Mock target response: ${message}`,
        intent: "mock_chat",
        tool_calls: [
          {
            name: "mock_search",
            arguments: { query: message },
          },
        ],
      },
      trace_id: "mock-trace-1",
    }),
  );
});

server.listen(port, "0.0.0.0", () => {
  console.log(`mock-target listening on ${port}`);
});
