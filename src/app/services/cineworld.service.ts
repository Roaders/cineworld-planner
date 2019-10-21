import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay, map } from 'rxjs/operators';
import { ICinema, IListingsResponse, IUrlLookup } from '../../contracts/contracts';
import { environment } from '../environments/environment';
import { urlLookup } from 'src/constants/constants';

function getUrlParams() {
    const hash = window.location.hash;
    const urlParams = hash.substr(hash.indexOf('?'));

    return new URLSearchParams(urlParams);
}

function getBaseUrl() {
    const environmentKey = environment.baseUrl;

    const urlEnv = getUrlParams().get('env');

    if (urlEnv != null && urlLookup[urlEnv as keyof IUrlLookup] != null) {
        return urlLookup[urlEnv as keyof IUrlLookup] as string;
    }

    return urlLookup[environmentKey];
}

function getCinemasUrl() {
    return `${getBaseUrl()}/cinema`;
}

function getListingsUrl(externalCode: string, date: string) {
    return `${getBaseUrl()}/cinema/${externalCode}/listings/${date}`;
}

@Injectable()
export class CineworldService {

    constructor(private http: HttpClient) {
    }

    private _cinemaListStream: Observable<ICinema[]> | undefined;

    public getCinemaListAsync(): Observable<ICinema[]> {

        if (this._cinemaListStream == null) {
            this._cinemaListStream = this.http.get<ICinema[]>(getCinemasUrl()).pipe(
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

    public getCinemaListings(externalCode: string, date: string): Observable<IListingsResponse> {
        return this.http.get<IListingsResponse>(getListingsUrl(externalCode, date));
    }
}
