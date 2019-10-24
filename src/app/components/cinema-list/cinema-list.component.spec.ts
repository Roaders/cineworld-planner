import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CinemaListComponent } from './cinema-list.component';
import { DateSelectorComponent } from '../date-selector/date-selector.component';
import { FormsModule } from '@angular/forms';
import { CineworldService } from 'src/app/services/cineworld.service';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { CinemaComponent } from '../cinema/cinema.component';
import { CinemaHelper } from 'src/app/helper/cinema-helper';
import { PreferencesService } from 'src/app/services/preferences.service';
import { CinemaHeaderComponent } from '../cinema-header/cinema-header.component';
import { EventListComponent } from '../event-list/event-list.component';
import { ItineraryComponent } from '../itinerary/itinerary.component';
import { AttributeSelectorComponent } from '../attribute-selector/attribute-selector.component';

describe('CinemaListComponent', () => {
    let component: CinemaListComponent;
    let fixture: ComponentFixture<CinemaListComponent>;

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
        fixture = TestBed.createComponent(CinemaListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
