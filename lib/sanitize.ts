import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizes input text to remove malicious HTML and scripts.
 * Use this for all user-generated content (comments, feedback).
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // We only want plain text, no tags allowed
    ALLOWED_ATTR: [],
  }).trim();
}
