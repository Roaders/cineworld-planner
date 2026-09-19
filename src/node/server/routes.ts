
import { Express } from 'express';
import { rateLimit } from 'express-rate-limit';
import { CinemaController } from './controllers/cinema-controller';

export function setupRoutes(app: Express) {

    const cinemaController = new CinemaController();
    const apiRateLimit = rateLimit({
        windowMs: 60 * 1000,
        limit: 60,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
    });

    app.use('/cinema', apiRateLimit);
    app.route('/cinema').get((request, response) => cinemaController.getCinemas(request, response));
    app.route('/cinema/:cinema/listings/:date').get((request, response) => cinemaController.getListings(request, response));

}
