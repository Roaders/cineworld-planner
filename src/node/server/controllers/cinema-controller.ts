import { Request, Response } from 'express';
import { map, shareReplay } from 'rxjs/operators';
import axios from 'axios-observable';
import { AxiosError } from 'axios';
import { ICinema } from '../../../contracts/contracts';
import { defer, Observable } from 'rxjs';

const CINEWORLD_HOMEPAGE_URL = `https://www.cineworld.co.uk`;

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
        let cachedStream = this._cache[CINEWORLD_HOMEPAGE_URL];

        if (cachedStream == null || now > cachedStream.expiry) {

            cachedStream = {
                expiry: now + MAX_CINEMA_LIST_CACHE_AGE,
                stream: this.getCinemaListObservable().pipe(
                    shareReplay()
                )
            };

            this._cache[CINEWORLD_HOMEPAGE_URL] = cachedStream;
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
                result => response.json(result.data),
                error => this.handleError(response, error, `ERROR getting listing for cinema ${cinema} on date ${date}`)
            );
    }

    private getListingsObservable(cinema: string, date: string) {

        return defer(() => {
            const url = getListingsUrl(cinema, date);
            console.log(`Loading list from ${url}`);

            return axios.get(url);
        });
    }

    private getCinemaListObservable() {

        return defer(() => {
            console.log(`Loading cinema list from ${CINEWORLD_HOMEPAGE_URL}`);

            return axios.get(CINEWORLD_HOMEPAGE_URL, {responseType: 'text'}).pipe(
                map(result => processRawHtml(result.data))
            );
        });
    }

    private handleError(response: Response, error: any, message: string) {
        console.log(message);

        if (error.isAxiosError) {
            const axiosError = error as AxiosError;

            if (axiosError.response) {
                response.status(axiosError.response.status);
                response.statusMessage = axiosError.response.statusText;
                response.send();
                return;
            }
        }

        response.status(500);
        response.statusMessage = message;
        response.send();
    }
}

function getListingsUrl(externalCode: string, date: string) {
    // tslint:disable-next-line: max-line-length
    return `https://www.cineworld.co.uk/uk/data-api-service/v1/quickbook/10108/film-events/in-cinema/${externalCode}/at-date/${date}`;
}

const apiSitesListRegExp = /apiSitesList *= *(\[[^]+\])/;

function processRawHtml(rawHtml: string): ICinema[] {
    const regExpResult = apiSitesListRegExp.exec(rawHtml);
    const sitesListString = regExpResult != null ? regExpResult[1] : undefined;

    if (sitesListString) {
        return JSON.parse(sitesListString);
    }

    throw new Error('Could not retrieve sites list from html');
}
