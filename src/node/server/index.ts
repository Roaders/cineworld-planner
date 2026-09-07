import express from 'express';
import { Express } from 'express';
import { setupRoutes } from './routes';
import cors from 'cors';
import {join} from "path"
import {readFileSync} from "fs"
import http from "http"
import https from "https"

const app: Express = express();

const allowedOrigins = [
    'https://www.cineworld-planner.co.uk',
    'http://www.cineworld-planner.co.uk',
    'https://cineworld-planner.co.uk',
    'http://cineworld-planner.co.uk',
    'http://localhost:4200',
];

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
const certificatesPath = process.env.HTTPS_CERTIFICATES_PATH;

if (certificatesPath) {
    const certificatePath = join(certificatesPath, "cert.pem");
    const keyPath = join(certificatesPath, "privkey.pem");

    console.log(`Loading certificate from '${certificatePath}'`);
    const cert = readFileSync(certificatePath);
    console.log(`Loading private key from '${keyPath}'`);
    const key = readFileSync(keyPath);

    https.createServer({key, cert}, app).listen(port);

    console.log('cineworld-planner https api server started on: ' + port);
} else {
    http.createServer(app).listen(port);

    console.log('cineworld-planner http api server started on: ' + port);
}
