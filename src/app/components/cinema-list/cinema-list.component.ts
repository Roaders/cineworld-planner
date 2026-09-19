import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CineworldService } from '../../services/cineworld.service';
import { Router } from '@angular/router';
import { ICinema } from 'src/contracts/contracts';
import { CinemaHelper } from 'src/app/helper/cinema-helper';
import { getDistance, convertDistance, getRhumbLineBearing } from 'geolib';

@Component({
    selector: 'cinema-list',
    templateUrl: './cinema-list.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CinemaListComponent {

    /** Starts loading the available cinemas. */
    constructor(
        private cineworldService: CineworldService,
        private cinemaHelper: CinemaHelper,
        private router: Router,
        ) {
        this.loadCinemaList();
    }

    private _errorMessage: undefined | string;

    /** Provides any cinema or geolocation error message. */
    public get errorMessage() {
        return this._errorMessage;
    }

    private coordinates: GeolocationCoordinates | undefined;

    /** Indicates whether cinemas are sorted alphabetically. */
    public get alhpabeticalSearch() {
        return this._alhpabeticalSearch;
    }

    /** Indicates whether the browser supports geolocation. */
    public get geolocationAvailable(): boolean {
        return navigator.geolocation != null;
    }

    /** Provides the current cinema search text. */
    public get searchString() {
        return this._searchString;
    }

    /** Updates the search text and invalidates filtered results. */
    public set searchString(value: string) {
        this._searchString = value != null ? value : '';

        this._filteredCinemaList = undefined;
    }

    /** Provides the sorted and filtered cinema list. */
    public get cinemaList(): ICinema[] | undefined {
        if (this._cinemaList == null) {
            return undefined;
        }

        if (this._sortedCinemaList == null) {
            this._sortedCinemaList = this.sortCinemaList(this._cinemaList);
        }

        if (this._searchString !== '') {
            if (this._filteredCinemaList == null) {
                this._filteredCinemaList = this.filterCinemaList(this._sortedCinemaList);
            }

            return this._filteredCinemaList;
        }

        return this._sortedCinemaList;
    }

    private _cinemaList: ICinema[] | undefined;
    private _sortedCinemaList: ICinema[] | undefined;
    private _filteredCinemaList: ICinema[] | undefined;

    private _alhpabeticalSearch = true;

    private _searchString = '';

    /** Determines whether a cinema is marked as a favorite. */
    public isFavoriteCinema(cinema?: ICinema): boolean {
        return this.cinemaHelper.isFavoriteCinema(cinema);
    }

    /** Navigates to the selected cinema. */
    public selectCinema(cinema: ICinema) {
        this.router.navigate(['/cinema/', cinema.externalCode]);
    }

    /** Applies alphabetical or distance-based sorting. */
    public applySort(alphabetical: boolean) {
        if (navigator.geolocation == null) {
            this._alhpabeticalSearch = true;
            return;
        }

        this._alhpabeticalSearch = alphabetical;

        if (!alphabetical) {
            navigator.geolocation.getCurrentPosition(
                position => this.onGeolocation(position),
                positionError => this.onGeolocationError(positionError),
                {
                    maximumAge: 1000 * 60,
                    timeout: 1000 * 30
                }
            );
        }

        this.clearSortAndFilter();
    }

    /** Formats the distance to a cinema in miles. */
    public displayDistance(cinema: ICinema): string | undefined {
        const distance = this.getDistance(cinema);
        return distance != null ? `${convertDistance(distance, 'mi').toFixed(1)}mi` : undefined;
    }

    /** Calculates the bearing from the current location to a cinema. */
    public getBearing(cinema: ICinema): number | undefined {
        if (this.coordinates == null) {
            return undefined;
        }

        return getRhumbLineBearing(getCoords(this.coordinates), getCoords(cinema));
    }

    /** Builds the rotation style for a cinema bearing indicator. */
    public getBearingStyle(cinema: ICinema): string | undefined {
        const bearing = this.getBearing(cinema);

        if (bearing == null) {
            return undefined;
        }

        return `rotate(${bearing.toFixed(0)}deg)`;
    }

    /** Calculates the distance from the current location to a cinema. */
    private getDistance(cinema: ICinema): number | undefined {
        if (this.coordinates == null) {
            return undefined;
        }

        return getDistance(getCoords(cinema), getCoords(this.coordinates));
    }

    /** Sorts cinemas according to favorites and the active sort mode. */
    private sortCinemaList(list: ICinema[]) {
        return list.sort((one, two) => this.compareCinemas(one, two));
    }

    /** Filters cinemas by the current search text. */
    private filterCinemaList(list: ICinema[]) {
        const compareString = this.searchString.toLowerCase();
        return list.filter(cinema => cinema.name.toLowerCase().indexOf(compareString) >= 0);
    }

    /** Stores a successful geolocation result and refreshes sorting. */
    private onGeolocation(position: GeolocationPosition) {
        this.coordinates = position.coords;
        this.clearSortAndFilter();
    }

    /** Reports a geolocation failure and restores alphabetical sorting. */
    private onGeolocationError(positionError: GeolocationPositionError) {
        console.log(`GEO LOCATION ERROR: ${positionError.message}`);

        this._errorMessage = `Could not get location: ${positionError.message}`;

        this._alhpabeticalSearch = true;
    }

    /** Loads the available cinema list. */
    private loadCinemaList() {
        this.cineworldService.getCinemaListAsync().subscribe(list => this._cinemaList = list);
    }

    /** Compares cinemas by favorite status and the active sort mode. */
    private compareCinemas(one: ICinema, two: ICinema): number {
        const favoriteCompare = Number(this.isFavoriteCinema(two)) - Number(this.isFavoriteCinema(one));

        if (favoriteCompare !== 0) {
            return favoriteCompare;
        }

        if (!this.alhpabeticalSearch && this.coordinates != null) {
            const distanceOne = this.getDistance(one);
            const distanceTwo = this.getDistance(two);

            if (distanceOne && distanceTwo) {
                return distanceOne - distanceTwo;
            }
        }

        return one.name.localeCompare(two.name);
    }

    /** Invalidates cached sorting and filtering results. */
    private clearSortAndFilter() {
        this._filteredCinemaList = undefined;
        this._sortedCinemaList = undefined;
    }
}

/** Extracts longitude and latitude for geolib operations. */
function getCoords(coords: Pick<GeolocationCoordinates, 'longitude' | 'latitude'>) {
    const {longitude, latitude} = coords;

    return {longitude, latitude};
}
