export function logError(context: string, error: unknown) {
  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message: unknown }).message)
      : String(error);
  console.error(`[${context}] ${message}`);
}

export function logWarning(context: string, message: string) {
  console.warn(`[${context}] ${message}`);
}
