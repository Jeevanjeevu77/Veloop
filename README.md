# VELOOP Rewards — Level-Up Dashboard

A full-stack, simplified rewards/loyalty dashboard: users sign up, log in, and see their
level, XP progress, next-level reward, a level roadmap, one mini-game ("Catch the Coins"),
and daily XP-earning tasks.

This is a from-scratch redesign inspired by a reference dashboard image (colors and dark
theme only) — the layout, component set, and interactions were rebuilt to be simpler and
less visually dense than the reference.

## Project Overview

- **Frontend:** React 18 + Vite, Bootstrap 5 + CSS Modules, React Router, Axios
- **Backend:** Node.js + Express + SQLite (via `better-sqlite3`), JWT authentication
- **Auth:** Email/password signup & login, bcrypt-hashed passwords, JWT stored client-side

## Level & XP System

Each user starts at **Level 1 / 0 XP**. XP is earned from the mini-game and from daily
tasks. Level thresholds and rewards are configured server-side in
`server/db/db.js` (`level_config` table) and are currently **demo/dummy values** —
levels 1 through 8, with made-up XP thresholds and VE/Gem reward amounts. Replace these
once real reward values are approved.

The dashboard always shows:
- Current level & XP
- XP required for the next level, and how much is left
- The next level's reward (locked/preview state)
- A roadmap of completed / current / locked levels

## Game Concept — "Catch the Coins"

A 15-second round where coins fall down a play area and the player clicks/taps them
before they reach the bottom.

- **Objective:** catch as many coins as possible in 15 seconds
- **Scoring:** 1 point per coin caught
- **Reward:** XP = score × 2, capped at 30 XP per play (demo value)
- **Limit:** 3 plays per day per user, enforced server-side
- **States:** Start (rules) → Playing (timer + live score) → Result (score, XP earned,
  replay or "come back tomorrow")

This is a skill-based catch game — not a chance-based or gambling mechanic.

## Earning Features

Three simple daily tasks, each claimable once per day (server-enforced):
- Daily Login — +10 XP
- Complete Profile — +20 XP
- Watch a Video — +15 XP

These are demo task concepts; wire them to real product events (actual login tracking,
profile completion, video-watch completion) before shipping.

## Tech Stack

- React 18, Vite, React Router 7, Axios, react-icons, Bootstrap 5, CSS Modules
- Node.js, Express, better-sqlite3, jsonwebtoken, bcryptjs, cors, dotenv

## Folder Structure

```
veloop-rewards/
├── client/                      React + Vite frontend
│   ├── src/
│   │   ├── api/                 axios instance + endpoint functions
│   │   ├── components/          Navbar, LevelHero, LevelRoadmap, PlayAndEarn
│   │   │                        (GameStart/GamePlay/GameResult), EarnMoreXP,
│   │   │                        XPActivity, LevelUpModal, common/ (Skeleton,
│   │   │                        ErrorState, ProtectedRoute)
│   │   ├── hooks/                useAuth (context), useDashboard
│   │   ├── pages/                Login, Signup, Dashboard
│   │   ├── styles/                theme.css (design tokens), auth.module.css
│   │   ├── App.jsx                routes
│   │   └── main.jsx                app entry point
│   └── .env.example
├── server/                      Express + SQLite backend
│   ├── db/                      db.js (schema+seed), progress.js (level/XP logic)
│   ├── middleware/               auth.js (JWT verification)
│   ├── routes/                    auth.js, dashboard.js, tasks.js, game.js
│   ├── index.js                   server entry point
│   └── .env.example
└── README.md
```

## Component Architecture

Each dashboard section is a self-contained component with its own CSS Module:
`LevelHero` (level badge, animated XP bar, next-reward card), `LevelRoadmap` (stepper),
`PlayAndEarn` (a small state machine: loading → idle/unavailable → playing → result),
`EarnMoreXP` (task cards), `XPActivity` (recent activity feed with an empty state), and
`LevelUpModal` (celebration overlay shown when a game result or task claim causes a
level-up).

## Installation & Setup

### 1. Backend

```bash
cd server
npm install
cp .env.example .env      # edit JWT_SECRET to a long random string
npm run dev                # starts on http://localhost:5000
```

The SQLite database file (`server/db/veloop.sqlite`) and its schema/seed data are
created automatically on first run — no manual DB setup needed.

### 2. Frontend

In a second terminal:

```bash
cd client
npm install
cp .env.example .env      # defaults to http://localhost:5000/api
npm run dev                # starts on http://localhost:5173
```

Open `http://localhost:5173`, sign up for an account, and you're in.

### 3. Production build

```bash
cd client
npm run build              # outputs client/dist
```

Serve `client/dist` from any static host, and run `server/index.js` (e.g. via `node
index.js` or a process manager like pm2) as the API. Set `CLIENT_ORIGIN` in the server's
`.env` to your deployed frontend URL, and `VITE_API_URL` in the client's `.env` to your
deployed API URL before building.

## Responsive Behavior

Mobile-first: single-column layout below ~860px, a two-column layout for the
Play & Earn / XP Activity row and a light multi-column grid for the Earn More XP cards
above that. Tested down to 360px width.

## Animation Details

- XP bar and the next-reward mini progress bar animate in from 0% on dashboard load
- Falling coins in the mini-game use a linear CSS keyframe animation
- The level-up modal uses a subtle fade + scale-in entrance (no confetti)
- `prefers-reduced-motion` is respected — animations are shortened to near-zero for users
  who request reduced motion

## States Implemented

- **Loading:** skeleton placeholders for the hero, roadmap, game, and task cards
- **Empty:** "Your XP journey starts here" message when there's no XP activity yet
- **Error:** "Unable to Load Level Progress" with a Retry button (no raw errors shown)
- **Level-Up:** celebration modal with the new level and reward

## Environment Variables

**server/.env**
| Variable | Description |
|---|---|
| `PORT` | Port the API listens on (default 5000) |
| `JWT_SECRET` | Secret used to sign JWTs — set this to a long random string |
| `CLIENT_ORIGIN` | Allowed CORS origin for the frontend |

**client/.env**
| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API |

Never commit real `.env` files — only `.env.example` is tracked in git.

## Author

Built with ❤️ by Sinchana.
