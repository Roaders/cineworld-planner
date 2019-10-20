import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay, map } from 'rxjs/operators';
import { ICinema, IListingsResponse } from '../../contracts/contracts';

function getCinemasUrl() {
    return `http://localhost:3000/cinema`;
}

function getListingsUrl(externalCode: string, date: string) {
    return `http://localhost:3000/cinema/${externalCode}/listings/${date}`;
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
