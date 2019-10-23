import { Component, Input } from '@angular/core';
import { IEvent, IFilm, FilmAttribute } from 'src/contracts/contracts';
import moment, { Moment } from 'moment';

type FilterMode = 'exclude' | 'include';

interface ITineraryItem {
    startEstimated?: boolean;
    endEstimated?: boolean;
    start: string;
    message: string;
    end: string;
}

@Component({
    selector: 'event-list',
    templateUrl: './event-list.component.html'
})
export class EventListComponent {

    constructor() { }

    private _selectedEvents: IEvent[] = [];

    public trailerTime = 30;

    private _events: IEvent[] | undefined;

    @Input()
    public set events(value: IEvent[] | undefined) {
        this._events = value || [];

        this._selectedEvents = [];
    }

    public get events(): IEvent[] | undefined {
        return this._events;
    }

    private _filters: {attribute: FilmAttribute, mode: FilterMode}[] = [];

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

    public get allAttributes(): FilmAttribute[] {
        if (this._events == null) {
            return [];
        }

        return this._events
            .filter(event => this.selectedFilms.some(film => film.id === event.filmId))
            .map(event => event.attributeIds)
            .reduce((all, ids) => [...all, ...ids.filter(id => all.indexOf(id) < 0)], new Array<FilmAttribute>())
            .filter(attribute => this.displayAttribute(attribute) != null)
            .sort();
    }

    public get itinerary(): ITineraryItem[] {
        return this._selectedEvents
            .sort(sortEvents)
            .map(event => {
                const start = this.getStartTime(event);
                const message = this.getEventFilmName(event);
                const end = this.getEndTime(event);

                if (start == null || end == null || message == null) {
                    throw Error(`Could not generate itinerary. start: ${start}, end: ${end} message: ${message}`);
                }

                return {
                    start,
                    message,
                    end,
                    endEstimated: true
                };
            });
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

    public getEventFilmName(event: IEvent): string | undefined {
        const eventFilm = this.selectedFilms.filter(film => film.id === event.filmId)[0];

        return eventFilm ? eventFilm.name : undefined;
    }

    public getEventTimespanStyle(event: IEvent): object | undefined {
        const displayedEvents = this.eventsList;

        const spanStartMoment = this.getStartMoment(displayedEvents[0]);
        const spanEndMoment = this.getEndMoment(displayedEvents[displayedEvents.length - 1]);

        if (spanStartMoment == null || spanEndMoment == null) {
            return undefined;
        }

        const spanStartTime = spanStartMoment.toDate().getTime();
        const spanEndTime = spanEndMoment.toDate().getTime();

        const spanElapsed = spanEndTime - spanStartTime;

        const eventStart = this.getStartMoment(event);
        const eventEnd = this.getEndMoment(event);

        if (eventStart == null || eventEnd == null) {
            return undefined;
        }

        const startSpan = eventStart.toDate().getTime() - spanStartTime;
        const endSpan = spanEndTime - eventEnd.toDate().getTime();

        const startFraction = startSpan / spanElapsed;
        const endFraction = endSpan / spanElapsed;

        return {left: `${startFraction * 100}%`, right: `${endFraction * 100}%` };
    }

    private getStartMoment(event: IEvent): Moment | undefined {
        return moment(event.eventDateTime);
    }

    public getEndTime(event: IEvent): string | undefined {
        const endMoment = this.getEndMoment(event);

        return endMoment != null ? endMoment.format('HH:MM') : undefined;
    }

    public eventAttributes(event: IEvent) {
        return event.attributeIds
            .map(attributeId => this.displayAttribute(attributeId))
            .filter(display => display != null);
    }

    public displayAttribute(attribute: FilmAttribute): { icon: string, description: string } | undefined {
        switch (attribute) {
            case '4dx':
            case '2d':
            case '3d':
                return { icon: attribute.toUpperCase(), description: attribute.toUpperCase() };

            case 'screenx':
                return { icon: 'X', description: 'ScreenX' };

            case 'superscreen':
                return { icon: 'S', description: 'SuperScreen' };

            case 'alternative-content':
                return { icon: 'AC', description: attribute };

            case 'audio-described':
                return { icon: 'AD', description: attribute };

            case 'subbed':
                return { icon: 'SU', description: attribute };

            case 'movies-for-juniors':
                return { icon: 'J', description: 'Juniors' };

            case 'qa':
                return { icon: attribute.toUpperCase(), description: attribute.toUpperCase() };

            case '12a':
            case '15':
            case 'u':
            case 'pg':
            case 'tbc':
            case 'ch':
                return undefined;

            default:
                handleUnknownAttribute(attribute);

        }
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

        this._selectedEvents = this.filterEvents(this._selectedEvents);
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

    private getEndMoment(event: IEvent): Moment | undefined {
        const eventFilm = this.selectedFilms.filter(film => film.id === event.filmId)[0];

        if (eventFilm == null) {
            return undefined;
        }

        const time = moment(event.eventDateTime);

        time.add(this.trailerTime, 'minutes');
        time.add(eventFilm.length, 'minutes');

        return time;
    }

    private getStartTime(event: IEvent): string | undefined {
        const startMoment = this.getStartMoment(event);

        return startMoment != null ? startMoment.format('HH:MM') : undefined;
    }
}

function handleUnknownAttribute(attribute: never) {
    console.warn(`Unknown Attribute: ${attribute}`);
}

function sortEvents(one: IEvent, two: IEvent): number {
    const oneTime = moment(one.eventDateTime).toDate().getTime();
    const twoTime = moment(two.eventDateTime).toDate().getTime();

    return oneTime - twoTime;
}
