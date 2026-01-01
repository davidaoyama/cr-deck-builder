import "dotenv/config";
import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json());

// Enable CORS for frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

const CR_BASE = "https://api.clashroyale.com/v1";
const CR_API_KEY = process.env.CR_API_KEY;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

if (!CR_API_KEY) throw new Error("Missing CR_API_KEY");
if (!process.env.SUPABASE_URL) throw new Error("Missing SUPABASE_URL");
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

function encodeTag(tag) {
  const t = tag.startsWith("#") ? tag : `#${tag}`;
  return encodeURIComponent(t); // '#' -> '%23'
}

async function crFetch(path) {
  const res = await fetch(`${CR_BASE}${path}`, {
    headers: { Authorization: `Bearer ${CR_API_KEY}` },
    cache: "no-store",
  });

  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = { message: text }; }

  if (!res.ok) {
    const reason = body?.reason || body?.message || `CR API error ${res.status}`;
    throw new Error(`${path} -> ${reason}`);
  }
  return body;
}

/**
 * 1) Pull a player's profile (incl. their card levels)
 * 2) Save a snapshot to Supabase player_snapshots
 */
app.post("/api/sync", async (req, res) => {
  try {
    const { playerTag, userId } = req.body;
    if (!playerTag) return res.status(400).json({ error: "playerTag required" });

    // IMPORTANT: If you’re not using Supabase Auth yet,
    // you can temporarily pass a fake userId or make user_id nullable in DB.
    if (!userId) return res.status(400).json({ error: "userId required (temporary)" });

    const player = await crFetch(`/players/${encodeTag(playerTag)}`);
    console.log(`Fetched player: ${player.tag} - ${player.name}`);
    // Build map: { cardId: level }
    const cardLevels = {};
    for (const c of player.cards || []) {
      cardLevels[String(c.id)] = c.level;
    }

    const { data, error } = await supabase
      .from("player_snapshots")
      .insert([{
        user_id: userId,
        player_tag: player.tag,
        player_name: player.name,
        cards: cardLevels
      }])
      .select()
      .single();

    if (error) throw error;

    res.json({ ok: true, snapshot: data })
  } catch (e) {
    res.status(500).json({ error: e.message || "sync failed" });
  }
});

/**
 * Pull top ladder players -> their battle logs -> aggregate decks -> upsert meta_decks
 */
app.post("/api/crawl-meta", async (req, res) => {
  try {
    const limitPlayers = Number(req.body?.limitPlayers ?? 30); 
    console.log(`🏆 Fetching top ${limitPlayers} global players...`);
    const players = await crFetch(`/locations/global/rankings/players?limit=${limitPlayers}`);

    console.log(`✅ Found ${players.items?.length || 0} players`);

    const deckMap = new Map(); // key -> stats
    let totalSeen = 0;
    let processed = 0;
    let successfulBattlelogs = 0;
    let failedBattlelogs = 0;

    for (const p of players.items || []) {
        processed++;
        console.log(`\nProcessing ${processed}/${players.items.length}: ${p.name} (${p.tag})`);

        let battles = [];
        try {
            battles = await crFetch(`/players/${encodeTag(p.tag)}/battlelog`);
            successfulBattlelogs++;
            console.log(`  ✅ Found ${battles.length} battles`);
        } catch (e) {
            failedBattlelogs++;
            console.log(`  ❌ Battlelog failed: ${e.message}`);
            continue;
        }     

      let validBattles = 0;
      for (const b of battles || []) {
        const me = b?.team?.[0];

  // Debug: Log why battles are being skipped
        if (!me?.cards) {
          console.log(`  ⚠️ Skipping battle: no cards in team`);
          continue;
        }
        if (me.cards.length !== 8) {
          console.log(`  ⚠️ Skipping battle: ${me.cards.length} cards instead of 8`);
          continue;
        }

        validBattles++;
        const ids = me.cards.map(c => c.id).sort((a,b)=>a-b);
        const deck_key = ids.join("-");
        totalSeen++;

        const entry = deckMap.get(deck_key) || { cards: ids, usage: 0, wins: 0 };
        entry.usage += 1;

        const myCrowns = me?.crowns ?? 0;
        const oppCrowns = b?.opponent?.[0]?.crowns ?? 0;
        if (myCrowns > oppCrowns) entry.wins += 1;

        deckMap.set(deck_key, entry);
      }
      
      console.log(`  📊 Valid battles: ${validBattles}/${battles.length}`);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100)); // Increased to 100ms
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Players processed: ${processed}`);
    console.log(`   Successful battlelogs: ${successfulBattlelogs}`);
    console.log(`   Failed battlelogs: ${failedBattlelogs}`);
    console.log(`   Total valid battles: ${totalSeen}`);
    console.log(`   Unique decks: ${deckMap.size}`);

    if (totalSeen === 0) {
      return res.json({ 
        ok: false, 
        error: "No valid battles found",
        debug: {
          playersProcessed: processed,
          successfulBattlelogs,
          failedBattlelogs
        }
      });
    }

    const decks = [...deckMap.entries()].map(([deck_key, s]) => ({
      deck_key,
      cards: s.cards,
      usage_count: s.usage,
      win_count: s.wins,
      win_rate: s.usage ? (s.wins / s.usage) * 100 : 0,
      use_rate: totalSeen ? (s.usage / totalSeen) * 100 : 0,
      source: "topladder-sampled",
      last_seen_at: new Date().toISOString(),
    }))
    .sort((a,b)=>b.usage_count - a.usage_count)
    .slice(0, 200);

    console.log(`💾 Upserting ${decks.length} decks to database...`);

    const { error } = await supabase
      .from("meta_decks")
      .upsert(decks, { onConflict: "deck_key" });

    if (error) throw error;

    console.log(`✅ Successfully upserted ${decks.length} decks!`);

    res.json({ 
      ok: true, 
      totalSeen, 
      uniqueDecks: deckMap.size,
      upserted: decks.length,
      debug: {
        playersProcessed: processed,
        successfulBattlelogs,
        failedBattlelogs
      }
    });
  } catch (e) {
    console.error('❌ Error:', e.message);
    res.status(500).json({ error: e.message || "crawl failed" });
  }
});
app.get("/api/db-test", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("meta_decks")
      .select("id, deck_key")
      .limit(1);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ ok: false, error: error.message });
    }

    res.json({ ok: true, data });
  } catch (e) {
    console.error("Server error:", e);
    res.status(500).json({ ok: false, error: e.message });
  }
});


app.get("/api/routes", (req, res) => {
  const routes = app._router.stack
    .filter((r) => r.route)
    .map((r) => ({
      method: Object.keys(r.route.methods)[0].toUpperCase(),
      path: r.route.path,
    }));
  res.json({ routes });
});


app.post("/api/debug-one", async (req, res) => {
  try {
    const limitPlayers = Number(req.body?.limitPlayers ?? 10);
    const INTERNATIONAL_ID = 57000006; // "International"
    const players = await crFetch(`/locations/global/rankings/players?limit=${limitPlayers}`);


    const first = players?.items?.[0];
    if (!first) return res.json({ ok: true, note: "No players returned", players });

    let battles = [];
    try {
        battles = await crFetch(`/players/${encodeTag(first.tag)}/battlelog`);
    } catch {
        return res.json({ ok: false, note: "Battlelog not available for first player" });
    }

    

    const sample = (battles || []).slice(0, 3).map(b => ({
      type: b.type,
      gameMode: b.gameMode?.name,
      teamHasCards: !!b?.team?.[0]?.cards,
      teamCardsLen: b?.team?.[0]?.cards?.length,
      oppCardsLen: b?.opponent?.[0]?.cards?.length,
      teamCrowns: b?.team?.[0]?.crowns,
      oppCrowns: b?.opponent?.[0]?.crowns
    }));

    res.json({
      ok: true,
      firstPlayer: { tag: first.tag, name: first.name, rank: first.rank },
      battlesCount: battles?.length ?? 0,
      sample
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get("/api/locations", async (req, res) => {
  try {
    const locations = await crFetch(`/locations`);
    res.json({ ok: true, locations });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});


app.listen(process.env.PORT || 3001, () => {
  console.log(`Backend running on http://localhost:${process.env.PORT || 3001}`);
});
