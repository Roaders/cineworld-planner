import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CineworldService } from 'src/app/services/cineworld.service';
import { ActivatedRoute } from '@angular/router';
import { Observer } from 'rxjs';
import { ICinema, IDay as IDate, IFilm, IListingsResponse, IEvent, FilmAttribute, FilmAttributeValues } from 'src/contracts/contracts';
import { IFilter } from '../attribute-selector/attribute-selector.component';
import { eventMatchesSelectedAttributes } from '../../helper/event-helper';

@Component({
    selector: 'cinema',
    templateUrl: './cinema.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CinemaComponent {

    private _filters: IFilter[] = [];

    /** Starts loading the cinema identified by the current route. */
    constructor(
        private cineworldService: CineworldService,
        private activatedRoute: ActivatedRoute
    ) {
        this.loadCinema();
    }

    private _events: IEvent[] | undefined;

    /** Provides the loaded screening events. */
    public get events() {
        return this._events;
    }

    /** Provides a copy of the currently selected films. */
    public get selectedFilms(): IFilm[] {
        return this._selectedFilms.concat();
    }

    /** Provides the loaded film list. */
    public get filmList() {
        return this._filmList;
    }

    /** Provides any loading error message. */
    public get errorMessage() {
        return this._errorMessage;
    }

    /** Provides the loaded cinema details. */
    public get cinema(): ICinema | undefined {
        return this._cinema;
    }

    private _selectedFilms: IFilm[] = [];

    private _filmList: IFilm[] | undefined;

    private _selectedDate: undefined | IDate;

    private _errorMessage: undefined | string;

    private _cinema: ICinema | undefined;

    private _filteredFilmList: IFilm[] | undefined

    /** Provides films matching the active attribute filters. */
    public get filteredFilmList(): IFilm[] | undefined {
        return this._filteredFilmList;
    }

    /** Selects a date and loads its cinema listings. */
    public selectDate(date: IDate) {
        if (this._selectedDate != null && this._selectedDate.date === date.date) {
            return;
        }

        this._selectedDate = date;
        this.loadCinemaTimes(date);
    }

    /** Determines whether a film is currently selected. */
    public isFilmSelected(film: IFilm): boolean {
        return this._selectedFilms.some(selectedFilm => selectedFilm.id === film.id);
    }

    /** Toggles a film's selection state. */
    public toggleFilm(film: IFilm) {
        if (this.isFilmSelected(film)) {
            this._selectedFilms = this._selectedFilms.filter(selectedFilm => selectedFilm.id !== film.id);
        } else {
            this._selectedFilms.push(film);
        }
    }

    /** Applies changed attribute filters to the film list. */
    public onAttributeFiltersChanged(filters: IFilter[]) {
        this._filters = filters;
        
        this._filteredFilmList = this.filterFilms();
    }

    /** Loads listings for the selected cinema date. */
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

    /** Filters films to those with events matching active attributes. */
    private filterFilms(): IFilm[]{
        const filteredEvents = this.events?.filter(event => eventMatchesSelectedAttributes(this._filters, event)) ?? [];

        return this._filmList?.filter(film => filteredEvents.some(event => event.filmId === film.id)) ?? [];
    }

    /** Stores a listings response and validates its attributes. */
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

    /** Loads cinema details from the current route. */
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
