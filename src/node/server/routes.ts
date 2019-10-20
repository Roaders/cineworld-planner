
import { Express } from 'express';
import { CinemaController } from './controllers/cinema-controller';

export function setupRoutes(app: Express) {

    const cinemaController = new CinemaController();

    app.route('/cinema').get((request, response) => cinemaController.getCinemas(request, response));
    app.route('/cinema/:cinema/listings/:date').get((request, response) => cinemaController.getListings(request, response));

}
