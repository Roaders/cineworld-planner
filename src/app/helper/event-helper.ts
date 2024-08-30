import moment, { Moment } from 'moment';
import { IEvent, IFilm } from 'src/contracts/contracts';
import { IFilter } from '../components/attribute-selector/attribute-selector.component';

export function formatTime(value: Moment): string {
    return value.format('HH:mm');
}

export function getEndMoment(event: IEvent, trailerAllowance: number, films: IFilm[]): Moment | undefined {
    const eventFilm = films.filter(film => film.id === event.filmId)[0];

    if (eventFilm == null) {
        return undefined;
    }

    const time = moment(event.eventDateTime);

    time.add(trailerAllowance, 'minutes');
    time.add(eventFilm.length, 'minutes');

    return time;
}

export function getStartMoment(event: IEvent): Moment {
    return moment(event.eventDateTime);
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