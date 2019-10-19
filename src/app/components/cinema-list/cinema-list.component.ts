import { Component } from '@angular/core';
import { CineworldService, ICinema } from '../../services/cineworld.service';
import { Router } from '@angular/router';
import { TouchSequence } from 'selenium-webdriver';

@Component({
  selector: 'cinema-list',
  templateUrl: './cinema-list.component.html',
  styleUrls: ['./cinema-list.component.scss']
})
export class CinemaListComponent {

    constructor(
        private cineworldService: CineworldService,
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

        if (this._searchString !== '' && this._cinemaList != null) {
            this._filteredCinemaList = this._cinemaList
                .filter(cinema => cinema.name.toLowerCase().indexOf(this.searchString.toLowerCase()) >= 0);
        } else {
            this._filteredCinemaList = undefined;
        }
    }

    private _cinemaList: ICinema[] | undefined;
    private _filteredCinemaList: ICinema[] | undefined;

    public get cinemaList() {
        return this._filteredCinemaList || this._cinemaList;
    }

    public selectCinema(cinema: ICinema) {
        this.router.navigate(['/cinema/', cinema.externalCode]);
    }

    private loadCinemaList() {
        this.cineworldService.getCinemaListAsync().subscribe(list => this._cinemaList = list);
    }

}
