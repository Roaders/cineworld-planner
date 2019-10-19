import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CinemaListComponent } from './cinema-list.component';

describe('CinemaListComponent', () => {
  let component: CinemaListComponent;
  let fixture: ComponentFixture<CinemaListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CinemaListComponent ]
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
