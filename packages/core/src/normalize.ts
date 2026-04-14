export function normalizeInput(message: string, contextMessages: string[] = []): string {
  const allParts = [...contextMessages, message]
    .map((part) => part.trim())
    .filter(Boolean);

  return allParts.join("\n").replace(/\s+/g, " ").trim();
}
