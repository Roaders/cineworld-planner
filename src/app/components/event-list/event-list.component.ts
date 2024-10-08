import { Component, Input } from '@angular/core';
import { IEvent, IFilm } from 'src/contracts/contracts';
import { getStartMoment, formatTime, getEndMoment, getEventFilmName, eventMatchesSelectedAttributes } from 'src/app/helper/event-helper';
import { displayAttribute } from 'src/app/helper/attribute-helper';
import { IFilter } from '../attribute-selector/attribute-selector.component';
import moment, { Moment } from 'moment';
import { PreferencesService } from 'src/app/services/preferences.service';

interface ITimespan {
    start: string;
    end: string;
    style: object;
    spanClass: string;
}

@Component({
    selector: 'event-list',
    templateUrl: './event-list.component.html'
})
export class EventListComponent {

    constructor(preferencesService: PreferencesService) {
        this.trailerAllowance = preferencesService.getTrailerAllowance();
    }

    public get errors() {
        return this._errors;
    }

    public get selectedEvents(): IEvent[] {
        return this._selectedEvents;
    }

    @Input()
    public set events(value: IEvent[] | undefined) {
        this._events = value || [];

        this._selectedEvents = [];
    }

    public get events(): IEvent[] | undefined {
        return this._events ? this._events.concat() : undefined;
    }

    public get selectedFilms(): IFilm[] {
        return this._selectedFilms;
    }

    @Input()
    public set selectedFilms(value: IFilm[]) {
        this._selectedFilms = value;

        this._selectedEvents = this._selectedEvents
            .filter(event => this._selectedFilms.some(film => film.id === event.filmId));
    }

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

    private _events: IEvent[] | undefined;

    private _selectedFilms: IFilm[] = [];

    private _startAfter: Moment | undefined;

    private _finishBefore: Moment | undefined;

    public onAttributeFiltersChanged(filters: IFilter[]) {
        this._filters = filters || [];

        this._selectedEvents = this._selectedEvents.filter(event => eventMatchesSelectedAttributes(this._filters, event));
    }

    public getEventFilmName(event: IEvent): string | undefined {
        return getEventFilmName(event, this.selectedFilms);
    }

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

    public getTimeSpans(event: IEvent): ITimespan[] {

        const eventFilm = this.getEventFilm(event);

        const eventStart = getStartMoment(event);
        const trailersEnd = moment(eventStart).add(this.trailerAllowance, 'minutes');
        const earliestFilmEnd = moment(eventStart).add(eventFilm.length, 'minutes');
        const latestFilmEnd = moment(trailersEnd).add(eventFilm.length, 'minutes');

        return [
            this.createTimeSpan(eventStart, trailersEnd, 'trailers-timespan'),
            this.createTimeSpan(trailersEnd, earliestFilmEnd, 'film-timespan'),
            this.createTimeSpan(earliestFilmEnd, latestFilmEnd, 'film-end-timespan'),
        ];
    }

    private getEventFilm(event: IEvent) {
        const eventFilm = this.selectedFilms.filter(film => film.id === event.filmId)[0];

        if (eventFilm == null) {
            const error = `Could not get film for event ${event.id} ${event.eventDateTime}`;
            this.showError(error);
            throw new Error(error);
        }

        return eventFilm;
    }

    private createTimeSpan(startMoment: Moment, endMoment: Moment, spanClass: string): ITimespan {
        const {spanStartTime, spanEndTime, spanElapsed} = this.getOverallTimespan();

        const start = startMoment.toDate().getTime();
        const end = endMoment.toDate().getTime();

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

    public getStartTime(event: IEvent): string | undefined {
        const startMoment = getStartMoment(event);

        return startMoment != null ? formatTime(startMoment) : undefined;
    }

    public getEndTime(event: IEvent): string | undefined {
        const endMoment = getEndMoment(event, this.trailerAllowance, this.selectedFilms);

        return endMoment != null ? formatTime(endMoment) : undefined;
    }

    public eventAttributes(event: IEvent) {
        return event.attributeIds
            .map(attributeId => displayAttribute(attributeId))
            .filter(display => display != null);
    }

    public isEventSelected(film: IEvent): boolean {
        return this._selectedEvents.some(selectedEvent => selectedEvent.id === film.id);
    }

    public toggleEvent(event: IEvent) {
        if (this.isEventSelected(event)) {
            this._selectedEvents = this._selectedEvents.filter(selectedEvent => selectedEvent.id !== event.id);
        } else {
            this._selectedEvents.push(event);
        }
    }

    public updateStartAfter(value: Moment | undefined) {
        this._startAfter = value;
    }

    public updateFinishBefore(value: Moment | undefined) {
        this._finishBefore = value;
    }

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

        const eventStart = getStartMoment(event);
        const trailersEnd = moment(eventStart).add(this.trailerAllowance, 'minutes');
        const earliestFilmEnd = moment(eventStart).add(eventFilm.length, 'minutes');
        const latestFilmEnd = moment(earliestFilmEnd).add(this.trailerAllowance, 'minutes');

        if (this._startAfter && eventStart.isBefore(this._startAfter)) {
            return false;
        }

        if (this._finishBefore && latestFilmEnd.isAfter(this._finishBefore)) {
            return false;
        }

        return this._selectedEvents.every(selectedEvent => {
            const selectedEventFilm = this.getEventFilm(selectedEvent);

            const selectedEventStart = getStartMoment(selectedEvent);
            const selectedTrailersEnd = moment(selectedEventStart).add(this.trailerAllowance, 'minutes');
            const selectedEarliestFilmEnd = moment(selectedEventStart).add(selectedEventFilm.length, 'minutes');

            return selectedTrailersEnd.isAfter(earliestFilmEnd) || selectedEarliestFilmEnd.isBefore(trailersEnd);
        });
    }



    private getOverallTimespan() {
        const displayedEvents = this.eventsList;

        const spanStartMoment = getStartMoment(displayedEvents[0]);

        if (spanStartMoment == null) {
            let errorMessage = `could not calculate timespan: `;
            errorMessage = errorMessage + `spanStartMoment:${spanStartMoment ? 'defined' : 'notDefined'} `;
            this.showError(errorMessage);
            throw new Error(errorMessage);
        }

        const spanEndMoment = displayedEvents
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
            this.showError(errorMessage);
            throw new Error(errorMessage);
        }

        const spanStartTime = spanStartMoment.toDate().getTime();
        const spanEndTime = spanEndMoment.toDate().getTime();

        const spanElapsed = spanEndTime - spanStartTime;

        return {spanStartTime, spanEndTime, spanElapsed};
    }

    private showError(error: string) {
        if (this.errors.indexOf(error) < 0) {
            this.errors.push(error);
        }
    }

}
