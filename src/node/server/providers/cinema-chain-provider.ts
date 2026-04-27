import { Observable } from 'rxjs';
import { ICinema, IListingsResponse } from '../../../contracts/contracts';

/**
 * Abstraction over a cinema chain (Cineworld, Odeon, ...).
 *
 * Each implementation is responsible for retrieving the chain's cinema list
 * and per-cinema listings, and for normalising the data into the shared
 * `ICinema` / `IListingsResponse` contracts consumed by the rest of the app.
 */
export interface ICinemaChainProvider {
    /**
     * Stable identifier for the chain (e.g. `cineworld`, `odeon`).
     * Used as a cache-key namespace and (eventually) as a URL segment.
     */
    readonly chainId: string;

    /**
     * Returns the list of cinemas operated by this chain.
     */
    getCinemas(): Observable<ICinema[]>;

    /**
     * Returns the listings (films + events) for a single cinema on a single date.
     *
     * @param cinemaCode  The chain-specific cinema identifier (e.g. `ICinema.externalCode`).
     * @param date        Date in `YYYY-MM-DD` format.
     */
    getListings(cinemaCode: string, date: string): Observable<IListingsResponse>;
}
