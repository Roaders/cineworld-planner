
import { Express } from 'express';
import { getListings } from './controllers/listings';

export function setupRoutes(app: Express) {

    app.route('/listings/:cinema/:date')
        .get(getListings);

}
