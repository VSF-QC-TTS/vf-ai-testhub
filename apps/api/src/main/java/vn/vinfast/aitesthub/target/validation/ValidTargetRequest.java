package vn.vinfast.aitesthub.target.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Cross-field validation for {@link vn.vinfast.aitesthub.target.request.TargetRequest}.
 *
 * <p>Enforces that HTTP targets supply a non-blank URL and that LLM targets supply both provider
 * and model.
 *
 * @author nghlong3004
 * @since 6/23/2026
 */
@Documented
@Constraint(validatedBy = ValidTargetRequestValidator.class)
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidTargetRequest {

  String message() default "Invalid target configuration";

  Class<?>[] groups() default {};

  Class<? extends Payload>[] payload() default {};
}
