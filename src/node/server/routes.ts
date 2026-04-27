
import { Express } from 'express';
import { CinemaController } from './controllers/cinema-controller';
import { CineworldProvider } from './providers/cineworld-provider';

export function setupRoutes(app: Express) {

    const cinemaController = new CinemaController(new CineworldProvider());

    app.route('/cinema').get((request, response) => cinemaController.getCinemas(request, response));
    app.route('/cinema/:cinema/listings/:date').get((request, response) => cinemaController.getListings(request, response));

}
