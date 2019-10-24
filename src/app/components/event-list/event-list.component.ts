import { Component, Input } from '@angular/core';
import { IEvent, IFilm } from 'src/contracts/contracts';
import { getStartMoment, formatTime, getEndMoment, getEventFilmName } from 'src/app/helper/event-helper';
import { displayAttribute } from 'src/app/helper/attribute-helper';
import { IFilter } from '../attribute-selector/attribute-selector.component';

@Component({
    selector: 'event-list',
    templateUrl: './event-list.component.html'
})
export class EventListComponent {

    private _filters: IFilter[] = [];

    private _selectedEvents: IEvent[] = [];

    public get selectedEvents(): IEvent[] {
        return this._selectedEvents;
    }

    public trailerAllowance = 30;

    private _events: IEvent[] | undefined;

    @Input()
    public set events(value: IEvent[] | undefined) {
        this._events = value || [];

        this._selectedEvents = [];
    }

    public get events(): IEvent[] | undefined {
        return this._events;
    }

    private _selectedFilms: IFilm[] = [];

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

        const filmEvents = this.events
            .filter(event => this._selectedEvents.some(selectedEvent => selectedEvent === event) ||
                filmsToDisplay.some(selectedFilm => selectedFilm.id === event.filmId));

        return this.filterEvents(filmEvents);
    }

    public onAttributeFiltersChanged(filters: IFilter[]) {
        this._filters = filters || [];

        this._selectedEvents = this.filterEvents(this._selectedEvents);
    }

    public getEventFilmName(event: IEvent): string | undefined {
        return getEventFilmName(event, this.selectedFilms);
    }

    public getEventTimespanStyle(event: IEvent): object | undefined {
        const displayedEvents = this.eventsList;

        const spanStartMoment = getStartMoment(displayedEvents[0]);
        const spanEndMoment = getEndMoment(displayedEvents[displayedEvents.length - 1], this.trailerAllowance, this.selectedFilms);

        if (spanStartMoment == null || spanEndMoment == null) {
            return undefined;
        }

        const spanStartTime = spanStartMoment.toDate().getTime();
        const spanEndTime = spanEndMoment.toDate().getTime();

        const spanElapsed = spanEndTime - spanStartTime;

        const eventStart = getStartMoment(event);
        const eventEnd = getEndMoment(event, this.trailerAllowance, this.selectedFilms);

        if (eventStart == null || eventEnd == null) {
            return undefined;
        }

        const startSpan = eventStart.toDate().getTime() - spanStartTime;
        const endSpan = spanEndTime - eventEnd.toDate().getTime();

        const startFraction = startSpan / spanElapsed;
        const endFraction = endSpan / spanElapsed;

        return {left: `${startFraction * 100}%`, right: `${endFraction * 100}%` };
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

    private filterEvents(events: IEvent[]) {
        return events.filter(event => {
            const excludeFilters = this._filters.filter(filter => {
                return filter.mode === 'exclude' &&
                    event.attributeIds.some(id => filter.attribute === id);
            });

            if (excludeFilters.length > 0) {
                return false;
            }

            return this._filters.filter(filter => filter.mode === 'include')
                .every(filter => event.attributeIds.some(id => id === filter.attribute));
        });
    }

}
