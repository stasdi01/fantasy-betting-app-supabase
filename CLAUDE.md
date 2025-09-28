# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm start` - Run development server on http://localhost:3000
- `npm run build` - Build for production
- `npm test` - Run tests in watch mode

### Environment Variables
Required environment variables in `.env.local`:
- `REACT_APP_SUPABASE_URL` - Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY` - Supabase anonymous key

## High-Level Architecture

### Tech Stack
- React 19.1.1 with Create React App
- React Router DOM for routing
- Supabase for backend (authentication, database)
- Lucide React for icons

### Application Structure

**Betify** is a sports prediction platform with user authentication, performance tracking, and competitive league features. The app consists of:

1. **Authentication System** (`src/context/AuthContext.js`)
   - Supabase-based auth with username/password login
   - User profiles stored in `users` table
   - Premium user support with role-based access

2. **Budget Management** (`src/hooks/useBudget.js`)
   - Monthly budget tracking system with percentage-based "virtual" budgets
   - Separate tracking for BetLeague (monthly) and MyTeam League (per-round)
   - Custom league budgets for user-created leagues
   - Performance tracking with -100% blocking mechanism

3. **Core Features**:
   - **Matches** (`src/pages/Matches.js`) - Sports prediction interface with cart system
   - **Profit** (`src/pages/Profit.js`) - Performance tracking and prediction history
   - **MyTeam** (`src/pages/MyTeam.js`) - Fantasy team building with player performance predictions
   - **Public League** (`src/pages/PublicLeague.js`) - Free league competitions (BetLeague & MyTeam)
   - **Your Leagues** (`src/pages/YourLeagues.js`) - User-created custom leagues
   - **Leaderboard** (`src/pages/Leaderboard.js`) - Overall application leaderboard
   - **VIP Team** (`src/pages/VipTeam.js`) - Premium feature showing top players' predictions
   - **Premium** (`src/pages/Premium.js`) - Subscription tiers and features

4. **Data Layer**:
   - Mock data files in `src/data/` for development/testing
   - Supabase integration for real data persistence
   - Custom hooks for data management (`useBudget`, `useFreeLeague`, `useVipPools`)

5. **UI Components**:
   - Shared layout with sidebar navigation (`src/components/Layout.js`)
   - PredictionCart component (`src/components/PredictionCart.js`) - replaces BettingCart
   - Toast notification system (`src/components/Toast/`)
   - Loading states and error handling
   - Responsive design with CSS custom properties

### Key Concepts

**Budget System**: Users have percentage-based "virtual" budgets that increase/decrease based on prediction outcomes. When profit reaches -100%, predictions are blocked.

**League System**:
- **BetLeague**: Monthly competitions for match predictions with Bronze/Silver/Gold/Platinum/Diamond ranks
- **MyTeam League**: Season-long fantasy competitions with player performance predictions
- **Custom Leagues**: User-created leagues with customizable rules and participation limits

**Premium Tiers**:
- **FREE**: Basic predictions, 7-day history, public leagues only
- **PRO** ($5): Custom leagues (max 2, 10 users), full history, premium badge, 3 teams per MyTeam league
- **MAX** ($10): Unlimited custom leagues (100 users), VIP Team access, unlimited MyTeam teams

**Cart System**: Global prediction cart state managed in App.js using PredictionCart component.

### Database Schema (Supabase)
- `users` - User profiles and subscription roles
- `monthly_budgets` - BetLeague and MyTeam profit tracking per month
- `myteam_round_budgets` - Per-round budget tracking for MyTeam league
- `custom_league_budgets` - Custom league budget tracking
- `custom_leagues` - User-created league configurations
- `league_memberships` - User league memberships
- `predictions` - User prediction history and results

### Error Handling
Centralized error handling in `src/utils/errorHandler.js` with user-friendly message formatting and logging.

### Styling
- CSS custom properties for theming (`src/styles/theme.css`)
- Component-specific CSS files
- Purple/black color scheme
- Mobile-responsive design

### State Management
- React Context for authentication
- Custom hooks for data fetching and state
- Event-driven updates using window events for cross-component communication