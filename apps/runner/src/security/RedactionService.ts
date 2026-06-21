const SECRET_KEY_PATTERN = /(authorization|api[_-]?key|token|secret|password|cookie)/i;

export class RedactionService {
  public redact(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((item) => this.redact(item));
    }
    if (isRecord(value)) {
      const entries = Object.entries(value).map(([key, child]) => [
        key,
        SECRET_KEY_PATTERN.test(key) ? "[REDACTED]" : this.redact(child),
      ]);
      return Object.fromEntries(entries);
    }
    return value;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
