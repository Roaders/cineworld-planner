import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ItineraryListComponent } from './itinerary-list.component';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ItineraryComponent } from '../itinerary/itinerary.component';

describe('ItineraryListComponent', () => {
    let component: ItineraryListComponent;
    let fixture: ComponentFixture<ItineraryListComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [PreferencesService],
            declarations: [
                ItineraryListComponent,
                ItineraryComponent
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ItineraryListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
