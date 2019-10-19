import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const HOMEPAGE_URL = `https://www.cineworld.co.uk`;

export interface ICinemaAddress {
    address1: string;
    address2?: string;
    address3?: string;
    address4?: string;
    city: string;
    postalCode: string;
    state?: string;
}

export interface ICinema {
    address: ICinemaAddress;
    externalCode: string;
    filename: string;
    latitude: number;
    longitude: number;
    name: string;
    uri: string;
}

const apiSitesListRegExp = /apiSitesList *= *(\[[^]+\])/;

@Injectable()
export class CineworldService {

    constructor(private http: HttpClient) {
    }

    public getCinemaListAsync(): Observable<ICinema[]> {

        return this.http.get(HOMEPAGE_URL, {responseType: 'text'}).pipe(
            map(processRawHtml)
        );

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
