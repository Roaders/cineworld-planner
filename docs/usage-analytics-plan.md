# Usage analytics and statistics plan

## Summary

Add first-party analytics for cinema-page visits and film selections, backed by PostgreSQL and exposed through a public statistics page.

The recommended design assigns each browser session a random identifier. A session lasts until 30 minutes of inactivity. The API uses an HMAC hash of that identifier only for temporary deduplication, so each session contributes at most:

- one selection for each cinema; and
- one selection for each film at each cinema.

This measures unique selecting sessions, not identifiable people. Repeated clicks during a session count once, while a later session can count again.

The permanent database contains daily aggregate counts only. Session identifiers and their individual selections are deleted after the session expires, so separate visits cannot be linked.

PostgreSQL is recommended because it is straightforward to run in Docker Compose on the existing TrueNAS host and supports the required uniqueness and time-series queries.

## Product decisions and assumptions

### What counts as a selection

- A **cinema selection** is recorded after `GET /cinema/:cinema/listings/:date` successfully returns listings. Changing dates does not create another record for the same session and cinema.
- A **film selection** is recorded when a film changes from unselected to selected. Deselecting and reselecting it does not create another record.
- A film selection is unique by session, cinema, and film. This permits the film chart to be filtered by cinema.
- Database insertion is idempotent: duplicate requests succeed without adding another row.
- Analytics failures never prevent listings loading or film selection.

The frontend stores a random session UUID and last-activity time in `sessionStorage`. Activity within 30 minutes refreshes the timeout; the next tracked action after 30 minutes creates a new UUID. Closing the tab also ends the session. Separate tabs are separate sessions.

### Meaning of the time graphs

Because each session/item combination is stored only once, a graph bucket shows **unique sessions selecting that item during the period**. A later session is counted again, making the graph an engagement measure rather than a lifetime first-selection measure.

### Period controls

Recommended interpretation of the requested controls:

- **Month** is the default and initially shows the current calendar month.
- Previous and next controls move by one complete calendar month.
- **Year** initially shows the current calendar year and moves by complete calendar years.
- **All** shows all retained history and has no previous/next controls.
- Selecting a cinema filters both the film ranking and film graph; the cinema ranking remains visible so another cinema can be selected.

If “last month” means the previous completed month rather than a one-month view, only the initial date range needs to change.

## Privacy and consent

This section is implementation guidance, not legal advice. It is based on current UK ICO guidance reviewed on 20 September 2026.

### Does this require a cookie consent dialog?

For the revised aggregate-only design, an opt-in cookie dialog is **probably not required in the UK**, provided the statistical-purpose exception applies. Although the temporary identifier uses `sessionStorage` rather than a cookie, PECR still applies to storing or accessing it.

The Data (Use and Access) Act 2025 introduced a statistical-purpose exception for narrowly scoped service analytics. The [ICO's current guidance](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-the-exceptions/) permits this without consent when the sole purpose is aggregate statistics used to improve the service, individual-level information is not retained after aggregation, users receive clear information, and users have a simple free way to object.

This proposal is designed around that exception:

- no account, stable user ID, fingerprint, IP address, user agent, or cross-session identifier;
- daily aggregate counts are incremented immediately;
- temporary session hashes and deduplication rows are deleted after session expiry;
- no advertising, profiling, personalisation, or sharing with another controller;
- a clear analytics notice and an always-available free opt-out.

A full consent banner would become necessary if the system later retains raw session histories, links sessions, profiles visitors, supports advertising, or reuses the data for another purpose.

Publishing popularity statistics as a site feature should still be checked against the exception's “improving the service” purpose. A formal legal review is not legally mandatory, but a short UK privacy review is prudent before launch. This document is implementation guidance, not legal advice.

### Analytics notice and opt-out

Use a concise “Anonymous usage statistics” notice rather than a consent dialog:

- explain that anonymous cinema and film selections increment aggregate counts;
- explain that a random identifier exists only for the current session to prevent duplicate counts;
- provide a visible **Disable analytics** action;
- add an **Analytics settings** footer link so analytics can be disabled or re-enabled;
- stop tracking and delete the local session identifier immediately after an objection;
- remember the opt-out preference;
- provide a privacy notice describing purpose, temporary processing, aggregates, retention, and user rights.

### Data minimisation

- Generate a random session UUID in `sessionStorage`; do not derive identity from an IP address, user agent, email, or device fingerprint.
- Expire and replace the session UUID after 30 minutes without tracked activity or when the tab closes. Do not create a stable identifier linking separate sessions.
- Send the UUID in an `X-Analytics-Session-Id` request header unless the user has opted out.
- Store `HMAC-SHA-256(server_secret, session_uuid)`, never the raw UUID.
- Do not store IP addresses or user agents in analytics tables. Review application and reverse-proxy logs separately because they may already contain them.
- Increment daily aggregate counts transactionally and retain session hashes only in temporary deduplication tables.
- Delete expired sessions and their deduplication rows promptly; never expose them through the statistics API.
- Suppress public ranking/graph cells with fewer than five selections to reduce disclosure risk.
- Define aggregate retention, recommended initially as 24 months. “All” means all retained aggregate history.

## Architecture

```diagram
┌──────────────────────── Angular application ────────────────────────┐
│                                                                    │
│ Opt-out preference ──▶ session UUID ──▶ AnalyticsService           │
│                                      │                             │
│ Cinema listings GET ────────────────┤                             │
│ Film selected ──▶ analytics POST ───┘                             │
│                                                                    │
│ StatsComponent ◀──────────── aggregate stats GET                   │
└──────────────────────────────┬─────────────────────────────────────┘
                               │ HTTPS
                               ▼
┌──────────────────────── Express API ───────────────────────────────┐
│ HMAC session ID ──▶ temporary dedupe ──▶ increment daily total     │
│ Stats query ──▶ date/cinema filters ──▶ aggregate response         │
└──────────────────────────────┬─────────────────────────────────────┘
                               │ DATABASE_URL
                               ▼
                    ┌─────────────────────┐
                    │ PostgreSQL          │
                    │ selections + names  │
                    │ indexes + migrations│
                    └─────────────────────┘
```

### Angular changes

Add:

- `AnalyticsService` to own the opt-out preference, expiring session UUID, and non-blocking tracking requests;
- `AnalyticsPreferencesComponent` for the notice and settings;
- `StatsComponent` at `#/stats`;
- a router link named **Stats** beside GitHub in the footer;
- an **Analytics settings** footer link or button;
- Chart.js for responsive line/bar charts, with the same values also available in accessible tables.

The existing `CinemaComponent.toggleFilm()` should call analytics only in the branch that adds a film. The existing listings request should attach the analytics header unless analytics is disabled. The API can then record the cinema selection without adding a second browser request.

### API changes

Recommended endpoints:

```text
POST /analytics/film-selections
  Header: X-Analytics-Session-Id: <uuid>
  Body: { cinemaId, filmId, filmName }
  Result: 204 for both a new and duplicate selection

GET /stats/cinemas?from=2026-09-01&to=2026-10-01&bucket=day
GET /stats/films?from=2026-09-01&to=2026-10-01&bucket=day&cinemaId=X079Z
```

The listings endpoint already identifies the cinema. If an analytics header is present and listings are successfully returned, it should insert the cinema selection. The server should obtain the cinema name from its trusted cinema list rather than accepting it from the browser.

Stats responses should contain:

- the effective UTC date range and bucket size;
- ranked totals for the selected range;
- a series of bucket/count points for each displayed cinema or film;
- an `other` series when limiting the graph to the top results.

Limit rankings and graph series, for example to the top 10, while allowing the accessible table to paginate. Date ranges, bucket values, IDs, and names must be validated. SQL must be parameterised. Apply separate rate limits to writes and public stats reads.

### Database schema

```sql
CREATE TABLE analytics_sessions (
    session_hash bytea PRIMARY KEY,
    last_seen_at timestamptz NOT NULL
);

CREATE TABLE session_cinema_selections (
    session_hash bytea NOT NULL,
    cinema_id text NOT NULL,
    FOREIGN KEY (session_hash) REFERENCES analytics_sessions(session_hash)
        ON DELETE CASCADE,
    PRIMARY KEY (session_hash, cinema_id)
);

CREATE TABLE session_film_selections (
    session_hash bytea NOT NULL,
    cinema_id text NOT NULL,
    film_id text NOT NULL,
    FOREIGN KEY (session_hash) REFERENCES analytics_sessions(session_hash)
        ON DELETE CASCADE,
    PRIMARY KEY (session_hash, cinema_id, film_id)
);

CREATE TABLE daily_cinema_popularity (
    day date NOT NULL,
    cinema_id text NOT NULL,
    cinema_name text NOT NULL,
    selections bigint NOT NULL CHECK (selections >= 0),
    PRIMARY KEY (day, cinema_id)
);

CREATE TABLE daily_film_popularity (
    day date NOT NULL,
    cinema_id text NOT NULL,
    cinema_name text NOT NULL,
    film_id text NOT NULL,
    film_name text NOT NULL,
    selections bigint NOT NULL CHECK (selections >= 0),
    PRIMARY KEY (day, cinema_id, film_id)
);
```

Handle each event in one transaction: refresh the temporary session, insert its deduplication row with `ON CONFLICT DO NOTHING`, and increment the relevant daily aggregate only when that insert returns a new row. A cleanup task deletes sessions inactive for 30 minutes; cascading deletion removes their deduplication rows. Aggregate rows contain no session identifier.

Snapshot names make historical stats readable after a film disappears from current Cineworld listings. If upstream names can change, stats should group by ID and use the most recently observed name.

Use `pg` with versioned SQL migrations. A small migration command is preferable to running schema creation implicitly on every API startup.

## Docker and development

Add a Compose file with:

- `api`: the existing application image;
- `db`: an official PostgreSQL Alpine image with a named volume and health check;
- `migrate`: a one-shot service using the application image to apply migrations.

Configuration:

```text
DATABASE_URL=postgresql://cineworld:<password>@db:5432/cineworld
ANALYTICS_HMAC_SECRET=<at least 32 random bytes>
ANALYTICS_ENABLED=true
ANALYTICS_SESSION_TIMEOUT_MINUTES=30
ANALYTICS_AGGREGATE_RETENTION_DAYS=730
```

Production must not publish PostgreSQL's port to the internet. Store credentials and the HMAC secret outside source control. Bind PostgreSQL data to a dedicated TrueNAS dataset so it can be included in the existing snapshot and backup process.

For development, use the same Compose database with its port bound only to localhost. Provide `.env.example`, a disposable development volume, migration and reset commands, and deterministic seed analytics so every period/filter state can be exercised locally.

SQLite is a reasonable smaller alternative for one API replica, but PostgreSQL is preferred because concurrent writes, date bucketing, backups, and container replacement are less fragile. Do not use an in-container SQLite file without a mounted volume.

## Statistics page

The page should contain:

1. period selector: Month, Year, All;
2. previous/next period navigation and a visible date-range label;
3. popular cinemas ranking and time-series graph;
4. cinema filter, selected from the cinema ranking or a select control;
5. popular films ranking and time-series graph, filtered when a cinema is selected;
6. loading, empty, partial-data, and API-error states;
7. accessible data tables corresponding to both charts.

Use URL query parameters for the selected period, anchor date, and cinema so views are bookmarkable, for example `#/stats?period=month&date=2026-09-01&cinema=X079Z`.

On mobile, rankings should precede their graphs and charts should horizontally scroll or reduce visible series rather than making labels unreadable.

## Accuracy and abuse limitations

- A session identifier is not a person identifier.
- The same person can contribute again after 30 minutes of inactivity.
- Incognito windows, different devices, and concurrent browser profiles count as separate sessions.
- Several people using one active browser session count as one session.
- Automated clients can invent identifiers and inflate public stats.

Mitigate abuse with write rate limits, UUID validation, successful-listings checks, duplicate constraints, aggregate monitoring, and the ability to disable analytics. Strong person-level uniqueness would require accounts, which is outside this proposal.

## Testing

### Server

- migration tests against real PostgreSQL;
- duplicate cinema and film requests increment the aggregate once per session;
- one film can be counted once at each cinema during the same session;
- invalid/missing identifiers are ignored or rejected as specified;
- successful and failed listings requests have the intended tracking behavior;
- period boundaries and UTC/date bucketing are correct;
- cinema filters affect films but not the cinema ranking;
- low counts are suppressed;
- session cleanup deletes temporary hashes and deduplication rows after inactivity;
- aggregate retention cleanup deletes expired daily totals;
- SQL injection and excessive date ranges are rejected.

### Angular

- anonymous analytics notice and disable/re-enable flows;
- opting out prevents identifier creation and analytics requests;
- selecting records but deselecting does not;
- analytics failures do not alter planning behavior;
- period navigation and URL state;
- month/year boundary behavior;
- cinema filtering, empty data, errors, and accessible table content;
- responsive visual checks for desktop and mobile chart states.

### End-to-end

- run API and PostgreSQL with Compose;
- seed known events, query every period, and compare exact ranking/series results;
- verify repeated interactions within a session remain deduplicated and interactions after expiry count again;
- verify the migration and backup/restore procedure before production rollout.

## Delivery plan

1. Confirm metric semantics, default month behavior, retention, and privacy approach.
2. Add PostgreSQL Compose services, configuration, migrations, and repository layer.
3. Add the notice, opt-out preference, temporary session deduplication, and aggregate write paths behind `ANALYTICS_ENABLED`.
4. Add aggregate stats APIs with tests.
5. Add the stats route, controls, charts, tables, and footer links.
6. Run privacy, accessibility, mobile visual, performance, migration, and restore checks.
7. Deploy database first, migrate, deploy API/UI, then enable analytics.

## Cost estimate

### Implementation effort

Estimated scope for a production-quality implementation:

| Work | Estimate |
| --- | ---: |
| PostgreSQL, Compose, migrations, repository | 1 day |
| Temporary session deduplication, aggregates, notice and opt-out | 1–1.5 days |
| Aggregate stats API and query tests | 1 day |
| Angular stats page, charts, filters, footer | 1.5–2 days |
| End-to-end, visual, accessibility, deployment documentation | 1–1.5 days |
| **Total** | **5.5–7 engineering days** |

I cannot see or guarantee the user's Amp billing rate. The earlier US$100–$300 estimate assumed retained per-user records, a full consent flow, and a wider privacy implementation. For this simpler aggregate-only design, I would expect approximately **US$30–$60 of Amp model/tool usage** and recommend a **US$100 ceiling** for normal iteration or unforeseen integration work. A conventional human implementation at US$100–$150/hour would be approximately **US$4,400–$8,400** for 44–56 hours.

The estimate excludes legal review, production infrastructure access issues, historical data import, user accounts, anti-fraud guarantees, and major visual redesign.

### Ongoing infrastructure

- **Incremental hosting cost: US$0/month.** The API and PostgreSQL database will run on the existing TrueNAS box.
- PostgreSQL will consume a small amount of the host's existing CPU, RAM, and storage.
- Store its data on a dedicated TrueNAS dataset and include it in existing snapshots and backups. Any new off-box backup service would be separate from this estimate.
- The stats queries should not require a separate analytics warehouse at the expected scale.

## Recommendation

Proceed with PostgreSQL, temporary per-session deduplication, permanent daily aggregates, a 30-minute inactivity timeout, and a clear notice with opt-out rather than an opt-in cookie dialog. This produces useful engagement statistics without retaining user or return-visitor histories. Confirm the narrow statistical-purpose use with a short UK privacy review before enabling collection in production.
