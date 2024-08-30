
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

export const FilmAttributeValues = [    
    '2d',
    'pg',
    'screenx',
    'u',
    '15',
    '4dx',
    '12a',
    'superscreen',
    '3d',
    'alternative-content',
    'audio-described',
    'subbed',
    'qa', // Q&A
    'ch', // charity
    'tbc',
    'movies-for-juniors', 
    '18', 
    'action', 
    'suspense', 
    'animation', 
    'adventure', 
    'comedy', 
    'drama', 
    'classicfilm', 
    'reserved-selected', 
    'horror'
] as const;

export type FilmAttribute = typeof FilmAttributeValues[number];

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
    prod: string;
    ring: string;
}
