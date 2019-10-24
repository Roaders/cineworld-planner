import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EventListComponent } from './event-list.component';
import { ItineraryComponent } from '../itinerary/itinerary.component';
import { AttributeSelectorComponent } from '../attribute-selector/attribute-selector.component';

describe('EventListComponent', () => {
  let component: EventListComponent;
  let fixture: ComponentFixture<EventListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventListComponent, ItineraryComponent, AttributeSelectorComponent ]
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
