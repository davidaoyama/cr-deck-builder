# Clash Royale Deck Builder - Migration Plan

## Core Application Logic

### 1. Data Fetching Strategy (Server-Side)
**The "Top Decks" Source:**
- Endpoint: `GET /locations/global/rankings/players` (Fetch Top 50)
- Process: Loop through Top 50 players → `GET /players/{tag}` → Extract `currentDeck`
- **Caching:** Critical - Cache "Top Decks" JSON for 60 minutes (do NOT hit API 50 times per user)

**Deck Object Structure:**
```typescript
type Deck = {
  cards: {
    id: number;
    name: string;
    elixirCost: number;
    iconUrls: { medium: string };
    rarity: string;
    // "Evo" determined if card is in 'starPower' or 'evolution' slot
  }[];
  avgElixir: number;
}
```

### 2. User Identification (The "Search" Fix)
**Limitation:** Official API does NOT support searching by name (must use #TAG)
**Solution:**
- Implement "Recent Searches" localStorage history
- User types #TAG once → App saves it
- Show "Quick Select" dropdown for recent profiles

### 3. The "Can I Build It?" Algorithm
**Input:** UserCollection (cards owned + levels) vs TopDeck (8 cards)

**Step 1: Strict Ownership Check**
- Iterate through 8 cards in TopDeck
- Check if UserCollection contains matching `id`
- Result: Missing even 1 card? Hide deck or move to "Impossible" section

**Step 2: Level Calculation (The "Real" Stats)**
- Do NOT use Top Player's levels (all Lvl 15)
- Calculate: `UserDeckLevel = Sum(User's 8 card levels) / 8`
- Display: "Avg Level: 12.4"
- Color code: Green if >13, Yellow if 11-13, Red if <11

### 4. Advanced Filtering Logic (Client-Side)
- **Filter: "Exact Card Match" (Include)**
  - User selects "P.E.K.K.A" → `Deck.cards.some(c => c.name === 'P.E.K.K.A')`
- **Filter: "Exclude Card"**
  - User selects "X-Bow" → `!Deck.cards.some(c => c.name === 'X-Bow')`
- **Filter: "Evo Requirement"**
  - Toggle "Must have Evolution" → Check evolution slot in API response

---

## Implementation Checklist

### Setup & Configuration
- [x] 1. Initialize Next.js 14+ project with TypeScript and Tailwind CSS
- [x] 2. Configure Tailwind with dark theme (Clash Royale aesthetic)
- [x] 3. Set up environment variables for Clash Royale API key
- [x] 4. Create TypeScript interfaces file (`types/index.ts`)

### API Layer
- [x] 5. Create API route: `/api/player/[tag]` - Fetch player card collection (user's cards + levels)
- [x] 6. Create API route: `/api/top-decks` - Fetch Top 50 players, extract decks, implement 60-min cache
- [x] 7. Add in-memory caching for top decks (60 min TTL)
- [x] 8. Add error handling and rate limiting logic to API routes
- [ ] 9. Test API endpoints with Postman/Thunder Client

### Core Logic (Business Layer)
- [ ] 10. Write `filterDecks()` - Strict ownership check (Step 1 of "Can I Build It?")
- [ ] 11. Write `calculateUserDeckLevel()` - Avg level calculation (Step 2 of "Can I Build It?")
- [ ] 12. Write player tag validation utility (format: #TAG)
- [ ] 13. Create card level badge color logic (Green >13, Yellow 11-13, Red <11)
- [ ] 14. Implement localStorage for "Recent Searches" (player tags)

### UI Components (Dumb Components)
- [ ] 15. Build `PlayerTagInput.tsx` - Controlled input with validation + Recent Searches dropdown
- [ ] 16. Build `LoadingSpinner.tsx` - Loading state component
- [ ] 17. Build `ErrorMessage.tsx` - Error display component
- [ ] 18. Build `StatusBadge.tsx` - Level indicator with color coding (Green/Yellow/Red)
- [ ] 19. Build `DeckCard.tsx` - Single deck display (8 cards in 2x4 grid + avg level badge)
- [ ] 20. Build `DeckGrid.tsx` - Grid container for multiple decks

### Main Page (Smart Container)
- [ ] 21. Implement state management in `app/page.tsx` (playerTag, userCards, topDecks, filteredDecks)
- [ ] 22. Wire up Player Sync flow - Fetch user cards via `/api/player/[tag]`
- [ ] 23. Wire up Meta Deck Fetching - Fetch via `/api/top-decks`
- [ ] 24. Wire up "Can I Build It?" filtering - Call `filterDecks()` + `calculateUserDeckLevel()`
- [ ] 25. Add sequential loading states (idle → player → decks → filtering → complete)
- [ ] 26. Implement Advanced Filters UI (Include Card, Exclude Card, Evo Toggle)

### Polish & Edge Cases
- [ ] 27. Handle all 6 edge cases from Blueprint
- [ ] 28. Add accessibility (aria-labels, semantic HTML, keyboard navigation)
- [ ] 29. Implement responsive design (mobile-first)
- [ ] 30. Add "Impossible Decks" section (decks user can't build yet)

### Deployment
- [ ] 31. Test build locally (`npm run build`)
- [ ] 32. Deploy to Vercel
- [ ] 33. Verify environment variables in production
- [ ] 34. Test end-to-end flow in production

---

## Current Status
**Phase:** API Layer
**Next Item:** #5 - Create API route: `/api/player/[tag]`
