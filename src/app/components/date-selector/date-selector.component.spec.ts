import { DateSelectorComponent } from './date-selector.component';

import * as momentImport from 'moment';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { CinemaListComponent } from '../cinema-list/cinema-list.component';
import { CinemaComponent } from '../cinema/cinema.component';
import { CinemaHeaderComponent } from '../cinema-header/cinema-header.component';
import { EventListComponent } from '../event-list/event-list.component';
import { ItineraryComponent } from '../itinerary-list/itinerary-list.component';
import { AttributeSelectorComponent } from '../attribute-selector/attribute-selector.component';
import { CineworldService } from 'src/app/services/cineworld.service';
import { CinemaHelper } from 'src/app/helper/cinema-helper';
import { PreferencesService } from 'src/app/services/preferences.service';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { FormsModule } from '@angular/forms';

describe('DateSelectorComponent', () => {
    let component: DateSelectorComponent;
    let fixture: ComponentFixture<DateSelectorComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                CinemaListComponent,
                DateSelectorComponent,
                CinemaComponent,
                CinemaHeaderComponent,
                EventListComponent,
                ItineraryComponent,
                AttributeSelectorComponent,
            ],
            providers: [ CineworldService, CinemaHelper, PreferencesService ],
            imports: [ HttpClientModule, AppRoutingModule, FormsModule ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DateSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });


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

    it('should create', () => {
        expect(component).toBeDefined();
    });

    it('should return correct list of days', () => {

        const expectedDays = [
            {description: 'Today', date: '2019-01-27'},
            {description: 'Mon', date: '2019-01-28'},
            {description: 'Tue', date: '2019-01-29'},
            {description: 'Wed', date: '2019-01-30'},
            {description: 'Thu', date: '2019-01-31'},
            {description: 'Fri', date: '2019-02-01'},
            {description: 'Sat', date: '2019-02-02'},
        ];

        expect(component.days).toEqual(expectedDays);
    });
});
