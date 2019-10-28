import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItineraryComponent } from './itinerary.component';
import { PreferencesService } from 'src/app/services/preferences.service';

describe('ItineraryComponent', () => {
    let component: ItineraryComponent;
    let fixture: ComponentFixture<ItineraryComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [PreferencesService],
            declarations: [ItineraryComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ItineraryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
