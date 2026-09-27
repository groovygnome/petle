<p align="center">
  <img src="src/assets/petlelogo.png" alt="petle" width="180" />
</p>

# petle

**A daily guessing game for Ariana Grande's discography — Wordle rules, Heardle senses.**

Every day the server picks one song out of the entire catalogue and locks it in for
everybody. You get eight guesses. Each wrong guess flips over a row of tiles telling you
how close you were, and the further you get without solving it, the more the game gives
away: first the album art, then three lines of lyrics, then a ten-second audio clip.

Wrong about something? The tiles point the way — `↑` or `↓` — and turn amber when you're
knocking on the door (within two albums, two track positions, or thirty seconds).

---

## Three ways to play

| Route        | Mode         | Guesses | What you're solving                     |
| ------------ | ------------ | ------- | --------------------------------------- |
| `/`          | **Petle**    | 8       | The daily song. Same answer for everyone, all day. |
| `/coverArt`  | **Cover Art** | 5      | Which album is this? The cover starts blurred and colour-inverted, and sharpens as you miss. |
| `/infinite`  | **Infinite** | 8       | A new random song every round — no waiting for tomorrow. |

Petle and Cover Art are the daily modes: your guesses, streak, and win/loss stats are
stashed in `localStorage` and survive a refresh. Come back tomorrow and the board resets
itself (streak intact, if you earned it). Infinite is the practice room — endless rounds,
no stakes.

### How a guess is scored

Each attempt row flips five tiles:

| Tile       | Exact match | Close call                     |
| ---------- | ----------- | ------------------------------ |
| Title      | right song  | —                              |
| Album      | right album | same album *era* (within 2)    |
| Track no.  | right slot  | within 2 tracks                |
| Length     | exact time  | within 30 seconds              |
| Features   | full match  | at least one shared feature    |

Album and track tiles also show `↑` / `↓` so you can hunt by binary search instead of
guessing blind. Albums are ordered chronologically, so "two albums too low" is a real
hint.

### Hints

Hints unlock as you spend guesses — they cost nothing extra, they're just gated behind
progress. Each card says how many guesses are left until it opens:

- **after 3 guesses** → album art hint
- **after 5 guesses** → three lines of the lyric
- **after 7 guesses** → 10 seconds of the Deezer preview (the last-gasp lifeline)

---

## Built with

**Frontend** — [React 19](https://react.dev), [Vite 8](https://vite.dev),
[React Router 7](https://reactrouter.com), plain CSS with a hand-rolled flip animation and
a bundled `stixtwotext` display font.

**Backend** — [Express 4](https://expressjs.com) + [pg](https://node-postgres.com)
(PostgreSQL), acting less as an app server and more as three thin services:

1. **Dailies** — read/write today's answer so every visitor gets the same puzzle.
2. **Deezer proxy** — `api.deezer.com/track/:id` for the preview audio, CORS-free.
3. **Lyrics proxy** — pulls a song's lyrics and splits them into lines for the hint.

In dev, Vite proxies `/api`, `/deezer`, and `/lyrica` to `localhost:3001`
(see `vite.config.js`), so the frontend never talks to the origin directly.

---

## Getting started

### Prerequisites

- Node.js 20+ (the server script uses `--env-file`)
- A PostgreSQL database

### 1. Install

```bash
# frontend
npm install

# backend (separate package)
cd server && npm install && cd ..
```

### 2. Configure the database

Create a `server/.env` with your connection string:

```bash
SQL_URL=postgres://user:password@localhost:5432/petle
```

The queries expect two tables with a date column `dt` and an answer column `answer`
(answers are stored as `"<albumIndex>#<trackOrCoverIndex>"`, e.g. `3#7`):

```sql
CREATE TABLE dailies (dt DATE PRIMARY KEY, answer TEXT NOT NULL);
CREATE TABLE covers  (dt DATE PRIMARY KEY, answer TEXT NOT NULL);
```

### 3. Run it

Two terminals:

```bash
# terminal 1 — API on :3001
cd server
npm run local

# terminal 2 — frontend on :5173
npm run dev
```

Open <http://localhost:5173>. The first visitor of the day rolls the answers and writes
them to the database; from then on, everyone gets the same puzzle until midnight UTC.

---

## Project structure

```
petle/
├── src/
│   ├── pages/
│   │   ├── Petle.jsx        # daily song mode (the main game)
│   │   ├── CoverArt.jsx     # daily album cover mode
│   │   └── Infinite.jsx     # endless practice mode
│   ├── components/
│   │   ├── Attempt.jsx      # the flipping guess tiles (song + cover variants)
│   │   ├── AutoComplete.jsx # prefix-matching song search
│   │   ├── AlbumList.jsx    # album filter / album picker dropdown
│   │   └── Hint.jsx         # cover · lyric · audio hint cards
│   ├── styles/              # Petle.css, Attempt.css, CoverArt.css
│   └── assets/
│       └── ariana.json      # the whole discography: albums → covers → tracks
├── public/assets/           # cover art images, grouped by album
├── server/
│   ├── index.js             # express app: deezer + lyrics proxies, mounts /api
│   ├── routes/dailies.js    # GET /:db/:date · POST /:db/:date/:answer · DELETE /:db/delete
│   ├── controllers/         # request → db call → json
│   └── db/                  # pg pool + query helpers
└── vite.config.js           # dev proxy for /api, /deezer, /lyrica
```

### The discography file

Everything hangs off `src/assets/ariana.json` — an array of eight albums, each with
`title`, `year`, `covers[]`, and `tracks[]`. Every track carries `trackTitle`,
`trackFeatures`, `trackLength` (seconds), and `deezerId`. Album and track array indices
*are* the game's coordinate system: an answer is just `"albumIndex#trackIndex"`, which
makes guessing, comparing, and persistence all fall out of string keys.

Want to add an album? Append an entry to the JSON, drop its covers into
`public/assets/`, and you've just widened the pool.

---

## Scripts

| Where    | Command        | What it does                          |
| -------- | -------------- | ------------------------------------- |
| `/`      | `npm run dev`  | Vite dev server with HMR              |
| `/`      | `npm run build`| Production build into `dist/`         |
| `/`      | `npm run lint` | ESLint (React hooks + refresh rules)  |
| `/`      | `npm run preview` | Serve the production build         |
| `/server`| `npm run local`| Start Express with `server/.env`      |

---

## Notes

- The **"delete all db entries"** buttons on the daily boards are dev conveniences —
  they wipe `dailies` / `covers` so you can force a fresh roll.
- Streaks, per-slot win counts, and overall stats live in `localStorage` under plain
  keys (`streak`, `1`–`8`, `X`, plus `cover*` variants for Cover Art). No accounts, no
  server-side stats — clearing site data resets your record.
- Daily state keys off `YYYY-MM-DD` in UTC.
