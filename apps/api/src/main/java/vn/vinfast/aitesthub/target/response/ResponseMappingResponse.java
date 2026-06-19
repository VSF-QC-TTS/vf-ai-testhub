package vn.vinfast.aitesthub.target.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import vn.vinfast.aitesthub.target.enums.MissingFieldBehavior;

/**
 * @author nghlong3004
 * @since 6/19/2026
 */
@Schema(description = "Response DTO for Response Mapping")
public record ResponseMappingResponse(
    @Schema(description = "JSONPath for answer")
    String answerPath,

    @Schema(description = "JSONPath for suggestions")
    String suggestionsPath,

    @Schema(description = "JSONPath for intent")
    String intentPath,

    @Schema(description = "JSONPath for confidence")
    String confidencePath,

    @Schema(description = "JSONPath for sources")
    String sourcesPath,

    @Schema(description = "JSONPath for retrieval data")
    String retrievalPath,

    @Schema(description = "JSONPath for memory")
    String memoryPath,

    @Schema(description = "JSONPath for rewrite")
    String rewritePath,

    @Schema(description = "JSONPath for agent info")
    String agentPath,

    @Schema(description = "JSONPath for tool info")
    String toolPath,

    @Schema(description = "JSONPath for tool calls")
    String toolCallsPath,

    @Schema(description = "JSONPath for trace ID")
    String traceIdPath,

    @Schema(description = "JSONPath for latency")
    String latencyPath,

    @Schema(description = "Custom components list")
    List<Object> customComponents,

    @Schema(description = "Behavior when mapped fields are missing")
    MissingFieldBehavior missingFieldBehavior
) {}
