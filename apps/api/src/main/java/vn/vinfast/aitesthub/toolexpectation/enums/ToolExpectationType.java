package vn.vinfast.aitesthub.toolexpectation.enums;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
public enum ToolExpectationType {
  TOOL_MUST_BE_CALLED,
  TOOL_MUST_NOT_BE_CALLED,
  TOOL_ARGS_MATCH,
  TOOL_SEQUENCE_MATCH,
  TOOL_CALL_COUNT,
  TOOL_OUTPUT_USED_IN_ANSWER,
  AGENT_EQUALS,
  AGENT_NOT_EQUALS,
  AGENT_STEP_CONTAINS
}
