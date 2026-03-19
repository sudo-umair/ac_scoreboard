# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AC Scoreboard is a FiveM resource (GTA5 multiplayer mod) that provides a customizable scoreboard UI. It replaces the default framework scoreboard with a NUI (Chromium-based UI) overlay showing player lists, job group counts, and status indicators.

## Architecture

This is a **FiveM resource** using the Lua runtime with Lua 5.4 features (increment operators like `+=`, safe navigation `?.`). It depends on `ox_lib` for callbacks, locale, and utilities.

### Entry Points
- `fxmanifest.lua` — Resource manifest defining dependencies, scripts, and files
- `resource/server.lua` — Server entry: version check, dependency check, loads `modules/server/main.lua`
- `resource/client.lua` — Client entry: loads `modules/client/main.lua` and `modules/client/setup.lua`
- `config.lua` — User-facing configuration (returns a Lua table, not a module with side effects)

### Client-Server Split
- **Client** (`modules/client/`): Handles NUI open/close, sends config and locale data to the web UI via `SendNUIMessage`, uses `lib.callback.await` to fetch data from server
- **Server** (`modules/server/`): Provides scoreboard data via `lib.callback.register`. Sections (players, groups, indicators) are conditionally loaded based on `config.visibleSections`

### Framework Adapters
`modules/server/sections/groups/` contains per-framework adapters for counting players in job groups:
- `esx.lua` — es_extended
- `qb.lua` — qb-core
- `qbx.lua` — qbx_core
- `ox.lua` — ox_core

Each adapter exports `getAllGroupsCounts()` and `getGroupsCount(groups, includeOffDuty)`. The framework is auto-detected at startup by `modules/server/utils.lua`.

### NUI (Web UI)
- Pre-built web UI lives in `web/build/` — the source is not in this repo (only compiled assets)
- Communication: Client Lua sends messages via `SendNUIMessage` with `action` field (`setVisible`, `setData`, `setConfig`, `setLocales`)
- NUI sends callbacks back via `RegisterNUICallback` (`ready`, `close`, `copyServerId`)

### Exports & Events
- `setIndicatorState(id, state)` — Export and event to set a status indicator's state
- `forceIndicatorState(id, state)` — Export and event to override group-triggered indicator state
- ACE permission `scoreboard.show.<section>` controls per-player section visibility when `visibleSections` value is `'limited'`

### Locales
JSON locale files in `locales/` (en, cs, sk). Keys prefixed with `ui.` are forwarded to the NUI.

## Development Notes

- No build system for Lua — files are loaded directly by FiveM's runtime
- The web UI is pre-built; source is not included in this repository
- `ox_lib` >= 3.27.0 is a hard dependency
- Uses Lua 5.4 syntax (`lua54 'yes'` in manifest) — compound assignment operators and safe navigation are valid
- Config values use `'limited'` (string) as a special value for ACE-permission-gated visibility, in addition to `true`/`false`
