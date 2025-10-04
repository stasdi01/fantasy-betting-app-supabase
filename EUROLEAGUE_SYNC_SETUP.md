# EuroLeague Data Sync - Setup Complete ✅

## Šta je urađeno

### 1. **Edge Function za sync podataka**
- **Lokacija**: `/supabase/functions/sync-euroleague-data/index.ts`
- **URL**: `https://ngphnbkkatezpjsfpxpw.supabase.co/functions/v1/sync-euroleague-data`
- **Šta radi**:
  - Poziva zvanični EuroLeague API (`https://api-live.euroleague.net/v3`)
  - Preuzima sve igrače sa statistikama za sezonu 2025-26
  - Ažurira `euroleague_players` tabelu (100 igrača)
  - Automatski generiše player prop lines za svih 34 runde
  - Loguje rezultate u `api_sync_logs` tabelu

### 2. **Automatski Scheduled Sync**
- **Učestalost**: Svakih 6 sati (00:00, 06:00, 12:00, 18:00 UTC)
- **Mehanizam**: Supabase pg_cron
- **Provera statusa**:
  ```sql
  SELECT * FROM cron.job WHERE jobname = 'euroleague-data-sync';
  ```

### 3. **Frontend Integration**
- **Fajl**: `/src/hooks/useMyTeam.js`
- **Promena**: Hook sada učitava prave podatke iz Supabase umesto mock data
- **Funkcije**:
  - `loadPlayers()` - Učitava sve igrače iz `euroleague_players`
  - `loadPlayerLines()` - Učitava prop lines iz `player_round_lines`

---

## Kako testirati

### 1. **Proveri da li podaci postoje u bazi**
Otvori Supabase SQL Editor i pokreni:
```sql
-- Proveri broj igrača
SELECT COUNT(*) as total_players FROM euroleague_players;
-- Trebalo bi da vidiš: 100

-- Proveri broj prop lines
SELECT COUNT(*) as total_lines FROM player_round_lines;
-- Trebalo bi da vidiš: ~10,200 (100 igrača × 3 statistike × 34 runde)

-- Proveri poslednji sync
SELECT * FROM api_sync_logs ORDER BY created_at DESC LIMIT 5;
```

### 2. **Proveri frontend**
1. Otvori aplikaciju: `http://localhost:3000`
2. Idi na **MyTeam** stranicu
3. Otvori Browser Console (F12)
4. Trebalo bi da vidiš:
   ```
   ✅ Loaded 100 players and 300 prop lines from database
   ```
5. Proveri da li se igrači prikazuju sa pravim podatcima (imena, timovi, statistike)

### 3. **Ručno pokreni sync (opciono)**
Ako želiš da odmah ažuriraš podatke:
```bash
curl -X POST 'https://ngphnbkkatezpjsfpxpw.supabase.co/functions/v1/sync-euroleague-data' \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0" \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## Kako promeniti učestalost sync-a

Ako želiš da menjaš koliko često se podaci ažuriraju:

```sql
-- Prvo ukloni postojeći job
SELECT cron.unschedule('euroleague-data-sync');

-- Zatim kreiraj novi sa drugačijom učestaloš ću
-- Primeri:
-- '0 */3 * * *'    -- Svaka 3 sata
-- '0 */12 * * *'   -- Svaki 12 sati
-- '0 0 * * *'      -- Jednom dnevno u ponoć
-- '0 8,20 * * *'   -- Dva puta dnevno (8h i 20h)

SELECT cron.schedule(
  'euroleague-data-sync',
  '0 */3 * * *',  -- Ovde promeni cron expression
  $$
  SELECT
    net.http_post(
      url := 'https://ngphnbkkatezpjsfpxpw.supabase.co/functions/v1/sync-euroleague-data',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
      body := '{}'::jsonb
    ) AS request_id;
  $$
);
```

---

## Struktura podataka

### `euroleague_players` tabela
```sql
{
  id: 'el-25-facundo-campazzo',
  name: 'CAMPAZZO, FACUNDO',
  team: 'Real Madrid',
  team_id: 'real-madrid',
  position: 'SF',  -- Default, API ne pruža poziciju
  nationality: 'Unknown',  -- API ne pruža nacionalnost
  season_averages: {
    points: 12.5,
    assists: 5.3,
    rebounds: 2.8
  },
  api_player_id: 'euroleague-2025-P123456',
  last_updated: '2025-10-02T...'
}
```

### `player_round_lines` tabela
```sql
{
  player_id: 'el-25-facundo-campazzo',
  round_id: 'el-round-1',
  stat: 'points',  -- 'points' | 'assists' | 'rebounds'
  line: 11.5,      -- 92% of points average
  over_odds: 1.90,
  under_odds: 1.90
}
```

---

## Sledeći koraci

1. ✅ **EuroLeague sync** - ZAVRŠENO
2. ⏳ **Football sync** - Kreirati sync funkciju za Football (Premier League, La Liga, etc.)
3. ⏳ **NBA sync** - Kreirati sync funkciju za NBA
4. ⏳ **Odds sync** - Implementirati hourly odds updates (The Odds API)
5. ⏳ **Admin Panel** - Dodati dugme za ručno pokretanje sync-a

---

## Troubleshooting

### Problem: Frontend i dalje prikazuje mock podatke
**Rešenje**: Proveri da li se hook učitava:
1. Otvori `/src/hooks/useMyTeam.js`
2. Proveri da li poziva `loadPlayers()` u useEffect
3. Proveri browser console za greške

### Problem: Scheduled sync ne radi
**Rešenje**:
```sql
-- Proveri da li je job aktivan
SELECT * FROM cron.job WHERE jobname = 'euroleague-data-sync';

-- Proveri logove
SELECT * FROM api_sync_logs ORDER BY created_at DESC LIMIT 10;
```

### Problem: 0 igrača u bazi
**Rešenje**: Ručno pokreni Edge Function (vidi gore).

---

## Brisanje seed-data foldera

Sada možeš obrisati `/supabase/seed-data/` folder jer više nije potreban:
```bash
rm -rf /Users/dimitrijestasic/Desktop/betify1/supabase/seed-data
```

---

**Status**: ✅ **Sve je spremno za produkciju!**
