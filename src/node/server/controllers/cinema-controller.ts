import { Request, Response } from 'express';
import { shareReplay } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AxiosError } from 'axios';
import { ICinemaChainProvider } from '../providers/cinema-chain-provider';

interface ITimeoutCache {
    stream: Observable<any>;
    expiry: number;
}

const MAX_CINEMA_LIST_CACHE_AGE = 1000 * 60 * 60; // Cache for 1 hour
const MAX_LISTINGS_CACHE_AGE = 1000 * 60 * 10; // Cache for 10 minutes

export class CinemaController {

    constructor(private readonly provider: ICinemaChainProvider) {}

    private _cache: { [key: string]: ITimeoutCache | undefined } = {};

    public getCinemas(request: Request, response: Response) {
        console.log(`Request: ${request.url}`);

        const cacheKey = `cinemas_${this.provider.chainId}`;
        const now = Date.now();
        let cachedStream = this._cache[cacheKey];

        if (cachedStream == null || now > cachedStream.expiry) {

            cachedStream = {
                expiry: now + MAX_CINEMA_LIST_CACHE_AGE,
                stream: this.provider.getCinemas().pipe(
                    shareReplay()
                )
            };

            this._cache[cacheKey] = cachedStream;
        }

        cachedStream.stream.subscribe(
            cinemas => response.json(cinemas),
            error => this.handleError(response, error, `ERROR getting cinema list`)
        );
    }

    public getListings(request: Request, response: Response) {
        console.log(`Request: ${request.url}`);

        const cinema: string = request.params.cinema;
        const date: string = request.params.date;

        const cacheKey = `listings_${this.provider.chainId}_${cinema}_${date}`;
        const now = Date.now();
        let cachedStream = this._cache[cacheKey];

        if (cachedStream == null || now > cachedStream.expiry) {

            cachedStream = {
                expiry: now + MAX_LISTINGS_CACHE_AGE,
                stream: this.provider.getListings(cinema, date).pipe(
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

    private handleError(response: Response, error: any, message: string) {

        if (error.isAxiosError) {
            const axiosError = error as AxiosError;
            console.log(message);
            console.log({ response: error.response });

            if (axiosError.response) {
                response.status(axiosError.response.status);
                response.statusMessage = axiosError.response.statusText;
                response.send();
                return;
            }
        } else {
            console.log(message, { response, error });
        }

        response.status(500);
        response.statusMessage = message;
        response.send();
    }
}
