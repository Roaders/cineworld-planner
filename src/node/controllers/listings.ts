import { Request, Response } from 'express';
import axios, { AxiosError } from 'axios';

export function getListings(request: Request, response: Response ) {
    console.log(`Request: ${request.url}`);

    const cinema: string = request.params.cinema;
    const date: string = request.params.date;

    axios.get(getListingsUrl(cinema, date))
    .then(result => response.json(result.data))
    .catch(error => {

        const message = `ERROR getting listing for cinema ${cinema} on date ${date}`;
        console.log(message);

        if (error.isAxiosError) {
            const axiosError = error as AxiosError;

            if (axiosError.response) {
                response.status(axiosError.response.status);
                response.statusMessage = axiosError.response.statusText;
                response.send();
                return;
            }

        }

        response.status(500);
        response.statusMessage = message;
        response.send();
    });
}

function getListingsUrl(externalCode: string, date: string) {
    // tslint:disable-next-line: max-line-length
    return `https://www.cineworld.co.uk/uk/data-api-service/v1/quickbook/10108/film-events/in-cinema/${externalCode}/at-date/${date}`;
}
