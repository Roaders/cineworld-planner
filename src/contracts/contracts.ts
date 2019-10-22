
export interface IEnvironment {
    production: boolean;
    baseUrl: keyof IUrlLookup;
}

export interface IDay {
    description: string;
    date: string;
}

export interface ICinemaAddress {
    address1: string;
    address2?: string;
    address3?: string;
    address4?: string;
    city: string;
    postalCode: string;
    state?: string;
}

export interface ICinema {
    address: ICinemaAddress;
    externalCode: string;
    filename: string;
    latitude: number;
    longitude: number;
    name: string;
    uri: string;
}

export interface IFilm {
    id: string;
    length: number;
    link: string;
    name: string;
    posterLink: string;
    releaseYear: string;
    videoLink: string;
    weight: number;
}

export type FilmAttribute =
    '2d' |
    'pg' |
    'screenx' |
    'u' |
    '15' |
    '4dx' |
    '12a' |
    'superscreen' |
    '3d' |
    'alternative-content' |
    'audio-described' |
    'subbed';

const FilmAttributeObject: {[key in FilmAttribute ]: any; } = {
    '2d' : null,
    pg : null,
    screenx : null,
    u : null,
    15 : null,
    '4dx' : null,
    '12a' : null,
    superscreen : null,
    '3d' : null,
    'alternative-content' : null,
    'audio-described' : null,
    subbed: null,
};

export const FilmAttributeValues = Object.keys(FilmAttributeObject) as FilmAttribute[];

export interface IEvent {
    attributeIds: FilmAttribute[];
    bookingLink: string;
    businessDay: string;
    cinemaId: string;
    eventDateTime: string;
    filmId: string;
    id: string;
    soldOut: boolean;
}

export interface IListingsResponse {
    body: {
        events: IEvent[];
        films: IFilm[];
    };
}

export interface IUrlLookup {
    local: string;
    staging: string;
    prod: string;
}
