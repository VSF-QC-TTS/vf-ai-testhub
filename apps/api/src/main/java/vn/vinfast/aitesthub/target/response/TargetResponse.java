package vn.vinfast.aitesthub.target.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;
import vn.vinfast.aitesthub.target.enums.HttpMethod;
import vn.vinfast.aitesthub.target.enums.TargetType;

/**
 * @author nghlong3004
 * @since 6/19/2026
 */
@Schema(description = "Response DTO for Target")
public record TargetResponse(
    @Schema(description = "Public ID of the target", example = "123e4567-e89b-12d3-a456-426614174000")
    UUID publicId,

    @Schema(description = "Public ID of the associated project", example = "123e4567-e89b-12d3-a456-426614174001")
    UUID projectId,

    @Schema(description = "Target name", example = "Dev API")
    String name,

    @Schema(description = "Environment", example = "dev")
    String environment,

    @Schema(description = "Target type", example = "HTTP")
    TargetType targetType,

    @Schema(description = "HTTP method for HTTP target")
    HttpMethod method,

    @Schema(description = "URL for HTTP target")
    String url,

    @Schema(description = "Query parameters template")
    Map<String, Object> queryParamsTemplate,

    @Schema(description = "Headers template")
    Map<String, Object> headersTemplate,

    @Schema(description = "Body template")
    Map<String, Object> bodyTemplate,

    @Schema(description = "Auth config")
    Map<String, Object> authConfig,

    @Schema(description = "LLM provider")
    String llmProvider,

    @Schema(description = "LLM model")
    String llmModel,

    @Schema(description = "LLM base URL")
    String llmBaseUrl,

    @Schema(description = "LLM key reference")
    String llmKeyRef,

    @Schema(description = "Input binding")
    Map<String, Object> inputBinding,

    @Schema(description = "Variable bindings")
    Map<String, Object> variableBindings,

    @Schema(description = "Timeout in milliseconds", example = "30000")
    Integer timeoutMs,

    @Schema(description = "Whether this is the default target", example = "false")
    boolean isDefault,

    @Schema(description = "Response mapping config")
    ResponseMappingResponse responseMapping,

    @Schema(description = "Creation timestamp")
    OffsetDateTime createdAt,

    @Schema(description = "Last update timestamp")
    OffsetDateTime updatedAt
) {}
