/**
 * Server-side configuration for Clash Royale API
 * This file should only be imported in API routes (server-side only)
 */

export const CR_API_CONFIG = {
  baseUrl: 'https://api.clashroyale.com/v1',
  apiKey: process.env.CR_API_KEY,
} as const;

/**
 * Validates that the API key is configured
 * Throws an error if the API key is missing
 */
export function validateApiKey(): string {
  const apiKey = process.env.CR_API_KEY;

  if (!apiKey) {
    throw new Error(
      'CR_API_KEY is not configured. Please add it to your .env.local file.'
    );
  }

  return apiKey;
}

/**
 * Creates headers for Clash Royale API requests
 */
export function createApiHeaders(): HeadersInit {
  const apiKey = validateApiKey();

  return {
    'Authorization': `Bearer ${apiKey}`,
    'Accept': 'application/json',
  };
}
