import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { ValidationError } from "../errors/AppError.js";

const BLOCKED_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0"]);

export class SsrfGuard {
  public async assertAllowed(url: URL): Promise<void> {
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new ValidationError(`Target URL protocol is not allowed: ${url.protocol}`);
    }
    const hostname = url.hostname.toLowerCase();
    if (BLOCKED_HOSTS.has(hostname)) {
      throw new ValidationError("Target URL host is not allowed");
    }
    const addresses = isIP(hostname) ? [{ address: hostname }] : await lookup(hostname, { all: true });
    for (const item of addresses) {
      if (isPrivateAddress(item.address)) {
        throw new ValidationError("Target URL resolves to a private address");
      }
    }
  }
}

function isPrivateAddress(address: string): boolean {
  if (address.includes(":")) {
    const normalized = address.toLowerCase();
    return (
      normalized === "::1" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("fe80:")
    );
  }
  const octets = address.split(".").map((part) => Number.parseInt(part, 10));
  const [a, b] = octets;
  if (a === undefined || b === undefined) {
    return true;
  }
  return (
    a === 10 ||
    a === 127 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254) ||
    a === 0
  );
}
