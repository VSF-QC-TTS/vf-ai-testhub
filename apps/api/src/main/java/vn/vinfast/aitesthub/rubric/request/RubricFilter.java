package vn.vinfast.aitesthub.rubric.request;

import vn.vinfast.aitesthub.rubric.enums.RubricCategory;
import vn.vinfast.aitesthub.rubric.enums.RubricScope;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
public record RubricFilter(
    RubricCategory category,
    RubricScope scope,
    String search,
    Boolean archived
) {}
