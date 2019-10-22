import { Component, Input } from '@angular/core';
import { IEvent, IFilm, FilmAttribute } from 'src/contracts/contracts';
import moment from 'moment';

const displayedAttributes: FilmAttribute[] = ['2d', 'screenx', '4dx', 'superscreen', '3d', 'audio-described', 'subbed'];

@Component({
    selector: 'event-list',
    templateUrl: './event-list.component.html'
})
export class EventListComponent {

    constructor() { }

    public trailerTime = 30;

    @Input()
    public events: IEvent[] | undefined;

    @Input()
    public selectedFilms: IFilm[] = [];

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
}

function handleUnknownAttribute(attribute: never) {
    console.warn(`Unknown Attribute: ${attribute}`);
}
