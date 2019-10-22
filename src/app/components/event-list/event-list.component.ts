import { Component, Input } from '@angular/core';
import { IEvent, IFilm, FilmAttribute } from 'src/contracts/contracts';
import moment from 'moment';

const displayedAttributes: FilmAttribute[] = ['2d', 'screenx', '4dx', 'superscreen', '3d', 'audio-described', 'subbed'];

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

        return this.events.filter(event => this.selectedFilms.some(selectedFilm => selectedFilm.id === event.filmId));
    }

    public getEventFilmName(event: IEvent): string | undefined {
        const eventFilm = this.selectedFilms.filter(film => film.id === event.filmId)[0];

        return eventFilm ? eventFilm.name : undefined;
    }

    public getStartTime(event: IEvent): string | undefined {
        return moment(event.eventDateTime).format('HH:MM');
    }

    public getEndTime(event: IEvent): string | undefined {
        const eventFilm = this.selectedFilms.filter(film => film.id === event.filmId)[0];

        if (eventFilm == null) {
            return undefined;
        }

        const time = moment(event.eventDateTime);

        time.add(this.trailerTime, 'minutes');
        time.add(eventFilm.length, 'minutes');

        return time.format('HH:MM');
    }

    public eventAttributes(event: IEvent) {
        return event.attributeIds
            .filter(id => displayedAttributes.some(displayed => displayed === id))
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

            case '12a':
            case '15':
            case 'u':
            case 'pg':
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
}

function handleUnknownAttribute(attribute: never) {
    console.warn(`Unknown Attribute: ${attribute}`);
}

function sortEvents(one: IEvent, two: IEvent): number {
    const oneTime = moment(one.eventDateTime).toDate().getTime();
    const twoTime = moment(two.eventDateTime).toDate().getTime();

    return oneTime - twoTime;
}
