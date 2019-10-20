
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
