import { Component, Input, EventEmitter, Output, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FilmAttribute, IEvent, IFilm, FilmAttributeValues } from 'src/contracts/contracts';
import { displayAttribute } from 'src/app/helper/attribute-helper';
import { defaultTrailerAllowance } from 'src/app/constants/constants';
import { PreferencesService } from 'src/app/services/preferences.service';
import { formatTime, getStartDate, getEndDate } from 'src/app/helper/event-helper';

export type FilterMode = 'exclude' | 'include';

export interface IFilter {attribute: FilmAttribute; mode: FilterMode; }

@Component({
    selector: 'attribute-selector',
    templateUrl: './attribute-selector.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AttributeSelectorComponent implements OnInit {

    /** Restores the saved attribute filters. */
    constructor(private preferencesService: PreferencesService) {
        this._filters = preferencesService.getAttributeFilters();
    }

    @Input()
    public showTrailer = true;

    @Input()
    /** Provides the configured trailer allowance. */
    public get trailerAllowance() {
        return this._trailerAllowance;
    }

    /** Updates and persists the trailer allowance. */
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

    /** Indicates whether the full attribute list is expanded. */
    public get expand() {
        return this._expand;
    }

    /** Indicates whether filter controls are visible. */
    public get showFilters() {
        return this._showFilters;
    }

    @Input()
    /** Provides the maximum permitted break length. */
    public get maxBreakLength(): number {
        return this._maxBreakLength;
    }

    /** Updates and persists the maximum break length. */
    public set maxBreakLength(value: number) {
        if (isNaN(value)) {
            value = 0;
        }

        if (value === this._maxBreakLength) {
            return;
        }

        this._maxBreakLength = value;
        this.maxBreakLengthChange.emit(value);
        this.preferencesService.setMaxBreakLength(value);
    }

    @Input()
    /** Provides the events used to derive available hours and attributes. */
    public get events(): IEvent[] {
        return this._events;
    }

    /** Recalculates available hours when events change. */
    public set events(value: IEvent[]) {
        value = value || [];
        if (arraysEqual(value, this._events)) {
            return;
        }

        this._events = value;
        this.resetHours();
    }

    @Input()
    /** Provides the films currently selected for planning. */
    public get selectedFilms(): IFilm[] {
        return this._selectedFilms;
    }

    /** Recalculates available hours when selected films change. */
    public set selectedFilms(value: IFilm[]) {
        value = value || [];
        if (arraysEqual(value, this._selectedFilms)) {
            return;
        }

        this._selectedFilms = value;
        this.resetHours();
    }

    private _hours: (Date | undefined)[] | undefined;

    /** Builds the selectable hourly boundaries for the current schedule. */
    public get hours(): (Date | undefined)[] {
        if (this._hours == null) {

            const { spanStartDate, spanEndDate } = this.getOverallTimespan();

            const startHour = new Date(spanStartDate?.getTime() ?? Date.now());
            startHour.setMinutes(0);
            const endHour = new Date(spanEndDate?.getTime() ?? Date.now());
            endHour.setMinutes(0);
            const hourCount = Math.trunc((endHour.getTime() - startHour.getTime()) / (60 * 60 * 1000));

            const hours = Array.from({length: hourCount + 2})
                .map((_, index) => new Date(startHour.getTime() + index * 60 * 60 * 1000));

            this._hours = [undefined, ...hours];
        }

        return this._hours;
    }

    /** Lists the film attributes available for filtering. */
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
    public startAfter = new EventEmitter<undefined | Date>();

    @Output()
    public finishBefore = new EventEmitter<undefined | Date>();

    private _startAfterDate: Date | undefined;

    /** Provides the selected lower time boundary. */
    public get startAfterDate(): Date | undefined {
        return this._startAfterDate;
    }

    /** Updates and emits the selected lower time boundary. */
    public set startAfterDate(value: Date | undefined) {
        this._startAfterDate = value;

        this.startAfter.emit(value);
    }

    private _finishBeforeDate: Date | undefined;

    /** Provides the selected upper time boundary. */
    public get finishBeforeDate(): Date | undefined {
        return this._finishBeforeDate;
    }

    /** Updates and emits the selected upper time boundary. */
    public set finishBeforeDate(value: Date | undefined) {
        this._finishBeforeDate = value;

        this.finishBefore.emit(value);
    }

    private _trailerAllowance: number = defaultTrailerAllowance;

    @Output()
    public readonly trailerAllowanceChange = new EventEmitter<number>();

    private _maxBreakLength = 0;

    @Output()
    public readonly maxBreakLengthChange = new EventEmitter<number>();

    private _expand = false;

    private _showFilters = false;

    private _filters: IFilter[];

    @Output()
    public filters: EventEmitter<IFilter[]> = new EventEmitter<IFilter[]>();

    private _events: IEvent[] = [];

    private _selectedFilms: IFilm[] = [];

    /** Formats a time boundary for display. */
    public formatDate(value?: Date): string {
        return value ? formatTime(value) : 'Select...';
    }

    /** Emits the restored filters after initialization. */
    public ngOnInit(): void {
        this.filters.emit(this._filters);
    }

    /** Toggles whether all known attributes are displayed. */
    public toggleExpand() {
        this._expand = !this._expand;
    }

    /** Toggles visibility of the filter controls. */
    public toggleFilters() {
        this._showFilters = !this._showFilters;
    }

    /** Gets the icon associated with an attribute. */
    public getIcon(attribute: FilmAttribute): string | undefined {
        const attributeInfo = displayAttribute(attribute);
        return attributeInfo != null ? attributeInfo.icon : undefined;
    }

    /** Gets the description associated with an attribute. */
    public getDescription(attribute: FilmAttribute): string | undefined {
        const attributeInfo = displayAttribute(attribute);
        return attributeInfo != null ? attributeInfo.description : undefined;
    }

    /** Persists the current attribute filters. */
    public saveFilters() {
        this.preferencesService.setAttributeFilters(this._filters);
    }

    /** Selects the icon class representing an attribute's filter mode. */
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

    /** Advances an attribute through its available filter modes. */
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

    /** Calculates the earliest start and latest finish in the schedule. */
    private getOverallTimespan() {

        const startEvent: IEvent | undefined = this.events.length > 0 ? this.events[0] : undefined;

        const spanStartDate = startEvent != null ? getStartDate(startEvent) : undefined;

        if(spanStartDate == null){
            return {spanStartDate: undefined, spanEndDate: undefined};
        }

        const spanEndDate = this.events
            .map(event => getEndDate(event, this.trailerAllowance, this.selectedFilms))
            .reduce((latest, current) => {
                if (latest != null && current != null && current > latest) {
                    return current;
                }
                return latest;
            }, spanStartDate);

        if ( spanEndDate == null || spanStartDate == null) {
            let errorMessage = `could not calculate timespan: `;
            errorMessage = errorMessage + `spanEndDate:${spanEndDate ? 'defined' : 'notDefined'}`;
            throw new Error(errorMessage);
        }

        return {spanStartDate, spanEndDate};
    }

    /** Invalidates and realigns the selectable hourly boundaries. */
    private resetHours() {
        this._hours = undefined;

        this._startAfterDate = this.hours.find(hour => datesEqual(hour, this._startAfterDate));
        this._finishBeforeDate = this.hours.find(hour => datesEqual(hour, this._finishBeforeDate));

        this.startAfter.emit(this._startAfterDate);
        this.finishBefore.emit(this._finishBeforeDate);
    }
}

/** Tests whether two arrays contain identical references in order. */
function arraysEqual<T>(one: T[], two: T[]): boolean {
    return one.length === two.length && one.every((item, index) => item === two[index]);
}

/** Tests whether two defined dates represent the same instant. */
function datesEqual(one: Date | undefined, two: Date | undefined): boolean {
    return one != null && two != null && one.getTime() === two.getTime();
}
