import { IEvent, IFilm } from 'src/contracts/contracts';
import { EventListComponent } from './event-list.component';

describe('EventListComponent', () => {
    it('orders listings by start time rather than grouping them by film', () => {
        const component = new EventListComponent({
            getTrailerAllowance: () => 30,
            getMaxBreakLength: () => 30,
        } as any);
        component.selectedFilms = [createFilm('film-one'), createFilm('film-two')];
        component.events = [
            createEvent('film-one', '2026-09-20T10:00:00'),
            createEvent('film-one', '2026-09-20T14:00:00'),
            createEvent('film-two', '2026-09-20T12:00:00'),
        ];

        expect(component.eventsList.map(event => event.eventDateTime)).toEqual([
            '2026-09-20T10:00:00',
            '2026-09-20T12:00:00',
            '2026-09-20T14:00:00',
        ]);
    });

    it('positions spans from the earliest event when listings are not chronological', () => {
        const component = new EventListComponent({
            getTrailerAllowance: () => 30,
            getMaxBreakLength: () => 30,
        } as any);
        const films = [createFilm('later-film'), createFilm('earlier-film')];
        const laterEvent = createEvent('later-film', '2026-09-20T12:00:00');
        const earlierEvent = createEvent('earlier-film', '2026-09-20T11:00:00');

        component.selectedFilms = films;
        component.events = [laterEvent, earlierEvent];

        const earlierSpan = component.getTimeSpans(earlierEvent)[0];
        const laterSpan = component.getTimeSpans(laterEvent)[0];

        expect(earlierSpan.start).toBe('0%');
        expect(parseFloat(laterSpan.start)).toBeGreaterThan(0);
    });
});

function createFilm(id: string): IFilm {
    return {
        id,
        length: 90,
        link: '',
        name: id,
        posterLink: '',
        releaseYear: '2026',
        videoLink: '',
        weight: 0,
    };
}

function createEvent(filmId: string, eventDateTime: string): IEvent {
    return {
        attributeIds: [],
        bookingLink: '',
        businessDay: '2026-09-20',
        cinemaId: 'X076W',
        eventDateTime,
        filmId,
        id: `${filmId}-${eventDateTime}`,
        soldOut: false,
    };
}
