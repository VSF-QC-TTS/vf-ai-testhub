package vn.vinfast.aitesthub.assertion.enums;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@SuppressWarnings("java:S115")
public enum AssertionType {
  contains,
  not_contains,
  equals,
  not_equals,
  regex,
  greater_than,
  less_than,
  between,
  is_true,
  is_false,
  field_exists,
  field_not_exists,
  array_length_greater_than,
  array_contains,
  llm_rubric
}
