import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ICinema } from '../contracts/contracts';

const HOMEPAGE_URL = `https://www.cineworld.co.uk`;

function getListingsUrl(externalCode: string, date: string) {
    // tslint:disable-next-line: max-line-length
    return `https://www.cineworld.co.uk/uk/data-api-service/v1/quickbook/10108/film-events/in-cinema/${externalCode}/at-date/${date}`;
}

const apiSitesListRegExp = /apiSitesList *= *(\[[^]+\])/;

@Injectable()
export class CineworldService {

    constructor(private http: HttpClient) {
    }

    private _cinemaListStream: Observable<ICinema[]> | undefined;

    public getCinemaListAsync(): Observable<ICinema[]> {

        if (this._cinemaListStream == null) {
            this._cinemaListStream = this.http.get(HOMEPAGE_URL, {responseType: 'text'}).pipe(
                map(processRawHtml),
                shareReplay(),
            );
        }

        return this._cinemaListStream;
    }

    public getCinemaAsync(externalCode: string): Observable<ICinema> {
        return this.getCinemaListAsync().pipe(
            map(cinemas => cinemas.filter(cinema => cinema.externalCode === externalCode)),
            map(filteredCinemas => {
                if (filteredCinemas.length === 1) {
                    return filteredCinemas[0];
                }

                throw new Error(`Could not find cinema with externalCode ${externalCode}`);
            }),
        );
    }

    public getCinemaListings(externalCode: string, date: string) {
        return this.http.get(getListingsUrl(externalCode, date));
    }
}

function processRawHtml(rawHtml: string): ICinema[] {
    const regExpResult = apiSitesListRegExp.exec(rawHtml);
    const sitesListString = regExpResult != null ? regExpResult[1] : undefined;

    if (sitesListString) {
        return JSON.parse(sitesListString);
    }

    throw new Error('Could not retrieve sites list from html');
}
