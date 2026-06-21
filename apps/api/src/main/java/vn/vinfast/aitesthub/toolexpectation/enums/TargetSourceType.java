package vn.vinfast.aitesthub.toolexpectation.enums;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@SuppressWarnings("java:S115")
public enum TargetSourceType {
  normalized_tool_calls,
  inferred_tool,
  inferred_agent,
  agent_steps,
  trace,
  custom_component
}
