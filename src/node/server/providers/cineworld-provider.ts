import axios from 'axios';
import { defer, from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ICinema, IListingsResponse } from '../../../contracts/contracts';
import { ICinemaChainProvider } from './cinema-chain-provider';

const CINEWORLD_HOMEPAGE_URL = `https://www.cineworld.co.uk`;

const apiSitesListRegExp = /apiSitesList *= *(\[[^]+?\])/;

function getListingsUrl(externalCode: string, date: string) {
    // tslint:disable-next-line: max-line-length
    return `https://www.cineworld.co.uk/uk/data-api-service/v1/quickbook/10108/film-events/in-cinema/${externalCode}/at-date/${date}`;
}

function processRawHtml(rawHtml: string): ICinema[] {
    const regExpResult = apiSitesListRegExp.exec(rawHtml);
    const sitesListString = regExpResult != null ? regExpResult[1] : undefined;

    if (sitesListString) {
        return JSON.parse(sitesListString);
    }

    throw new Error('Could not retrieve sites list from html');
}

export class CineworldProvider implements ICinemaChainProvider {

    public readonly chainId = 'cineworld';

    public getCinemas(): Observable<ICinema[]> {
        return defer(() => {
            console.log(`Loading cinema list from ${CINEWORLD_HOMEPAGE_URL}`);

            return from(axios.get(CINEWORLD_HOMEPAGE_URL, { responseType: 'text' })).pipe(
                map(result => processRawHtml(result.data))
            );
        });
    }

    public getListings(cinemaCode: string, date: string): Observable<IListingsResponse> {
        return defer(() => {
            const url = getListingsUrl(cinemaCode, date);
            console.log(`Loading list from ${url}`);

            return from(axios.get<IListingsResponse>(url)).pipe(
                map(result => result.data)
            );
        });
    }
}
