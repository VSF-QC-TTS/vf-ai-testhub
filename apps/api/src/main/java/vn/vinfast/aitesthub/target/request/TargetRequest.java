package vn.vinfast.aitesthub.target.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.Map;
import java.util.UUID;
import vn.vinfast.aitesthub.target.enums.HttpMethod;
import vn.vinfast.aitesthub.target.enums.TargetType;

/**
 * @author nghlong3004
 * @since 6/19/2026
 */
@Schema(description = "Request DTO for creating or updating a Target")
public record TargetRequest(
    @NotNull(message = "Project ID is required")
    @Schema(description = "Public ID of the project", example = "123e4567-e89b-12d3-a456-426614174000")
    UUID projectId,

    @NotBlank(message = "Target name must not be blank")
    @Size(max = 255, message = "Target name must not exceed 255 characters")
    @Schema(description = "Target name", example = "Dev API")
    String name,

    @Size(max = 50, message = "Environment must not exceed 50 characters")
    @Schema(description = "Environment", example = "dev", nullable = true)
    String environment,

    @NotNull(message = "Target type is required")
    @Schema(description = "Target type", example = "HTTP")
    TargetType targetType,

    @Schema(description = "HTTP method for HTTP target", example = "POST", nullable = true)
    HttpMethod method,

    @Schema(description = "URL for HTTP target", example = "https://chatbot.internal/api/chat", nullable = true)
    String url,

    @Schema(description = "Query parameters template", nullable = true)
    Map<String, Object> queryParamsTemplate,

    @Schema(description = "Headers template", nullable = true)
    Map<String, Object> headersTemplate,

    @Schema(description = "Body template", nullable = true)
    Map<String, Object> bodyTemplate,

    @Schema(description = "Auth config", nullable = true)
    Map<String, Object> authConfig,

    @Size(max = 100, message = "LLM provider must not exceed 100 characters")
    @Schema(description = "LLM provider", example = "openai", nullable = true)
    String llmProvider,

    @Size(max = 100, message = "LLM model must not exceed 100 characters")
    @Schema(description = "LLM model", example = "gpt-4", nullable = true)
    String llmModel,

    @Schema(description = "LLM base URL", nullable = true)
    String llmBaseUrl,

    @Size(max = 255, message = "LLM key reference must not exceed 255 characters")
    @Schema(description = "LLM key reference", nullable = true)
    String llmKeyRef,

    @Schema(description = "Input binding", nullable = true)
    Map<String, Object> inputBinding,

    @Schema(description = "Variable bindings", nullable = true)
    Map<String, Object> variableBindings,

    @Min(value = 1000, message = "Timeout must be at least 1000 ms")
    @Max(value = 300000, message = "Timeout must not exceed 300000 ms")
    @Schema(description = "Timeout in milliseconds", example = "30000", nullable = true)
    Integer timeoutMs,

    @Schema(description = "Whether this is the default target", example = "false", nullable = true)
    Boolean isDefault,

    @Valid
    @Schema(description = "Response mapping config", nullable = true)
    ResponseMappingRequest responseMapping
) {}
