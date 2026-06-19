package vn.vinfast.aitesthub.project.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(name = "ProjectRequest", description = "Payload for creating or updating a project")
public record ProjectRequest(
    @NotBlank(message = "Name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    @Schema(description = "The name of the project", example = "Customer Support Bot")
    String name,

    @Schema(description = "The description of the project", example = "Bot testing for customer support flow", nullable = true)
    String description
) {}
