import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CinemaComponent } from './cinema.component';
import { DateSelectorComponent } from '../date-selector/date-selector.component';
import { CineworldService } from 'src/app/services/cineworld.service';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { CinemaListComponent } from '../cinema-list/cinema-list.component';
import { FormsModule } from '@angular/forms';
import { CinemaHelper } from 'src/app/helper/cinema-helper';
import { PreferencesService } from 'src/app/services/preferences.service';
import { CinemaHeaderComponent } from '../cinema-header/cinema-header.component';
import { EventListComponent } from '../event-list/event-list.component';
import { ItineraryComponent } from '../itinerary/itinerary.component';
import { AttributeSelectorComponent } from '../attribute-selector/attribute-selector.component';

describe('CinemaComponent', () => {
    let component: CinemaComponent;
    let fixture: ComponentFixture<CinemaComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                CinemaComponent,
                DateSelectorComponent,
                ItineraryComponent,
                CinemaListComponent,
                CinemaHeaderComponent,
                EventListComponent,
                AttributeSelectorComponent,
            ],
            providers: [ CineworldService, CinemaHelper, PreferencesService ],
            imports: [ HttpClientModule, AppRoutingModule, FormsModule ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CinemaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
