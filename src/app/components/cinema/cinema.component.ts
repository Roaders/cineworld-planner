import { Component } from '@angular/core';
import { CineworldService } from 'src/app/services/cineworld.service';
import { ActivatedRoute } from '@angular/router';
import { Observer } from 'rxjs';
import { ICinema, IDay as IDate, IFilm, IListingsResponse, IEvent, FilmAttribute, FilmAttributeValues } from 'src/contracts/contracts';
import { IFilter } from '../attribute-selector/attribute-selector.component';
import { eventMatchesSelectedAttributes } from '../../helper/event-helper';

@Component({
    selector: 'cinema',
    templateUrl: './cinema.component.html',
})
export class CinemaComponent {

    private _filters: IFilter[] = [];

    constructor(
        private cineworldService: CineworldService,
        private activatedRoute: ActivatedRoute
    ) {
        this.loadCinema();
    }

    private _events: IEvent[] | undefined;

    public get events() {
        return this._events;
    }

    public get selectedFilms(): IFilm[] {
        return this._selectedFilms.concat();
    }

    public get filmList() {
        return this._filmList;
    }

    public get errorMessage() {
        return this._errorMessage;
    }

    public get cinema(): ICinema | undefined {
        return this._cinema;
    }

    private _selectedFilms: IFilm[] = [];

    private _filmList: IFilm[] | undefined;

    private _selectedDate: undefined | IDate;

    private _errorMessage: undefined | string;

    private _cinema: ICinema | undefined;

    private _filteredFilmList: IFilm[] | undefined

    public get filteredFilmList(): IFilm[] | undefined {
        return this._filteredFilmList;
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

    public onAttributeFiltersChanged(filters: IFilter[]) {
        this._filters = filters;
        
        this._filteredFilmList = this.filterFilms();
    }

    private loadCinemaTimes(date: IDate) {
        this._filmList = undefined;
        this._selectedFilms = [];
        const externalCode = this.activatedRoute.snapshot.params.externalCode;

        const observer: Observer<IListingsResponse> = {
            error: error => this._errorMessage = error.message ?? error,
            next: response => this.onListingLoaded(response),
            complete: () => null,
        };

        this.cineworldService.getCinemaListings(externalCode, date.date).subscribe(observer);
    }

    private filterFilms(): IFilm[]{
        const filteredEvents = this.events?.filter(event => eventMatchesSelectedAttributes(this._filters, event)) ?? [];

        return this._filmList?.filter(film => filteredEvents.some(event => event.filmId === film.id)) ?? [];
    }

    private onListingLoaded(response: IListingsResponse) {
        this._filmList = response.body.films;
        this._events = response.body.events;

        this._filteredFilmList = this.filterFilms();

        const allAttributes = new Array<FilmAttribute>();

        this._events
            .reduce((attributes, event) => [...attributes, ...event.attributeIds], allAttributes)
            .forEach(attribute => {
                if (FilmAttributeValues.indexOf(attribute) < 0) {
                    console.warn(`WARNING: unknown attribute: ${attribute}`);
                }
            });
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
