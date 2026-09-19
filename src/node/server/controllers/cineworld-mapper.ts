import { FilmAttribute, FilmAttributeValues, ICinema, IEvent, IFilm, IListingsResponse } from '../../../contracts/contracts';

export interface ICineworldTheaterResponse {
    data: {
        allTheater: {
            nodes: ICineworldTheater[];
        };
    };
}

interface ICineworldTheater {
    id: string;
    name: string;
    path: string;
    practicalInfo: {
        coordinates: {
            latitude: number;
            longitude: number;
        };
        location: {
            address: string;
            city: string;
            state?: string;
            zip: string;
        };
    };
}

export interface ICineworldScheduleResponse {
    [cinemaId: string]: {
        schedule: ICineworldSchedule;
    } | undefined;
}

export interface ICineworldSchedule {
    [movieId: string]: {
        [date: string]: ICineworldShowtime[];
    };
}

interface ICineworldShowtime {
    id: string;
    startsAt: string;
    tags: string[];
    data: {
        ticketing: Array<{
            provider: string;
            type: string;
            urls: string[];
        }>;
    };
}

/** Checks whether a value is a valid Cineworld schedule response. */
export function isCineworldScheduleResponse(value: unknown): value is ICineworldScheduleResponse {
    if (!isRecord(value)) {
        return false;
    }

    return Object.values(value).every(cinema =>
        isRecord(cinema) && isCineworldSchedule(cinema.schedule)
    );
}

/** Checks whether a value is a valid Cineworld movie collection. */
export function isCineworldMovieResponse(value: unknown): value is ICineworldMovie[] {
    return Array.isArray(value) && value.every(isCineworldMovie);
}

export interface ICineworldMovie {
    id: string;
    title: string;
    runtime?: number | null;
    poster?: string | null;
    release?: string | null;
    certificate?: string | null;
    genres?: string | null;
    orderIndex?: number | null;
    trailer?: {
        HD?: string | null;
        SD?: string | null;
    } | null;
}

/** Maps Cineworld theaters to the application's cinema model. */
export function mapTheaters(response: ICineworldTheaterResponse): ICinema[] {
    return response.data.allTheater.nodes.map(theater => {
        const location = theater.practicalInfo.location;
        const path = theater.path.replace('/theaters/', '/cinemas/');

        return {
            address: {
                address1: location.address,
                city: location.city,
                postalCode: location.zip,
                state: location.state,
            },
            externalCode: theater.id,
            filename: path.split('/').pop() || '',
            latitude: theater.practicalInfo.coordinates.latitude,
            longitude: theater.practicalInfo.coordinates.longitude,
            name: theater.name,
            uri: `${path}/`,
        };
    });
}

/** Maps a Cineworld schedule and its movies to a listings response. */
export function mapListings(
    cinemaId: string,
    schedule: ICineworldSchedule,
    movies: ICineworldMovie[],
): IListingsResponse {
    const moviesById = new Map(movies.map(movie => [movie.id, movie]));
    const films = movies.map(mapMovie);
    const events = Object.keys(schedule).reduce((allEvents, movieId) => {
        const movie = moviesById.get(movieId);
        const movieAttributes = movie == null ? [] : getMovieAttributes(movie);
        const showtimes = Object.keys(schedule[movieId]).reduce(
            (allShowtimes, date) => allShowtimes.concat(schedule[movieId][date].map(showtime =>
                mapShowtime(showtime, cinemaId, movieId, date, movieAttributes)
            )),
            new Array<IEvent>(),
        );

        return allEvents.concat(showtimes);
    }, new Array<IEvent>());

    return {body: {events, films}};
}

/** Maps a Cineworld movie to the application's film model. */
function mapMovie(movie: ICineworldMovie): IFilm {
    return {
        id: movie.id,
        length: movie.runtime == null ? 0 : movie.runtime / 60,
        link: `https://www.cineworld.co.uk/films/${movie.id}`,
        name: movie.title,
        posterLink: movie.poster || '',
        releaseYear: movie.release == null ? '' : movie.release.substring(0, 4),
        videoLink: movie.trailer == null ? '' : movie.trailer.HD || movie.trailer.SD || '',
        weight: movie.orderIndex == null ? 0 : movie.orderIndex,
    };
}

/** Maps a Cineworld showtime to the application's event model. */
function mapShowtime(
    showtime: ICineworldShowtime,
    cinemaId: string,
    movieId: string,
    date: string,
    movieAttributes: FilmAttribute[],
): IEvent {
    const defaultTicketing = showtime.data.ticketing.find(ticketing => ticketing.provider === 'default');
    const ticketing = defaultTicketing || showtime.data.ticketing[0];

    return {
        attributeIds: uniqueAttributes([...mapTags(showtime.tags), ...movieAttributes]),
        bookingLink: ticketing == null ? '' : ticketing.urls[0] || '',
        businessDay: date,
        cinemaId,
        eventDateTime: showtime.startsAt,
        filmId: movieId,
        id: showtime.id,
        soldOut: false,
    };
}

/** Maps Cineworld showtime tags to recognized film attributes. */
function mapTags(tags: string[]): FilmAttribute[] {
    return tags.map((tag): FilmAttribute | undefined => {
        const normalized = tag.toLowerCase();

        if (normalized.includes('4dx')) { return '4dx'; }
        if (normalized.includes('screenx')) { return 'screenx'; }
        if (normalized.includes('superscreen')) { return 'superscreen'; }
        if (normalized.includes('audiodescription')) { return 'audio-described'; }
        if (normalized.includes('subtitled')) { return 'subbed'; }
        if (normalized.includes('bigscreenclassics')) { return 'classicfilm'; }
        if (normalized.includes('moviesforjuniors')) { return 'movies-for-juniors'; }
        if (normalized.includes('3d') || normalized.includes('threed')) { return '3d'; }
        if (normalized.includes('digital')) { return '2d'; }

        return undefined;
    }).filter((attribute): attribute is FilmAttribute => attribute != null);
}

/** Extracts recognized certificate and genre attributes from a movie. */
function getMovieAttributes(movie: ICineworldMovie): FilmAttribute[] {
    const values = [movie.certificate, ...(movie.genres || '').split(',')]
        .map(value => (value || '').trim().toLowerCase())
        .filter(value => FilmAttributeValues.indexOf(value as FilmAttribute) >= 0) as FilmAttribute[];

    return uniqueAttributes(values);
}

/** Removes duplicate film attributes while preserving their order. */
function uniqueAttributes(attributes: FilmAttribute[]): FilmAttribute[] {
    return attributes.filter((attribute, index) => attributes.indexOf(attribute) === index);
}

/** Checks whether a value is a valid Cineworld schedule. */
function isCineworldSchedule(value: unknown): value is ICineworldSchedule {
    return isRecord(value) && Object.values(value).every(dateSchedule =>
        isRecord(dateSchedule)
        && Object.values(dateSchedule).every(showtimes =>
            Array.isArray(showtimes) && showtimes.every(isCineworldShowtime)
        )
    );
}

/** Checks whether a value is a valid Cineworld showtime. */
function isCineworldShowtime(value: unknown): value is ICineworldShowtime {
    if (!isRecord(value) || !isRecord(value.data) || !Array.isArray(value.data.ticketing)) {
        return false;
    }

    return isNonEmptyString(value.id)
        && isNonEmptyString(value.startsAt)
        && !Number.isNaN(Date.parse(value.startsAt))
        && Array.isArray(value.tags)
        && value.tags.every(tag => typeof tag === 'string')
        && value.data.ticketing.every(ticketing =>
            isRecord(ticketing)
            && typeof ticketing.provider === 'string'
            && typeof ticketing.type === 'string'
            && Array.isArray(ticketing.urls)
            && ticketing.urls.every(url => typeof url === 'string')
        );
}

/** Checks whether a value is a valid Cineworld movie. */
function isCineworldMovie(value: unknown): value is ICineworldMovie {
    if (!isRecord(value)) {
        return false;
    }

    const trailerIsValid = value.trailer == null || (
        isRecord(value.trailer)
        && isNullableString(value.trailer.HD)
        && isNullableString(value.trailer.SD)
    );

    return isNonEmptyString(value.id)
        && isNonEmptyString(value.title)
        && isNullableFiniteNumber(value.runtime)
        && isNullableString(value.poster)
        && isNullableString(value.release)
        && isNullableString(value.certificate)
        && isNullableString(value.genres)
        && isNullableFiniteNumber(value.orderIndex)
        && trailerIsValid;
}

/** Checks whether a value is a non-array object. */
function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value != null && !Array.isArray(value);
}

/** Checks whether a value is a non-empty string. */
function isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.length > 0;
}

/** Checks whether a value is nullish or a string. */
function isNullableString(value: unknown): value is string | null | undefined {
    return value == null || typeof value === 'string';
}

/** Checks whether a value is nullish or a finite number. */
function isNullableFiniteNumber(value: unknown): value is number | null | undefined {
    return value == null || (typeof value === 'number' && Number.isFinite(value));
}
