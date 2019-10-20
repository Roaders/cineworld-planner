import { Component } from '@angular/core';
import { CineworldService } from 'src/app/services/cineworld.service';
import { ActivatedRoute } from '@angular/router';
import { Observer } from 'rxjs';
import { ICinema, IDay as IDate, IFilm, IListingsResponse } from 'src/contracts/contracts';

@Component({
    selector: 'cinema',
    templateUrl: './cinema.component.html',
})
export class CinemaComponent {

    constructor(
        private cineworldService: CineworldService,
        private activatedRoute: ActivatedRoute
    ) {
        this.loadCinema();
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

    public selectDate(date: IDate) {
        if (this._selectedDate != null && this._selectedDate.date === date.date) {
            return;
        }

        this._selectedDate = date;
        this.loadCinemaTimes(date);
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
