export class FieldPathResolver {
  public get(source: unknown, path: string | null | undefined): unknown {
    if (path === null || path === undefined || path.trim().length === 0) {
      return undefined;
    }
    const normalized = normalizePath(path);
    let current = source;
    for (const segment of normalized) {
      if (current === null || current === undefined) {
        return undefined;
      }
      if (Array.isArray(current)) {
        const index = Number.parseInt(segment, 10);
        if (!Number.isSafeInteger(index)) {
          return undefined;
        }
        current = current[index];
        continue;
      }
      if (typeof current === "object") {
        current = (current as Record<string, unknown>)[segment];
        continue;
      }
      return undefined;
    }
    return current;
  }
}

function normalizePath(path: string): readonly string[] {
  const withoutRoot = path.trim().replace(/^\$\./, "").replace(/^\$/, "");
  if (withoutRoot.length === 0) {
    return [];
  }
  return withoutRoot.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean);
}
