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
            {description: 'Today', date: '27-01-2019'},
            {description: 'Tomorrow', date: '28-01-2019'},
            {description: 'Tue', date: '29-01-2019'},
            {description: 'Wed', date: '30-01-2019'},
            {description: 'Thu', date: '31-01-2019'},
            {description: 'Fri', date: '01-02-2019'},
            {description: 'Sat', date: '02-02-2019'},
        ];

        expect(instance.days).toEqual(expectedDays);
    });
});
