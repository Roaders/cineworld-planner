import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EventListComponent } from './event-list.component';
import { ItineraryListComponent } from '../itinerary-list/itinerary-list.component';
import { AttributeSelectorComponent } from '../attribute-selector/attribute-selector.component';
import { PreferencesService } from 'src/app/services/preferences.service';
import { FormsModule } from '@angular/forms';
import { ItineraryComponent } from '../itinerary/itinerary.component';

describe('EventListComponent', () => {
    let component: EventListComponent;
    let fixture: ComponentFixture<EventListComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [PreferencesService],
            declarations: [
                EventListComponent,
                ItineraryListComponent,
                ItineraryComponent,
                AttributeSelectorComponent
            ],
            imports: [FormsModule]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EventListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
