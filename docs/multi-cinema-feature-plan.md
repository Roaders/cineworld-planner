# Multi-Cinema + Multi-Chain Feature Plan

This document captures design decisions and partially-applied work that was reverted on
2026-04-27, so it can be re-applied later. The backend `ICinemaChainProvider` refactor
(in `src/node/server/providers/`) was kept; everything below is what still needs to be
done.

## Goals

1. **Multi-cinema selection.** User selects multiple cinemas on the list page, then sees
   a consolidated view across all of them.
2. **Consolidated film list.** Films from all selected cinemas, deduplicated by film id.
3. **Consolidated event/Gantt list.** Times for a selected film from every selected cinema,
   each row showing which cinema (and chain) the showing is at.
4. **Chain logos.** Display a small chain-brand logo in the cinema list and on each event
   row in the times list.
5. **Multi-chain readiness.** Architecture should accommodate a second chain (Odeon was
   the trigger) without further refactor.

## Reverted Code Changes (re-apply when ready)

### Backend
- **`src/contracts/contracts.ts`** — add `chainId: string` to `ICinema`.
- **`src/node/server/providers/cineworld-provider.ts`** — `processRawHtml` should accept
  `chainId` and stamp it onto every cinema:
  ```ts
  function processRawHtml(rawHtml: string, chainId: string): ICinema[] {
      // ... existing regex extraction ...
      const cinemas = JSON.parse(sitesListString) as Array<Omit<ICinema, 'chainId'>>;
      return cinemas.map(cinema => ({ ...cinema, chainId }));
  }
  ```
  And `getCinemas()` passes `this.chainId` to it.

### Frontend
- **Rename `CineworldService` → `CinemaService`** (file:
  `src/app/services/cineworld.service.ts` → `cinema.service.ts`). Update imports in
  `app.module.ts`, `cinema-list.component.ts`, `cinema.component.ts`. Add a method
  `getCinemasAsync(externalCodes: string[]): Observable<ICinema[]>` that filters the
  cached list to the requested codes (preserving order, dropping unknowns).

- **New `src/app/services/cinema-chain-registry.service.ts`** providing per-chain UI
  metadata:
  ```ts
  export interface ICinemaChainPresenter {
      readonly chainId: string;
      readonly displayName: string;       // 'Cineworld'
      readonly homepageUrl: string;       // 'https://www.cineworld.co.uk'
      readonly logoUrl: string;           // 'assets/logos/cineworld.svg'
      displayAttribute(attribute: FilmAttribute): { icon: string; description: string } | undefined;
  }
  ```
  Move the existing `displayAttribute` switch from `attribute-helper.ts` onto the
  Cineworld presenter. The registry exposes `get(chainId)` with a fallback presenter for
  unknown chains.

## Open Design Decisions

These need answers before re-applying:

### 1. URL shape for multi-select
Options:
- Path with comma list: `/cinemas/001,002,003/2026-04-28` — clean, but commas are URL-safe only by convention.
- Query string: `/cinemas?ids=001,002&date=2026-04-28` — Angular hash router handles fine.
- Future-proof: cinema IDs must include chain prefix (e.g. `cineworld:001,odeon:peterborough`) once Odeon is wired up — externalCodes will collide across chains.

### 2. Backwards compatibility
Old `/cinema/:externalCode` URLs that users may have bookmarked. Keep them as a redirect
to the new `/cinemas/:code` route, or hard-break.

### 3. URL update on toggle
Should toggling selection on the list page push to the URL bar, or only update on
"View Films"? Affects browser-back behaviour and bookmarkability of partial selections.

### 4. Backend fan-out
Selecting N cinemas currently means N parallel `/cinema/:cinema/listings/:date` calls.
Optional optimisation: a combined `/cinemas/:codes/listings/:date` endpoint that
fans out server-side and returns merged results (still leveraging the existing per-cinema
cache). Cleaner client code; more work to add.

### 5. Cross-chain film dedup
A film shown at both Cineworld and Odeon will have **different chain-specific filmIds**.
Need a strategy:
- Option A: Match on title (fragile, edge cases like "The Brutalist" vs "The Brutalist (2024)").
- Option B: Resolve to TMDB/IMDb ID via a lookup service (more reliable, requires external API).
- Option C: Keep them separate — one row per chain per film. Simplest but uglier UX.

Decision deferred until Odeon is implemented; until then dedup-by-`filmId` is correct
because all cinemas in scope are Cineworld.

### 6. Failure handling
If 1 of N cinema-listings calls fails, do we:
- Show partial results + a warning banner ("Couldn't load times for X")?
- Fail the whole page?
Recommendation: partial results.

### 7. Per-event display density
With N cinemas × M films = potentially many event rows. Consider:
- Grouping events by cinema collapsibly, OR
- A new filter widget to toggle individual cinemas on the events page.

### 8. Itinerary across cinemas
`IItineraryItem` doesn't currently surface cinema. With multi-cinema we should add it,
and consider warning the user when selected events are at different physical cinemas
(travel time between them may not fit the existing buffer/break model).

### 9. Favorites migration
`PreferencesService.getFavoriteCinemaIds()` returns `string[]` of `externalCode`. With
multi-chain it must store `{chainId, externalCode}` pairs. On load, treat any legacy
plain-string entries as `cineworld:<code>`.

### 10. Logos
Need brand assets per chain. SVG preferred. Trademark consideration: a planner that
links to chain sites is generally fine to use chain logos for navigation/identification.

## Implementation Order (proposed)

1. Re-apply backend `chainId` stamping.
2. Re-apply `CineworldService` → `CinemaService` rename + add `getCinemasAsync`.
3. Add `CinemaChainRegistry` (UI) with Cineworld presenter; move `displayAttribute` onto it.
4. Drop a Cineworld logo SVG into `src/assets/logos/`.
5. Convert `CinemaListComponent` to multi-select (toggle state, "View Films" button,
   logo badge per cinema).
6. New route(s) — once URL shape is decided.
7. Convert `CinemaComponent` → `CinemasComponent`: parallel listings load with `forkJoin`,
   merge films by id, concatenate events.
8. Update `EventListComponent` to look up `cinemaId → cinema → chain → presenter` and show
   logo + cinema name on each row.
9. Update `CinemaHeaderComponent` to render multiple cinema cards/badges.
10. Migrate `PreferencesService` favorites to composite keys.
11. (Later, when Odeon arrives) Cross-chain film dedup.

## Estimated Effort

- Steps 1–4: 0.5 day
- Steps 5–7: 2 days
- Steps 8–9: 1 day
- Step 10: 0.5 day
- Step 11 (Odeon scope): 1–2 extra days

**Total for multi-cinema (Cineworld only): ~4 days.**
**Adding Odeon on top: ~5–7 days from this point.**
