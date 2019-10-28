import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CinemaHeaderComponent } from './cinema-header.component';
import { CinemaComponent } from '../cinema/cinema.component';
import { DateSelectorComponent } from '../date-selector/date-selector.component';
import { CinemaListComponent } from '../cinema-list/cinema-list.component';
import { EventListComponent } from '../event-list/event-list.component';
import { CineworldService } from 'src/app/services/cineworld.service';
import { CinemaHelper } from 'src/app/helper/cinema-helper';
import { PreferencesService } from 'src/app/services/preferences.service';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { FormsModule } from '@angular/forms';
import { ItineraryComponent } from '../itinerary-list/itinerary-list.component';
import { AttributeSelectorComponent } from '../attribute-selector/attribute-selector.component';

describe('CinemaHeaderComponent', () => {
    let component: CinemaHeaderComponent;
    let fixture: ComponentFixture<CinemaHeaderComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                CinemaComponent,
                DateSelectorComponent,
                CinemaListComponent,
                ItineraryComponent,
                CinemaHeaderComponent,
                EventListComponent,
                AttributeSelectorComponent,
            ],
            providers: [CineworldService, CinemaHelper, PreferencesService],
            imports: [HttpClientModule, AppRoutingModule, FormsModule]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CinemaHeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
