package vn.vinfast.aitesthub.project.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.OffsetDateTime;
import java.util.UUID;
import vn.vinfast.aitesthub.user.response.UserResponse;

@Schema(name = "ProjectResponse", description = "Public project payload")
public record ProjectResponse(
    @Schema(
        description = "Public project identifier. Internal numeric ids are never exposed.",
        example = "7b7b7d42-5f42-4c5a-9281-8d1d36f6f59d")
    UUID id,
    
    @Schema(description = "The name of the project", example = "Customer Support Bot")
    String name,
    
    @Schema(description = "The description of the project", example = "Bot testing for customer support flow", nullable = true)
    String description,
    
    @Schema(description = "The owner of the project")
    UserResponse owner,
    
    @Schema(description = "The creator of the project")
    UserResponse createdBy,
    
    @Schema(description = "Whether the project is archived", example = "false")
    boolean archived,
    
    @Schema(description = "The creation timestamp", example = "2026-06-09T10:00:00Z")
    OffsetDateTime createdAt,
    
    @Schema(description = "The last update timestamp", example = "2026-06-09T10:00:00Z")
    OffsetDateTime updatedAt
) {}
