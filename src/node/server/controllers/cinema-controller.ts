import { Request, Response } from 'express';
import { map, shareReplay } from 'rxjs/operators';
import { defer, from, Observable } from 'rxjs';
import axios, { AxiosError } from 'axios';
import {
    ICineworldMovie,
    ICineworldScheduleResponse,
    ICineworldTheaterResponse,
    mapListings,
    mapTheaters,
} from './cineworld-mapper';

const CINEWORLD_URL = `https://www.cineworld.co.uk`;
const CINEMA_LIST_URL = `${CINEWORLD_URL}/page-data/sq/d/2506275789.json`;

interface ITimeoutCache {
    stream: Observable<any>;
    expiry: number;
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

    public getListings(request: Request, response: Response ) {
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

            const scheduleResponse = await axios.get<ICineworldScheduleResponse>(scheduleUrl);
            const schedule = scheduleResponse.data[cinema]?.schedule || {};
            const movieIds = Object.keys(schedule);
            const movies = movieIds.length === 0
                ? []
                : (await axios.get<ICineworldMovie[]>(getMoviesUrl(movieIds))).data;

            return mapListings(cinema, schedule, movies);
        });
    }

    private getCinemaListObservable() {

        return defer(() => {
            console.log(`Loading cinema list from ${CINEMA_LIST_URL}`);

            return from(axios.get<ICineworldTheaterResponse>(CINEMA_LIST_URL)).pipe(
                map(result => mapTheaters(result.data))
            );
        });
    }

    private handleError(response: Response, error: any, message: string) {

        if (error.isAxiosError) {
            const axiosError = error as AxiosError;
            console.log(message);
            console.log({response: error.response})

            if (axiosError.response) {
                response.status(axiosError.response.status);
                response.statusMessage = axiosError.response.statusText;
                response.send();
                return;
            }
        } else {
            console.log(message, {response, error});
        }

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
