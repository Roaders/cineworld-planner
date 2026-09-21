# Film Finder Design

## Background

This document captures the design discussion for [GitHub issue #59](https://github.com/Roaders/cineworld-planner/issues/59).

Cineworld advertises films nationally, but its website does not provide a simple way to select a film and see every cinema where it is actually scheduled. The requested Film Finder should show all films playing across Cineworld during the next seven days, then show the cinemas and dates available for a selected film.

## User experience

Add a Film Finder page that:

1. Lists scheduled films alphabetically.
2. Allows one film to be selected.
3. Shows every cinema screening that film.
4. Shows clickable dates beneath each cinema, limited to dates on which that film is playing there.
5. Opens the existing listings route, `/cinema/:externalCode/:selectedDate`, when a date is selected.

The cinema results should behave like the existing cinema list:

- favourites appear first;
- cinemas are alphabetical by default;
- users can optionally sort by distance from their current location;
- distance and bearing can be displayed after geolocation succeeds; and
- geolocation errors should return the list to alphabetical order and display an error.

The existing favourite IDs, cinema coordinates, distance calculation, and route format can be reused. The sorting and geolocation behaviour currently lives in `CinemaListComponent`; implementation should share or extract the coherent reusable behaviour rather than maintain two divergent copies.

The seven displayed dates should use the same labels as the existing listings selector: `Today`, followed by abbreviated weekday names. A date link should remain an ordinary router link so it is keyboard accessible and can be opened in a new tab.

## Verified Cineworld API behaviour

The current application uses Cineworld's undocumented Gatsby schedule endpoint:

```text
GET https://www.cineworld.co.uk/api/gatsby-source-boxofficeapi/schedule
```

It supports both multiple cinemas and a multi-day range. Multiple cinemas must be encoded by repeating the `theaters` query parameter:

```text
?from=2026-09-21T03:00:00
&to=2026-09-28T03:00:00
&theaters={"id":"X079Z","timeZone":"Europe/London"}
&theaters={"id":"X0FR5","timeZone":"Europe/London"}
```

The values above are URL-encoded on the wire. Supplying a JSON array of theatres was tested and returned HTTP 500. Repeating the parameter returned schedules keyed by cinema ID.

Live checks performed on 21 September 2026 produced these results:

| Request | Result | Uncompressed JSON size | Duration |
| --- | ---: | ---: | ---: |
| All 87 cinemas, one day | 34 films, 2,902 showtimes | 2,151,596 bytes | about 1.0 seconds |
| All 87 cinemas, seven days | 47 films, 16,691 showtimes | 12,052,571 bytes | about 4.8 seconds |

All 87 requested cinemas were returned in both checks. These measurements demonstrate feasibility but are not an API contract or performance guarantee.

Film metadata is obtained from the existing movies endpoint. It accepts repeated movie IDs, so all unique missing films can normally be loaded in one additional request:

```text
GET https://www.cineworld.co.uk/api/gatsby-source-boxofficeapi/movies
    ?basic=false
    &castingLimit=3
    &ids=film-a
    &ids=film-b
```

Therefore, a cold Film Finder load can normally use two upstream requests: one schedule request and one movie-details request. It does not require one request per cinema.

Because this is an undocumented endpoint, request encoding and response validation must be covered by tests and remain isolated in the server integration layer.

## Current implementation constraints

`CinemaController` currently:

- caches the cinema list for one hour;
- caches a complete mapped listings response by cinema and date for ten minutes;
- has one shared cache capped at 500 entries;
- fetches a single cinema and date on a listings cache miss;
- fetches movie metadata as part of that same operation; and
- limits each upstream response to 2 MiB.

A complete seven-day Film Finder represents 87 × 7 = 609 cinema/date entries. The current cache would evict at least 109 entries while populating a cold week. Even the observed one-day response slightly exceeds the existing 2 MiB Axios response limit, while the observed week is about 12 MiB.

The cache must therefore be separated by responsibility and sized for this access pattern. Merely adding another aggregate response cache would not meet the requirement that subsequent ordinary listings requests reuse Film Finder data.

## Proposed server architecture

Use three logical caches:

1. **Cinema cache** — the existing cinema list, keyed as it is today.
2. **Schedule cache** — events keyed by cinema ID and business date.
3. **Film cache** — mapped film details keyed by film ID.

The schedule cache should explicitly store successful empty results. A cinema/date pair with no showtimes must be distinguishable from a pair that has never been loaded.

The cache should also share in-flight loads. If Film Finder and an ordinary listings request need the same uncached data concurrently, both should await the same operation rather than issue duplicate Cineworld requests.

The initial schedule expiry can remain ten minutes to preserve current freshness. Film metadata changes less frequently and can use a longer expiry, such as 24 hours. Expired schedule entries should be removed regularly, and the schedule capacity must comfortably exceed 609 entries; approximately 1,000 entries plus expiry cleanup would hold a full week and a small overlap with recently expired dates. These values should remain named server constants.

### Loading missing schedules

The loader accepts a set of requested cinema IDs and dates:

```text
ensureSchedules(cinemaIds, dates)
```

It then:

1. Removes cinema/date pairs that have fresh schedule entries.
2. Groups each date by the set of cinemas missing that date.
3. Combines adjacent dates when their missing cinema sets are identical.
4. Makes one Cineworld schedule request for each resulting cinema/range group.
5. Validates the complete response before changing the cache.
6. Splits the response into individual cinema/date entries, including successful empty entries.

This grouping avoids loading data that is already cached without attempting to encode an arbitrary cinema/date matrix that Cineworld's endpoint does not support.

It optimises the important cases naturally:

- On a cold cache, all cinemas are missing the same seven dates, producing one seven-day request.
- As the window rolls forward, all cinemas are normally missing only the new seventh date, producing one one-day request.
- If previous individual listings requests created irregular cache coverage, only compatible missing pairs are combined.

### Loading missing films

After schedule entries are available:

1. Collect their unique film IDs.
2. Remove IDs with fresh film-cache entries.
3. Fetch only missing movie records.
4. Validate that Cineworld returned every requested ID.
5. Map and cache each film independently.

If the movies URL becomes too long, missing IDs should be divided into bounded batches. With the observed 47 films, one request is sufficient.

### Serving existing listings

The existing route and response contract should remain unchanged:

```text
GET /cinema/:cinema/listings/:date
```

On a request it should:

1. call the shared schedule loader for that one cinema/date pair;
2. call the shared film loader for film IDs in those events; and
3. compose the existing `IListingsResponse` from schedule and film cache entries.

Consequently, data loaded by Film Finder serves later listings requests without contacting Cineworld again, and an individually loaded listing contributes to a later Film Finder response.

### Film Finder endpoint

Add a compact application endpoint rather than returning Cineworld's 12 MiB schedule response to the browser. A suitable contract is:

```text
GET /films?from=YYYY-MM-DD&to=YYYY-MM-DD
```

`from` and `to` should have clearly documented inclusive/exclusive semantics, be validated as real dates, and be limited to a maximum seven-day window. The client supplies the range so its local seven-day labels and the requested business dates cannot disagree with a server in another timezone.

An example response shape is:

```json
{
  "films": [
    {
      "film": {
        "id": "film-a",
        "name": "Example Film"
      },
      "cinemas": [
        {
          "cinemaId": "X079Z",
          "dates": ["2026-09-21", "2026-09-23"]
        }
      ]
    }
  ]
}
```

The real `film` value should use the existing `IFilm` contract. Cinema details need not be duplicated because the Angular service already caches the cinema list. The response should contain only availability, not every showtime, because the Film Finder does not display screening times.

## Proposed client architecture

Add:

- a Film Finder route and navigation affordance;
- a Film Finder service method and response contracts;
- a component that creates the same next-seven-days range as the listings page;
- an alphabetical film list with clear selected state;
- an expanded cinema/date list for the selected film;
- loading, empty, upstream-error, and geolocation-error states; and
- responsive styling consistent with the existing Bootstrap interface.

The component should join each returned `cinemaId` to the cinema list already provided by `CineworldService`. Unknown cinema IDs should not crash the page; they should be ignored with a diagnostic warning because the schedule and static cinema data may change independently.

Cinema ordering is:

1. favourite status, descending;
2. distance when location sort is active and coordinates are available; otherwise
3. cinema name, ascending.

The current cinema-list comparison checks distances by truthiness. Shared code should instead compare defined values so a legitimate zero distance is handled correctly.

## Failure and concurrency behaviour

- Invalid date ranges return HTTP 400 without calling Cineworld.
- Upstream timeouts and malformed responses use the existing gateway-error handling conventions.
- A failed bulk load must not mark missing cinema/date pairs as successfully loaded.
- A valid response without showtimes should cache empty entries for every requested pair.
- Concurrent overlapping requests should share in-flight work.
- One subscriber disconnecting must not corrupt shared cache population.
- The larger upstream schedule request needs an explicit response-size limit comfortably above the observed 12 MiB and an appropriate timeout. Limits should remain finite.
- Client errors should preserve the normal cinema list and provide a retry path rather than leaving a permanent spinner.

## Testing and verification

### Server tests

- Multiple cinemas are encoded as repeated `theaters` parameters, not a JSON array.
- Adjacent dates with identical missing cinema sets produce one request.
- Fresh cache entries are excluded from upstream requests.
- Irregular cache gaps are grouped without reloading fresh pairs.
- A cold seven-day load populates all cinema/date entries.
- Empty schedules are cached as loaded.
- Film IDs are deduplicated and only missing details are requested.
- Film metadata is reused by ordinary listings and Film Finder requests.
- Film Finder data is reused by the existing listings endpoint.
- Concurrent requests share an upstream load.
- Cache expiry and capacity do not evict a newly loaded week.
- Invalid ranges, oversized ranges, timeouts, and malformed Cineworld responses are rejected correctly.
- The compact Film Finder response contains the exact cinemas and dates for each film.

### Client tests

- Films are alphabetical.
- Selecting a film reveals only its cinemas and dates.
- Favourite cinemas remain above non-favourites.
- Alphabetical and location sorting produce the expected asymmetric order.
- Denied or timed-out geolocation restores alphabetical ordering and reports the error.
- Date links target the existing cinema/date route.
- Loading, empty, and API-error states are accessible and correct.

### Final verification

Run linting, server compilation, targeted tests, the full test suite, and a production Angular build. Render and inspect representative desktop and narrow-screen states, including loading, a selected film, favourite ordering, location sorting, empty results, and errors.

## Scope and estimates discussed

An initial commercial-development estimate of $4,000–$5,500 was given after “dollar estimate” was misunderstood as the cost of hiring a developer. That is not the intended budget estimate.

The estimated incremental Amp model/tool usage for implementation and verification was:

- **Normal range:** $15–$30
- **Practical upper allowance:** $40 if debugging or visual verification requires iteration
- **Optimised target:** $10–$20

These are estimates, not guarantees. Actual billed cost depends on model routing, provider pricing, subscriptions or BYOK configuration, context caching, and unexpected failures.

The largest expected usage areas are the backend cache refactor and tests, followed by the frontend, debugging, and rendered UI verification. Usage can be reduced by:

- continuing with the established context rather than repeating discovery;
- using a lower-cost agent mode;
- avoiding unnecessary delegation or an Oracle review;
- reusing existing favourites, geolocation, sorting, date, and routing behaviour;
- implementing once, then running targeted checks before one full verification pass; and
- using the pragmatic missing-range grouping described above instead of an elaborate request optimiser.

## Decisions captured

- The feature covers the next seven days rather than only one selected day.
- Cineworld schedule data should be aggregated on the server, not in the browser.
- Multiple cinemas and days can be fetched in one request when they share a date range.
- Already-fresh cinema/date entries should not be loaded again.
- Film details should be cached independently and fetched only when missing or expired.
- Film Finder and ordinary listings must populate and consume the same underlying caches.
- Films are alphabetical.
- Selected-film cinemas put favourites first, then use alphabetical or optional location sorting.
- Available dates link to the existing listings page for that cinema and date.
- Persistent or distributed caching is not part of the initial scope; cache contents remain process-local and are lost on server restart.

## Remaining implementation choices

- Final route name and exact inclusive/exclusive date parameter semantics.
- Exact schedule and film TTLs, with ten minutes and 24 hours respectively as the starting recommendation.
- Whether selecting a film expands it inline or uses a separate detail region on the same page.
- Where the Film Finder navigation entry appears in the currently minimal application shell.
