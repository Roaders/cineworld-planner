import axios from 'axios';
import express from 'express';
import { Request, Response } from 'express';
import { get as httpGet } from 'http';
import { AddressInfo } from 'net';
import {
    CinemaController,
    isValidCinemaCode,
    isValidIsoDate,
} from '../node/server/controllers/cinema-controller';
import { setupRoutes } from '../node/server/routes';

describe('CinemaController', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it.each(['X079Z', 'G01HN', 'X0FR5'])(
        'accepts a current Cineworld cinema code: %s',
        cinema => expect(isValidCinemaCode(cinema)).toBe(true)
    );

    it.each(['x079z', 'X079', 'X079ZZ', 'X07-Z'])(
        'rejects a malformed cinema code: %s',
        cinema => expect(isValidCinemaCode(cinema)).toBe(false)
    );

    it.each(['2024-02-29', '2026-09-19'])(
        'accepts a real ISO date: %s',
        date => expect(isValidIsoDate(date)).toBe(true)
    );

    it.each(['2025-02-29', '2026-02-30', '2026-9-19', '19-09-2026'])(
        'rejects an invalid ISO date: %s',
        date => expect(isValidIsoDate(date)).toBe(false)
    );

    it('returns 400 without calling Cineworld for invalid parameters', () => {
        const get = vi.spyOn(axios, 'get');
        const status = vi.fn();
        const send = vi.fn();
        const response = {
            status: status.mockReturnThis(),
            send,
        } as unknown as Response;
        const request = {
            url: '/cinema/X079Z/listings/2025-02-29',
            params: {cinema: 'X079Z', date: '2025-02-29'},
        } as Request<{cinema: string; date: string}>;

        new CinemaController().getListings(request, response);

        expect(status).toHaveBeenCalledWith(400);
        expect(send).toHaveBeenCalledOnce();
        expect(get).not.toHaveBeenCalled();
    });

    it('limits upstream response size and duration', () => {
        const get = vi.spyOn(axios, 'get').mockReturnValue(
            new Promise(() => undefined) as ReturnType<typeof axios.get>
        );

        requestListings(new CinemaController(), 'X079Z');

        expect(get).toHaveBeenCalledWith(
            expect.stringContaining('theaters='),
            {timeout: 10000, maxContentLength: 2 * 1024 * 1024}
        );
    });

    it('evicts the oldest entry when the cache reaches its limit', () => {
        const get = vi.spyOn(axios, 'get').mockReturnValue(
            new Promise(() => undefined) as ReturnType<typeof axios.get>
        );
        vi.spyOn(console, 'log').mockImplementation(() => undefined);
        const controller = new CinemaController();

        for (let index = 0; index <= 500; index++) {
            requestListings(controller, index.toString(36).padStart(5, '0').toUpperCase());
        }
        requestListings(controller, '00000');

        expect(get).toHaveBeenCalledTimes(502);
    });

    it('rate limits repeated API requests from one client', async () => {
        vi.spyOn(console, 'log').mockImplementation(() => undefined);
        const app = express();
        setupRoutes(app);
        const server = app.listen(0, '127.0.0.1');

        try {
            await new Promise<void>(resolve => server.once('listening', resolve));
            const port = (server.address() as AddressInfo).port;
            const statuses: number[] = [];

            for (let index = 0; index <= 60; index++) {
                statuses.push(await getStatus(`http://127.0.0.1:${port}/cinema/invalid/listings/invalid`));
            }

            expect(statuses.slice(0, 60).every(status => status === 400)).toBe(true);
            expect(statuses[60]).toBe(429);
        } finally {
            await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
        }
    });
});

function requestListings(controller: CinemaController, cinema: string): void {
    const response = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
    } as unknown as Response;
    const request = {
        url: `/cinema/${cinema}/listings/2026-09-19`,
        params: {cinema, date: '2026-09-19'},
    } as Request<{cinema: string; date: string}>;

    controller.getListings(request, response);
}

function getStatus(url: string): Promise<number> {
    return new Promise((resolve, reject) => {
        const request = httpGet(url, response => {
            response.resume();
            resolve(response.statusCode || 0);
        });
        request.on('error', reject);
    });
}
