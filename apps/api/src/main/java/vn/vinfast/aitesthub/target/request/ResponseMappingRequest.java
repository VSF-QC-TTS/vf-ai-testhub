package vn.vinfast.aitesthub.target.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import java.util.List;
import vn.vinfast.aitesthub.target.enums.MissingFieldBehavior;

/**
 * @author nghlong3004
 * @since 6/19/2026
 */
@Schema(description = "Request DTO for Response Mapping")
public record ResponseMappingRequest(
    @Size(max = 500, message = "Path must not exceed 500 characters")
    @Schema(description = "JSONPath for answer", example = "data.answer", nullable = true)
    String answerPath,

    @Size(max = 500, message = "Path must not exceed 500 characters")
    @Schema(description = "JSONPath for suggestions", example = "data.suggestions", nullable = true)
    String suggestionsPath,

    @Size(max = 500, message = "Path must not exceed 500 characters")
    @Schema(description = "JSONPath for intent", example = "data.intent", nullable = true)
    String intentPath,

    @Size(max = 500, message = "Path must not exceed 500 characters")
    @Schema(description = "JSONPath for confidence", example = "data.confidence", nullable = true)
    String confidencePath,

    @Size(max = 500, message = "Path must not exceed 500 characters")
    @Schema(description = "JSONPath for sources", example = "data.sources", nullable = true)
    String sourcesPath,

    @Size(max = 500, message = "Path must not exceed 500 characters")
    @Schema(description = "JSONPath for retrieval data", example = "data.retrieval", nullable = true)
    String retrievalPath,

    @Size(max = 500, message = "Path must not exceed 500 characters")
    @Schema(description = "JSONPath for memory", example = "data.memory", nullable = true)
    String memoryPath,

    @Size(max = 500, message = "Path must not exceed 500 characters")
    @Schema(description = "JSONPath for rewrite", example = "data.rewrite", nullable = true)
    String rewritePath,

    @Size(max = 500, message = "Path must not exceed 500 characters")
    @Schema(description = "JSONPath for agent info", example = "data.agent", nullable = true)
    String agentPath,

    @Size(max = 500, message = "Path must not exceed 500 characters")
    @Schema(description = "JSONPath for tool info", example = "data.tool", nullable = true)
    String toolPath,

    @Size(max = 500, message = "Path must not exceed 500 characters")
    @Schema(description = "JSONPath for tool calls", example = "data.tool_calls", nullable = true)
    String toolCallsPath,

    @Size(max = 500, message = "Path must not exceed 500 characters")
    @Schema(description = "JSONPath for trace ID", example = "metadata.trace_id", nullable = true)
    String traceIdPath,

    @Size(max = 500, message = "Path must not exceed 500 characters")
    @Schema(description = "JSONPath for latency", example = "metadata.latency", nullable = true)
    String latencyPath,

    @Schema(description = "Custom components list", nullable = true)
    List<Object> customComponents,

    @Schema(description = "Behavior when mapped fields are missing", example = "FAIL", nullable = true)
    MissingFieldBehavior missingFieldBehavior
) {}
