# CLAUDE.md

This file orients Claude Code when working in this repository. For user-facing feature docs see [README.md](README.md).

## What this is

UnJ is a When2Meet-style group scheduling app. Participants paint their availability on a 30-min grid; everyone's input is aggregated into a heatmap. No accounts — identity is just a name (optionally bcrypt-protected). Korean UI throughout.

- **Next.js 15 App Router**, React 19, all client components use `"use client"`.
- **styled-components** for styling (SSR via `src/lib/registry.js`); theming through CSS variables in `src/styles/GlobalStyles.js` keyed off `data-theme`.
- **MongoDB** (native driver, no ODM). Single client singleton in `src/lib/mongodb.js`, DB name is hardcoded `"unj"`.
- Deployed at `www.unj.kr`.

## Commands

```bash
npm run dev      # Turbopack dev server on :3000
npm run build    # production build
npm run start    # serve production build
npm run lint     # next lint (ESLint)
```

No test suite exists. Verify changes by running the app. Requires `MONGODB_URI` in `.env.local`.

## Architecture & data flow

Two MongoDB collections in db `unj`:

- **`events`**: `{ name, dates: [Date], startTime, endTime, adminToken (UUID), anonymous, createdAt }`
- **`participants`**: `{ eventId: ObjectId, name, aliasIndex?, password (bcrypt|null), availability: [{dateIdx, hour, minute, status}], createdAt, updatedAt }`

`status` is `"available"` (가능) or `"maybe"` (조정가능). A participant is unique per `(eventId, name)`.

### Key conventions

- **Slot identity**: event grids key slots by `dateIdx` (0-based index into `event.dates`). The personal "내 일정" grid keys by `dayOfWeek` (0=Mon … 6=Sun, Korean order). `src/lib/mySchedule.js` converts between them — note the `(getDay() + 6) % 7` shift since JS `getDay()` is 0=Sun.
- **`AvailabilityGrid`** is shared via the `mode` prop: `"event"` (uses `dateIdx`, real dates) vs `"personal"` (uses `dayOfWeek`, fixed 7 cols). Also takes `readOnly`, `hideHeader`, `onReadOnlyClick`.
- **Admin auth** is capability-based: the `adminToken` UUID lives in the event doc and in the URL query (`?admin=<token>`). Server routes (`PATCH /api/events/[id]`, `DELETE …/participants/[participantId]`) re-validate it by querying `{ _id, adminToken }`. There is no session/cookie auth.
- **Anonymous mode**: participants get `aliasIndex` (assigned by join order = current participant count). `src/lib/animals.js` maps it to `🦊여우` style aliases. The participants GET route hides real names unless the requester passes a matching `adminToken` (admin) or their own `participantId` (self). Real-name display is `getDisplayName` → `🦊여우(홍길동)`.
- **Persistence on the client** is localStorage-heavy:
  - `unj-participant-{eventId}` → `{ name }`, auto-rejoins on revisit.
  - `unj-my-schedule` → personal day-of-week availability.
  - `unj-visited-events` / `unj-event-schedule-{eventId}` → recent rooms & per-room saved schedules.
  - `theme` → dark/light.
- **Saving availability**: edit → `onChange` → 500ms debounce → `POST …/participants`. Unmount flushes pending data via `navigator.sendBeacon`. A 5s poll refreshes other participants but never overwrites the local user's own slots.

### Async params

This is Next 15 — route handlers `await params` (`const { id } = await params`) and the client page uses `use(params)`. Keep that pattern.

## Conventions to match

- Comments, labels, and user-facing strings are in **Korean**. Match the surrounding tone.
- Styled-components use transient props (`$active`, `$open`, `$selected`) so they don't leak to the DOM — keep the `$` prefix.
- CSS variables only for colors (`var(--accent)`, `var(--bg-card)`, etc.). Don't hardcode theme colors except the fixed status colors `#4CAF50` (green) / `#F5A623` (orange) used in grids.
- API routes return Korean error messages and use `NextResponse.json(...)` with explicit status codes. Wrap handlers in try/catch and `console.error` on failure, matching existing routes.

## Client-side persistence wiring

The localStorage tracking is wired from `src/app/[eventId]/page.js`:

- On successful join (`joined && event`), an effect calls `addVisitedEvent(...)` to record the room in `unj-visited-events`.
- Another effect calls `saveEventSchedule(...)` whenever `myAvailability` changes, persisting the user's slots per room (`unj-event-schedule-{eventId}`). `ScheduleImportExport`/`VisitedEventsSection` read these.
- `ScheduleImportExport` is passed `eventId` so it can exclude the current room from import sources.

## Admin participant deletion

`DELETE …/participants/[participantId]` is wired to a red `×` badge on each participant tag, rendered only when `adminToken` is present. It `window.confirm`s, then removes the participant from local state on success. The separate `−` badge is unrelated — it's a local-only hide (`hiddenNames`, by `_id`) available to everyone.

## Files map

- `src/app/page.js` — home: `CreateEventForm` + `MyScheduleSection` + `VisitedEventsSection`.
- `src/app/[eventId]/page.js` — the main event screen: join flow, password modal, admin panel, both grids, mobile tab toggle, participant tags. Large file; most app logic lives here.
- `src/app/api/events/**` — REST handlers (see README for the table).
- `src/lib/animals.js` — anonymous alias source of truth (`MAX_ANONYMOUS_PARTICIPANTS = ANIMALS.length`).
- `src/lib/mySchedule.js` — dayOfWeek↔dateIdx conversion + merge/replace import logic.
