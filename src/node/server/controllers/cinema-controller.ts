import { Request, Response } from 'express';
import { shareReplay } from 'rxjs/operators';
import { defer, Observable } from 'rxjs';
import axios, { AxiosError } from 'axios';
import { ICinema } from '../../../contracts/contracts';
import {
    ICineworldMovie,
    ICineworldTheaterResponse,
    isCineworldMovieResponse,
    isCineworldScheduleResponse,
    mapListings,
    mapTheaters,
} from './cineworld-mapper';

// Gatsby hashes the static GraphQL query text, not its cinema data. This remains stable across content rebuilds.
const THEATER_STATIC_QUERY_HASH = '2506275789';
const CINEMA_CODE_PATTERN = /^[A-Z0-9]{5}$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_CACHE_ENTRIES = 500;
const CINEWORLD_REQUEST_CONFIG = {
    timeout: 10 * 1000,
    maxContentLength: 2 * 1024 * 1024,
};

interface ICinemasPageData {
    staticQueryHashes: string[];
}

interface ICineworldSite {
    baseUrl: string;
    cinemaCodePrefix: string;
    cinemasPageDataPath: string;
    cinemaPagePathPrefix: string;
    moviePagePathPrefix: string;
    timeZone: string;
}

const UK_SITE: ICineworldSite = {
    baseUrl: 'https://www.cineworld.co.uk',
    cinemaCodePrefix: '',
    cinemasPageDataPath: '/page-data/cinemas/page-data.json',
    cinemaPagePathPrefix: '/cinemas/',
    moviePagePathPrefix: '/films/',
    timeZone: 'Europe/London',
};

const CINEWORLD_SITES: ICineworldSite[] = [UK_SITE, {
    baseUrl: 'https://www.cineworld.ie',
    cinemaCodePrefix: 'IE-',
    cinemasPageDataPath: '/page-data/whats-on/x07a4-cineworld-cinema-dublin/page-data.json',
    cinemaPagePathPrefix: '/whats-on/',
    moviePagePathPrefix: '/movies/',
    timeZone: 'Europe/Dublin',
}];

interface IHttpResult {
    data: unknown;
}

type GetJson = (url: string) => Promise<IHttpResult>;

interface ITimeoutCache {
    stream: Observable<any>;
    expiry: number;
}

class InvalidCineworldResponseError extends Error {
}

const MAX_CINEMA_LIST_CACHE_AGE = 1000 * 60 * 60; // Cache for 1 hour
const MAX_LISTINGS_CACHE_AGE = 1000 * 60 * 10; // Cache for 10 minutes

export class CinemaController {

    private _cache = new Map<string, ITimeoutCache>();

    /** Returns the available Cineworld cinemas. */
    public getCinemas(request: Request, response: Response ) {
        console.log(`Request: ${request.url}`);

        this.getCachedStream(
            'cinema-list',
            MAX_CINEMA_LIST_CACHE_AGE,
            () => this.getCinemaListObservable()
        ).subscribe(
            cinemas =>  response.json(cinemas),
            error => this.handleError(response, error, `ERROR getting cinema list`)
        );
    }

    /** Returns a cinema's listings for the requested date. */
    public getListings(request: Request<{cinema: string; date: string}>, response: Response ) {
        console.log(`Request: ${request.url}`);

        const externalCode: string = request.params.cinema;
        const date: string = request.params.date;
        const cinema = parseCinemaCode(externalCode);

        if (cinema == null || !isValidIsoDate(date)) {
            response.status(400).send();
            return;
        }

        const cacheKey = `listings_${externalCode}_${date}`;
        this.getCachedStream(
            cacheKey,
            MAX_LISTINGS_CACHE_AGE,
            () => this.getListingsObservable(cinema.site, cinema.cinemaId, externalCode, date)
        ).subscribe(
                result => response.json(result),
                error => this.handleError(response, error, `ERROR getting listing for cinema ${externalCode} on date ${date}`)
            );
    }

    /** Reuses a cached observable until its configured expiry. */
    private getCachedStream(cacheKey: string, maxAge: number, createStream: () => Observable<any>) {
        const now = Date.now();
        const cached = this._cache.get(cacheKey);

        if (cached != null && now <= cached.expiry) {
            return cached.stream;
        }

        if (cached != null) {
            this._cache.delete(cacheKey);
        }

        for (const [key, value] of this._cache) {
            if (now > value.expiry) {
                this._cache.delete(key);
            }
        }

        while (this._cache.size >= MAX_CACHE_ENTRIES) {
            const oldestKey = this._cache.keys().next().value;
            if (oldestKey != null) {
                this._cache.delete(oldestKey);
            }
        }

        const stream = createStream().pipe(shareReplay());
        this._cache.set(cacheKey, {stream, expiry: now + maxAge});
        return stream;
    }

    /** Creates an observable that loads and maps listings from Cineworld. */
    private getListingsObservable(site: ICineworldSite, cinemaId: string, externalCode: string, date: string) {
        return defer(async () => {
            const scheduleUrl = getScheduleUrl(site, cinemaId, date);
            console.log(`Loading list from ${scheduleUrl}`);

            const scheduleResponse = await axios.get<unknown>(scheduleUrl, CINEWORLD_REQUEST_CONFIG);
            if (!isCineworldScheduleResponse(scheduleResponse.data)) {
                throw new InvalidCineworldResponseError('Cineworld returned an invalid schedule response');
            }

            const schedule = scheduleResponse.data[cinemaId]?.schedule || {};
            const movieIds = Object.keys(schedule);
            let movies: ICineworldMovie[] = [];

            if (movieIds.length > 0) {
                const moviesResponse = await axios.get<unknown>(getMoviesUrl(site, movieIds), CINEWORLD_REQUEST_CONFIG);
                if (!isCineworldMovieResponse(moviesResponse.data)) {
                    throw new InvalidCineworldResponseError('Cineworld returned an invalid movie response');
                }

                movies = moviesResponse.data;
                const returnedMovieIds = new Set(movies.map(movie => movie.id));
                if (movieIds.some(movieId => !returnedMovieIds.has(movieId))) {
                    throw new InvalidCineworldResponseError('Cineworld omitted movies referenced by its schedule');
                }
            }

            return mapListings(externalCode, schedule, movies, site.baseUrl, site.moviePagePathPrefix);
        });
    }

    /** Creates an observable that loads the Cineworld cinema list. */
    private getCinemaListObservable() {
        return defer(async () => {
            console.log(`Loading cinema lists from ${CINEWORLD_SITES.map(site => site.baseUrl).join(', ')}`);

            const cinemaLists = await Promise.all(CINEWORLD_SITES.map(site =>
                loadCinemaList(url => axios.get(url, CINEWORLD_REQUEST_CONFIG), site)
            ));
            return cinemaLists.flat();
        });
    }

    /** Converts upstream and internal failures into HTTP error responses. */
    private handleError(response: Response, error: unknown, message: string) {

        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            console.log(message);
            console.log({response: axiosError.response});

            if (axiosError.response) {
                response.status(axiosError.response.status);
                response.statusMessage = axiosError.response.statusText;
                response.send();
                return;
            }
        } else if (error instanceof InvalidCineworldResponseError) {
            console.log(message, {error});
            response.status(502);
            response.statusMessage = error.message;
            response.send();
            return;
        }

        console.log(message, {error});

        response.status(500);
        response.statusMessage = message;
        response.send();
    }
}

/** Builds the Cineworld schedule endpoint URL for a cinema and date. */
function getScheduleUrl(site: ICineworldSite, cinemaId: string, date: string) {
    const nextDate = new Date(`${date}T00:00:00Z`);
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);

    const params = new URLSearchParams({
        from: `${date}T03:00:00`,
        theaters: JSON.stringify({id: cinemaId, timeZone: site.timeZone}),
        to: `${nextDate.toISOString().substring(0, 10)}T03:00:00`,
    });

    return `${site.baseUrl}/api/gatsby-source-boxofficeapi/schedule?${params}`;
}

/** Builds the Cineworld movie endpoint URL for the requested movie IDs. */
function getMoviesUrl(site: ICineworldSite, movieIds: string[]) {
    const params = new URLSearchParams({basic: 'false', castingLimit: '3'});
    movieIds.forEach(movieId => params.append('ids', movieId));

    return `${site.baseUrl}/api/gatsby-source-boxofficeapi/movies?${params}`;
}

/** Checks whether a value is a supported Cineworld cinema code. */
export function isValidCinemaCode(value: string): boolean {
    return parseCinemaCode(value) != null;
}

/** Checks whether a value is a real calendar date in ISO format. */
export function isValidIsoDate(value: string): boolean {
    if (!ISO_DATE_PATTERN.test(value)) {
        return false;
    }

    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().substring(0, 10) === value;
}

/** Loads the cinema list, discovering a current static query when necessary. */
export async function loadCinemaList(getJson: GetJson, site: ICineworldSite = UK_SITE): Promise<ICinema[]> {
    const cinemaListUrl = getStaticQueryUrl(site, THEATER_STATIC_QUERY_HASH);
    try {
        const result = await getJson(cinemaListUrl);
        if (isTheaterResponse(result.data)) {
            return mapTheaters(result.data, site.baseUrl, site.cinemaCodePrefix, site.cinemaPagePathPrefix);
        }
    } catch {
        console.warn(`Could not load known Cineworld theater query; discovering current query hash.`);
    }

    const pageDataResult = await getJson(`${site.baseUrl}${site.cinemasPageDataPath}`);
    if (!isCinemasPageData(pageDataResult.data)) {
        throw new InvalidCineworldResponseError('Could not retrieve valid Cineworld cinema page data');
    }

    for (const hash of pageDataResult.data.staticQueryHashes) {
        if (hash === THEATER_STATIC_QUERY_HASH) {
            continue;
        }

        try {
            const result = await getJson(getStaticQueryUrl(site, hash));
            if (isTheaterResponse(result.data)) {
                return mapTheaters(result.data, site.baseUrl, site.cinemaCodePrefix, site.cinemaPagePathPrefix);
            }
        } catch {
            // An unrelated static query may be unavailable without preventing discovery.
        }
    }

    throw new InvalidCineworldResponseError('Could not discover a valid Cineworld theater query');
}

/** Builds the URL for a Cineworld Gatsby static query. */
function getStaticQueryUrl(site: ICineworldSite, hash: string) {
    return `${site.baseUrl}/page-data/sq/d/${hash}.json`;
}

/** Resolves an application cinema code to its Cineworld site and upstream identifier. */
function parseCinemaCode(value: string): {site: ICineworldSite; cinemaId: string} | undefined {
    for (const site of CINEWORLD_SITES) {
        if (!value.startsWith(site.cinemaCodePrefix)) {
            continue;
        }

        const cinemaId = value.substring(site.cinemaCodePrefix.length);
        if (CINEMA_CODE_PATTERN.test(cinemaId)) {
            return {site, cinemaId};
        }
    }

    return undefined;
}

/** Checks whether a value contains Cineworld cinema page metadata. */
function isCinemasPageData(value: unknown): value is ICinemasPageData {
    const pageData = value as ICinemasPageData;
    return pageData != null
        && Array.isArray(pageData.staticQueryHashes)
        && pageData.staticQueryHashes.every(hash => typeof hash === 'string' && hash.length > 0);
}

/** Checks whether a value is a populated Cineworld theater response. */
function isTheaterResponse(value: unknown): value is ICineworldTheaterResponse {
    const response = value as ICineworldTheaterResponse;
    const theaters = response?.data?.allTheater?.nodes;

    return Array.isArray(theaters) && theaters.length > 0 && theaters.every(theater =>
        typeof theater.id === 'string'
        && theater.id.length > 0
        && typeof theater.name === 'string'
        && theater.name.length > 0
        && typeof theater.path === 'string'
        && theater.path.startsWith('/theaters/')
        && Number.isFinite(theater.practicalInfo?.coordinates?.latitude)
        && Number.isFinite(theater.practicalInfo?.coordinates?.longitude)
        && typeof theater.practicalInfo?.location?.address === 'string'
        && typeof theater.practicalInfo?.location?.city === 'string'
        && typeof theater.practicalInfo?.location?.zip === 'string'
        && (theater.practicalInfo.location.state == null
            || typeof theater.practicalInfo.location.state === 'string')
    );
}
