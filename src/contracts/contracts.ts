
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

export enum FilmAttributes {
    '2d' = '2d'
}

export interface IEvent {
    attributeIds: FilmAttributes[];
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

