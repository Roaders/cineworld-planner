import { DateSelectorComponent } from './date-selector.component';

import * as momentImport from 'moment';

describe('DateSelectorComponent', () => {

    const originalMoment = {...momentImport};

    function mockedNow() {
        return new Date(2019, 0, 27).getTime();
    }

    beforeAll(() => {
        (momentImport as any).now = mockedNow;
    });

    afterAll(() => {
        (momentImport as any).now = originalMoment.now;
    });

    function getInstance() {
        return new DateSelectorComponent();
    }

    it('should create', () => {
        expect(getInstance()).toBeDefined();
    });

    it('should return correct list of days', () => {
        const instance = getInstance();

        const expectedDays = [
            {description: 'Today', date: '2019-01-27'},
            {description: 'Mon', date: '2019-01-28'},
            {description: 'Tue', date: '2019-01-29'},
            {description: 'Wed', date: '2019-01-30'},
            {description: 'Thu', date: '2019-01-31'},
            {description: 'Fri', date: '2019-02-01'},
            {description: 'Sat', date: '2019-02-02'},
        ];

        expect(instance.days).toEqual(expectedDays);
    });
});
