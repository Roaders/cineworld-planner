import { PreferencesService } from './preferences.service';

describe('PreferencesService', () => {
    const service = new PreferencesService();

    beforeEach(() => localStorage.clear());

    it('converts trailer allowances saved by the former text input to numbers', () => {
        localStorage.setItem('trailerAllowance', JSON.stringify('25'));

        const allowance = service.getTrailerAllowance();

        expect(allowance).toBe(25);
        expect(typeof allowance).toBe('number');
    });

    it('uses the default for an invalid numeric preference', () => {
        localStorage.setItem('trailerAllowance', JSON.stringify('invalid'));

        expect(service.getTrailerAllowance()).toBe(30);
    });
});
