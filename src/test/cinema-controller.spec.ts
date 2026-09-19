import axios from 'axios';
import { Request, Response } from 'express';
import {
    CinemaController,
    isValidCinemaCode,
    isValidIsoDate,
} from '../node/server/controllers/cinema-controller';

describe('CinemaController request validation', () => {
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
});
