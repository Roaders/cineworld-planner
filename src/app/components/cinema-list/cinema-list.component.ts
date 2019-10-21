import { Component } from '@angular/core';
import { CineworldService } from '../../services/cineworld.service';
import { Router } from '@angular/router';
import { TouchSequence } from 'selenium-webdriver';
import { ICinema } from 'src/contracts/contracts';
import { CinemaHelper } from 'src/app/helper/cinema-helper';

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

    private _searchString = '';

    public get searchString() {
        return this._searchString;
    }

    public set searchString(value: string) {
        this._searchString = value != null ? value : '';

        this._filteredCinemaList = undefined;
    }

    private _cinemaList: ICinema[] | undefined;
    private _sortedCinemaList: ICinema[] | undefined;
    private _filteredCinemaList: ICinema[] | undefined;

    public isFavoriteCinema(cinema?: ICinema): boolean {
        return this.cinemaHelper.isFavoriteCinema(cinema);
    }

    public get cinemaList(): ICinema[] | undefined {
        if (this._cinemaList == null) {
            return undefined;
        }

        if (this._sortedCinemaList == null) {
            this._sortedCinemaList = this._cinemaList.sort((one, two) => this.compareCinemas(one, two));
        }

        if (this._searchString !== '') {
            const compareString = this.searchString.toLowerCase();
            if (this._filteredCinemaList == null) {
                this._filteredCinemaList = this._sortedCinemaList
                    .filter(cinema => cinema.name.toLowerCase().indexOf(compareString) >= 0);
            }

            return this._filteredCinemaList;
        }

        return this._sortedCinemaList;
    }

    public selectCinema(cinema: ICinema) {
        this.router.navigate(['/cinema/', cinema.externalCode]);
    }

    private loadCinemaList() {
        this.cineworldService.getCinemaListAsync().subscribe(list => this._cinemaList = list);
    }

    private compareCinemas(one: ICinema, two: ICinema): number {
        const favoriteCompare = Number(this.isFavoriteCinema(two)) - Number(this.isFavoriteCinema(one));

        if (favoriteCompare !== 0) {
            return favoriteCompare;
        }

        return one.name.localeCompare(two.name);
    }
}
