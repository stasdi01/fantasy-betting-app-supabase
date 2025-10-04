import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { PLAYER_POSITIONS } from './player-positions.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// EuroLeague API configuration
const EUROLEAGUE_API_BASE = 'https://api-live.euroleague.net/v3'
const COMPETITION_CODE = 'E' // E = EuroLeague, U = EuroCup
const CURRENT_SEASON = 2025 // 2024-25 season (E2025 code in API)

interface EuroLeaguePlayerStat {
  player: {
    code: string
    name: string
    age?: number
    team: {
      code: string
      name: string
    }
  }
  gamesPlayed: number
  pointsScored: number
  totalRebounds: number
  assists: number
}

// Team name mapping from EuroLeague API to our database
const TEAM_MAPPING: Record<string, string> = {
  'Real Madrid': 'real-madrid',
  'FC Barcelona': 'barcelona',
  'Fenerbahce Beko Istanbul': 'fenerbahce',
  'Panathinaikos AKTOR Athens': 'panathinaikos',
  'Olympiacos Piraeus': 'olympiacos',
  'AS Monaco': 'monaco',
  'Anadolu Efes Istanbul': 'efes',
  'Zalgiris Kaunas': 'zalgiris',
  'Virtus Bologna': 'virtus',
  'FC Bayern Munich': 'bayern',
  'Crvena Zvezda Meridianbet Belgrade': 'crvena-zvezda',
  'Dubai Basketball': 'dubai',
  'Valencia Basket': 'valencia',
  'Partizan Mozzart Bet Belgrade': 'partizan',
  'LDLC ASVEL Villeurbanne': 'asvel',
  'Maccabi Rapyd Tel Aviv': 'maccabi',
  'Maccabi Playtika Tel Aviv': 'maccabi',
  'EA7 Emporio Armani Milan': 'milan',
  'Hapoel Tel Aviv': 'hapoel',
  'Hapoel Yavne Tel Aviv': 'hapoel',
  'Hapoel IBI Tel Aviv': 'hapoel',
  'Baskonia Vitoria-Gasteiz': 'baskonia',
  'Paris Basketball': 'paris'
}

serve(async (req) => {
  const startTime = Date.now()
  let playersUpdated = 0
  const errors: string[] = []

  try {
    console.log('🏀 Starting EuroLeague data sync from official API...')

    // Delete old player data before syncing new season
    console.log('🗑️  Deleting old player data...')
    await supabase
      .from('player_round_lines')
      .delete()
      .like('round_id', 'el-round-%')

    await supabase
      .from('euroleague_players')
      .delete()
      .neq('id', '') // Delete all

    console.log('✅ Old data cleared')

    // Fetch player stats from EuroLeague API
    const apiUrl = `${EUROLEAGUE_API_BASE}/competitions/${COMPETITION_CODE}/statistics/players/traditional`
    const params = new URLSearchParams({
      seasonMode: 'Single',
      seasonCode: `E${CURRENT_SEASON}`,
      statisticMode: 'PerGame'
    })

    console.log(`📡 Fetching from: ${apiUrl}?${params.toString()}`)

    const response = await fetch(`${apiUrl}?${params.toString()}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      }
    })

    if (!response.ok) {
      throw new Error(`EuroLeague API returned ${response.status}: ${await response.text()}`)
    }

    const data = await response.json()
    const players: EuroLeaguePlayerStat[] = data.players || data.data || []

    console.log(`📊 Received ${players.length} players from API`)

    // Get current teams from database
    const { data: teams } = await supabase
      .from('euroleague_teams')
      .select('id, name')

    const teamNameToId = new Map<string, string>()
    teams?.forEach((team: { id: string; name: string }) => {
      teamNameToId.set(team.name, team.id)
    })

    // Process each player
    for (const playerStat of players) {
      try {
        const playerName = playerStat.player.name
        const teamName = playerStat.player.team.name

        const teamId = TEAM_MAPPING[teamName] ||
                       teamNameToId.get(teamName) ||
                       teamName.toLowerCase().replace(/\s+/g, '-')

        const playerId = `el-${CURRENT_SEASON % 100}-${playerName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`

        // Guess position based on stats (improved logic)
        const guessPosition = (stats: { points: number; assists: number; rebounds: number }): string => {
          const { points, assists, rebounds } = stats;

          // Point Guards: Primary ball handlers with high assists
          if (assists >= 4.0) return 'PG';
          if (assists >= 2.5 && rebounds < 3.5) return 'PG';

          // Centers: High rebounds and presence in paint
          if (rebounds >= 7.0) return 'C';
          if (rebounds >= 5.5 && assists < 1.5) return 'C';

          // Power Forwards: Strong rebounders
          if (rebounds >= 5.0 && rebounds < 7.0 && assists < 2.5) return 'PF';
          if (rebounds >= 4.0 && assists < 1.5) return 'PF';

          // Shooting Guards: Scorers with moderate assists
          if (assists >= 1.5 && assists < 4.0 && rebounds < 4.0) return 'SG';
          if (points >= 10 && rebounds < 4.0 && assists < 2.5) return 'SG';

          // Default to SF (versatile wing players)
          return 'SF';
        };

        const stats = {
          points: Math.round(playerStat.pointsScored * 10) / 10,
          assists: Math.round(playerStat.assists * 10) / 10,
          rebounds: Math.round(playerStat.totalRebounds * 10) / 10
        };

        // Get position from manual mapping, fallback to guess
        const position = PLAYER_POSITIONS[playerName] || guessPosition(stats);

        const playerData = {
          id: playerId,
          api_player_id: `euroleague-${CURRENT_SEASON}-${playerStat.player.code}`,
          name: playerName,
          team: teamName,
          team_id: teamId,
          position: position,
          nationality: 'Unknown', // API doesn't provide this
          season_averages: stats,
          last_updated: new Date().toISOString()
        }

        // Upsert player into database
        const { error } = await supabase
          .from('euroleague_players')
          .upsert(playerData, {
            onConflict: 'id',
            ignoreDuplicates: false
          })

        if (error) {
          console.error(`❌ Failed to save ${playerName}:`, error.message)
          errors.push(`${playerName}: ${error.message}`)
        } else {
          playersUpdated++
          if (playersUpdated % 20 === 0) {
            console.log(`✅ Processed ${playersUpdated} players...`)
          }
        }

        // Rate limiting - 10ms delay between players
        await new Promise(resolve => setTimeout(resolve, 10))

      } catch (error) {
        const errorMsg = `Error processing player: ${error instanceof Error ? error.message : String(error)}`
        console.error(`❌ ${errorMsg}`)
        errors.push(errorMsg)
      }
    }

    // Generate player prop lines for all rounds
    console.log('\n📈 Generating player prop lines for all rounds...')

    const { data: rounds } = await supabase
      .from('euroleague_rounds')
      .select('id')
      .order('round_number')

    if (rounds && rounds.length > 0) {
      // Delete existing lines
      await supabase
        .from('player_round_lines')
        .delete()
        .like('round_id', 'el-round-%')

      // Get all players with stats
      const { data: dbPlayers } = await supabase
        .from('euroleague_players')
        .select('id, season_averages')

      if (dbPlayers && dbPlayers.length > 0) {
        let linesCreated = 0

        for (const round of rounds) {
          const lines = []

          for (const player of dbPlayers) {
            const stats = player.season_averages as { points: number, assists: number, rebounds: number }

            // Helper function to always round to .5 (never .0)
            const roundToHalf = (num: number): number => {
              return Math.floor(num) + 0.5;
            };

            // Points line (92% of average, rounded to .0 or .5)
            lines.push({
              player_id: player.id,
              round_id: round.id,
              stat: 'points',
              line: roundToHalf(stats.points * 0.92),
              over_odds: 1.90,
              under_odds: 1.90
            })

            // Assists line (88% of average, rounded to .0 or .5)
            lines.push({
              player_id: player.id,
              round_id: round.id,
              stat: 'assists',
              line: roundToHalf(stats.assists * 0.88),
              over_odds: 1.90,
              under_odds: 1.90
            })

            // Rebounds line (90% of average, rounded to .0 or .5)
            lines.push({
              player_id: player.id,
              round_id: round.id,
              stat: 'rebounds',
              line: roundToHalf(stats.rebounds * 0.90),
              over_odds: 1.90,
              under_odds: 1.90
            })
          }

          // Insert lines in batches
          const { error: linesError } = await supabase
            .from('player_round_lines')
            .insert(lines)

          if (linesError) {
            console.error(`❌ Error creating lines for ${round.id}:`, linesError.message)
            errors.push(`Lines for ${round.id}: ${linesError.message}`)
          } else {
            linesCreated += lines.length
          }
        }

        console.log(`✅ Created ${linesCreated} player prop lines across ${rounds.length} rounds`)
      }
    }

    // Log sync result
    const executionTime = Date.now() - startTime
    await supabase.from('api_sync_logs').insert({
      api_source: 'euroleague_official_api',
      sync_type: 'players_and_lines',
      status: errors.length === 0 ? 'success' : 'partial',
      records_synced: playersUpdated,
      error_message: errors.length > 0 ? errors.slice(0, 5).join('; ') : null,
      execution_time_ms: executionTime
    })

    console.log(`\n✅ Sync complete!`)
    console.log(`👥 Players updated: ${playersUpdated}`)
    console.log(`⏱️  Execution time: ${executionTime}ms`)
    console.log(`❌ Errors: ${errors.length}`)

    return new Response(
      JSON.stringify({
        success: true,
        players_updated: playersUpdated,
        errors: errors.length > 0 ? errors.slice(0, 10) : null,
        execution_time_ms: executionTime
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('❌ Fatal error:', error)

    const errorMessage = error instanceof Error ? error.message : String(error)

    await supabase.from('api_sync_logs').insert({
      api_source: 'euroleague_official_api',
      sync_type: 'players_and_lines',
      status: 'error',
      records_synced: playersUpdated,
      error_message: errorMessage,
      execution_time_ms: Date.now() - startTime
    })

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        players_updated: playersUpdated
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
