import { Component } from '@angular/core';
import { CineworldService } from '../../services/cineworld.service';
import { Router } from '@angular/router';
import { ICinema } from 'src/contracts/contracts';
import { CinemaHelper } from 'src/app/helper/cinema-helper';
import { getDistance, convertDistance, getRhumbLineBearing } from 'geolib';

@Component({
  selector: 'cinema-list',
  templateUrl: './cinema-list.component.html',
})
export class CinemaListComponent {

    constructor(
        private cineworldService: CineworldService,
        private cinemaHelper: CinemaHelper,
        private router: Router,
        ) {
        this.loadCinemaList();
    }

    private _errorMessage: undefined | string;

    public get errorMessage() {
        return this._errorMessage;
    }

    private coordinates: GeolocationCoordinates | undefined;

    public get alhpabeticalSearch() {
        return this._alhpabeticalSearch;
    }

    public get geolocationAvailable(): boolean {
        return navigator.geolocation != null;
    }

    public get searchString() {
        return this._searchString;
    }

    public set searchString(value: string) {
        this._searchString = value != null ? value : '';

        this._filteredCinemaList = undefined;
    }

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

    public isFavoriteCinema(cinema?: ICinema): boolean {
        return this.cinemaHelper.isFavoriteCinema(cinema);
    }

    public selectCinema(cinema: ICinema) {
        this.router.navigate(['/cinema/', cinema.externalCode]);
    }

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

    public displayDistance(cinema: ICinema): string | undefined {
        const distance = this.getDistance(cinema);
        return distance != null ? `${convertDistance(distance, 'mi').toFixed(1)}mi` : undefined;
    }

    public getBearing(cinema: ICinema): number | undefined {
        if (this.coordinates == null) {
            return undefined;
        }

        return getRhumbLineBearing(getCoords(this.coordinates), getCoords(cinema));
    }

    public getBearingStyle(cinema: ICinema): string | undefined {
        const bearing = this.getBearing(cinema);

        if (bearing == null) {
            return undefined;
        }

        return `rotate(${bearing.toFixed(0)}deg)`;
    }

    private getDistance(cinema: ICinema): number | undefined {
        if (this.coordinates == null) {
            return undefined;
        }

        return getDistance(getCoords(cinema), getCoords(this.coordinates));
    }

    private sortCinemaList(list: ICinema[]) {
        return list.sort((one, two) => this.compareCinemas(one, two));
    }

    private filterCinemaList(list: ICinema[]) {
        const compareString = this.searchString.toLowerCase();
        return list.filter(cinema => cinema.name.toLowerCase().indexOf(compareString) >= 0);
    }

    private onGeolocation(position: GeolocationPosition) {
        this.coordinates = position.coords;
        this.clearSortAndFilter();
    }

    private onGeolocationError(positionError: GeolocationPositionError) {
        console.log(`GEO LOCATION ERROR: ${positionError.message}`);

        this._errorMessage = `Could not get location: ${positionError.message}`;

        this._alhpabeticalSearch = true;
    }

    private loadCinemaList() {
        this.cineworldService.getCinemaListAsync().subscribe(list => this._cinemaList = list);
    }

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

    private clearSortAndFilter() {
        this._filteredCinemaList = undefined;
        this._sortedCinemaList = undefined;
    }
}

function getCoords(coords: Pick<GeolocationCoordinates, 'longitude' | 'latitude'>) {
    const {longitude, latitude} = coords;

    return {longitude, latitude};
}
