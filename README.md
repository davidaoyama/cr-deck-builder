# Clash Royale Deck Builder
> **Play the hand you're dealt.**
> Find high-win-rate Clash Royale decks that you can *actually* build with your current card levels.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-In%20Development-orange)

## 📋 The Problem
Most deck sites (like RoyaleAPI) show "Meta Decks" used by maxed-out top players. But if you try to copy them, you often realize:
* You don't have the Champion card required.
* Your Goblin Barrel is Level 9 (and will die to a Zap).
* Your average deck level is too low to compete.

**CRDB** solves this by syncing with your player profile to show you **only** the winning decks you can build right now.

## ✨ Features
- **One-Click Sync:** Enter your `#PLAYER_TAG` to instantly fetch your card collection and levels.
- **"Can I Build It?" Filter:** Automatically hides decks containing cards you haven't unlocked.
- **Smart Sorting:**
  - 🏆 **Win %:** Based on Top Ladder data.
  - 💧 **Avg Elixir:** Filter for cycle decks (low cost) or beatdown (high cost).
  - ⚔️ **Avg Level:** Calculates the average level of the deck *using your actual card levels*.
- **Level Warning:** Visual alerts if a deck relies on a card you have severely under-leveled (e.g., "Your Musketeer is -3 levels below average").

## 🛠 Tech Stack
* **Frontend:** Next.js (React) + Tailwind CSS
* **Backend:** Node.js (Next.js API Routes)
* **Database:** PostgreSQL (Supabase/Neon) - *Stores crawled meta decks*
* **Data Source:** Official [Clash Royale API](https://developer.clashroyale.com/)

## 🚀 Getting Started

### Prerequisites
1.  **Node.js** (v18+)
2.  **Clash Royale API Key:**
    * Sign up at [developer.clashroyale.com](https://developer.clashroyale.com/).
    * Create a key and whitelist your IP address.

### Installation

1.  **Clone the repo**
    ```bash
    git clone [https://github.com/yourusername/royalfit.git](https://github.com/yourusername/royalfit.git)
    cd royalfit
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env.local` file in the root directory:
    ```bash
    # Get this from developer.clashroyale.com
    CR_API_KEY=your_supercell_api_key_here
    
    # Database URL (if running the crawler locally)
    DATABASE_URL=postgresql://user:password@localhost:5432/royalfit
    ```

4.  **Run the Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🧠 Core Logic

The app uses a strict filtering algorithm:

```javascript
// Pseudo-code for Deck Matching
UserCards = Fetch(PlayerTag)
MetaDecks = Database.GetAll()

PossibleDecks = MetaDecks.filter(deck => {
  // 1. Check Ownership
  if (!UserHasAllCards(deck)) return false;

  // 2. Calc Stats
  deck.UserAvgLevel = CalculateAvg(deck, UserCards);
  
  // 3. User Preferences
  if (deck.UserAvgLevel < User.MinLevelFilter) return false;
  
  return true;
})
