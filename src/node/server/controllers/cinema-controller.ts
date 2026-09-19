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

const CINEWORLD_URL = `https://www.cineworld.co.uk`;
const CINEMAS_PAGE_DATA_URL = `${CINEWORLD_URL}/page-data/cinemas/page-data.json`;
// Gatsby hashes the static GraphQL query text, not its cinema data. This remains stable across content rebuilds.
const THEATER_STATIC_QUERY_HASH = '2506275789';
const CINEMA_LIST_URL = getStaticQueryUrl(THEATER_STATIC_QUERY_HASH);

interface ICinemasPageData {
    staticQueryHashes: string[];
}

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

    private _cache: {[url: string]: ITimeoutCache | undefined} = {};

    public getCinemas(request: Request, response: Response ) {
        console.log(`Request: ${request.url}`);

        const now = Date.now();
        let cachedStream = this._cache[CINEMA_LIST_URL];

        if (cachedStream == null || now > cachedStream.expiry) {

            cachedStream = {
                expiry: now + MAX_CINEMA_LIST_CACHE_AGE,
                stream: this.getCinemaListObservable().pipe(
                    shareReplay()
                )
            };

            this._cache[CINEMA_LIST_URL] = cachedStream;
        }

        cachedStream.stream.subscribe(
            cinemas =>  response.json(cinemas),
            error => this.handleError(response, error, `ERROR getting cinema list`)
        );
    }

    public getListings(request: Request<{cinema: string; date: string}>, response: Response ) {
        console.log(`Request: ${request.url}`);

        const cinema: string = request.params.cinema;
        const date: string = request.params.date;

        const cacheKey = `listings_${cinema}_${date}`;
        const now = Date.now();
        let cachedStream = this._cache[cacheKey];

        if (cachedStream == null || now > cachedStream.expiry) {

            cachedStream = {
                expiry: now + MAX_LISTINGS_CACHE_AGE,
                stream: this.getListingsObservable(cinema, date).pipe(
                    shareReplay()
                )
            };

            this._cache[cacheKey] = cachedStream;
        }

        cachedStream.stream.subscribe(
                result => response.json(result),
                error => this.handleError(response, error, `ERROR getting listing for cinema ${cinema} on date ${date}`)
            );
    }

    private getListingsObservable(cinema: string, date: string) {
        return defer(async () => {
            const scheduleUrl = getScheduleUrl(cinema, date);
            console.log(`Loading list from ${scheduleUrl}`);

            const scheduleResponse = await axios.get<unknown>(scheduleUrl);
            if (!isCineworldScheduleResponse(scheduleResponse.data)) {
                throw new InvalidCineworldResponseError('Cineworld returned an invalid schedule response');
            }

            const schedule = scheduleResponse.data[cinema]?.schedule || {};
            const movieIds = Object.keys(schedule);
            let movies: ICineworldMovie[] = [];

            if (movieIds.length > 0) {
                const moviesResponse = await axios.get<unknown>(getMoviesUrl(movieIds));
                if (!isCineworldMovieResponse(moviesResponse.data)) {
                    throw new InvalidCineworldResponseError('Cineworld returned an invalid movie response');
                }

                movies = moviesResponse.data;
                const returnedMovieIds = new Set(movies.map(movie => movie.id));
                if (movieIds.some(movieId => !returnedMovieIds.has(movieId))) {
                    throw new InvalidCineworldResponseError('Cineworld omitted movies referenced by its schedule');
                }
            }

            return mapListings(cinema, schedule, movies);
        });
    }

    private getCinemaListObservable() {
        return defer(async () => {
            console.log(`Loading cinema list from ${CINEMA_LIST_URL}`);

            return loadCinemaList(url => axios.get(url));
        });
    }

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

function getScheduleUrl(cinemaId: string, date: string) {
    const nextDate = new Date(`${date}T00:00:00Z`);
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);

    const params = new URLSearchParams({
        from: `${date}T03:00:00`,
        theaters: JSON.stringify({id: cinemaId, timeZone: 'Europe/London'}),
        to: `${nextDate.toISOString().substring(0, 10)}T03:00:00`,
    });

    return `${CINEWORLD_URL}/api/gatsby-source-boxofficeapi/schedule?${params}`;
}

function getMoviesUrl(movieIds: string[]) {
    const params = new URLSearchParams({basic: 'false', castingLimit: '3'});
    movieIds.forEach(movieId => params.append('ids', movieId));

    return `${CINEWORLD_URL}/api/gatsby-source-boxofficeapi/movies?${params}`;
}

export async function loadCinemaList(getJson: GetJson): Promise<ICinema[]> {
    try {
        const result = await getJson(CINEMA_LIST_URL);
        if (isTheaterResponse(result.data)) {
            return mapTheaters(result.data);
        }
    } catch (error) {
        console.warn(`Could not load known Cineworld theater query; discovering current query hash.`);
    }

    const pageDataResult = await getJson(CINEMAS_PAGE_DATA_URL);
    if (!isCinemasPageData(pageDataResult.data)) {
        throw new InvalidCineworldResponseError('Could not retrieve valid Cineworld cinema page data');
    }

    for (const hash of pageDataResult.data.staticQueryHashes) {
        if (hash === THEATER_STATIC_QUERY_HASH) {
            continue;
        }

        try {
            const result = await getJson(getStaticQueryUrl(hash));
            if (isTheaterResponse(result.data)) {
                return mapTheaters(result.data);
            }
        } catch (error) {
            // An unrelated static query may be unavailable without preventing discovery.
        }
    }

    throw new InvalidCineworldResponseError('Could not discover a valid Cineworld theater query');
}

function getStaticQueryUrl(hash: string) {
    return `${CINEWORLD_URL}/page-data/sq/d/${hash}.json`;
}

function isCinemasPageData(value: unknown): value is ICinemasPageData {
    const pageData = value as ICinemasPageData;
    return pageData != null
        && Array.isArray(pageData.staticQueryHashes)
        && pageData.staticQueryHashes.every(hash => typeof hash === 'string' && hash.length > 0);
}

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
