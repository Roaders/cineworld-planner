import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { IEvent, IFilm } from 'src/contracts/contracts';
import { addMinutes, getStartDate, formatTime, getEndDate, getEventFilmName, eventMatchesSelectedAttributes } from 'src/app/helper/event-helper';
import { displayAttribute } from 'src/app/helper/attribute-helper';
import { IFilter } from '../attribute-selector/attribute-selector.component';
import { PreferencesService } from 'src/app/services/preferences.service';

interface ITimespan {
    start: string;
    end: string;
    style: object;
    spanClass: string;
}

@Component({
    selector: 'event-list',
    templateUrl: './event-list.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class EventListComponent {

    /** Restores saved schedule preferences. */
    constructor(preferencesService: PreferencesService) {
        this.trailerAllowance = preferencesService.getTrailerAllowance();
        this.maxBreakLength = preferencesService.getMaxBreakLength();
    }

    /** Provides accumulated schedule errors. */
    public get errors() {
        return this._errors;
    }

    /** Provides the currently selected events. */
    public get selectedEvents(): IEvent[] {
        return this._selectedEvents;
    }

    @Input()
    /** Replaces available events and clears their selection. */
    public set events(value: IEvent[] | undefined) {
        this._events = value || [];

        this._selectedEvents = [];
    }

    /** Provides a copy of the available events. */
    public get events(): IEvent[] | undefined {
        return this._events ? this._events.concat() : undefined;
    }

    /** Provides the currently selected films. */
    public get selectedFilms(): IFilm[] {
        return this._selectedFilms;
    }

    @Input()
    /** Replaces selected films and removes incompatible event selections. */
    public set selectedFilms(value: IFilm[]) {
        this._selectedFilms = value;

        this._selectedEvents = this._selectedEvents
            .filter(event => this._selectedFilms.some(film => film.id === event.filmId));
    }

    /** Lists events eligible for the next selection. */
    public get eventsList(): IEvent[] {
        if (this.events == null) {
            return [];
        }

        const filmsToDisplay = this.selectedFilms
            .filter(film => this._selectedEvents.every(event => event.filmId !== film.id));

        return this.events
            .filter(event => this.filterEvents(event, filmsToDisplay));
    }

    private _errors: string[] = [];

    private _filters: IFilter[] = [];

    private _selectedEvents: IEvent[] = [];

    public trailerAllowance: number;

    public maxBreakLength: number;

    private _events: IEvent[] | undefined;

    private _selectedFilms: IFilm[] = [];

    private _startAfter: Date | undefined;

    private _finishBefore: Date | undefined;

    /** Applies attribute filters and removes incompatible selections. */
    public onAttributeFiltersChanged(filters: IFilter[]) {
        this._filters = filters || [];

        this._selectedEvents = this._selectedEvents.filter(event => eventMatchesSelectedAttributes(this._filters, event));
    }

    /** Resolves the film name for an event. */
    public getEventFilmName(event: IEvent): string | undefined {
        return getEventFilmName(event, this.selectedFilms);
    }

    /** Selects styling based on an event's film. */
    public getEventButtonClass(event: IEvent) {

        const styles = [
            'primary',
            'success',
            'warning',
            'danger',
            'info',
            'secondary',
        ];

        const eventFilm = this.getEventFilm(event);
        const index = this.selectedFilms.indexOf(eventFilm);

        const style = styles[index % styles.length];

        return [`btn-outline-${style}`, `event-button-${style}`];
    }

    /** Builds timeline spans for an event's trailers and film. */
    public getTimeSpans(event: IEvent): ITimespan[] {

        const eventFilm = this.getEventFilm(event);

        const eventStart = getStartDate(event);
        const trailersEnd = addMinutes(eventStart, this.trailerAllowance);
        const earliestFilmEnd = addMinutes(eventStart, eventFilm.length);
        const latestFilmEnd = addMinutes(trailersEnd, eventFilm.length);

        return [
            this.createTimeSpan(eventStart, trailersEnd, 'trailers-timespan'),
            this.createTimeSpan(trailersEnd, earliestFilmEnd, 'film-timespan'),
            this.createTimeSpan(earliestFilmEnd, latestFilmEnd, 'film-end-timespan'),
        ];
    }

    /** Resolves the selected film associated with an event. */
    private getEventFilm(event: IEvent) {
        const eventFilm = this.selectedFilms.filter(film => film.id === event.filmId)[0];

        if (eventFilm == null) {
            const error = `Could not get film for event ${event.id} ${event.eventDateTime}`;
            this.showError(error);
            throw new Error(error);
        }

        return eventFilm;
    }

    /** Positions a time span within the overall schedule. */
    private createTimeSpan(startDate: Date, endDate: Date, spanClass: string): ITimespan {
        const {spanStartTime, spanEndTime, spanElapsed} = this.getOverallTimespan();

        const start = startDate.getTime();
        const end = endDate.getTime();

        const startDuration = start - spanStartTime;
        const endDuration = spanEndTime - end;

        const startPercentage = (startDuration / spanElapsed) * 100;
        const endPercentage = (endDuration / spanElapsed) * 100;

        const left = `${startPercentage}%`;
        const right = `${endPercentage}%`;

        return {
            start: left,
            end: right,
            style: {left, right},
            spanClass
        };
    }

    /** Formats an event's start time. */
    public getStartTime(event: IEvent): string | undefined {
        const startDate = getStartDate(event);

        return startDate != null ? formatTime(startDate) : undefined;
    }

    /** Formats an event's estimated end time. */
    public getEndTime(event: IEvent): string | undefined {
        const endDate = getEndDate(event, this.trailerAllowance, this.selectedFilms);

        return endDate != null ? formatTime(endDate) : undefined;
    }

    /** Resolves display metadata for an event's attributes. */
    public eventAttributes(event: IEvent) {
        return event.attributeIds
            .map(attributeId => displayAttribute(attributeId))
            .filter(display => display != null);
    }

    /** Determines whether an event is currently selected. */
    public isEventSelected(film: IEvent): boolean {
        return this._selectedEvents.some(selectedEvent => selectedEvent.id === film.id);
    }

    /** Toggles an event's selection state. */
    public toggleEvent(event: IEvent) {
        if (this.isEventSelected(event)) {
            this._selectedEvents = this._selectedEvents.filter(selectedEvent => selectedEvent.id !== event.id);
        } else {
            this._selectedEvents = [...this._selectedEvents, event];
        }
    }

    /** Updates the earliest permitted event start. */
    public updateStartAfter(value: Date | undefined) {
        this._startAfter = value;
    }

    /** Updates the latest permitted event finish. */
    public updateFinishBefore(value: Date | undefined) {
        this._finishBefore = value;
    }

    /** Determines whether an event satisfies the active planning constraints. */
    private filterEvents(event: IEvent, filmsToDisplay: IFilm[]): boolean {
        if (!eventMatchesSelectedAttributes(this._filters, event)) {
            return false;
        }

        if (this._selectedEvents.some(selectedEvent => selectedEvent === event)) {
            return true;
        }

        if (!filmsToDisplay.some(selectedFilm => selectedFilm.id === event.filmId)) {
            return false;
        }

        const eventFilm = this.getEventFilm(event);

        const eventStart = getStartDate(event);
        const trailersEnd = addMinutes(eventStart, this.trailerAllowance);
        const earliestFilmEnd = addMinutes(eventStart, eventFilm.length);
        const latestFilmEnd = addMinutes(earliestFilmEnd, this.trailerAllowance);

        if (this._startAfter && eventStart < this._startAfter) {
            return false;
        }

        if (this._finishBefore && latestFilmEnd > this._finishBefore) {
            return false;
        }

        return this._selectedEvents.every(selectedEvent => {
            const selectedEventFilm = this.getEventFilm(selectedEvent);

            const selectedEventStart = getStartDate(selectedEvent);
            const selectedTrailersEnd = addMinutes(selectedEventStart, this.trailerAllowance);
            const selectedEarliestFilmEnd = addMinutes(selectedEventStart, selectedEventFilm.length);

            return selectedTrailersEnd > earliestFilmEnd || selectedEarliestFilmEnd < trailersEnd;
        });
    }



    /** Calculates the overall span of displayed events. */
    private getOverallTimespan() {
        const displayedEvents = this.eventsList;

        const spanStartDate = displayedEvents
            .map(event => getStartDate(event))
            .reduce((earliest, current) => current < earliest ? current : earliest);

        if (spanStartDate == null) {
            let errorMessage = `could not calculate timespan: `;
            errorMessage = errorMessage + `spanStartDate:${spanStartDate ? 'defined' : 'notDefined'} `;
            this.showError(errorMessage);
            throw new Error(errorMessage);
        }

        const spanEndDate = displayedEvents
            .map(event => getEndDate(event, this.trailerAllowance, this.selectedFilms))
            .reduce((latest, current) => {
                if (latest != null && current != null && current > latest) {
                    return current;
                }
                return latest;
            }, spanStartDate);

        if ( spanEndDate == null) {
            let errorMessage = `could not calculate timespan: `;
            errorMessage = errorMessage + `spanEndDate:${spanEndDate ? 'defined' : 'notDefined'}`;
            this.showError(errorMessage);
            throw new Error(errorMessage);
        }

        const spanStartTime = spanStartDate.getTime();
        const spanEndTime = spanEndDate.getTime();

        const spanElapsed = spanEndTime - spanStartTime;

        return {spanStartTime, spanEndTime, spanElapsed};
    }

    /** Records a schedule error once. */
    private showError(error: string) {
        if (this.errors.indexOf(error) < 0) {
            this.errors.push(error);
        }
    }

}
