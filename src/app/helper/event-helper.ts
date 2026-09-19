import { IEvent, IFilm } from 'src/contracts/contracts';
import { IFilter } from '../components/attribute-selector/attribute-selector.component';

const MILLISECONDS_PER_MINUTE = 60 * 1000;

export function formatTime(value: Date): string {
    return `${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

export function getEndDate(event: IEvent, trailerAllowance: number, films: IFilm[]): Date | undefined {
    const eventFilm = films.filter(film => film.id === event.filmId)[0];

    if (eventFilm == null) {
        return undefined;
    }

    return addMinutes(getStartDate(event), trailerAllowance + eventFilm.length);
}

export function getStartDate(event: IEvent): Date {
    return new Date(event.eventDateTime);
}

export function addMinutes(value: Date, minutes: number): Date {
    return new Date(value.getTime() + minutes * MILLISECONDS_PER_MINUTE);
}

export function differenceInMinutes(later: Date, earlier: Date): number {
    return Math.trunc((later.getTime() - earlier.getTime()) / MILLISECONDS_PER_MINUTE);
}

export function getEventFilmName(event: IEvent, films: IFilm[]): string | undefined {
    const eventFilm = films.filter(film => film.id === event.filmId)[0];

    return eventFilm ? eventFilm.name : undefined;
}

export function eventMatchesSelectedAttributes(filters: IFilter[], event: IEvent): boolean {
    const excludeFilters = filters.filter(filter => {
        return filter.mode === 'exclude' &&
            event.attributeIds.some(id => filter.attribute === id);
    });

    if (excludeFilters.length > 0) {
        return false;
    }

    return filters.filter(filter => filter.mode === 'include')
        .every(filter => event.attributeIds.some(id => id === filter.attribute));
}

function pad(value: number): string {
    return value.toString().padStart(2, '0');
}
