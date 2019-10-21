import express from 'express';
import { Express } from 'express';
import { setupRoutes } from './routes';
import cors from 'cors';
import { urlLookup } from '../../constants/constants';
import { IUrlLookup } from '../../contracts/contracts';

const app: Express = express();

const allowedOrigins = Object.keys(urlLookup).map(key => urlLookup[key as keyof IUrlLookup]) as string[];

app.use(cors({
    origin: (origin, callback) => {
        // allow requests with no origin
        // (like mobile apps or curl requests)
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = `The CORS policy for this site does not allow access from ${origin}.`;
            return callback(new Error(msg), false);
        }

        return callback(null, true);
    }
}));

setupRoutes(app);

const port = process.env.PORT || 3000;

app.listen(port);

console.log('cineworld-planner api server started on: ' + port);
