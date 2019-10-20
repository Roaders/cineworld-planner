import express from 'express';
import { Express } from 'express';
import { setupRoutes } from './routes';
import cors from 'cors';


const app: Express = express();

const allowedOrigins = [
    'https://www.cineworld-planner.co.uk',
    'http://www.cineworld-planner.co.uk'
];

if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push('http://localhost:4200');
}

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
