import { NextRequest, NextResponse } from 'next/server';
import { createApiHeaders, CR_API_CONFIG } from '@/lib/config';
import type { PlayerData, ApiError } from '@/types';

/**
 * GET /api/player/[tag]
 * Fetches a player's card collection from Clash Royale API
 *
 * Example: GET /api/player/%2399U2L2
 * Note: Player tags must be URL encoded (# becomes %23)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tag: string }> }
) {
  try {
    const { tag } = await params;

    // Validate tag format
    if (!tag) {
      return NextResponse.json(
        { reason: 'INVALID_TAG', message: 'Player tag is required' } as ApiError,
        { status: 400 }
      );
    }

    // Decode URL-encoded tag (e.g., %2399U2L2 -> #99U2L2)
    const decodedTag = decodeURIComponent(tag);

    // Ensure tag starts with #
    const formattedTag = decodedTag.startsWith('#') ? decodedTag : `#${decodedTag}`;

    // URL encode for API call
    const encodedTag = encodeURIComponent(formattedTag);

    console.log(`[API] Fetching player: ${formattedTag}`);

    // Fetch from Clash Royale API
    const response = await fetch(
      `${CR_API_CONFIG.baseUrl}/players/${encodedTag}`,
      {
        headers: createApiHeaders(),
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      console.error(`[API] CR API Error: ${response.status}`, errorData);

      // Handle specific error cases
      if (response.status === 404) {
        return NextResponse.json(
          { reason: 'NOT_FOUND', message: `Player ${formattedTag} not found` } as ApiError,
          { status: 404 }
        );
      }

      if (response.status === 403) {
        return NextResponse.json(
          { reason: 'FORBIDDEN', message: 'Invalid API key or IP not whitelisted' } as ApiError,
          { status: 403 }
        );
      }

      if (response.status === 429) {
        return NextResponse.json(
          { reason: 'RATE_LIMIT', message: 'Rate limit exceeded. Please try again later.' } as ApiError,
          { status: 429 }
        );
      }

      return NextResponse.json(
        { reason: 'API_ERROR', message: errorData.message || 'Failed to fetch player data' } as ApiError,
        { status: response.status }
      );
    }

    const playerData: PlayerData = await response.json();

    console.log(`[API] Successfully fetched player: ${playerData.name} (${playerData.cards.length} cards)`);

    return NextResponse.json(playerData);

  } catch (error) {
    console.error('[API] Unexpected error:', error);

    return NextResponse.json(
      {
        reason: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      } as ApiError,
      { status: 500 }
    );
  }
}
