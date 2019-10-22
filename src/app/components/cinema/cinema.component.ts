import { Component } from '@angular/core';
import { CineworldService } from 'src/app/services/cineworld.service';
import { ActivatedRoute } from '@angular/router';
import { Observer } from 'rxjs';
import { ICinema, IDay as IDate, IFilm, IListingsResponse, ICinemaAddress } from 'src/contracts/contracts';
import { PreferencesService } from 'src/app/services/preferences.service';
import { CinemaHelper } from 'src/app/helper/cinema-helper';

@Component({
    selector: 'cinema',
    templateUrl: './cinema.component.html',
})
export class CinemaComponent {

    constructor(
        private cineworldService: CineworldService,
        private cinemaHelper: CinemaHelper,
        private activatedRoute: ActivatedRoute
    ) {
        this.loadCinema();
    }

    private _selectedFilms: IFilm[] = [];

    public get selectedFilms(): IFilm[] {
        return this._selectedFilms;
    }

    private _filmList: IFilm[] | undefined;

    public get filmList() {
        return this._filmList;
    }

    private _selectedDate: undefined | IDate;

    public get selectedDate() {
        return this._selectedDate;
    }

    private _errorMessage: undefined | string;

    public get errorMessage() {
        return this._errorMessage;
    }

    private _cinema: ICinema | undefined;

    public get cinema(): ICinema | undefined {
        return this._cinema;
    }

    public get cinemaUrl(): string | undefined {
        if (this.cinema == null) {
            return;
        }

        return `https://www.google.com/maps/search/?api=1&query=${this.cinema.latitude},${this.cinema.longitude}`;
    }

    public isFavoriteCinema(cinema?: ICinema): boolean {
        return this.cinemaHelper.isFavoriteCinema(cinema);
    }

    public toggleFavorite(cinema?: ICinema) {
        this.cinemaHelper.toggleFavorite(cinema);
    }

    public selectDate(date: IDate) {
        if (this._selectedDate != null && this._selectedDate.date === date.date) {
            return;
        }

        this._selectedDate = date;
        this.loadCinemaTimes(date);
    }

    public isFilmSelected(film: IFilm): boolean {
        return this._selectedFilms.some(selectedFilm => selectedFilm.id === film.id);
    }

    public toggleFilm(film: IFilm) {
        if (this.isFilmSelected(film)) {
            this._selectedFilms = this._selectedFilms.filter(selectedFilm => selectedFilm.id !== film.id);
        } else {
            this._selectedFilms.push(film);
        }
    }

    private loadCinemaTimes(date: IDate) {
        this._filmList = undefined;
        const externalCode = this.activatedRoute.snapshot.params.externalCode;

        const observer: Observer<IListingsResponse> = {
            error: error => this._errorMessage = error,
            next: response => this.onListingLoaded(response),
            complete: () => null,
        };

        this.cineworldService.getCinemaListings(externalCode, date.date).subscribe(observer);
    }

    private onListingLoaded(response: IListingsResponse) {
        this._filmList = response.body.films;
    }

    private loadCinema() {
        const externalCode = this.activatedRoute.snapshot.params.externalCode;

        const observer: Observer<ICinema> = {
            error: error => this._errorMessage = error,
            next: cinema => this._cinema = cinema,
            complete: () => null,
        };

        this.cineworldService.getCinemaAsync(externalCode).subscribe(observer);
    }
}
