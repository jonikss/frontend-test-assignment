export function generateIdempotencyKey(): string {
  return `wdr_${Date.now()}_${crypto.randomUUID()}`;
}
