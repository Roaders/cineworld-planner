import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { FilmAttribute, IEvent, IFilm, FilmAttributeValues } from 'src/contracts/contracts';
import { displayAttribute } from 'src/app/helper/attribute-helper';
import { defaultTrailerAllowance } from 'src/app/constants/constants';
import { PreferencesService } from 'src/app/services/preferences.service';
import moment, { Moment } from 'moment';
import { formatTime, getStartMoment, getEndMoment } from 'src/app/helper/event-helper';
import { isEqual } from 'lodash';

export type FilterMode = 'exclude' | 'include';

export interface IFilter {attribute: FilmAttribute; mode: FilterMode; }

@Component({
    selector: 'attribute-selector',
    templateUrl: './attribute-selector.component.html',
})
export class AttributeSelectorComponent implements OnInit  {

    constructor(private preferencesService: PreferencesService) {
        this._filters = preferencesService.getAttributeFilters();
    }

    @Input()
    public get trailerAllowance() {
        return this._trailerAllowance;
    }

    public set trailerAllowance(value: number) {
        if (value === this._trailerAllowance) {
            return;
        }
        if (isNaN(value)) {
            value = 0;
        }

        this._trailerAllowance = value;

        this.trailerAllowanceChange.emit(value);
        this.preferencesService.setTrailerAllowance(value);

        this.resetHours();
    }

    public get expand() {
        return this._expand;
    }

    public get showFilters() {
        return this._showFilters;
    }

    @Input()
    public get events(): IEvent[] {
        return this._events;
    }

    public set events(value: IEvent[]) {
        if (isEqual(value, this._events)) {
            return;
        }

        this._events = value || [];
        this.resetHours();
    }

    @Input()
    public get selectedFilms(): IFilm[] {
        return this._selectedFilms;
    }

    public set selectedFilms(value: IFilm[]) {
        if (isEqual(value, this._selectedFilms)) {
            return;
        }

        this._selectedFilms = value || [];
        this.resetHours();
    }

    private _hours: (Moment | undefined)[] | undefined;

    public get hours(): (Moment | undefined)[] {
        if (this._hours == null) {

            const { spanStartMoment, spanEndMoment } = this.getOverallTimespan();

            const startHour = moment(spanStartMoment).minute(0);
            const hourCount = moment(spanEndMoment).minute(0).diff(startHour, 'hour');

            const hours = Array.from({length: hourCount + 2})
                .map((_, index) => moment(startHour).add(index, 'hour'));

            this._hours = [undefined, ...hours];
        }

        return this._hours;
    }

    public get allAttributes(): FilmAttribute[] {
        if (this.expand) {

            return FilmAttributeValues
                .filter(attribute => displayAttribute(attribute) != null)
                .sort();
        }

        return this._events
            .filter(event => this.selectedFilms.some(film => film.id === event.filmId))
            .map(event => event.attributeIds)
            .reduce((all, ids) => [...all, ...ids.filter(id => all.indexOf(id) < 0)], new Array<FilmAttribute>())
            .filter(attribute => displayAttribute(attribute) != null)
            .sort();
    }

    @Output()
    public startAfter = new EventEmitter<undefined | Moment>();

    @Output()
    public finishBefore = new EventEmitter<undefined | Moment>();

    private _startAfterMoment: Moment | undefined;

    public get startAfterMoment(): Moment | undefined {
        return this._startAfterMoment;
    }

    public set startAfterMoment(value: Moment | undefined) {
        this._startAfterMoment = value;

        this.startAfter.emit(value);
    }

    private _finishBeforeMoment: Moment | undefined;

    public get finishBeforeMoment(): Moment | undefined {
        return this._finishBeforeMoment;
    }

    public set finishBeforeMoment(value: Moment | undefined) {
        this._finishBeforeMoment = value;

        this.finishBefore.emit(value);
    }

    private _trailerAllowance: number = defaultTrailerAllowance;

    @Output()
    public readonly trailerAllowanceChange = new EventEmitter<number>();

    private _expand = false;

    private _showFilters = false;

    private _filters: IFilter[];

    @Output()
    public filters: EventEmitter<IFilter[]> = new EventEmitter<IFilter[]>();

    private _events: IEvent[] = [];

    private _selectedFilms: IFilm[] = [];

    public formatMoment(value?: Moment): string {
        return value ? formatTime(value) : 'Select...';
    }

    public ngOnInit(): void {
        this.filters.emit(this._filters);
    }

    public toggleExpand() {
        this._expand = !this._expand;
    }

    public toggleFilters() {
        this._showFilters = !this._showFilters;
    }

    public getIcon(attribute: FilmAttribute): string | undefined {
        const attributeInfo = displayAttribute(attribute);
        return attributeInfo != null ? attributeInfo.icon : undefined;
    }

    public getDescription(attribute: FilmAttribute): string | undefined {
        const attributeInfo = displayAttribute(attribute);
        return attributeInfo != null ? attributeInfo.description : undefined;
    }

    public saveFilters() {
        this.preferencesService.setAttributeFilters(this._filters);
    }

    public attributeFilterClass(attribute: FilmAttribute): string {
        const attributeFilter = this._filters.filter(filter => filter.attribute === attribute)[0];
        const existingMode = attributeFilter != null ? attributeFilter.mode : undefined;

        switch (existingMode) {
            case 'include':
                return 'fa-check';

            case 'exclude':
                return 'fa-times';

            default:
                return 'fa-square-o';
        }
    }

    public toggleFilter(attribute: FilmAttribute) {
        const attributeFilter = this._filters.filter(filter => filter.attribute === attribute)[0];
        const existingMode = attributeFilter != null ? attributeFilter.mode : undefined;

        this._filters = this._filters.filter(filter => filter.attribute !== attribute);

        switch (existingMode) {
            case 'include':
                this._filters.push({attribute, mode: 'exclude'});
                break;

            case 'exclude':
                break;

            default:
                this._filters.push({attribute, mode: 'include'});
        }

        this.filters.emit(this._filters);
    }

    private getOverallTimespan() {

        const spanStartMoment = getStartMoment(this.events[0]);

        const spanEndMoment = this.events
            .map(event => getEndMoment(event, this.trailerAllowance, this.selectedFilms))
            .reduce((latest, current) => {
                if (latest != null && current != null && current.isAfter(latest)) {
                    return current;
                }
                return latest;
            }, spanStartMoment);

        if ( spanEndMoment == null) {
            let errorMessage = `could not calculate timespan: `;
            errorMessage = errorMessage + `spanEndMoment:${spanEndMoment ? 'defined' : 'notDefined'}`;
            throw new Error(errorMessage);
        }

        return {spanStartMoment, spanEndMoment};
    }

    private resetHours() {
        this._finishBeforeMoment = undefined;
        this._startAfterMoment = undefined;
        this._hours = undefined;
    }
}
