type LogLevel = "info" | "warn" | "error";

type LogFields = Record<string, unknown>;

const SENSITIVE = /password|secret|token|authorization|cookie|license|sid|webhook/i;

function scrub(fields?: LogFields): LogFields | undefined {
  if (!fields) return undefined;
  const out: LogFields = {};
  for (const [k, v] of Object.entries(fields)) {
    out[k] = SENSITIVE.test(k) ? "[redacted]" : v;
  }
  return out;
}

export function logEvent(
  level: LogLevel,
  event: string,
  fields?: LogFields
): void {
  const line = JSON.stringify({
    level,
    timestamp: new Date().toISOString(),
    event,
    ...scrub(fields),
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}
