import {
    ICineworldMovie,
    ICineworldSchedule,
    ICineworldTheaterResponse,
    mapListings,
    mapTheaters,
} from '../node/server/controllers/cineworld-mapper';

describe('Cineworld response mapper', () => {
    it('maps the new theater identifier, address, coordinates and page URL', () => {
        const response: ICineworldTheaterResponse = {
            data: {
                allTheater: {
                    nodes: [{
                        id: 'X06XL',
                        name: 'Solihull',
                        path: '/theaters/x06xl-cineworld-cinema-solihull',
                        practicalInfo: {
                            coordinates: {latitude: 52.4125, longitude: -1.7792},
                            location: {
                                address: '47 Upper Jubilee Walk',
                                city: 'Solihull',
                                state: 'England',
                                zip: 'B91 3QW',
                            },
                        },
                    }],
                },
            },
        };

        expect(mapTheaters(response)).toEqual([{
            address: {
                address1: '47 Upper Jubilee Walk',
                city: 'Solihull',
                postalCode: 'B91 3QW',
                state: 'England',
            },
            externalCode: 'X06XL',
            filename: 'x06xl-cineworld-cinema-solihull',
            latitude: 52.4125,
            longitude: -1.7792,
            name: 'Solihull',
            uri: '/cinemas/x06xl-cineworld-cinema-solihull/',
        }]);
    });

    it('maps movie details and showtimes to the existing planner contract', () => {
        const schedule: ICineworldSchedule = {
            'movie-1': {
                '2026-09-19': [{
                    id: 'showtime-1',
                    startsAt: '2026-09-19T19:30:00',
                    tags: [
                        'Format.Projection.Digital',
                        'Auditorium.Experience.SuperScreen',
                        'Showtime.Accessibility.Subtitled',
                    ],
                    data: {
                        ticketing: [{
                            provider: 'default',
                            type: 'DESKTOP',
                            urls: ['https://web.cineworld.co.uk/order/showtimes/056-123/seats'],
                        }],
                    },
                }],
            },
        };
        const movies: ICineworldMovie[] = [{
            id: 'movie-1',
            title: 'Test Film',
            runtime: 5820,
            poster: 'poster.jpg',
            release: '2026-09-18T00:00:00.000Z',
            certificate: '15',
            genres: 'Horror, Thriller',
            orderIndex: 7,
            trailer: {HD: 'trailer.mov', SD: 'trailer.mp4'},
        }];

        expect(mapListings('X06XL', schedule, movies)).toEqual({
            body: {
                films: [{
                    id: 'movie-1',
                    length: 97,
                    link: 'https://www.cineworld.co.uk/films/movie-1',
                    name: 'Test Film',
                    posterLink: 'poster.jpg',
                    releaseYear: '2026',
                    videoLink: 'trailer.mov',
                    weight: 7,
                }],
                events: [{
                    attributeIds: ['2d', 'superscreen', 'subbed', '15', 'horror'],
                    bookingLink: 'https://web.cineworld.co.uk/order/showtimes/056-123/seats',
                    businessDay: '2026-09-19',
                    cinemaId: 'X06XL',
                    eventDateTime: '2026-09-19T19:30:00',
                    filmId: 'movie-1',
                    id: 'showtime-1',
                    soldOut: false,
                }],
            },
        });
    });
});
