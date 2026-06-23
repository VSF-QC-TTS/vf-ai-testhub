package vn.vinfast.aitesthub.target.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import vn.vinfast.aitesthub.target.enums.TargetType;
import vn.vinfast.aitesthub.target.request.TargetRequest;

/**
 * Validates cross-field consistency of {@link TargetRequest} based on the selected
 * {@link TargetType}.
 *
 * <ul>
 *   <li>{@code HTTP} targets must have a non-blank {@code url}.</li>
 *   <li>{@code LLM} targets must have non-blank {@code llmProvider} and {@code llmModel}.</li>
 * </ul>
 *
 * @author nghlong3004
 * @since 6/23/2026
 */
public class ValidTargetRequestValidator implements ConstraintValidator<ValidTargetRequest, TargetRequest> {

  @Override
  public boolean isValid(TargetRequest request, ConstraintValidatorContext context) {
    if (request == null || request.targetType() == null) {
      return true; // @NotNull on targetType handles null case
    }

    boolean valid = true;
    context.disableDefaultConstraintViolation();

    if (request.targetType() == TargetType.HTTP) {
      if (isBlank(request.url())) {
        context
            .buildConstraintViolationWithTemplate("URL is required for HTTP targets")
            .addPropertyNode("url")
            .addConstraintViolation();
        valid = false;
      }
    }

    if (request.targetType() == TargetType.LLM) {
      if (isBlank(request.llmProvider())) {
        context
            .buildConstraintViolationWithTemplate("LLM provider is required for LLM targets")
            .addPropertyNode("llmProvider")
            .addConstraintViolation();
        valid = false;
      }
      if (isBlank(request.llmModel())) {
        context
            .buildConstraintViolationWithTemplate("LLM model is required for LLM targets")
            .addPropertyNode("llmModel")
            .addConstraintViolation();
        valid = false;
      }
    }

    return valid;
  }

  private static boolean isBlank(String value) {
    return value == null || value.isBlank();
  }
}
